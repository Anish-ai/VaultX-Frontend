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
import api from "@/utils/api"

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
        // Refresh loan data
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
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2">Loading loan details...</p>
        </div>
      </div>
    )
  }

  if (error || !loan) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()} className="flex items-center gap-2">
          <ArrowLeft size={16} />
          Back to Loans
        </Button>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-red-500">{error || "Loan not found"}</p>
              <Button 
                variant="outline" 
                onClick={() => router.push('/dashboard/admin/loans')}
                className="mt-4"
              >
                Return to Loans
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => router.back()} className="flex items-center gap-2">
        <ArrowLeft size={16} />
        Back to Loans
      </Button>
      
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Loan Application Review</h1>
        <Badge className="text-md px-3 py-1" variant={
          loan.status === 'PENDING' ? 'outline' :
          loan.status === 'APPROVED' ? 'success' :
          loan.status === 'REJECTED' ? 'destructive' : 'default'
        }>
          {loan.status.toLowerCase()}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Loan #{loan.id}</CardTitle>
          <CardDescription>
            Applied on {new Date(loan.createdAt).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* User Information */}
          <div className="bg-muted p-4 rounded-md">
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
              <div className="flex items-center gap-2">
                <DollarSign className="text-muted-foreground" size={20} />
                <div>
                  <p className="text-sm text-muted-foreground">Loan Amount</p>
                  <p className="font-medium">${loan.amount.toFixed(2)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Percent className="text-muted-foreground" size={20} />
                <div>
                  <p className="text-sm text-muted-foreground">Interest Rate</p>
                  <p className="font-medium">{loan.interest}%</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <DollarSign className="text-muted-foreground" size={20} />
                <div>
                  <p className="text-sm text-muted-foreground">Repayment Amount</p>
                  <p className="font-medium">${loan.repaymentAmount.toFixed(2)}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="text-muted-foreground" size={20} />
                <div>
                  <p className="text-sm text-muted-foreground">Due Date</p>
                  <p className="font-medium">{new Date(loan.dueDate).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
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
                />
              </div>
              
              <Button 
                onClick={handleProcessLoan} 
                disabled={processing || !action}
                variant={action === 'approve' ? 'default' : 'destructive'}
                className="w-full"
              >
                {processing ? "Processing..." : action === 'approve' ? "Approve Loan" : action === 'reject' ? "Reject Loan" : "Process Loan"}
              </Button>
            </div>
          )}
          
          {loan.status !== 'PENDING' && (
            <div className="bg-muted p-4 rounded-md">
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
  )
} 