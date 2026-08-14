import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  create(@Body('name') name: string, @Request() req: any) {
    return this.categoriesService.create(name, req.user.companyId);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.categoriesService.findAll(req.user.companyId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body('name') name: string, @Request() req: any) {
    return this.categoriesService.update(id, req.user.companyId, name);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.categoriesService.remove(id, req.user.companyId);
  }
}