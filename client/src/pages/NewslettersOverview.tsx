import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Calendar, Newspaper, Clock } from "lucide-react";
import { format } from "date-fns";

export default function NewslettersOverview() {
  const { user } = useAuth();
  
  const { data: families, isLoading: familiesLoading } = useQuery({
    queryKey: ["/api/families"],
  });

  // This query would fetch all newsletters across all families
  const { data: allNewsletters, isLoading: newslettersLoading } = useQuery({
    queryKey: ["/api/newsletters/all"],
    // This might need a custom endpoint in the backend
    enabled: false, // Disable until we create the endpoint
  });

  if (familiesLoading || newslettersLoading) {
    return (
      <div className="container mx-auto p-4 md:p-6 max-w-7xl">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // For now, we'll just show newsletters by family since allNewsletters endpoint isn't implemented
  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Family Newsletters</h1>
        <p className="text-muted-foreground mt-2">
          Stay updated with compiled family news and announcements
        </p>
      </header>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Newsletters</TabsTrigger>
          <TabsTrigger value="byFamily">By Family</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {!allNewsletters || allNewsletters.length === 0 ? (
              <div className="col-span-full text-center p-8">
                <div className="mx-auto w-16 h-16 mb-4 text-muted-foreground">
                  <Newspaper className="w-16 h-16 opacity-20" />
                </div>
                <p className="text-muted-foreground mb-4">No newsletters have been published yet.</p>
                <p className="text-sm text-muted-foreground">
                  When family administrators publish newsletters, they'll appear here.
                </p>
              </div>
            ) : (
              allNewsletters?.map((newsletter: any) => (
                <NewsletterCard key={newsletter.id} newsletter={newsletter} />
              ))
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="byFamily">
          {families?.length === 0 ? (
            <div className="text-center p-8">
              <p className="text-muted-foreground mb-4">You haven't joined any family groups yet.</p>
              <Button asChild>
                <Link href="/family/create">Create a Family</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-10">
              {families?.map((family: any) => (
                <section key={family.id}>
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <span className="mr-2">
                      <FileText className="h-5 w-5 inline" />
                    </span>
                    {family.name} Newsletters
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card className="bg-accent-50 border-dashed border-2 border-accent-200">
                      <CardContent className="pt-6 flex flex-col items-center justify-center min-h-[200px] text-center">
                        <Calendar className="h-12 w-12 text-accent-300 mb-4" />
                        <h3 className="text-lg font-medium mb-2">View All {family.name} Newsletters</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Browse the complete archive of newsletters
                        </p>
                        <Button asChild>
                          <Link href={`/family/${family.id}/newsletters`}>
                            View Archive
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </section>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function NewsletterCard({ newsletter }: { newsletter: any }) {
  const formattedDate = newsletter.publishedAt 
    ? format(new Date(newsletter.publishedAt), 'MMMM d, yyyy')
    : 'Draft';
    
  return (
    <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3 bg-primary-50">
        <CardTitle className="text-xl font-bold text-primary-700">{newsletter.title}</CardTitle>
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="mr-1 h-4 w-4" />
          <span>{formattedDate}</span>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <p className="text-sm text-gray-600 line-clamp-3">
          {newsletter.description || "Family updates and announcements"}
        </p>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <Link href={`/newsletter/${newsletter.id}`}>
            Read Newsletter
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}