import { Button } from '@/components/ui/button';

type BooksErrorStateProps = {
  message: string;
  onRetry: () => Promise<unknown>;
};

export function BooksErrorState({ message, onRetry }: BooksErrorStateProps) {
  return (
    <div className="border-destructive/40 bg-destructive/5 flex flex-col items-start gap-4 rounded-xl border p-6">
      <div>
        <p className="text-destructive text-base font-semibold">
          Unable to load books
        </p>
        <p className="text-muted-foreground text-sm">{message}</p>
      </div>
      <Button variant="outline" onClick={() => onRetry()}>
        Try again
      </Button>
    </div>
  );
}

