import { Injectable, BadRequestException, UnauthorizedException, ConflictException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs'; // Indispensable pour la compatibilité O2Switch
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // ======================================================
  // 1. INSCRIPTION INITIALE (Création Boutique + Admin)
  // ======================================================
  async register(dto: RegisterDto) {
    const userExists = await this.prisma.user.findUnique({
      where: { email: dto.userEmail },
    });
    if (userExists) throw new BadRequestException('Cet email est déjà utilisé');

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // Création de l'entreprise (Tenant)
        const company = await tx.company.create({
          data: {
            name: dto.companyName,
            email: dto.companyEmail,
          },
        });

        // Création du compte administrateur lié à la boutique
        const user = await tx.user.create({
          data: {
            email: dto.userEmail,
            password: hashedPassword,
            name: "Administrateur", 
            role: 'ADMIN', 
            companyId: company.id,
            pinCode: "0000" 
          },
        });

        return { user, company };
      });

      const payload = { 
        sub: result.user.id, 
        email: result.user.email, 
        companyId: result.company.id,
        role: result.user.role 
      };

      return {
        access_token: await this.jwtService.signAsync(payload),
        user: {
          id: result.user.id,
          email: result.user.email,
          company: result.company.name,
          role: result.user.role,
        }
      };
    } catch (e) {
      this.logger.error("Erreur lors de la transaction d'inscription", e);
      throw new BadRequestException("Erreur lors de la création du compte");
    }
  }

  // ======================================================
  // 2. CONNEXION (Admin, Manager ou Caissier)
  // ======================================================
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { company: true },
    });

    if (!user) throw new UnauthorizedException('Identifiants invalides');

    // Comparaison du mot de passe saisi avec le mot de passe haché en BDD
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Identifiants invalides');

    const payload = { 
      sub: user.id, 
      email: user.email, 
      companyId: user.companyId, 
      role: user.role 
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        companyName: user.company.name,
        companyId: user.companyId,
      }
    };
  }

  // ======================================================
  // 3. MOT DE PASSE OUBLIÉ
  // ======================================================
  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return { message: 'Si ce compte existe, un lien de réinitialisation sera envoyé.' };
    
    this.logger.log(`Demande de réinitialisation reçue pour : ${email}`);
    // Logique SMTP à ajouter plus tard ici
    return { message: 'Lien de réinitialisation envoyé.' };
  }

  // ======================================================
  // 4. AJOUT D'UN EMPLOYÉ (Utilisé par l'Admin dans Paramètres)
  // ======================================================
  async createEmployee(data: any, companyId: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email }
    });
    if (existingUser) throw new ConflictException('Cet e-mail est déjà utilisé');

    // Hachage du mot de passe saisi par l'admin (Indispensable pour autoriser le Login)
    const passwordToHash = data.password || "12345678";
    const hashedPassword = await bcrypt.hash(passwordToHash, 10);
    
    try {
      return await this.prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: hashedPassword, // Stockage sécurisé
          role: data.role,
          pinCode: data.pinCode,
          companyId: companyId,
        },
        select: { 
          id: true,
          name: true,
          email: true,
          role: true,
          pinCode: true
        }
      });
    } catch (e) {
      this.logger.error("Erreur Prisma createEmployee.", e);
      throw new BadRequestException("Erreur lors de la création de l'employé");
    }
  }

  // ======================================================
  // 5. MODIFIER UN EMPLOYÉ
  // ======================================================
  async updateEmployee(id: string, data: any) {
    // Si l'admin saisit un nouveau mot de passe, on doit le hacher
    if (data.password && data.password.trim() !== "") {
      data.password = await bcrypt.hash(data.password, 10);
    } else {
      delete data.password; // On ne change pas le mot de passe s'il n'est pas fourni
    }

    try {
      return await this.prisma.user.update({
        where: { id },
        data: {
          name: data.name,
          email: data.email,
          role: data.role,
          pinCode: data.pinCode,
          ...(data.password && { password: data.password })
        },
        select: { id: true, name: true, email: true, role: true, pinCode: true }
      });
    } catch (e) {
      throw new NotFoundException("Employé introuvable");
    }
  }

  // ======================================================
  // 6. SUPPRIMER UN EMPLOYÉ
  // ======================================================
  async deleteEmployee(id: string) {
    try {
      await this.prisma.user.delete({ where: { id } });
      return { success: true, message: "Employé supprimé avec succès" };
    } catch (e) {
      throw new BadRequestException("Impossible de supprimer l'employé");
    }
  }

  // ======================================================
  // 7. LISTE DES EMPLOYÉS (Multi-tenant)
  // ======================================================
  async findAllEmployees(companyId: string) {
    try {
      return await this.prisma.user.findMany({
        where: { companyId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          pinCode: true,
          createdAt: true
        },
        orderBy: { createdAt: 'asc' }
      });
    } catch (e) {
      this.logger.error("Erreur Prisma findAllEmployees.", e);
      throw new BadRequestException("Impossible de charger la liste des employés");
    }
  }
}