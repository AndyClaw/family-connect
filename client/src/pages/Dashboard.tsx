import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { PlusIcon, MessageCircle } from "lucide-react";
import NewPost from "@/components/post/NewPost";
import PostList from "@/components/post/PostList";
import { useState } from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

export default function Dashboard() {
  const { user } = useAuth();
  const [selectedFamilyId, setSelectedFamilyId] = useState<number | string>("all");

  // Fetch user's families
  const { data: families, isLoading: familiesLoading } = useQuery({
    queryKey: ['/api/families'],
  });

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 max-w-5xl">
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
              {/* New Post Form */}
              <div className="bg-white rounded-lg shadow p-6 mb-8">
                <div className="flex flex-row items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-primary-900">Share an Update</h2>
                  
                  {families && families.length > 1 && (
                    <Select 
                      value={String(selectedFamilyId)} 
                      onValueChange={(value) => setSelectedFamilyId(value === "all" ? "all" : Number(value))}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select family" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedFamilyId === "all" ? (
                          <SelectItem value="all">All Families</SelectItem>
                        ) : (
                          <>
                            <SelectItem value="all">All Families</SelectItem>
                            {families.map((family: any) => (
                              <SelectItem key={family.id} value={String(family.id)}>
                                {family.name}
                              </SelectItem>
                            ))}
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                {/* Display the post form for the selected family */}
                {selectedFamilyId !== "all" ? (
                  <NewPost familyId={selectedFamilyId as number} />
                ) : (
                  <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <p className="text-muted-foreground mb-2">Please select a specific family to post to</p>
                    <Select 
                      value={String(selectedFamilyId)} 
                      onValueChange={(value) => setSelectedFamilyId(Number(value))}
                    >
                      <SelectTrigger className="w-full max-w-xs mx-auto">
                        <SelectValue placeholder="Select family" />
                      </SelectTrigger>
                      <SelectContent>
                        {families.map((family: any) => (
                          <SelectItem key={family.id} value={String(family.id)}>
                            {family.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              
              {/* Posts Feed */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex flex-row items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-primary-900">Latest Updates</h2>
                  
                  {families && families.length > 1 && (
                    <Select 
                      value={String(selectedFamilyId)} 
                      onValueChange={(value) => setSelectedFamilyId(value === "all" ? "all" : Number(value))}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="View posts from" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Families</SelectItem>
                        {families.map((family: any) => (
                          <SelectItem key={family.id} value={String(family.id)}>
                            {family.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                
                {/* Display posts based on selection */}
                {selectedFamilyId === "all" ? (
                  // This would be replaced with a component that shows posts from all families
                  // We'll need a backend route that fetches posts from all families
                  <div className="space-y-6">
                    {families.map((family: any) => (
                      <div key={family.id}>
                        <PostList familyId={family.id} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <PostList familyId={selectedFamilyId as number} />
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
