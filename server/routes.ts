import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import * as schema from "@shared/schema";
import { z } from "zod";
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { createTransport } from 'nodemailer';
import { zodResolver } from '@hookform/resolvers/zod';

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up auth middleware
  await setupAuth(app);
  
  // Configure multer for file uploads
  const uploadDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  
  const storage2 = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  });
  
  const upload = multer({ 
    storage: storage2,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
      const filetypes = /jpeg|jpg|png|gif/;
      const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = filetypes.test(file.mimetype);
      
      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error("Only image files are allowed"));
      }
    }
  });
  
  // Serve uploaded images
  app.use('/uploads', isAuthenticated, (req, res, next) => {
    const filePath = path.join(uploadDir, path.basename(req.path));
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      next();
    }
  });

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User Routes
  app.put('/api/user/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updateSchema = z.object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        bio: z.string().optional(),
        phoneNumber: z.string().optional(),
        address: z.string().optional(),
        birthday: z.string().optional(),
      });
      
      const validatedData = updateSchema.parse(req.body);
      const updatedUser = await storage.updateUser(userId, validatedData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Family Routes
  app.post('/api/families', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = schema.insertFamilySchema.parse(req.body);
      
      const family = await storage.createFamily(validatedData);
      
      // Add the creator as an admin and auto-approve
      await storage.addFamilyMember({
        familyId: family.id,
        userId,
        role: 'admin',
        isApproved: true
      });
      
      res.status(201).json(family);
    } catch (error) {
      console.error("Error creating family:", error);
      res.status(500).json({ message: "Failed to create family" });
    }
  });
  
  app.get('/api/families', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const families = await storage.getFamiliesByUserId(userId);
      res.json(families);
    } catch (error) {
      console.error("Error fetching families:", error);
      res.status(500).json({ message: "Failed to fetch families" });
    }
  });
  
  app.get('/api/families/:id', isAuthenticated, async (req: any, res) => {
    try {
      const familyId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Check if user is a member of this family
      const member = await storage.getFamilyMember(familyId, userId);
      if (!member || !member.isApproved) {
        return res.status(403).json({ message: "Not authorized to view this family" });
      }
      
      const family = await storage.getFamily(familyId);
      if (!family) {
        return res.status(404).json({ message: "Family not found" });
      }
      
      res.json(family);
    } catch (error) {
      console.error("Error fetching family:", error);
      res.status(500).json({ message: "Failed to fetch family details" });
    }
  });
  
  app.put('/api/families/:id', isAuthenticated, async (req: any, res) => {
    try {
      const familyId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Check if user is an admin of this family
      const member = await storage.getFamilyMember(familyId, userId);
      if (!member || member.role !== 'admin') {
        return res.status(403).json({ message: "Not authorized to update this family" });
      }
      
      const updateSchema = schema.insertFamilySchema.partial();
      const validatedData = updateSchema.parse(req.body);
      
      const updatedFamily = await storage.updateFamily(familyId, validatedData);
      if (!updatedFamily) {
        return res.status(404).json({ message: "Family not found" });
      }
      
      res.json(updatedFamily);
    } catch (error) {
      console.error("Error updating family:", error);
      res.status(500).json({ message: "Failed to update family" });
    }
  });

  // Family Member Routes
  app.post('/api/families/:id/members', isAuthenticated, async (req: any, res) => {
    try {
      const familyId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Check if the user is already a member of this family
      const existingMember = await storage.getFamilyMember(familyId, userId);
      if (existingMember) {
        return res.status(400).json({ message: "Already a member of this family" });
      }
      
      // Create a new membership request (not approved by default)
      const newMember = await storage.addFamilyMember({
        familyId,
        userId,
        role: 'member',
        isApproved: false
      });
      
      res.status(201).json(newMember);
    } catch (error) {
      console.error("Error joining family:", error);
      res.status(500).json({ message: "Failed to request family membership" });
    }
  });
  
  app.get('/api/families/:id/members', isAuthenticated, async (req: any, res) => {
    try {
      const familyId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Check if user is a member of this family
      const member = await storage.getFamilyMember(familyId, userId);
      if (!member || !member.isApproved) {
        return res.status(403).json({ message: "Not authorized to view family members" });
      }
      
      const members = await storage.getFamilyMembersWithUserDetails(familyId);
      res.json(members);
    } catch (error) {
      console.error("Error fetching family members:", error);
      res.status(500).json({ message: "Failed to fetch family members" });
    }
  });
  
  app.put('/api/families/:familyId/members/:memberId/approve', isAuthenticated, async (req: any, res) => {
    try {
      const familyId = parseInt(req.params.familyId);
      const memberId = parseInt(req.params.memberId);
      const userId = req.user.claims.sub;
      
      // Check if user is an admin of this family
      const member = await storage.getFamilyMember(familyId, userId);
      if (!member || member.role !== 'admin') {
        return res.status(403).json({ message: "Not authorized to approve members" });
      }
      
      const updatedMember = await storage.approveFamilyMember(memberId);
      if (!updatedMember) {
        return res.status(404).json({ message: "Member not found" });
      }
      
      res.json(updatedMember);
    } catch (error) {
      console.error("Error approving member:", error);
      res.status(500).json({ message: "Failed to approve family member" });
    }
  });
  
  app.put('/api/families/:familyId/members/:memberId/role', isAuthenticated, async (req: any, res) => {
    try {
      const familyId = parseInt(req.params.familyId);
      const memberId = parseInt(req.params.memberId);
      const userId = req.user.claims.sub;
      
      // Check if user is an admin of this family
      const member = await storage.getFamilyMember(familyId, userId);
      if (!member || member.role !== 'admin') {
        return res.status(403).json({ message: "Not authorized to change member roles" });
      }
      
      const roleSchema = z.object({
        role: z.enum(['admin', 'publisher', 'member'])
      });
      
      const { role } = roleSchema.parse(req.body);
      
      const updatedMember = await storage.updateFamilyMemberRole(memberId, role);
      if (!updatedMember) {
        return res.status(404).json({ message: "Member not found" });
      }
      
      res.json(updatedMember);
    } catch (error) {
      console.error("Error updating member role:", error);
      res.status(500).json({ message: "Failed to update member role" });
    }
  });
  
  app.delete('/api/families/:familyId/members/:memberId', isAuthenticated, async (req: any, res) => {
    try {
      const familyId = parseInt(req.params.familyId);
      const memberId = parseInt(req.params.memberId);
      const userId = req.user.claims.sub;
      
      // Check if user is an admin of this family or is removing themselves
      const requestingMember = await storage.getFamilyMember(familyId, userId);
      if (!requestingMember) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      // If not an admin, they can only remove themselves
      if (requestingMember.role !== 'admin') {
        // Ensure they're trying to remove their own membership
        if (requestingMember.id !== memberId) {
          return res.status(403).json({ message: "Not authorized to remove other members" });
        }
      }
      
      const success = await storage.removeFamilyMember(memberId);
      if (!success) {
        return res.status(404).json({ message: "Member not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Error removing member:", error);
      res.status(500).json({ message: "Failed to remove family member" });
    }
  });

  // Post Routes
  app.post('/api/families/:id/posts', isAuthenticated, upload.array('images', 5), async (req: any, res) => {
    try {
      const familyId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Check if user is an approved member of this family
      const member = await storage.getFamilyMember(familyId, userId);
      if (!member || !member.isApproved) {
        return res.status(403).json({ message: "Not authorized to post in this family" });
      }
      
      const postSchema = z.object({
        content: z.string().min(1),
      });
      
      const { content } = postSchema.parse(req.body);
      
      // Process uploaded images
      let imageUrls: string[] = [];
      if (req.files && req.files.length > 0) {
        imageUrls = req.files.map((file: any) => `/uploads/${file.filename}`);
      }
      
      const post = await storage.createPost({
        userId,
        familyId,
        content,
        images: imageUrls
      });
      
      res.status(201).json(post);
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ message: "Failed to create post" });
    }
  });
  
  app.get('/api/families/:id/posts', isAuthenticated, async (req: any, res) => {
    try {
      const familyId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const limit = req.query.limit ? parseInt(req.query.limit) : 10;
      const offset = req.query.offset ? parseInt(req.query.offset) : 0;
      
      // Check if user is an approved member of this family
      const member = await storage.getFamilyMember(familyId, userId);
      if (!member || !member.isApproved) {
        return res.status(403).json({ message: "Not authorized to view posts in this family" });
      }
      
      const posts = await storage.getFamilyPosts(familyId, limit, offset);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });
  
  app.get('/api/posts/:id', isAuthenticated, async (req: any, res) => {
    try {
      const postId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const post = await storage.getPost(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      // Check if user is an approved member of this family
      const member = await storage.getFamilyMember(post.familyId, userId);
      if (!member || !member.isApproved) {
        return res.status(403).json({ message: "Not authorized to view this post" });
      }
      
      res.json(post);
    } catch (error) {
      console.error("Error fetching post:", error);
      res.status(500).json({ message: "Failed to fetch post" });
    }
  });

  // Comment Routes
  app.post('/api/posts/:id/comments', isAuthenticated, async (req: any, res) => {
    try {
      const postId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const post = await storage.getPost(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      // Check if user is an approved member of this family
      const member = await storage.getFamilyMember(post.familyId, userId);
      if (!member || !member.isApproved) {
        return res.status(403).json({ message: "Not authorized to comment on this post" });
      }
      
      const commentSchema = z.object({
        content: z.string().min(1),
      });
      
      const { content } = commentSchema.parse(req.body);
      
      const comment = await storage.addComment({
        postId,
        userId,
        content
      });
      
      res.status(201).json(comment);
    } catch (error) {
      console.error("Error adding comment:", error);
      res.status(500).json({ message: "Failed to add comment" });
    }
  });
  
  app.get('/api/posts/:id/comments', isAuthenticated, async (req: any, res) => {
    try {
      const postId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const post = await storage.getPost(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      // Check if user is an approved member of this family
      const member = await storage.getFamilyMember(post.familyId, userId);
      if (!member || !member.isApproved) {
        return res.status(403).json({ message: "Not authorized to view comments on this post" });
      }
      
      const comments = await storage.getPostComments(postId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  // Like Routes
  app.post('/api/posts/:id/likes', isAuthenticated, async (req: any, res) => {
    try {
      const postId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const post = await storage.getPost(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      // Check if user is an approved member of this family
      const member = await storage.getFamilyMember(post.familyId, userId);
      if (!member || !member.isApproved) {
        return res.status(403).json({ message: "Not authorized to like this post" });
      }
      
      // Check if already liked
      const existingLike = await storage.getLike(postId, userId);
      if (existingLike) {
        return res.status(400).json({ message: "Already liked this post" });
      }
      
      const like = await storage.addLike({
        postId,
        userId
      });
      
      res.status(201).json(like);
    } catch (error) {
      console.error("Error liking post:", error);
      res.status(500).json({ message: "Failed to like post" });
    }
  });
  
  app.delete('/api/posts/:id/likes', isAuthenticated, async (req: any, res) => {
    try {
      const postId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const post = await storage.getPost(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      const success = await storage.removeLike(postId, userId);
      if (!success) {
        return res.status(404).json({ message: "Like not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Error unliking post:", error);
      res.status(500).json({ message: "Failed to unlike post" });
    }
  });

  // Event Routes
  app.post('/api/families/:id/events', isAuthenticated, async (req: any, res) => {
    try {
      const familyId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Check if user is an approved member of this family
      const member = await storage.getFamilyMember(familyId, userId);
      if (!member || !member.isApproved) {
        return res.status(403).json({ message: "Not authorized to create events in this family" });
      }
      
      const eventSchema = schema.insertEventSchema.extend({
        eventDate: z.string().transform((val) => new Date(val)),
      });
      
      const validatedData = eventSchema.parse({
        ...req.body,
        familyId,
        createdByUserId: userId
      });
      
      const event = await storage.createEvent(validatedData);
      res.status(201).json(event);
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(500).json({ message: "Failed to create event" });
    }
  });
  
  app.get('/api/families/:id/events', isAuthenticated, async (req: any, res) => {
    try {
      const familyId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Check if user is an approved member of this family
      const member = await storage.getFamilyMember(familyId, userId);
      if (!member || !member.isApproved) {
        return res.status(403).json({ message: "Not authorized to view events in this family" });
      }
      
      const events = await storage.getFamilyEvents(familyId);
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });
  
  app.get('/api/families/:id/upcoming-events', isAuthenticated, async (req: any, res) => {
    try {
      const familyId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const limit = req.query.limit ? parseInt(req.query.limit) : 5;
      
      // Check if user is an approved member of this family
      const member = await storage.getFamilyMember(familyId, userId);
      if (!member || !member.isApproved) {
        return res.status(403).json({ message: "Not authorized to view events in this family" });
      }
      
      const events = await storage.getUpcomingEvents(familyId, limit);
      res.json(events);
    } catch (error) {
      console.error("Error fetching upcoming events:", error);
      res.status(500).json({ message: "Failed to fetch upcoming events" });
    }
  });

  // Newsletter Routes
  app.post('/api/families/:id/newsletters', isAuthenticated, async (req: any, res) => {
    try {
      const familyId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Check if user is a publisher or admin of this family
      const member = await storage.getFamilyMember(familyId, userId);
      if (!member || !member.isApproved || (member.role !== 'publisher' && member.role !== 'admin')) {
        return res.status(403).json({ message: "Not authorized to create newsletters for this family" });
      }
      
      const newsletterSchema = schema.insertNewsletterSchema.extend({
        includedPostIds: z.array(z.number()).optional(),
      });
      
      const validatedData = newsletterSchema.parse({
        ...req.body,
        familyId,
        createdByUserId: userId,
        isSent: false
      });
      
      const newsletter = await storage.createNewsletter(validatedData);
      res.status(201).json(newsletter);
    } catch (error) {
      console.error("Error creating newsletter:", error);
      res.status(500).json({ message: "Failed to create newsletter" });
    }
  });
  
  app.get('/api/families/:id/newsletters', isAuthenticated, async (req: any, res) => {
    try {
      const familyId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Check if user is an approved member of this family
      const member = await storage.getFamilyMember(familyId, userId);
      if (!member || !member.isApproved) {
        return res.status(403).json({ message: "Not authorized to view newsletters in this family" });
      }
      
      const newsletters = await storage.getFamilyNewsletters(familyId);
      res.json(newsletters);
    } catch (error) {
      console.error("Error fetching newsletters:", error);
      res.status(500).json({ message: "Failed to fetch newsletters" });
    }
  });
  
  app.get('/api/newsletters/:id', isAuthenticated, async (req: any, res) => {
    try {
      const newsletterId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const newsletter = await storage.getNewsletter(newsletterId);
      if (!newsletter) {
        return res.status(404).json({ message: "Newsletter not found" });
      }
      
      // Check if user is an approved member of this family
      const member = await storage.getFamilyMember(newsletter.familyId, userId);
      if (!member || !member.isApproved) {
        return res.status(403).json({ message: "Not authorized to view this newsletter" });
      }
      
      res.json(newsletter);
    } catch (error) {
      console.error("Error fetching newsletter:", error);
      res.status(500).json({ message: "Failed to fetch newsletter" });
    }
  });
  
  app.post('/api/newsletters/:id/send', isAuthenticated, async (req: any, res) => {
    try {
      const newsletterId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const newsletter = await storage.getNewsletter(newsletterId);
      if (!newsletter) {
        return res.status(404).json({ message: "Newsletter not found" });
      }
      
      // Check if user is a publisher or admin of this family
      const member = await storage.getFamilyMember(newsletter.familyId, userId);
      if (!member || !member.isApproved || (member.role !== 'publisher' && member.role !== 'admin')) {
        return res.status(403).json({ message: "Not authorized to send newsletters for this family" });
      }
      
      // Get all approved family members to send newsletter to
      const familyMembers = await storage.getFamilyMembersWithUserDetails(newsletter.familyId);
      const approvedMembers = familyMembers.filter(member => member.isApproved);
      
      // Create transport for sending email
      const transporter = createTransport({
        host: process.env.SMTP_HOST || 'smtp.example.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER || 'user@example.com',
          pass: process.env.SMTP_PASS || 'password'
        }
      });
      
      // Send emails to all family members
      const emailPromises = approvedMembers
        .filter(member => member.user.email) // Only send to members with emails
        .map(member => {
          return transporter.sendMail({
            from: process.env.SMTP_FROM || 'FamilyConnect <noreply@example.com>',
            to: member.user.email,
            subject: `Family Newsletter: ${newsletter.title}`,
            html: newsletter.content,
          });
        });
      
      try {
        await Promise.all(emailPromises);
        
        // Update newsletter status
        const updatedNewsletter = await storage.updateNewsletterStatus(newsletterId, true);
        res.json(updatedNewsletter);
      } catch (emailError) {
        console.error("Error sending newsletter emails:", emailError);
        res.status(500).json({ message: "Failed to send newsletter emails" });
      }
    } catch (error) {
      console.error("Error sending newsletter:", error);
      res.status(500).json({ message: "Failed to send newsletter" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
