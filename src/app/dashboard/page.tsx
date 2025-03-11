import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, ArrowDownRight, DollarSign, CreditCard, PiggyBank, ArrowRight } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              Download
            </Button>
            <Button size="sm">Add Funds</Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$45,231.89</div>
                  <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Income</CardTitle>
                  <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$7,350.00</div>
                  <p className="text-xs text-muted-foreground">+8.2% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Expenses</CardTitle>
                  <ArrowDownRight className="h-4 w-4 text-rose-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$3,850.50</div>
                  <p className="text-xs text-muted-foreground">+4.5% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Investments</CardTitle>
                  <PiggyBank className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$12,234.59</div>
                  <p className="text-xs text-muted-foreground">+12.3% from last month</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>Your recent financial activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {transactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center gap-4">
                        <div
                          className={cn(
                            "flex h-9 w-9 items-center justify-center rounded-full",
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
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium leading-none">{transaction.description}</p>
                          <p className="text-xs text-muted-foreground">{transaction.date}</p>
                        </div>
                        <div
                          className={cn(
                            "text-sm font-medium",
                            transaction.type === "credit" ? "text-emerald-700" : "text-rose-700",
                          )}
                        >
                          {transaction.type === "credit" ? "+" : "-"}${transaction.amount}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-center">
                    <Button variant="outline" size="sm" className="gap-1">
                      View All Transactions
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Your Accounts</CardTitle>
                  <CardDescription>Manage your connected accounts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {accounts.map((account) => (
                      <div key={account.id} className="flex items-center gap-4">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                          <CreditCard className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium leading-none">{account.name}</p>
                          <p className="text-xs text-muted-foreground">{account.number}</p>
                        </div>
                        <div className="text-sm font-medium">${account.balance}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-center">
                    <Button variant="outline" size="sm" className="gap-1">
                      Add New Account
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>View detailed analytics of your financial activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center border rounded-md">
                  <p className="text-muted-foreground">Analytics charts will be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Reports</CardTitle>
                <CardDescription>Generate and download financial reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center border rounded-md">
                  <p className="text-muted-foreground">Reports will be displayed here</p>
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
const transactions = [
  {
    id: "1",
    description: "Deposit from Bank Transfer",
    amount: "2,500.00",
    date: "Today, 2:34 PM",
    type: "credit",
  },
  {
    id: "2",
    description: "Netflix Subscription",
    amount: "14.99",
    date: "Yesterday, 6:10 PM",
    type: "debit",
  },
  {
    id: "3",
    description: "Grocery Store Purchase",
    amount: "56.32",
    date: "Mar 8, 11:45 AM",
    type: "debit",
  },
  {
    id: "4",
    description: "Salary Deposit",
    amount: "4,500.00",
    date: "Mar 1, 9:00 AM",
    type: "credit",
  },
  {
    id: "5",
    description: "Electric Bill Payment",
    amount: "85.75",
    date: "Feb 28, 3:20 PM",
    type: "debit",
  },
]

const accounts = [
  {
    id: "1",
    name: "Main Checking Account",
    number: "•••• 4582",
    balance: "32,456.78",
  },
  {
    id: "2",
    name: "Savings Account",
    number: "•••• 7291",
    balance: "12,234.59",
  },
  {
    id: "3",
    name: "Investment Account",
    number: "•••• 3948",
    balance: "8,674.25",
  },
]

// Helper function
function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ")
}

