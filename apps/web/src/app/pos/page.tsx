"use client";

import React, { useState, useEffect, useMemo, useRef } from "react"; 
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import { 
  LayoutDashboard, ShoppingCart, Package, Tags, Users, Plus, Minus, Search, ChevronDown, 
  X, UserPlus, ShoppingBag, CheckCircle2, ScanBarcode, Trash2, 
  Wifi, WifiOff, Bell, Home, Receipt, Calculator, BarChart3, Truck, DollarSign, LogOut,
  Check, Lock, Unlock, Delete, History, ShieldCheck, Settings, FolderTree
} from "lucide-react";

// --- IMPORT DE LA BASE LOCALE ---
import { db } from "../../lib/db"; 

// --- IMPORT DES COMPOSANTS SÉPARÉS ---
import PaymentModal from "../../components/pos/PaymentModal";
import ReceiptModal from "../../components/pos/ReceiptModal";

export default function POSPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous les Produits");
  const [discount, setDiscount] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  // --- ÉTATS POUR LE CODE PIN (SÉCURITÉ) ---
  const [isLocked, setIsLocked] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);

  // --- ÉTATS POUR LES MODALS ---
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [lastSale, setLastSale] = useState<any>(null);

  // --- ÉTATS POUR LE CLIENT SÉLECTIONNÉ ---
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
  const clientDropdownRef = useRef<HTMLDivElement>(null);

  const dynamicCategories = useMemo(() => {
    const names = products
      .map(p => {
        const val = p.categoryRelation?.name || (p.category && typeof p.category === 'object' ? p.category.name : p.category);
        return typeof val === 'string' ? val : null;
      })
      .filter((c): c is string => c !== null && c.trim() !== ""); 
    return ["Tous les Produits", ...Array.from(new Set(names))];
  }, [products]);

  useEffect(() => {
    setIsMounted(true);
    const savedUser = localStorage.getItem("user");
    
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      if (parsedUser.role === "MANAGER") {
        router.push("/products"); 
      }
    } else {
      router.push("/login"); 
    }
    
    setIsOnline(navigator.onLine);
    const handleOnline = () => { setIsOnline(true); syncOfflineSales(); };
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleClickOutside = (e: MouseEvent) => {
      if (clientDropdownRef.current && !clientDropdownRef.current.contains(e.target as Node)) {
        setIsClientDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    initData();
    fetchClientsFromServer();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [router]);

  const initData = async () => {
    try {
      const localProducts = await db.products.toArray();
      if (localProducts.length > 0) setProducts(localProducts);
    } catch (e) { console.error(e); }
    if (navigator.onLine) await fetchProductsFromServer();
  };

  const fetchProductsFromServer = async () => {
    const token = localStorage.getItem("token");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
    try {
      const res = await axios.get(`${apiUrl}/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await db.transaction('rw', db.products, async () => {
        await db.products.clear();
        await db.products.bulkAdd(res.data);
      }).catch(e => {});
      setProducts(res.data);
    } catch (err) { setIsOnline(false); }
  };

  const fetchClientsFromServer = async () => {
    const token = localStorage.getItem("token");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
    try {
      const res = await axios.get(`${apiUrl}/customers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data) {
        await db.customers.bulkPut(res.data).catch(e => {});
        setClients(res.data);
      }
    } catch (err) { console.error(err); }
  };

  const syncOfflineSales = async () => {
    const token = localStorage.getItem("token");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
    const offlineSales = await db.pendingSales.where({ synced: 0 }).toArray();
    if (offlineSales.length === 0) return;
    for (const sale of offlineSales) {
      try {
        await axios.post(`${apiUrl}/sales`, sale.saleData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        await db.pendingSales.update(sale.id!, { synced: 1 });
      } catch (e) { console.error(e); }
    }
  };

  const handlePinClick = (num: string) => {
    if (pinInput.length < 4) {
      const newPin = pinInput + num;
      setPinInput(newPin);
      if (newPin.length === 4) {
        if (newPin === user?.pinCode) {
          setIsLocked(false);
          setPinInput("");
          setPinError(false);
        } else {
          setPinError(true);
          setTimeout(() => { setPinInput(""); setPinError(false); }, 1000);
        }
      }
    }
  };

  const addToCart = (product: any) => {
    if (product.stock <= 0) return;
    const existing = cart.find(item => item.id === product.id);
    if (existing && existing.qty >= product.stock) {
      alert("Stock épuisé");
      return;
    }
    if (existing) updateQty(product.id, 1);
    else setCart([...cart, { ...product, qty: 1 }]);
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        const original = products.find(p => p.id === id);
        if (delta > 0 && original && newQty > original.stock) return item;
        return { ...item, qty: Math.max(1, newQty) };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => setCart(cart.filter(item => item.id !== id));
  const totalBrut = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const netAPayer = totalBrut - discount;
  const selectedClient = clients.find(c => c.id === selectedClientId) || null;

  const handleFinalizeSale = async (paymentData: any) => {
    setIsActionLoading(true);
    const token = localStorage.getItem("token");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
    const saleData = {
      cart, total: netAPayer, discount, customerId: selectedClientId || null,
      paymentType: paymentData.paymentType,
      invoiceRef: `FAC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString(),
      amountReceived: paymentData.amountReceived,
      changeToReturn: paymentData.changeToReturn
    };
    try {
      if (navigator.onLine) {
        await axios.post(`${apiUrl}/sales`, saleData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await db.pendingSales.add({ saleData, synced: 0, createdAt: new Date().toISOString() });
      }
      setLastSale(saleData);
      setShowPaymentModal(false);
      setShowReceiptModal(true);
      setCart([]);
      setDiscount(0);
      setSelectedClientId("");
      if (navigator.onLine) fetchProductsFromServer();
    } catch (error) {
      await db.pendingSales.add({ saleData, synced: 0, createdAt: new Date().toISOString() });
    } finally {
      setIsActionLoading(false);
    }
  };

  if (!isMounted) return null;

  const filteredProducts = products.filter(p => {
    const matchesSearch = (p.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || (p.barcode || "").includes(searchTerm);
    const pCatName = p.categoryRelation?.name || (p.category && typeof p.category === 'object' ? p.category.name : p.category) || "Sans catégorie";
    const matchesCat = selectedCategory === "Tous les Produits" || pCatName === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const isCashier = user?.role === "CASHIER";
  const isAdmin = user?.role === "ADMIN";

  return (
    <div className="flex h-screen bg-[#020617] text-slate-300 font-sans text-sm overflow-hidden relative">
      
      {/* --- OVERLAY VERROUILLAGE (CODE PIN) --- */}
      {isLocked && (
        <div className="absolute inset-0 z-[200] bg-[#020617]/95 backdrop-blur-xl flex flex-col items-center justify-center animate-in fade-in duration-300">
           <div className="w-80 text-center space-y-8">
              <div className="w-20 h-20 bg-indigo-600/20 rounded-full flex items-center justify-center mx-auto border border-indigo-500/30 shadow-2xl">
                 <Lock className="text-indigo-400" size={32} />
              </div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Caisse Verrouillée</h2>
              <div className="flex justify-center gap-4 py-4">
                 {[1,2,3,4].map(i => (<div key={i} className={`w-4 h-4 rounded-full border-2 border-indigo-500/50 ${pinInput.length >= i ? 'bg-indigo-500 scale-125 shadow-lg shadow-indigo-500/50' : 'bg-transparent'}`}></div>))}
              </div>
              <div className="grid grid-cols-3 gap-4">
                 {[1,2,3,4,5,6,7,8,9].map(n => (<button key={n} onClick={() => handlePinClick(n.toString())} className="w-16 h-16 rounded-2xl bg-[#0D1629] border border-slate-800 text-xl font-black text-white hover:bg-indigo-600 transition-all">{n}</button>))}
                 <button onClick={() => setPinInput("")} className="w-16 h-16 rounded-2xl bg-slate-900/50 text-slate-500 flex items-center justify-center hover:text-red-400"><Delete size={24}/></button>
                 <button onClick={() => handlePinClick("0")} className="w-16 h-16 rounded-2xl bg-[#0D1629] border border-slate-800 text-xl font-black text-white hover:bg-indigo-600">0</button>
              </div>
              {pinError && <p className="text-red-500 font-black uppercase text-[10px] tracking-widest animate-bounce">Code PIN Incorrect</p>}
           </div>
        </div>
      )}

      {/* 1. SIDEBAR GAUCHE (TOTALE POUR ADMIN) */}
      <aside className="w-64 bg-[#090F1F] border-r border-slate-800/60 flex flex-col shrink-0 text-left">
        <div className="p-5 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg"><ShoppingCart className="text-white" size={20} /></div>
          <h1 className="font-bold text-white text-base tracking-tight">SaaS Commerce</h1>
        </div>
        <nav className="flex-1 px-3 space-y-1 mt-2 overflow-y-auto">
          
          {/* Dashboard : ADMIN uniquement */}
          {isAdmin && <Link href="/dashboard"><NavItem icon={<LayoutDashboard size={18}/>} label="Tableau de Bord" /></Link>}
          
          {/* Caisse / POS : ADMIN et CAISSIER */}
          {(isAdmin || isCashier) && <NavItem icon={<ShoppingCart size={18}/>} label="Caisse / POS" active />}
          
          {/* Produits & Stocks : ADMIN et MANAGER (L'admin voit TOUT ici) */}
          {(isAdmin || !isCashier) && (
            <>
              <Link href="/products"><NavItem icon={<Package size={18}/>} label="Produits & Stocks" /></Link>
              <Link href="/categories"><NavItem icon={<FolderTree size={18}/>} label="Catégories" /></Link>
            </>
          )}

          {/* Clients : TOUT LE MONDE */}
          <Link href="/customers"><NavItem icon={<Users size={18}/>} label="Clients & Dettes" /></Link>
          
          {/* Fournisseurs, Historique, Dépenses : ADMIN uniquement */}
          {isAdmin && (
            <>
              <Link href="/suppliers"><NavItem icon={<Truck size={18}/>} label="Fournisseurs" /></Link>
              <Link href="/sales-history"><NavItem icon={<History size={18}/>} label="Historique Ventes" /></Link>
              <Link href="/expenses"><NavItem icon={<DollarSign size={18}/>} label="Gestion Dépenses" /></Link>
              <Link href="/accounting"><NavItem icon={<Calculator size={18}/>} label="Comptabilité" /></Link>
              <Link href="/reports"><NavItem icon={<BarChart3 size={18}/>} label="Rapports & Stats" /></Link>
              <div className="pt-4 border-t border-slate-800/40 space-y-1">
                 <Link href="/settings"><NavItem icon={<Settings size={18}/>} label="Paramètres" /></Link>
              </div>
            </>
          )}

          <div className="pt-4 mt-4 border-t border-slate-800 space-y-2">
             <button onClick={() => setIsLocked(true)} className="w-full flex items-center gap-3 px-4 py-3 text-amber-500 hover:bg-amber-500/10 rounded-xl transition-all font-bold">
                <Lock size={18} /> Verrouiller
             </button>
             <button onClick={() => { localStorage.clear(); window.location.href="/login"; }} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all font-bold text-left">
                <LogOut size={18} /> Déconnexion
             </button>
          </div>
        </nav>
      </aside>

      {/* 2. ZONE CENTRALE (DESIGN TRÈS VISIBLE) */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#070C18]">
        <header className="h-16 border-b border-slate-800/60 flex items-center justify-between px-6 bg-[#070C18]/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-3 text-left font-bold text-slate-200">
             <div className="flex items-center gap-2 bg-[#0D1629] px-3 py-1.5 rounded-lg border border-slate-800">
              <Home size={15} className="text-slate-400" /> {user?.companyName}
            </div>
            <div className={`flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all ${isOnline ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
              {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />} <span>{isOnline ? "EN LIGNE" : "HORS LIGNE"}</span>
            </div>
          </div>
          <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white text-xs uppercase shadow-lg shadow-indigo-500/20">{user?.email?.charAt(0)}</div>
        </header>

        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          <div className="relative text-left">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Chercher un produit..." className="w-full bg-[#0D1629] border-2 border-slate-800 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-indigo-500 font-bold text-slate-200 shadow-xl" />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {dynamicCategories.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-5 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest border-2 transition-all ${selectedCategory === cat ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg' : 'bg-[#111827] text-slate-400 border-slate-800 hover:border-slate-600'}`}>{cat}</button>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredProducts.map((p) => {
              const isInCart = cart.some(item => item.id === p.id);
              const isOutOfStock = p.stock <= 0;
              return (
                <div key={p.id} className={`bg-[#0B1224] border-2 rounded-[2rem] p-6 flex flex-col relative group transition-all duration-300 text-left ${isInCart ? 'border-emerald-500 bg-emerald-500/5 shadow-[0_0_25px_rgba(16,185,129,0.15)] scale-[1.02]' : 'border-slate-700 hover:border-indigo-500/50'}`}>
                  <span className={`absolute top-4 right-4 text-[10px] font-black px-3 py-1 rounded-full border-2 ${isOutOfStock ? 'bg-red-600/20 text-red-500 border-red-600/30' : p.stock < 5 ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>{isOutOfStock ? "RUPTURE" : `${p.stock} st.`}</span>
                  <h3 className="font-black text-slate-100 text-[15px] leading-tight mb-8 pr-10">{p.name}</h3>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-800/50">
                     <p className="text-indigo-400 font-black text-lg tracking-tighter">{p.price?.toLocaleString()} F</p>
                     <button onClick={() => addToCart(p)} disabled={isOutOfStock} className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-xl transition-all hover:scale-110 active:scale-95 ${isOutOfStock ? 'bg-slate-800 opacity-20 cursor-not-allowed' : isInCart ? 'bg-emerald-500 shadow-emerald-500/30' : 'bg-indigo-600 shadow-indigo-500/20'}`}>{isInCart ? <Check size={22} strokeWidth={3} /> : <Plus size={22} strokeWidth={3} />}</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* 3. PANIER (BORDURES ET LIGNES RENFORCÉES) */}
      <aside className="w-[480px] bg-[#0B1120] border-l border-slate-800 flex flex-col shrink-0 relative text-left">
        <div className="p-8 border-b border-slate-800 bg-slate-900/20">
           <div className="flex items-center gap-4 mb-6"><div className="p-3 bg-indigo-500/10 rounded-2xl"><ShoppingCart className="text-indigo-500" size={24} /></div><h2 className="font-black text-white text-xl">Vente en cours</h2></div>
           <div className="flex items-center gap-2">
              <div className="flex-1 relative" ref={clientDropdownRef}>
                 <button onClick={() => setIsClientDropdownOpen(o => !o)} className="w-full flex items-center justify-between bg-[#020617] border-2 border-slate-800 rounded-2xl px-5 py-4 text-left text-slate-200 font-black outline-none focus:border-indigo-500 transition-all">
                    <span className="truncate">{selectedClient ? selectedClient.name : "-- Client de passage --"}</span>
                    <ChevronDown size={18} className={`text-slate-500 transition-transform ${isClientDropdownOpen ? "rotate-180" : ""}`} />
                 </button>
                 {isClientDropdownOpen && (
                    <div className="absolute z-30 mt-2 w-full bg-[#0B1224] border-2 border-slate-800 rounded-[1.5rem] shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
                       <div onClick={() => { setSelectedClientId(""); setIsClientDropdownOpen(false); }} className={`px-5 py-4 cursor-pointer font-black text-xs uppercase tracking-widest ${selectedClientId === "" ? "bg-indigo-600 text-white" : "text-slate-200 hover:bg-slate-800"}`}>-- Client de passage --</div>
                       {clients.map(c => (
                          <div key={c.id} onClick={() => { setSelectedClientId(c.id); setIsClientDropdownOpen(false); }} className={`px-5 py-4 cursor-pointer text-sm font-bold border-t border-slate-800/50 ${selectedClientId === c.id ? "bg-indigo-600 text-white" : "text-slate-300 hover:bg-slate-800"}`}>{c.name}</div>
                       ))}
                    </div>
                 )}
              </div>
              <button className="w-14 h-14 bg-[#141B2E] border-2 border-slate-800 rounded-2xl flex items-center justify-center text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all shadow-lg"><UserPlus size={24} /></button>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
          {cart.map(item => (
            <div key={item.id} className="bg-[#0D1629] border-2 border-indigo-500/30 rounded-3xl p-5 flex flex-col gap-4 group shadow-lg animate-in slide-in-from-right-4 duration-200">
               <div className="flex justify-between items-start text-left">
                  <div className="max-w-[280px]"><p className="font-black text-slate-100 text-sm leading-tight mb-1">{item.name}</p><p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">{item.price.toLocaleString()} F / unité</p></div>
                  <p className="font-black text-indigo-400 text-base">{ (item.qty * item.price).toLocaleString() } F</p>
               </div>
               <div className="flex items-center justify-between pt-3 border-t border-slate-800/60">
                  <div className="flex items-center bg-[#020617] rounded-xl border-2 border-slate-800 p-1.5 shadow-inner">
                     <button onClick={() => updateQty(item.id, -1)} className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"><Minus size={16} strokeWidth={3}/></button>
                     <span className="w-12 text-center font-black text-white text-base">{item.qty}</span>
                     <button onClick={() => updateQty(item.id, 1)} className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"><Plus size={16} strokeWidth={3}/></button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="w-10 h-10 flex items-center justify-center text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"><X size={20} strokeWidth={3}/></button>
               </div>
            </div>
          ))}
          {cart.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-10 py-20"><ShoppingBag size={80} strokeWidth={1} /><p className="font-black mt-4 uppercase tracking-[0.2em] text-sm">Panier vide</p></div>
          )}
        </div>

        <div className="p-8 bg-[#090F1F] border-t-2 border-slate-800 space-y-5 shadow-[0_-15px_40px_rgba(0,0,0,0.4)]">
           <div className="flex justify-between text-xs font-black uppercase tracking-widest opacity-60"><span>Sous-total:</span><span>{totalBrut.toLocaleString()} FCFA</span></div>
           <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-slate-400"><span>Remise Accordée:</span><div className="flex items-center bg-[#020617] border-2 border-slate-800 rounded-xl px-4 py-2"><input type="number" value={discount || 0} onChange={(e) => setDiscount(Number(e.target.value))} className="bg-transparent text-right text-slate-200 outline-none w-20 font-black" /> <span className="ml-2 text-[10px]">F</span></div></div>
           <div className="flex justify-between items-end pt-4 text-right border-t-2 border-slate-800">
              <span className="font-black text-slate-500 text-xs uppercase tracking-[0.3em]">NET À PAYER:</span>
              <span className="font-black text-[#10b981] text-4xl tracking-tighter drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">{netAPayer.toLocaleString()} F</span>
           </div>
           <button onClick={() => setShowPaymentModal(true)} disabled={cart.length === 0} className="w-full bg-[#10b981] hover:bg-[#059669] text-white py-5 rounded-[1.5rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-3 disabled:opacity-30 disabled:grayscale">
              <CheckCircle2 size={24} /> Valider l'Encaissement
           </button>
        </div>
      </aside>

      {/* --- MODALS --- */}
      <PaymentModal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} totalAmount={netAPayer} isLoading={isActionLoading} onFinalize={handleFinalizeSale} />
      <ReceiptModal isOpen={showReceiptModal} onClose={() => setShowReceiptModal(false)} saleData={lastSale} />
    </div>
  );
}

function NavItem({ icon, label, active = false, badge = "" }: any) {
  return (
    <div className={`flex items-center justify-between px-4 py-4 rounded-2xl cursor-pointer transition-all duration-300 ${active ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/40' : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'}`}>
      <div className="flex items-center gap-4">
        <span className={active ? "text-white" : "text-indigo-400"}>{icon}</span>
        <span className="text-[13px] font-black tracking-tight">{label}</span>
      </div>
      {badge && <span className="text-[9px] font-black uppercase bg-emerald-500 text-emerald-950 px-2 py-0.5 rounded-lg border border-emerald-400/30">{badge}</span>}
    </div>
  );
}