"use client"; // Mark this component as a Client Component

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/dashboard-layout";
import { LoadingSpinner } from "@/components/loading-spinner";
import api from "@/utils/api";

// Define TypeScript interfaces
interface User {
  id: number;
  name: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  country: string | null;
  timezone: string | null;
  mfaEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [tokenValid, setTokenValid] = useState<boolean>(false);

  useEffect(() => {
    const checkTokenAndFetchProfile = async () => {
      try {
        // Retrieve token from localStorage
        const token = localStorage.getItem("token");
        console.log("Token:", token);

        if (!token) {
          throw new Error("No token found");
        }

        // Verify token and retrieve user ID
        const userResponse = await api.get("/auth/verify-token", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const userId = userResponse;

        if (!userId) {
          throw new Error("Invalid token or user ID not found");
        }

        // Token is valid, proceed to fetch user profile
        setTokenValid(true);

        // Fetch user profile
        const profileResponse = await api.get("/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("API Response:", profileResponse.data); // Log the response for debugging

        if (profileResponse.data) {
          setUser(profileResponse.data);
        } else {
          console.error("Invalid response format: Expected user data");
          setUser(null); // Set user to null if data is invalid
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setUser(null); // Set user to null in case of error
        setTokenValid(false);
        router.push("/signup"); // Redirect to signup page if token is invalid
      } finally {
        setLoading(false);
      }
    };

    checkTokenAndFetchProfile();
  }, [router]);

  if (!tokenValid) {
    return null; // Redirect will happen automatically
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="h-8 w-48 animate-pulse rounded bg-muted" />
          </div>

          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-muted to-transparent animate-shimmer" />
            <CardHeader>
              <div className="h-6 w-40 animate-pulse rounded bg-muted" />
              <div className="h-4 w-60 animate-pulse rounded bg-muted" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0">
                <div className="h-24 w-24 rounded-full bg-muted animate-pulse" />
              </div>

              <div className="h-px w-full bg-muted my-6" />

              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                  <div className="h-10 w-full animate-pulse rounded bg-muted" />
                </div>
              ))}

              <div className="h-px w-full bg-muted my-6" />

              <div className="space-y-4">
                <div className="h-6 w-32 animate-pulse rounded bg-muted" />
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="space-y-2">
                    <div className="h-4 w-40 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-60 animate-pulse rounded bg-muted" />
                  </div>
                  <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center gap-4 p-8">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold">Failed to load profile</h2>
            <p className="text-muted-foreground">We couldn't load your profile information</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="transition-all hover:scale-105"
          >
            Try Again
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        </div>

        <Card className="transition-all hover:shadow-lg">
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>View your personal information and security settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0">
              <Avatar className="h-24 w-24 transition-all hover:scale-105">
                <AvatarImage src="/placeholder.svg" alt="User" />
                <AvatarFallback className="text-lg">
                  {getInitials(user.name || 'US')}
                </AvatarFallback>
              </Avatar>
            </div>

            <Separator className="my-6" />

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                value={user.name || ''}
                disabled
                className="transition-all hover:border-primary/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={user.email}
                disabled
                className="transition-all hover:border-primary/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone" 
                type="tel" 
                value={user.phone || ''}
                disabled
                className="transition-all hover:border-primary/50"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input 
                  id="country" 
                  value={user.country || ''}
                  disabled
                  className="transition-all hover:border-primary/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Input 
                  id="timezone" 
                  value={user.timezone || ''}
                  disabled
                  className="transition-all hover:border-primary/50"
                />
              </div>
            </div>

            <Separator className="my-6" />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Security</h3>
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 transition-all hover:bg-muted/70">
                <div className="space-y-0.5">
                  <Label className="text-base">Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Email verification is required for all sign-ins
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={user.mfaEnabled ? 'destructive' : 'success'} className="transition-all hover:scale-105">
                    {user.mfaEnabled ? 'Disabled' : 'Enabled'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

function getInitials(name?: string | null): string {
  if (!name) return '';
  return name.split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase();
}