import { Skeleton } from "@/components/ui/skeleton";
import { 
  RectangleEllipsis, 
  PhoneIcon, 
  HomeIcon, 
  CakeIcon, 
  HeartIcon 
} from "lucide-react";

interface AboutTabProps {
  user: any;
  relationships: any[];
  isLoading: boolean;
}

export default function AboutTab({ user, relationships, isLoading }: AboutTabProps) {
  const formatDateString = (dateString?: string) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric' }).format(date);
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-primary-900 mb-3">Biography</h3>
          <p className="text-primary-700">
            {user.bio || "No biography yet. Update your profile to tell your family about yourself."}
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-primary-900 mb-3">Recent Life Updates</h3>
          {/* This would display life updates from posts or life events */}
          <div className="space-y-4">
            <div className="border-l-4 border-accent-500 pl-4 py-2">
              <p className="text-primary-700">
                {user.firstName 
                  ? `${user.firstName} joined FamilyConnect` 
                  : "Joined FamilyConnect"
                }
              </p>
              <p className="text-sm text-primary-500">
                {new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-primary-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-primary-900 mb-3">Contact Information</h3>
          <ul className="space-y-2">
            <li className="flex items-center text-primary-700">
              <RectangleEllipsis className="w-5 h-5 mr-2 text-primary-500" />
              <span>{user.email || "No email address"}</span>
            </li>
            <li className="flex items-center text-primary-700">
              <PhoneIcon className="w-5 h-5 mr-2 text-primary-500" />
              <span>{user.phoneNumber || "No phone number"}</span>
            </li>
            <li className="flex items-center text-primary-700">
              <HomeIcon className="w-5 h-5 mr-2 text-primary-500" />
              <span>{user.address || "No address"}</span>
            </li>
          </ul>
          <div className="mt-2 pt-2 border-t border-primary-200">
            <p className="text-xs text-primary-500">Contact info visible to: Family Members</p>
          </div>
        </div>

        <div className="bg-primary-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-primary-900 mb-3">Key Dates</h3>
          <ul className="space-y-2">
            <li className="flex items-center text-primary-700">
              <CakeIcon className="w-5 h-5 mr-2 text-warmth-500" />
              <div>
                <span>Birthday: {formatDateString(user.birthday) || "Not set"}</span>
                {user.birthday && (
                  <span className="block text-xs text-primary-500">
                    Age: {new Date().getFullYear() - new Date(user.birthday).getFullYear()}
                  </span>
                )}
              </div>
            </li>
          </ul>
        </div>

        <div className="bg-primary-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-primary-900 mb-3">Family Connections</h3>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
            </div>
          ) : relationships && relationships.length > 0 ? (
            <ul className="space-y-2">
              {relationships.map((relationship: any) => (
                <li key={relationship.id} className="text-primary-700">
                  <span>
                    {relationship.relationshipType.charAt(0).toUpperCase() + relationship.relationshipType.slice(1)} to {relationship.relatedUser.firstName} {relationship.relatedUser.lastName}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-primary-600">No family connections added yet.</p>
          )}
          <button className="mt-2 text-sm text-accent-600 hover:text-accent-700">
            Edit Family Connections
          </button>
        </div>
      </div>
    </div>
  );
}
