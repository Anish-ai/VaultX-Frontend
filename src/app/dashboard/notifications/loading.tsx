import { Card } from "@/components/ui/card"
import DashboardLayout from "@/components/dashboard-layout"
import { PageTransition } from "@/components/page-transition"

export default function NotificationsLoading() {
  return (
    <DashboardLayout>
      <PageTransition>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="h-8 w-48 bg-muted animate-pulse rounded" />
            <div className="flex items-center gap-2">
              <div className="h-8 w-32 bg-muted animate-pulse rounded" />
              <div className="h-8 w-24 bg-muted animate-pulse rounded" />
            </div>
          </div>

          <Card className="p-4">
            <div className="space-y-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2">
                      <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
                      <div className="space-y-2">
                        <div className="h-5 w-48 bg-muted animate-pulse rounded" />
                        <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                      </div>
                    </div>
                    <div className="h-5 w-16 bg-muted animate-pulse rounded" />
                  </div>
                  <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                  <div className="flex justify-end gap-2">
                    <div className="h-8 w-28 bg-muted animate-pulse rounded" />
                    <div className="h-8 w-24 bg-muted animate-pulse rounded" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </PageTransition>
    </DashboardLayout>
  )
}