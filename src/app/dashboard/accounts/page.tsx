"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CreditCard, PiggyBank, Briefcase, Plus, ExternalLink, Download } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import api from "@/utils/api"

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
    const fetchData = async () => {
      try {
        // Fetch user accounts
        const accountsResponse = await api.get<Account[]>('/accounts/my-accounts')
        setAccounts(accountsResponse.data)

        // Fetch recent transactions
        const transactionsResponse = await api.get<Transaction[]>('/transactions')
        setTransactions(transactionsResponse.data)

      } catch (error) {
        console.error('Error fetching accounts data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <div className="flex justify-center p-8">Loading accounts...</div>
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Accounts</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              Add Account
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {accounts.map((account) => (
            <Card key={account.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {account.type === "CHECKING" && <CreditCard className="h-5 w-5 text-primary" />}
                    {account.type === "SAVINGS" && <PiggyBank className="h-5 w-5 text-primary" />}
                    {account.type === "INVESTMENT" && <Briefcase className="h-5 w-5 text-primary" />}
                    <CardTitle className="text-lg">{account.type} Account</CardTitle>
                  </div>
                  <Badge variant="outline">Active</Badge>
                </div>
                <CardDescription>●●●● {account.accountNumber.slice(-4)}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${account.balance.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Available Balance</p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm">
                  Details
                </Button>
                <Button variant="outline" size="sm" className="gap-1">
                  <ExternalLink className="h-4 w-4" />
                  Transfer
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="transactions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
            <TabsTrigger value="details">Account Details</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions">
            <Card>
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
                      <TableRow key={transaction.id}>
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
                            "text-right font-medium",
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
                <Button variant="outline" className="w-full">
                  View All Transactions
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Account Details</CardTitle>
                <CardDescription>View and manage your account details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {accounts.map((account) => (
                    <div key={account.id} className="rounded-lg border p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {account.type === "CHECKING" && <CreditCard className="h-5 w-5 text-primary" />}
                          {account.type === "SAVINGS" && <PiggyBank className="h-5 w-5 text-primary" />}
                          {account.type === "INVESTMENT" && <Briefcase className="h-5 w-5 text-primary" />}
                          <h3 className="font-medium">{account.type} Account</h3>
                        </div>
                        <Badge variant="outline">Active</Badge>
                      </div>
                      <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Account Number</p>
                          <p className="font-medium">●●●● {account.accountNumber.slice(-4)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Balance</p>
                          <p className="font-medium">${account.balance.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Type</p>
                          <p className="font-medium">{account.type}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Opened On</p>
                          <p className="font-medium">
                            {new Date(account.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
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