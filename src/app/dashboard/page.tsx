"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, ArrowDownRight, DollarSign, CreditCard, PiggyBank, ArrowRight } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { LoadingSpinner, TableLoader } from "@/components/loading-spinner"
import api from "@/utils/api"

export default function DashboardPage() {
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)

  interface DashboardData {
    totalBalance: number;
    netTransactions: number;
    totalAssets: number;
    totalInvestments: number;
  }

  interface Transaction {
    id: string;
    type: 'CREDIT' | 'DEBIT';
    senderAccountNumber: string;
    receiverAccountNumber: string;
    amount: number;
    createdAt: string;
  }

  interface Account {
    id: string;
    type: string;
    accountNumber: string;
    balance: number;
  }

  useEffect(() => {
    const checkTokenAndFetchData = async () => {
      try {
        const token = localStorage.getItem("token")
        console.log("Token:", token)

        if (!token) {
          throw new Error("No token found")
        }

        const userResponse = await api.get("/auth/verify-token", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const userId = userResponse

        if (!userId) {
          throw new Error("Invalid token or user ID not found")
        }

        setTokenValid(true)

        const overviewResponse = await api.get("/dashboard/overview", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setDashboardData(overviewResponse.data)

        const transactionsResponse = await api.get("/transactions", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setTransactions(transactionsResponse.data)

        const accountsResponse = await api.get("/accounts/my-accounts", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setAccounts(accountsResponse.data)

      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        setTokenValid(false)
        router.push("/signup")
      } finally {
        setLoading(false)
      }
    }

    checkTokenAndFetchData()
  }, [router])

  if (!tokenValid) {
    return null
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="h-8 w-48 animate-pulse rounded bg-muted" />
            <div className="h-8 w-32 animate-pulse rounded bg-muted" />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array(4).fill(0).map((_, i) => (
              <Card key={i} className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-muted to-transparent animate-shimmer" />
                <CardHeader className="space-y-2">
                  <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                  <div className="h-6 w-32 animate-pulse rounded bg-muted" />
                </CardHeader>
                <CardContent>
                  <div className="h-8 w-40 animate-pulse rounded bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <div className="h-6 w-40 animate-pulse rounded bg-muted" />
                <div className="h-4 w-60 animate-pulse rounded bg-muted" />
              </CardHeader>
              <CardContent>
                <TableLoader rows={5} />
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <div className="h-6 w-40 animate-pulse rounded bg-muted" />
                <div className="h-4 w-60 animate-pulse rounded bg-muted" />
              </CardHeader>
              <CardContent>
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 mb-4">
                    <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
                      <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
                    </div>
                    <div className="h-4 w-16 rounded bg-muted animate-pulse" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="transition-all hover:scale-105">
              Download Statement
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="transition-all">
            <TabsTrigger value="overview" className="transition-all hover:bg-primary/10">Overview</TabsTrigger>
            <TabsTrigger value="analytics" className="transition-all hover:bg-primary/10">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Total Balance */}
              <Card className="transition-all hover:shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold transition-all hover:scale-105">
                    ${dashboardData?.totalBalance?.toFixed(2)}
                  </div>
                </CardContent>
              </Card>

              {/* Transactions Net Change */}
              <Card className="transition-all hover:shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Transactions Net</CardTitle>
                  {(dashboardData?.netTransactions ?? 0) >= 0 ? (
                    <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-rose-500" />
                  )}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold transition-all hover:scale-105">
                    ${dashboardData?.netTransactions?.toFixed(2)}
                  </div>
                </CardContent>
              </Card>

              {/* Assets Total Value */}
              <Card className="transition-all hover:shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Assets Value</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold transition-all hover:scale-105">
                    ${dashboardData?.totalAssets?.toFixed(2)}
                  </div>
                </CardContent>
              </Card>

              {/* Investments Total */}
              <Card className="transition-all hover:shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Investments</CardTitle>
                  <PiggyBank className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold transition-all hover:scale-105">
                    ${dashboardData?.totalInvestments?.toFixed(2)}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              {/* Recent Transactions */}
              <Card className="col-span-4 transition-all hover:shadow-lg">
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>Your recent financial activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {transactions.slice(0, 5).map((transaction) => (
                      <div 
                        key={transaction.id} 
                        className="flex items-center gap-4 transition-all hover:bg-muted/50 p-2 rounded-lg"
                      >
                        <div className={
                          transaction.type === 'CREDIT' 
                            ? "bg-emerald-100 text-emerald-700 p-2 rounded-full transition-all hover:scale-110"
                            : "bg-rose-100 text-rose-700 p-2 rounded-full transition-all hover:scale-110"
                        }>
                          {transaction.type === 'CREDIT' ? (
                            <ArrowUpRight className="h-4 w-4" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{transaction.senderAccountNumber} → {transaction.receiverAccountNumber}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className={`font-medium transition-all hover:scale-105 ${
                          transaction.type === 'CREDIT' ? 'text-emerald-700' : 'text-rose-700'
                        }`}>
                          {transaction.type === 'CREDIT' ? '+' : '-'}${transaction.amount.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Your Accounts */}
              <Card className="col-span-3 transition-all hover:shadow-lg">
                <CardHeader>
                  <CardTitle>Your Accounts</CardTitle>
                  <CardDescription>Connected bank accounts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {accounts.map((account) => (
                      <div 
                        key={account.id} 
                        className="flex items-center gap-4 transition-all hover:bg-muted/50 p-2 rounded-lg"
                      >
                        <div className="bg-primary/10 p-2 rounded-full transition-all hover:scale-110">
                          <CreditCard className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{account.type} Account</p>
                          <p className="text-sm text-muted-foreground">
                            ●●●● {account.accountNumber.slice(-4)}
                          </p>
                        </div>
                        <div className="font-medium transition-all hover:scale-105">
                          ${account.balance.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card className="transition-all hover:shadow-lg">
              <CardHeader>
                <CardTitle>Financial Analytics</CardTitle>
                <CardDescription>Monthly financial overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center border rounded-md">
                  <p className="text-muted-foreground">Analytics charts coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}