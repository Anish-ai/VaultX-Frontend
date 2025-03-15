"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, ArrowDownRight, DollarSign, CreditCard, PiggyBank, ArrowRight } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import api from "@/utils/api"

export default function DashboardPage() {
  interface DashboardData {
    totalBalance: number;
    netTransactions: number;
    totalAssets: number;
    totalInvestments: number;
  }

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  interface Transaction {
    id: string;
    type: 'CREDIT' | 'DEBIT';
    senderAccountNumber: string;
    receiverAccountNumber: string;
    amount: number;
    createdAt: string;
  }

  const [transactions, setTransactions] = useState<Transaction[]>([])
  interface Account {
    id: string;
    type: string;
    accountNumber: string;
    balance: number;
  }

  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch dashboard overview data
        const overviewResponse = await api.get('/dashboard/overview')
        setDashboardData(overviewResponse.data)

        // Fetch recent transactions
        const transactionsResponse = await api.get('/transactions')
        setTransactions(transactionsResponse.data)

        // Fetch user accounts
        const accountsResponse = await api.get('/accounts/my-accounts')
        setAccounts(accountsResponse.data)

      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <div className="flex justify-center p-8">Loading dashboard...</div>
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              Download Statement
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Total Balance */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${dashboardData?.totalBalance?.toFixed(2)}
                  </div>
                </CardContent>
              </Card>

              {/* Transactions Net Change */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Transactions Net</CardTitle>
                  {(dashboardData?.netTransactions ?? 0) >= 0 ? (
                    <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-rose-500" />
                  )}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${dashboardData?.netTransactions?.toFixed(2)}
                  </div>
                </CardContent>
              </Card>

              {/* Assets Total Value */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Assets Value</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${dashboardData?.totalAssets?.toFixed(2)}
                  </div>
                </CardContent>
              </Card>

              {/* Investments Total */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Investments</CardTitle>
                  <PiggyBank className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${dashboardData?.totalInvestments?.toFixed(2)}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              {/* Recent Transactions */}
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>Your recent financial activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {transactions.slice(0, 5).map((transaction) => (
                      <div key={transaction.id} className="flex items-center gap-4">
                        <div className={
                          transaction.type === 'CREDIT' 
                            ? "bg-emerald-100 text-emerald-700 p-2 rounded-full"
                            : "bg-rose-100 text-rose-700 p-2 rounded-full"
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
                        <div className={`font-medium ${
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
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Your Accounts</CardTitle>
                  <CardDescription>Connected bank accounts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {accounts.map((account) => (
                      <div key={account.id} className="flex items-center gap-4">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <CreditCard className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{account.type} Account</p>
                          <p className="text-sm text-muted-foreground">
                            ●●●● {account.accountNumber.slice(-4)}
                          </p>
                        </div>
                        <div className="font-medium">
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
            <Card>
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