import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AccountingService {
  constructor(private prisma: PrismaService) {}

  // 1. RÉSUMÉ FINANCIER (KPIs)
  async getSummary(companyId: string) {
    // Récupérer toutes les ventes
    const sales = await this.prisma.sale.findMany({
      where: { companyId },
    });

    // Récupérer toutes les dépenses
    const expenses = await this.prisma.expense.findMany({
      where: { companyId },
    });

    const totalRevenue = sales.reduce((acc, s) => acc + s.totalAmount, 0);
    const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);

    // Calcul du Coût d'Achat (COGS)
    // On parcourt les paniers stockés en JSON pour sommer les prix d'achat
    let totalCOGS = 0;
    sales.forEach((sale: any) => {
      const cart = sale.cart as any[];
      if (cart && Array.isArray(cart)) {
        cart.forEach(item => {
          // On utilise le purchasePrice stocké au moment de la vente ou celui du produit
          totalCOGS += (item.purchasePrice || 0) * item.qty;
        });
      }
    });

    const grossMargin = totalRevenue - totalCOGS;
    const netProfit = grossMargin - totalExpenses;

    return {
      totalRevenue,
      totalExpenses,
      totalCOGS,
      grossMargin,
      netProfit,
      salesCount: sales.length,
    };
  }

  // 2. JOURNAL GÉNÉRAL (Fusion Ventes + Dépenses triées)
  async getJournal(companyId: string) {
    const [sales, expenses] = await Promise.all([
      this.prisma.sale.findMany({
        where: { companyId },
        include: { customer: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.expense.findMany({
        where: { companyId },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // On transforme les deux en format "Ecriture Comptable"
    const entries = [
      ...sales.map(s => ({
        id: s.id,
        date: s.createdAt,
        type: 'RECETTE',
        category: s.customerId ? 'Règlement Dette' : 'Vente',
        description: s.invoiceRef || 'Vente Directe',
        credit: s.totalAmount,
        debit: 0,
      })),
      ...expenses.map(e => ({
        id: e.id,
        date: e.createdAt,
        type: 'DEPENSE',
        category: e.category,
        description: e.title,
        credit: 0,
        debit: e.amount,
      })),
    ];

    // On trie par date décroissante
    return entries.sort((a, b) => b.date.getTime() - a.date.getTime());
  }
}