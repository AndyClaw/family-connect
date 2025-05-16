import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ImageIcon, Users } from "lucide-react";
import { Input } from "@/components/ui/input";

interface NewPostProps {
  familyId: number;
}

export default function NewPost({ familyId }: NewPostProps) {
  const [content, setContent] = useState("");
  const [images, setImages] = useState<FileList | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const createPostMutation = useMutation({
    mutationFn: async ({ content, images, familyId }: { content: string; images: FileList | null; familyId: number }) => {
      setIsSubmitting(true);
      
      const formData = new FormData();
      formData.append("content", content);
      
      if (images) {
        for (let i = 0; i < images.length; i++) {
          formData.append("images", images[i]);
        }
      }
      
      const res = await fetch(`/api/families/${familyId}/posts`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || res.statusText);
      }
      
      return res.json();
    },
    onSuccess: () => {
      setContent("");
      setImages(null);
      queryClient.invalidateQueries({ queryKey: [`/api/families/${familyId}/posts`] });
      toast({
        title: "Success!",
        description: "Your update has been shared with your family.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create post: ${error.message}`,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Please enter some content for your update.",
        variant: "destructive",
      });
      return;
    }
    
    createPostMutation.mutate({ content, images, familyId });
  };

  return (
    <div className="border border-primary-200 rounded-lg p-4 mb-6">
      <h3 className="font-medium text-primary-700 mb-3">Share a Family Update</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <Textarea
            placeholder="What's happening in your life?"
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-3 py-2 border border-primary-300 rounded-md shadow-sm focus:outline-none focus:ring-accent-500 focus:border-accent-500"
          />
        </div>
        
        {images && images.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-primary-600 mb-2">{images.length} image(s) selected</p>
            <div className="flex flex-wrap gap-2">
              {Array.from(images).map((image, index) => (
                <div key={index} className="relative group">
                  <div className="w-16 h-16 bg-primary-100 rounded-md flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-primary-400" />
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded-md flex items-center justify-center">
                    <button
                      type="button"
                      className="opacity-0 group-hover:opacity-100 text-white"
                      onClick={() => {
                        const newFileList = Array.from(images).filter((_, i) => i !== index);
                        const dt = new DataTransfer();
                        newFileList.forEach(file => dt.items.add(file));
                        setImages(dt.files);
                      }}
                    >
                      &times;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <label className="cursor-pointer">
              <Input 
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => setImages(e.target.files)}
              />
              <Button type="button" variant="outline" size="sm">
                <ImageIcon className="mr-2 h-4 w-4" />
                Add Photos
              </Button>
            </label>
            <Button type="button" variant="outline" size="sm" disabled>
              <Users className="mr-2 h-4 w-4" />
              Tag Family
            </Button>
          </div>
          <Button 
            type="submit" 
            disabled={isSubmitting || !content.trim()}
            className="bg-accent-600 hover:bg-accent-700"
          >
            {isSubmitting ? "Sharing..." : "Share Update"}
          </Button>
        </div>
      </form>
    </div>
  );
}
