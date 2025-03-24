"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LoanApplyDialog } from "@/components/loan-apply-dialog"
import api from "@/utils/api"
import DashboardLayout from "@/components/dashboard-layout" // Import the DashboardLayout

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
    <Badge variant={
      status === 'PENDING' ? 'outline' :
      status === 'APPROVED' ? 'success' :
      status === 'REJECTED' ? 'destructive' : 'default'
    }>
      {status.toLowerCase()}
    </Badge>
  )

  return (
    <DashboardLayout> {/* Wrap the content with DashboardLayout */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Your Loan Applications</h1>
          <LoanApplyDialog onSuccess={fetchLoans} />
        </div>

        <Card>
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
                  <TableRow key={loan.id}>
                    <TableCell>${loan.amount.toFixed(2)}</TableCell>
                    <TableCell>{getStatusBadge(loan.status)}</TableCell>
                    <TableCell>{loan.interest}%</TableCell>
                    <TableCell>${loan.repaymentAmount.toFixed(2)}</TableCell>
                    <TableCell>{new Date(loan.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(loan.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button variant="outline" 
                        onClick={() => router.push(`/dashboard/loans/${loan.id}`)}>
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {!loading && loans.length === 0 && (
              <div className="py-6 text-center text-muted-foreground">
                No loan applications found
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}