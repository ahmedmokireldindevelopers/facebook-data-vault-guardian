
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { useMemo } from "react";
import { Circle } from "lucide-react";

export interface Subscriber {
  id: string;
  name: string;
  email: string;
  tier: "basic" | "premium" | "enterprise";
  expiresAt: string;
  role: "admin" | "user";
}

interface SubscriberTableProps {
  subscribers: Subscriber[];
  onToggleRole: (id: string) => void;
  compact?: boolean; // Added compact option for dashboard display
}

export function SubscriberTable({ subscribers, onToggleRole, compact = false }: SubscriberTableProps) {
  // Check if any subscribers exist
  if (subscribers.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">No subscribers found</p>
      </div>
    );
  }

  // Format date from ISO string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    }).format(date);
  };

  // Check if subscription is expired
  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  // Get status badge for subscription
  const getStatusBadge = useMemo(() => (expiresAt: string) => {
    if (isExpired(expiresAt)) {
      return <Badge variant="destructive">Expired</Badge>;
    } else {
      // Check if expiring soon (within 7 days)
      const daysUntilExpiry = Math.ceil(
        (new Date(expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysUntilExpiry <= 7) {
        return <Badge variant="outline" className="border-amber-500 text-amber-500">Expiring Soon</Badge>;
      } else {
        return <Badge variant="outline" className="border-green-500 text-green-500">Active</Badge>;
      }
    }
  }, []);

  // Get tier badge
  const getTierBadge = (tier: "basic" | "premium" | "enterprise") => {
    switch (tier) {
      case "basic":
        return <Badge variant="secondary">Basic</Badge>;
      case "premium":
        return <Badge variant="default">Premium</Badge>;
      case "enterprise":
        return <Badge variant="outline" className="bg-purple-100 border-purple-500 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400">Enterprise</Badge>;
    }
  };
  
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">Name</TableHead>
            {!compact && <TableHead>Email</TableHead>}
            <TableHead>Tier</TableHead>
            {!compact && <TableHead>Expiry</TableHead>}
            <TableHead>Status</TableHead>
            {!compact && (
              <TableHead className="text-right">Admin</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscribers.map((subscriber) => (
            <TableRow key={subscriber.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {subscriber.role === "admin" && (
                    <Circle className="h-2 w-2 fill-blue-500 text-blue-500" />
                  )}
                  {subscriber.name}
                </div>
              </TableCell>
              
              {!compact && <TableCell>{subscriber.email}</TableCell>}
              
              <TableCell>{getTierBadge(subscriber.tier)}</TableCell>
              
              {!compact && (
                <TableCell>{formatDate(subscriber.expiresAt)}</TableCell>
              )}
              
              <TableCell>{getStatusBadge(subscriber.expiresAt)}</TableCell>
              
              {!compact && (
                <TableCell className="text-right">
                  <Switch 
                    checked={subscriber.role === "admin"} 
                    onCheckedChange={() => onToggleRole(subscriber.id)}
                  />
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
