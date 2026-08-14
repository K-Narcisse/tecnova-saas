import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    // 1. On force le chargement du fichier .env
    // On essaie d'abord à la racine du monorepo (../../.env)
    dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
    // On essaie aussi dans le dossier local (./.env) au cas où
    dotenv.config({ path: path.resolve(process.cwd(), '.env') });

    // 2. On passe l'URL directement au moteur Prisma Client
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  }

  async onModuleInit() {
    // Connexion à la base de données
    await this.$connect();
  }

  async onModuleDestroy() {
    // Déconnexion propre
    await this.$disconnect();
  }
}