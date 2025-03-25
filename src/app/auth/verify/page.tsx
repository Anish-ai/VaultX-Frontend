"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Shield, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import api from "@/utils/api"
import { LoadingSpinner } from "@/components/loading-spinner"

export default function VerifyPage() {
  const [code, setCode] = useState(["", "", "", "", "", ""])
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, code.length)
  }, [code.length])

  const getQueryParams = () => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      return {
        email: params.get("email") || "",
        action: params.get("action") || "signup"
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

      let response
      if (action === "signup") {
        response = await api.post("/auth/verify", { 
          email, 
          otp: verificationCode 
        })
        
        if (response.data.token) {
          localStorage.setItem("token", response.data.token)
        }
        
        toast({
          title: "Account verified",
          description: "Please complete your profile.",
        })
        
        router.push("/auth/register")
      } else {
        const userIdString = new URLSearchParams(window.location.search).get("userId")
        const userId = userIdString ? parseInt(userIdString) : null
        if (!userId) {
          throw new Error("User ID not found")
        }
        
        response = await api.post("/auth/verify-login", { 
          userId, 
          otp: verificationCode 
        })
        
        if (response.data.token) {
          localStorage.setItem("token", response.data.token)
          localStorage.setItem("user", JSON.stringify(response.data.user))
        }
        
        toast({
          title: "Login successful",
          description: "Redirecting to your dashboard...",
        })
        
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

    setIsResending(true)
    try {
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
    } finally {
      setIsResending(false)
    }
  }

  const { action } = getQueryParams()
  const verifyingAction = action === "signup" ? "account" : "login"

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-muted/20 to-background px-4 py-12">
      <Card className="w-full max-w-md transition-all hover:shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-2xl transition-all hover:scale-105">
              <Shield className="h-6 w-6 text-primary" />
              <span>VaultX</span>
            </Link>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Verify Your {verifyingAction}</CardTitle>
          <CardDescription className="text-center">
            Enter the 6-digit code sent to your email
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="flex justify-center gap-3">
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
                  className="h-14 w-14 text-center text-xl font-semibold transition-all focus-visible:ring-2 focus-visible:ring-primary/50"
                  autoFocus={index === 0}
                />
              ))}
            </div>
            <div className="text-center text-sm text-muted-foreground">
              Didn&apos;t receive a code?{" "}
              <Button 
                type="button" 
                variant="link" 
                className="p-0 h-auto text-primary hover:text-primary/80 transition-colors"
                onClick={handleResendCode}
                disabled={isResending}
              >
                {isResending ? "Sending..." : "Resend code"}
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full transition-all hover:scale-[1.02]" 
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <LoadingSpinner className="h-4 w-4" />
                  <span>Verifying...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>Verify</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              <Link 
                href={action === "signup" ? "/auth/signup" : "/auth/login"} 
                className="text-primary hover:text-primary/80 hover:underline transition-all"
              >
                Back to {action === "signup" ? "signup" : "login"}
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}