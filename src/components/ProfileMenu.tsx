
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth, SubscriptionTier } from "@/contexts/AuthContext";
import { t } from "@/utils/i18n";
import { CreditCard, LogOut, Settings, User, Users, LayoutDashboard } from "lucide-react";

export function ProfileMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Get badge color by subscription tier
  const getBadgeClass = (tier: SubscriptionTier) => {
    switch (tier) {
      case 'basic':
        return 'subscription-badge-basic';
      case 'premium':
        return 'subscription-badge-premium';
      case 'enterprise':
        return 'subscription-badge-enterprise';
      default:
        return 'subscription-badge-basic';
    }
  };

  // Check if user has admin access (enterprise tier or full admin)
  const isAdmin = user.subscription.tier === "enterprise" || user.isFullAdmin;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar>
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 mr-2" align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
            {user.isFullAdmin && (
              <p className="text-xs font-medium text-primary">Full Admin Access</p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <div className="flex flex-col w-full">
            <p className="text-xs text-muted-foreground">{t('subscription.status')}</p>
            <div className="flex items-center mt-1">
              <span className={`subscription-badge ${getBadgeClass(user.subscription.tier)}`}>
                {t(`subscription.${user.subscription.tier}`)}
              </span>
            </div>
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <Link to="/dashboard" onClick={() => setOpen(false)}>
          <DropdownMenuItem className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>{t('dashboard.title')}</span>
          </DropdownMenuItem>
        </Link>
        <Link to="/settings" onClick={() => setOpen(false)}>
          <DropdownMenuItem className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>{t('settings.title')}</span>
          </DropdownMenuItem>
        </Link>
        <Link to="/subscription" onClick={() => setOpen(false)}>
          <DropdownMenuItem className="cursor-pointer">
            <CreditCard className="mr-2 h-4 w-4" />
            <span>{t('subscription.management')}</span>
          </DropdownMenuItem>
        </Link>
        
        {/* Admin links - only shown for enterprise tier users or full admins */}
        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <Link to="/admin/dashboard" onClick={() => setOpen(false)}>
              <DropdownMenuItem className="cursor-pointer">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Admin Dashboard</span>
              </DropdownMenuItem>
            </Link>
            <Link to="/admin/subscribers" onClick={() => setOpen(false)}>
              <DropdownMenuItem className="cursor-pointer">
                <Users className="mr-2 h-4 w-4" />
                <span>Manage Subscribers</span>
              </DropdownMenuItem>
            </Link>
          </>
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" onClick={() => logout()}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t('auth.logout')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
