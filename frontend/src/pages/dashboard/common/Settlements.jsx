import React, { useState } from 'react';
import { 
  Receipt, 
  Search, 
  Filter, 
  X, 
  ChevronRight, 
  CreditCard, 
  History, 
  Calendar, 
  MoreVertical,
  CheckCircle2,
  Trash2,
  Bed,
  Users,
  Clock,
  Printer,
  Download,
  Wallet,
  ArrowUpRight,
  UtensilsCrossed
} from 'lucide-react';
import { cn } from "../../../utils/cn";
import { useHospitality } from "../../../context/HospitalityContext";

const Settlements = () => {
  const { folios, settleFolio, addToFolio } = useHospitality();
  const [selectedFolio, setSelectedFolio] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Open');

  const filteredFolios = folios.filter(f => {
    const matchesSearch = f.guestName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          f.roomName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'All' || f.status === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Header Area */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/20">
            <CreditCard className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-text-primary uppercase tracking-wider">Settlement Desk</h2>
            <p className="text-text-secondary text-sm font-bold mt-1">Finalize guest payments and close folios</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group min-w-[240px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search guest or room..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-5 py-3 bg-white border border-slate-100 rounded-2xl outline-none shadow-sm text-sm font-bold focus:ring-4 focus:ring-primary/5 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1 shrink-0">
          {['Open', 'Settled', 'All'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 whitespace-nowrap transition-all",
                activeTab === tab 
                ? "bg-primary text-white border-primary shadow-lg shadow-primary/10" 
                : "bg-white text-text-secondary border-transparent hover:bg-slate-50"
              )}
            >
              {tab === 'Open' ? 'Awaiting Settlement' : tab}
            </button>
          ))}
        </div>

        {/* Folios List */}
        <div className="flex-1 overflow-hidden lg:card bg-transparent lg:bg-white border-none lg:shadow-xl lg:shadow-slate-100/50 lg:rounded-[2.5rem]">
           <div className="h-full overflow-y-auto scrollbar-hide">
              <table className="w-full border-collapse hidden lg:table">
                 <thead>
                    <tr className="text-left bg-slate-50/50 border-b border-slate-100">
                       <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Guest / Room</th>
                       <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Charges</th>
                       <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Balance</th>
                       <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                       <th className="px-8 py-5"></th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {filteredFolios.map((folio) => (
                      <tr key={folio.id} className="hover:bg-slate-50/80 transition-colors group cursor-pointer" onClick={() => setSelectedFolio(folio)}>
                         <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-text-primary">
                                  <Bed className="w-5 h-5" />
                                </div>
                               <div>
                                  <p className="text-sm font-black text-text-primary uppercase tracking-tight">{folio.guestName}</p>
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{folio.roomName}</p>
                               </div>
                            </div>
                         </td>
                         <td className="px-8 py-5 text-sm font-black text-text-primary">
                            {folio.items.length} Items
                         </td>
                         <td className="px-8 py-5">
                            <span className="text-lg font-black text-primary tracking-tighter">₹{folio.total}</span>
                         </td>
                         <td className="px-8 py-5">
                            <span className={cn(
                              "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border",
                              folio.status === 'Open' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                            )}>
                               {folio.status}
                            </span>
                         </td>
                         <td className="px-8 py-5 text-right">
                            <button className="px-4 py-2 bg-primary text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">
                               Details
                            </button>
                         </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedFolio && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
          <div onClick={() => setSelectedFolio(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/20">
                   <CreditCard className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-text-primary uppercase tracking-tight">{selectedFolio.guestName}</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Settlement Ticket #{selectedFolio.id}</p>
                </div>
              </div>
              <button onClick={() => setSelectedFolio(null)} className="p-3 hover:bg-white rounded-2xl transition-all text-slate-400"><X className="w-6 h-6" /></button>
            </div>
            
            <div className="p-8 flex flex-col gap-8 overflow-hidden">
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-hide">
                 {selectedFolio.items.map((item) => (
                   <div key={item.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl">
                      <div className="flex items-center gap-4">
                         <div className={cn(
                           "w-10 h-10 rounded-xl flex items-center justify-center",
                           item.type === 'Room' ? 'bg-indigo-100 text-primary' : 'bg-amber-100 text-amber-600'
                         )}>
                            {item.type === 'Room' ? <Bed className="w-5 h-5" /> : <UtensilsCrossed className="w-5 h-5" />}
                         </div>
                         <div>
                            <p className="text-xs font-black text-text-primary uppercase tracking-tight">{item.description}</p>
                            <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{item.date}</p>
                         </div>
                      </div>
                      <p className="text-sm font-black text-text-primary">₹{item.amount}</p>
                   </div>
                 ))}
              </div>

              <div className="pt-6 border-t border-slate-100 space-y-6">
                 <div className="flex justify-between items-end px-4">
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Account Status</p>
                       <span className={cn(
                         "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border",
                         selectedFolio.status === 'Open' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                       )}>
                          {selectedFolio.status}
                       </span>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Settlement Amount</p>
                       <p className="text-4xl font-black text-primary tracking-tighter">₹{selectedFolio.total}</p>
                    </div>
                 </div>

                 {selectedFolio.status === 'Open' && (
                   <button 
                     onClick={() => { settleFolio(selectedFolio.id); setSelectedFolio(null); }}
                     className="w-full py-5 bg-primary text-white rounded-3xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/30 active:scale-95 transition-all flex items-center justify-center gap-3"
                   >
                     <CheckCircle2 className="w-5 h-5" /> Confirm Settlement
                   </button>
                 )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settlements;
