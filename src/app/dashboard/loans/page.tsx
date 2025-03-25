"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LoanApplyDialog } from "@/components/loan-apply-dialog"
import { LoadingSpinner, TableLoader } from "@/components/loading-spinner"
import api from "@/utils/api"
import DashboardLayout from "@/components/dashboard-layout"

type Loan = {
  id: string
  amount: number
  interest: number
  status: "PENDING" | "APPROVED" | "REJECTED" | "REPAID"
  dueDate: string
  createdAt: string
  accountNumber?: string
  repaymentAmount: number
}

export default function LoansPage() {
  const router = useRouter()
  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)

  const fetchLoans = async () => {
    try {
      setLoading(true)
      const response = await api.get('/loans/my-loans')
      
      if (response.data.success) {
        setLoans(response.data.data)
      }
    } catch (error: unknown) {
      console.error("Loan fetch failed:", error)
      if (error && typeof error === 'object' && 'response' in error && 
          error.response && typeof error.response === 'object' && 
          'status' in error.response && error.response.status === 401) {
        router.push('/auth/login')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLoans()
  }, [router])

  const getStatusBadge = (status: string) => (
    <Badge 
      variant={
        status === 'PENDING' ? 'outline' :
        status === 'APPROVED' ? 'success' :
        status === 'REJECTED' ? 'destructive' : 'default'
      }
      className="transition-all hover:scale-105"
    >
      {status.toLowerCase()}
    </Badge>
  )

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="h-8 w-48 animate-pulse rounded bg-muted" />
            <div className="h-9 w-32 animate-pulse rounded bg-muted" />
          </div>

          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-muted to-transparent animate-shimmer" />
            <CardHeader>
              <div className="h-6 w-40 animate-pulse rounded bg-muted" />
            </CardHeader>
            <CardContent>
              <TableLoader rows={5}/>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Your Loan Applications</h1>
          <LoanApplyDialog onSuccess={fetchLoans} />
        </div>

        <Card className="transition-all hover:shadow-lg">
          <CardHeader>
            <CardTitle>Loan History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Interest</TableHead>
                  <TableHead>Repayment</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Applied On</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loans.map(loan => (
                  <TableRow key={loan.id} className="transition-all hover:bg-muted/50">
                    <TableCell>${loan.amount.toFixed(2)}</TableCell>
                    <TableCell>{getStatusBadge(loan.status)}</TableCell>
                    <TableCell>{loan.interest}%</TableCell>
                    <TableCell>${loan.repaymentAmount.toFixed(2)}</TableCell>
                    <TableCell>{new Date(loan.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(loan.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        onClick={() => router.push(`/dashboard/loans/${loan.id}`)}
                        className="transition-all hover:scale-105"
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {loans.length === 0 && (
              <div className="py-6 text-center text-muted-foreground transition-all hover:text-foreground">
                No loan applications found
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}