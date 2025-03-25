import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "default" | "lg";
  text?: string;
  className?: string;
  textClassName?: string;
}

export function LoadingSpinner({
  size = "default",
  text = "Loading...",
  className,
  textClassName
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-8 w-8",
    lg: "h-12 w-12"
  };

  return (
    <div className={cn("flex flex-col items-center justify-center gap-2", className)}>
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      {text && (
        <p className={cn("text-sm text-muted-foreground animate-pulse", textClassName)}>
          {text}
        </p>
      )}
    </div>
  );
}

export function FullPageLoader({ text = "Loading your content..." }) {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
}

export function CardLoader({ text = "Loading..." }) {
  return (
    <div className="flex h-[200px] items-center justify-center rounded-lg border bg-card text-card-foreground shadow-sm">
      <LoadingSpinner text={text} />
    </div>
  );
}

export function TableLoader({ rows = 5 }) {
  return (
    <div className="space-y-3">
      {Array(rows).fill(0).map((_, i) => (
        <div key={i} className="flex gap-4">
          <div className="h-12 w-12 animate-pulse rounded-full bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-[60%] animate-pulse rounded bg-muted" />
            <div className="h-4 w-[80%] animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="space-y-3">
        <div className="h-4 w-[60%] animate-pulse rounded bg-muted" />
        <div className="h-8 w-[40%] animate-pulse rounded bg-muted" />
        <div className="h-4 w-[80%] animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

export function GridLoader({ cols = 3, rows = 2 }) {
  return (
    <div className={`grid gap-4 grid-cols-1 md:grid-cols-${cols}`}>
      {Array(cols * rows).fill(0).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
} 