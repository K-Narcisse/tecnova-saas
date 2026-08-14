"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import { 
  LayoutDashboard, ShoppingCart, Package, Tags, Users, 
  Truck, History, DollarSign, Calculator, BarChart3, 
  ShieldCheck, Settings, Bell, Wifi, WifiOff, Smartphone, 
  Plus, Search, ChevronDown, ArrowUpDown, Edit3, Trash2, 
  AlertTriangle, Home, RefreshCw, X, AlertCircle, 
  ScanBarcode, Receipt, FolderTree, LogOut, Lock, Save 
} from "lucide-react";

import { db } from "../../lib/db";

export default function ProductsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(true);

  // --- ÉTATS POUR LES CATÉGORIES DU BACKEND ---
  const [categories, setCategories] = useState<any[]>([]);

  // Filtres
  const [selectedCategory, setSelectedCategory] = useState("Toutes");
  const [showOnlyLowStock, setShowOnlyLowStock] = useState(false);

  // Modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false); 
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Form
  const [adjustValue, setAdjustValue] = useState(""); 
  const [editFormData, setEditFormData] = useState({
    name: "", barcode: "", categoryId: "", purchasePrice: "", price: "", stock: "", lowStockThreshold: "", unit: "", vatRate: ""
  });

  const dynamicCategories = useMemo(() => {
    const names = products.map(p => {
      if (p.categoryRelation?.name) return p.categoryRelation.name;
      if (p.category && typeof p.category === 'object') return p.category.name;
      if (typeof p.category === 'string') return p.category;
      return null;
    });
    const cleanedNames = names.filter((cat): cat is string => cat !== null && cat.trim() !== "");
    return ["Toutes", ...Array.from(new Set(cleanedNames))];
  }, [products]);

  const fetchProducts = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
    try {
      const res = await axios.get(`${apiUrl}/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(res.data);
      setIsOnline(true);
    } catch (error) {
      setIsOnline(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    const token = localStorage.getItem("token");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
    try {
      const res = await axios.get(`${apiUrl}/categories`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(res.data);
    } catch (error) { console.error(error); }
  };

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
    fetchProducts();
    fetchCategories();
  }, [router]);

  if (!isMounted || !user) return null;

  const filteredProducts = products.filter((p) => {
    const matchesSearch = (p.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (p.barcode && p.barcode.includes(searchTerm));
    const pCatName = p.categoryRelation?.name || (typeof p.category === 'object' ? p.category?.name : p.category) || "Général";
    const matchesCategory = selectedCategory === "Toutes" || pCatName === selectedCategory;
    const matchesLowStock = showOnlyLowStock ? (p.stock < (p.lowStockThreshold || 5)) : true;
    return matchesSearch && matchesCategory && matchesLowStock;
  });

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsActionLoading(true);
    const token = localStorage.getItem("token");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
    const val = parseInt(adjustValue.replace(/\s/g, ""));
    try {
      await axios.patch(`${apiUrl}/products/${selectedProduct.id}/adjust-stock`, { adjustment: val }, { headers: { Authorization: `Bearer ${token}` } });
      setShowAdjustModal(false);
      setAdjustValue("");
      fetchProducts();
    } catch (error) { alert("Erreur"); } finally { setIsActionLoading(false); }
  };

  const handleEditClick = (product: any) => {
    setSelectedProduct(product);
    const pCatId = product.categoryRelation?.id || (typeof product.category === 'object' ? product.category?.id : product.categoryId) || "";
    setEditFormData({
      name: product.name || "", barcode: product.barcode || "", categoryId: pCatId,
      purchasePrice: product.purchasePrice?.toString() || "0", price: product.price?.toString() || "0",
      stock: product.stock?.toString() || "0", lowStockThreshold: product.lowStockThreshold?.toString() || "5",
      unit: product.unit || "unité", vatRate: product.vatRate?.toString() || "18"
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsActionLoading(true);
    const token = localStorage.getItem("token");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
    try {
      await axios.patch(`${apiUrl}/products/${selectedProduct.id}`, {
        ...editFormData,
        price: Number(editFormData.price),
        purchasePrice: Number(editFormData.purchasePrice),
        stock: Number(editFormData.stock),
        lowStockThreshold: Number(editFormData.lowStockThreshold),
        vatRate: Number(editFormData.vatRate),
      }, { headers: { Authorization: `Bearer ${token}` } });
      setShowEditModal(false);
      fetchProducts();
    } catch (error) { alert("Erreur"); } finally { setIsActionLoading(false); }
  };

  const handleDelete = async () => {
    setIsActionLoading(true);
    const token = localStorage.getItem("token");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
    try {
      await axios.delete(`${apiUrl}/products/${selectedProduct.id}`, { headers: { Authorization: `Bearer ${token}` } });
      setShowDeleteModal(false);
      fetchProducts();
    } catch (error) { alert("Erreur"); } finally { setIsActionLoading(false); }
  };

  const isAdmin = user?.role === "ADMIN";

  return (
    <div className="flex h-screen bg-[#020617] text-slate-300 font-sans text-sm overflow-hidden text-left">
      
      {/* 1. SIDEBAR GAUCHE */}
      <aside className="w-64 bg-[#050914] border-r border-slate-800/60 flex flex-col h-screen sticky top-0 shrink-0">
        <div className="p-6 mb-2">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/30 text-white">
                <ShoppingCart size={22} strokeWidth={2.5}/>
             </div>
             <h1 className="font-black text-white text-base tracking-tight text-left">SaaS Commerce</h1>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {isAdmin && <Link href="/dashboard"><NavItem icon={<LayoutDashboard size={18}/>} label="Tableau de Bord" /></Link>}
          <Link href="/pos"><NavItem icon={<ShoppingCart size={18}/>} label="Caisse / POS" /></Link>
          <NavItem icon={<Package size={18}/>} label="Produits et stocks" active />
          <Link href="/categories"><NavItem icon={<FolderTree size={18}/>} label="Catégories" /></Link>
          <Link href="/customers"><NavItem icon={<Users size={18}/>} label="Clients et Dettes" /></Link>
          <Link href="/suppliers"><NavItem icon={<Truck size={18}/>} label="Fournisseurs" /></Link>
          <Link href="/sales-history"><NavItem icon={<History size={18}/>} label="Ventes historiques" /></Link>
          <Link href="/expenses"><NavItem icon={<DollarSign size={18}/>} label="Gestion Dépenses" /></Link>
          
          <div className="my-2 border-t border-slate-800/40 pt-2 space-y-1">
             {isAdmin && <Link href="/accounting"><NavItem icon={<Calculator size={18}/>} label="Comptabilité" /></Link>}
             {isAdmin && <Link href="/reports"><NavItem icon={<BarChart3 size={18}/>} label="Rapports et statistiques" /></Link>}
          </div>

          <div className="my-2 border-t border-slate-800/40 pt-2 text-left">
             {isAdmin && <Link href="/settings"><NavItem icon={<Settings size={18}/>} label="Paramètres" /></Link>}
          </div>
        </nav>

        <div className="p-3 mt-auto space-y-1">
           <button className="w-full flex items-center gap-3 px-4 py-3 text-amber-500 hover:bg-amber-500/10 rounded-xl transition-all font-bold">
              <Lock size={18} /> Verrouiller
           </button>
           <button onClick={() => { localStorage.clear(); window.location.href="/login"; }} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all font-bold">
              <LogOut size={18} /> Déconnexion
           </button>
        </div>
      </aside>

      {/* 2. ZONE PRINCIPALE */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#070C18] h-full">
        <header className="h-16 border-b border-slate-800/60 flex items-center justify-between px-6 bg-[#070C18]/80 backdrop-blur-md sticky top-0 z-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#0D1629] px-3 py-1.5 rounded-lg border-2 border-slate-800 text-xs font-semibold">
              <Home size={15} className="text-slate-400" />
              <span className="text-slate-200 font-bold">{user?.companyName || "Ma Boutique"}</span>
            </div>
            <div className={`flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-lg border-2 ${isOnline ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
              {isOnline ? <Wifi size={12}/> : <WifiOff size={12}/>} <span>{isOnline ? "EN LIGNE" : "HORS LIGNE"}</span>
            </div>
          </div>
          <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white uppercase shadow-lg shadow-indigo-600/20">{user?.email?.charAt(0)}</div>
        </header>

        {/* CONTENU SCROLLABLE */}
        <div className="p-8 space-y-6 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
          
          <div className="p-8 border-2 border-slate-700 bg-[#0D1629] rounded-none flex items-center justify-between shadow-2xl shrink-0">
            <div className="text-left font-bold">
              <h2 className="text-2xl font-black text-white tracking-tight uppercase leading-none">Gestion du Stock</h2>
              <p className="text-xs text-slate-500 mt-2 font-medium">Total {products.length} référence(s) en stock.</p>
            </div>
            <Link href="/products/add">
              <button className="bg-[#5850EC] hover:bg-[#453ECE] text-white px-6 py-4 rounded-xl font-black uppercase text-xs shadow-xl transition-all flex items-center gap-2">
                <Plus size={18} /> Nouveau Produit
              </button>
            </Link>
          </div>

          <div className="flex items-center gap-4 text-left shrink-0">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Chercher un article..." className="w-full bg-[#0D1629] border-2 border-slate-800 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-indigo-500 font-bold text-slate-200" />
            </div>
            
            <div className="bg-[#0D1629] border-2 border-slate-800 rounded-2xl px-5 py-3.5 flex items-center gap-3 text-xs min-w-[220px] relative font-black">
              <select className="bg-transparent outline-none w-full appearance-none cursor-pointer pr-8 z-10 text-slate-200" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                {dynamicCategories.map(cat => (
                  <option key={cat} value={cat} className="bg-[#0D1629] font-bold">{cat}</option>
                ))}
              </select>
              <ChevronDown size={14} className="text-slate-500 absolute right-5" />
            </div>
            <button onClick={() => setShowOnlyLowStock(!showOnlyLowStock)} className={`px-5 py-3.5 rounded-2xl border-2 font-black text-xs uppercase flex items-center gap-2 transition-all ${showOnlyLowStock ? 'bg-red-500/10 border-red-500 text-red-500' : 'bg-[#0D1629] border-slate-800 text-slate-400 hover:border-red-900/50'}`}><AlertTriangle size={16} /> Ruptures seules</button>
          </div>

          {/* TABLEAU SCROLLABLE HORIZONTALEMENT ET VERTICALEMENT */}
          <div className="bg-[#0B1224] rounded-none border-2 border-slate-700 shadow-2xl overflow-x-auto overflow-y-visible">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10 bg-[#0B1224]">
                <tr className="bg-slate-900/80 border-b-2 border-slate-700 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                  <th className="px-5 py-5 border-r border-slate-700/50">CODE-BARRES</th>
                  <th className="px-5 py-5 border-r border-slate-700/50">DÉSIGNATION</th>
                  <th className="px-5 py-5 border-r border-slate-700/50">CATÉGORIES</th>
                  <th className="px-5 py-5 text-right border-r border-slate-700/50">PRIX ACHAT</th>
                  <th className="px-5 py-5 text-right border-r border-slate-700/50">PRIX VENTE</th>
                  <th className="px-5 py-5 text-center border-r border-slate-700/50">UNITÉS</th>
                  <th className="px-5 py-5 text-center border-r border-slate-700/50">STATUT SYNCHRO</th>
                  <th className="px-5 py-5 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-800">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-white/[0.04] transition-all odd:bg-white/[0.01]">
                    <td className="px-5 py-6 font-mono text-slate-400 text-xs border-r border-slate-800/40">{p.barcode || '---'}</td>
                    <td className="px-5 py-6 font-black text-slate-100 text-sm uppercase border-r border-slate-800/40">{p.name}</td>
                    <td className="px-5 py-6 text-slate-400 font-bold uppercase text-[10px] border-r border-slate-800/40">
                      {(p.category && typeof p.category === 'object') ? p.category.name : (p.category || "Général")}
                    </td>
                    <td className="px-5 py-6 text-slate-300 text-right font-medium border-r border-slate-800/40">{p.purchasePrice?.toLocaleString()} F</td>
                    <td className="px-5 py-6 font-black text-indigo-400 text-right text-base border-r border-slate-800/40">{p.price?.toLocaleString()} F</td>
                    <td className="px-5 py-6 text-center border-r border-slate-800/40">
                       <span className={`px-4 py-1.5 rounded-xl text-[11px] font-black border-2 ${p.stock < (p.lowStockThreshold || 5) ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>{p.stock} {p.unit}</span>
                    </td>
                    <td className="px-5 py-6 text-center border-r border-slate-800/40">
                       <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-lg border-2 border-emerald-500/20">SYNC</span>
                    </td>
                    <td className="px-5 py-6 text-right">
                       <div className="flex justify-end gap-3 text-slate-500">
                          <button onClick={() => { setSelectedProduct(p); setAdjustValue(""); setShowAdjustModal(true); }} className="p-2 hover:bg-white/5 rounded-lg hover:text-white transition-all"><ArrowUpDown size={18}/></button>
                          <button onClick={() => handleEditClick(p)} className="p-2 hover:bg-white/5 rounded-lg hover:text-white transition-all"><Edit3 size={18}/></button>
                          <button onClick={() => { setSelectedProduct(p); setShowDeleteModal(true); }} className="p-2 hover:bg-red-500/10 rounded-lg hover:text-red-500 transition-all"><Trash2 size={18}/></button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* MODALS */}
      {showEditModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md text-left">
          <div className="relative w-full max-w-3xl bg-[#0B1224] border border-slate-800 rounded-[2.5rem] shadow-2xl p-12 animate-in zoom-in duration-200">
             <div className="flex justify-between items-center mb-10">
                <h2 className="text-3xl font-black text-white tracking-tight">Modifier le produit</h2>
                <button onClick={() => setShowEditModal(false)} className="text-slate-500 hover:text-white transition-colors"><X size={28}/></button>
             </div>
             
             <form onSubmit={handleUpdate} className="space-y-8">
                <div className="space-y-2.5">
                   <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Conception du produit *</label>
                   <input type="text" required className="w-full bg-[#070C18] border border-slate-800 rounded-2xl p-5 text-slate-100 font-bold outline-none focus:border-indigo-500 transition-all" value={editFormData.name} onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} />
                </div>

                <div className="grid grid-cols-2 gap-8 text-left">
                   <div className="space-y-2.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Code-Barres</label>
                      <div className="flex gap-2">
                        <input type="text" className="w-full bg-[#070C18] border border-slate-800 rounded-2xl p-5 text-slate-300 font-mono outline-none" value={editFormData.barcode} onChange={(e) => setEditFormData({...editFormData, barcode: e.target.value})} />
                        <div className="w-14 h-14 bg-[#070C18] border border-slate-800 rounded-2xl flex items-center justify-center text-slate-400 shrink-0"><ScanBarcode size={24}/></div>
                      </div>
                   </div>
                   <div className="space-y-2.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Catégorie *</label>
                      <select className="w-full bg-[#070C18] border border-slate-800 rounded-2xl p-5 text-white font-black appearance-none outline-none cursor-pointer" value={editFormData.categoryId} onChange={(e) => setEditFormData({...editFormData, categoryId: e.target.value})}>
                         <option value="">Choisir...</option>
                         {categories.map(c => <option key={c.id} value={c.id} className="bg-[#0B1224]">{c.name}</option>)}
                      </select>
                   </div>
                </div>

                <div className="flex gap-4 pt-6">
                   <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 bg-[#141B2E] border border-slate-800 text-slate-400 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em]">ANNULEUR</button>
                   <button type="submit" disabled={isActionLoading} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3">
                      <Save size={20}/> {isActionLoading ? "MISE À JOUR..." : "ÉCONOMISER"}
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="relative w-full max-w-sm bg-[#0B1224] border-2 border-slate-800 rounded-[2.5rem] shadow-2xl p-10 text-center animate-in zoom-in duration-200 text-left">
             <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-red-500/20"><Trash2 size={32}/></div>
             <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight text-center">Supprimer ?</h2>
             <p className="text-slate-500 text-xs mb-8 px-4 leading-relaxed text-center">Cette action est irréversible.</p>
             <div className="flex gap-3">
                <button onClick={() => setShowDeleteModal(false)} className="flex-1 bg-slate-900 py-4 rounded-2xl font-bold uppercase text-[10px] text-slate-400">Annuler</button>
                <button onClick={handleDelete} className="flex-1 bg-red-600 text-white py-4 rounded-2xl font-black uppercase text-[10px]">SUPPRIMER</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NavItem({ icon, label, active = false, badge = "" }: any) {
  return (
    <div className={`flex items-center justify-between px-4 py-4 rounded-2xl cursor-pointer transition-all duration-300 ${active ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/40 font-bold' : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'}`}>
      <div className="flex items-center gap-4 text-left">
        <span className={active ? "text-white" : "text-indigo-400"}>{icon}</span>
        <span className="text-[13px] font-black tracking-tight">{label}</span>
      </div>
      {badge && <span className="text-[9px] font-black uppercase bg-emerald-500 text-emerald-950 px-2 py-0.5 rounded-lg border border-emerald-400/30">{badge}</span>}
    </div>
  );
}