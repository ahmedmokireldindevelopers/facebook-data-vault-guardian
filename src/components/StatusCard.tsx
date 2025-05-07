
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "./ProgressBar";
import { CheckCircle, AlertCircle, Loader } from "lucide-react";

type StatusType = "idle" | "extracting" | "complete" | "error";

interface StatusCardProps {
  status: StatusType;
  message: string;
  progress?: {
    current: number;
    total: number;
  };
}

export function StatusCard({ status, message, progress }: StatusCardProps) {
  const renderStatusIcon = () => {
    switch (status) {
      case "idle":
        return null;
      case "extracting":
        return <Loader className="h-5 w-5 text-primary animate-spin" />;
      case "complete":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      default:
        return null;
    }
  };

  const getBadgeVariant = () => {
    switch (status) {
      case "idle": return "outline";
      case "extracting": return "secondary";
      case "complete": return "default";
      case "error": return "destructive";
      default: return "outline";
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Badge variant={getBadgeVariant()} className="capitalize">
            {status === "idle" ? "Ready" : status}
          </Badge>
          {renderStatusIcon()}
        </div>
        <p className="text-sm text-muted-foreground mb-3">{message}</p>
        {status === "extracting" && progress && (
          <ProgressBar value={progress.current} max={progress.total} />
        )}
      </CardContent>
    </Card>
  );
}
