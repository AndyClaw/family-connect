import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { PencilIcon } from "lucide-react";

interface ProfileHeaderProps {
  user: any;
}

export default function ProfileHeader({ user }: ProfileHeaderProps) {
  // Default cover photo
  const coverPhoto = "https://images.unsplash.com/photo-1542037104857-ffbb0b9155fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1500&h=300";

  return (
    <div className="relative">
      <div className="h-48 w-full relative">
        <img className="h-48 w-full object-cover rounded-t-lg" src={coverPhoto} alt="Profile cover photo" />
      </div>
      <div className="absolute bottom-0 transform translate-y-1/2 left-8">
        <div className="h-32 w-32 rounded-full border-4 border-white overflow-hidden">
          {user.profileImageUrl ? (
            <img 
              className="h-full w-full object-cover" 
              src={user.profileImageUrl} 
              alt={`${user.firstName || 'User'}'s profile picture`}
            />
          ) : (
            <div className="h-full w-full bg-accent-100 flex items-center justify-center">
              <span className="text-4xl font-bold text-accent-600">
                {user.firstName?.charAt(0) || user.email?.charAt(0) || "U"}
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="mt-16 px-8">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-display font-bold text-primary-900">
              {user.firstName && user.lastName 
                ? `${user.firstName} ${user.lastName}` 
                : user.email?.split('@')[0] || 'Family Member'}
            </h2>
            <p className="text-primary-600">
              {user.address ? `${user.address} • ` : ''}
              Joined {new Date(user.createdAt).toLocaleDateString() || 'recently'}
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/profile/edit">
              <a className="flex items-center">
                <PencilIcon className="mr-2 h-4 w-4" />
                Edit Profile
              </a>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
