
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import { useState } from "react";

export interface DataItem {
  id: string;
  name?: string;
  source: string;
  type: string;
  extractedAt: string;
}

interface DataTableProps {
  data: DataItem[];
  onDelete?: (id: string) => void;
}

export function DataTable({ data, onDelete }: DataTableProps) {
  const [sortField, setSortField] = useState<keyof DataItem>("extractedAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const handleSort = (field: keyof DataItem) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (sortField === "extractedAt") {
      return sortDirection === "asc"
        ? new Date(a[sortField]).getTime() - new Date(b[sortField]).getTime()
        : new Date(b[sortField]).getTime() - new Date(a[sortField]).getTime();
    }
    
    const aValue = a[sortField] || "";
    const bValue = b[sortField] || "";
    
    return sortDirection === "asc"
      ? aValue.toString().localeCompare(bValue.toString())
      : bValue.toString().localeCompare(aValue.toString());
  });

  const renderSortIcon = (field: keyof DataItem) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? " ▲" : " ▼";
  };

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead 
              className="cursor-pointer w-[120px]" 
              onClick={() => handleSort("id")}
            >
              ID{renderSortIcon("id")}
            </TableHead>
            <TableHead 
              className="cursor-pointer" 
              onClick={() => handleSort("name")}
            >
              Name{renderSortIcon("name")}
            </TableHead>
            <TableHead 
              className="cursor-pointer" 
              onClick={() => handleSort("source")}
            >
              Source{renderSortIcon("source")}
            </TableHead>
            <TableHead 
              className="cursor-pointer" 
              onClick={() => handleSort("type")}
            >
              Type{renderSortIcon("type")}
            </TableHead>
            <TableHead 
              className="cursor-pointer w-[180px]" 
              onClick={() => handleSort("extractedAt")}
            >
              Extracted At{renderSortIcon("extractedAt")}
            </TableHead>
            {onDelete && <TableHead className="w-[80px]">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.length > 0 ? (
            sortedData.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-mono">{item.id}</TableCell>
                <TableCell>{item.name || "-"}</TableCell>
                <TableCell>{item.source}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {item.type}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(item.extractedAt).toLocaleString()}</TableCell>
                {onDelete && (
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => onDelete(item.id)}
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={onDelete ? 6 : 5} className="text-center py-6 text-muted-foreground">
                No data available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
