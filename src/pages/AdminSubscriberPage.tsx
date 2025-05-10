
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { t } from "@/utils/i18n";
import { AddSubscriberDialog } from "@/components/AddSubscriberDialog";
import { SubscriberTable, Subscriber } from "@/components/admin/SubscriberTable";
import { SubscriberFilter, AdminView } from "@/components/admin/SubscriberFilter";
import { AccessDenied } from "@/components/admin/AccessDenied";

// Mock subscriber data (would be fetched from actual database in production)
const mockSubscribers: Subscriber[] = [
  {
    id: "sub-1",
    name: "Alice Johnson",
    email: "alice@example.com",
    tier: "premium",
    expiresAt: new Date(Date.now() + 25 * 86400000).toISOString(),
    role: "user"
  },
  {
    id: "sub-2",
    name: "Bob Smith",
    email: "bob@example.com",
    tier: "basic",
    expiresAt: new Date(Date.now() + 5 * 86400000).toISOString(),
    role: "user"
  },
  {
    id: "sub-3",
    name: "Carol Williams",
    email: "carol@example.com",
    tier: "enterprise",
    expiresAt: new Date(Date.now() + 60 * 86400000).toISOString(),
    role: "admin"
  },
  {
    id: "sub-4",
    name: "David Brown",
    email: "david@example.com",
    tier: "basic",
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
          <AccessDenied />
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
            <SubscriberFilter 
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              view={view}
              onViewChange={setView}
            />
          </CardHeader>
          <CardContent>
            <SubscriberTable 
              subscribers={filteredSubscribers}
              onToggleRole={toggleRole}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default AdminSubscriberPage;
