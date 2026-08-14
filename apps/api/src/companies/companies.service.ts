import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  // Récupérer les infos de la boutique actuelle
  async findOne(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
    });
    if (!company) throw new NotFoundException('Boutique introuvable');
    return company;
  }

  // Mettre à jour les paramètres (IFU, RCCM, Adresse, etc.)
  async update(id: string, data: any) {
    return this.prisma.company.update({
      where: { id },
      data: {
        name: data.name,
        phone: data.phone,
        address: data.address,
        ifu: data.ifu,
        rccm: data.rccm,
        logo: data.logo,
        currency: data.currency,
      },
    });
  }
}