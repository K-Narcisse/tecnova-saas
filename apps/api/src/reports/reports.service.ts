import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getSalesReport(companyId: string) {
    // 1. Récupérer toutes les ventes de la boutique
    const sales = await this.prisma.sale.findMany({
      where: { companyId },
    });

    // 2. Initialiser les compteurs
    let totalCash = 0;
    let totalMomo = 0;
    let totalCredit = 0;
    const productStats: Record<string, { qty: number; revenue: number }> = {};

    // 3. Analyser chaque vente
    sales.forEach((sale) => {
      // Calcul par mode de paiement
      if (sale.paymentType === 'CASH') totalCash += sale.totalAmount;
      else if (sale.paymentType.includes('MOMO')) totalMomo += sale.totalAmount;
      else if (sale.paymentType === 'CREDIT') totalCredit += sale.totalAmount;

      // Analyse du panier (cart est un champ JSON)
      const cart = sale.cart as any[];
      if (cart && Array.isArray(cart)) {
        cart.forEach((item) => {
          if (!productStats[item.name]) {
            productStats[item.name] = { qty: 0, revenue: 0 };
          }
          productStats[item.name].qty += item.qty;
          productStats[item.name].revenue += item.qty * item.price;
        });
      }
    });

    // 4. Transformer et trier pour avoir le Top 5
    const topProducts = Object.entries(productStats)
      .map(([name, stats]) => ({
        name,
        qty: stats.qty,
        revenue: stats.revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return {
      summary: {
        cash: totalCash,
        momo: totalMomo,
        credit: totalCredit,
        total: totalCash + totalMomo + totalCredit,
      },
      topProducts,
    };
  }
}