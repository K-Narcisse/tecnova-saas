import { Controller, Post, Get, Delete, Patch, Body, UseGuards, Request, Param } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard'; 
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('customers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  // Autoriser le caissier à créer un client (ex: client de passage)
  @Post()
  @Roles('ADMIN', 'MANAGER', 'CASHIER') 
  create(@Body() body: any, @Request() req: any) {
    return this.customersService.create(body, req.user.companyId);
  }

  // Autoriser le caissier à VOIR la liste des clients
  @Get()
  @Roles('ADMIN', 'MANAGER', 'CASHIER') 
  findAll(@Request() req: any) {
    return this.customersService.findAll(req.user.companyId);
  }

  // Autoriser le caissier à encaisser un remboursement de dette
  @Patch(':id/debt')
  @Roles('ADMIN', 'MANAGER', 'CASHIER')
  adjustDebt(@Param('id') id: string, @Body('amount') amount: number, @Request() req: any) {
    return this.customersService.adjustDebt(id, req.user.companyId, amount);
  }

  // GARDE LA SÉCURITÉ : Seul l'ADMIN peut supprimer un client
  @Delete(':id')
  @Roles('ADMIN') 
  remove(@Param('id') id: string, @Request() req: any) {
    return this.customersService.remove(id, req.user.companyId);
  }
}