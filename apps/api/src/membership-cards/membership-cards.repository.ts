import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import {
  membershipCards,
  createDatabase,
  MembershipCardRow,
  MembershipCardInsert,
} from '../db';

type Database = ReturnType<typeof createDatabase>;

@Injectable()
export class MembershipCardsRepository {
  constructor(@Inject('DB') private readonly db: Database) {}

  async findById(id: number | bigint): Promise<MembershipCardRow | undefined> {
    const idBigInt = typeof id === 'number' ? BigInt(id) : id;
    const [card] = await this.db
      .select()
      .from(membershipCards)
      .where(eq(membershipCards.id, idBigInt))
      .limit(1);
    return card;
  }

  async findBySerialNumber(
    serialNumber: string,
  ): Promise<MembershipCardRow | undefined> {
    const [card] = await this.db
      .select()
      .from(membershipCards)
      .where(eq(membershipCards.serialNumber, serialNumber))
      .limit(1);
    return card;
  }

  async existsBySerialNumber(serialNumber: string): Promise<boolean> {
    const [card] = await this.db
      .select({ id: membershipCards.id })
      .from(membershipCards)
      .where(eq(membershipCards.serialNumber, serialNumber))
      .limit(1);
    return !!card;
  }

  async create(data: MembershipCardInsert): Promise<MembershipCardRow> {
    const [newCard] = await this.db
      .insert(membershipCards)
      .values({
        serialNumber: data.serialNumber,
        status: data.status || 'FREE',
        userId: data.userId || null,
        assignedAt: data.assignedAt || null,
        archivedAt: data.archivedAt || null,
      })
      .returning();
    return newCard;
  }

  async update(
    id: number | bigint,
    data: Partial<MembershipCardInsert>,
  ): Promise<MembershipCardRow | undefined> {
    const idBigInt = typeof id === 'number' ? BigInt(id) : id;
    const [updatedCard] = await this.db
      .update(membershipCards)
      .set({
        ...data,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(membershipCards.id, idBigInt))
      .returning();
    return updatedCard;
  }

  async delete(id: number | bigint): Promise<boolean> {
    const idBigInt = typeof id === 'number' ? BigInt(id) : id;
    const result = await this.db
      .delete(membershipCards)
      .where(eq(membershipCards.id, idBigInt))
      .returning();
    return result.length > 0;
  }

  async findFirstFree(): Promise<MembershipCardRow | undefined> {
    const [card] = await this.db
      .select()
      .from(membershipCards)
      .where(eq(membershipCards.status, 'FREE'))
      .limit(1);
    return card;
  }
}
