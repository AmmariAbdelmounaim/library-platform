import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  IsEnum,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { MembershipCardRow } from '../db';

// Base class for all membership card DTOs
export class MembershipCardBaseDto {
  @Expose()
  @ApiProperty({
    description: 'Membership card ID',
    example: 1,
  })
  @IsInt()
  id: number;

  @Expose()
  @ApiProperty({
    description: 'Serial number of the membership card',
    example: 'BB000000001',
    minLength: 11,
    maxLength: 11,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(11)
  @MaxLength(11)
  serialNumber: MembershipCardRow['serialNumber'];

  @Expose()
  @ApiProperty({
    description: 'Status of the membership card',
    example: 'FREE',
    enum: ['FREE', 'IN_USE', 'ARCHIVED'],
  })
  @IsEnum(['FREE', 'IN_USE', 'ARCHIVED'])
  status: MembershipCardRow['status'];

  @Expose()
  @ApiProperty({
    description: 'User ID assigned to this card',
    example: 1,
    required: false,
  })
  @IsInt()
  @IsOptional()
  userId: number | null;

  @Expose()
  @ApiProperty({
    description: 'Date when the card was assigned to a user',
    type: String,
    format: 'date-time',
    example: '2024-01-01T00:00:00.000Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  assignedAt: MembershipCardRow['assignedAt'] | null;

  @Expose()
  @ApiProperty({
    description: 'Date when the card was archived',
    type: String,
    format: 'date-time',
    example: '2024-01-01T00:00:00.000Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  archivedAt: MembershipCardRow['archivedAt'] | null;

  @Expose()
  @ApiProperty({
    description: 'Card creation timestamp',
    type: String,
    format: 'date-time',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: MembershipCardRow['createdAt'];

  @Expose()
  @ApiProperty({
    description: 'Card last update timestamp',
    type: String,
    format: 'date-time',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: MembershipCardRow['updatedAt'];
}
