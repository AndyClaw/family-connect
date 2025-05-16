import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileTabs from "@/components/profile/ProfileTabs";
import { Card } from "@/components/ui/card";

export default function Profile() {
  const { user } = useAuth();

  // Fetch relationships
  const { data: relationships, isLoading: relationshipsLoading } = useQuery({
    queryKey: ['/api/user/relationships'],
    // This would fetch from a real endpoint - use a placeholder since it doesn't exist yet
    queryFn: async () => {
      return [];
    },
    enabled: !!user
  });

  // Fetch posts by this user
  const { data: userPosts, isLoading: postsLoading } = useQuery({
    queryKey: ['/api/user/posts'],
    // This would fetch from a real endpoint - use a placeholder since it doesn't exist yet
    queryFn: async () => {
      return [];
    },
    enabled: !!user
  });

  if (!user) {
    return <div className="py-10 text-center">Loading profile...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <Card className="bg-white rounded-lg shadow">
          <ProfileHeader user={user} />
          
          <div className="mt-16 px-8 pb-8">
            <ProfileTabs 
              user={user} 
              relationships={relationships} 
              userPosts={userPosts}
              isLoading={{
                relationships: relationshipsLoading,
                posts: postsLoading
              }}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
