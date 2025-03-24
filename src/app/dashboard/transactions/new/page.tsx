"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import api from "@/utils/api"

interface Account {
  id: number
  accountNumber: string
  type: string
  balance: number
  currency: string
}

export default function NewTransactionPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    senderAccountNumber: "",
    receiverAccountNumber: "",
    amount: "",
  })
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(false)
  const [tokenValid, setTokenValid] = useState(false)

  // Verify token and fetch accounts on page load
  useEffect(() => {
    const checkTokenAndFetchData = async () => {
      try {
        // Retrieve token from localStorage
        const token = localStorage.getItem("token")

        if (!token) {
          throw new Error("No token found")
        }

        // Verify token and retrieve user ID
        const userResponse = await api.get("/auth/verify-token", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const userId = userResponse

        if (!userId) {
          throw new Error("Invalid token or user ID not found")
        }

        // Token is valid, proceed to fetch accounts
        setTokenValid(true)

        // Fetch user accounts
        const accountsResponse = await api.get<Account[]>("/accounts/my-accounts", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setAccounts(accountsResponse.data)

      } catch (error) {
        console.error("Error fetching accounts:", error)
        setTokenValid(false)
        router.push("/auth/login")
      }
    }

    checkTokenAndFetchData()
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Find the selected account to check balance
      const selectedAccount = accounts.find(acc => acc.accountNumber === formData.senderAccountNumber)
      
      if (!selectedAccount) {
        throw new Error("Selected account not found")
      }
      
      // Check if the account has sufficient balance
      if (selectedAccount.balance < parseFloat(formData.amount)) {
        throw new Error("Insufficient balance in the selected account")
      }

      // Create the transaction
      const response = await api.post("/transactions", {
        senderAccountNumber: formData.senderAccountNumber,
        receiverAccountNumber: formData.receiverAccountNumber,
        amount: parseFloat(formData.amount),
        type: "DEBIT", // Always DEBIT since users can only send money
      })

      // Show success toast
      toast({
        title: "Transaction Created",
        description: "Your transaction has been successfully processed.",
      })
      
      // Redirect to transactions page
      router.push("/dashboard/transactions")
    } catch (error: any) {
      console.error("Error creating transaction:", error)
      toast({
        title: "Transaction Failed",
        description: error.message || "An error occurred while processing your transaction.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!tokenValid) {
    return null // Redirect will happen automatically
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>New Transaction</CardTitle>
          <CardDescription>Send money to another account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="senderAccountNumber">From Account</Label>
              <Select
                value={formData.senderAccountNumber}
                onValueChange={(value) => handleSelectChange("senderAccountNumber", value)}
                required
              >
                <SelectTrigger id="senderAccountNumber">
                  <SelectValue placeholder="Select your account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.accountNumber}>
                      {account.type} Account (●●●● {account.accountNumber.slice(-4)}) - ${account.balance.toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="receiverAccountNumber">To Account Number</Label>
              <Input
                id="receiverAccountNumber"
                name="receiverAccountNumber"
                placeholder="Enter receiver's account number"
                value={formData.receiverAccountNumber}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-muted-foreground">$</span>
                </div>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  placeholder="0.00"
                  className="pl-7"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <CardFooter className="flex justify-end gap-2 p-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/transactions")}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Processing..." : "Send Money"}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}