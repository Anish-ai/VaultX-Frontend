"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CreditCard, PiggyBank, Briefcase, Plus, ExternalLink, Download } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { LoadingSpinner, TableLoader } from "@/components/loading-spinner"
import api from "@/utils/api"
import router from "next/router"

// Define TypeScript interfaces
interface Account {
  id: number
  accountNumber: string
  type: "CHECKING" | "SAVINGS" | "INVESTMENT"
  balance: number
  currency: string
  createdAt: string
  userId: number
}

interface Transaction {
  id: number
  senderAccountNumber: string
  receiverAccountNumber: string
  amount: number
  type: "CREDIT" | "DEBIT"
  createdAt: string
  senderId: number
  receiverId: number
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const checkTokenAndFetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("Token:", token);
  
        if (!token) {
          throw new Error("No token found");
        }
  
        const userResponse = await api.get("/auth/verify-token", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        const userId = userResponse;
  
        if (!userId) {
          throw new Error("Invalid token or user ID not found");
        }
  
        const accountsResponse = await api.get<Account[]>('/accounts/my-accounts', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setAccounts(accountsResponse.data);
  
        const transactionsResponse = await api.get<Transaction[]>('/transactions', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTransactions(transactionsResponse.data);
  
      } catch (error) {
        console.error('Error fetching accounts data:', error);
        router.push("/signup");
      } finally {
        setLoading(false);
      }
    };
  
    checkTokenAndFetchData();
  }, [router]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="h-8 w-48 animate-pulse rounded bg-muted" />
            <div className="flex gap-2">
              <div className="h-8 w-24 animate-pulse rounded bg-muted" />
              <div className="h-8 w-24 animate-pulse rounded bg-muted" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-muted to-transparent animate-shimmer" />
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 rounded-full bg-muted animate-pulse" />
                      <div className="h-5 w-32 animate-pulse rounded bg-muted" />
                    </div>
                    <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
                  </div>
                  <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                </CardHeader>
                <CardContent>
                  <div className="h-8 w-32 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-24 animate-pulse rounded bg-muted mt-1" />
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="h-8 w-20 animate-pulse rounded bg-muted" />
                  <div className="h-8 w-20 animate-pulse rounded bg-muted" />
                </CardFooter>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="transactions" className="space-y-4">
            <div className="h-10 w-full animate-pulse rounded bg-muted" />
            <TabsContent value="transactions">
              <Card>
                <CardHeader>
                  <div className="h-6 w-40 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-60 animate-pulse rounded bg-muted" />
                </CardHeader>
                <CardContent>
                  <TableLoader rows={5}/>
                </CardContent>
                <CardFooter>
                  <div className="h-9 w-full animate-pulse rounded bg-muted" />
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Accounts</h1>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1 transition-all hover:scale-105"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button 
              size="sm" 
              className="gap-1 transition-all hover:scale-105"
            >
              <Plus className="h-4 w-4" />
              Add Account
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {accounts.map((account) => (
            <Card key={account.id} className="transition-all hover:shadow-lg">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {account.type === "CHECKING" && <CreditCard className="h-5 w-5 text-primary" />}
                    {account.type === "SAVINGS" && <PiggyBank className="h-5 w-5 text-primary" />}
                    {account.type === "INVESTMENT" && <Briefcase className="h-5 w-5 text-primary" />}
                    <CardTitle className="text-lg">{account.type} Account</CardTitle>
                  </div>
                  <Badge variant="outline" className="transition-all hover:scale-105">Active</Badge>
                </div>
                <CardDescription>●●●● {account.accountNumber.slice(-4)}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold transition-all hover:scale-105">
                  ${account.balance.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">Available Balance</p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="transition-all hover:scale-105"
                >
                  Details
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-1 transition-all hover:scale-105"
                >
                  <ExternalLink className="h-4 w-4" />
                  Transfer
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="transactions" className="space-y-4">
          <TabsList className="transition-all">
            <TabsTrigger 
              value="transactions" 
              className="transition-all hover:bg-primary/10"
            >
              Recent Transactions
            </TabsTrigger>
            <TabsTrigger 
              value="details" 
              className="transition-all hover:bg-primary/10"
            >
              Account Details
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transactions">
            <Card className="transition-all hover:shadow-lg">
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>View recent transactions across all accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Account</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.slice(0, 5).map((transaction) => (
                      <TableRow 
                        key={transaction.id}
                        className="transition-all hover:bg-muted/50"
                      >
                        <TableCell className="font-medium">
                          {transaction.senderAccountNumber} → {transaction.receiverAccountNumber}
                        </TableCell>
                        <TableCell>
                          {accounts.find(a => a.userId === transaction.senderId)?.type || 'External'}
                        </TableCell>
                        <TableCell>
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell
                          className={cn(
                            "text-right font-medium transition-all hover:scale-105",
                            transaction.type === 'CREDIT' ? "text-emerald-700" : "text-rose-700"
                          )}
                        >
                          {transaction.type === 'CREDIT' ? '+' : '-'}${transaction.amount.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full transition-all hover:scale-105"
                >
                  View All Transactions
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="details">
            <Card className="transition-all hover:shadow-lg">
              <CardHeader>
                <CardTitle>Account Details</CardTitle>
                <CardDescription>View and manage your account details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {accounts.map((account) => (
                    <div 
                      key={account.id} 
                      className="rounded-lg border p-4 transition-all hover:shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {account.type === "CHECKING" && <CreditCard className="h-5 w-5 text-primary" />}
                          {account.type === "SAVINGS" && <PiggyBank className="h-5 w-5 text-primary" />}
                          {account.type === "INVESTMENT" && <Briefcase className="h-5 w-5 text-primary" />}
                          <h3 className="font-medium">{account.type} Account</h3>
                        </div>
                        <Badge variant="outline" className="transition-all hover:scale-105">Active</Badge>
                      </div>
                      <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                        <div className="transition-all hover:bg-muted/50 p-2 rounded">
                          <p className="text-sm text-muted-foreground">Account Number</p>
                          <p className="font-medium">{account.accountNumber}</p>
                        </div>
                        <div className="transition-all hover:bg-muted/50 p-2 rounded">
                          <p className="text-sm text-muted-foreground">Balance</p>
                          <p className="font-medium">${account.balance.toFixed(2)}</p>
                        </div>
                        <div className="transition-all hover:bg-muted/50 p-2 rounded">
                          <p className="text-sm text-muted-foreground">Type</p>
                          <p className="font-medium">{account.type}</p>
                        </div>
                        <div className="transition-all hover:bg-muted/50 p-2 rounded">
                          <p className="text-sm text-muted-foreground">Opened On</p>
                          <p className="font-medium">
                            {new Date(account.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="transition-all hover:bg-muted/50 p-2 rounded">
                          <p className="text-sm text-muted-foreground">Currency</p>
                          <p className="font-medium">{account.currency}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

// Helper function
function cn(...classes: string[]): string {
  return classes.filter(Boolean).join(" ")
}