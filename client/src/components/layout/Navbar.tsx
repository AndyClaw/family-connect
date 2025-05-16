import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BellIcon, MenuIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

export default function Navbar() {
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <span className="text-2xl font-display font-bold text-warmth-500 cursor-pointer">
                  Family News and Views
                </span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard">
                    <a className={`${location === '/dashboard' ? 'border-accent-500 text-primary-900' : 'border-transparent text-primary-500 hover:border-primary-300 hover:text-primary-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                      Home
                    </a>
                  </Link>
                  <Link href="/profile">
                    <a className={`${location === '/profile' ? 'border-accent-500 text-primary-900' : 'border-transparent text-primary-500 hover:border-primary-300 hover:text-primary-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                      My Profile
                    </a>
                  </Link>
                </>
              ) : (
                <Link href="/">
                  <a className={`${location === '/' ? 'border-accent-500 text-primary-900' : 'border-transparent text-primary-500 hover:border-primary-300 hover:text-primary-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                    Home
                  </a>
                </Link>
              )}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Button variant="ghost" size="icon" className="text-primary-400 hover:text-primary-500">
                  <BellIcon className="h-5 w-5" />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="h-8 w-8 cursor-pointer">
                      <AvatarImage src={user?.profileImageUrl} />
                      <AvatarFallback>
                        {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <a className="cursor-pointer w-full">Profile</a>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">
                        <a className="cursor-pointer w-full">Dashboard</a>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <a href="/api/logout" className="cursor-pointer w-full text-red-500">
                        Log out
                      </a>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button asChild>
                <a href="/api/login">
                  Log In
                </a>
              </Button>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-primary-400 hover:text-primary-500">
                  <MenuIcon className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col space-y-4 mt-6">
                  {isAuthenticated ? (
                    <>
                      <div className="flex items-center space-x-4 mb-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user?.profileImageUrl} />
                          <AvatarFallback>
                            {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.email || 'User'}
                          </p>
                        </div>
                      </div>
                      <Link href="/dashboard">
                        <a className="py-2 text-primary-700 hover:text-primary-900 font-medium" onClick={() => setMobileMenuOpen(false)}>
                          Home
                        </a>
                      </Link>
                      <Link href="/profile">
                        <a className="py-2 text-primary-700 hover:text-primary-900 font-medium" onClick={() => setMobileMenuOpen(false)}>
                          My Profile
                        </a>
                      </Link>
                      <div className="pt-4 mt-4 border-t border-gray-200">
                        <a href="/api/logout" className="py-2 text-red-500 hover:text-red-700 font-medium">
                          Log out
                        </a>
                      </div>
                    </>
                  ) : (
                    <>
                      <Link href="/">
                        <a className="py-2 text-primary-700 hover:text-primary-900 font-medium" onClick={() => setMobileMenuOpen(false)}>
                          Home
                        </a>
                      </Link>
                      <div className="pt-4 mt-4">
                        <Button asChild className="w-full">
                          <a href="/api/login">
                            Log In
                          </a>
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
