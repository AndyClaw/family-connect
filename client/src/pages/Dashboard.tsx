import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { PlusIcon, MessageCircle } from "lucide-react";
import NewPost from "@/components/post/NewPost";
import PostList from "@/components/post/PostList";
import { useState } from "react";

export default function Dashboard() {
  const { user } = useAuth();
  const [selectedFamilyId, setSelectedFamilyId] = useState<number | null>(null);

  // Fetch user's families
  const { data: families, isLoading: familiesLoading } = useQuery({
    queryKey: ['/api/families'],
  });

  // Set the first family as selected by default
  if (families && families.length > 0 && !selectedFamilyId) {
    setSelectedFamilyId(families[0].id);
  }

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 max-w-7xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">News Feed</h1>
        <p className="text-muted-foreground mt-2">
          See the latest updates from your family
        </p>
      </header>

      {families?.length === 0 && !familiesLoading ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <MessageCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold text-primary-900 mb-4">Welcome to Family News and Views!</h2>
          <p className="text-primary-700 mb-6">You're not part of any family groups yet. Start by creating your own family group!</p>
          <Button asChild>
            <Link href="/family/create">
              <PlusIcon className="mr-2 h-4 w-4" /> Create a Family Group
            </Link>
          </Button>
        </div>
      ) : (
        <>
          {familiesLoading ? (
            <div className="flex flex-col space-y-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : (
            <>
              {families && families.length > 0 && (
                <div className="mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <div>
                      <h2 className="text-xl font-semibold text-primary-900">Your Family Groups</h2>
                    </div>
                    <Button asChild>
                      <Link href="/family/create">
                        <PlusIcon className="mr-2 h-4 w-4" /> Create a Family Group
                      </Link>
                    </Button>
                  </div>
                  <div className="flex overflow-x-auto pb-2 space-x-4">
                    {families.map((family: any) => (
                      <div 
                        key={family.id} 
                        className={`flex-shrink-0 px-4 py-3 rounded-lg cursor-pointer border ${
                          selectedFamilyId === family.id ? 'border-accent-500 bg-accent-50' : 'border-gray-200 bg-white'
                        }`}
                        onClick={() => setSelectedFamilyId(family.id)}
                      >
                        <h3 className="font-medium text-primary-900">{family.name}</h3>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedFamilyId && (
                <div className="bg-white rounded-lg shadow p-6">
                  {/* New Post Form */}
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold text-primary-900 mb-4">Share an Update</h2>
                    <NewPost familyId={selectedFamilyId} />
                  </div>
                  
                  {/* Family Posts Feed */}
                  <div className="mt-8">
                    <h2 className="text-xl font-semibold text-primary-900 mb-4">Latest Updates</h2>
                    <PostList familyId={selectedFamilyId} />
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
