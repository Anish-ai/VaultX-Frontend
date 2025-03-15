"use client"; // Mark this component as a Client Component

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/utils/api";

export default function AddAssetsPage() {
  const router = useRouter();
  const [type, setType] = useState<string>("");
  const [balance, setBalance] = useState<string>("");
  const [currency, setCurrency] = useState<string>("USD");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!type || !balance || !currency) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      // Call the API to create an asset
      const response = await api.post("/assets", {
        type,
        balance: parseFloat(balance),
        currency,
      });

      if (response.data) {
        alert("Asset created successfully!");
        router.push("/dashboard/investments");
      }
    } catch (error) {
      console.error("Error creating asset:", error);
      alert("Failed to create asset");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Add New Asset</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="type">Type</Label>
              <Input
                id="type"
                type="text"
                value={type}
                onChange={(e) => setType(e.target.value)}
                placeholder="Enter asset type (e.g., BTC, ETH, USD)"
                required
              />
            </div>
            <div>
              <Label htmlFor="balance">Balance</Label>
              <Input
                id="balance"
                type="number"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                placeholder="Enter balance"
                required
              />
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select onValueChange={(value) => setCurrency(value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="BTC">BTC</SelectItem>
                  <SelectItem value="ETH">ETH</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Asset"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}