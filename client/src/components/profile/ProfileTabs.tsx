import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AboutTab from "@/components/profile/AboutTab";
import { Skeleton } from "@/components/ui/skeleton";
import PostCard from "@/components/post/PostCard";

interface ProfileTabsProps {
  user: any;
  relationships: any[];
  userPosts: any[];
  isLoading: {
    relationships: boolean;
    posts: boolean;
  };
}

export default function ProfileTabs({ user, relationships, userPosts, isLoading }: ProfileTabsProps) {
  return (
    <Tabs defaultValue="about" className="mt-6">
      <TabsList className="border-b border-gray-200 w-full justify-start space-x-8 rounded-none bg-transparent mb-6">
        <TabsTrigger 
          value="about" 
          className="data-[state=active]:border-accent-500 data-[state=active]:text-accent-600 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium rounded-none data-[state=active]:shadow-none bg-transparent"
        >
          About Me
        </TabsTrigger>
        <TabsTrigger 
          value="updates" 
          className="data-[state=active]:border-accent-500 data-[state=active]:text-accent-600 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium rounded-none data-[state=active]:shadow-none bg-transparent"
        >
          My Updates
        </TabsTrigger>
        <TabsTrigger 
          value="connections" 
          className="data-[state=active]:border-accent-500 data-[state=active]:text-accent-600 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium rounded-none data-[state=active]:shadow-none bg-transparent"
        >
          Family Connections
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="about">
        <AboutTab user={user} relationships={relationships} isLoading={isLoading.relationships} />
      </TabsContent>
      
      <TabsContent value="updates">
        {isLoading.posts ? (
          <div className="space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : userPosts && userPosts.length > 0 ? (
          <div className="space-y-6">
            {userPosts.map((post: any) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border rounded-lg">
            <h3 className="text-lg font-medium text-primary-900 mb-2">No updates yet</h3>
            <p className="text-primary-600 mb-6">You haven't shared any updates with your family yet.</p>
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="connections">
        {isLoading.relationships ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : relationships && relationships.length > 0 ? (
          <div className="space-y-2">
            {relationships.map((relationship: any) => (
              <div key={relationship.id} className="p-4 border rounded-lg">
                <p className="text-primary-800">
                  <span className="font-medium">{relationship.relatedUser.firstName} {relationship.relatedUser.lastName}</span> 
                  <span className="text-primary-600"> • {relationship.relationshipType}</span>
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border rounded-lg">
            <h3 className="text-lg font-medium text-primary-900 mb-2">No family connections yet</h3>
            <p className="text-primary-600 mb-6">Start adding your family relationships to build your family tree.</p>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
