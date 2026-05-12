"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Menu, Check } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import { formatDistanceToNow } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export function Navbar() {
  const { data: session } = useSession();
  const { notifications, markAsRead, isLoading } = useNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <nav className="sticky top-0 z-40 w-full border-b bg-white">
      <div className="flex h-16 items-center px-4 md:px-6">
        <div className="flex items-center gap-2 md:gap-4">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary">Preschool M&E</span>
          </Link>
        </div>

        <div className="ml-auto flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger
              data-slot="dropdown-menu-trigger"
              className="relative h-10 w-10 flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute right-2 top-2 flex h-2 w-2 rounded-full bg-destructive"></span>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80" align="end">
              <DropdownMenuLabel className="font-bold flex items-center justify-between">
                Notifications
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="text-[10px]">
                    {unreadCount} New
                  </Badge>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <ScrollArea style={{ height: 300 }}>
                {isLoading ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    Loading notifications...
                  </div>
                ) : notifications.length > 0 ? (
                  notifications.map((n) => (
                    <DropdownMenuItem
                      key={n.id}
                      className={`flex flex-col items-start p-4 space-y-1 cursor-default focus:bg-accent ${
                        !n.read ? "bg-accent/30" : ""
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        markAsRead(n.id);
                      }}
                    >
                      <div className="flex w-full items-center justify-between">
                        <span className={`text-sm font-semibold ${!n.read ? "text-primary" : ""}`}>
                          {n.title}
                        </span>
                        {!n.read && <Check className="h-3 w-3 text-primary" />}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {n.message}
                      </p>
                      <span className="text-[10px] text-muted-foreground pt-1">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </span>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    No notifications
                  </div>
                )}
              </ScrollArea>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger
              data-slot="dropdown-menu-trigger"
              className="relative h-8 w-8 rounded-full hover:bg-accent hover:text-accent-foreground outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src="" alt={session?.user?.name || "User"} />
                <AvatarFallback>
                  {session?.user?.name?.split(" ").map((n) => n[0]).join("") || "U"}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{session?.user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {session?.user?.email}
                  </p>
                  <p className="text-xs font-bold text-primary mt-1">
                    {session?.user?.role}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
