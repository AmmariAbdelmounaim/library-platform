import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function BookCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="gap-6 sm:flex-row sm:items-start">
        <Skeleton className="aspect-2/3 w-full rounded-lg sm:w-48" />
        <div className="flex-1 space-y-2">
          <CardTitle>
            <Skeleton className="h-7 w-3/4" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-5 w-1/2" />
          </CardDescription>
          <Skeleton className="h-16 w-full" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-5 w-2/3" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
