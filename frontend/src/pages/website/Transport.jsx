import React from 'react';
import { motion } from 'framer-motion';
import { Plane, Ship, Car, ChevronRight, X, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const transportData = [
  {
    id: 1,
    title: 'Airport Transfer',
    type: 'SUV',
    icon: Plane,
    desc: 'Private, air-conditioned vehicle transfer between the hotel and the airport. Door-to-door service, meet & greet available.',
    status: 'Request Quote'
  },
  {
    id: 2,
    title: 'Harbor / Ferry Transfer',
    type: 'Van',
    icon: Ship,
    desc: 'Comfortable transfer to and from the main ferry harbor. Ideal when arriving or departing by boat.',
    status: 'Request Quote'
  },
  {
    id: 3,
    title: 'Private Driver — Full Day',
    type: 'SUV',
    icon: Car,
    desc: 'Hire a private car with driver for the whole day. Explore the island at your own pace. Fuel and driver included.',
    status: 'Request Quote'
  }
];

const Transport = () => {
  return (
    <div className="min-h-screen bg-[#fcfcfc] text-slate-800 font-sans">
      {/* Header - Consistent with Menu/Excursions */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 py-3 md:py-4 px-4 md:px-12 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 md:gap-3">
          <img src="/1000464407-removebg-preview.png" alt="Logo" className="h-7 md:h-10 w-auto object-contain" />
          <span className="text-[14px] md:text-xl font-black uppercase tracking-tighter text-[#2a2a2a]">Gila House</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-4 lg:gap-8">
          <Link to="/menu" className="text-xs lg:text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors">Restaurant</Link>
          <Link to="/excursions" className="text-xs lg:text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors">Excursions</Link>
          <Link to="/transport" className="text-xs lg:text-sm font-bold text-orange-500 border-b-2 border-orange-500 pb-1">Transport</Link>
        </nav>

        <Link to="/#reservation" className="bg-orange-500 text-white px-4 md:px-6 py-2 md:py-2.5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest shadow-lg shadow-orange-200 hover:bg-orange-600 transition-all">
          Reserve Table
        </Link>
      </header>

      {/* Hero Section - Matching SS */}
      <section className="bg-gradient-to-br from-[#bdf0e7] to-[#e0f7f3] py-12 md:py-20 px-6 text-center relative overflow-hidden">
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl shadow-lg flex items-center justify-center text-[#1e8a75] mb-4 md:mb-6">
             <Car size={20} md:size={24} />
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-[#1e8a75] uppercase tracking-tighter mb-2 md:mb-4">Transport Services</h1>
          <p className="text-[10px] md:text-lg text-[#1e8a75]/70 font-bold uppercase tracking-widest">
            Private transfers and local rides
          </p>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-4 md:px-6 py-12 md:py-20 space-y-6 md:space-y-8">
        {transportData.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-10 shadow-xl shadow-gray-100/50 border border-gray-50 flex flex-col md:flex-row items-center gap-6 md:gap-8 group hover:shadow-2xl hover:shadow-teal-100/50 transition-all duration-500 text-center md:text-left"
          >
            {/* Icon Box */}
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-[#f0fcf9] border border-[#e0f7f3] flex items-center justify-center text-[#1e8a75] group-hover:scale-110 group-hover:bg-[#1e8a75] group-hover:text-white transition-all duration-500 shrink-0">
               <item.icon size={28} md:size={32} />
            </div>

            {/* Content */}
            <div className="flex-1 w-full">
               <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                  <h3 className="text-lg md:text-xl font-black text-[#2a2a2a] uppercase tracking-tight">{item.title}</h3>
                  <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest mt-1 md:mt-0">{item.status}</span>
               </div>
               <p className="text-[9px] font-black text-teal-600 uppercase tracking-widest mb-3 md:mb-4 inline-block px-3 py-1 bg-teal-50 rounded-lg">
                  {item.title} <span className="mx-2 opacity-30">|</span> {item.type}
               </p>
               <p className="text-xs text-gray-500 leading-relaxed max-w-2xl">
                  {item.desc}
               </p>
               <button className="w-full sm:w-auto mt-6 md:mt-8 bg-[#1e8a75] text-white px-8 py-3 md:py-3.5 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-xl shadow-teal-100 hover:bg-[#166959] transition-all active:scale-95 text-center">
                  Request Transfer
               </button>
            </div>
          </motion.div>
        ))}

        <div className="mt-16 md:mt-32 text-center">
           <div className="inline-flex items-center gap-2 text-[10px] md:text-xs font-black text-gray-300 uppercase tracking-widest">
              Contact us for custom routes <ChevronRight size={14} /> Gila House Concierge
           </div>
        </div>
      </main>

      {/* Mobile Footer Nav */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-xl border border-gray-100 rounded-full py-3 px-8 shadow-2xl z-50 flex items-center gap-8">
         <Link to="/menu" className="text-gray-400 font-black text-xs uppercase tracking-widest">Menu</Link>
         <Link to="/excursions" className="text-gray-400 font-black text-xs uppercase tracking-widest">Tours</Link>
         <Link to="/transport" className="text-orange-500 font-black text-xs uppercase tracking-widest underline decoration-2 underline-offset-4">Rides</Link>
      </div>
    </div>
  );
};

export default Transport;
