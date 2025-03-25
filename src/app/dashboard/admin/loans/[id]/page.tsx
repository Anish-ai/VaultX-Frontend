"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Calendar, DollarSign, Percent, Clock, User, Mail } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
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
  userId: string
  user?: {
    id: string
    name: string
    email: string
  }
}

export default function AdminLoanDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loan, setLoan] = useState<LoanDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [action, setAction] = useState<'approve' | 'reject' | null>(null)
  const [accountNumber, setAccountNumber] = useState("")
  const [reason, setReason] = useState("")

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

  const handleProcessLoan = async () => {
    if (!action) {
      setError("Please select an action (approve or reject)")
      return
    }

    if (action === 'approve' && !accountNumber) {
      setError("Account number is required for approval")
      return
    }

    setProcessing(true)
    setError(null)

    try {
      const response = await api.put(`/loans/${params.id}/process`, {
        action,
        accountNumber: action === 'approve' ? accountNumber : undefined,
        reason
      })

      if (response.data.success) {
        const updatedLoan = await api.get(`/loans/${params.id}`)
        if (updatedLoan.data.success) {
          setLoan(updatedLoan.data.data)
          setAction(null)
          setAccountNumber("")
          setReason("")
        }
      } else {
        throw new Error(response.data.message || "Failed to process loan")
      }
    } catch (error: unknown) {
      console.error("Loan processing failed:", error)
      if (error && typeof error === 'object' && 'response' in error && 
          error.response && typeof error.response === 'object' &&
          'data' in error.response && typeof error.response.data === 'object' && 
          error.response.data && 'message' in error.response.data) {
        setError(error.response.data.message as string)
      } else if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("An unexpected error occurred")
      }
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col gap-4">
          <div className="h-8 w-32 animate-pulse rounded bg-muted" />
          
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-muted to-transparent animate-shimmer" />
            <CardHeader>
              <div className="h-8 w-48 animate-pulse rounded bg-muted" />
              <div className="h-4 w-64 animate-pulse rounded bg-muted" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="h-24 w-full animate-pulse rounded bg-muted" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 5 }).map((_, i) => (
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
              
              <div className="space-y-4">
                <div className="h-6 w-40 animate-pulse rounded bg-muted" />
                <div className="h-32 w-full animate-pulse rounded bg-muted" />
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
          
          <Card className="border-destructive transition-all hover:shadow-lg">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <p className="text-destructive">{error || "Loan not found"}</p>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/dashboard/admin/loans')}
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
          <h1 className="text-2xl font-bold tracking-tight">Loan Application Review</h1>
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
            {/* User Information */}
            <div className="bg-muted/50 p-4 rounded-md transition-all hover:bg-muted/70">
              <h3 className="font-medium mb-2">Applicant Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <User className="text-muted-foreground" size={20} />
                  <div>
                    <p className="text-sm text-muted-foreground">User ID</p>
                    <p className="font-medium">{loan.userId}</p>
                  </div>
                </div>
                {loan.user && (
                  <>
                    <div className="flex items-center gap-2">
                      <User className="text-muted-foreground" size={20} />
                      <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p className="font-medium">{loan.user.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="text-muted-foreground" size={20} />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{loan.user.email}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Loan Details */}
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
                    <p className="text-sm text-muted-foreground">Days Until Due</p>
                    <p className="font-medium">
                      {loan.daysRemaining > 0 ? 
                        `${loan.daysRemaining} days` : 
                        "Past due"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <Separator />
            
            {/* Process Loan Section */}
            {loan.status === 'PENDING' && (
              <div className="space-y-4">
                <h3 className="font-medium">Process Loan Application</h3>
                
                {error && (
                  <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm">
                    {error}
                  </div>
                )}
                
                <RadioGroup 
                  value={action || ""} 
                  onValueChange={(value) => setAction(value as 'approve' | 'reject')}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="approve" id="approve" />
                    <Label htmlFor="approve">Approve</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="reject" id="reject" />
                    <Label htmlFor="reject">Reject</Label>
                  </div>
                </RadioGroup>
                
                {action === 'approve' && (
                  <div className="space-y-2">
                    <Label htmlFor="accountNumber">Account Number for Deposit</Label>
                    <Input
                      id="accountNumber"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="Enter account number"
                      className="transition-all focus:ring-2 focus:ring-primary/50"
                    />
                    <p className="text-xs text-muted-foreground">
                      Must be a valid account belonging to the applicant
                    </p>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="reason">Notes/Reason (Optional)</Label>
                  <Textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder={action === 'reject' ? "Reason for rejection" : "Notes for approval"}
                    rows={3}
                    className="transition-all focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                
                <Button 
                  onClick={handleProcessLoan} 
                  disabled={processing || !action}
                  variant={action === 'approve' ? 'default' : 'destructive'}
                  className="w-full transition-all hover:scale-105"
                >
                  {processing ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent" />
                      Processing...
                    </span>
                  ) : action === 'approve' ? "Approve Loan" : action === 'reject' ? "Reject Loan" : "Process Loan"}
                </Button>
              </div>
            )}
            
            {loan.status !== 'PENDING' && (
              <div className="bg-muted/50 p-4 rounded-md transition-all hover:bg-muted/70">
                <h3 className="font-medium mb-2">Status Information</h3>
                <p className="text-sm">
                  {loan.status === 'APPROVED' && `This loan was approved and the amount of $${loan.amount.toFixed(2)} has been credited to the applicant's account.`}
                  {loan.status === 'REJECTED' && "This loan application was rejected."}
                  {loan.status === 'REPAID' && "This loan has been fully repaid."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}