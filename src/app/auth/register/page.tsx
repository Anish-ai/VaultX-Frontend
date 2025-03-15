"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import api from "@/utils/api"

export default function ProfilePage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    accountType: "SAVINGS", // Default account type
    initialBalance: "",
    currency: "USD" // Default currency
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Check if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please log in to complete your profile.",
      })
      router.push("/auth/login")
    }
  }, [router, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Authentication required")
      }

      // Validate all fields
      if (!formData.name || !formData.phone || !formData.address || !formData.accountType || !formData.initialBalance || !formData.currency) {
        throw new Error("All fields are required")
      }

      // Make API request to update profile
      const profileResponse = await api.post("/auth/profile", {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      // Store updated user data
      localStorage.setItem("user", JSON.stringify(profileResponse.data))

      // Make API request to create account
      const accountResponse = await api.post("/accounts", {
        type: formData.accountType,
        balance: parseFloat(formData.initialBalance),
        currency: formData.currency
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      toast({
        title: "Profile and account created",
        description: "Your profile and account have been created successfully.",
      })

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Profile or account creation failed",
        description: error.response?.data?.message || error.message || "Please check your information and try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 px-4 py-12">
      <Card className="w-full max-w-2xl"> {/* Increased width */}
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <Shield className="h-6 w-6" />
              <span>VaultX</span>
            </Link>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Complete Your Profile</CardTitle>
          <CardDescription className="text-center">
            Please provide additional information to complete your profile and create an account.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4"> {/* Grid layout for multiple fields in one line */}
              {/* Profile Fields */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+12345678901"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  placeholder="123 Main St, City, Country"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                />
              </div>

              {/* Account Fields */}
              <div className="space-y-2">
                <Label htmlFor="accountType">Account Type</Label>
                <Select
                  value={formData.accountType}
                  onValueChange={(value) => handleSelectChange("accountType", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SAVINGS">Savings</SelectItem>
                    <SelectItem value="CHECKING">Checking</SelectItem>
                    <SelectItem value="INVESTMENT">Investment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="initialBalance">Initial Balance</Label>
                <Input
                  id="initialBalance"
                  name="initialBalance"
                  type="number"
                  placeholder="1000.00"
                  value={formData.initialBalance}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => handleSelectChange("currency", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="INR">INR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating profile and account..." : "Complete profile and create account"}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              You can update this information later from your account settings.
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}