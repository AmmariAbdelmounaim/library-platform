import { Injectable, Inject } from '@nestjs/common';
import { eq, and, isNull } from 'drizzle-orm';
import { loans, books, users, createDatabase, BookRow, UserRow } from '../db';

type Database = ReturnType<typeof createDatabase>;

// Define types based on the loans table schema
export type LoanRow = typeof loans.$inferSelect;
export type LoanInsert = typeof loans.$inferInsert;

@Injectable()
export class LoansRepository {
  constructor(@Inject('DB') private readonly db: Database) {}

  /**
   * Find a loan by ID
   * @param id - Loan ID (number or bigint)
   * @returns Loan row or undefined if not found
   */
  async findById(id: number | bigint): Promise<LoanRow | undefined> {
    const idBigInt = typeof id === 'number' ? BigInt(id) : id;
    const [loan] = await this.db
      .select()
      .from(loans)
      .where(eq(loans.id, idBigInt))
      .limit(1);
    return loan;
  }

  /**
   * Find all loans
   * @returns Array of loan rows
   */
  async findAll(): Promise<LoanRow[]> {
    return await this.db.select().from(loans);
  }

  /**
   * Find loans by user ID
   * @param userId - User ID (number or bigint)
   * @returns Array of loan rows
   */
  async findByUserId(userId: number | bigint): Promise<LoanRow[]> {
    const userIdNumber = typeof userId === 'bigint' ? Number(userId) : userId;
    return await this.db
      .select()
      .from(loans)
      .where(eq(loans.userId, userIdNumber));
  }

  /**
   * Find loans by book ID
   * @param bookId - Book ID (number or bigint)
   * @returns Array of loan rows
   */
  async findByBookId(bookId: number | bigint): Promise<LoanRow[]> {
    const bookIdNumber = typeof bookId === 'bigint' ? Number(bookId) : bookId;
    return await this.db
      .select()
      .from(loans)
      .where(eq(loans.bookId, bookIdNumber));
  }

  /**
   * Find all ongoing loans (not returned)
   * @returns Array of loan rows with returnedAt IS NULL
   */
  async findOngoing(): Promise<LoanRow[]> {
    return await this.db.select().from(loans).where(isNull(loans.returnedAt));
  }

  /**
   * Find ongoing loans by user ID
   * @param userId - User ID (number or bigint)
   * @returns Array of loan rows
   */
  async findOngoingByUserId(userId: number | bigint): Promise<LoanRow[]> {
    const userIdNumber = typeof userId === 'bigint' ? Number(userId) : userId;
    return await this.db
      .select()
      .from(loans)
      .where(and(eq(loans.userId, userIdNumber), isNull(loans.returnedAt)));
  }

  /**
   * Find ongoing loan by book ID (should be unique due to unique constraint)
   * @param bookId - Book ID (number or bigint)
   * @returns Loan row or undefined if not found
   */
  async findOngoingByBookId(
    bookId: number | bigint,
  ): Promise<LoanRow | undefined> {
    const bookIdNumber = typeof bookId === 'bigint' ? Number(bookId) : bookId;
    const [loan] = await this.db
      .select()
      .from(loans)
      .where(and(eq(loans.bookId, bookIdNumber), isNull(loans.returnedAt)))
      .limit(1);
    return loan;
  }

  /**
   * Check if a book is currently loaned (has an ongoing loan)
   * @param bookId - Book ID (number or bigint)
   * @returns true if book is currently loaned, false otherwise
   */
  async isBookLoaned(bookId: number | bigint): Promise<boolean> {
    const ongoingLoan = await this.findOngoingByBookId(bookId);
    return !!ongoingLoan;
  }

  /**
   * Create a new loan
   * @param data - Loan data to insert
   * @returns Created loan row
   */
  async create(data: LoanInsert): Promise<LoanRow> {
    const [newLoan] = await this.db.insert(loans).values(data).returning();
    return newLoan;
  }

  /**
   * Update a loan by ID
   * @param id - Loan ID (number or bigint)
   * @param data - Partial loan data to update
   * @returns Updated loan row or undefined if not found
   */
  async update(
    id: number | bigint,
    data: Partial<LoanInsert>,
  ): Promise<LoanRow | undefined> {
    const idBigInt = typeof id === 'number' ? BigInt(id) : id;
    const [updatedLoan] = await this.db
      .update(loans)
      .set({
        ...data,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(loans.id, idBigInt))
      .returning();
    return updatedLoan;
  }

  /**
   * Find loans with book and user information
   * @param filters - Optional filters for userId and bookId
   * @returns Array of loan rows with related data
   */
  async findWithRelations(filters?: {
    userId?: number;
    bookId?: number;
    ongoingOnly?: boolean;
  }): Promise<
    (LoanRow & {
      book?: Partial<BookRow> | null;
      user?: Partial<UserRow> | null;
    })[]
  > {
    const conditions = [];

    if (filters?.userId) {
      conditions.push(eq(loans.userId, filters.userId));
    }

    if (filters?.bookId) {
      conditions.push(eq(loans.bookId, filters.bookId));
    }

    if (filters?.ongoingOnly) {
      conditions.push(isNull(loans.returnedAt));
    }

    const query = this.db
      .select({
        id: loans.id,
        userId: loans.userId,
        bookId: loans.bookId,
        status: loans.status,
        borrowedAt: loans.borrowedAt,
        dueAt: loans.dueAt,
        returnedAt: loans.returnedAt,
        createdAt: loans.createdAt,
        updatedAt: loans.updatedAt,
        book: {
          id: books.id,
          title: books.title,
          isbn10: books.isbn10,
          isbn13: books.isbn13,
          genre: books.genre,
          publicationDate: books.publicationDate,
          description: books.description,
          coverImageUrl: books.coverImageUrl,
        },
        user: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          role: users.role,
        },
      })
      .from(loans)
      .leftJoin(books, eq(loans.bookId, books.id))
      .leftJoin(users, eq(loans.userId, users.id));

    if (conditions.length > 0) {
      return await query.where(and(...conditions));
    }

    return await query;
  }
}
