import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowUpRight, ArrowDownRight, Search, Filter, Download } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"

export default function TransactionsPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button size="sm">New Transaction</Button>
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="incoming">Incoming</TabsTrigger>
              <TabsTrigger value="outgoing">Outgoing</TabsTrigger>
            </TabsList>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search transactions..." className="w-full pl-8 sm:w-[300px]" />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
                <span className="sr-only">Filter</span>
              </Button>
            </div>
          </div>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>All Transactions</CardTitle>
                <CardDescription>View all your recent transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div
                              className={cn(
                                "flex h-8 w-8 items-center justify-center rounded-full",
                                transaction.type === "credit"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-rose-100 text-rose-700",
                              )}
                            >
                              {transaction.type === "credit" ? (
                                <ArrowUpRight className="h-4 w-4" />
                              ) : (
                                <ArrowDownRight className="h-4 w-4" />
                              )}
                            </div>
                            <div>{transaction.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>{transaction.category}</TableCell>
                        <TableCell>{transaction.date}</TableCell>
                        <TableCell
                          className={cn(
                            "text-right font-medium",
                            transaction.type === "credit" ? "text-emerald-700" : "text-rose-700",
                          )}
                        >
                          {transaction.type === "credit" ? "+" : "-"}${transaction.amount}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing <strong>10</strong> of <strong>42</strong> transactions
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm">
                    Next
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="incoming">
            <Card>
              <CardHeader>
                <CardTitle>Incoming Transactions</CardTitle>
                <CardDescription>View all your incoming transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allTransactions
                      .filter((t) => t.type === "credit")
                      .map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                                <ArrowUpRight className="h-4 w-4" />
                              </div>
                              <div>{transaction.description}</div>
                            </div>
                          </TableCell>
                          <TableCell>{transaction.category}</TableCell>
                          <TableCell>{transaction.date}</TableCell>
                          <TableCell className="text-right font-medium text-emerald-700">
                            +${transaction.amount}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="outgoing">
            <Card>
              <CardHeader>
                <CardTitle>Outgoing Transactions</CardTitle>
                <CardDescription>View all your outgoing transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allTransactions
                      .filter((t) => t.type === "debit")
                      .map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-rose-700">
                                <ArrowDownRight className="h-4 w-4" />
                              </div>
                              <div>{transaction.description}</div>
                            </div>
                          </TableCell>
                          <TableCell>{transaction.category}</TableCell>
                          <TableCell>{transaction.date}</TableCell>
                          <TableCell className="text-right font-medium text-rose-700">-${transaction.amount}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card>
          <CardHeader>
            <CardTitle>New Transaction</CardTitle>
            <CardDescription>Create a new transaction</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="type">Transaction Type</Label>
                  <Select defaultValue="debit">
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="debit">Outgoing (Debit)</SelectItem>
                      <SelectItem value="credit">Incoming (Credit)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <span className="text-muted-foreground">$</span>
                    </div>
                    <Input id="amount" type="number" placeholder="0.00" className="pl-7" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" placeholder="Enter transaction description" />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="shopping">Shopping</SelectItem>
                      <SelectItem value="food">Food & Dining</SelectItem>
                      <SelectItem value="bills">Bills & Utilities</SelectItem>
                      <SelectItem value="transportation">Transportation</SelectItem>
                      <SelectItem value="entertainment">Entertainment</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account">Account</Label>
                  <Select>
                    <SelectTrigger id="account">
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="checking">Main Checking Account</SelectItem>
                      <SelectItem value="savings">Savings Account</SelectItem>
                      <SelectItem value="investment">Investment Account</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline">Cancel</Button>
            <Button>Create Transaction</Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  )
}

// Sample data
const allTransactions = [
  {
    id: "1",
    description: "Salary Deposit",
    amount: "4,500.00",
    date: "Mar 10, 2023",
    category: "Income",
    type: "credit",
  },
  {
    id: "2",
    description: "Rent Payment",
    amount: "1,200.00",
    date: "Mar 5, 2023",
    category: "Housing",
    type: "debit",
  },
  {
    id: "3",
    description: "Grocery Store",
    amount: "85.75",
    date: "Mar 3, 2023",
    category: "Food & Dining",
    type: "debit",
  },
  {
    id: "4",
    description: "Freelance Payment",
    amount: "750.00",
    date: "Mar 2, 2023",
    category: "Income",
    type: "credit",
  },
  {
    id: "5",
    description: "Electric Bill",
    amount: "95.40",
    date: "Mar 1, 2023",
    category: "Bills & Utilities",
    type: "debit",
  },
  {
    id: "6",
    description: "Gas Station",
    amount: "45.00",
    date: "Feb 28, 2023",
    category: "Transportation",
    type: "debit",
  },
  {
    id: "7",
    description: "Investment Dividend",
    amount: "120.50",
    date: "Feb 25, 2023",
    category: "Income",
    type: "credit",
  },
  {
    id: "8",
    description: "Restaurant Dinner",
    amount: "78.25",
    date: "Feb 24, 2023",
    category: "Food & Dining",
    type: "debit",
  },
  {
    id: "9",
    description: "Mobile Phone Bill",
    amount: "65.00",
    date: "Feb 20, 2023",
    category: "Bills & Utilities",
    type: "debit",
  },
  {
    id: "10",
    description: "Client Payment",
    amount: "1,250.00",
    date: "Feb 15, 2023",
    category: "Income",
    type: "credit",
  },
]

// Helper function
function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ")
}

