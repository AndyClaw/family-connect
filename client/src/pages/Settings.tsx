import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  UserCog, 
  Users, 
  Home, 
  UserPlus, 
  Mail, 
  LogOut
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";

export default function Settings() {
  const { user } = useAuth();
  
  const { data: families } = useQuery({
    queryKey: ["/api/families"],
  });

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-5xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account, families, and application preferences
        </p>
      </header>

      <div className="space-y-8">
        {/* Account Settings */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <UserCog className="mr-2 h-5 w-5" />
                  Profile Settings
                </CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Edit your profile details, change your photo, and manage your privacy settings.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline">
                  <Link href="/profile/edit">Edit Profile</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-red-500">
                  <LogOut className="mr-2 h-5 w-5" />
                  Log Out
                </CardTitle>
                <CardDescription>Sign out from your account</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Log out of your account on this device. You'll need to sign in again to access your families.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="destructive">
                  <a href="/api/logout">Log Out</a>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        <Separator />

        {/* Family Management */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Family Management</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Home className="mr-2 h-5 w-5" />
                  Create Family
                </CardTitle>
                <CardDescription>Start a new family group</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Create a new family group and invite members to join.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild>
                  <Link href="/family/create">Create Family</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <UserPlus className="mr-2 h-5 w-5" />
                  Invite Members
                </CardTitle>
                <CardDescription>Add family members</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Send invitations to friends and family to join your family groups.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline">
                  <Link href="/invite">Send Invites</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Mail className="mr-2 h-5 w-5" />
                  Newsletter Settings
                </CardTitle>
                <CardDescription>Configure email preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Manage how you receive family newsletters and updates.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline">
                  <Link href="/newsletter-settings">Email Settings</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        <Separator />

        {/* Manage Existing Families */}
        {families && families.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4">Your Family Groups</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {families.map((family: any) => (
                <Card key={family.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center">
                      <Users className="mr-2 h-5 w-5" />
                      {family.name}
                    </CardTitle>
                    <CardDescription>{family.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {family.memberCount || 0} members 
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/family/${family.id}/members`}>
                        Manage Members
                      </Link>
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                          Leave
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Leave {family.name}?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to leave this family group? You'll lose access to all shared updates and information.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction asChild>
                            <Button variant="destructive">Leave Family</Button>
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}