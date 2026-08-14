"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { Mail, ArrowLeft, Send, CheckCircle2, ShoppingCart, AlertCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      // ADRESSE RÉELLE DE TON SERVEUR API SUR O2SWITCH AVEC SLASH FINAL "/"
      const apiUrl = "https://tec-api.nuju9944.odns.fr/api";
      
      // Envoi de la demande au backend (ajout du slash final pour éviter la redirection 307)
      await axios.post(`${apiUrl}/auth/forgot-password/`, { 
        email: email.trim() 
      });
      
      setMessage("Si cette adresse e-mail est enregistrée, vous recevrez un lien de réinitialisation d'ici quelques instants.");
    } catch (err: any) {
      setError("Une erreur est survenue. Veuillez vérifier votre connexion et réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 text-sm">
      <div className="w-full max-w-md bg-[#0B1120] border border-slate-800/80 rounded-[2.5rem] shadow-2xl p-10 relative overflow-hidden text-slate-300">
        
        {/* Effet de lumière décoratif */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-600/10 blur-[80px] rounded-full"></div>
        
        <div className="text-center mb-10 text-left">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-600/20 text-white font-bold">
            <ShoppingCart size={32} />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight text-left">Réinitialisation</h1>
          <p className="text-slate-500 font-medium mt-2 text-base font-bold text-left">Retrouvez l'accès à votre boutique.</p>
        </div>

        {message ? (
          <div className="text-center space-y-6 py-4 animate-in fade-in zoom-in duration-300">
            <div className="flex justify-center">
              <div className="bg-emerald-500/20 p-5 rounded-full text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 size={48} />
              </div>
            </div>
            <div className="space-y-2">
                <p className="text-white font-black text-lg text-center">E-mail envoyé !</p>
                <p className="text-slate-400 font-medium leading-relaxed text-center">{message}</p>
            </div>
            <Link href="/login" className="flex items-center justify-center gap-2 w-full bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest transition-all">
              <ArrowLeft size={18} /> Retour à la connexion
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 font-bold text-center flex items-center gap-2 justify-center">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <div className="space-y-2 text-left">
              <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-1">
                Votre adresse e-mail <span className="text-red-500 text-lg">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="email" required
                  placeholder="Ex: nom@gmail.com"
                  className="w-full bg-[#020617] border border-slate-800 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-indigo-500 transition-all text-white font-bold placeholder:text-slate-600"
                  value={email || ""}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <p className="text-[11px] text-slate-500 italic px-2 mt-2">
                Nous vous enverrons un lien sécurisé pour créer un nouveau mot de passe.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? "Envoi en cours..." : <>Envoyer le lien <Send size={18}/></>}
            </button>

            <Link href="/login" className="flex items-center justify-center gap-2 text-slate-500 hover:text-white transition-colors font-black uppercase tracking-widest text-[10px] mt-4">
              <ArrowLeft size={16} /> Revenir à la connexion
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}