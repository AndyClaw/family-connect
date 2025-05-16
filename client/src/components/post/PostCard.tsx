import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow } from "date-fns";
import { HeartIcon, MessageCircleIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface PostCardProps {
  post: {
    id: number;
    content: string;
    images: string[];
    userId: string;
    familyId: number;
    likeCount: number;
    commentCount: number;
    createdAt: string;
    updatedAt: string;
  };
}

export default function PostCard({ post }: PostCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  
  // Fetch post author details
  const { data: author, isLoading: authorLoading } = useQuery({
    queryKey: [`/api/auth/user/${post.userId}`],
    queryFn: async () => {
      // Since we don't have a specific endpoint for other users, we'll use a placeholder
      // In a real app, you'd fetch the user details from an endpoint like /api/users/:id
      return {
        id: post.userId,
        firstName: "Family",
        lastName: "Member",
        profileImageUrl: null
      };
    }
  });
  
  // Fetch comments when expanded
  const { data: comments, isLoading: commentsLoading } = useQuery({
    queryKey: [`/api/posts/${post.id}/comments`],
    enabled: showComments,
  });
  
  // Check if the current user has liked this post
  const { data: userLike } = useQuery({
    queryKey: [`/api/posts/${post.id}/likes/user`],
    // This is a mock since we don't have a specific endpoint to check user likes
    queryFn: async () => {
      return null; // In a real app, this would return the like if present
    }
  });
  
  // Add comment
  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest("POST", `/api/posts/${post.id}/comments`, { content });
    },
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${post.id}/comments`] });
      // Update comment count in the post
      queryClient.invalidateQueries({ queryKey: [`/api/families/${post.familyId}/posts`] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add comment: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Like or unlike post
  const likeMutation = useMutation({
    mutationFn: async () => {
      if (userLike) {
        return apiRequest("DELETE", `/api/posts/${post.id}/likes`);
      } else {
        return apiRequest("POST", `/api/posts/${post.id}/likes`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${post.id}/likes/user`] });
      // Update like count in the post
      queryClient.invalidateQueries({ queryKey: [`/api/families/${post.familyId}/posts`] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to like post: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      addCommentMutation.mutate(newComment);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return "recently";
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex items-start mb-4">
          {authorLoading ? (
            <Skeleton className="h-10 w-10 rounded-full mr-4" />
          ) : (
            <Avatar className="h-10 w-10 mr-4">
              <AvatarImage src={author?.profileImageUrl || undefined} />
              <AvatarFallback>
                {author?.firstName?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
          )}
          <div>
            {authorLoading ? (
              <>
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-24" />
              </>
            ) : (
              <>
                <h4 className="text-lg font-semibold text-primary-900">
                  {author?.firstName} {author?.lastName}
                </h4>
                <p className="text-sm text-primary-500">
                  {formatDate(post.createdAt)}
                </p>
              </>
            )}
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-primary-800 whitespace-pre-line">{post.content}</p>
        </div>
        
        {post.images && post.images.length > 0 && (
          <div className={`mb-4 grid ${post.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-2`}>
            {post.images.map((image, index) => (
              <img 
                key={index} 
                src={image} 
                alt={`Posted image ${index + 1}`} 
                className="rounded-lg w-full h-48 object-cover" 
              />
            ))}
          </div>
        )}
        
        <div className="flex space-x-4">
          <Button
            variant="ghost"
            className={`flex items-center ${userLike ? 'text-red-500 hover:text-red-600' : 'text-primary-500 hover:text-primary-700'}`}
            onClick={() => likeMutation.mutate()}
            disabled={likeMutation.isPending}
          >
            <HeartIcon className="mr-1 h-4 w-4" />
            <span>{post.likeCount} {post.likeCount === 1 ? 'Like' : 'Likes'}</span>
          </Button>
          
          <Button
            variant="ghost"
            className="flex items-center text-primary-500 hover:text-primary-700"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircleIcon className="mr-1 h-4 w-4" />
            <span>{post.commentCount} {post.commentCount === 1 ? 'Comment' : 'Comments'}</span>
          </Button>
        </div>
        
        {showComments && (
          <div className="mt-4 border-t border-primary-200 pt-4">
            {commentsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : (
              <>
                {comments && comments.length > 0 ? (
                  <div className="space-y-4">
                    {comments.map((comment: any) => (
                      <div key={comment.id} className="flex items-start">
                        <Avatar className="h-8 w-8 mr-3">
                          <AvatarImage src={comment.user?.profileImageUrl || undefined} />
                          <AvatarFallback>
                            {comment.user?.firstName?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-primary-50 rounded-lg px-3 py-2 flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-primary-900">
                              {comment.user?.firstName || "Family Member"}
                            </span>
                            <span className="text-xs text-primary-500">
                              {formatDate(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-primary-800">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-primary-500 py-2">No comments yet. Be the first to comment!</p>
                )}
                
                <form onSubmit={handleSubmitComment} className="mt-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.profileImageUrl || undefined} />
                      <AvatarFallback>
                        {user?.firstName?.charAt(0) || user?.email?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                        className="mb-2"
                        rows={1}
                      />
                      <div className="flex justify-end">
                        <Button
                          type="submit"
                          disabled={addCommentMutation.isPending || !newComment.trim()}
                          size="sm"
                          className="bg-accent-600 hover:bg-accent-700"
                        >
                          {addCommentMutation.isPending ? "Posting..." : "Post Comment"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </form>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
