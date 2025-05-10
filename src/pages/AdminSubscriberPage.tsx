
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
import { SubscriberPagination } from "@/components/admin/SubscriberPagination";
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

// For demo purposes, let's add more mock subscribers
const generateMoreSubscribers = (): Subscriber[] => {
  const additionalSubscribers: Subscriber[] = [];
  const tiers: ("basic" | "premium" | "enterprise")[] = ["basic", "premium", "enterprise"];
  const roles: ("admin" | "user")[] = ["admin", "user"];
  
  for (let i = 5; i <= 25; i++) {
    additionalSubscribers.push({
      id: `sub-${i}`,
      name: `User ${i}`,
      email: `user${i}@example.com`,
      tier: tiers[Math.floor(Math.random() * tiers.length)],
      expiresAt: new Date(Date.now() + (Math.random() * 100 - 20) * 86400000).toISOString(),
      role: roles[Math.floor(Math.random() * roles.length)]
    });
  }
  
  return [...mockSubscribers, ...additionalSubscribers];
};

export function AdminSubscriberPage() {
  const allSubscribers = generateMoreSubscribers();
  const [subscribers, setSubscribers] = useState<Subscriber[]>(allSubscribers);
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState<AdminView>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
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

  // Calculate pagination values
  const totalPages = Math.ceil(filteredSubscribers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSubscribers.slice(indexOfFirstItem, indexOfLastItem);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, view]);

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
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
              subscribers={currentItems}
              onToggleRole={toggleRole}
            />
            {filteredSubscribers.length > 0 && (
              <SubscriberPagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={handlePageChange} 
              />
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default AdminSubscriberPage;
