import { db } from "../../lib/db";
import * as bcrypt from "bcrypt";

export async function handleResetPassword(token: string, password: any) {
  try {
    const user = await db.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw new Error("Lien invalide ou expiré");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    return { message: "Mot de passe mis à jour" };
  } catch (error) {
    console.error("Erreur Reset Password:", error);
    throw new Error("Erreur serveur");
  }
}