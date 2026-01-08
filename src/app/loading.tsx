import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="flex flex-1 items-center justify-center">
        <div className="flex items-center space-x-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <span className="text-lg font-medium text-muted-foreground">Loading...</span>
        </div>
    </div>
  );
}
