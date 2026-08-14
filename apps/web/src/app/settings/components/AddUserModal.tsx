"use client";

import React, { useState, useEffect } from 'react';
import { X, ChevronDown, Mail, Lock, User, Eye, EyeOff, Key } from "lucide-react";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: any) => void;
  isLoading: boolean;
  initialData?: any;
}

export default function AddUserModal({ isOpen, onClose, onSave, isLoading, initialData }: AddUserModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "CASHIER",
    pinCode: ""
  });

  // Remplit le formulaire si on est en mode modification
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        email: initialData.email || "",
        password: "", // On laisse vide en modification par sécurité
        role: initialData.role || "CASHIER",
        pinCode: initialData.pinCode || ""
      });
    } else {
      setFormData({ name: "", email: "", password: "", role: "CASHIER", pinCode: "" });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // On envoie les données à la fonction onSave de la page Settings
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm text-left">
      <div className="relative w-full max-w-lg bg-[#0B1224] border border-slate-800 rounded-[2.5rem] shadow-2xl p-10 animate-in zoom-in duration-200">
        
        <div className="flex justify-between items-center mb-8 text-left">
          <div className="text-left">
            <h2 className="text-2xl font-black text-white tracking-tight">
              {initialData ? "Modifier l'Employé" : "Nouvel Employé"}
            </h2>
            <p className="text-slate-500 text-[10px] mt-1 font-bold uppercase tracking-widest">
              Identifiants d'accès au logiciel
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* 1. NOM COMPLET */}
          <div className="space-y-2 text-left">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2 flex items-center gap-1">
                Nom Complet <span className="text-red-500 text-lg">*</span>
            </label>
            <div className="relative text-left">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text" required
                className="w-full bg-[#020617] border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-slate-200 outline-none focus:border-indigo-500 transition-all font-bold placeholder:text-slate-700"
                placeholder="ex: Ahmed Koné"
                value={formData.name || ""}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
          </div>

          {/* 2. EMAIL PERSONNEL */}
          <div className="space-y-2 text-left">
            <label className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-1">
                Adresse e-mail <span className="text-red-500 text-lg">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="email" required
                className="w-full bg-[#020617] border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-slate-200 outline-none focus:border-indigo-500 transition-all font-bold placeholder:text-slate-700"
                placeholder="ex: employé@gmail.com"
                value={formData.email || ""}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {/* 3. MOT DE PASSE */}
             <div className="space-y-2 text-left">
                <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-1">
                    Mot de passe {!initialData && <span className="text-red-500 text-lg">*</span>}
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required={!initialData} // Requis uniquement à la création
                    className="w-full bg-[#020617] border border-slate-800 rounded-2xl py-4 pl-12 pr-12 text-slate-200 outline-none focus:border-indigo-500 transition-all font-bold placeholder:text-slate-700"
                    placeholder={initialData ? "Laisser vide pour garder" : "Minimum 8 car."}
                    value={formData.password || ""}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-indigo-400"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
             </div>

             {/* 4. CODE PIN */}
             <div className="space-y-2 text-left">
                <label className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] ml-2 text-center block">
                    Code PIN (4 chiffres) <span className="text-red-500 text-lg">*</span>
                </label>
                <div className="relative">
                   <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                   <input 
                    type="password" maxLength={4} required
                    className="w-full bg-[#020617] border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-center text-xl tracking-[0.5em] text-white font-black outline-none focus:border-indigo-500"
                    placeholder="••••"
                    value={formData.pinCode || ""}
                    onChange={(e) => setFormData({...formData, pinCode: e.target.value})}
                  />
                </div>
             </div>
          </div>

          {/* 5. RÔLE */}
          <div className="space-y-2 text-left">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2 flex items-center gap-1">Rôle & Permissions</label>
            <div className="relative">
              <select 
                className="w-full bg-[#020617] border border-slate-800 rounded-2xl py-4 px-4 text-slate-200 appearance-none outline-none cursor-pointer font-bold"
                value={formData.role || "CASHIER"}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
              >
                <option value="CASHIER">Caissier / Caissière (Accès POS uniquement)</option>
                <option value="MANAGER">Gérant (Accès aux Stocks uniquement)</option>
              </select>
              <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            </div>
          </div>

          {/* BOUTONS ACTIONS */}
          <div className="flex gap-4 pt-6">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 bg-slate-900 text-slate-400 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all uppercase text-[10px] tracking-[0.2em]"
            >
              Annuler
            </button>
            <button 
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-indigo-600/20 hover:bg-indigo-500 transition-all disabled:opacity-50"
            >
              {isLoading ? "Traitement..." : initialData ? "Mettre à jour" : "Valider le compte"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}