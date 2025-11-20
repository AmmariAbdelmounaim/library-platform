import type { BookResponseDto } from '@/api/generated/model';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Link } from '@tanstack/react-router';

type BookCardProps = {
  book: BookResponseDto;
  className?: string;
};

const asOptionalString = (value: unknown): string | undefined => {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value;
  }
  return undefined;
};

const formatDate = (value?: string) => {
  if (!value) {
    return 'Not available';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

export function BookCard({ book, className }: BookCardProps) {
  const title = asOptionalString(book.title) ?? 'Untitled book';
  const description =
    asOptionalString(book.description) ?? 'No description available.';
  const genre = asOptionalString(book.genre) ?? 'Not available';
  const publication = formatDate(book.publicationDate);
  const coverImageUrl = asOptionalString(book.coverImageUrl);
  const isbn13 = book.isbn13 ?? 'Not available';
  const isbn10 = book.isbn10 ?? 'Not available';

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="gap-6 sm:flex-row sm:items-start">
        <div className="bg-muted/50 w-full overflow-hidden rounded-lg border sm:w-48">
          {coverImageUrl ? (
            <img
              src={coverImageUrl}
              alt={`Cover of ${title}`}
              loading="lazy"
              className="aspect-2/3 w-full object-cover"
            />
          ) : (
            <div className="text-muted-foreground flex aspect-2/3 w-full items-center justify-center text-center text-sm">
              No cover available
            </div>
          )}
        </div>

        <div className="flex-1 space-y-2">
          <CardTitle className="text-2xl">
            <Link
              to="/user/books/$bookId"
              params={{ bookId: String(book.id) }}
              className="hover:underline"
            >
              {title}
            </Link>
          </CardTitle>
          <CardDescription>
            Essential information about this book.
          </CardDescription>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <Separator />
        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">ISBN-13</dt>
            <dd className="font-medium">{isbn13}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">ISBN-10</dt>
            <dd className="font-medium">{isbn10}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Genre</dt>
            <dd className="font-medium">{genre}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Publication date</dt>
            <dd className="font-medium">{publication}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}

export type { BookCardProps };
