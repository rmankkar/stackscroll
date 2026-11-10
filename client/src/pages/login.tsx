import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SiStackoverflow } from "react-icons/si";
import { login, handleCallback, getUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

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
    <div className="min-h-screen bg-background flex items-center justify-center px-4 sm:px-6 overflow-hidden">
      <div className="relative z-10 w-full max-w-sm md:max-w-md mx-auto">
        <Card className="rounded-3xl border-white shadow-sm overflow-hidden">
          <CardHeader className="bg-transparent text-center pb-8 sm:pb-10 pt-8 sm:pt-10">
            <div className="flex items-center justify-center gap-2.5 mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <SiStackoverflow className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight">
                StackScroll
              </CardTitle>
            </div>
            <p className="text-muted-foreground text-sm sm:text-base">
              Browse top Stack Overflow Q&amp;A in style
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 px-8 sm:px-10 pb-8 sm:pb-10">
            <div className="space-y-3">
              <Button
                size="lg"
                onClick={() => setLocation("/feed")}
                className={cn(
                  "w-full border border-white/30 bg-white text-foreground shadow-sm hover:bg-secondary hover:-translate-y-0.5 transition-all"
                )}
              >
                Continue without signing in
              </Button>
              <Button
                size="lg"
                onClick={login}
                className={cn(
                  "w-full bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:-translate-y-0.5 hover:shadow-primary/30 transition-all"
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
