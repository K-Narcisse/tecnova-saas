"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { 
  Store, Mail, Lock, ArrowRight, ShoppingCart, 
  Eye, EyeOff, ShieldCheck, AlertCircle 
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // État pour afficher/masquer le mot de passe
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    companyName: "",
    userEmail: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation locale de la longueur du mot de passe
    if (formData.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);

    try {
      // --- CORRECTION : URL MISE À JOUR ET SUPPRESSION DU SLASH FINAL ---
      // On utilise 'tec-api' et on termine par '/register' (pas de / à la fin)
      const apiUrl = "https://tec-api.nuju9944.odns.fr/api";
      
      const response = await axios.post(`${apiUrl}/auth/register`, {
        companyName: formData.companyName,
        companyEmail: formData.userEmail, 
        userEmail: formData.userEmail,
        password: formData.password,
      });

      // Stockage des informations (Vérifie si ton API renvoie 'token' ou 'access_token')
      const token = response.data.access_token || response.data.token;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      // Redirection vers le dashboard
      router.push("/dashboard");
    } catch (err: any) {
      // --- AMÉLIORATION : RÉCUPÉRATION DU MESSAGE D'ERREUR RÉEL DU BACKEND ---
      const backendMessage = err.response?.data?.message;
      
      if (Array.isArray(backendMessage)) {
        setError(backendMessage[0]); // Si NestJS renvoie un tableau d'erreurs de validation
      } else if (backendMessage) {
        setError(backendMessage);
      } else {
        setError("Impossible de contacter le serveur. Vérifiez votre connexion.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 text-sm text-left selection:bg-indigo-500/30">
      <div className="w-full max-w-xl bg-[#0B1120] border border-slate-800/80 rounded-[2.5rem] shadow-2xl p-10 relative overflow-hidden text-slate-300">
        
        {/* Effet décoratif de lumière */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-600/10 blur-[80px] rounded-full"></div>
        
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-600/20 text-white font-bold">
            <ShoppingCart size={32} />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Créer votre Boutique</h1>
          <p className="text-slate-500 font-medium mt-2 text-base font-bold">Lancez votre gestion commerciale en quelques secondes.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 font-bold text-center flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">
          {/* SECTION BOUTIQUE */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <Store size={12} /> Informations sur la Boutique <span className="text-red-500 text-lg">*</span>
            </h3>
            <div className="relative">
              <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="text" required
                placeholder="Ex: Épicerie du Progrès"
                className="w-full bg-[#020617] border border-slate-800 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-indigo-500 transition-all text-white font-bold placeholder:text-slate-700"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              />
            </div>
          </div>

          {/* SECTION COMPTE MAIL */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <Mail size={12} /> Votre adresse e-mail <span className="text-red-500 text-lg">*</span>
            </h3>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="email" required
                placeholder="Ex: votre@email.com"
                className="w-full bg-[#020617] border border-slate-800 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-indigo-500 transition-all text-white font-bold placeholder:text-slate-700"
                value={formData.userEmail}
                onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
              />
            </div>

            {/* MOT DE PASSE */}
            <div className="space-y-3 pt-2">
              <h3 className="text-[10px] font-black text-amber-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <ShieldCheck size={12} /> Sécurité du compte <span className="text-red-500 text-lg">*</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type={showPassword ? "text" : "password"} required
                    placeholder="Mot de passe"
                    className="w-full bg-[#020617] border border-slate-800 rounded-2xl py-4 pl-12 pr-12 outline-none focus:border-indigo-500 transition-all text-white font-bold placeholder:text-slate-700"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type={showPassword ? "text" : "password"} required
                    placeholder="Confirmer"
                    className="w-full bg-[#020617] border border-slate-800 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-indigo-500 transition-all text-white font-bold placeholder:text-slate-700"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  />
                </div>
              </div>
              
              {/* CONSEIL DE SÉCURITÉ */}
              <div className="mt-4 p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex items-start gap-3">
                <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={16} />
                <p className="text-[11px] text-amber-200/70 leading-relaxed font-medium">
                  <strong className="text-amber-500 block mb-0.5 uppercase tracking-tighter">Conseil :</strong>
                  Utilisez au moins <span className="text-white font-bold underline">8 caractères</span> avec des <span className="text-white font-bold">lettres</span> et des <span className="text-white font-bold">chiffres</span>.
                </p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-[0.98]"
          >
            {loading ? "Création du compte..." : <>Démarrer maintenant <ArrowRight size={20}/></>}
          </button>
        </form>

        <p className="mt-8 text-center text-slate-500 font-bold">
          Déjà un compte ? <Link href="/login" className="text-indigo-400 hover:underline transition-all ml-1">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}