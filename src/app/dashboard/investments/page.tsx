"use client"; // Mark this component as a Client Component

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowUpRight, ArrowDownRight, TrendingUp, PiggyBank, Briefcase, DollarSign } from "lucide-react";
import DashboardLayout from "@/components/dashboard-layout";
import api from "@/utils/api";
import { useRouter } from "next/navigation";

// Define TypeScript interfaces
interface Investment {
  id: number;
  userId: number;
  amount: number;
  type: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface AssetAllocation {
  name: string;
  value: string;
  percentage: number;
  color: string;
  progressColor: string;
}

// Add new interfaces for price tracking
interface PriceChange {
  value: number;
  percentage: number;
  direction: 'up' | 'down';
}

interface AssetPriceChanges {
  [key: string]: PriceChange;
}

export default function InvestmentsPage() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [assetAllocation, setAssetAllocation] = useState<AssetAllocation[]>([]);
  // Add new state for price changes
  const [priceChanges, setPriceChanges] = useState<AssetPriceChanges>({
    total: { value: 0, percentage: 0, direction: 'up' },
    stocks: { value: 0, percentage: 0, direction: 'up' },
    bonds: { value: 0, percentage: 0, direction: 'up' },
    crypto: { value: 0, percentage: 0, direction: 'up' },
  });
  const router = useRouter();

  // Add function to generate random price changes
  const generateRandomPriceChange = (currentValue: number): PriceChange => {
    const maxChangePercentage = 0.5; // Maximum 0.5% change per update
    const randomPercentage = (Math.random() * maxChangePercentage * 2) - maxChangePercentage;
    const changeValue = currentValue * (randomPercentage / 100);
    const direction: 'up' | 'down' = randomPercentage >= 0 ? 'up' : 'down';
    return {
      value: changeValue,
      percentage: randomPercentage,
      direction
    };
  };

  // Add useEffect for price updates
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (!loading && assetAllocation.length > 0) {
      intervalId = setInterval(() => {
        const totalValue = assetAllocation.reduce((sum, asset) => sum + parseFloat(asset.value), 0);
        const newPriceChanges: AssetPriceChanges = {
          total: generateRandomPriceChange(totalValue),
          stocks: generateRandomPriceChange(parseFloat(assetAllocation.find(a => a.name === "Stocks")?.value || "0")),
          bonds: generateRandomPriceChange(parseFloat(assetAllocation.find(a => a.name === "Bonds")?.value || "0")),
          crypto: generateRandomPriceChange(parseFloat(assetAllocation.find(a => a.name === "Crypto")?.value || "0")),
        };

        setPriceChanges(newPriceChanges);
        
        // Update asset allocation with new values
        setAssetAllocation(prev => prev.map(asset => ({
          ...asset,
          value: (parseFloat(asset.value) + (
            asset.name === "Stocks" ? newPriceChanges.stocks.value :
            asset.name === "Bonds" ? newPriceChanges.bonds.value :
            newPriceChanges.crypto.value
          )).toFixed(2)
        })));
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [loading, assetAllocation.length]);

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
  
        // Token is valid, proceed to fetch investments
        const response = await api.get<{ data: Investment[] }>("/investments", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("API Response:", response.data); // Log the response for debugging
  
        // Ensure the response data is an array
        if (Array.isArray(response.data.data)) {
          setInvestments(response.data.data);
  
          // Calculate asset allocation
          const allocation = calculateAssetAllocation(response.data.data);
          setAssetAllocation(allocation);
        } else {
          console.error("Invalid response format: Expected an array");
          setInvestments([]); // Set investments to an empty array
        }
      } catch (error) {
        console.error("Error fetching investments:", error);
        setInvestments([]); // Set investments to an empty array in case of error
        router.push("/signup"); // Redirect to signup page if token is invalid
      } finally {
        setLoading(false);
      }
    };
  
    checkTokenAndFetchData();
  }, [router]);

  // Calculate asset allocation based on investments
  const calculateAssetAllocation = (investments: Investment[]): AssetAllocation[] => {
    const totalValue = investments.reduce((sum, investment) => sum + investment.amount, 0);

    const allocation = [
      {
        name: "Stocks",
        value: investments
          .filter((inv) => inv.type === "STOCKS")
          .reduce((sum, inv) => sum + inv.amount, 0)
          .toFixed(2),
        percentage: Math.round(
          (investments.filter((inv) => inv.type === "STOCKS").reduce((sum, inv) => sum + inv.amount, 0) / totalValue) * 100
        ),
        color: "bg-blue-500",
        progressColor: "bg-blue-500",
      },
      {
        name: "Bonds",
        value: investments
          .filter((inv) => inv.type === "BONDS")
          .reduce((sum, inv) => sum + inv.amount, 0)
          .toFixed(2),
        percentage: Math.round(
          (investments.filter((inv) => inv.type === "BONDS").reduce((sum, inv) => sum + inv.amount, 0) / totalValue) * 100
        ),
        color: "bg-green-500",
        progressColor: "bg-green-500",
      },
      {
        name: "Crypto",
        value: investments
          .filter((inv) => inv.type === "CRYPTO")
          .reduce((sum, inv) => sum + inv.amount, 0)
          .toFixed(2),
        percentage: Math.round(
          (investments.filter((inv) => inv.type === "CRYPTO").reduce((sum, inv) => sum + inv.amount, 0) / totalValue) * 100
        ),
        color: "bg-orange-500",
        progressColor: "bg-orange-500",
      },
    ];

    return allocation;
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading investments...</div>;
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Investments</h1>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/investments/new">
              <Button size="sm">New Investment</Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Portfolio</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${assetAllocation.reduce((sum, asset) => sum + parseFloat(asset.value), 0).toFixed(2)}
              </div>
              <div className={`flex items-center text-xs ${priceChanges.total.direction === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
                {priceChanges.total.direction === 'up' ? (
                  <ArrowUpRight className="mr-1 h-3 w-3" />
                ) : (
                  <ArrowDownRight className="mr-1 h-3 w-3" />
                )}
                {priceChanges.total.direction === 'up' ? '+' : '-'}
                {Math.abs(priceChanges.total.percentage).toFixed(2)}% (${Math.abs(priceChanges.total.value).toFixed(2)})
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stocks</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${assetAllocation.find((a) => a.name === "Stocks")?.value}</div>
              <div className={`flex items-center text-xs ${priceChanges.stocks.direction === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
                {priceChanges.stocks.direction === 'up' ? (
                  <ArrowUpRight className="mr-1 h-3 w-3" />
                ) : (
                  <ArrowDownRight className="mr-1 h-3 w-3" />
                )}
                {priceChanges.stocks.direction === 'up' ? '+' : '-'}
                {Math.abs(priceChanges.stocks.percentage).toFixed(2)}% (${Math.abs(priceChanges.stocks.value).toFixed(2)})
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bonds</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${assetAllocation.find((a) => a.name === "Bonds")?.value}</div>
              <div className={`flex items-center text-xs ${priceChanges.bonds.direction === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
                {priceChanges.bonds.direction === 'up' ? (
                  <ArrowUpRight className="mr-1 h-3 w-3" />
                ) : (
                  <ArrowDownRight className="mr-1 h-3 w-3" />
                )}
                {priceChanges.bonds.direction === 'up' ? '+' : '-'}
                {Math.abs(priceChanges.bonds.percentage).toFixed(2)}% (${Math.abs(priceChanges.bonds.value).toFixed(2)})
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Crypto</CardTitle>
              <PiggyBank className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${assetAllocation.find((a) => a.name === "Crypto")?.value}</div>
              <div className={`flex items-center text-xs ${priceChanges.crypto.direction === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
                {priceChanges.crypto.direction === 'up' ? (
                  <ArrowUpRight className="mr-1 h-3 w-3" />
                ) : (
                  <ArrowDownRight className="mr-1 h-3 w-3" />
                )}
                {priceChanges.crypto.direction === 'up' ? '+' : '-'}
                {Math.abs(priceChanges.crypto.percentage).toFixed(2)}% (${Math.abs(priceChanges.crypto.value).toFixed(2)})
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="portfolio" className="space-y-4">
          <TabsList>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          </TabsList>

          <TabsContent value="portfolio" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Asset Allocation</CardTitle>
                <CardDescription>Your current investment portfolio breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {assetAllocation.map((asset) => (
                    <div key={asset.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`h-3 w-3 rounded-full ${asset.color}`}></div>
                          <span className="text-sm font-medium">{asset.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">${asset.value}</span>
                          <span className="text-xs text-muted-foreground">({asset.percentage}%)</span>
                        </div>
                      </div>
                      <Progress value={asset.percentage} className={`h-2 ${asset.progressColor}`} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Investment Holdings</CardTitle>
                <CardDescription>Your current investment holdings and performance</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {investments.length > 0 ? (
                      investments.map((investment) => (
                        <TableRow key={investment.id}>
                          <TableCell className="font-medium">
                            <Badge variant="outline">{investment.type}</Badge>
                          </TableCell>
                          <TableCell>${investment.amount.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge variant={investment.status === "ACTIVE" ? "default" : "secondary"}>
                              {investment.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(investment.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">
                          No investments found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance History</CardTitle>
                <CardDescription>Track your investment performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center border rounded-md">
                  <p className="text-muted-foreground">Performance charts will be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="opportunities" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Investment Opportunities</CardTitle>
                <CardDescription>Explore new investment opportunities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {/* Placeholder for investment opportunities */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Tech Growth Fund</CardTitle>
                      <CardDescription>High-growth technology companies portfolio</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium">Expected Return</p>
                          <p className="text-emerald-500 font-bold">12-15%</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Risk Level</p>
                          <Badge variant="outline">Moderate</Badge>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full">Invest Now</Button>
                    </CardFooter>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}