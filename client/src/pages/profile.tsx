import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { getUser, logout } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  LogOut, 
  User, 
  Mail, 
  ArrowBigUp,
  MessageCircle 
} from 'lucide-react';
import { SiStackoverflow } from 'react-icons/si';

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
        setLocation('/');
        return;
      }
      setUser(userData);
    };

    fetchUser();
  }, [setLocation]);

  const handleLogout = async () => {
    await logout();
    setLocation('/');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="mx-auto max-w-md">
          <CardHeader className="text-center">
            <div className="mb-4 flex justify-center">
              <Avatar className="h-24 w-24">
                {user.picture ? (
                  <AvatarImage src={user.picture} alt={user.name} />
                ) : (
                  <AvatarFallback className="text-2xl">
                    {user.name?.[0]?.toUpperCase() || '?'}
                  </AvatarFallback>
                )}
              </Avatar>
            </div>
            <CardTitle className="text-2xl font-bold">{user.name}</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* User Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-muted-foreground">
                <User className="h-5 w-5" />
                <span>{user.name}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Mail className="h-5 w-5" />
                <span>{user.email}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <ArrowBigUp className="mx-auto h-6 w-6 text-primary" />
                  <p className="mt-2 text-2xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">Votes</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <MessageCircle className="mx-auto h-6 w-6 text-primary" />
                  <p className="mt-2 text-2xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">Comments</p>
                </CardContent>
              </Card>
            </div>

            {/* App Info */}
            <div className="rounded-lg bg-muted p-4">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <SiStackoverflow className="h-4 w-4" />
                <span>StackTok v1.0.0</span>
              </div>
            </div>

            {/* Logout Button */}
            <Button 
              variant="destructive" 
              className="w-full"
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
