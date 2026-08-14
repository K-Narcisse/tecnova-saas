import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST, // ex: node-xxxx.o2switch.net
  port: 465,
  secure: true, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
// Ce bloc permet de tester la connexion au démarrage
transporter.verify(function (error, success) {
  if (error) {
    console.log("❌ Erreur de configuration mail :", error);
  } else {
    console.log("✅ Le serveur est prêt à envoyer des emails");
  }
});