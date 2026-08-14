import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // ==========================================
  // 1. CHARGEMENT DU FICHIER .ENV
  // ==========================================
  // Utile pour le développement local et la flexibilité monorepo
  const localEnv = path.resolve(process.cwd(), '.env');
  const monorepoEnv = path.resolve(process.cwd(), '../../.env');

  if (fs.existsSync(localEnv)) {
    dotenv.config({ path: localEnv });
    logger.log(`✅ .env chargé (local) : ${localEnv}`);
  } else if (fs.existsSync(monorepoEnv)) {
    dotenv.config({ path: monorepoEnv });
    logger.log(`ℹ️ .env chargé (monorepo) : ${monorepoEnv}`);
  } else {
    logger.warn('⚠️ Aucun fichier .env physique trouvé. Utilisation des variables système.');
  }

  // Vérification de sécurité pour la base de données
  if (!process.env.DATABASE_URL) {
    logger.error('❌ ERREUR FATALE : DATABASE_URL non trouvée dans process.env');
  }

  // ==========================================
  // 2. CRÉATION DE L'APPLICATION
  // ==========================================
  const app = await NestFactory.create(AppModule);

  // ==========================================
  // 3. VALIDATION GLOBALE (Sécurité des données)
  // ==========================================
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Supprime les champs non définis dans les DTO
      forbidNonWhitelisted: true, // Rejette la requête si des champs en trop sont présents
      transform: true, // Transforme les types automatiquement
    }),
  );

  // ==========================================
  // 4. PRÉFIXE GLOBAL API
  // ==========================================
  // Toutes les routes commenceront par /api (ex: /api/auth/register)
  app.setGlobalPrefix('api');

  // ==========================================
  // 5. CONFIGURATION CORS (Solution Ultime O2Switch)
  // ==========================================
  app.enableCors({
    // origin: true permet d'accepter dynamiquement le domaine qui appelle l'API
    origin: true, 

    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],

    //allowedHeaders: headers autorisés pour le passage du Token JWT et du JSON
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'Access-Control-Allow-Origin',
    ],

    credentials: true, // Autorise l'envoi des cookies/headers de session
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // ==========================================
  // 6. LANCEMENT DU SERVEUR
  // ==========================================
  // O2Switch fournit le port via la variable d'environnement PORT
  const port = process.env.PORT || 3000;

  // IMPORTANT : '0.0.0.0' est nécessaire pour le proxy CloudLinux de O2Switch
  await app.listen(port, '0.0.0.0');

  const url = await app.getUrl();
  logger.log(`🚀 API Tecnova en ligne sur : ${url}`);
  logger.log(`🔐 CORS : Activé (Mode Dynamique)`);
}

bootstrap();