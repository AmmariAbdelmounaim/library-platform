/**
 * Books feature exports
 */
export { BookCard, type BookCardProps } from './components/book-card';
export { BookCardSkeleton } from './components/book-card-skeleton';
export { BooksCatalog } from './components/books-catalog';
export { BooksEmptyState } from './components/books-empty-state';
export { BooksErrorState } from './components/books-error-state';
export { BooksGrid } from './components/books-grid';
export { BooksLoadingGrid } from './components/books-loading-grid';
export {
  AuthorsPanel,
  BookDetailsCard,
  BookDetailsErrorState,
  BookDetailsSkeleton,
  InvalidBookIdState,
} from './components/book-details';
export {
  useBooksSearch,
  type BooksSearchFilters,
} from './hooks/use-books-search';
export {
  formatAuthorLifespan,
  formatAuthorName,
  formatDate,
  formatMetadataValue,
} from './utils';
export { BookForm, type BookFormProps } from './components/book-form';
export { bookSchema, type BookFormData } from './lib/schemas';
