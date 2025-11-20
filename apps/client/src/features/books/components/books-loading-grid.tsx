import { BookCardSkeleton } from './book-card-skeleton';

export function BooksLoadingGrid() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <BookCardSkeleton key={index} />
      ))}
    </div>
  );
}
