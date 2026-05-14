import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ShoppingCart, Search, Plus, X, Receipt } from 'lucide-react';
import { Link } from 'react-router-dom';

const guestMenuData = [
  { id: 1, name: 'Bintang Beer', desc: 'Local premium lager, 330ml bottle', price: 'Rp 45.000', category: 'Bar', icon: '🍺' },
  { id: 2, name: 'Tropical Mojito', desc: 'White rum, fresh mint, lime juice, mango syrup', price: 'Rp 75.000', category: 'Bar', icon: '🍹' },
  { id: 3, name: 'Espresso Martini', desc: 'Vodka, fresh espresso, coffee liqueur, vanilla', price: 'Rp 85.000', category: 'Bar', icon: '🍸' },
  { id: 4, name: 'Fresh Young Coconut', desc: 'Chilled young coconut, served with straw', price: 'Rp 35.000', category: 'Bar', icon: '🥥' },
  { id: 5, name: 'Mango Lassi', desc: 'Fresh mango, yogurt, milk, cardamom', price: 'Rp 45.000', category: 'Lunch', icon: '🥭' },
  { id: 6, name: 'Red Wine', desc: 'House selection — Chilean Merlot, 175ml', price: 'Rp 85.000', category: 'Bar', icon: '🍷' },
  { id: 7, name: 'Sparkling Water', desc: 'San Pellegrino 500ml', price: 'Rp 30.000', category: 'Bar', icon: '💧' },
];

const GuestMenu = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const tabs = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Bar'];

  const filteredMenu = activeTab === 'All' 
    ? guestMenuData 
    : guestMenuData.filter(item => item.category === activeTab);

  return (
    <div className="min-h-screen bg-[#e0f7f3]/50 font-sans pb-32 relative">
      {/* Header */}
      <header className="bg-white px-4 py-3.5 flex items-center justify-between sticky top-0 z-50 shadow-sm border-b border-gray-50">
        <div className="flex items-center gap-3">
          <Link to="/guest-app" className="text-slate-400 hover:text-slate-800 transition-colors">
            <ChevronLeft size={20} strokeWidth={3} />
          </Link>
          <h1 className="text-lg font-black text-slate-800 tracking-tight">Menu</h1>
        </div>

        {/* Welcome Toast */}
        <div className="hidden sm:flex items-center gap-2 bg-white border border-gray-100 px-3 py-1.5 rounded-full shadow-md shadow-gray-100">
          <div className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-white text-[8px]">
            ✓
          </div>
          <span className="text-[9px] font-bold text-slate-600 tracking-tight">Welcome, MANUEL! 🎉</span>
        </div>

        <button 
          onClick={() => setIsCartOpen(true)}
          className="relative w-9 h-9 bg-orange-50 text-orange-500 rounded-lg flex items-center justify-center"
        >
          <ShoppingCart size={18} />
          <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[8px] w-3.5 h-3.5 flex items-center justify-center rounded-full font-black">2</span>
        </button>
      </header>

      <main className="max-w-md md:max-w-3xl mx-auto px-4 pt-4">
        {/* Categories Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeTab === tab 
                ? 'bg-orange-500 text-white shadow-md shadow-orange-100' 
                : 'bg-white text-gray-400 hover:bg-gray-50'
              }`}
            >
              {tab} {tab === 'Bar' && '🍹'}
            </button>
          ))}
        </div>

        {/* Product List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-10">
          <AnimatePresence mode="popLayout">
            {filteredMenu.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="bg-white rounded-2xl p-3 flex items-center gap-3 shadow-sm border border-gray-50 hover:border-orange-100 transition-all group"
              >
                {/* Icon/Image Box */}
                <div className="w-16 h-16 bg-orange-50/50 rounded-xl flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                  {item.icon}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-[13px] font-black text-slate-800 mb-0.5">{item.name}</h3>
                  <p className="text-[9px] text-gray-400 font-medium leading-tight mb-2 line-clamp-3">
                    {item.desc}
                  </p>
                  <p className="text-[13px] font-black text-orange-500 tracking-tight">
                    {item.price}
                  </p>
                </div>

                {/* Add Button */}
                <button 
                  onClick={() => setIsCartOpen(true)}
                  className="bg-orange-500 text-white px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm shadow-orange-100 hover:bg-orange-600 transition-all active:scale-95"
                >
                  Add
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredMenu.length === 0 && (
            <div className="py-20 text-center">
               <p className="text-gray-300 font-bold text-sm uppercase tracking-widest">No items found in this category</p>
            </div>
          )}
        </div>
      </main>

      {/* Floating Checkout Bar */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-md md:max-w-3xl">
         <button 
           onClick={() => setIsCartOpen(true)}
           className="w-full bg-slate-900 text-white p-5 rounded-[2rem] shadow-2xl flex items-center justify-between group overflow-hidden relative"
         >
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-400 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
            <div className="relative z-10 flex items-center gap-4">
               <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <ShoppingCart size={20} />
               </div>
               <div className="text-left">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60">2 Items</p>
                  <p className="text-sm font-black">View Order</p>
               </div>
            </div>
            <div className="relative z-10 text-right">
               <p className="text-xs font-black opacity-60">Total</p>
               <p className="text-lg font-black tracking-tight">Rp 120.000</p>
            </div>
         </button>
      </div>

      {/* Cart Modal */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="relative bg-white w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh]"
            >
              <div className="p-6 md:p-8 overflow-y-auto no-scrollbar flex-1">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-black text-slate-800 tracking-tight">Your Order</h2>
                  <button onClick={() => setIsCartOpen(false)} className="p-2 bg-gray-50 text-gray-400 hover:text-slate-800 rounded-xl transition-colors">
                    <X size={20} />
                  </button>
                </div>

                {/* Cart Items */}
                <div className="space-y-6 mb-8 max-h-[30vh] overflow-y-auto no-scrollbar">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-xl">🍺</div>
                      <div>
                        <h4 className="text-sm font-black text-slate-800">Bintang Beer</h4>
                        <p className="text-[10px] font-bold text-gray-400 tracking-tight">Rp 45.000 × 1</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3 bg-gray-50 px-3 py-1.5 rounded-full">
                        <button className="text-gray-300 hover:text-red-500 transition-colors">
                          <Plus size={14} className="rotate-45" />
                        </button>
                        <span className="text-xs font-black">1</span>
                        <button className="text-orange-500">
                          <Plus size={14} />
                        </button>
                      </div>
                      <span className="text-sm font-black text-orange-500 tracking-tight">Rp 45.000</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-xl">🍹</div>
                      <div>
                        <h4 className="text-sm font-black text-slate-800">Tropical Mojito</h4>
                        <p className="text-[10px] font-bold text-gray-400 tracking-tight">Rp 75.000 × 1</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3 bg-gray-50 px-3 py-1.5 rounded-full">
                        <button className="text-gray-300 hover:text-red-500 transition-colors">
                          <Plus size={14} className="rotate-45" />
                        </button>
                        <span className="text-xs font-black">1</span>
                        <button className="text-orange-500">
                          <Plus size={14} />
                        </button>
                      </div>
                      <span className="text-sm font-black text-orange-500 tracking-tight">Rp 75.000</span>
                    </div>
                  </div>
                </div>

                {/* Special Notes */}
                <div className="mb-8">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Special notes (optional)</label>
                  <textarea 
                    rows="2" 
                    placeholder="Allergies, preferences, delivery time..." 
                    className="w-full px-6 py-4 bg-gray-50/50 rounded-2xl border border-gray-100 text-[13px] font-bold placeholder:text-gray-200 outline-none focus:border-orange-500 transition-all resize-none"
                  />
                </div>

                {/* Total */}
                <div className="bg-orange-50 p-5 rounded-2xl flex items-center justify-between mb-8 border border-orange-100/50">
                  <span className="text-sm font-black text-slate-800">Total</span>
                  <span className="text-xl font-black text-orange-500 tracking-tighter">Rp 120.000</span>
                </div>

                {/* Payment Methods */}
                <div className="space-y-3">
                  <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] mb-2">How would you like to pay?</p>
                  
                  <button 
                    onClick={() => {
                      setIsCartOpen(false);
                      setIsPayModalOpen(true);
                    }}
                    className="w-full p-4 rounded-2xl border-2 border-orange-100 bg-orange-50/20 hover:bg-orange-50 flex items-center gap-4 transition-all text-left"
                  >
                    <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-100">
                      <Receipt size={20} />
                    </div>
                    <div>
                      <h4 className="text-[13px] font-black text-slate-800">Pay Now Online</h4>
                      <p className="text-[9px] font-bold text-gray-400 tracking-tight">Card, transfer, QRIS — order confirmed after payment</p>
                    </div>
                  </button>

                  <button className="w-full p-4 rounded-2xl border-2 border-amber-100 bg-amber-50/10 hover:bg-amber-50 flex items-center gap-4 transition-all text-left">
                    <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-100">
                      <ShoppingCart size={20} />
                    </div>
                    <div>
                      <h4 className="text-[13px] font-black text-slate-800">Pay at Bar</h4>
                      <p className="text-[9px] font-bold text-gray-400 tracking-tight">Cash, card, or transfer when you collect — order sent immediately</p>
                    </div>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Pay Online Modal */}
      <AnimatePresence>
        {isPayModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPayModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="relative bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh]"
            >
              <div className="p-6 md:p-8 overflow-y-auto no-scrollbar flex-1">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-black text-slate-800 tracking-tight">Pay Online</h2>
                  <button onClick={() => setIsPayModalOpen(false)} className="p-2 bg-gray-50 text-gray-400 hover:text-slate-800 rounded-xl transition-colors">
                    <X size={20} />
                  </button>
                </div>

                {/* Amount Due Card */}
                <div className="bg-orange-50/50 p-6 rounded-[1.5rem] flex items-center justify-between mb-6 border border-orange-100/30">
                  <div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Order ORD-20260507-E9VH</p>
                    <p className="text-sm font-black text-slate-800">Amount due</p>
                  </div>
                  <span className="text-2xl font-black text-orange-500 tracking-tighter">Rp 120.000</span>
                </div>

                {/* Timer */}
                <div className="flex items-center justify-center gap-2 mb-8">
                  <div className="w-4 h-4 text-gray-400">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  </div>
                  <p className="text-[11px] font-medium text-gray-500">
                    Pay within <span className="text-orange-500 font-black">14:59</span> or the order expires
                  </p>
                </div>

                {/* Payment Options */}
                <div className="space-y-4">
                  <button className="w-full p-4 rounded-[1.5rem] border-2 border-orange-100 bg-orange-50/20 hover:bg-orange-50 flex items-center gap-4 transition-all text-left">
                    <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-100">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    </div>
                    <div>
                      <h4 className="text-[13px] font-black text-slate-800">Pay Online</h4>
                      <p className="text-[9px] font-bold text-gray-400 tracking-tight">Credit card, bank transfer, e-wallet</p>
                    </div>
                  </button>

                  <button className="w-full p-4 rounded-[1.5rem] border-2 border-emerald-100 bg-emerald-50/10 hover:bg-emerald-50 flex items-center gap-4 transition-all text-left">
                    <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-100 p-2">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><rect x="7" y="7" width="3" height="3"/><rect x="14" y="7" width="3" height="3"/><rect x="7" y="14" width="3" height="3"/><path d="M14 14h3v3h-3z"/></svg>
                    </div>
                    <div>
                      <h4 className="text-[13px] font-black text-slate-800">QRIS</h4>
                      <p className="text-[9px] font-bold text-gray-400 tracking-tight">Scan with any banking or e-wallet app</p>
                    </div>
                  </button>
                </div>

                {/* Pay Later */}
                <div className="mt-8 text-center">
                  <button className="text-[10px] font-bold text-gray-300 hover:text-slate-400 transition-colors uppercase tracking-widest">
                    Pay later (from My Bill)
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GuestMenu;
