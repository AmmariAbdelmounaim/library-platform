import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Request,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { LoansService } from './loans.service';
import { CreateLoanDto, LoanResponseDto } from './loans.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ForbiddenException } from '@nestjs/common';
import { LoansRepository } from './loans.repository';
import { UserRow } from '../db';

interface AuthenticatedRequest extends Request {
  user: UserRow;
}

@ApiTags('loans')
@Controller('loans')
export class LoansController {
  constructor(
    private readonly loansService: LoansService,
    private readonly loansRepository: LoansRepository,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create a new loan',
    description:
      'Borrow a book. Only users with USER role can create loans. Users can only borrow books that are not currently loaned.',
  })
  @ApiCreatedResponse({
    description: 'Loan successfully created',
    type: LoanResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden - USER role required to create loans',
  })
  @ApiBadRequestResponse({
    description: 'Book is already loaned or invalid input data',
  })
  @ApiNotFoundResponse({
    description: 'Book not found',
  })
  create(
    @Body() createLoanDto: CreateLoanDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<LoanResponseDto> {
    // Users can only create loans for themselves
    const userId = Number(req.user.id);
    return this.loansService.create(createLoanDto, userId);
  }

  @Post(':id/return')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Return a loaned book',
    description:
      'Return a book. Only users with USER role can return loans. The loan status will be set to RETURNED or LATE based on the due date. Users can only return their own loans.',
  })
  @ApiParam({
    name: 'id',
    description: 'Loan ID',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Book successfully returned',
    type: LoanResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden - USER role required to return loans',
  })
  @ApiNotFoundResponse({
    description: 'Loan not found',
  })
  @ApiBadRequestResponse({
    description: 'Loan is already returned',
  })
  async returnLoan(
    @Param('id', ParseIntPipe) loanId: number,
    @Request() req: AuthenticatedRequest,
  ): Promise<LoanResponseDto> {
    const loan = await this.loansRepository.findById(loanId);
    if (loan && Number(req.user.id) !== Number(loan.userId)) {
      throw new ForbiddenException('You can only return your own loans');
    }
    return this.loansService.returnLoan(loanId);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get my ongoing loans',
    description:
      'Retrieve all ongoing loans for the current authenticated user. Only available to users with USER role.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of user ongoing loans retrieved successfully',
    type: [LoanResponseDto],
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden - USER role required',
  })
  findMyOngoingLoans(
    @Request() req: AuthenticatedRequest,
  ): Promise<LoanResponseDto[]> {
    return this.loansService.findOngoing(Number(req.user.id));
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get all ongoing loans (Admin only)',
    description:
      'Retrieve all ongoing loans regardless of user. This operation is restricted to users with ADMIN role only.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all ongoing loans retrieved successfully',
    type: [LoanResponseDto],
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden - Admin role required',
  })
  findAllOngoing(): Promise<LoanResponseDto[]> {
    return this.loansService.findOngoing();
  }

  @Get('search')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Search loans by user or book (Admin only)',
    description:
      'Search loans by user ID or book ID. This operation is restricted to users with ADMIN role only. Provide either userId or bookId query parameter.',
  })
  @ApiQuery({
    name: 'userId',
    description: 'User ID to search loans for',
    type: Number,
    required: false,
    example: 1,
  })
  @ApiQuery({
    name: 'bookId',
    description: 'Book ID to search loans for',
    type: Number,
    required: false,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'List of loans matching the search criteria',
    type: [LoanResponseDto],
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden - Admin role required',
  })
  @ApiBadRequestResponse({
    description: 'Either userId or bookId query parameter is required',
  })
  searchLoans(
    @Query('userId', new ParseIntPipe({ optional: true })) userId?: number,
    @Query('bookId', new ParseIntPipe({ optional: true })) bookId?: number,
  ): Promise<LoanResponseDto[]> {
    if (userId) {
      return this.loansService.findByUserId(userId);
    }
    if (bookId) {
      return this.loansService.findByBookId(bookId);
    }
    throw new ForbiddenException(
      'Either userId or bookId query parameter is required',
    );
  }
}
