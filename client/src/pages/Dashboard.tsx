import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { PlusIcon } from "lucide-react";
import NewPost from "@/components/post/NewPost";
import PostList from "@/components/post/PostList";
import FamilyInfo from "@/components/family/FamilyInfo";
import UpcomingEvents from "@/components/family/UpcomingEvents";
import NewsletterPreview from "@/components/newsletter/NewsletterPreview";
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
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        {families?.length === 0 && !familiesLoading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h2 className="text-2xl font-display font-bold text-primary-900 mb-4">Welcome to FamilyConnect!</h2>
            <p className="text-primary-700 mb-6">You're not part of any family groups yet. Start by creating your own family group!</p>
            <Button asChild>
              <Link href="/family/create">
                <a className="bg-accent-600 hover:bg-accent-700">
                  <PlusIcon className="mr-2 h-4 w-4" /> Create a Family Group
                </a>
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
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-2xl font-display font-bold text-primary-900">Your Family Groups</h2>
                        <p className="text-primary-600">Stay connected with your loved ones</p>
                      </div>
                      <Button asChild>
                        <Link href="/family/create">
                          <a className="bg-accent-600 hover:bg-accent-700">
                            <PlusIcon className="mr-2 h-4 w-4" /> Create a Family Group
                          </a>
                        </Link>
                      </Button>
                    </div>
                    <div className="flex overflow-x-auto pb-2 space-x-4">
                      {families.map((family: any) => (
                        <div 
                          key={family.id} 
                          className={`flex-shrink-0 p-4 rounded-lg cursor-pointer border-2 ${
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
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Left Column - Family Feed */}
                    <div className="md:w-2/3">
                      <div className="bg-white rounded-lg shadow mb-6 p-6">
                        <h2 className="text-2xl font-display font-bold text-primary-900 mb-4">Family Updates</h2>
                        
                        {/* New Post Form */}
                        <NewPost familyId={selectedFamilyId} />
                        
                        {/* Family Posts Feed */}
                        <PostList familyId={selectedFamilyId} />
                      </div>
                    </div>

                    {/* Right Column - Family Info and Upcoming Events */}
                    <div className="md:w-1/3">
                      {/* Family Group Info */}
                      <FamilyInfo familyId={selectedFamilyId} />
                      
                      {/* Upcoming Birthdays and Events */}
                      <UpcomingEvents familyId={selectedFamilyId} />
                      
                      {/* Latest Newsletter Preview */}
                      <NewsletterPreview familyId={selectedFamilyId} />
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
