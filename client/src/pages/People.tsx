import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, Mail, Phone } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function People() {
  const { user } = useAuth();
  
  const { data: families, isLoading: familiesLoading } = useQuery({
    queryKey: ["/api/families"],
  });

  const { data: relationships, isLoading: relationshipsLoading } = useQuery({
    queryKey: ["/api/relationships", user?.id],
    enabled: !!user?.id
  });

  if (familiesLoading || relationshipsLoading) {
    return (
      <div className="container mx-auto p-4 md:p-6 max-w-7xl">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">People</h1>
        <p className="text-muted-foreground mt-2">
          Browse and connect with your family members
        </p>
      </header>

      <Tabs defaultValue="families" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="families">Family Groups</TabsTrigger>
          <TabsTrigger value="relationships">Relationships</TabsTrigger>
        </TabsList>
        
        <TabsContent value="families">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {families?.length === 0 && (
              <div className="col-span-full text-center p-8">
                <p className="text-muted-foreground mb-4">You haven't created or joined any families yet.</p>
                <Button asChild>
                  <Link href="/family/create">Create a Family</Link>
                </Button>
              </div>
            )}
            
            {families?.map((family: any) => (
              <Card key={family.id} className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl font-bold text-primary-600">{family.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">{family.description}</p>
                  <Button asChild variant="secondary" className="w-full">
                    <Link href={`/family/${family.id}/members`}>View Members</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="relationships">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relationships?.length === 0 && (
              <div className="col-span-full text-center p-8">
                <p className="text-muted-foreground mb-4">You haven't added any family relationships yet.</p>
                <Button asChild>
                  <Link href="/profile/edit">Add Relationships</Link>
                </Button>
              </div>
            )}
            
            {relationships?.map((relationship: any) => (
              <Card key={relationship.id} className="shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={relationship.relatedUser?.profileImageUrl} />
                      <AvatarFallback>
                        {relationship.relatedUser?.firstName?.charAt(0) || 
                         relationship.relatedUser?.email?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold">
                        {relationship.relatedUser?.firstName} {relationship.relatedUser?.lastName}
                      </h3>
                      <p className="text-sm text-muted-foreground">{relationship.relationshipType}</p>
                    </div>
                  </div>
                  
                  {relationship.relatedUser?.email && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                      <Mail className="h-4 w-4" />
                      <span>{relationship.relatedUser.email}</span>
                    </div>
                  )}
                  
                  {relationship.relatedUser?.phone && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{relationship.relatedUser.phone}</span>
                    </div>
                  )}
                  
                  <div className="mt-4">
                    <Button asChild variant="outline" size="sm" className="w-full">
                      <Link href={`/profile/${relationship.relatedUserId}`}>
                        View Profile
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="mt-8 text-center">
        <Button asChild>
          <Link href="/invite">
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Family Member
          </Link>
        </Button>
      </div>
    </div>
  );
}