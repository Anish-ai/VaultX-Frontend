"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation" // Import useRouter
import {
  Shield,
  Home,
  CreditCard,
  BarChart3,
  PiggyBank,
  Settings,
  Bell,
  LogOut,
  Menu,
  User,
  Loader2,
  DollarSign,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"
import { Badge } from "@/components/ui/badge"
import api from "@/utils/api"

interface SecurityLog {
  id: string
  eventType: string
  details: any
  ipAddress: string
  userAgent: string
  createdAt: string
  read?: boolean
}

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter() // Initialize useRouter
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [logs, setLogs] = useState<SecurityLog[]>([])

  // Function to get unread notifications count
  const getUnreadCount = () => {
    return logs.filter(log => !log.read).length
  }

  // Fetch security logs
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No token found");
        }

        const response = await api.get("/security-logs/my-logs", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        setLogs(response.data
          .filter((log: SecurityLog) => log.eventType !== 'NULL')
          .map((log: SecurityLog) => ({ ...log, read: false }))
        );
      } catch (error) {
        console.error("Error fetching security logs:", error);
        setLogs([]);
      }
    };

    fetchLogs();
  }, []);

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Handle logout
  const handleLogout = () => {
    // Clear the token from local storage (or cookies)
    localStorage.removeItem("token") // Replace with your token storage method
    // Redirect to the home page
    router.push("/")
  }

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Accounts", href: "/dashboard/accounts", icon: CreditCard },
    { name: "Loans", href: "/dashboard/loans", icon: DollarSign },
    { name: "Transactions", href: "/dashboard/transactions", icon: BarChart3 },
    { name: "Investments", href: "/dashboard/investments", icon: PiggyBank },
    { name: "Notifications", href: "/dashboard/notifications", icon: Bell, badge: getUnreadCount() },
    { name: "Profile", href: "/dashboard/profile", icon: User },
  ]

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-40 border-b bg-background">
          <div className="container flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-2 md:gap-4">
              <Button variant="outline" size="icon" className="md:hidden" disabled>
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2 font-bold text-xl">
                <Shield className="h-6 w-6" />
                <span>VaultX</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Button variant="outline" size="icon" disabled>
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full" disabled>
                <Avatar className="h-8 w-8">
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
              </Button>
            </div>
          </div>
        </header>
        <div className="flex flex-1">
          <aside className="hidden w-64 border-r bg-muted/40 md:block">
            <nav className="flex flex-col gap-2 p-4">
              {navigation.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground"
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                  {item.name === "Notifications" && getUnreadCount() > 0 && (
                    <Badge className="ml-auto bg-primary text-primary-foreground">{getUnreadCount()}</Badge>
                  )}
                </div>
              ))}
            </nav>
          </aside>
          <main className="flex-1 overflow-auto p-4 md:p-6">
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2 md:gap-4">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[240px] sm:w-[300px] pr-0">
                <div className="flex items-center gap-2 font-bold text-xl mb-8">
                  <Shield className="h-6 w-6" />
                  <span>VaultX</span>
                </div>
                <nav className="flex flex-col gap-2">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200",
                        pathname === item.href ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                      {item.badge && <Badge className="ml-auto bg-primary text-primary-foreground">{item.badge}</Badge>}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
            <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl">
              <Shield className="h-6 w-6" />
              <span>VaultX</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/dashboard/notifications">
              <Button variant="outline" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {getUnreadCount() > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                    {getUnreadCount()}
                  </span>
                )}
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile" className="w-full">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-64 border-r bg-muted/40 md:block">
          <nav className="flex flex-col gap-2 p-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200",
                  pathname === item.href ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
                {item.badge && <Badge className="ml-auto bg-primary text-primary-foreground">{item.badge}</Badge>}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1 overflow-auto p-4 md:p-6 transition-all duration-300 ease-in-out">{children}</main>
      </div>
    </div>
  )
}