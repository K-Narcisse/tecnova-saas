import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(name: string, companyId: string) {
    return this.prisma.category.create({
      data: { name, companyId },
    });
  }

  async findAll(companyId: string) {
    return this.prisma.category.findMany({
      where: { companyId },
      include: { _count: { select: { products: true } } }, // Compte le nombre de produits par catégorie
      orderBy: { name: 'asc' },
    });
  }

  async update(id: string, companyId: string, name: string) {
    return this.prisma.category.updateMany({
      where: { id, companyId },
      data: { name },
    });
  }

  async remove(id: string, companyId: string) {
    return this.prisma.category.deleteMany({
      where: { id, companyId },
    });
  }
}