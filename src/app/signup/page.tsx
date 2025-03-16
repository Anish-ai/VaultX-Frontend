"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function SignupPage() {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">Sign Up Required</h1>
        <p className="text-muted-foreground">
          You need to sign up or log in to access the dashboard.
        </p>
        <Button onClick={() => router.push("/auth/signup")}>
          Go to Sign Up
        </Button>
      </div>
    </div>
  )
}