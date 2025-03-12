"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import api from "@/utils/api"

export default function VerifyPage() {
  const [code, setCode] = useState(["", "", "", "", "", ""])
  const [isLoading, setIsLoading] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const router = useRouter()
  const { toast } = useToast()

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, code.length)
  }, [code.length])

  // Get email and action from URL
  const getQueryParams = () => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      return {
        email: params.get("email") || "",
        action: params.get("action") || "signup" // Default to signup
      }
    }
    return { email: "", action: "signup" }
  }

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)
    if (value && index < code.length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text/plain").trim()
    if (/^\d{6}$/.test(pastedData)) {
      const newCode = pastedData.split("")
      setCode(newCode)
      inputRefs.current[5]?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const verificationCode = code.join("")
      if (verificationCode.length !== 6) {
        throw new Error("Please enter a valid 6-digit code")
      }

      const { email, action } = getQueryParams()
      if (!email) {
        throw new Error("Email not found")
      }

      // Different API endpoints based on action (signup or login)
      let response
      if (action === "signup") {
        response = await api.post("/auth/verify", { 
          email, 
          otp: verificationCode 
        })
        
        // Store token
        if (response.data.token) {
          localStorage.setItem("token", response.data.token)
        }
        
        toast({
          title: "Account verified",
          description: "Please complete your profile.",
        })
        
        // Redirect to profile completion
        router.push("/auth/register")
      } else {
        // Login verification
        const userIdString = new URLSearchParams(window.location.search).get("userId")
        const userId = userIdString ? parseInt(userIdString) : null
        console.log(userId)
        if (!userId) {
          throw new Error("User ID not found")
        }
        
        response = await api.post("/auth/verify-login", { 
          userId, 
          otp: verificationCode 
        })
        
        // Store token and user data
        if (response.data.token) {
          localStorage.setItem("token", response.data.token)
          localStorage.setItem("user", JSON.stringify(response.data.user))
        }
        
        toast({
          title: "Login successful",
          description: "Redirecting to your dashboard...",
        })
        
        // Redirect to dashboard
        router.push("/dashboard")
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Verification failed",
        description: error.response?.data?.message || "Please check your code and try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    const { email, action } = getQueryParams()
    if (!email) return

    try {
      // Different endpoints for resending OTP based on action
      if (action === "signup") {
        await api.post("/auth/resend-otp", { email })
      } else {
        await api.post("/auth/resend-login-otp", { email })
      }
      
      toast({
        title: "Code resent",
        description: "A new verification code has been sent to your email.",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to resend code",
        description: error.response?.data?.message || "Please try again later.",
      })
    }
  }

  const { action } = getQueryParams()
  const verifyingAction = action === "signup" ? "account" : "login"

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <Shield className="h-6 w-6" />
              <span>VaultX</span>
            </Link>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Verify Your {verifyingAction}</CardTitle>
          <CardDescription className="text-center">
            Enter the 6-digit code sent to your email
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="flex justify-center gap-2">
              {code.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="h-12 w-12 text-center text-lg"
                  autoFocus={index === 0}
                />
              ))}
            </div>
            <div className="text-center text-sm text-muted-foreground">
              Didn&apos;t receive a code?{" "}
              <Button type="button" variant="link" className="p-0 h-auto text-primary" onClick={handleResendCode}>
                Resend code
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Verifying..." : "Verify"}
            </Button>
            <div className="text-center text-sm">
              <Link href={action === "signup" ? "/auth/signup" : "/auth/login"} className="text-primary hover:underline">
                Back to {action === "signup" ? "signup" : "login"}
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}