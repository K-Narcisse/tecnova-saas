import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  // 1. CRÉATION : Ajout du champ 'address'
  async create(data: any, companyId: string) {
    return this.prisma.customer.create({
      data: {
        name: data.name,
        phone: data.phone,
        address: data.address, // <--- INDISPENSABLE pour que l'adresse s'enregistre
        debt: data.debt ? Number(data.debt) : 0, 
        companyId: companyId,
      },
    });
  }

  // 2. LECTURE : Récupère tous les clients de la boutique
  async findAll(companyId: string) {
    return this.prisma.customer.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // 3. MODIFICATION : Pour changer le nom, tel ou adresse
  async update(id: string, companyId: string, data: any) {
    return this.prisma.customer.updateMany({
      where: { id, companyId },
      data: {
        name: data.name,
        phone: data.phone,
        address: data.address,
      },
    });
  }

  // 4. RÈGLEMENT / CRÉDIT : Ajuste le solde de la dette
  async adjustDebt(id: string, companyId: string, amount: number) {
    return this.prisma.customer.updateMany({
      where: { id, companyId },
      data: { 
        debt: { increment: amount } 
      },
    });
  }

  // 5. SUPPRESSION
  async remove(id: string, companyId: string) {
    return this.prisma.customer.deleteMany({
      where: { id, companyId },
    });
  }
}