import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('reports')
@UseGuards(JwtAuthGuard) // Protection par Token obligatoire
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('sales-summary')
  getSalesReport(@Request() req: any) {
    // req.user.companyId vient du JWT
    return this.reportsService.getSalesReport(req.user.companyId);
  }
}