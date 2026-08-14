import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  // Créer une dépense
  async create(data: any, companyId: string, userId: string) {
    return this.prisma.expense.create({
      data: {
        title: data.title,
        amount: Number(data.amount),
        category: data.category,
        companyId: companyId,
        userId: userId, // L'ID de celui qui saisit
      },
    });
  }

  // Voir toutes les dépenses de la boutique
  async findAll(companyId: string) {
    return this.prisma.expense.findMany({
      where: { companyId },
      include: {
        user: { select: { email: true } }, // Pour afficher qui a fait la saisie
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Supprimer une dépense
  async remove(id: string, companyId: string) {
    return this.prisma.expense.deleteMany({
      where: { id, companyId },
    });
  }
}