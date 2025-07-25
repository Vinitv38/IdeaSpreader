"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Lightbulb, Menu, X, Sun, Moon, Plus, BarChart3 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const pathname = usePathname();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <nav className="bg-background/80 backdrop-blur-sm border-b border-border/40 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Link href="/" className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-lg">
              <Lightbulb className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold gradient-text hidden sm:inline">
              IdeaSpreader
            </span>
          </Link>
        </div>

        {/* Navigation Links - Center */}
        <div className="hidden md:flex items-center justify-center absolute left-1/2 transform -translate-x-1/2">
          <div className="flex space-x-1">
            <NavLink href="/" isActive={pathname === "/"}>
              Home
            </NavLink>
            <NavLink href="/discover" isActive={pathname === "/discover"}>
              Discover
            </NavLink>
            <NavLink
              href="#how-it-works"
              isActive={pathname.includes("#how-it-works")}
            >
              How it Works
            </NavLink>
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-muted-foreground hover:text-foreground"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button> */}

          {user ? (
            <div className="hidden md:flex items-center gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <Link href="/create" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  New Idea
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-muted-foreground hover:text-foreground"
              >
                Logout
              </Button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Log in</Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="bg-gradient-to-r from-primary to-primary/90"
              >
                <Link href="/signup">Sign up</Link>
              </Button>
            </div>
          )}

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className={`md:hidden ${isOpen ? "block" : "hidden"}`}>
        <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3 bg-background/95 backdrop-blur-sm border-t border-border/40">
          <MobileNavLink href="/" isActive={pathname === "/"}>
            Home
          </MobileNavLink>
          <MobileNavLink href="/discover" isActive={pathname === "/discover"}>
            Discover
          </MobileNavLink>
          <MobileNavLink
            href="#how-it-works"
            isActive={pathname.includes("#how-it-works")}
          >
            How it Works
          </MobileNavLink>

          <div className="pt-4 mt-2 border-t border-border/40">
            {user ? (
              <div className="flex flex-col space-y-2">
                <Button
                  asChild
                  variant="ghost"
                  className="w-full justify-start"
                >
                  <Link href="/dashboard" className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Dashboard
                  </Link>
                </Button>
                <Button asChild className="w-full">
                  <Link href="/create" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    New Idea
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                  onClick={logout}
                >
                  Sign out
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Button asChild variant="outline" className="w-full">
                  <Link href="/login">Log in</Link>
                </Button>
                <Button
                  asChild
                  className="w-full bg-gradient-to-r from-primary to-primary/90"
                >
                  <Link href="/signup">Sign up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

// Reusable NavLink component
interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  isActive?: boolean;
}

function NavLink({ href, children, isActive = false }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        isActive
          ? "text-foreground bg-accent"
          : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
      }`}
    >
      {children}
    </Link>
  );
}

// Reusable MobileNavLink component
function MobileNavLink({ href, children, isActive = false }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
        isActive
          ? "text-foreground bg-accent"
          : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
      }`}
    >
      {children}
    </Link>
  );
}
