import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Copy, 
  MoreHorizontal, 
  CheckCircle, 
  XCircle, 
  UserPlus, 
  Clock,
  ShieldCheck,
  Mail,
  Newspaper
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface FamilyMembersProps {
  familyId: number;
}

export default function FamilyMembers({ familyId }: FamilyMembersProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [inviteLinkCopied, setInviteLinkCopied] = useState(false);

  // Fetch family details
  const { data: family, isLoading: familyLoading } = useQuery({
    queryKey: [`/api/families/${familyId}`],
  });

  // Fetch family members
  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: [`/api/families/${familyId}/members`],
  });

  // Check if the current user is an admin
  const isAdmin = members?.some((member: any) => 
    member.userId === user?.id && member.role === 'admin'
  );

  // Approve member mutation
  const approveMemberMutation = useMutation({
    mutationFn: async (memberId: number) => {
      return await apiRequest("PUT", `/api/families/${familyId}/members/${memberId}/approve`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/families/${familyId}/members`] });
      toast({
        title: "Member approved",
        description: "The family member has been approved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to approve member: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: number) => {
      return await apiRequest("DELETE", `/api/families/${familyId}/members/${memberId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/families/${familyId}/members`] });
      toast({
        title: "Member removed",
        description: "The family member has been removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to remove member: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Change member role mutation
  const changeMemberRoleMutation = useMutation({
    mutationFn: async ({ memberId, role }: { memberId: number; role: string }) => {
      return await apiRequest("PUT", `/api/families/${familyId}/members/${memberId}/role`, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/families/${familyId}/members`] });
      toast({
        title: "Role updated",
        description: "The member's role has been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update member role: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Generate and copy invite link
  const generateInviteLink = () => {
    const baseUrl = window.location.origin;
    const inviteLink = `${baseUrl}/join-family?id=${familyId}`;
    setInviteLink(inviteLink);
    return inviteLink;
  };

  const copyInviteLink = () => {
    const link = generateInviteLink();
    navigator.clipboard.writeText(link);
    setInviteLinkCopied(true);
    setTimeout(() => setInviteLinkCopied(false), 3000);
    toast({
      title: "Link copied",
      description: "Invite link has been copied to clipboard.",
    });
  };

  // Send email invitation (mock implementation)
  const sendInviteEmail = () => {
    if (!inviteEmail) {
      toast({
        title: "Error",
        description: "Please enter an email address.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Invitation sent",
      description: `An invitation has been sent to ${inviteEmail}.`,
    });
    setInviteEmail("");
    setInviteDialogOpen(false);
  };

  // Role badge component
  const RoleBadge = ({ role }: { role: string }) => {
    switch (role) {
      case 'admin':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200"><ShieldCheck className="w-3 h-3 mr-1" /> Admin</Badge>;
      case 'publisher':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><Newspaper className="w-3 h-3 mr-1" /> Publisher</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Member</Badge>;
    }
  };

  if (familyLoading || membersLoading) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Skeleton className="h-10 w-64 mb-6" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl font-display">{family?.name} - Members</CardTitle>
                <CardDescription>Manage your family group members and invitations</CardDescription>
              </div>
              {isAdmin && (
                <Button onClick={() => setInviteDialogOpen(true)}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Invite Members
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="approved">
              <TabsList className="mb-6">
                <TabsTrigger value="approved">Approved Members</TabsTrigger>
                {isAdmin && <TabsTrigger value="pending">Pending Requests</TabsTrigger>}
              </TabsList>
              
              <TabsContent value="approved">
                {members?.filter((m: any) => m.isApproved).length === 0 ? (
                  <div className="text-center py-12 bg-primary-50 rounded-lg">
                    <p className="text-primary-600 mb-4">No approved members found.</p>
                    {isAdmin && (
                      <Button onClick={() => setInviteDialogOpen(true)}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Invite Family Members
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {members
                      ?.filter((member: any) => member.isApproved)
                      .map((member: any) => (
                        <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center">
                            <Avatar className="h-10 w-10 mr-4">
                              <AvatarImage src={member.user?.profileImageUrl} />
                              <AvatarFallback>
                                {member.user?.firstName?.charAt(0) || member.user?.email?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-medium text-primary-900">
                                {member.user?.firstName && member.user?.lastName 
                                  ? `${member.user.firstName} ${member.user.lastName}` 
                                  : member.user?.email?.split('@')[0] || 'Family Member'}
                              </h4>
                              <div className="flex items-center mt-1">
                                <RoleBadge role={member.role} />
                                {member.user?.id === user?.id && (
                                  <span className="ml-2 text-xs text-primary-500">(You)</span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {isAdmin && member.user?.id !== user?.id && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem 
                                  onClick={() => 
                                    changeMemberRoleMutation.mutate({ 
                                      memberId: member.id, 
                                      role: member.role === 'admin' ? 'member' : 'admin' 
                                    })
                                  }
                                >
                                  {member.role === 'admin' ? 'Remove Admin Role' : 'Make Admin'}
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => 
                                    changeMemberRoleMutation.mutate({ 
                                      memberId: member.id, 
                                      role: member.role === 'publisher' ? 'member' : 'publisher' 
                                    })
                                  }
                                >
                                  {member.role === 'publisher' ? 'Remove Publisher Role' : 'Make Publisher'}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-red-600" 
                                  onClick={() => removeMemberMutation.mutate(member.id)}
                                >
                                  Remove from Family
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </TabsContent>
              
              {isAdmin && (
                <TabsContent value="pending">
                  {!members?.some((m: any) => !m.isApproved) ? (
                    <div className="text-center py-12 bg-primary-50 rounded-lg">
                      <Clock className="mx-auto h-12 w-12 text-primary-400 mb-4" />
                      <p className="text-primary-600 mb-4">No pending membership requests.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {members
                        ?.filter((member: any) => !member.isApproved)
                        .map((member: any) => (
                          <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg bg-primary-50">
                            <div className="flex items-center">
                              <Avatar className="h-10 w-10 mr-4">
                                <AvatarImage src={member.user?.profileImageUrl} />
                                <AvatarFallback>
                                  {member.user?.firstName?.charAt(0) || member.user?.email?.charAt(0) || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-medium text-primary-900">
                                  {member.user?.firstName && member.user?.lastName 
                                    ? `${member.user.firstName} ${member.user.lastName}` 
                                    : member.user?.email?.split('@')[0] || 'Family Member'}
                                </h4>
                                <p className="text-sm text-primary-500">Requested to join {new Date(member.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                            
                            <div className="flex space-x-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-red-600 border-red-200 hover:bg-red-50"
                                onClick={() => removeMemberMutation.mutate(member.id)}
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Decline
                              </Button>
                              <Button 
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => approveMemberMutation.mutate(member.id)}
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Approve
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </TabsContent>
              )}
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Invite Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Family Members</DialogTitle>
            <DialogDescription>
              Share a link or send an email invitation to your family members.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>Share an invitation link</Label>
              <div className="flex">
                <Input 
                  readOnly 
                  value={inviteLink || generateInviteLink()} 
                  className="rounded-r-none"
                />
                <Button 
                  className="rounded-l-none" 
                  onClick={copyInviteLink}
                >
                  {inviteLinkCopied ? "Copied!" : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-sm text-primary-500">
                Anyone with this link can request to join your family group.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>Send email invitation</Label>
              <div className="flex">
                <Input 
                  type="email" 
                  placeholder="Enter email address" 
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  className="rounded-r-none"
                />
                <Button 
                  className="rounded-l-none bg-accent-600 hover:bg-accent-700" 
                  onClick={sendInviteEmail}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Send
                </Button>
              </div>
              <p className="text-sm text-primary-500">
                We'll send them an email with instructions to join.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setInviteDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
