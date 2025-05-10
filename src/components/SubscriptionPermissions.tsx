
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X } from "lucide-react";
import { SubscriptionTier } from "@/contexts/AuthContext";

interface PermissionItem {
  name: string;
  description: string;
  tiers: {
    basic: boolean;
    premium: boolean;
    enterprise: boolean;
  };
}

// List of permissions by feature
const permissions: PermissionItem[] = [
  {
    name: "Data Extraction",
    description: "Extract data from Facebook pages",
    tiers: { basic: true, premium: true, enterprise: true }
  },
  {
    name: "CSV Export",
    description: "Export extracted data to CSV format",
    tiers: { basic: true, premium: true, enterprise: true }
  },
  {
    name: "JSON Export",
    description: "Export extracted data to JSON format",
    tiers: { basic: false, premium: true, enterprise: true }
  },
  {
    name: "Bulk Extraction",
    description: "Extract data in bulk from multiple sources",
    tiers: { basic: false, premium: true, enterprise: true }
  },
  {
    name: "Advanced Filters",
    description: "Apply advanced filters to extracted data",
    tiers: { basic: false, premium: true, enterprise: true }
  },
  {
    name: "Background Extraction",
    description: "Extract data in the background while browsing",
    tiers: { basic: false, premium: false, enterprise: true }
  },
  {
    name: "API Access",
    description: "Access data through a dedicated API",
    tiers: { basic: false, premium: false, enterprise: true }
  },
  {
    name: "Priority Support",
    description: "Get priority customer support",
    tiers: { basic: false, premium: true, enterprise: true }
  },
  {
    name: "Custom Extraction Rules",
    description: "Create custom rules for data extraction",
    tiers: { basic: false, premium: false, enterprise: true }
  },
  {
    name: "User Management",
    description: "Manage team members and permissions",
    tiers: { basic: false, premium: false, enterprise: true }
  }
];

interface SubscriptionPermissionsProps {
  currentTier?: SubscriptionTier;
  showCurrentTierOnly?: boolean;
}

export function SubscriptionPermissions({ 
  currentTier = "basic", 
  showCurrentTierOnly = false 
}: SubscriptionPermissionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Feature Access</CardTitle>
        <CardDescription>
          Features available with your subscription plan
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[280px]">Feature</TableHead>
              {!showCurrentTierOnly && (
                <>
                  <TableHead className="text-center">Basic</TableHead>
                  <TableHead className="text-center">Premium</TableHead>
                  <TableHead className="text-center">Enterprise</TableHead>
                </>
              )}
              {showCurrentTierOnly && (
                <TableHead className="text-center">
                  {currentTier.charAt(0).toUpperCase() + currentTier.slice(1)}
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {permissions.map((permission) => (
              <TableRow key={permission.name}>
                <TableCell>
                  <div>
                    <p className="font-medium">{permission.name}</p>
                    <p className="text-sm text-muted-foreground">{permission.description}</p>
                  </div>
                </TableCell>
                
                {!showCurrentTierOnly && (
                  <>
                    <TableCell className="text-center">
                      {permission.tiers.basic ? (
                        <Check className="mx-auto h-5 w-5 text-green-500" />
                      ) : (
                        <X className="mx-auto h-5 w-5 text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {permission.tiers.premium ? (
                        <Check className="mx-auto h-5 w-5 text-green-500" />
                      ) : (
                        <X className="mx-auto h-5 w-5 text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {permission.tiers.enterprise ? (
                        <Check className="mx-auto h-5 w-5 text-green-500" />
                      ) : (
                        <X className="mx-auto h-5 w-5 text-muted-foreground" />
                      )}
                    </TableCell>
                  </>
                )}
                
                {showCurrentTierOnly && (
                  <TableCell className="text-center">
                    {permission.tiers[currentTier] ? (
                      <Check className="mx-auto h-5 w-5 text-green-500" />
                    ) : (
                      <X className="mx-auto h-5 w-5 text-muted-foreground" />
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
