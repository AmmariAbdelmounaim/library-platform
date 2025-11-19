import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { BookResponseDto } from '../books/books.dto';
import { UserResponseDto } from '../users/users.dto';

// Loan status enum matching the database enum
export enum LoanStatus {
  ONGOING = 'ONGOING',
  RETURNED = 'RETURNED',
  LATE = 'LATE',
}

// Base class for all loan DTOs
export class LoanBaseDto {
  @Expose()
  @ApiProperty({
    description: 'Loan ID',
    example: 1,
  })
  @IsInt()
  id: number;

  @Expose()
  @ApiProperty({
    description: 'User ID who borrowed the book',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @Expose()
  @ApiProperty({
    description: 'Book ID that was borrowed',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  bookId: number;

  @Expose()
  @ApiProperty({
    description: 'Loan status',
    enum: LoanStatus,
    example: LoanStatus.ONGOING,
  })
  @IsEnum(LoanStatus)
  status: LoanStatus;

  @Expose()
  @ApiProperty({
    description: 'Date and time when the book was borrowed',
    type: String,
    format: 'date-time',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsDateString()
  borrowedAt: string;

  @Expose()
  @ApiProperty({
    description: 'Due date for returning the book',
    type: String,
    format: 'date-time',
    example: '2024-01-22T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  dueAt?: string;

  @Expose()
  @ApiProperty({
    description: 'Date and time when the book was returned',
    type: String,
    format: 'date-time',
    example: '2024-01-15T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  returnedAt?: string;

  @Expose()
  @ApiProperty({
    description: 'Loan creation timestamp',
    type: String,
    format: 'date-time',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: string;

  @Expose()
  @ApiProperty({
    description: 'Loan last update timestamp',
    type: String,
    format: 'date-time',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: string;
}

export class LoanResponseDto extends LoanBaseDto {}

export class LoanWithRelationsDto extends LoanResponseDto {
  @Expose()
  @Type(() => BookResponseDto)
  @ApiProperty({
    description: 'Book information',
    type: BookResponseDto,
    required: false,
  })
  book?: BookResponseDto;

  @Expose()
  @Type(() => UserResponseDto)
  @ApiProperty({
    description: 'User information',
    type: UserResponseDto,
    required: false,
  })
  user?: UserResponseDto;
}

export class CreateLoanDto {
  @ApiProperty({
    description: 'Book ID to borrow',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  bookId: number;

  @ApiProperty({
    description:
      'Due date for returning the book (optional, defaults to 21 days from now)',
    type: String,
    format: 'date-time',
    example: '2024-01-22T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  dueAt?: string;
}

export class ReturnLoanDto {
  @ApiProperty({
    description: 'Loan ID to return',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  loanId: number;
}
