import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  async create(data: any, companyId: string) {
    return this.prisma.supplier.create({
      data: {
        name: data.name,
        phone: data.phone || null,
        email: data.email || null,
        address: data.address || null,
        companyId: companyId,
      },
    });
  }

  async findAll(companyId: string) {
    return this.prisma.supplier.findMany({
      where: { companyId },
      orderBy: { name: 'asc' },
    });
  }

  async remove(id: string, companyId: string) {
    // deleteMany est plus sûr pour le multi-tenant car il vérifie le companyId
    return this.prisma.supplier.deleteMany({
      where: { id, companyId },
    });
  }
}