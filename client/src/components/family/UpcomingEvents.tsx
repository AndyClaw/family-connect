import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface UpcomingEventsProps {
  familyId: number;
}

export default function UpcomingEvents({ familyId }: UpcomingEventsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [createEventOpen, setCreateEventOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventType, setEventType] = useState("birthday");
  const [eventDescription, setEventDescription] = useState("");

  // Fetch upcoming events
  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: [`/api/families/${familyId}/upcoming-events`],
  });

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: async (data: { title: string; eventDate: string; eventType: string; description: string }) => {
      return await apiRequest("POST", `/api/families/${familyId}/events`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/families/${familyId}/upcoming-events`] });
      toast({
        title: "Event created",
        description: "Your event has been added to the family calendar.",
      });
      resetForm();
      setCreateEventOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create event: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setEventTitle("");
    setEventDate("");
    setEventType("birthday");
    setEventDescription("");
  };

  const handleCreateEvent = () => {
    if (!eventTitle.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title for the event.",
        variant: "destructive",
      });
      return;
    }

    if (!eventDate) {
      toast({
        title: "Error",
        description: "Please select a date for the event.",
        variant: "destructive",
      });
      return;
    }

    createEventMutation.mutate({
      title: eventTitle,
      eventDate,
      eventType,
      description: eventDescription
    });
  };

  // Function to get days until event
  const getDaysUntil = (dateString: string) => {
    const eventDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  // Function to get icon for event type
  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'birthday':
        return (
          <div className="bg-warmth-500 rounded-full w-10 h-10 flex items-center justify-center text-white mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
            </svg>
          </div>
        );
      case 'anniversary':
        return (
          <div className="bg-accent-100 rounded-full w-10 h-10 flex items-center justify-center text-accent-600 mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
        );
      case 'graduation':
        return (
          <div className="bg-accent-100 rounded-full w-10 h-10 flex items-center justify-center text-accent-600 mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M12 14l9-5-9-5-9 5 9 5z" />
              <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="bg-accent-100 rounded-full w-10 h-10 flex items-center justify-center text-accent-600 mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        );
    }
  };

  if (eventsLoading) {
    return (
      <Card className="bg-white rounded-lg shadow mb-6">
        <CardContent className="p-6">
          <Skeleton className="h-8 w-40 mb-4" />
          <div className="space-y-3">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white rounded-lg shadow mb-6">
      <CardContent className="p-6">
        <h3 className="text-xl font-display font-bold text-primary-900 mb-4">Upcoming Family Events</h3>
        
        {events && events.length > 0 ? (
          <ul className="space-y-3">
            {events.map((event: any) => {
              const daysUntil = getDaysUntil(event.eventDate);
              const isHighlighted = daysUntil <= 7;
              
              return (
                <li 
                  key={event.id} 
                  className={`flex items-center p-2 rounded-md ${isHighlighted ? 'bg-warmth-100' : ''}`}
                >
                  {getEventIcon(event.eventType)}
                  <div>
                    <p className="text-primary-900 font-medium">{event.title}</p>
                    <p className="text-sm text-primary-600">
                      {new Date(event.eventDate).toLocaleDateString()} ({daysUntil} day{daysUntil !== 1 ? 's' : ''})
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="text-center py-6 bg-primary-50 rounded-lg mb-4">
            <p className="text-primary-600 mb-4">No upcoming events.</p>
          </div>
        )}
        
        <div className="border-t border-primary-200 mt-4 pt-4">
          <Button 
            variant="ghost" 
            className="w-full text-accent-600 hover:text-accent-700 hover:bg-accent-50"
            onClick={() => setCreateEventOpen(true)}
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Family Event
          </Button>
        </div>
      </CardContent>

      {/* Create Event Dialog */}
      <Dialog open={createEventOpen} onOpenChange={setCreateEventOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a Family Event</DialogTitle>
            <DialogDescription>
              Create a new event to add to your family calendar.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title</Label>
              <Input 
                id="title" 
                placeholder="e.g., Mom's Birthday" 
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">Event Date</Label>
              <Input 
                id="date" 
                type="date" 
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Event Type</Label>
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="birthday">Birthday</SelectItem>
                  <SelectItem value="anniversary">Anniversary</SelectItem>
                  <SelectItem value="graduation">Graduation</SelectItem>
                  <SelectItem value="other">Other Celebration</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input 
                id="description" 
                placeholder="Add any additional details" 
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                resetForm();
                setCreateEventOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button 
              className="bg-accent-600 hover:bg-accent-700"
              onClick={handleCreateEvent}
              disabled={createEventMutation.isPending}
            >
              {createEventMutation.isPending ? "Adding..." : "Add Event"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
