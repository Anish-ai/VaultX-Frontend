"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import api from "@/utils/api"

export function LoanApplyDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState<Date>()
  const [formData, setFormData] = useState({
    amount: "",
    accountNumber: "",
    interest: "5.0"
  })
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!date) {
      setError("Please select a due date")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await api.post('/loans/apply', {
        amount: parseFloat(formData.amount),
        dueDate: date.toISOString(),
        accountNumber: formData.accountNumber,
        interest: parseFloat(formData.interest)
      })
      
      if (response.data.success) {
        setOpen(false)
        setFormData({
          amount: "",
          accountNumber: "",
          interest: "5.0"
        })
        setDate(undefined)
        onSuccess()
      } else {
        throw new Error(response.data.message || "Application failed")
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to submit loan application")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="transition-all hover:scale-105">
          Apply for Loan
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[90vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Loan Application</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-sm text-destructive p-2 rounded bg-destructive/10">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label>Loan Amount ($)</Label>
            <Input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              required
              min="100"
              step="100"
              placeholder="Enter loan amount"
              className="transition-all focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="space-y-2">
            <Label>Account Number</Label>
            <Input
              value={formData.accountNumber}
              onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
              required
              placeholder="Enter your account number"
              className="transition-all focus:ring-2 focus:ring-primary/50"
            />
            <p className="text-xs text-muted-foreground">Must be one of your registered accounts</p>
          </div>

          <div className="space-y-2">
            <Label>Interest Rate (%)</Label>
            <Input
              type="number"
              step="0.1"
              value={formData.interest}
              onChange={(e) => setFormData({...formData, interest: e.target.value})}
              min="5"
              max="20"
              placeholder="5.0"
              className="transition-all focus:ring-2 focus:ring-primary/50"
            />
            <p className="text-xs text-muted-foreground">Interest rate between 5% and 20%</p>
          </div>

          <div className="space-y-2">
            <Label>Due Date</Label>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              fromDate={new Date()}
              className="rounded-md border w-full"
            />
            <p className="text-xs text-muted-foreground">Select a future date for loan repayment</p>
          </div>

          <Button 
            type="submit" 
            className="w-full transition-all hover:scale-105" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent" />
                Submitting...
              </span>
            ) : "Submit Application"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}