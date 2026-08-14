import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  // 1. CRÉER UNE VENTE
  async createSale(companyId: string, data: any) {
    // Utilisation d'une transaction pour garantir l'intégrité des données
    return this.prisma.$transaction(async (tx) => {
      
      // A. Création de la facture en base de données
      const sale = await tx.sale.create({
        data: {
          invoiceRef: data.invoiceRef,
          totalAmount: Number(data.total), // Conversion en nombre par sécurité
          paymentType: data.paymentType,
          cart: data.cart, // Stockage du panier en JSON
          customerId: data.customerId || null,
          companyId: companyId,
        },
      });

      // B. Mise à jour du stock pour chaque produit vendu
      for (const item of data.cart) {
        await tx.product.updateMany({
          where: { id: item.id, companyId: companyId },
          data: {
            stock: {
              decrement: Number(item.qty) // On retire la quantité vendue
            }
          }
        });
      }

      // C. LOGIQUE DE LA DETTE : Si c'est un crédit, on augmente la dette du client
      if (data.paymentType === 'CREDIT' && data.customerId) {
        await tx.customer.update({
          where: { id: data.customerId },
          data: {
            debt: {
              increment: Number(data.total) // On ajoute le montant total à sa dette
            }
          }
        });
      }

      return sale;
    });
  }

  // 2. RÉCUPÉRER L'HISTORIQUE DES VENTES
  async findAll(companyId: string) {
    return this.prisma.sale.findMany({
      where: { companyId: companyId },
      include: {
        customer: {
          select: { name: true } // On récupère le nom du client lié
        }
      },
      orderBy: {
        createdAt: 'desc', // Les ventes les plus récentes en haut
      },
    });
  }
}