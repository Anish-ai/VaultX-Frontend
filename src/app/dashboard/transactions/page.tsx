"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowUpRight, ArrowDownRight, Search, Filter, Download } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { LoadingSpinner, TableLoader } from "@/components/loading-spinner"
import api from "@/utils/api"

type Transaction = {
  id: string;
  senderAccountNumber: string;
  receiverAccountNumber: string;
  type: "CREDIT" | "DEBIT";
  amount: number;
  createdAt: string;
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [filterType, setFilterType] = useState<"all" | "incoming" | "outgoing">("all")

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await api.get<Transaction[]>("/transactions")
        setTransactions(response.data)
      } catch (error) {
        console.error("Error fetching transactions:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [])

  // Filter transactions based on search and type
  const filteredTransactions = transactions
    .filter((transaction) => {
      const matchesSearch =
        transaction.senderAccountNumber.includes(searchQuery) ||
        transaction.receiverAccountNumber.includes(searchQuery)
      const matchesType =
        filterType === "all" ||
        (filterType === "incoming" && transaction.type === "CREDIT") ||
        (filterType === "outgoing" && transaction.type === "DEBIT")
      return matchesSearch && matchesType
    })

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="h-8 w-48 animate-pulse rounded bg-muted" />
            <div className="flex gap-2">
              <div className="h-8 w-32 animate-pulse rounded bg-muted" />
              <div className="h-8 w-32 animate-pulse rounded bg-muted" />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="h-10 w-full sm:w-[300px] animate-pulse rounded bg-muted" />
            <div className="h-10 w-10 animate-pulse rounded bg-muted" />
          </div>

          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-muted to-transparent animate-shimmer" />
            <CardHeader>
              <div className="h-6 w-40 animate-pulse rounded bg-muted" />
              <div className="h-4 w-60 animate-pulse rounded bg-muted" />
            </CardHeader>
            <CardContent>
              <TableLoader rows={5}/>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="h-4 w-40 animate-pulse rounded bg-muted" />
              <div className="flex gap-2">
                <div className="h-8 w-20 animate-pulse rounded bg-muted" />
                <div className="h-8 w-20 animate-pulse rounded bg-muted" />
              </div>
            </CardFooter>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1 transition-all hover:scale-105">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Link href="/dashboard/transactions/new">
              <Button size="sm" className="transition-all hover:scale-105">New Transaction</Button>
            </Link>
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <TabsList className="transition-all">
              <TabsTrigger 
                value="all" 
                onClick={() => setFilterType("all")}
                className="transition-all hover:bg-primary/10"
              >
                All
              </TabsTrigger>
              <TabsTrigger 
                value="incoming" 
                onClick={() => setFilterType("incoming")}
                className="transition-all hover:bg-primary/10"
              >
                Incoming
              </TabsTrigger>
              <TabsTrigger 
                value="outgoing" 
                onClick={() => setFilterType("outgoing")}
                className="transition-all hover:bg-primary/10"
              >
                Outgoing
              </TabsTrigger>
            </TabsList>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search transactions..."
                  className="w-full pl-8 sm:w-[300px] transition-all focus:ring-2 focus:ring-primary/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon" className="transition-all hover:scale-105">
                <Filter className="h-4 w-4" />
                <span className="sr-only">Filter</span>
              </Button>
            </div>
          </div>

          <TabsContent value="all">
            <Card className="transition-all hover:shadow-lg">
              <CardHeader>
                <CardTitle>All Transactions</CardTitle>
                <CardDescription>View all your recent transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => (
                      <TableRow 
                        key={transaction.id}
                        className="transition-all hover:bg-muted/50"
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div
                              className={cn(
                                "flex h-8 w-8 items-center justify-center rounded-full transition-all hover:scale-110",
                                transaction.type === "CREDIT"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-rose-100 text-rose-700",
                              )}
                            >
                              {transaction.type === "CREDIT" ? (
                                <ArrowUpRight className="h-4 w-4" />
                              ) : (
                                <ArrowDownRight className="h-4 w-4" />
                              )}
                            </div>
                            <div>
                              {transaction.senderAccountNumber} → {transaction.receiverAccountNumber}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{transaction.type}</TableCell>
                        <TableCell>{new Date(transaction.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell
                          className={cn(
                            "text-right font-medium transition-all hover:scale-105",
                            transaction.type === "CREDIT" ? "text-emerald-700" : "text-rose-700",
                          )}
                        >
                          {transaction.type === "CREDIT" ? "+" : "-"}${transaction.amount.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing <strong>{filteredTransactions.length}</strong> of <strong>{transactions.length}</strong> transactions
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled className="transition-all hover:scale-105">
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" className="transition-all hover:scale-105">
                    Next
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="incoming">
            <Card className="transition-all hover:shadow-lg">
              <CardHeader>
                <CardTitle>Incoming Transactions</CardTitle>
                <CardDescription>View all your incoming transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions
                      .filter((t) => t.type === "CREDIT")
                      .map((transaction) => (
                        <TableRow 
                          key={transaction.id}
                          className="transition-all hover:bg-muted/50"
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 transition-all hover:scale-110">
                                <ArrowUpRight className="h-4 w-4" />
                              </div>
                              <div>
                                {transaction.senderAccountNumber} → {transaction.receiverAccountNumber}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{new Date(transaction.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right font-medium text-emerald-700 transition-all hover:scale-105">
                            +${transaction.amount.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="outgoing">
            <Card className="transition-all hover:shadow-lg">
              <CardHeader>
                <CardTitle>Outgoing Transactions</CardTitle>
                <CardDescription>View all your outgoing transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions
                      .filter((t) => t.type === "DEBIT")
                      .map((transaction) => (
                        <TableRow 
                          key={transaction.id}
                          className="transition-all hover:bg-muted/50"
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-rose-700 transition-all hover:scale-110">
                                <ArrowDownRight className="h-4 w-4" />
                              </div>
                              <div>
                                {transaction.senderAccountNumber} → {transaction.receiverAccountNumber}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{new Date(transaction.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right font-medium text-rose-700 transition-all hover:scale-105">
                            -${transaction.amount.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
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