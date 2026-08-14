import { Controller, Get, Post, Body, UseGuards, Request, Delete, Param } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('suppliers')
@UseGuards(JwtAuthGuard) // Protège la route : il faut être connecté
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  // Cette fonction crée la route : GET /api/suppliers
  @Get()
  findAll(@Request() req: any) {
    // On passe le companyId extrait du Token JWT
    return this.suppliersService.findAll(req.user.companyId);
  }

  // Cette fonction crée la route : POST /api/suppliers
  @Post()
  create(@Body() body: any, @Request() req: any) {
    return this.suppliersService.create(body, req.user.companyId);
  }

  // Cette fonction crée la route : DELETE /api/suppliers/:id
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.suppliersService.remove(id, req.user.companyId);
  }
}