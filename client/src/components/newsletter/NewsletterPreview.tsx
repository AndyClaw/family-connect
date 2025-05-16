import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

interface NewsletterPreviewProps {
  familyId: number;
}

export default function NewsletterPreview({ familyId }: NewsletterPreviewProps) {
  // Fetch latest newsletter
  const { data: newsletters, isLoading: newslettersLoading } = useQuery({
    queryKey: [`/api/families/${familyId}/newsletters`],
  });

  // Get the latest newsletter
  const latestNewsletter = newsletters && newsletters.length > 0 ? newsletters[0] : null;

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  if (newslettersLoading) {
    return (
      <Card className="bg-white rounded-lg shadow mb-6">
        <CardContent className="p-6">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-40 w-full mb-2" />
          <Skeleton className="h-4 w-36" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white rounded-lg shadow mb-6">
      <CardContent className="p-6">
        <h3 className="text-xl font-display font-bold text-primary-900 mb-4">Latest Family Newsletter</h3>
        
        {latestNewsletter ? (
          <div className="bg-primary-100 rounded-lg p-3 mb-4">
            <div className="relative w-full h-40 bg-primary-200 rounded-md mb-2 overflow-hidden">
              {/* Newsletter preview image or stylized preview */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                <h4 className="text-xl font-bold text-primary-800">{latestNewsletter.title}</h4>
                <p className="text-sm text-primary-600 mt-2 line-clamp-3">
                  {latestNewsletter.content.replace(/<[^>]*>?/gm, '').substring(0, 150)}...
                </p>
              </div>
            </div>
            <h4 className="font-medium text-primary-900">{latestNewsletter.title}</h4>
            <p className="text-sm text-primary-600">
              {latestNewsletter.isSent 
                ? `Sent on ${formatDate(latestNewsletter.sentAt || latestNewsletter.createdAt)}` 
                : `Created on ${formatDate(latestNewsletter.createdAt)}`
              }
            </p>
          </div>
        ) : (
          <div className="bg-primary-100 rounded-lg p-3 mb-4 text-center py-6">
            <p className="text-primary-600">No newsletters have been created yet.</p>
          </div>
        )}
        
        <Link href={`/family/${familyId}/newsletters`}>
          <a className="text-accent-600 hover:text-accent-700 font-medium flex items-center justify-center">
            View All Newsletters
          </a>
        </Link>
      </CardContent>
    </Card>
  );
}
