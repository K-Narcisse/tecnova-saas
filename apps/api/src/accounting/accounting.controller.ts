import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AccountingService } from './accounting.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('accounting')
@UseGuards(JwtAuthGuard)
export class AccountingController {
  constructor(private readonly accountingService: AccountingService) {}

  @Get('summary')
  getSummary(@Request() req: any) {
    return this.accountingService.getSummary(req.user.companyId);
  }

  @Get('journal')
  getJournal(@Request() req: any) {
    return this.accountingService.getJournal(req.user.companyId);
  }
}