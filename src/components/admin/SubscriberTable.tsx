
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Shield, UserCheck, ShieldX } from "lucide-react";

// Types for the component
export type Subscriber = {
  id: string;
  name: string;
  email: string;
  tier: "basic" | "premium" | "enterprise";
  expiresAt: string;
  role: "admin" | "user";
};

interface SubscriberTableProps {
  subscribers: Subscriber[];
  onToggleRole: (id: string) => void;
}

export function SubscriberTable({ subscribers, onToggleRole }: SubscriberTableProps) {
  // Function to format date in a readable way
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };

  return (
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
        {subscribers.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
              No subscribers found
            </TableCell>
          </TableRow>
        ) : (
          subscribers.map(subscriber => (
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
                  onClick={() => onToggleRole(subscriber.id)}
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
  );
}
