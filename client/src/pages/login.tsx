import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SiStackoverflow } from 'react-icons/si';
import { login, handleCallback, getUser } from '@/lib/auth';

export default function Login() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (window.location.search.includes('code=')) {
      handleCallback().then(() => {
        setLocation('/feed');
      });
    }

    getUser().then(user => {
      if (user) {
        setLocation('/feed');
      }
    });
  }, [setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
      <Card className="w-[90%] max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <SiStackoverflow className="h-8 w-8 text-primary" />
            StackTok
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-center text-muted-foreground">
            Browse Stack Overflow in style
          </p>
          <div className="space-y-3">
            <Button size="lg" onClick={() => setLocation('/feed')} className="w-full" variant="secondary">
              Continue without signing in
            </Button>
            <Button size="lg" onClick={login} className="w-full">
              Sign in for more features
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}