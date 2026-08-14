import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('expenses')
@UseGuards(JwtAuthGuard) // Protection par Token obligatoire
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  create(@Body() body: any, @Request() req: any) {
    // req.user contient les infos du Token (companyId et userId)
    return this.expensesService.create(body, req.user.companyId, req.user.sub);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.expensesService.findAll(req.user.companyId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.expensesService.remove(id, req.user.companyId);
  }
}