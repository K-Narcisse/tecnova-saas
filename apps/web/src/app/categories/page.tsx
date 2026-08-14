"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
// --- TOUTES LES ICÔNES IMPORTÉES SANS OUBLI ---
import {
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  FolderTree, 
  Users, 
  Truck, 
  Receipt,
  DollarSign, 
  Calculator, 
  BarChart3, 
  Building2, 
  Settings, 
  Wifi, 
  WifiOff, 
  Bell,
  ChevronDown, 
  Plus, 
  X, 
  Store, 
  Smartphone, 
  LogOut, 
  Lock, 
  History,
  Home, 
  AlertCircle,
  Save
} from "lucide-react";

import { db } from "../../lib/db";

export default function CategoriesPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

  useEffect(() => {
    setIsMounted(true);
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      if (parsedUser.role === "CASHIER") router.push("/pos");
    } else {
      router.push("/login");
    }

    setIsOnline(navigator.onLine);
    initData();
  }, [router]);

  const initData = async () => {
    const localProducts = await db.products.toArray();
    if (localProducts.length > 0) buildCategoriesFromProducts(localProducts);
    if (navigator.onLine) await fetchCategoriesFromServer();
  };

  const buildCategoriesFromProducts = (products: any[]) => {
    const map = new Map<string, { name: string; description: string; count: number }>();
    products.forEach((p) => {
      const catVal = p.categoryRelation?.name || (p.category && typeof p.category === 'object' ? p.category.name : p.category);
      const catName = typeof catVal === 'string' ? catVal : "Général";
      if (!map.has(catName)) {
        map.set(catName, { name: catName, description: "Articles répertoriés", count: 0 });
      }
      map.get(catName)!.count += 1;
    });
    setCategories(Array.from(map.values()));
  };

  const fetchCategoriesFromServer = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await axios.get(`${apiUrl}/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(res.data);
    } catch (err) { console.error("Erreur API"); }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    setIsSaving(true);
    const token = localStorage.getItem("token");
    try {
      await axios.post(`${apiUrl}/categories`,
        { name: newCategoryName, description: newCategoryDescription },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchCategoriesFromServer();
      setShowNewCategoryModal(false);
      setNewCategoryName("");
      setNewCategoryDescription("");
    } catch (err) { alert("Erreur"); } finally { setIsSaving(false); }
  };

  if (!isMounted || !user) return <div className="h-screen bg-[#020617]"></div>;

  const isAdmin = user.role === "ADMIN";

  return (
    <div className="flex h-screen bg-[#020617] text-slate-300 font-sans text-sm overflow-hidden text-left">
      
      {/* 1. SIDEBAR GAUCHE (CONFORME À TON IMAGE) */}
      <aside className="w-64 bg-[#050914] border-r border-slate-800/60 flex flex-col h-screen sticky top-0 shrink-0">
        <div className="p-6 mb-2">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/30 text-white">
                <ShoppingCart size={22} strokeWidth={2.5}/>
             </div>
             <h1 className="font-black text-white text-base tracking-tight">SaaS Commerce</h1>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {isAdmin && <Link href="/dashboard"><NavItem icon={<LayoutDashboard size={18}/>} label="Tableau de Bord" /></Link>}
          <Link href="/pos"><NavItem icon={<ShoppingCart size={18}/>} label="Caisse / POS" /></Link>
          <Link href="/products"><NavItem icon={<Package size={18}/>} label="Produits et stocks" /></Link>
          <NavItem icon={<FolderTree size={18}/>} label="Catégories" active />
          <Link href="/customers"><NavItem icon={<Users size={18}/>} label="Clients et Dettes" /></Link>
          
          {isAdmin && (
            <>
              <Link href="/suppliers"><NavItem icon={<Truck size={18}/>} label="Fournisseurs" /></Link>
              <Link href="/sales-history"><NavItem icon={<History size={18}/>} label="Ventes historiques" /></Link>
              <Link href="/expenses"><NavItem icon={<DollarSign size={18}/>} label="Gestion Dépenses" /></Link>
              
              <div className="my-2 border-t border-slate-800/40 pt-2 space-y-1">
                <Link href="/accounting"><NavItem icon={<Calculator size={18}/>} label="Comptabilité" /></Link>
                <Link href="/reports"><NavItem icon={<BarChart3 size={18}/>} label="Rapports et statistiques" /></Link>
              </div>

              <div className="my-2 border-t border-slate-800/40 pt-2">
                <Link href="/settings"><NavItem icon={<Settings size={18}/>} label="Paramètres" /></Link>
              </div>
            </>
          )}
        </nav>

        <div className="p-3 mt-auto space-y-1">
           <button onClick={() => {}} className="w-full flex items-center gap-3 px-4 py-3 text-amber-500 hover:bg-amber-500/10 rounded-xl transition-all font-bold">
              <Lock size={18} /> Verrouiller
           </button>
           <button onClick={() => { localStorage.clear(); window.location.href="/login"; }} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all font-bold">
              <LogOut size={18} /> Déconnexion
           </button>
        </div>
      </aside>

      {/* 2. ZONE PRINCIPALE */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#070C18]">
        <header className="h-16 border-b border-slate-800/60 flex items-center justify-between px-6 bg-[#070C18]/80 backdrop-blur-md sticky top-0 z-50 text-left">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#0D1629] px-3 py-1.5 rounded-lg border-2 border-slate-800 font-bold text-xs">
              <Home size={14} className="text-slate-400" />
              <span>{user?.companyName}</span>
            </div>
            <div className={`flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-lg border-2 ${isOnline ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
              {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
              <span>{isOnline ? "EN LIGNE" : "HORS LIGNE"}</span>
            </div>
          </div>
          <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white uppercase shadow-lg shadow-indigo-600/20">{user?.email?.charAt(0)}</div>
        </header>

        <div className="p-8 flex-1 overflow-y-auto">
          {/* BANDEAU TITRE - MODIFIÉ EN RECTANGLE (rounded-none) */}
          <div className="p-8 border-2 border-slate-700 bg-[#0D1629] rounded-none flex items-center justify-between shadow-2xl max-w-6xl mx-auto mb-8">
            <div className="text-left font-bold">
                <h2 className="text-2xl font-black text-white tracking-tight uppercase leading-none">Catégories</h2>
                <p className="text-xs text-slate-500 mt-2 font-medium">Gestion et organisation de votre catalogue.</p>
            </div>
            {/* BOUTON MODIFIÉ EN RECTANGLE (rounded-none) */}
            <button
              onClick={() => setShowNewCategoryModal(true)}
              className="bg-[#5850EC] hover:bg-indigo-500 text-white px-6 py-4 rounded-none font-black uppercase text-xs tracking-[0.1em] shadow-xl transition-all flex items-center gap-2"
            >
              <Plus size={18} /> Nouvelle Catégorie
            </button>
          </div>

          {/* GRILLE DE CATÉGORIES AVEC BORDURES FORTES POUR LA VISIBILITÉ */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {categories.map((cat, idx) => (
              <div
                key={idx}
                className="bg-[#0D1629] border-2 border-slate-700 rounded-[2rem] p-8 flex flex-col gap-4 hover:border-indigo-500 transition-all shadow-2xl relative overflow-hidden group text-left leading-tight"
              >
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-indigo-500/10 rounded-2xl">
                    <FolderTree size={24} className="text-indigo-400" />
                  </div>
                  <span className="text-[10px] font-black bg-slate-800 text-slate-300 px-4 py-1.5 rounded-xl border-2 border-slate-700 uppercase">
                    {cat.count || 0} articles
                  </span>
                </div>
                <div>
                   <h3 className="font-black text-white text-xl uppercase tracking-tight mb-2">{cat.name}</h3>
                   <p className="text-slate-500 text-xs font-medium leading-relaxed">{cat.description || "Aucune description renseignée."}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* MODAL NOUVELLE CATÉGORIE (DESIGN RECTANGLE POUR LES BOUTONS) */}
      {showNewCategoryModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 text-left">
          <div className="bg-[#0B1120] border-2 border-slate-800 rounded-none w-full max-w-md p-10 space-y-8 animate-in zoom-in duration-200 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-white text-2xl uppercase tracking-tighter">Nouvelle Catégorie</h3>
              <button onClick={() => setShowNewCategoryModal(false)} className="text-slate-500 hover:text-white transition-colors">
                <X size={28} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Nom de la catégorie</label>
                <input
                  type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Ex: Épicerie"
                  className="w-full bg-[#020617] border-2 border-slate-800 rounded-none p-4 outline-none focus:border-indigo-500 transition-all text-white font-black"
                />
              </div>
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Description</label>
                <input
                  type="text" value={newCategoryDescription} onChange={(e) => setNewCategoryDescription(e.target.value)}
                  placeholder="Détails de la catégorie..."
                  className="w-full bg-[#020617] border-2 border-slate-800 rounded-none p-4 outline-none focus:border-indigo-500 transition-all text-white font-bold"
                />
              </div>
            </div>

            <button
              onClick={handleCreateCategory} disabled={isSaving || !newCategoryName.trim()}
              className="w-full bg-[#5850EC] hover:bg-indigo-600 text-white py-5 rounded-none font-black uppercase text-xs tracking-[0.2em] shadow-2xl"
            >
              {isSaving ? "Traitement..." : "Créer la catégorie"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function NavItem({ icon, label, active = false, badge = "" }: any) {
  return (
    <div className={`flex items-center justify-between px-4 py-4 rounded-2xl cursor-pointer transition-all duration-300 ${active ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/40 font-bold" : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"}`}>
      <div className="flex items-center gap-4 text-left">
        <span className={active ? "text-white" : "text-indigo-400"}>{icon}</span>
        <span className="text-[13px] font-bold tracking-tight">{label}</span>
      </div>
      {badge && <span className="text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">{badge}</span>}
    </div>
  );
}