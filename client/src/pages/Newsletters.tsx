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
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Newspaper, 
  Send, 
  Plus, 
  Clock, 
  Calendar, 
  Check, 
  Edit, 
  Eye 
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

interface NewslettersProps {
  familyId: number;
}

export default function Newsletters({ familyId }: NewslettersProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingNewsletter, setEditingNewsletter] = useState<any>(null);
  const [newsletterTitle, setNewsletterTitle] = useState("");
  const [newsletterContent, setNewsletterContent] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  const [selectedPosts, setSelectedPosts] = useState<number[]>([]);

  // Fetch family details
  const { data: family, isLoading: familyLoading } = useQuery({
    queryKey: [`/api/families/${familyId}`],
  });

  // Fetch family members
  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: [`/api/families/${familyId}/members`],
  });

  // Fetch newsletters
  const { data: newsletters, isLoading: newslettersLoading } = useQuery({
    queryKey: [`/api/families/${familyId}/newsletters`],
  });

  // Fetch posts for inclusion in newsletter
  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: [`/api/families/${familyId}/posts`, { limit: 20 }],
  });

  // Check if the current user can create newsletters
  const isPublisher = members?.some((member: any) => 
    member.userId === user?.id && (member.role === 'admin' || member.role === 'publisher')
  );

  // Create newsletter mutation
  const createNewsletterMutation = useMutation({
    mutationFn: async (data: { title: string; content: string; includedPostIds: number[] }) => {
      return await apiRequest("POST", `/api/families/${familyId}/newsletters`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/families/${familyId}/newsletters`] });
      toast({
        title: "Newsletter created",
        description: "Your newsletter has been created and saved as a draft.",
      });
      resetForm();
      setCreateDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create newsletter: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Send newsletter mutation
  const sendNewsletterMutation = useMutation({
    mutationFn: async (newsletterId: number) => {
      return await apiRequest("POST", `/api/newsletters/${newsletterId}/send`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/families/${familyId}/newsletters`] });
      toast({
        title: "Newsletter sent",
        description: "Your newsletter has been sent to all family members.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to send newsletter: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setNewsletterTitle("");
    setNewsletterContent("");
    setSelectedPosts([]);
    setPreviewMode(false);
    setEditingNewsletter(null);
  };

  const handleCreateNewsletter = () => {
    if (!newsletterTitle.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title for your newsletter.",
        variant: "destructive",
      });
      return;
    }

    if (!newsletterContent.trim()) {
      toast({
        title: "Error",
        description: "Please enter some content for your newsletter.",
        variant: "destructive",
      });
      return;
    }

    createNewsletterMutation.mutate({
      title: newsletterTitle,
      content: newsletterContent,
      includedPostIds: selectedPosts
    });
  };

  const handlePostSelection = (postId: number) => {
    setSelectedPosts(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId) 
        : [...prev, postId]
    );
  };

  const handleSendNewsletter = (newsletterId: number) => {
    sendNewsletterMutation.mutate(newsletterId);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMMM d, yyyy");
    } catch (e) {
      return "Unknown date";
    }
  };

  if (familyLoading || membersLoading || newslettersLoading) {
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
                <CardTitle className="text-2xl font-display">{family?.name} - Newsletters</CardTitle>
                <CardDescription>Create and manage family newsletters</CardDescription>
              </div>
              {isPublisher && (
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Newsletter
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList className="mb-6">
                <TabsTrigger value="all">All Newsletters</TabsTrigger>
                <TabsTrigger value="drafts">Drafts</TabsTrigger>
                <TabsTrigger value="sent">Sent</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all">
                {!newsletters || newsletters.length === 0 ? (
                  <div className="text-center py-12 bg-primary-50 rounded-lg">
                    <Newspaper className="mx-auto h-12 w-12 text-primary-400 mb-4" />
                    <p className="text-primary-600 mb-4">No newsletters have been created yet.</p>
                    {isPublisher && (
                      <Button onClick={() => setCreateDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Your First Newsletter
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {newsletters.map((newsletter: any) => (
                      <Card key={newsletter.id} className="overflow-hidden">
                        <div className="h-3 bg-accent-500"></div>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-medium text-primary-900 line-clamp-1">{newsletter.title}</h3>
                            <Badge variant="outline" className={newsletter.isSent ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}>
                              {newsletter.isSent ? <Check className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                              {newsletter.isSent ? "Sent" : "Draft"}
                            </Badge>
                          </div>
                          <p className="text-sm text-primary-500 mb-3 flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDate(newsletter.createdAt)}
                          </p>
                          <div className="h-24 overflow-hidden text-ellipsis">
                            <div className="text-sm text-primary-600 line-clamp-4" dangerouslySetInnerHTML={{ __html: newsletter.content }} />
                          </div>
                          
                          {isPublisher && (
                            <div className="flex mt-4 space-x-2">
                              <Button variant="outline" size="sm" className="flex-1">
                                <Eye className="mr-2 h-3 w-3" />
                                View
                              </Button>
                              {!newsletter.isSent && (
                                <Button 
                                  size="sm" 
                                  className="flex-1 bg-accent-600 hover:bg-accent-700"
                                  onClick={() => handleSendNewsletter(newsletter.id)}
                                >
                                  <Send className="mr-2 h-3 w-3" />
                                  Send
                                </Button>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="drafts">
                {!newsletters || !newsletters.some((n: any) => !n.isSent) ? (
                  <div className="text-center py-12 bg-primary-50 rounded-lg">
                    <Newspaper className="mx-auto h-12 w-12 text-primary-400 mb-4" />
                    <p className="text-primary-600 mb-4">No draft newsletters available.</p>
                    {isPublisher && (
                      <Button onClick={() => setCreateDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Newsletter
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {newsletters
                      .filter((n: any) => !n.isSent)
                      .map((newsletter: any) => (
                        <Card key={newsletter.id} className="overflow-hidden">
                          <div className="h-3 bg-yellow-500"></div>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-medium text-primary-900 line-clamp-1">{newsletter.title}</h3>
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                                <Clock className="w-3 h-3 mr-1" />
                                Draft
                              </Badge>
                            </div>
                            <p className="text-sm text-primary-500 mb-3 flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {formatDate(newsletter.createdAt)}
                            </p>
                            <div className="h-24 overflow-hidden text-ellipsis">
                              <div className="text-sm text-primary-600 line-clamp-4" dangerouslySetInnerHTML={{ __html: newsletter.content }} />
                            </div>
                            
                            {isPublisher && (
                              <div className="flex mt-4 space-x-2">
                                <Button variant="outline" size="sm" className="flex-1">
                                  <Edit className="mr-2 h-3 w-3" />
                                  Edit
                                </Button>
                                <Button 
                                  size="sm" 
                                  className="flex-1 bg-accent-600 hover:bg-accent-700"
                                  onClick={() => handleSendNewsletter(newsletter.id)}
                                >
                                  <Send className="mr-2 h-3 w-3" />
                                  Send
                                </Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="sent">
                {!newsletters || !newsletters.some((n: any) => n.isSent) ? (
                  <div className="text-center py-12 bg-primary-50 rounded-lg">
                    <Newspaper className="mx-auto h-12 w-12 text-primary-400 mb-4" />
                    <p className="text-primary-600 mb-4">No newsletters have been sent yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {newsletters
                      .filter((n: any) => n.isSent)
                      .map((newsletter: any) => (
                        <Card key={newsletter.id} className="overflow-hidden">
                          <div className="h-3 bg-green-500"></div>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-medium text-primary-900 line-clamp-1">{newsletter.title}</h3>
                              <Badge variant="outline" className="bg-green-50 text-green-700">
                                <Check className="w-3 h-3 mr-1" />
                                Sent
                              </Badge>
                            </div>
                            <p className="text-sm text-primary-500 mb-3 flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {formatDate(newsletter.sentAt || newsletter.createdAt)}
                            </p>
                            <div className="h-24 overflow-hidden text-ellipsis">
                              <div className="text-sm text-primary-600 line-clamp-4" dangerouslySetInnerHTML={{ __html: newsletter.content }} />
                            </div>
                            
                            <div className="flex mt-4">
                              <Button variant="outline" size="sm" className="w-full">
                                <Eye className="mr-2 h-3 w-3" />
                                View Newsletter
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Create Newsletter Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={(open) => {
        setCreateDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingNewsletter ? "Edit Newsletter" : "Create New Newsletter"}</DialogTitle>
            <DialogDescription>
              Create a beautiful newsletter to share updates with your family.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">{previewMode ? "Preview" : "Editor"}</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPreviewMode(!previewMode)}
              >
                {previewMode ? <Edit className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                {previewMode ? "Switch to Editor" : "Preview"}
              </Button>
            </div>
            
            {!previewMode ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="title">Newsletter Title</Label>
                  <Input 
                    id="title" 
                    placeholder="e.g., Family Updates - August 2023" 
                    value={newsletterTitle}
                    onChange={(e) => setNewsletterTitle(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="template">Template</Label>
                  <Select defaultValue="standard">
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard Newsletter</SelectItem>
                      <SelectItem value="family-event">Family Event Special</SelectItem>
                      <SelectItem value="holiday">Holiday Edition</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="content">Newsletter Content</Label>
                  <Textarea 
                    id="content" 
                    placeholder="Write the content of your newsletter here..." 
                    rows={10}
                    value={newsletterContent}
                    onChange={(e) => setNewsletterContent(e.target.value)}
                  />
                  <p className="text-xs text-primary-500">
                    You can use HTML formatting in your newsletter.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>Include Family Updates</Label>
                  {postsLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                  ) : posts && posts.length > 0 ? (
                    <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-2">
                      {posts.map((post: any) => (
                        <div 
                          key={post.id} 
                          className={`p-3 border rounded-md cursor-pointer ${
                            selectedPosts.includes(post.id) ? 'border-accent-500 bg-accent-50' : ''
                          }`}
                          onClick={() => handlePostSelection(post.id)}
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-primary-900 font-medium line-clamp-1">{post.content}</p>
                            <input 
                              type="checkbox" 
                              checked={selectedPosts.includes(post.id)} 
                              onChange={() => {}} 
                              className="h-4 w-4 text-accent-600 focus:ring-accent-500 border-primary-300 rounded"
                            />
                          </div>
                          <p className="text-xs text-primary-500">{formatDate(post.createdAt)}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-primary-500 italic">No family updates available to include.</p>
                  )}
                </div>
              </>
            ) : (
              <div className="border rounded-lg p-6 bg-white">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-primary-900">{newsletterTitle || "Newsletter Title"}</h2>
                  <p className="text-primary-500">{formatDate(new Date().toISOString())}</p>
                </div>
                
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: newsletterContent || "<p>Newsletter content will appear here.</p>" }} />
                
                {selectedPosts.length > 0 && (
                  <div className="mt-6 pt-6 border-t">
                    <h3 className="text-lg font-medium mb-4">Recent Family Updates</h3>
                    <div className="space-y-4">
                      {posts
                        ?.filter((post: any) => selectedPosts.includes(post.id))
                        .map((post: any) => (
                          <div key={post.id} className="p-4 border rounded-md bg-primary-50">
                            <p className="text-primary-800">{post.content}</p>
                            <p className="text-xs text-primary-500 mt-2">{formatDate(post.createdAt)}</p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                resetForm();
                setCreateDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button 
              className="bg-accent-600 hover:bg-accent-700"
              onClick={handleCreateNewsletter}
              disabled={createNewsletterMutation.isPending}
            >
              {createNewsletterMutation.isPending ? "Creating..." : "Save Newsletter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
