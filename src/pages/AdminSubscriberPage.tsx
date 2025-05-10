import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Search, UserPlus, Shield, UserCheck, ShieldX, ShieldCheck } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { t } from "@/utils/i18n";
import { AddSubscriberDialog } from "@/components/AddSubscriberDialog";

// Types for our components
type Subscriber = {
  id: string;
  name: string;
  email: string;
  tier: "basic" | "premium" | "enterprise"; // Fixed specific union type
  expiresAt: string;
  role: "admin" | "user"; // Fixed specific union type
};

type AdminView = "all" | "active" | "expired" | "admins";

// Mock subscriber data (would be fetched from actual database in production)
const mockSubscribers: Subscriber[] = [
  {
    id: "sub-1",
    name: "Alice Johnson",
    email: "alice@example.com",
    tier: "premium", // Now matches the Subscriber type
    expiresAt: new Date(Date.now() + 25 * 86400000).toISOString(),
    role: "user"
  },
  {
    id: "sub-2",
    name: "Bob Smith",
    email: "bob@example.com",
    tier: "basic", // Now matches the Subscriber type
    expiresAt: new Date(Date.now() + 5 * 86400000).toISOString(),
    role: "user"
  },
  {
    id: "sub-3",
    name: "Carol Williams",
    email: "carol@example.com",
    tier: "enterprise", // Now matches the Subscriber type
    expiresAt: new Date(Date.now() + 60 * 86400000).toISOString(),
    role: "admin"
  },
  {
    id: "sub-4",
    name: "David Brown",
    email: "david@example.com",
    tier: "basic", // Now matches the Subscriber type
    expiresAt: new Date(Date.now() - 5 * 86400000).toISOString(), // expired
    role: "user"
  }
];

export function AdminSubscriberPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>(mockSubscribers);
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState<AdminView>("all");
  const { user } = useAuth();

  // Check if current user is admin
  const isAdmin = user?.subscription?.tier === "enterprise" || user?.isFullAdmin;
  const isFullAdmin = user?.isFullAdmin;

  // Filter subscribers based on view and search query
  const filteredSubscribers = subscribers.filter(sub => {
    // First apply view filter
    if (view === "active" && new Date(sub.expiresAt) < new Date()) return false;
    if (view === "expired" && new Date(sub.expiresAt) >= new Date()) return false;
    if (view === "admins" && sub.role !== "admin") return false;
    
    // Then apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        sub.name.toLowerCase().includes(query) ||
        sub.email.toLowerCase().includes(query) ||
        sub.tier.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  // Function to format date in a readable way
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };

  // Handle role toggle (in a real app, this would update the database)
  const toggleRole = (id: string) => {
    setSubscribers(subs => 
      subs.map(sub => 
        sub.id === id 
          ? { ...sub, role: sub.role === "admin" ? "user" : "admin" } 
          : sub
      )
    );
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-12 px-4">
          <Card>
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>
                You don't have permission to access the admin subscriber management section.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/dashboard">
                <Button>Return to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-8 px-4 md:px-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/dashboard">
              <Button variant="outline" size="icon">
                <ArrowLeft size={18} />
              </Button>
            </Link>
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold">{t('admin.subscribers_management')}</h1>
              {isFullAdmin && (
                <span className="text-sm text-primary flex items-center gap-1">
                  <ShieldCheck size={14} className="inline-block" />
                  Full Admin Control
                </span>
              )}
            </div>
          </div>
          <AddSubscriberDialog />
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <CardTitle>Subscribers</CardTitle>
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search subscribers..." 
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <Tabs defaultValue="all" className="mt-2" onValueChange={(value) => setView(value as AdminView)}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="expired">Expired</TabsTrigger>
                <TabsTrigger value="admins">Admins</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Subscription</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscribers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No subscribers found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSubscribers.map(subscriber => (
                    <TableRow key={subscriber.id}>
                      <TableCell className="font-medium">{subscriber.name}</TableCell>
                      <TableCell>{subscriber.email}</TableCell>
                      <TableCell>
                        <span className={`subscription-badge subscription-badge-${subscriber.tier}`}>
                          {subscriber.tier.charAt(0).toUpperCase() + subscriber.tier.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span 
                          className={new Date(subscriber.expiresAt) < new Date() ? "text-destructive" : ""}
                        >
                          {formatDate(subscriber.expiresAt)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span 
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs 
                            ${subscriber.role === "admin" 
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" 
                              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"}`}>
                          {subscriber.role === "admin" ? (
                            <Shield className="w-3 h-3 mr-1" />
                          ) : (
                            <UserCheck className="w-3 h-3 mr-1" />
                          )}
                          {subscriber.role}
                        </span>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => toggleRole(subscriber.id)}
                          title={`Make ${subscriber.role === "admin" ? "user" : "admin"}`}
                        >
                          {subscriber.role === "admin" ? (
                            <ShieldX className="h-4 w-4" />
                          ) : (
                            <Shield className="h-4 w-4" />
                          )}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          title="Edit subscriber"
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default AdminSubscriberPage;
