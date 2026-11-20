import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../infrastructure/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../infrastructure/decorators/current-user.decorator.js';
import type { JwtPayload } from '../../infrastructure/security/token.service.js';
import { CreateCategoryDto } from '../../application/dto/category/create-category.dto.js';
import { CreateCategoryUseCase } from '../../application/use-cases/category/create-category.use-case.js';
import { GetCategoriesUseCase } from '../../application/use-cases/category/get-categories.use-case.js';

@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoryController {
  constructor(
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly getCategoriesUseCase: GetCategoriesUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateCategoryDto,
  ) {
    return this.createCategoryUseCase.execute(user.sub, dto);
  }

  @Get()
  async findAll(@CurrentUser() user: JwtPayload, @Query('type') type?: string) {
    return this.getCategoriesUseCase.execute(user.sub, type);
  }
}
