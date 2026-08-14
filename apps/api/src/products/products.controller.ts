import { Controller, Post, Get, Delete, Patch, Body, UseGuards, Request, Param } from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard'; // Importation du garde de rôles
import { Roles } from '../auth/decorators/roles.decorator'; // Importation du décorateur

@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard) // On active la double sécurité : Jeton + Rôle
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // 1. CRÉATION D'UN PRODUIT
  @Post()
  @Roles('ADMIN', 'MANAGER') // Seuls l'Admin et le Manager peuvent ajouter
  create(@Body() body: any, @Request() req: any) {
    return this.productsService.create(body, req.user.companyId);
  }

  // 2. LECTURE DE TOUS LES PRODUITS
  @Get()
  @Roles('ADMIN', 'MANAGER', 'CASHIER') // Tout le monde peut voir les produits
  findAll(@Request() req: any) {
    return this.productsService.findAll(req.user.companyId);
  }

  // 3. MODIFICATION COMPLÈTE
  @Patch(':id')
  @Roles('ADMIN', 'MANAGER') // Interdit au Caissier
  update(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    return this.productsService.update(id, req.user.companyId, body);
  }

  // 4. AJUSTEMENT RAPIDE DU STOCK (Bouton ⇅)
  @Patch(':id/adjust-stock')
  @Roles('ADMIN', 'MANAGER') // Interdit au Caissier
  adjustStock(
    @Param('id') id: string, 
    @Body('adjustment') adjustment: number, 
    @Request() req: any
  ) {
    return this.productsService.adjustStock(id, req.user.companyId, adjustment);
  }

  // 5. SUPPRESSION D'UN PRODUIT
  @Delete(':id')
  @Roles('ADMIN', 'MANAGER') // Interdit au Caissier
  remove(@Param('id') id: string, @Request() req: any) {
    return this.productsService.remove(id, req.user.companyId);
  }
}