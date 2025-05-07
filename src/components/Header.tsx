
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { Link } from "react-router-dom";

export function Header() {
  return (
    <header className="border-b border-border bg-card py-3 px-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 bg-fb-blue rounded-full flex items-center justify-center">
          <svg 
            className="h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="currentColor"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c.65 0 1.29-.08 1.9-.22v-7.78h-2.45v-2.83h2.45v-2.09c0-2.43 1.49-3.76 3.66-3.76 1.04 0 1.94.08 2.2.11v2.57h-1.51c-1.18 0-1.41.56-1.41 1.38v1.79h2.81l-.37 2.83h-2.44V21.22C19.08 20.01 22 16.35 22 12c0-5.52-4.48-10-10-10z" />
          </svg>
        </div>
        <h1 className="text-lg font-medium">FB Data Vault</h1>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Link to="/settings">
          <Button variant="ghost" size="icon">
            <Settings size={20} />
          </Button>
        </Link>
      </div>
    </header>
  );
}
