import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowUpRight, ArrowDownRight, TrendingUp, PiggyBank, Briefcase, DollarSign } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"

export default function InvestmentsPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Investments</h1>
          <div className="flex items-center gap-2">
            <Button size="sm">New Investment</Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Portfolio</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$12,234.59</div>
              <div className="flex items-center text-xs text-emerald-500">
                <ArrowUpRight className="mr-1 h-3 w-3" />
                +12.3% ($1,345.23)
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stocks</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$8,674.25</div>
              <div className="flex items-center text-xs text-emerald-500">
                <ArrowUpRight className="mr-1 h-3 w-3" />
                +15.7% ($1,178.45)
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bonds</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$2,450.00</div>
              <div className="flex items-center text-xs text-rose-500">
                <ArrowDownRight className="mr-1 h-3 w-3" />
                -1.2% ($30.00)
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Crypto</CardTitle>
              <PiggyBank className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$1,110.34</div>
              <div className="flex items-center text-xs text-emerald-500">
                <ArrowUpRight className="mr-1 h-3 w-3" />
                +24.5% ($218.67)
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
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Shares</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead className="text-right">Return</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {investments.map((investment) => (
                      <TableRow key={investment.id}>
                        <TableCell className="font-medium">{investment.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{investment.type}</Badge>
                        </TableCell>
                        <TableCell>{investment.shares}</TableCell>
                        <TableCell>${investment.price}</TableCell>
                        <TableCell>${investment.value}</TableCell>
                        <TableCell className="text-right">
                          <span
                            className={cn(
                              "flex items-center justify-end font-medium",
                              Number.parseFloat(investment.return) >= 0 ? "text-emerald-500" : "text-rose-500",
                            )}
                          >
                            {Number.parseFloat(investment.return) >= 0 ? (
                              <ArrowUpRight className="mr-1 h-4 w-4" />
                            ) : (
                              <ArrowDownRight className="mr-1 h-4 w-4" />
                            )}
                            {investment.return}%
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
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
                  {opportunities.map((opportunity) => (
                    <Card key={opportunity.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{opportunity.name}</CardTitle>
                        <CardDescription>{opportunity.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium">Expected Return</p>
                            <p className="text-emerald-500 font-bold">{opportunity.expectedReturn}%</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Risk Level</p>
                            <Badge variant={opportunity.riskVariant}>{opportunity.risk}</Badge>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button className="w-full">Invest Now</Button>
                      </CardFooter>
                    </Card>
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
const assetAllocation = [
  {
    name: "Stocks",
    value: "8,674.25",
    percentage: 70,
    color: "bg-blue-500",
    progressColor: "bg-blue-500",
  },
  {
    name: "Bonds",
    value: "2,450.00",
    percentage: 20,
    color: "bg-green-500",
    progressColor: "bg-green-500",
  },
  {
    name: "Crypto",
    value: "1,110.34",
    percentage: 10,
    color: "bg-orange-500",
    progressColor: "bg-orange-500",
  },
]

const investments = [
  {
    id: "1",
    name: "Apple Inc.",
    type: "Stock",
    shares: "10",
    price: "175.25",
    value: "1,752.50",
    return: "+15.3",
  },
  {
    id: "2",
    name: "Microsoft Corp.",
    type: "Stock",
    shares: "8",
    price: "320.45",
    value: "2,563.60",
    return: "+22.7",
  },
  {
    id: "3",
    name: "US Treasury Bond",
    type: "Bond",
    shares: "5",
    price: "490.00",
    value: "2,450.00",
    return: "-1.2",
  },
  {
    id: "4",
    name: "Bitcoin",
    type: "Crypto",
    shares: "0.02",
    price: "42,500.00",
    value: "850.00",
    return: "+32.5",
  },
  {
    id: "5",
    name: "Ethereum",
    type: "Crypto",
    shares: "0.15",
    price: "1,735.60",
    value: "260.34",
    return: "+18.7",
  },
  {
    id: "6",
    name: "Amazon.com Inc.",
    type: "Stock",
    shares: "4",
    price: "145.50",
    value: "582.00",
    return: "+8.4",
  },
  {
    id: "7",
    name: "Tesla Inc.",
    type: "Stock",
    shares: "6",
    price: "212.85",
    value: "1,277.10",
    return: "-5.2",
  },
]

const opportunities = [
  {
    id: "1",
    name: "Tech Growth Fund",
    description: "High-growth technology companies portfolio",
    expectedReturn: "12-15",
    risk: "Moderate",
    riskVariant: "outline",
  },
  {
    id: "2",
    name: "Sustainable Energy",
    description: "Renewable energy investment portfolio",
    expectedReturn: "8-12",
    risk: "Low",
    riskVariant: "secondary",
  },
  {
    id: "3",
    name: "Crypto Index Fund",
    description: "Diversified cryptocurrency portfolio",
    expectedReturn: "20-30",
    risk: "High",
    riskVariant: "destructive",
  },
]

// Helper function
function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ")
}

