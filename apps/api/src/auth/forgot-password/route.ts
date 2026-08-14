import { db } from "../../lib/db"; 
import * as crypto from "crypto";
import { transporter } from "../../lib/mail"; // Gardez une seule fois cette ligne

export async function handleForgotPassword(email: string) {
  try {
    const user = await db.user.findUnique({ where: { email } });

    if (!user) {
      return { message: "Email envoyé si existant" };
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 3600000); // 1 heure

    await db.user.update({
      where: { email },
      data: {
        resetPasswordToken: token,
        resetPasswordExpires: expiry,
      },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

    await transporter.sendMail({
      from: `"SaaS Commerce" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Réinitialisation de votre mot de passe",
      html: `<h2>Réinitialisation</h2><p>Lien : <a href="${resetUrl}">${resetUrl}</a></p>`,
    });

    return { success: true };
  } catch (error) {
    console.error("Erreur Forgot Password:", error);
    throw new Error("Erreur serveur");
  }
}