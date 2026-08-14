import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  // 1. CRÉATION
  async create(data: any, companyId: string) {
    return this.prisma.product.create({
      data: {
        name: data.name,
        barcode: data.barcode || null,
        categoryId: data.categoryId || null, // On utilise l'ID technique
        price: Number(data.price),
        purchasePrice: Number(data.purchasePrice || 0),
        stock: Number(data.stock || 0),
        lowStockThreshold: Number(data.lowStockThreshold || 5),
        unit: data.unit || "unité",
        vatRate: Number(data.vatRate || 18),
        companyId: companyId,
      },
    });
  }

  // 2. LECTURE : Récupère tous les produits
  async findAll(companyId: string) {
    return this.prisma.product.findMany({
      where: { companyId: companyId },
      // CORRECTION ICI : Le nom doit être 'category' car c'est ce qui est écrit dans ton schema.prisma
      include: { 
        category: true 
      }, 
      orderBy: { createdAt: 'desc' },
    });
  }

  // 3. MODIFICATION
  async update(id: string, companyId: string, data: any) {
    // Note : On utilise 'update' au lieu de 'updateMany' pour supporter 'increment' et 'version'
    return this.prisma.product.update({
      where: { id: id },
      data: {
        name: data.name,
        barcode: data.barcode,
        categoryId: data.categoryId || null, 
        price: Number(data.price),
        purchasePrice: Number(data.purchasePrice),
        stock: Number(data.stock),
        lowStockThreshold: Number(data.lowStockThreshold),
        unit: data.unit,
        vatRate: Number(data.vatRate),
        version: { increment: 1 } 
      },
    });
  }

  // 4. AJUSTEMENT DE STOCK
  async adjustStock(id: string, companyId: string, adjustment: number) {
    return this.prisma.product.update({
      where: { id: id }, 
      data: {
        stock: { increment: adjustment },
        version: { increment: 1 }
      },
    });
  }

  // 5. SUPPRESSION
  async remove(id: string, companyId: string) {
    return this.prisma.product.delete({
      where: { id: id },
    });
  }
}