import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { SalesService } from './sales.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('sales')
@UseGuards(JwtAuthGuard) // Protège toutes les routes des ventes
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  // 1. ENREGISTRER UNE VENTE (Appelé par la Caisse/POS)
  @Post()
  async create(@Body() body: any, @Request() req: any) {
    // On passe le companyId extrait du Token et les données de la vente
    return this.salesService.createSale(req.user.companyId, body);
  }

  // 2. RÉCUPÉRER L'HISTORIQUE (Appelé par la page Historique Ventes)
  // AJOUTE CETTE PARTIE :
  @Get()
  async findAll(@Request() req: any) {
    // Récupère uniquement les ventes de l'entreprise de l'utilisateur connecté
    return this.salesService.findAll(req.user.companyId);
  }
}