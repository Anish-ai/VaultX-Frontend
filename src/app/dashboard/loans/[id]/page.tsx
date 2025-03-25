"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Calendar, DollarSign, Percent, Clock } from "lucide-react"
import { LoadingSpinner } from "@/components/loading-spinner"
import api from "@/utils/api"
import DashboardLayout from "@/components/dashboard-layout"

type LoanDetails = {
  id: string
  amount: number
  interest: number
  status: "PENDING" | "APPROVED" | "REJECTED" | "REPAID"
  dueDate: string
  createdAt: string
  repaymentAmount: number
  daysRemaining: number
  user?: {
    id: string
    name: string
    email: string
  }
}

export default function LoanDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loan, setLoan] = useState<LoanDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLoanDetails = async () => {
      try {
        setLoading(true)
        const response = await api.get(`/loans/${params.id}`)
        
        if (response.data.success) {
          setLoan(response.data.data)
        } else {
          setError(response.data.message || "Failed to load loan details")
        }
      } catch (error: unknown) {
        console.error("Loan details fetch failed:", error)
        if (error && typeof error === 'object' && 'response' in error && 
            error.response && typeof error.response === 'object') {
          if ('status' in error.response && error.response.status === 401) {
            router.push('/login')
          } else if ('data' in error.response && typeof error.response.data === 'object' && 
                     error.response.data && 'message' in error.response.data) {
            setError(error.response.data.message as string)
          } else {
            setError("Failed to load loan details")
          }
        } else {
          setError("An unexpected error occurred")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchLoanDetails()
  }, [params.id, router])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col gap-4">
          <Button 
            variant="ghost" 
            onClick={() => router.back()} 
            className="flex items-center gap-2 w-fit transition-all hover:scale-105"
            disabled
          >
            <ArrowLeft size={16} />
            Back to Loans
          </Button>
          
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-muted to-transparent animate-shimmer" />
            <CardHeader>
              <div className="h-8 w-48 animate-pulse rounded bg-muted" />
              <div className="h-4 w-64 animate-pulse rounded bg-muted" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-3 w-32 animate-pulse rounded bg-muted" />
                      <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="h-px w-full bg-muted" />
              <div className="space-y-2">
                <div className="h-4 w-40 animate-pulse rounded bg-muted" />
                <div className="h-3 w-full animate-pulse rounded bg-muted" />
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !loan) {
    return (
      <DashboardLayout>
        <div className="flex flex-col gap-4">
          <Button 
            variant="ghost" 
            onClick={() => router.back()} 
            className="flex items-center gap-2 w-fit transition-all hover:scale-105"
          >
            <ArrowLeft size={16} />
            Back to Loans
          </Button>
          
          <Card className="transition-all hover:shadow-lg">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <p className="text-destructive">{error || "Loan not found"}</p>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/dashboard/loans')}
                  className="mt-4 transition-all hover:scale-105"
                >
                  Return to Loans
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <Button 
          variant="ghost" 
          onClick={() => router.back()} 
          className="flex items-center gap-2 w-fit transition-all hover:scale-105"
        >
          <ArrowLeft size={16} />
          Back to Loans
        </Button>
        
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Loan Details</h1>
          <Badge 
            className="text-md px-3 py-1 transition-all hover:scale-105" 
            variant={
              loan.status === 'PENDING' ? 'outline' :
              loan.status === 'APPROVED' ? 'success' :
              loan.status === 'REJECTED' ? 'destructive' : 'default'
            }
          >
            {loan.status.toLowerCase()}
          </Badge>
        </div>

        <Card className="transition-all hover:shadow-lg">
          <CardHeader>
            <CardTitle>Loan #{loan.id}</CardTitle>
            <CardDescription>
              Applied on {new Date(loan.createdAt).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 transition-all hover:bg-muted/50 p-2 rounded-lg">
                  <DollarSign className="text-muted-foreground" size={20} />
                  <div>
                    <p className="text-sm text-muted-foreground">Loan Amount</p>
                    <p className="font-medium">${loan.amount.toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 transition-all hover:bg-muted/50 p-2 rounded-lg">
                  <Percent className="text-muted-foreground" size={20} />
                  <div>
                    <p className="text-sm text-muted-foreground">Interest Rate</p>
                    <p className="font-medium">{loan.interest}%</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 transition-all hover:bg-muted/50 p-2 rounded-lg">
                  <DollarSign className="text-muted-foreground" size={20} />
                  <div>
                    <p className="text-sm text-muted-foreground">Repayment Amount</p>
                    <p className="font-medium">${loan.repaymentAmount.toFixed(2)}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2 transition-all hover:bg-muted/50 p-2 rounded-lg">
                  <Calendar className="text-muted-foreground" size={20} />
                  <div>
                    <p className="text-sm text-muted-foreground">Due Date</p>
                    <p className="font-medium">{new Date(loan.dueDate).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 transition-all hover:bg-muted/50 p-2 rounded-lg">
                  <Clock className="text-muted-foreground" size={20} />
                  <div>
                    <p className="text-sm text-muted-foreground">Days Remaining</p>
                    <p className="font-medium">
                      {loan.status === 'APPROVED' ? 
                        (loan.daysRemaining > 0 ? 
                          `${loan.daysRemaining} days` : 
                          "Past due") : 
                        "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <h3 className="font-medium">Status Information</h3>
              <p className="text-sm text-muted-foreground">
                {loan.status === 'PENDING' && "Your loan application is currently under review. We'll notify you once a decision has been made."}
                {loan.status === 'APPROVED' && `Your loan has been approved. The amount has been credited to your account. Please ensure repayment by ${new Date(loan.dueDate).toLocaleDateString()}.`}
                {loan.status === 'REJECTED' && "Unfortunately, your loan application has been rejected. Please contact customer support for more information."}
                {loan.status === 'REPAID' && "This loan has been fully repaid. Thank you for your business."}
              </p>
            </div>
            
            {loan.status === 'APPROVED' && (
              <div className="pt-4">
                <Button 
                  variant="default" 
                  className="w-full transition-all hover:scale-105"
                >
                  Make Payment
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}