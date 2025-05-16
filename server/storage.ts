import {
  users,
  families,
  familyMembers,
  relationships,
  posts,
  comments,
  likes,
  events,
  newsletters,
  type User,
  type UpsertUser,
  type Family,
  type InsertFamily,
  type FamilyMember,
  type InsertFamilyMember,
  type Relationship,
  type InsertRelationship,
  type Post,
  type InsertPost,
  type Comment,
  type InsertComment,
  type Like,
  type InsertLike,
  type Event,
  type InsertEvent,
  type Newsletter,
  type InsertNewsletter
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, desc, sql, not, inArray } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, userData: Partial<UpsertUser>): Promise<User | undefined>;

  // Family operations
  createFamily(family: InsertFamily): Promise<Family>;
  getFamily(id: number): Promise<Family | undefined>;
  getFamiliesByUserId(userId: string): Promise<Family[]>;
  updateFamily(id: number, familyData: Partial<InsertFamily>): Promise<Family | undefined>;

  // Family member operations
  addFamilyMember(member: InsertFamilyMember): Promise<FamilyMember>;
  getFamilyMembers(familyId: number): Promise<FamilyMember[]>;
  getFamilyMembersWithUserDetails(familyId: number): Promise<(FamilyMember & { user: User })[]>;
  updateFamilyMemberRole(id: number, role: string): Promise<FamilyMember | undefined>;
  approveFamilyMember(id: number): Promise<FamilyMember | undefined>;
  removeFamilyMember(id: number): Promise<boolean>;
  getFamilyMember(familyId: number, userId: string): Promise<FamilyMember | undefined>;

  // Relationship operations
  addRelationship(relationship: InsertRelationship): Promise<Relationship>;
  getRelationships(userId: string): Promise<Relationship[]>;
  
  // Post operations
  createPost(post: InsertPost): Promise<Post>;
  getPost(id: number): Promise<Post | undefined>;
  getFamilyPosts(familyId: number, limit?: number, offset?: number): Promise<Post[]>;
  getUserPosts(userId: string, limit?: number, offset?: number): Promise<Post[]>;
  
  // Comment operations
  addComment(comment: InsertComment): Promise<Comment>;
  getPostComments(postId: number): Promise<Comment[]>;
  
  // Like operations
  addLike(like: InsertLike): Promise<Like>;
  removeLike(postId: number, userId: string): Promise<boolean>;
  getLike(postId: number, userId: string): Promise<Like | undefined>;
  
  // Event operations
  createEvent(event: InsertEvent): Promise<Event>;
  getEvent(id: number): Promise<Event | undefined>;
  getFamilyEvents(familyId: number): Promise<Event[]>;
  getUpcomingEvents(familyId: number, limit?: number): Promise<Event[]>;
  
  // Newsletter operations
  createNewsletter(newsletter: InsertNewsletter): Promise<Newsletter>;
  getNewsletter(id: number): Promise<Newsletter | undefined>;
  getFamilyNewsletters(familyId: number): Promise<Newsletter[]>;
  updateNewsletterStatus(id: number, isSent: boolean): Promise<Newsletter | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUser(id: string, userData: Partial<UpsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({
        ...userData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  // Family operations
  async createFamily(family: InsertFamily): Promise<Family> {
    const [newFamily] = await db
      .insert(families)
      .values(family)
      .returning();
    return newFamily;
  }

  async getFamily(id: number): Promise<Family | undefined> {
    const [family] = await db
      .select()
      .from(families)
      .where(eq(families.id, id));
    return family;
  }

  async getFamiliesByUserId(userId: string): Promise<Family[]> {
    return db
      .select({
        id: families.id,
        name: families.name,
        description: families.description,
        coverImageUrl: families.coverImageUrl,
        createdAt: families.createdAt,
        updatedAt: families.updatedAt
      })
      .from(families)
      .innerJoin(familyMembers, eq(families.id, familyMembers.familyId))
      .where(
        and(
          eq(familyMembers.userId, userId),
          eq(familyMembers.isApproved, true)
        )
      );
  }

  async updateFamily(id: number, familyData: Partial<InsertFamily>): Promise<Family | undefined> {
    const [updatedFamily] = await db
      .update(families)
      .set({
        ...familyData,
        updatedAt: new Date(),
      })
      .where(eq(families.id, id))
      .returning();
    return updatedFamily;
  }

  // Family member operations
  async addFamilyMember(member: InsertFamilyMember): Promise<FamilyMember> {
    const [newMember] = await db
      .insert(familyMembers)
      .values(member)
      .returning();
    return newMember;
  }

  async getFamilyMembers(familyId: number): Promise<FamilyMember[]> {
    return db
      .select()
      .from(familyMembers)
      .where(eq(familyMembers.familyId, familyId));
  }

  async getFamilyMembersWithUserDetails(familyId: number): Promise<(FamilyMember & { user: User })[]> {
    const result = await db
      .select({
        id: familyMembers.id,
        familyId: familyMembers.familyId,
        userId: familyMembers.userId,
        role: familyMembers.role,
        isApproved: familyMembers.isApproved,
        createdAt: familyMembers.createdAt,
        updatedAt: familyMembers.updatedAt,
        user: users
      })
      .from(familyMembers)
      .innerJoin(users, eq(familyMembers.userId, users.id))
      .where(eq(familyMembers.familyId, familyId));
    
    return result;
  }

  async updateFamilyMemberRole(id: number, role: string): Promise<FamilyMember | undefined> {
    const [updatedMember] = await db
      .update(familyMembers)
      .set({
        role,
        updatedAt: new Date(),
      })
      .where(eq(familyMembers.id, id))
      .returning();
    return updatedMember;
  }

  async approveFamilyMember(id: number): Promise<FamilyMember | undefined> {
    const [updatedMember] = await db
      .update(familyMembers)
      .set({
        isApproved: true,
        updatedAt: new Date(),
      })
      .where(eq(familyMembers.id, id))
      .returning();
    return updatedMember;
  }

  async removeFamilyMember(id: number): Promise<boolean> {
    const result = await db
      .delete(familyMembers)
      .where(eq(familyMembers.id, id))
      .returning();
    return result.length > 0;
  }

  async getFamilyMember(familyId: number, userId: string): Promise<FamilyMember | undefined> {
    const [member] = await db
      .select()
      .from(familyMembers)
      .where(
        and(
          eq(familyMembers.familyId, familyId),
          eq(familyMembers.userId, userId)
        )
      );
    return member;
  }

  // Relationship operations
  async addRelationship(relationship: InsertRelationship): Promise<Relationship> {
    const [newRelationship] = await db
      .insert(relationships)
      .values(relationship)
      .returning();
    return newRelationship;
  }

  async getRelationships(userId: string): Promise<Relationship[]> {
    return db
      .select()
      .from(relationships)
      .where(eq(relationships.userId, userId));
  }

  // Post operations
  async createPost(post: InsertPost): Promise<Post> {
    const [newPost] = await db
      .insert(posts)
      .values(post)
      .returning();
    return newPost;
  }

  async getPost(id: number): Promise<Post | undefined> {
    const [post] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, id));
    return post;
  }

  async getFamilyPosts(familyId: number, limit = 10, offset = 0): Promise<Post[]> {
    return db
      .select()
      .from(posts)
      .where(eq(posts.familyId, familyId))
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getUserPosts(userId: string, limit = 10, offset = 0): Promise<Post[]> {
    return db
      .select()
      .from(posts)
      .where(eq(posts.userId, userId))
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset);
  }

  // Comment operations
  async addComment(comment: InsertComment): Promise<Comment> {
    const [newComment] = await db
      .insert(comments)
      .values(comment)
      .returning();
    
    // Update comment count on post
    await db
      .update(posts)
      .set({
        commentCount: sql`${posts.commentCount} + 1`,
      })
      .where(eq(posts.id, comment.postId));
    
    return newComment;
  }

  async getPostComments(postId: number): Promise<Comment[]> {
    return db
      .select()
      .from(comments)
      .where(eq(comments.postId, postId))
      .orderBy(comments.createdAt);
  }

  // Like operations
  async addLike(like: InsertLike): Promise<Like> {
    const [newLike] = await db
      .insert(likes)
      .values(like)
      .returning();
    
    // Update like count on post
    await db
      .update(posts)
      .set({
        likeCount: sql`${posts.likeCount} + 1`,
      })
      .where(eq(posts.id, like.postId));
    
    return newLike;
  }

  async removeLike(postId: number, userId: string): Promise<boolean> {
    const result = await db
      .delete(likes)
      .where(
        and(
          eq(likes.postId, postId),
          eq(likes.userId, userId)
        )
      )
      .returning();
    
    if (result.length > 0) {
      // Update like count on post
      await db
        .update(posts)
        .set({
          likeCount: sql`${posts.likeCount} - 1`,
        })
        .where(eq(posts.id, postId));
      return true;
    }
    
    return false;
  }

  async getLike(postId: number, userId: string): Promise<Like | undefined> {
    const [like] = await db
      .select()
      .from(likes)
      .where(
        and(
          eq(likes.postId, postId),
          eq(likes.userId, userId)
        )
      );
    return like;
  }

  // Event operations
  async createEvent(event: InsertEvent): Promise<Event> {
    const [newEvent] = await db
      .insert(events)
      .values(event)
      .returning();
    return newEvent;
  }

  async getEvent(id: number): Promise<Event | undefined> {
    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, id));
    return event;
  }

  async getFamilyEvents(familyId: number): Promise<Event[]> {
    return db
      .select()
      .from(events)
      .where(eq(events.familyId, familyId))
      .orderBy(events.eventDate);
  }

  async getUpcomingEvents(familyId: number, limit = 5): Promise<Event[]> {
    return db
      .select()
      .from(events)
      .where(
        and(
          eq(events.familyId, familyId),
          gte(events.eventDate, new Date())
        )
      )
      .orderBy(events.eventDate)
      .limit(limit);
  }

  // Newsletter operations
  async createNewsletter(newsletter: InsertNewsletter): Promise<Newsletter> {
    const [newNewsletter] = await db
      .insert(newsletters)
      .values(newsletter)
      .returning();
    return newNewsletter;
  }

  async getNewsletter(id: number): Promise<Newsletter | undefined> {
    const [newsletter] = await db
      .select()
      .from(newsletters)
      .where(eq(newsletters.id, id));
    return newsletter;
  }

  async getFamilyNewsletters(familyId: number): Promise<Newsletter[]> {
    return db
      .select()
      .from(newsletters)
      .where(eq(newsletters.familyId, familyId))
      .orderBy(desc(newsletters.createdAt));
  }

  async updateNewsletterStatus(id: number, isSent: boolean): Promise<Newsletter | undefined> {
    const [updatedNewsletter] = await db
      .update(newsletters)
      .set({
        isSent,
        sentAt: isSent ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(newsletters.id, id))
      .returning();
    return updatedNewsletter;
  }
}

export const storage = new DatabaseStorage();
