
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DataStatCardProps {
  title: string;
  count: number;
  icon: React.ReactNode;
  bgColor?: string;
}

export function DataStatCard({ title, count, icon, bgColor = "bg-primary/10" }: DataStatCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className={`${bgColor} py-3`}>
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          {title}
          <span>{icon}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="text-2xl font-bold">{count.toLocaleString()}</div>
      </CardContent>
    </Card>
  );
}
