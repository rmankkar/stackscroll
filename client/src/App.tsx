import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Login from "@/pages/login";
import Feed from "@/pages/feed";
import Profile from "@/pages/profile";
import NotFound from "@/pages/not-found";
import Explore from "@/pages/explore";
import Bookmarks from "@/pages/bookmarks";
import Ask from "@/pages/ask";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/feed" component={Feed} />
      <Route path="/explore" component={Explore} />
      <Route path="/bookmarks" component={Bookmarks} />
      <Route path="/ask" component={Ask} />
      <Route path="/profile" component={Profile} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
