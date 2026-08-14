"use client";
import { useState, Suspense } from "react"; // 1. Importation de Suspense
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import { Lock, ShoppingCart, CheckCircle, AlertCircle } from "lucide-react";

// 2. On sépare le contenu qui utilise useSearchParams dans un sous-composant
function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Utilisation de l'URL d'API dynamique configurée dans ton .env
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
      
      await axios.post(`${apiUrl}/auth/reset-password`, { 
        token, 
        password 
      });

      setDone(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (err: any) {
      setError("Le lien est invalide ou a expiré. Veuillez refaire une demande.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="text-center space-y-6 py-4 animate-in fade-in zoom-in duration-500">
        <div className="flex justify-center">
          <div className="bg-emerald-500/20 p-5 rounded-full text-emerald-400 border border-emerald-500/20">
            <CheckCircle size={48} />
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-white font-black text-xl">Succès !</p>
          <p className="text-slate-400 font-medium leading-relaxed">
            Votre mot de passe a été mis à jour. Redirection vers la connexion...
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 font-bold text-center flex items-center gap-2 justify-center">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-2">
          Nouveau mot de passe
        </label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="password"
            required
            placeholder="••••••••"
            className="w-full bg-[#020617] border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white font-bold outline-none focus:border-indigo-500 transition-all placeholder:text-slate-700"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !token}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
      >
        {loading ? "Enregistrement..." : "Enregistrer"}
      </button>

      {!token && (
        <p className="text-center text-red-400 text-[10px] font-bold uppercase tracking-widest">
          Erreur : Jeton de sécurité manquant.
        </p>
      )}
    </form>
  );
}

// 3. Le composant principal qui enveloppe tout dans Suspense
export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 selection:bg-indigo-500/30">
      <div className="w-full max-w-md bg-[#0B1120] border border-slate-800/80 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
        
        {/* Effet visuel de fond */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-600/10 blur-[80px] rounded-full"></div>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-600/20 text-white">
            <ShoppingCart size={32} />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight uppercase">Mise à jour</h1>
          <p className="text-slate-500 font-bold mt-1 text-[10px] uppercase tracking-widest">Sécurité du compte</p>
        </div>

        {/* Le Suspense entoure ici le contenu dynamique */}
        <Suspense fallback={
          <div className="text-center py-10 space-y-4">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-500 font-black text-[10px] uppercase tracking-widest">Initialisation sécurisée...</p>
          </div>
        }>
          <ResetPasswordContent />
        </Suspense>

      </div>
    </div>
  );
}