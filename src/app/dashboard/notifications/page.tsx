"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Bell, Check, Clock, CreditCard, Info, Shield, Trash2, User } from "lucide-react"
import { PageTransition } from "@/components/page-transition"
import DashboardLayout from "@/components/dashboard-layout"

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(allNotifications)

  const markAllAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({
        ...notification,
        read: true,
      })),
    )
  }

  const clearAllNotifications = () => {
    setNotifications([])
  }

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter((notification) => notification.id !== id))
  }

  const getUnreadCount = (type?: string) => {
    return notifications.filter((notification) => !notification.read && (type ? notification.type === type : true))
      .length
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
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onDelete={deleteNotification}
                  />
                ))
              ) : (
                <EmptyState message="No notifications to display" />
              )}
            </TabsContent>

            <TabsContent value="transactions" className="space-y-4">
              {notifications.filter((n) => n.type === "transaction").length > 0 ? (
                notifications
                  .filter((n) => n.type === "transaction")
                  .map((notification) => (
                    <NotificationCard
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={markAsRead}
                      onDelete={deleteNotification}
                    />
                  ))
              ) : (
                <EmptyState message="No transaction notifications" />
              )}
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              {notifications.filter((n) => n.type === "security").length > 0 ? (
                notifications
                  .filter((n) => n.type === "security")
                  .map((notification) => (
                    <NotificationCard
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={markAsRead}
                      onDelete={deleteNotification}
                    />
                  ))
              ) : (
                <EmptyState message="No security notifications" />
              )}
            </TabsContent>

            <TabsContent value="account" className="space-y-4">
              {notifications.filter((n) => n.type === "account").length > 0 ? (
                notifications
                  .filter((n) => n.type === "account")
                  .map((notification) => (
                    <NotificationCard
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={markAsRead}
                      onDelete={deleteNotification}
                    />
                  ))
              ) : (
                <EmptyState message="No account notifications" />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </PageTransition>
    </DashboardLayout>
  )
}

interface NotificationCardProps {
  notification: Notification
  onMarkAsRead: (id: string) => void
  onDelete: (id: string) => void
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

// Sample data
interface Notification {
  id: string
  title: string
  message: string
  time: string
  type: "transaction" | "security" | "account"
  read: boolean
  priority?: "high" | "medium" | "low"
}

const allNotifications: Notification[] = [
  {
    id: "1",
    title: "Large Transaction Alert",
    message: "A transaction of $2,500 was made from your checking account to an external account.",
    time: "Just now",
    type: "transaction",
    read: false,
    priority: "medium",
  },
  {
    id: "2",
    title: "Suspicious Login Attempt",
    message: "We detected a login attempt from an unrecognized device in New York, USA.",
    time: "10 minutes ago",
    type: "security",
    read: false,
    priority: "high",
  },
  {
    id: "3",
    title: "Password Changed",
    message: "Your account password was successfully changed.",
    time: "1 hour ago",
    type: "security",
    read: true,
  },
  {
    id: "4",
    title: "Direct Deposit Received",
    message: "You received a direct deposit of $3,450.00 from ACME Corp.",
    time: "3 hours ago",
    type: "transaction",
    read: false,
    priority: "low",
  },
  {
    id: "5",
    title: "Account Statement Available",
    message: "Your February 2023 account statement is now available for download.",
    time: "Yesterday",
    type: "account",
    read: true,
  },
  {
    id: "6",
    title: "New Device Added",
    message: "A new device was added to your account. If this wasn't you, please contact us immediately.",
    time: "2 days ago",
    type: "security",
    read: true,
  },
  {
    id: "7",
    title: "Investment Portfolio Update",
    message: "Your investment portfolio has increased by 3.2% this month.",
    time: "3 days ago",
    type: "account",
    read: true,
  },
]

