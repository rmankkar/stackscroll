import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SiStackoverflow } from "react-icons/si";
import { login, handleCallback, getUser } from "@/lib/auth";
import { cn } from "@/lib/utils";
import BackgroundBlobs from "@/components/background-blobs";

export default function Login() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (window.location.search.includes("code=")) {
      handleCallback().then(() => {
        setLocation("/feed");
      });
    }

    getUser().then((user) => {
      if (user) {
        setLocation("/feed");
      }
    });
  }, [setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative px-4 sm:px-6 overflow-hidden">
      <BackgroundBlobs />

      <div className="relative z-10 w-full max-w-sm mx-auto">
        <Card className="glass rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
          <CardHeader className="bg-transparent text-center pb-8 pt-8">
            <div className="flex items-center justify-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25">
                <SiStackoverflow className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight gradient-text">
                StackScroll
              </CardTitle>
            </div>
            <p className="text-muted-foreground/80 text-sm">
              Browse top Stack Overflow Q&amp;A in style
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 px-8 pb-8">
            <div className="space-y-3">
              <Button
                size="lg"
                onClick={() => setLocation("/feed")}
                className={cn(
                  "w-full glass bg-gradient-to-b from-white/10 to-white/5 border-white/10 text-foreground shadow-lg hover:-translate-y-0.5 hover:shadow-primary/20 transition-all"
                )}
              >
                Continue without signing in
              </Button>
              <Button
                size="lg"
                onClick={login}
                className={cn(
                  "w-full bg-gradient-to-b from-primary to-accent text-primary-foreground shadow-lg shadow-primary/30 hover:-translate-y-0.5 hover:shadow-primary/45 transition-all"
                )}
              >
                Sign in for more features
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
