"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import api from "@/utils/api";

interface Account {
  id: number;
  accountNumber: string;
  type: string;
  balance: number;
  currency: string;
}

export default function AddInvestmentPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [amount, setAmount] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [tokenValid, setTokenValid] = useState<boolean>(false);

  // Verify token and fetch accounts on page load
  useEffect(() => {
    const checkTokenAndFetchData = async () => {
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

        // Token is valid, proceed to fetch accounts
        setTokenValid(true);

        // Fetch user accounts
        const accountsResponse = await api.get<Account[]>("/accounts/my-accounts", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setAccounts(accountsResponse.data);

      } catch (error) {
        console.error("Error fetching accounts:", error);
        setTokenValid(false);
        router.push("/signup"); // Redirect to signup page if token is invalid
      }
    };

    checkTokenAndFetchData();
  }, [router, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[Frontend] Starting investment submission...");

    if (!amount || !type || !accountNumber) {
      console.log("[Frontend] Validation failed - missing fields");
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);
    console.log("[Frontend] Sending request to API...");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }

      const response = await api.post(
        "/investments/create",
        {
          amount: parseFloat(amount),
          type,
          accountNumber,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("[Frontend] API response:", response.data);

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Investment created successfully!",
        });
        router.push("/dashboard/investments");
      }
    } catch (error: any) {
      console.error("[Frontend] Error:", error.response?.data || error.message);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create investment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      console.log("[Frontend] Submission process completed");
    }
  };

  if (!tokenValid) {
    return null; // Redirect will happen automatically
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Create New Investment</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                min="1"
                required
              />
            </div>
            <div>
              <Label htmlFor="type">Investment Type</Label>
              <Select onValueChange={(value) => setType(value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select investment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STOCKS">Stocks</SelectItem>
                  <SelectItem value="BONDS">Bonds</SelectItem>
                  <SelectItem value="CRYPTO">Crypto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="account">Select Account</Label>
              <Select onValueChange={(value) => setAccountNumber(value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select an account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.accountNumber}>
                      {account.type} Account (●●●● {account.accountNumber.slice(-4)}) - ${account.balance.toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Processing..." : "Create Investment"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}