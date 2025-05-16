import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageIcon } from "lucide-react";

// Form schema for creating a family
const familyFormSchema = z.object({
  name: z.string().min(1, "Family name is required"),
  description: z.string().optional(),
  coverImageUrl: z.string().optional(),
});

type FamilyFormValues = z.infer<typeof familyFormSchema>;

export default function CreateFamily() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const form = useForm<FamilyFormValues>({
    resolver: zodResolver(familyFormSchema),
    defaultValues: {
      name: "",
      description: "",
      coverImageUrl: "",
    },
  });

  const createFamilyMutation = useMutation({
    mutationFn: async (data: FamilyFormValues) => {
      // In a real implementation, we would upload the image first and then
      // include the URL in the family creation request
      return await apiRequest("POST", "/api/families", data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/families"] });
      toast({
        title: "Family created",
        description: "Your family group has been successfully created.",
      });
      navigate("/dashboard");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create family: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FamilyFormValues) => {
    // Here we would handle uploading the image file if selected
    createFamilyMutation.mutate(data);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-display">Create a Family Group</CardTitle>
          <CardDescription>
            Start a private space for your family to connect and share updates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Family Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., The Smith Family" {...field} />
                    </FormControl>
                    <FormDescription>
                      This will be displayed as the title of your family group.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Tell us about your family" 
                        className="min-h-24"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      A brief description of your family that will be shown to members.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>Cover Image</FormLabel>
                <div className="mt-1 flex items-center">
                  {imagePreview ? (
                    <div className="relative w-full">
                      <img 
                        src={imagePreview} 
                        alt="Cover preview" 
                        className="h-48 w-full object-cover rounded-md"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        className="absolute top-2 right-2 bg-white"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <label className="w-full flex flex-col items-center justify-center h-48 border-2 border-dashed border-primary-300 rounded-md cursor-pointer hover:bg-primary-50">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <ImageIcon className="h-12 w-12 text-primary-400 mb-3" />
                        <p className="text-sm text-primary-600">
                          Click to upload a cover image for your family group
                        </p>
                        <p className="text-xs text-primary-500 mt-1">(Optional)</p>
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                  )}
                </div>
                <FormDescription>
                  This image will appear at the top of your family group page.
                </FormDescription>
              </div>

              <div className="flex justify-end space-x-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate("/dashboard")}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createFamilyMutation.isPending}
                  className="bg-accent-600 hover:bg-accent-700"
                >
                  {createFamilyMutation.isPending ? "Creating..." : "Create Family Group"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
