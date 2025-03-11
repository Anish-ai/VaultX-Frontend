import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CreditCard, PiggyBank, Briefcase, Plus, ExternalLink, Download } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"

export default function AccountsPage() {
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
                    {account.icon === "credit-card" && <CreditCard className="h-5 w-5 text-primary" />}
                    {account.icon === "piggy-bank" && <PiggyBank className="h-5 w-5 text-primary" />}
                    {account.icon === "briefcase" && <Briefcase className="h-5 w-5 text-primary" />}
                    <CardTitle className="text-lg">{account.name}</CardTitle>
                  </div>
                  <Badge variant={account.status === "Active" ? "outline" : "secondary"}>{account.status}</Badge>
                </div>
                <CardDescription>{account.number}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${account.balance}</div>
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
            <TabsTrigger value="statements">Statements</TabsTrigger>
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
                    {recentTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">{transaction.description}</TableCell>
                        <TableCell>{transaction.account}</TableCell>
                        <TableCell>{transaction.date}</TableCell>
                        <TableCell
                          className={cn(
                            "text-right font-medium",
                            transaction.amount.startsWith("+") ? "text-emerald-700" : "text-rose-700",
                          )}
                        >
                          {transaction.amount}
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

          <TabsContent value="statements">
            <Card>
              <CardHeader>
                <CardTitle>Account Statements</CardTitle>
                <CardDescription>View and download your account statements</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Account</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Date Generated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {statements.map((statement) => (
                      <TableRow key={statement.id}>
                        <TableCell className="font-medium">{statement.account}</TableCell>
                        <TableCell>{statement.period}</TableCell>
                        <TableCell>{statement.dateGenerated}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" className="gap-1">
                            <Download className="h-4 w-4" />
                            Download
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
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
                          {account.icon === "credit-card" && <CreditCard className="h-5 w-5 text-primary" />}
                          {account.icon === "piggy-bank" && <PiggyBank className="h-5 w-5 text-primary" />}
                          {account.icon === "briefcase" && <Briefcase className="h-5 w-5 text-primary" />}
                          <h3 className="font-medium">{account.name}</h3>
                        </div>
                        <Badge variant={account.status === "Active" ? "outline" : "secondary"}>{account.status}</Badge>
                      </div>
                      <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Account Number</p>
                          <p className="font-medium">{account.number}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Balance</p>
                          <p className="font-medium">${account.balance}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Type</p>
                          <p className="font-medium">{account.type}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Opened On</p>
                          <p className="font-medium">{account.openedOn}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Interest Rate</p>
                          <p className="font-medium">{account.interestRate}%</p>
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

// Sample data
const accounts = [
  {
    id: "1",
    name: "Main Checking Account",
    number: "•••• 4582",
    balance: "32,456.78",
    status: "Active",
    type: "Checking",
    openedOn: "Jan 15, 2020",
    interestRate: "0.01",
    icon: "credit-card",
  },
  {
    id: "2",
    name: "Savings Account",
    number: "•••• 7291",
    balance: "12,234.59",
    status: "Active",
    type: "Savings",
    openedOn: "Mar 22, 2020",
    interestRate: "0.5",
    icon: "piggy-bank",
  },
  {
    id: "3",
    name: "Investment Account",
    number: "•••• 3948",
    balance: "8,674.25",
    status: "Active",
    type: "Investment",
    openedOn: "Jul 10, 2021",
    interestRate: "Variable",
    icon: "briefcase",
  },
]

const recentTransactions = [
  {
    id: "1",
    description: "Salary Deposit",
    account: "Main Checking",
    date: "Mar 10, 2023",
    amount: "+$4,500.00",
  },
  {
    id: "2",
    description: "Rent Payment",
    account: "Main Checking",
    date: "Mar 5, 2023",
    amount: "-$1,200.00",
  },
  {
    id: "3",
    description: "Grocery Store",
    account: "Main Checking",
    date: "Mar 3, 2023",
    amount: "-$85.75",
  },
  {
    id: "4",
    description: "Interest Payment",
    account: "Savings",
    date: "Mar 1, 2023",
    amount: "+$5.12",
  },
  {
    id: "5",
    description: "Dividend Payment",
    account: "Investment",
    date: "Feb 28, 2023",
    amount: "+$120.50",
  },
]

const statements = [
  {
    id: "1",
    account: "Main Checking",
    period: "February 2023",
    dateGenerated: "Mar 1, 2023",
  },
  {
    id: "2",
    account: "Main Checking",
    period: "January 2023",
    dateGenerated: "Feb 1, 2023",
  },
  {
    id: "3",
    account: "Savings",
    period: "February 2023",
    dateGenerated: "Mar 1, 2023",
  },
  {
    id: "4",
    account: "Savings",
    period: "January 2023",
    dateGenerated: "Feb 1, 2023",
  },
  {
    id: "5",
    account: "Investment",
    period: "Q1 2023",
    dateGenerated: "Apr 1, 2023",
  },
]

// Helper function
function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ")
}

