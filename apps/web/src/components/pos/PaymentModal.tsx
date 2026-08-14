import React, { useState } from 'react';
import { DollarSign, Smartphone, CreditCard, AlertCircle } from "lucide-react";

// --- INTERFACE POUR LES TYPES (AJOUTÉ POUR TYPESCRIPT) ---
interface PaymentOptionProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  iconColor: string;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  onFinalize: (data: any) => void;
  isLoading: boolean;
}

// --- COMPOSANT INTERNE POUR LES OPTIONS ---
function PaymentOption({ active, onClick, icon, label, iconColor }: PaymentOptionProps) {
  return (
    <button 
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all ${
        active 
          ? 'bg-indigo-600/10 border-indigo-500 text-white shadow-lg' 
          : 'bg-[#020617] border-slate-800 text-slate-500 hover:border-slate-600'
      }`}
    >
      <span className={iconColor}>{icon}</span>
      <span className="text-[10px] font-bold uppercase tracking-tight">{label}</span>
    </button>
  );
}

// --- LE COMPOSANT PRINCIPAL ---
export default function PaymentModal({ isOpen, onClose, totalAmount, onFinalize, isLoading }: PaymentModalProps) {
  const [paymentType, setPaymentType] = useState("CASH");
  const [momoProvider, setMomoProvider] = useState("Orange Money");
  const [amountReceived, setAmountReceived] = useState("");

  if (!isOpen) return null;

  const changeToReturn = Number(amountReceived) > totalAmount ? Number(amountReceived) - totalAmount : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFinalize({
      paymentType: paymentType === 'MOMO' ? `MOMO (${momoProvider})` : paymentType,
      amountReceived: Number(amountReceived),
      changeToReturn
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-[#0B1224] border border-slate-800 rounded-[2.5rem] shadow-2xl p-10 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-8">
           <h2 className="text-2xl font-black text-white tracking-tight">Paiement & Encaissement</h2>
        </div>

        <div className="bg-[#020617] border border-slate-800 rounded-2xl p-6 flex justify-between items-center mb-8">
           <span className="text-slate-400 font-bold uppercase text-xs">Total à régler:</span>
           <span className="text-2xl font-black text-[#10b981]">{totalAmount.toLocaleString()} FCFA</span>
        </div>

        {/* Sélecteur de mode de paiement */}
        <div className="grid grid-cols-4 gap-3 mb-8">
           <PaymentOption active={paymentType === 'CASH'} onClick={() => setPaymentType('CASH')} icon={<DollarSign size={20}/>} label="Espèces" iconColor="text-emerald-500" />
           <PaymentOption active={paymentType === 'MOMO'} onClick={() => setPaymentType('MOMO')} icon={<Smartphone size={20}/>} label="Mobile" iconColor="text-orange-500" />
           <PaymentOption active={paymentType === 'CARD'} onClick={() => setPaymentType('CARD')} icon={<CreditCard size={20}/>} label="Carte" iconColor="text-blue-500" />
           <PaymentOption active={paymentType === 'CREDIT'} onClick={() => setPaymentType('CREDIT')} icon={<AlertCircle size={20}/>} label="Crédit" iconColor="text-rose-500" />
        </div>

        {/* Contenu dynamique */}
        <div className="bg-[#020617]/50 border border-slate-800 rounded-[1.5rem] p-6 mb-8 min-h-[160px] flex flex-col justify-center">
           {paymentType === 'CASH' && (
             <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Montant Reçu</label>
                <input
                  type="number" autoFocus
                  className="w-full bg-[#020617] border-2 border-indigo-500/50 rounded-xl p-4 text-xl text-white font-black outline-none"
                  value={amountReceived} onChange={(e) => setAmountReceived(e.target.value)}
                />
                <div className="flex justify-between text-sm font-bold pt-2">
                   <span className="text-slate-500">Monnaie à Rendre:</span>
                   <span className="text-amber-500 font-black">{changeToReturn.toLocaleString()} FCFA</span>
                </div>
             </div>
           )}

           {paymentType === 'MOMO' && (
             <div className="space-y-4 text-center">
                <p className="text-xs font-bold text-slate-400 uppercase mb-4">Opérateur</p>
                <div className="flex gap-2">
                   {['Orange', 'Wave', 'Moov'].map(p => (
                     <button key={p} type="button" onClick={() => setMomoProvider(p)} className={`flex-1 py-3 rounded-xl font-bold text-[10px] uppercase border transition-all ${momoProvider === p ? 'bg-[#FF5722] text-white border-[#FF5722]' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>{p}</button>
                   ))}
                </div>
             </div>
           )}

           {paymentType === 'CARD' && <p className="text-center text-slate-500 text-xs font-bold uppercase">Utilisez le terminal de carte</p>}

           {paymentType === 'CREDIT' && (
             <div className="text-left p-4 border border-amber-500/20 bg-amber-500/5 rounded-2xl">
                <p className="text-amber-500 font-black text-xs uppercase mb-1">Attention</p>
                <p className="text-slate-500 text-[10px]">Cette vente sera enregistrée comme une dette client.</p>
             </div>
           )}
        </div>

        <div className="flex gap-3">
           <button type="button" onClick={onClose} className="flex-1 bg-slate-900 text-slate-400 py-4 rounded-2xl font-bold">Annuler</button>
           <button type="button" onClick={handleSubmit} disabled={isLoading} className="flex-1 bg-[#10b981] hover:bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase text-xs shadow-lg transition-all">
             {isLoading ? "Chargement..." : "Valider la vente"}
           </button>
        </div>
      </div>
    </div>
  );
}