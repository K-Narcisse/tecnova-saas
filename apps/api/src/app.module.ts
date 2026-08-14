import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { SalesModule } from './sales/sales.module';
import { CategoriesModule } from './categories/categories.module';
import { CustomersModule } from './customers/customers.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { ExpensesModule } from './expenses/expenses.module';
import { AccountingModule } from './accounting/accounting.module';
import { ReportsModule } from './reports/reports.module';
import { CompaniesModule } from './companies/companies.module';

@Module({
  imports: [
    PrismaModule,   // Le module de base de données
    AuthModule,     // Le module d'authentification
    ProductsModule,
    CategoriesModule,
    SalesModule,
    CustomersModule,
    SuppliersModule,
    ExpensesModule,
    AccountingModule,
    ReportsModule,
    CompaniesModule, // Le module des produits
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}