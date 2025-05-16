import { useQuery } from "@tanstack/react-query";
import PostCard from "./PostCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

interface PostListProps {
  familyId: number;
}

export default function PostList({ familyId }: PostListProps) {
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 5;

  const { data: posts, isLoading, error } = useQuery({
    queryKey: [`/api/families/${familyId}/posts`, { limit: PAGE_SIZE, offset: page * PAGE_SIZE }],
  });

  if (isLoading) {
    return (
      <div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="mb-6 border-b border-primary-200 pb-6">
            <div className="flex items-start mb-4">
              <Skeleton className="h-10 w-10 rounded-full mr-4" />
              <div>
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <Skeleton className="h-20 w-full mb-4" />
            <Skeleton className="h-48 w-full mb-4" />
            <div className="flex space-x-4">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-32" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-2">Failed to load posts</p>
        <Button 
          onClick={() => window.location.reload()}
          variant="outline"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-8 border-t border-primary-200 mt-6">
        <p className="text-primary-600 mb-2">No updates yet. Be the first to share!</p>
      </div>
    );
  }

  const loadMore = () => {
    setPage(page + 1);
  };

  return (
    <div>
      {posts.map((post: any) => (
        <div key={post.id} className="border-b border-primary-200 pb-6 mb-6 last:border-0">
          <PostCard post={post} />
        </div>
      ))}
      
      <div className="text-center mt-4">
        <Button 
          variant="link" 
          onClick={loadMore}
          className="text-accent-600 hover:text-accent-700 font-medium"
        >
          Load More Updates
        </Button>
      </div>
    </div>
  );
}
