"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import {
  ChevronDown, Save, X, ScanBarcode, Plus
} from "lucide-react";

export default function AddProductPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // --- ÉTAT POUR STOCKER LES CATÉGORIES DU BACKEND ---
  const [categories, setCategories] = useState<any[]>([]);

  // État du formulaire
  const [formData, setFormData] = useState({
    name: "",
    barcode: "", 
    category: "", // Contiendra désormais l'ID de la catégorie pour le backend
    purchasePrice: "",
    price: "",
    stock: "0",
    lowStockThreshold: "5",
    unit: "unité", 
    vatRate: "18"
  });

  useEffect(() => {
    setIsMounted(true);
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    
    if (!token && isMounted) {
      router.push("/login");
      return;
    }

    if (savedUser) {
      setUser(JSON.parse(savedUser));
      fetchCategories(); // Charger les catégories au démarrage
    }
  }, [isMounted, router]);

  // --- FONCTION POUR RÉCUPÉRER LES CATÉGORIES ---
  const fetchCategories = async () => {
    const token = localStorage.getItem("token");
    // Utilisation de la variable d'environnement pour O2Switch ou localhost
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
    try {
      const res = await axios.get(`${apiUrl}/categories`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(res.data);
      // MISE À JOUR : Sélectionner l'ID de la première catégorie par défaut
      if (res.data.length > 0) {
        setFormData(prev => ({ ...prev, category: res.data[0].id }));
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des catégories", error);
    }
  };

  if (!isMounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category) {
      alert("Veuillez choisir une catégorie");
      return;
    }
    setLoading(true);

    const token = localStorage.getItem("token");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

    try {
      await axios.post(`${apiUrl}/products`, {
        name: formData.name,
        barcode: formData.barcode,
        categoryId: formData.category, // CHANGÉ : On envoie categoryId (l'identifiant technique)
        price: Number(formData.price),
        purchasePrice: Number(formData.purchasePrice),
        stock: Number(formData.stock),
        lowStockThreshold: Number(formData.lowStockThreshold),
        unit: formData.unit,
        vatRate: Number(formData.vatRate),
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      router.push("/products"); 
    } catch (error: any) {
      if (error.response?.status === 401) {
        alert("Votre session a expiré.");
        router.push("/login");
      } else {
        alert("Erreur lors de l'enregistrement");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070C18] flex items-center justify-center p-6 text-sm text-left">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => router.push("/products")} />

      <div className="relative w-full max-w-2xl bg-[#0B1120] border border-slate-800/80 rounded-3xl shadow-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-white tracking-tight text-left">Ajouter un Produit</h2>
          <Link href="/products" className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-slate-200">
            <X size={20} />
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Désignation */}
          <div className="space-y-2 text-left">
            <label className="text-xs font-semibold text-slate-400">Désignation Produit <span className="text-indigo-400">*</span></label>
            <input
              type="text" required
              placeholder="Nom du produit"
              className="w-full bg-[#070C18] border border-slate-800 rounded-xl py-3 px-4 outline-none focus:border-indigo-500/50 text-slate-200 placeholder:text-slate-600 font-bold"
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Code-Barres */}
            <div className="space-y-2 text-left">
              <label className="text-xs font-semibold text-slate-400">Code-Barres</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="618..."
                  className="w-full bg-[#070C18] border border-slate-800 rounded-xl py-3 px-4 outline-none focus:border-indigo-500/50 text-slate-200 font-mono"
                  value={formData.barcode || ""}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                />
                <button type="button" className="shrink-0 w-12 h-[46px] flex items-center justify-center bg-[#070C18] border border-slate-800 rounded-xl text-slate-300">
                  <ScanBarcode size={18} />
                </button>
              </div>
            </div>

            {/* --- LE MENU DÉROULANT DES CATÉGORIES --- */}
            <div className="space-y-2 text-left">
              <label className="text-xs font-semibold text-slate-400">Catégorie <span className="text-indigo-400">*</span></label>
              <div className="relative">
                <select
                  required
                  className="w-full bg-[#070C18] border border-slate-800 rounded-xl py-3 px-4 text-slate-200 appearance-none cursor-pointer outline-none focus:border-indigo-500/50 font-bold"
                  value={formData.category || ""}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="" disabled>Choisir une catégorie</option>
                  {categories.map((cat) => (
                    // MISE À JOUR : On utilise l'ID (cat.id) comme valeur
                    <option key={cat.id} value={cat.id} className="bg-[#0B1120]">
                      {cat.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
              </div>
              {categories.length === 0 && (
                <p className="text-[10px] text-amber-500 mt-1 flex items-center gap-1 font-bold">
                   Aucune catégorie trouvée. <Link href="/categories" className="underline font-black">En créer une</Link>
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 text-left">
              <label className="text-xs font-semibold text-slate-400">Prix d'Achat (F) <span className="text-indigo-400">*</span></label>
              <input
                type="number" required
                className="w-full bg-[#070C18] border border-slate-800 rounded-xl py-3 px-4 outline-none text-slate-200 font-bold"
                value={formData.purchasePrice || ""}
                onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
              />
            </div>
            <div className="space-y-2 text-left">
              <label className="text-xs font-semibold text-slate-400">Prix de Vente (F) <span className="text-indigo-400">*</span></label>
              <input
                type="number" required
                className="w-full bg-[#070C18] border border-slate-800 rounded-xl py-3 px-4 outline-none focus:border-indigo-500/50 text-slate-200 font-black"
                value={formData.price || ""}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 text-left">
              <label className="text-xs font-semibold text-slate-400">Stock Initial <span className="text-indigo-400">*</span></label>
              <input
                type="number" required
                className="w-full bg-[#070C18] border border-slate-800 rounded-xl py-3 px-4 outline-none text-slate-200 font-bold"
                value={formData.stock || ""}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              />
            </div>
            <div className="space-y-2 text-left">
              <label className="text-xs font-semibold text-slate-400">Seuil d'Alerte <span className="text-indigo-400">*</span></label>
              <input
                type="number" required
                className="w-full bg-[#070C18] border border-slate-800 rounded-xl py-3 px-4 outline-none text-slate-200 font-bold"
                value={formData.lowStockThreshold || ""}
                onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 text-left">
              <label className="text-xs font-semibold text-slate-400">Unité <span className="text-indigo-400">*</span></label>
              <input
                type="text" required
                placeholder="ex: kg, sac"
                className="w-full bg-[#070C18] border border-slate-800 rounded-xl py-3 px-4 outline-none focus:border-indigo-500/50 text-slate-200 font-bold"
                value={formData.unit || ""}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              />
            </div>
            <div className="space-y-2 text-left">
              <label className="text-xs font-semibold text-slate-400">Taux TVA (%)</label>
              <input
                type="number"
                className="w-full bg-[#070C18] border border-slate-800 rounded-xl py-3 px-4 outline-none text-slate-200 font-bold"
                value={formData.vatRate || ""}
                onChange={(e) => setFormData({ ...formData, vatRate: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4">
            <Link href="/products" className="flex-1 text-center bg-slate-900 hover:bg-slate-800 text-slate-300 px-6 py-3.5 rounded-xl font-bold border border-slate-800 transition-all uppercase text-[10px] tracking-widest">
              Annuler
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#5850EC] hover:bg-[#453ECE] text-white px-6 py-3.5 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? "Chargement..." : <><Save size={18} /> Enregistrer</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}