"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Bell, Check, Clock, CreditCard, Info, Shield, Trash2, User } from "lucide-react"
import { PageTransition } from "@/components/page-transition"
import DashboardLayout from "@/components/dashboard-layout"
import api from "@/utils/api"
import { formatDistanceToNow } from "date-fns"
import { useRouter } from "next/navigation"

interface SecurityLog {
  id: string
  eventType: string
  details: any
  ipAddress: string
  userAgent: string
  createdAt: string
  read?: boolean
}

interface NotificationCardProps {
  notification: {
    id: string
    title: string
    message: string
    time: string
    type: "transaction" | "security" | "account"
    read: boolean
    priority?: "high" | "medium" | "low"
  }
  onMarkAsRead: (id: string) => void
  onDelete: (id: string) => void
}

export default function NotificationsPage() {
  const [logs, setLogs] = useState<SecurityLog[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      const response = await api.get("/security-logs/my-logs")
      setLogs(response.data
        .filter((log: SecurityLog) => log.eventType !== 'NULL')
        .map((log: SecurityLog) => ({ ...log, read: false }))
      )
    } catch (error) {
      console.error("Error fetching security logs:", error)
      router.push("/auth/login")
    } finally {
      setLoading(false)
    }
  }

  const markAllAsRead = () => {
    setLogs(logs.map(log => ({ ...log, read: true })))
  }

  const clearAllNotifications = () => {
    setLogs([])
  }

  const markAsRead = (id: string) => {
    setLogs(logs.map(log => log.id === id ? { ...log, read: true } : log))
  }

  const deleteNotification = (id: string) => {
    setLogs(logs.filter(log => log.id !== id))
  }

  const getUnreadCount = (type?: string) => {
    return logs.filter(log => !log.read && (type ? getLogType(log.eventType) === type : true)).length
  }

  const getLogType = (eventType: string): "transaction" | "security" | "account" => {
    if (eventType.includes("TRANSACTION") || eventType.includes("ASSET")) {
      return "transaction"
    }
    if (eventType.includes("LOGIN") || eventType.includes("PASSWORD") || eventType.includes("MFA") || eventType.includes("SUSPICIOUS")) {
      return "security"
    }
    return "account"
  }

  const getPriority = (eventType: string): "high" | "medium" | "low" | undefined => {
    if (eventType.includes("FAILED") || eventType.includes("SUSPICIOUS")) {
      return "high"
    }
    if (eventType.includes("TRANSACTION") || eventType.includes("LOAN")) {
      return "medium"
    }
    if (eventType.includes("PROFILE") || eventType.includes("ACCOUNT")) {
      return "low"
    }
    return undefined
  }

  return (
    <DashboardLayout>
      <PageTransition>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                Mark all as read
              </Button>
              <Button variant="outline" size="sm" onClick={clearAllNotifications}>
                Clear all
              </Button>
            </div>
          </div>

          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all" className="relative">
                All
                {getUnreadCount() > 0 && (
                  <Badge className="ml-2 bg-primary text-primary-foreground">{getUnreadCount()}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="transactions" className="relative">
                Transactions
                {getUnreadCount("transaction") > 0 && (
                  <Badge className="ml-2 bg-primary text-primary-foreground">{getUnreadCount("transaction")}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="security" className="relative">
                Security
                {getUnreadCount("security") > 0 && (
                  <Badge className="ml-2 bg-primary text-primary-foreground">{getUnreadCount("security")}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="account" className="relative">
                Account
                {getUnreadCount("account") > 0 && (
                  <Badge className="ml-2 bg-primary text-primary-foreground">{getUnreadCount("account")}</Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {loading ? (
                <LoadingState />
              ) : logs.length > 0 ? (
                logs.map((log) => (
                  <NotificationCard
                    key={log.id}
                    notification={{
                      ...log,
                      type: getLogType(log.eventType),
                      priority: getPriority(log.eventType),
                      title: log.eventType.replace(/_/g, " ").toLowerCase(),
                      message: getEventDescription(log),
                      time: formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })
                    }}
                    onMarkAsRead={markAsRead}
                    onDelete={deleteNotification}
                  />
                ))
              ) : (
                <EmptyState message="No notifications to display" />
              )}
            </TabsContent>

            {["transactions", "security", "account"].map((type) => (
              <TabsContent key={type} value={type} className="space-y-4">
                {loading ? (
                  <LoadingState />
                ) : logs.filter((log) => getLogType(log.eventType) === type).length > 0 ? (
                  logs
                    .filter((log) => getLogType(log.eventType) === type)
                    .map((log) => (
                      <NotificationCard
                        key={log.id}
                        notification={{
                          ...log,
                          type: getLogType(log.eventType),
                          priority: getPriority(log.eventType),
                          title: log.eventType.replace(/_/g, " ").toLowerCase(),
                          message: getEventDescription(log),
                          time: formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })
                        }}
                        onMarkAsRead={markAsRead}
                        onDelete={deleteNotification}
                      />
                    ))
                ) : (
                  <EmptyState message={`No ${type} notifications`} />
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </PageTransition>
    </DashboardLayout>
  )
}

function NotificationCard({ notification, onMarkAsRead, onDelete }: NotificationCardProps) {
  const { id, title, message, time, type, read, priority } = notification

  const getIcon = () => {
    switch (type) {
      case "transaction":
        return <CreditCard className="h-5 w-5" />
      case "security":
        return <Shield className="h-5 w-5" />
      case "account":
        return <User className="h-5 w-5" />
      default:
        return <Bell className="h-5 w-5" />
    }
  }

  const getPriorityColor = () => {
    switch (priority) {
      case "high":
        return "bg-destructive text-destructive-foreground"
      case "medium":
        return "bg-warning text-warning-foreground"
      case "low":
        return "bg-primary text-primary-foreground"
      default:
        return "bg-secondary text-secondary-foreground"
    }
  }

  return (
    <Card className={`transition-all duration-200 ${!read ? "border-primary/50 bg-primary/5" : ""}`}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex items-start gap-2">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-full ${
              type === "security"
                ? "bg-destructive/10 text-destructive"
                : type === "transaction"
                  ? "bg-primary/10 text-primary"
                  : "bg-secondary/50 text-secondary-foreground"
            }`}
          >
            {getIcon()}
          </div>
          <div>
            <CardTitle className="text-base font-semibold">{title}</CardTitle>
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <CardDescription>{time}</CardDescription>
            </div>
          </div>
        </div>
        {priority && (
          <Badge variant="outline" className={getPriorityColor()}>
            {priority.charAt(0).toUpperCase() + priority.slice(1)}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-sm">{message}</p>
      </CardContent>
      <CardFooter className="flex justify-end gap-2 pt-0">
        {!read && (
          <Button variant="ghost" size="sm" onClick={() => onMarkAsRead(id)}>
            <Check className="mr-1 h-4 w-4" />
            Mark as read
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={() => onDelete(id)}>
          <Trash2 className="mr-1 h-4 w-4" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  )
}

function LoadingState() {
  return (
    <Card className="p-4">
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-start gap-4">
            <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-[60%] bg-muted animate-pulse rounded" />
              <div className="h-3 w-[40%] bg-muted animate-pulse rounded" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Info className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{message}</h3>
      <p className="mt-2 text-sm text-muted-foreground">When you receive notifications, they will appear here.</p>
    </div>
  )
}

function getEventDescription(log: SecurityLog): string {
  switch (log.eventType) {
    // Auth Events
    case "SUCCESSFUL_LOGIN":
      return `Successful login from ${log.ipAddress}`
    case "FAILED_LOGIN_ATTEMPT":
      return `Failed login attempt from ${log.ipAddress}`
    case "SIGNUP_INITIATED":
      return "Account creation initiated"
    case "ACCOUNT_VERIFICATION":
      return "Account successfully verified"
    case "PASSWORD_RESET_REQUESTED":
      return "Password reset requested"
    case "PASSWORD_RESET_COMPLETED":
      return "Password successfully reset"
    
    // Transaction & Asset Events
    case "ASSET_TRANSFER":
    case "TRANSACTION_COMPLETED":
      return `Transaction of ${log.details?.amount} ${log.details?.currency || 'USD'} ${log.details?.type === 'SENT' ? 'sent to' : 'received from'} ${log.details?.otherParty}`
    case "TRANSACTION_FAILED":
      return `Transaction failed: ${log.details?.reason || 'Unknown error'}`
    
    // Loan Events
    case "LOAN_APPLICATION":
      return `Loan application submitted for ${log.details?.amount} ${log.details?.currency || 'USD'}`
    case "LOAN_APPROVED":
      return `Loan approved for ${log.details?.amount} ${log.details?.currency || 'USD'}`
    case "LOAN_REJECTED":
      return `Loan application rejected: ${log.details?.reason || 'No reason provided'}`
    case "LOAN_REPAID":
      return `Loan fully repaid`
    
    // Investment Events
    case "INVESTMENT_CREATED":
      return `New investment of ${log.details?.amount} ${log.details?.currency || 'USD'} in ${log.details?.type}`
    case "INVESTMENT_CLOSED":
      return `Investment closed with ${log.details?.returnAmount} ${log.details?.currency || 'USD'} return`
    
    // User Events
    case "PROFILE_UPDATE":
      return "Profile information updated"
    case "PROFILE_COMPLETED":
      return "Profile setup completed"
    case "MFA_ENABLED":
      return "Two-factor authentication enabled"
    case "MFA_DISABLED":
      return "Two-factor authentication disabled"
    
    // Security Events
    case "SUSPICIOUS_ACTIVITY":
      return `Suspicious activity detected from ${log.ipAddress}`
    
    default:
      return `${log.eventType.replace(/_/g, " ").toLowerCase()}`
  }
}

