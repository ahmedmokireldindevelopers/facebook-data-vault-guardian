
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function AccessDenied() {
  return (
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
  );
}
