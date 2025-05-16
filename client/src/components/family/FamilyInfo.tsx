import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

interface FamilyInfoProps {
  familyId: number;
}

export default function FamilyInfo({ familyId }: FamilyInfoProps) {
  const { data: family, isLoading: familyLoading } = useQuery({
    queryKey: [`/api/families/${familyId}`],
  });
  
  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: [`/api/families/${familyId}/members`],
  });

  const { data: posts } = useQuery({
    queryKey: [`/api/families/${familyId}/posts`, { limit: 100 }],
  });

  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  
  // Count posts from this month
  const postsThisMonth = posts?.filter((post: any) => {
    const postDate = new Date(post.createdAt);
    return postDate.getMonth() === thisMonth && postDate.getFullYear() === thisYear;
  }).length || 0;

  // Count family groups (placeholder for now)
  const familyGroups = 1;

  // Family cover image
  const coverImageUrl = family?.coverImageUrl || "https://images.unsplash.com/photo-1511895426328-dc8714191300?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300";

  if (familyLoading || membersLoading) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <Skeleton className="h-6 w-48 mb-4" />
          <Skeleton className="w-full h-36 mb-4" />
          <Skeleton className="h-4 w-full mb-4" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <h3 className="text-xl font-display font-bold text-primary-900 mb-4">
          {family?.name || "Family Group"}
        </h3>
        <div className="flex items-center mb-4">
          <img 
            className="w-full h-36 object-cover rounded-lg" 
            src={coverImageUrl} 
            alt={`${family?.name || 'Family'} photo`} 
          />
        </div>
        <p className="text-primary-700 mb-4">
          {family?.description || "A close-knit family keeping in touch."}
        </p>
        <div className="border-t border-b border-primary-200 py-3 my-3">
          <div className="flex justify-between items-center">
            <span className="text-primary-700">Family Members</span>
            <span className="text-primary-900 font-semibold">{members?.length || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-primary-700">Family Groups</span>
            <span className="text-primary-900 font-semibold">{familyGroups}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-primary-700">Updates This Month</span>
            <span className="text-primary-900 font-semibold">{postsThisMonth}</span>
          </div>
        </div>
        <div className="flex justify-center mt-4">
          <Link href={`/family/${familyId}/members`}>
            <a className="text-accent-600 hover:text-accent-700 font-medium">
              Family Group Settings
            </a>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
