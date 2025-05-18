import { Link, useLocation } from "wouter";
import { 
  Newspaper, 
  Users, 
  FileText, 
  Settings,
  PlusCircle,
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useState } from "react";

export default function BottomNav() {
  const [location] = useLocation();
  const [newPostDialogOpen, setNewPostDialogOpen] = useState(false);
  
  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="grid grid-cols-5 h-16">
          {/* News Feed */}
          <Link href="/feed">
            <a className={cn(
              "flex flex-col items-center justify-center space-y-1",
              location === "/feed" 
                ? "text-accent-500" 
                : "text-gray-500 hover:text-accent-400"
            )}>
              <Newspaper className="h-6 w-6" />
              <span className="text-xs">Feed</span>
            </a>
          </Link>
          
          {/* People */}
          <Link href="/people">
            <a className={cn(
              "flex flex-col items-center justify-center space-y-1",
              location === "/people" 
                ? "text-accent-500" 
                : "text-gray-500 hover:text-accent-400"
            )}>
              <Users className="h-6 w-6" />
              <span className="text-xs">People</span>
            </a>
          </Link>
          
          {/* Create Post Button */}
          <div className="flex items-center justify-center -mt-5">
            <Dialog open={newPostDialogOpen} onOpenChange={setNewPostDialogOpen}>
              <DialogTrigger asChild>
                <Button size="icon" className="h-14 w-14 rounded-full bg-accent-500 hover:bg-accent-600">
                  <PlusCircle className="h-8 w-8" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create a New Post</DialogTitle>
                  <VisuallyHidden>
                    <DialogDescription>
                      Share an update with your family
                    </DialogDescription>
                  </VisuallyHidden>
                </DialogHeader>
                <div className="p-4">
                  {/* This will be replaced with the NewPost component */}
                  <p>Create post form will go here</p>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Events Calendar */}
          <Link href="/events">
            <a className={cn(
              "flex flex-col items-center justify-center space-y-1",
              location === "/events" 
                ? "text-accent-500" 
                : "text-gray-500 hover:text-accent-400"
            )}>
              <Calendar className="h-6 w-6" />
              <span className="text-xs">Events</span>
            </a>
          </Link>
          
          {/* Settings */}
          <Link href="/settings">
            <a className={cn(
              "flex flex-col items-center justify-center space-y-1",
              location === "/settings" 
                ? "text-accent-500" 
                : "text-gray-500 hover:text-accent-400"
            )}>
              <Settings className="h-6 w-6" />
              <span className="text-xs">Settings</span>
            </a>
          </Link>
        </div>
      </nav>
      
      {/* Add padding at the bottom for mobile to account for the bottom nav */}
      <div className="md:hidden h-16" />
    </>
  );
}