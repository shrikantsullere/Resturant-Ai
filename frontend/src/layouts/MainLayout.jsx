import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Table2,
  Calculator,
  ClipboardList,
  CookingPot,
  UtensilsCrossed,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  Search,
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
  Menu as MenuIcon,
  Home,
  ShoppingCart,
  History,
  Heart,
  Gift,
  HelpCircle,
  Smartphone,
  Bed,
  CalendarCheck,
  Receipt,
  MessageSquare,
  QrCode,
  Compass,
  ClipboardCheck,
  Package,
  CreditCard
} from 'lucide-react';
import { useAuth, roles } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { useCustomer } from '@/context/CustomerContext';
import { cn } from '@/utils/cn';

const MainLayout = ({ children }) => {
  const { user, login, logout } = useAuth();
  const userRole = (user?.role || user?.role_name || '').toUpperCase();
  const { notifications, getUnreadCount, markAsRead, markAllAsRead } = useNotifications();
  const customer = useCustomer();
  const cartItems = customer?.cartItems || [];
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const unreadCount = getUnreadCount(userRole);
  const myNotifications = notifications.filter(n => 
    (n.targetRole === userRole.toUpperCase() || n.targetRole === 'ALL') &&
    (!n.read && !n.is_read)
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  React.useEffect(() => {
    const handleToggle = () => setIsMobileMenuOpen(true);
    window.addEventListener('open-sidebar', handleToggle);
    return () => window.removeEventListener('open-sidebar', handleToggle);
  }, []);

  const [posCartInfo, setPosCartInfo] = React.useState({ count: 0, total: 0 });

  React.useEffect(() => {
    const handleUpdate = (e) => setPosCartInfo(e.detail);
    window.addEventListener('pos-cart-updated', handleUpdate);
    return () => window.removeEventListener('pos-cart-updated', handleUpdate);
  }, []);

  const getRoleModulePath = (moduleName) => {
    if (!user) return `/${moduleName}`;
    if (userRole === roles.CUSTOMER) {
      if (moduleName === 'dashboard') return '/customer/home';
      return `/customer/${moduleName}`;
    }
    const rolePrefix = userRole.toLowerCase();
    return `/${rolePrefix}/${moduleName}`;
  };

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: getRoleModulePath('dashboard'), roles: [roles.ADMIN, roles.MANAGER, roles.CHEF, roles.WAITER, roles.CASHIER] },
    { name: 'Tables', icon: Table2, path: getRoleModulePath('tables'), roles: [roles.ADMIN, roles.MANAGER, roles.WAITER] },
    { name: 'POS', icon: Calculator, path: getRoleModulePath('pos'), roles: [roles.ADMIN, roles.MANAGER, roles.WAITER, roles.CASHIER] },
    { name: 'Orders', icon: ClipboardList, path: getRoleModulePath('orders'), roles: [roles.ADMIN, roles.MANAGER, roles.WAITER, roles.CHEF, roles.CASHIER] },
    { name: 'Kitchen', icon: CookingPot, path: getRoleModulePath('kitchen'), roles: [roles.ADMIN, roles.MANAGER, roles.CHEF] },
    { name: 'Tasks', icon: ClipboardCheck, path: getRoleModulePath('tasks'), roles: [roles.ADMIN, roles.MANAGER, roles.CHEF, roles.WAITER] },
    { name: 'Inventory', icon: Package, path: getRoleModulePath('inventory'), roles: [roles.ADMIN, roles.MANAGER, roles.CHEF] },
    { name: 'Notifications', icon: Bell, path: getRoleModulePath('notifications'), roles: [roles.ADMIN, roles.MANAGER, roles.CHEF, roles.WAITER, roles.CASHIER] },
    { name: 'Concierge', icon: MessageSquare, path: getRoleModulePath('concierge'), roles: [roles.ADMIN, roles.MANAGER, roles.WAITER] },
    { name: 'Services', icon: Compass, path: getRoleModulePath('services'), roles: [roles.ADMIN, roles.MANAGER, roles.WAITER] },
    { name: 'Menu', icon: UtensilsCrossed, path: getRoleModulePath('menu'), roles: [roles.ADMIN, roles.MANAGER] },
    { name: 'Staff', icon: Users, path: getRoleModulePath('staff'), roles: [roles.ADMIN] },
    { name: 'Reports', icon: BarChart3, path: getRoleModulePath('reports'), roles: [roles.ADMIN, roles.MANAGER] },
    { name: 'Rooms', icon: Bed, path: getRoleModulePath('rooms'), roles: [roles.ADMIN, roles.MANAGER] },
    { name: 'Reservations', icon: CalendarCheck, path: getRoleModulePath('reservations'), roles: [roles.ADMIN, roles.MANAGER, roles.WAITER] },
    { name: 'Guest Bills', icon: Receipt, path: getRoleModulePath('guest-bills'), roles: [roles.ADMIN, roles.MANAGER, roles.CASHIER] },
    { name: 'Settlements', icon: CreditCard, path: getRoleModulePath('settlements'), roles: [roles.ADMIN, roles.MANAGER, roles.CASHIER] },
    { name: 'Transactions', icon: History, path: getRoleModulePath('transactions'), roles: [roles.ADMIN, roles.MANAGER, roles.CASHIER] },
    { name: 'Settings', icon: Settings, path: getRoleModulePath('settings'), roles: [roles.ADMIN] },

    // Customer Specific Items
    { name: 'Home', icon: Home, path: '/customer/home', roles: [roles.CUSTOMER] },
    { name: 'Order Now', icon: UtensilsCrossed, path: '/customer/order-now', roles: [roles.CUSTOMER] },
    { name: 'Orders', icon: History, path: '/customer/orders', roles: [roles.CUSTOMER] },
    { name: 'Reservations', icon: CalendarCheck, path: '/customer/reservations', roles: [roles.CUSTOMER] },
    { name: 'Favorites', icon: Heart, path: '/customer/favorites', roles: [roles.CUSTOMER] },
    { name: 'Cart', icon: ShoppingCart, path: '/customer/cart', roles: [roles.CUSTOMER] },
    { name: 'Excursions', icon: Compass, path: '/customer/services', roles: [roles.CUSTOMER] },
    { name: 'Profile', icon: UserIcon, path: '/customer/profile', roles: [roles.CUSTOMER] },
    { name: 'Support', icon: HelpCircle, path: '/customer/support', roles: [roles.CUSTOMER] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(userRole));

  return (
    <div className="fixed inset-0 flex bg-background overflow-hidden font-['Inter']">
      {/* Sidebar */}
      <aside
        className={cn(
          "bg-white border-r border-border flex flex-col relative z-[250] shadow-[4px_0_24px_rgba(0,0,0,0.02)] h-full transition-all duration-300 shrink-0",
          "md:translate-x-0 fixed md:relative",
          isCollapsed ? "md:w-[80px]" : "md:w-[200px]",
          isMobileMenuOpen ? "translate-x-0 w-[240px]" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Logo Area */}
        <div
          onClick={() => navigate(getRoleModulePath('dashboard'))}
          className="h-16 flex items-center px-4 shrink-0 border-b border-slate-50 cursor-pointer group/logo relative z-[260] bg-white"
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0 group-hover/logo:scale-110 transition-transform">
              <img src="/1000464407-removebg-preview.png" alt="Logo" className="w-8 h-8 object-contain" />
            </div>
            {!isCollapsed && (
              <span
                className="text-lg font-black tracking-tight text-text-primary whitespace-nowrap uppercase italic"
              >
                Gila<span className="text-primary">House</span>
              </span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2.5 py-3 space-y-0.5 overflow-y-auto scrollbar-hide">
          {filteredMenu.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path.includes('/dashboard') || item.path === '/customer/home'}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) => cn(
                "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl",
                isActive
                  ? "bg-primary text-white shadow-xl shadow-primary/20"
                  : "text-text-secondary hover:bg-slate-50 hover:text-text-primary"
              )}
            >
              <item.icon className={cn("w-5 h-5 shrink-0 transition-transform group-hover:scale-110", !isCollapsed && "stroke-[2]")} />
              {!isCollapsed && (
                <span
                  className="font-bold text-xs tracking-wide truncate"
                >
                  {item.name}
                </span>
              )}
              {isCollapsed && (
                <div className="absolute left-full ml-4 px-2 py-1.5 bg-text-primary text-white text-[9px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none z-[100]">
                  {item.name}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-2.5 space-y-0.5 border-t border-slate-50">

          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-text-secondary hover:bg-danger/5 hover:text-danger group"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span className="font-bold text-xs">Logout</span>}
          </button>
        </div>

        {/* Toggle Button (Hidden on Mobile) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-4 top-10 w-8 h-8 bg-white border border-border rounded-full hidden md:flex items-center justify-center text-text-secondary hover:text-primary shadow-xl z-30"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </aside>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[90] md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className={cn(
        "flex-1 flex flex-col relative bg-background min-w-0"
      )}>
        {/* Premium SaaS Background Blobs */}
        <div className="absolute top-[-10%] right-[-5%] w-[40rem] h-[40rem] bg-primary/[0.03] rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[35rem] h-[35rem] bg-indigo-400/[0.03] rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-[20%] left-[10%] w-[30rem] h-[30rem] bg-blue-300/[0.02] rounded-full blur-[80px] pointer-events-none" />
        {/* Header */}
        <header className={cn(
          "h-14 bg-white border-b border-border flex items-center justify-between px-3 md:px-4 shrink-0 z-[200] sticky top-0 w-full",
          "transition-all duration-300"
        )}>
          <div className="flex items-center gap-3 lg:gap-6 flex-1">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 text-text-secondary hover:text-primary"
            >
              <MenuIcon className="w-6 h-6" />
            </button>
            <div
              className="relative w-full max-w-[420px] group z-[100]"
            >
              <div
                className={cn(
                  "absolute left-4 top-1/2 -translate-y-1/2 z-20 pointer-events-none",
                  isSearchFocused ? "text-primary" : "text-text-secondary"
                )}
              >
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search anything..."
                className={cn(
                  "w-full pl-10 pr-4 py-2.5 bg-slate-50 lg:bg-white border-2 rounded-xl lg:rounded-2xl outline-none text-xs font-bold relative z-10 transition-all",
                  isSearchFocused
                    ? "border-primary ring-4 ring-primary/10 shadow-lg shadow-primary/5"
                    : "border-slate-100 hover:border-primary/20"
                )}
              />

              {searchQuery.length > 0 && (
                <>
                  <div className="fixed inset-0 z-0" onClick={() => setSearchQuery('')} />
                  <div
                    className="absolute top-full mt-3 w-full bg-white border border-slate-100 rounded-3xl shadow-2xl overflow-hidden z-[120] p-2"
                  >
                    <div className="p-2">
                      <div className="px-3 py-2">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Orders</p>
                        <button onClick={() => { setSearchQuery(''); navigate(getRoleModulePath('orders')); }} className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-xl text-xs font-bold flex justify-between items-center group">
                          Order #124 <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-primary" />
                        </button>
                      </div>
                      <div className="px-3 py-2 border-t border-slate-50">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Tables</p>
                        <button onClick={() => { setSearchQuery(''); navigate(getRoleModulePath('tables')); }} className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-xl text-xs font-bold flex justify-between items-center group">
                          Table T-03 <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-primary" />
                        </button>
                      </div>
                      <div className="px-3 py-2 border-t border-slate-50">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Menu</p>
                        <button onClick={() => { setSearchQuery(''); navigate(getRoleModulePath('menu')); }} className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-xl text-xs font-bold flex justify-between items-center group">
                          Margherita Pizza <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-primary" />
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={cn(
                  "relative p-2 bg-slate-50 rounded-xl transition-all",
                  showNotifications ? "text-primary bg-primary/10" : "text-text-secondary hover:text-primary"
                )}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-danger text-white text-[8px] font-black rounded-full border-2 border-white flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {userRole === roles.CUSTOMER && (
                <button
                  onClick={() => navigate('/customer/cart')}
                  className="relative p-2 bg-slate-50 rounded-xl text-text-secondary hover:text-primary transition-all ml-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cartItems.length > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-white text-[8px] font-black rounded-full border-2 border-white flex items-center justify-center">
                      {cartItems.length}
                    </span>
                  )}
                </button>
              )}

              {/* POS Mobile Cart Trigger */}
              {location.pathname.includes('/pos') && (
                <button 
                  onClick={() => window.dispatchEvent(new CustomEvent('toggle-pos-cart'))}
                  className="md:hidden relative p-2 bg-primary/10 text-primary rounded-xl transition-all"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {typeof posCartInfo !== 'undefined' && posCartInfo.count > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[8px] font-black rounded-full border-2 border-white flex items-center justify-center">
                      {posCartInfo.count}
                    </span>
                  )}
                </button>
              )}

              {showNotifications && typeof document !== 'undefined' && createPortal(
                <>
                  <div className="fixed inset-0 z-[500]" onClick={() => setShowNotifications(false)} />
                  <div className="fixed top-16 right-4 sm:right-24 w-[calc(100vw-2rem)] sm:w-[320px] bg-white border border-slate-100 rounded-3xl shadow-2xl overflow-hidden z-[510] animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                      <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Notifications</h4>
                      <button onClick={() => markAllAsRead(userRole)} className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline">Clear All</button>
                    </div>
                    <div className="max-h-[320px] overflow-y-auto scrollbar-hide">
                      {myNotifications.length === 0 ? (
                        <div className="py-10 text-center opacity-40">
                          <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">No new alerts</p>
                        </div>
                      ) : (
                        myNotifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => { markAsRead(n.id); setShowNotifications(false); }}
                            className={cn(
                              "p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer relative group",
                              !n.read && "bg-primary/[0.02]"
                            )}
                          >
                            {!n.read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />}
                            <div className="flex justify-between items-start gap-2 mb-1">
                              <p className="text-[10px] font-black text-text-primary uppercase tracking-tight leading-tight flex-1 line-clamp-1">{n.title}</p>
                              <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest shrink-0">{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                            <p className="text-[10px] font-medium text-slate-500 line-clamp-1 leading-relaxed">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                    <button
                      onClick={() => { setShowNotifications(false); navigate(getRoleModulePath('notifications')); }}
                      className="w-full py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-colors border-t border-slate-50 bg-slate-50/10"
                    >
                      View All Activity
                    </button>
                  </div>
                </>,
                document.body
              )}
            </div>

            <div className="h-8 w-[1px] bg-border mx-1"></div>

            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className={cn(
                  "flex items-center gap-3 hover:bg-slate-50 p-1.5 rounded-2xl transition-all group",
                  showProfileMenu && "bg-slate-100"
                )}
              >
                <div className="text-right hidden sm:block pl-2">
                  <p className="text-xs font-black text-text-primary leading-none uppercase">{user?.name}</p>
                  <div className="mt-1 flex justify-end">
                    <span className="badge bg-primary-light text-primary border-none text-[8px] py-0 font-bold uppercase tracking-wider">
                      {userRole}
                    </span>
                  </div>
                </div>
                <div
                  className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-primary border-2 border-white shadow-lg cursor-pointer overflow-hidden group-hover:scale-105 transition-transform"
                >
                  <UserIcon className="w-5 h-5 stroke-[2.5]" />
                </div>
              </button>

              {showProfileMenu && typeof document !== 'undefined' && createPortal(
                <>
                  <div className="fixed inset-0 z-[500]" onClick={() => setShowProfileMenu(false)} />
                  <div className="fixed top-16 right-4 sm:right-8 w-40 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden z-[510] animate-in fade-in slide-in-from-top-2 duration-200 p-1">
                    <button
                      onClick={() => { setShowProfileMenu(false); logout(); navigate('/login'); }}
                      className="w-full flex items-center gap-3 p-3 hover:bg-rose-50 rounded-xl transition-all text-slate-400 hover:text-rose-600 group"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Logout</span>
                    </button>
                  </div>
                </>,
                document.body
              )}
            </div>
          </div>
        </header>

        {/* Content - Fixed Scrolling Hub */}
        <main className="flex-1 overflow-y-auto px-4 md:px-6 pt-6 pb-6 bg-transparent relative scroll-smooth">
          <div className="max-w-[1600px] mx-auto w-full">
            {children}
          </div>
        </main>


      </div>
    </div>
  );
};

export default MainLayout;
