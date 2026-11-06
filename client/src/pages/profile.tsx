import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { getUser, logout } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  LogOut,
  User,
  Mail,
  ArrowBigUp,
  MessageCircle,
  Zap,
  Bookmark,
} from "lucide-react";
import { SiStackoverflow } from "react-icons/si";
import { cn } from "@/lib/utils";

interface UserProfile {
  name?: string;
  email?: string;
  picture?: string;
}

export default function Profile() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await getUser();
      if (!userData) {
        setLocation("/");
        return;
      }
      setUser(userData);
    };

    fetchUser();
  }, [setLocation]);

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  if (!user) {
    return null;
  }

  const initials = user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

  const stats = [
    {
      icon: ArrowBigUp,
      label: "Votes",
      value: "0",
      color: "text-primary shadow-primary/25",
      bg: "bg-primary/10",
    },
    {
      icon: MessageCircle,
      label: "Comments",
      value: "0",
      color: "text-accent shadow-accent/25",
      bg: "bg-accent/10",
    },
    {
      icon: Zap,
      label: "Activity",
      value: "0",
      color: "text-yellow-400 shadow-yellow-500/25",
      bg: "bg-yellow-500/10",
    },
    {
      icon: Bookmark,
      label: "Bookmarks",
      value: "0",
      color: "text-cyan-400 shadow-cyan-500/25",
      bg: "bg-cyan-500/10",
    },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden px-4 sm:px-6 pb-12">
      <BackgroundBlobs />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-md mx-auto"
      >
        <Card className="glass rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
          <CardHeader className="bg-transparent text-center pb-8 pt-8">
            <div className="flex justify-center mb-4">
              <div
                className={cn(
                  "relative w-24 h-24 rounded-full flex items-center justify-center",
                  "bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30 ring-4 ring-white/10"
                )}
              >
                <Avatar className="w-22 h-22 border-2 border-white/5">
                  {user.picture ? (
                    <AvatarImage src={user.picture} alt={user.name} />
                  ) : (
                    <AvatarFallback className="text-xl font-bold text-foreground">
                      {initials}
                    </AvatarFallback>
                  )}
                </Avatar>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              {user.name}
            </CardTitle>
            <p className="text-muted-foreground/70 text-sm mt-2">
              {user.email || "No email"}
            </p>
          </CardHeader>

          <CardContent className="space-y-6 px-8 pb-8">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat) => (
                <Card
                  key={stat.label}
                  className={cn(
                    "rounded-2xl p-4 glass border border-white/5",
                    stat.bg
                  )}
                >
                  <CardContent className="p-0 text-center">
                    <div
                      className={cn(
                        "mx-auto w-8 h-8 rounded-xl flex items-center justify-center mb-2",
                        stat.color
                      )}
                    >
                      <stat.icon className="h-4 w-4" />
                    </div>
                    <p className="text-xs font-semibold text-foreground">{stat.value}</p>
                    <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">
                      {stat.label}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* App Info */}
            <div className="rounded-2xl bg-accent-muted/50 p-5 border border-white/5">
              <div className="flex items-center justify-center gap-2.5 text-sm text-muted-foreground/70">
                <SiStackoverflow className="h-4 w-4 text-primary" />
                <span>StackScroll v1.1.0</span>
              </div>
            </div>

            {/* Logout Button */}
            <Button
              variant="destructive"
              className={cn(
                "w-full rounded-xl shadow-lg hover:-translate-y-0.5 transition-all",
                "bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20"
              )}
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
