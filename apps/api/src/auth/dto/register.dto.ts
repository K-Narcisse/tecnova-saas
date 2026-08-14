import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  // --- Infos Entreprise ---
  
  @IsString()
  @IsNotEmpty({ message: "Le nom de la boutique est obligatoire" })
  companyName: string;

  @IsEmail({}, { message: "L'email de la boutique n'est pas valide" })
  @IsNotEmpty()
  companyEmail: string;

  // --- Infos Utilisateur (Admin) ---

  @IsEmail({}, { message: "L'email de l'administrateur n'est pas valide" })
  @IsNotEmpty()
  userEmail: string;

  @IsString()
  @MinLength(8, { message: "Le mot de passe doit contenir au moins 8 caractères" })
  password: string;
}