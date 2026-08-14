import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Email invalide' })
  @IsNotEmpty()
  email: string;

  @MinLength(6, { message: 'Le mot de passe doit faire au moins 6 caractères' })
  @IsNotEmpty()
  password: string;
}