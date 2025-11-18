import { relations } from 'drizzle-orm/relations';
import {
  users,
  loans,
  books,
  membershipCards,
  bookAuthors,
  authors,
} from './schema';

export const loansRelations = relations(loans, ({ one }) => ({
  user: one(users, {
    fields: [loans.userId],
    references: [users.id],
  }),
  book: one(books, {
    fields: [loans.bookId],
    references: [books.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  loans: many(loans),
  membershipCards: many(membershipCards),
}));

export const booksRelations = relations(books, ({ many }) => ({
  loans: many(loans),
  bookAuthors: many(bookAuthors),
}));

export const membershipCardsRelations = relations(
  membershipCards,
  ({ one }) => ({
    user: one(users, {
      fields: [membershipCards.userId],
      references: [users.id],
    }),
  }),
);

export const bookAuthorsRelations = relations(bookAuthors, ({ one }) => ({
  book: one(books, {
    fields: [bookAuthors.bookId],
    references: [books.id],
  }),
  author: one(authors, {
    fields: [bookAuthors.authorId],
    references: [authors.id],
  }),
}));

export const authorsRelations = relations(authors, ({ many }) => ({
  bookAuthors: many(bookAuthors),
}));
