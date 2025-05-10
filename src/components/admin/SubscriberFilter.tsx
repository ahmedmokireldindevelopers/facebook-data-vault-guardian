
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export type AdminView = "all" | "active" | "expired" | "admins";

interface SubscriberFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  view: AdminView;
  onViewChange: (view: AdminView) => void;
}

export function SubscriberFilter({ 
  searchQuery, 
  onSearchChange, 
  view, 
  onViewChange 
}: SubscriberFilterProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search subscribers..." 
          className="pl-8"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <Tabs value={view} className="mt-2" onValueChange={(value) => onViewChange(value as AdminView)}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="expired">Expired</TabsTrigger>
          <TabsTrigger value="admins">Admins</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
