// app/dashboard/admin/loans/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import api from "@/utils/api"

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

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        setLoading(true)
        // Use the correct admin endpoint
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

    fetchLoans()
  }, [router])

  // Filter to show only pending loans at the top
  const pendingLoans = loans.filter(loan => loan.status === 'PENDING')
  const otherLoans = loans.filter(loan => loan.status !== 'PENDING')
  const sortedLoans = [...pendingLoans, ...otherLoans]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Loan Administration</h1>

      {error && (
        <div className="bg-destructive/15 text-destructive p-4 rounded-md">
          {error}
          <Button 
            variant="link" 
            className="ml-2 text-destructive" 
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Loan Applications</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-24">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {loans.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  No loan applications found
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User ID</TableHead>
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
                      <TableRow key={loan.id} className={loan.status === 'PENDING' ? 'bg-muted/50' : ''}>
                        <TableCell>{loan.userId.toString().slice(0, 8)}...</TableCell>
                        <TableCell>${loan.amount.toFixed(2)}</TableCell>
                        <TableCell>{loan.interest}%</TableCell>
                        <TableCell>${loan.repaymentAmount.toFixed(2)}</TableCell>
                        <TableCell>{new Date(loan.dueDate).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(loan.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={
                            loan.status === 'PENDING' ? 'secondary' :
                            loan.status === 'APPROVED' ? 'success' :
                            loan.status === 'REJECTED' ? 'destructive' :
                            'default'
                          }>
                            {loan.status.toLowerCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant={loan.status === 'PENDING' ? 'default' : 'outline'} 
                            onClick={() => router.push(`/dashboard/admin/loans/${loan.id}`)}
                          >
                            {loan.status === 'PENDING' ? 'Process' : 'View'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}