import { createFileRoute } from '@tanstack/react-router';

import { BooksCatalog } from '@/features/books';

export const Route = createFileRoute('/(protected)/admin/books/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <BooksCatalog withAddBook />;
}
