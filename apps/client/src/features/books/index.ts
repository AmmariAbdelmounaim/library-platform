/**
 * Books feature exports
 */
export { BookCard, type BookCardProps } from './components/book-card';
export { BookCardSkeleton } from './components/book-card-skeleton';
export { BooksFilters } from './components/books.filter';
export {
  AuthorsPanel,
  BookDetailsCard,
  BookDetailsErrorState,
  BookDetailsSkeleton,
  InvalidBookIdState,
} from './components/book-details';
export {
  asOptionalString,
  formatAuthorLifespan,
  formatAuthorName,
  formatDate,
  formatDateTime,
  formatMetadataValue,
} from './utils';
