"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import { 
  LayoutDashboard, ShoppingCart, Package, Tags, Users, Truck, Plus, Search, 
  Printer, Ban, Home, Wifi, WifiOff, Bell, ChevronDown, Receipt, LogOut, DollarSign, 
  Calculator, BarChart3, Settings, ShieldCheck, Smartphone, History, FolderTree, Lock
} from "lucide-react";

// --- IMPORT DE LA BASE LOCALE ET DU COMPOSANT TICKET ---
import { db } from "../../lib/db"; 
import ReceiptModal from "../../components/pos/ReceiptModal";

export default function SalesHistoryPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [sales, setSales] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(true);

  // --- ÉTATS POUR LE MODAL DE RÉIMPRESSION ---
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState<any>(null);

  useEffect(() => {
    setIsMounted(true);
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
    } else {
        router.push("/login");
    }
    
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    fetchSales();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [router]);

  const fetchSales = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
    try {
      const res = await axios.get(`${apiUrl}/sales`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSales(res.data);
    } catch (err) {
      console.error("Erreur récup ventes");
    }
  };

  const handleOpenReceipt = (sale: any) => {
    const dataForModal = {
      ...sale,
      date: new Date(sale.createdAt).toLocaleString('fr-FR', { 
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
      }),
      customerName: sale.customer?.name || "Client de passage"
    };
    setSelectedSale(dataForModal);
    setShowReceiptModal(true);
  };

  if (!isMounted || !user) return null;

  const filteredSales = sales.filter(s => 
    (s.invoiceRef || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.customer?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.paymentType || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isAdmin = user.role === "ADMIN";
  const isCashier = user.role === "CASHIER";

  return (
    <div className="flex min-h-screen bg-[#020617] text-slate-300 font-sans text-sm overflow-hidden text-left selection:bg-indigo-500">
      
      {/* 1. SIDEBAR GAUCHE (COMPLÈTE POUR ADMIN) */}
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
          <Link href="/pos"><NavItem icon={<ShoppingCart size={18}/>} label="Caisse / POS" badge="Vente" /></Link>
          <Link href="/products"><NavItem icon={<Package size={18}/>} label="Produits et stocks" /></Link>
          <Link href="/categories"><NavItem icon={<FolderTree size={18}/>} label="Catégories" /></Link>
          <Link href="/customers"><NavItem icon={<Users size={18}/>} label="Clients et Dettes" /></Link>
          
          <NavItem icon={<Receipt size={18}/>} label="Ventes historiques" active />

          {isAdmin && (
            <>
              <Link href="/suppliers"><NavItem icon={<Truck size={18}/>} label="Fournisseurs" /></Link>
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
           <button onClick={() => router.push("/pos")} className="w-full flex items-center gap-3 px-4 py-3 text-amber-500 hover:bg-amber-500/10 rounded-xl transition-all font-bold">
              <Lock size={18} /> Verrouiller
           </button>
           <button onClick={() => { localStorage.clear(); window.location.href="/login"; }} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all font-bold">
              <LogOut size={18} /> Déconnexion
           </button>
        </div>
      </aside>

      {/* 2. ZONE PRINCIPALE */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#070C18]">
        <header className="h-16 border-b border-slate-800/60 flex items-center justify-between px-6 bg-[#070C18]/80 backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#0D1629] px-3 py-1.5 rounded-lg border-2 border-slate-800 font-bold text-xs">
              <Home size={15} className="text-slate-400" />
              <span className="text-slate-200 font-bold">{user?.companyName}</span>
            </div>
            <div className={`flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-lg border-2 ${isOnline ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
              {isOnline ? <Wifi size={12}/> : <WifiOff size={12}/>} <span>{isOnline ? "EN LIGNE" : "HORS LIGNE"}</span>
            </div>
          </div>
          <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white uppercase shadow-lg shadow-indigo-600/20">{user?.email?.charAt(0)}</div>
        </header>

        <div className="p-8 space-y-6">
           {/* BANDEAU TITRE - RECTANGLE */}
           <div className="p-8 border-2 border-slate-700 bg-[#0D1629] rounded-none flex items-center justify-between shadow-2xl">
              <div className="text-left font-bold">
                 <h2 className="text-2xl font-black text-white tracking-tight uppercase leading-none">Ventes Historiques</h2>
                 <p className="text-xs text-slate-500 mt-2 font-medium italic">Archive complète des transactions de votre boutique.</p>
              </div>
           </div>

           {/* RECHERCHE */}
           <div className="relative text-left">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher par N° facture, client ou mode de paiement..." 
                className="w-full bg-[#0D1629] border-2 border-slate-800 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-indigo-500 font-bold text-slate-200 shadow-xl"
              />
           </div>

           {/* TABLEAU AVEC LIGNES VERTICALES ET BORDURES VISIBLES */}
           <div className="bg-[#0B1224] rounded-none border-2 border-slate-700 overflow-hidden shadow-2xl">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="bg-slate-900/60 border-b-2 border-slate-700 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                       <th className="px-6 py-5 border-r border-slate-700/50">N° FACTURE</th>
                       <th className="px-6 py-5 border-r border-slate-700/50">DATE & HEURE</th>
                       <th className="px-6 py-5 border-r border-slate-700/50">CLIENT</th>
                       <th className="px-6 py-5 border-r border-slate-700/50">CAISSIER</th>
                       <th className="px-6 py-5 border-r border-slate-700/50">MODE PAIEMENT</th>
                       <th className="px-6 py-5 text-right border-r border-slate-700/50">MONTANT NET</th>
                       <th className="px-6 py-5 text-center border-r border-slate-700/50">STATUT</th>
                       <th className="px-6 py-5 text-right">ACTIONS</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y-2 divide-slate-800">
                    {filteredSales.map((s) => (
                      <tr key={s.id} className="hover:bg-white/[0.04] transition-all odd:bg-white/[0.01]">
                         <td className="px-6 py-5 font-black text-indigo-400 font-mono tracking-tighter border-r border-slate-800/40">
                            {s.invoiceRef || `FAC-${s.id.slice(0,8)}`}
                         </td>
                         <td className="px-6 py-5 text-slate-400 text-xs border-r border-slate-800/40 font-bold">
                            {new Date(s.createdAt).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                         </td>
                         <td className="px-6 py-5 font-black text-slate-200 border-r border-slate-800/40">
                            {s.customer?.name || "Client de passage"}
                         </td>
                         <td className="px-6 py-5 text-slate-500 text-xs font-medium border-r border-slate-800/40 uppercase">Vendeur Principal</td>
                         <td className="px-6 py-5 border-r border-slate-800/40">
                            <span className="text-[10px] font-black text-slate-300 uppercase bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700">
                               {s.paymentType}
                            </span>
                         </td>
                         <td className="px-6 py-5 text-right font-black text-emerald-400 text-base border-r border-slate-800/40">
                            {s.totalAmount.toLocaleString()} F
                         </td>
                         <td className="px-6 py-5 text-center border-r border-slate-800/40">
                            <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-black px-2 py-0.5 rounded-lg border-2 border-emerald-500/20">SYNC</span>
                         </td>
                         <td className="px-6 py-5 text-right">
                            <div className="flex justify-end items-center gap-3">
                               <button 
                                 onClick={() => handleOpenReceipt(s)}
                                 className="p-2.5 bg-slate-800 text-slate-400 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-lg"
                                 title="Imprimer"
                               >
                                 <Printer size={16}/>
                               </button>
                               <button className="p-2.5 bg-slate-800 text-slate-400 rounded-xl hover:bg-red-600 hover:text-white transition-all">
                                 <Ban size={16}/>
                               </button>
                            </div>
                         </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      </main>

      {showReceiptModal && (
        <ReceiptModal 
          isOpen={showReceiptModal} 
          onClose={() => setShowReceiptModal(false)} 
          saleData={selectedSale} 
        />
      )}
    </div>
  );
}

function NavItem({ icon, label, active = false, badge = "", highlight = false }: any) {
  return (
    <div className={`relative flex items-center justify-between px-4 py-4 rounded-2xl cursor-pointer transition-all duration-300 group 
      ${active ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 font-bold' : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'}`}>
      <div className="flex items-center gap-4">
        <span className={active ? "text-white" : "text-indigo-400"}>
          {icon}
        </span>
        <span className="text-[13px] font-black tracking-tight">{label}</span>
      </div>
      {badge && <span className="text-[9px] font-black uppercase bg-emerald-500 text-emerald-950 px-2 py-0.5 rounded-lg border border-emerald-400/30">{badge}</span>}
    </div>
  );
}