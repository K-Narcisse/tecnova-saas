import { Controller, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('companies')
@UseGuards(JwtAuthGuard) // Sécurité : il faut être connecté
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  // Route : GET /api/companies/mine
  @Get('mine')
  getMine(@Request() req: any) {
    // req.user.companyId est extrait automatiquement de ton Token JWT
    return this.companiesService.findOne(req.user.companyId);
  }

  // Route : PATCH /api/companies/mine
  @Patch('mine')
  updateMine(@Request() req: any, @Body() body: any) {
    return this.companiesService.update(req.user.companyId, body);
  }
}