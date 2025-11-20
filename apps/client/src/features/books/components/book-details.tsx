import type {
  AuthorResponseDto,
  BookWithAuthorsDto,
} from '@/api/generated/model';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

import {
  asOptionalString,
  formatAuthorLifespan,
  formatAuthorName,
  formatDate,
  formatMetadataValue,
} from '../utils';

type BookDetailsProps = {
  book: BookWithAuthorsDto;
  isRefreshing?: boolean;
};

export function BookDetailsCard({ book, isRefreshing }: BookDetailsProps) {
  const title = asOptionalString(book.title) ?? 'Untitled book';
  const description =
    asOptionalString(book.description) ?? 'No description available.';
  const coverImageUrl = asOptionalString(book.coverImageUrl);
  const publication = formatDate(book.publicationDate);
  const genre = asOptionalString(book.genre) ?? 'Not available';
  const isbn13 = asOptionalString(book.isbn13) ?? 'Not available';
  const isbn10 = asOptionalString(book.isbn10) ?? 'Not available';
  const externalSource = formatMetadataValue(book.externalSource);
  const externalId = formatMetadataValue(book.externalId);
  const externalMetadata = formatMetadataValue(book.externalMetadata);

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        {isRefreshing ? (
          <div className="bg-secondary/40 text-secondary-foreground text-xs tracking-wider uppercase">
            <p className="px-4 py-2">Refreshing latest data…</p>
          </div>
        ) : null}
        <CardContent className="p-6">
          <div className="gap-8 lg:flex">
            <div className="bg-muted/60 mb-6 w-full overflow-hidden rounded-lg border lg:mb-0 lg:w-64">
              {coverImageUrl ? (
                <img
                  src={coverImageUrl}
                  alt={`Cover of ${title}`}
                  loading="lazy"
                  className="aspect-2/3 w-full object-cover"
                />
              ) : (
                <div className="text-muted-foreground flex aspect-2/3 items-center justify-center text-center text-sm">
                  No cover available
                </div>
              )}
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <p className="text-muted-foreground text-sm tracking-wider uppercase">
                  Title
                </p>
                <h2 className="text-2xl font-semibold">{title}</h2>
              </div>
              <div>
                <p className="text-muted-foreground text-sm tracking-wider uppercase">
                  Description
                </p>
                <p className="text-muted-foreground text-base leading-relaxed">
                  {description}
                </p>
              </div>
              <Separator />
              <dl className="grid gap-4 text-sm sm:grid-cols-2">
                <DetailItem label="Genre" value={genre} />
                <DetailItem label="Publication date" value={publication} />
                <DetailItem label="ISBN-13" value={isbn13} />
                <DetailItem label="ISBN-10" value={isbn10} />
                <DetailItem label="External source" value={externalSource} />
                <DetailItem label="External ID" value={externalId} />
              </dl>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Metadata</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <DetailItem label="External metadata" value={externalMetadata} />
          </dl>
        </CardContent>
      </Card>

      <AuthorsPanel authors={book.authors} />
    </div>
  );
}

export function AuthorsPanel({ authors }: { authors: AuthorResponseDto[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Authors</CardTitle>
        <CardDescription>People who brought this book to life.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {authors.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No authors are associated with this book yet.
          </p>
        ) : (
          <ul className="space-y-4">
            {authors.map((author) => (
              <li
                key={author.id}
                className="bg-muted/40 flex flex-col gap-2 rounded-lg border p-4"
              >
                <p className="text-base font-semibold">
                  {formatAuthorName(author)}
                </p>
                <p className="text-muted-foreground text-sm">
                  {formatAuthorLifespan(author)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium wrap-break-word whitespace-pre-wrap">
        {value}
      </dd>
    </div>
  );
}

export function BookDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="gap-8 lg:flex">
            <Skeleton className="mb-6 aspect-2/3 w-full rounded-lg lg:mb-0 lg:w-64" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-20 w-full" />
              <div className="grid gap-4 sm:grid-cols-2">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="h-12 w-full" />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="space-y-4 p-6">
          {Array.from({ length: 2 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

type BookDetailsErrorStateProps = {
  message: string;
  onRetry: () => Promise<unknown>;
};

export function BookDetailsErrorState({
  message,
  onRetry,
}: BookDetailsErrorStateProps) {
  return (
    <div className="border-destructive/50 bg-destructive/5 flex flex-col items-start gap-4 rounded-xl border p-6">
      <div>
        <p className="text-destructive text-base font-semibold">
          Unable to load book
        </p>
        <p className="text-muted-foreground text-sm">{message}</p>
      </div>
      <Button variant="outline" onClick={() => onRetry()}>
        Try again
      </Button>
    </div>
  );
}

export function InvalidBookIdState({ id }: { id: string }) {
  return (
    <div className="border-border rounded-xl border p-6">
      <p className="text-base font-semibold">Invalid book ID</p>
      <p className="text-muted-foreground text-sm">
        “{id}” is not a valid identifier. Please return to the catalog and try
        again.
      </p>
    </div>
  );
}
