import { Controller, Post, Get, Body, Patch, Delete, Param, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // ==========================================
  // --- ROUTES PUBLIQUES (SANS CONNEXION) ---
  // ==========================================

  // Inscription d'une nouvelle boutique + administrateur
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  // Connexion utilisateur (Admin, Manager ou Caissier)
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // Demande de réinitialisation de mot de passe
  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  // ==========================================
  // --- ROUTES PROTÉGÉES (AVEC CONNEXION) ---
  // ==========================================

  // 1. Récupérer tous les employés de la boutique
  @UseGuards(JwtAuthGuard)
  @Get('employees')
  async getEmployees(@Request() req: any) {
    return this.authService.findAllEmployees(req.user.companyId);
  }

  // 2. Ajouter un nouvel employé
  @UseGuards(JwtAuthGuard)
  @Post('employees')
  async addEmployee(@Body() body: any, @Request() req: any) {
    return this.authService.createEmployee(body, req.user.companyId);
  }

  // 3. Modifier un employé existant
  @UseGuards(JwtAuthGuard)
  @Patch('employees/:id')
  async updateEmployee(@Param('id') id: string, @Body() body: any) {
    // On passe l'ID de l'employé et les nouvelles données au service
    return this.authService.updateEmployee(id, body);
  }

  // 4. Supprimer un employé
  @UseGuards(JwtAuthGuard)
  @Delete('employees/:id')
  async removeEmployee(@Param('id') id: string) {
    return this.authService.deleteEmployee(id);
  }
}