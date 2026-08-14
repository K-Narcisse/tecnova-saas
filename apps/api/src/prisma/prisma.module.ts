import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // 1. Rend le module disponible partout sans ré-import
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // 2. INDISPENSABLE pour partager le service
})
export class PrismaModule {}