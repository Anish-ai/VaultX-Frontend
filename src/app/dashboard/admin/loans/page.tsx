"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LoadingSpinner, TableLoader } from "@/components/loading-spinner"
import api from "@/utils/api"
import DashboardLayout from "@/components/dashboard-layout"

type AdminLoan = {
  id: string
  amount: number
  interest: number
  status: "PENDING" | "APPROVED" | "REJECTED" | "REPAID"
  dueDate: string
  createdAt: string
  userId: string
  repaymentAmount: number
  user?: {
    name: string
    email: string
  }
}

export default function AdminLoansPage() {
  const router = useRouter()
  const [loans, setLoans] = useState<AdminLoan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLoans = async () => {
    try {
      setLoading(true)
      const response = await api.get('/loans/admin/all')
      
      if (response.data.success) {
        setLoans(response.data.data)
      } else {
        setError(response.data.message || "Failed to fetch loans")
      }
    } catch (error: unknown) {
      console.error("Loan fetch failed:", error)
      if (error && typeof error === 'object' && 'response' in error && 
          error.response && typeof error.response === 'object') {
        if ('status' in error.response) {
          if (error.response.status === 401) {
            router.push('/login')
          } else if (error.response.status === 403) {
            router.push('/dashboard')
          }
        }
        
        if ('data' in error.response && 
            typeof error.response.data === 'object' && 
            error.response.data && 
            'message' in error.response.data) {
          setError(error.response.data.message as string)
        } else {
          setError("Failed to load loans. Please check your permissions.")
        }
      } else {
        setError("An unexpected error occurred while fetching loans")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLoans()
  }, [router])

  // Filter to show only pending loans at the top
  const pendingLoans = loans.filter(loan => loan.status === 'PENDING')
  const otherLoans = loans.filter(loan => loan.status !== 'PENDING')
  const sortedLoans = [...pendingLoans, ...otherLoans]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Loan Administration</h1>
        </div>

        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="text-destructive">{error}</div>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.reload()}
                  className="transition-all hover:scale-105"
                >
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="transition-all hover:shadow-lg">
          <CardHeader>
            <CardTitle>Loan Applications</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <TableLoader rows={5}/>
            ) : loans.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="text-muted-foreground mb-4">No loan applications found</div>
                <Button 
                  variant="outline" 
                  onClick={() => fetchLoans()}
                  className="transition-all hover:scale-105"
                >
                  Refresh
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Interest</TableHead>
                    <TableHead>Repayment</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Applied On</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedLoans.map(loan => (
                    <TableRow 
                      key={loan.id} 
                      className={`transition-all ${loan.status === 'PENDING' ? 'bg-muted/50 hover:bg-muted/70' : 'hover:bg-muted/50'}`}
                    >
                      <TableCell className="font-medium">
                        {loan.user?.name || `User ${loan.userId.toString().slice(0, 8)}...`}
                      </TableCell>
                      <TableCell>${loan.amount.toFixed(2)}</TableCell>
                      <TableCell>{loan.interest}%</TableCell>
                      <TableCell>${loan.repaymentAmount.toFixed(2)}</TableCell>
                      <TableCell>{new Date(loan.dueDate).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(loan.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            loan.status === 'PENDING' ? 'secondary' :
                            loan.status === 'APPROVED' ? 'success' :
                            loan.status === 'REJECTED' ? 'destructive' :
                            'default'
                          }
                          className="transition-all hover:scale-105"
                        >
                          {loan.status.toLowerCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant={loan.status === 'PENDING' ? 'default' : 'outline'} 
                          onClick={() => router.push(`/dashboard/admin/loans/${loan.id}`)}
                          className="transition-all hover:scale-105"
                        >
                          {loan.status === 'PENDING' ? 'Process' : 'View'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}