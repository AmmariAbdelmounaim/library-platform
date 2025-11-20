import type { BookResponseDto } from '@/api/generated/model';
import { BookCard } from './book-card';

type BooksGridProps = {
  books: BookResponseDto[];
};

export function BooksGrid({ books }: BooksGridProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
}

