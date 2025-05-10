
import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { DataStatCard } from "@/components/DataStatCard";
import { AddSubscriberDialog } from "@/components/AddSubscriberDialog";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { Users, UserPlus, Clock, BarChart, ArrowUpRight } from "lucide-react";
import { SubscriberTable, Subscriber } from "@/components/admin/SubscriberTable";

// Mock data for the dashboard stats
const mockStats = {
  totalSubscribers: 124,
  newSubscribersThisMonth: 18,
  expiringThisWeek: 7,
  activeAdmins: 3
};

// Sample of most recent subscribers for quick view
const recentSubscribers: Subscriber[] = [
  {
    id: "recent-1",
    name: "James Wilson",
    email: "james@example.com",
    tier: "premium",
    expiresAt: new Date(Date.now() + 15 * 86400000).toISOString(),
    role: "user"
  },
  {
    id: "recent-2",
    name: "Emma Thompson",
    email: "emma@example.com",
    tier: "enterprise",
    expiresAt: new Date(Date.now() + 45 * 86400000).toISOString(),
    role: "admin"
  },
  {
    id: "recent-3",
    name: "Michael Lee",
    email: "michael@example.com",
    tier: "basic",
    expiresAt: new Date(Date.now() + 3 * 86400000).toISOString(),
    role: "user"
  }
];

export function AdminDashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.subscription?.tier === "enterprise" || user?.isFullAdmin;

  // For demo purposes - would be real metrics in a production app
  const [stats] = useState(mockStats);

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
        <div className="mb-6 flex flex-col">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          {user?.isFullAdmin && (
            <span className="text-sm text-primary flex items-center gap-1">
              Full Admin Access
            </span>
          )}
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <DataStatCard 
            title="Total Subscribers" 
            count={stats.totalSubscribers} 
            icon={<Users size={20} />} 
            bgColor="bg-blue-100 dark:bg-blue-900/20"
          />
          <DataStatCard 
            title="New This Month" 
            count={stats.newSubscribersThisMonth} 
            icon={<UserPlus size={20} />} 
            bgColor="bg-green-100 dark:bg-green-900/20"
          />
          <DataStatCard 
            title="Expiring This Week" 
            count={stats.expiringThisWeek} 
            icon={<Clock size={20} />} 
            bgColor="bg-amber-100 dark:bg-amber-900/20"
          />
          <DataStatCard 
            title="Active Admins" 
            count={stats.activeAdmins} 
            icon={<BarChart size={20} />} 
            bgColor="bg-purple-100 dark:bg-purple-900/20"
          />
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex justify-between items-center">
                Recent Subscribers
                <Link to="/admin/subscribers">
                  <Button variant="ghost" size="sm" className="flex items-center gap-1">
                    View all <ArrowUpRight size={14} />
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SubscriberTable 
                subscribers={recentSubscribers} 
                onToggleRole={() => {}} 
                compact
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                Manage your subscribers or perform administrative tasks quickly with these actions.
              </p>
              <div className="flex flex-col gap-3">
                <AddSubscriberDialog showAsButton />
                <Link to="/admin/subscribers">
                  <Button variant="outline" className="w-full">Manage All Subscribers</Button>
                </Link>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <p className="text-xs text-muted-foreground">
                Only administrators can access these features.
              </p>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboardPage;
