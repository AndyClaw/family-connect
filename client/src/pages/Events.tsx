import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Calendar as CalendarIcon, 
  Plus,
  Clock
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Events() {
  const { user } = useAuth();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedFamilyId, setSelectedFamilyId] = useState<string>("all");
  
  const { data: families, isLoading: familiesLoading } = useQuery({
    queryKey: ["/api/families"]
  });

  // This would fetch all events across all families
  const { data: allEvents, isLoading: eventsLoading } = useQuery({
    queryKey: ["/api/events/all"],
    // This might need a custom endpoint in the backend
    enabled: false // Disable until we create the endpoint
  });

  // For now, we'll simulate upcoming events for display purposes
  const upcomingEvents = [
    {
      id: 1,
      title: "Family Reunion",
      date: new Date(2025, 6, 15), // July 15, 2025
      location: "Central Park, New York",
      description: "Annual family gathering with games and barbecue",
      familyId: 1
    },
    {
      id: 2,
      title: "Sarah's Graduation",
      date: new Date(2025, 5, 10), // June 10, 2025
      location: "State University",
      description: "Sarah's college graduation ceremony",
      familyId: 1
    },
    {
      id: 3,
      title: "Dad's 60th Birthday",
      date: new Date(2025, 8, 22), // September 22, 2025
      location: "Olive Garden Restaurant",
      description: "Surprise birthday dinner for Dad",
      familyId: 1
    }
  ];
  
  const filteredEvents = selectedFamilyId === "all" 
    ? upcomingEvents 
    : upcomingEvents.filter(event => event.familyId.toString() === selectedFamilyId);
  
  if (familiesLoading || eventsLoading) {
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
      <header className="mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Events Calendar</h1>
            <p className="text-muted-foreground mt-2">
              Keep track of important family events and celebrations
            </p>
          </div>
          <Button asChild>
            <Link href="/event/create">
              <Plus className="mr-2 h-4 w-4" />
              Add New Event
            </Link>
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
        <div className="col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <CalendarIcon className="mr-2 h-5 w-5" />
                Calendar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border mx-auto"
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Select
                value={selectedFamilyId}
                onValueChange={setSelectedFamilyId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by family" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Families</SelectItem>
                  {families?.map((family: any) => (
                    <SelectItem key={family.id} value={family.id.toString()}>
                      {family.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardFooter>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
              <TabsTrigger value="past">Past Events</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upcoming">
              {filteredEvents.length === 0 ? (
                <div className="text-center p-12 border rounded-lg bg-muted/10">
                  <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No upcoming events</h3>
                  <p className="text-muted-foreground mb-4">
                    There are no upcoming events scheduled.
                  </p>
                  <Button asChild>
                    <Link href="/event/create">Create an Event</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredEvents.map((event) => (
                    <Card key={event.id} className="shadow-sm hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <CardTitle>{event.title}</CardTitle>
                        <div className="flex items-center text-muted-foreground">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          <span>{format(event.date, 'MMMM d, yyyy')}</span>
                          <Clock className="ml-4 mr-2 h-4 w-4" />
                          <span>{format(event.date, 'h:mm a')}</span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-2">
                          Location: {event.location}
                        </p>
                        <p className="text-sm">{event.description}</p>
                      </CardContent>
                      <CardFooter>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/event/${event.id}`}>
                            View Details
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="past">
              <div className="text-center p-12 border rounded-lg bg-muted/10">
                <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No past events</h3>
                <p className="text-muted-foreground">
                  Past events will appear here once events have occurred.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}