"use client"; // Mark this component as a Client Component

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/dashboard-layout";
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

        const userId = userResponse.data.userId;

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
    return <div className="flex justify-center p-8">Loading profile...</div>;
  }

  if (!user) {
    return <div className="flex justify-center p-8">Failed to load profile.</div>;
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>View your personal information and security settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0">
              <Avatar className="h-24 w-24">
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
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={user.email}
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone" 
                type="tel" 
                value={user.phone || ''}
                disabled
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input 
                  id="country" 
                  value={user.country || ''}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Input 
                  id="timezone" 
                  value={user.timezone || ''}
                  disabled
                />
              </div>
            </div>

            <Separator className="my-6" />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Security</h3>
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div className="space-y-0.5">
                  <Label className="text-base">Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Email verification is required for all sign-ins
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={user.mfaEnabled ? 'destructive' : 'success'}>
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