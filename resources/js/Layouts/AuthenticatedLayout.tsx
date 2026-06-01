import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import Toast from '@/Components/Toast';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeInit } from '@/Hooks/useThemeInit';
import {
    LayoutDashboard,
    Users,
    Calculator,
    Package,
    Briefcase,
    Settings,
    LogOut,
    User as UserIcon,
    ChevronRight,
    Sun,
    Moon,
    Menu,
    X,
    Shield,
    ChevronDown,
    Building2,
    FileText,
    Wrench,
    Ticket,
    Truck,
    Radio
} from 'lucide-react';

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    // Inicializa tema global en <html> en cada navegación
    useThemeInit();
    const { auth } = usePage().props as any;
    const user = auth?.user;
    const isComercial = user?.roles?.includes('comercial');
    const isTecnico = user?.roles?.includes('tecnico') && !user?.roles?.includes('admin') && !user?.roles?.includes('gerente');
    const [isHovered, setIsHovered] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isGestionOpen, setIsGestionOpen] = useState(false);
    const [isGestionHovered, setIsGestionHovered] = useState(false);
    const [isProyectosOpen, setIsProyectosOpen] = useState(false);
    const [isProyectosHovered, setIsProyectosHovered] = useState(false);
    const [isOperacionesOpen, setIsOperacionesOpen] = useState(false);
    const [isOperacionesHovered, setIsOperacionesHovered] = useState(false);

    const navItems = [
        { label: 'Dashboard', icon: LayoutDashboard, route: 'dashboard', active: route().current('dashboard') },
        ...(!isComercial && !isTecnico ? [{ label: 'Control de Acceso', icon: Shield, route: 'access-control.index', active: route().current('access-control.*') }] : []),
    ];

    const gestionItems = [
        { label: 'Clientes', icon: Users, route: 'clients.index', active: route().current('clients.*') },
        { label: 'Cotizaciones', icon: Calculator, route: 'quotations.index', active: route().current('quotations.*') },
        { label: 'Propuestas', icon: FileText, route: 'proposals.index', active: route().current('proposals.*') },
        ...(!isComercial && !isTecnico ? [{ label: 'Suministros', icon: Package, route: 'supplies.index', active: route().current('supplies.*') }] : []),
    ];

    const proyectosItems = [
        { label: 'Proyectos', icon: Briefcase, route: 'projects.index', active: route().current('projects.*') },
        { label: 'Seguimiento Air-e', icon: Radio, route: 'aire-seguimiento.index', active: route().current('aire-seguimiento.*') },
    ];

    const operacionesTecnicasItems = [
        { label: 'Inventario', icon: Package, route: 'inventory.index', active: route().current('inventory.*') },
        { label: 'Proveedores', icon: Truck, route: 'suppliers.index', active: route().current('suppliers.*') },
        { label: 'Mantenimientos', icon: Wrench, route: 'maintenances.index', active: route().current('maintenances.*') },
        { label: 'Tickets', icon: Ticket, route: 'tickets.index', active: route().current('tickets.*') },
    ];

    const isGesitonActive = gestionItems.some(item => route().current(item.route));
    const isProyectosActive = proyectosItems.some(item => route().current(item.route));
    const isOperacionesActive = operacionesTecnicasItems.some(item => route().current(item.route));

    return (
        <div className="min-h-screen bg-[var(--bg-main)] flex text-[var(--text-primary)] relative overflow-hidden">
            {/* Overlay for mobile menu */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-opacity"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar Lateral */}
            <aside 
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={`fixed left-0 top-0 h-screen glass border-r border-[var(--border-ui)] transition-all duration-300 ease-in-out z-50 flex flex-col ${
                    isMobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'
                } md:translate-x-0 ${isHovered ? 'md:w-64' : 'md:w-20'}`}
            >
                {/* Logo Area */}
                <div className="h-20 flex items-center justify-between px-4 overflow-hidden border-b border-[var(--border-ui)]">
                    <Link href="/" className="flex items-center gap-4 min-w-max">
                        <ApplicationLogo className="h-10 w-auto text-[var(--solar-gold)]" />
                        <span className={`font-outfit font-bold text-xl text-[var(--solar-gold)] transition-opacity duration-300 ${
                            isHovered || isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
                        }`}>
                            Energy 4.0
                        </span>
                    </Link>
                    
                    {/* Botón cerrar en móvil */}
                    <button 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="md:hidden p-2 rounded-lg text-[var(--text-secondary)] hover:bg-slate-500/10 hover:text-[var(--text-primary)]"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto overflow-x-hidden">
                    {navItems.map((item, index) => (
                        <Link
                            key={index}
                            href={route(item.route)}
                            className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-300 group ${
                                item.active
                                ? 'bg-[var(--solar-gold)] text-slate-900 shadow-[0_0_15px_rgba(84,143,75,0.4)]'
                                : 'hover:bg-[var(--solar-gold)]/10 text-[var(--text-secondary)] hover:text-[var(--solar-gold)]'
                            }`}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <item.icon className={`h-6 w-6 min-w-[24px] ${item.active ? 'text-white' : 'group-hover:text-[var(--solar-gold)]'}`} />
                            <span className={`font-medium whitespace-nowrap transition-all duration-300 ${
                                isHovered || isMobileMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                            }`}>
                                {item.label}
                            </span>
                        </Link>
                    ))}

                    {/* Renderización condicional: Flat para comercial, Dropdowns para admin/gerente, simplificado para técnico */}
                    {isComercial ? (
                        <>
                            {gestionItems.map((item, index) => (
                                <Link
                                    key={`com-item-${index}`}
                                    href={route(item.route)}
                                    className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-300 group ${
                                        item.active
                                        ? 'bg-[var(--solar-gold)] text-slate-900 shadow-[0_0_15px_rgba(84,143,75,0.4)]'
                                        : 'hover:bg-[var(--solar-gold)]/10 text-[var(--text-secondary)] hover:text-[var(--solar-gold)]'
                                    }`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <item.icon className={`h-6 w-6 min-w-[24px] ${item.active ? 'text-white' : 'group-hover:text-[var(--solar-gold)]'}`} />
                                    <span className={`font-medium whitespace-nowrap transition-all duration-300 ${
                                        isHovered || isMobileMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                                    }`}>
                                        {item.label}
                                    </span>
                                </Link>
                            ))}
                            {proyectosItems.map((item, index) => (
                                <Link
                                    key={`com-proj-${index}`}
                                    href={route(item.route)}
                                    className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-300 group ${
                                        item.active
                                        ? 'bg-[var(--solar-gold)] text-slate-900 shadow-[0_0_15px_rgba(84,143,75,0.4)]'
                                        : 'hover:bg-[var(--solar-gold)]/10 text-[var(--text-secondary)] hover:text-[var(--solar-gold)]'
                                    }`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <item.icon className={`h-6 w-6 min-w-[24px] ${item.active ? 'text-white' : 'group-hover:text-[var(--solar-gold)]'}`} />
                                    <span className={`font-medium whitespace-nowrap transition-all duration-300 ${
                                        isHovered || isMobileMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                                    }`}>
                                        {item.label}
                                    </span>
                                </Link>
                            ))}
                        </>
                    ) : isTecnico ? (
                        <>
                            {operacionesTecnicasItems.map((item, index) => (
                                <Link
                                    key={index}
                                    href={route(item.route)}
                                    className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-300 group ${
                                        item.active
                                        ? 'bg-[var(--solar-gold)] text-slate-900 shadow-[0_0_15px_rgba(84,143,75,0.4)]'
                                        : 'hover:bg-[var(--solar-gold)]/10 text-[var(--text-secondary)] hover:text-[var(--solar-gold)]'
                                    }`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <item.icon className={`h-6 w-6 min-w-[24px] ${item.active ? 'text-white' : 'group-hover:text-[var(--solar-gold)]'}`} />
                                    <span className={`font-medium whitespace-nowrap transition-all duration-300 ${
                                        isHovered || isMobileMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                                    }`}>
                                        {item.label}
                                    </span>
                                </Link>
                            ))}
                        </>
                    ) : (
                        <>
                            {/* Gestión Comercial Dropdown */}
                            <div
                                onMouseEnter={() => { setIsGestionHovered(true); setIsGestionOpen(true); }}
                                onMouseLeave={() => { setIsGestionHovered(false); setIsGestionOpen(false); }}
                            >
                                <button
                                    onClick={() => setIsGestionOpen(!isGestionOpen)}
                                    className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-300 group ${
                                        isGesitonActive
                                        ? 'bg-[var(--solar-gold)] text-slate-900 shadow-[0_0_15px_rgba(84,143,75,0.4)]'
                                        : 'hover:bg-[var(--solar-gold)]/10 text-[var(--text-secondary)] hover:text-[var(--solar-gold)]'
                                    }`}
                                >
                                    <Building2 className={`h-6 w-6 min-w-[24px] ${isGesitonActive ? 'text-white' : 'group-hover:text-[var(--solar-gold)]'}`} />
                                    <span className={`font-medium whitespace-nowrap transition-all duration-300 flex-1 text-left ${
                                        isHovered || isMobileMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                                    }`}>
                                        Gestión Comercial
                                    </span>
                                    <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isGesitonActive || isGestionOpen ? 'text-white rotate-180' : ''} ${
                                        isHovered || isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
                                    }`} />
                                </button>

                                <div className={`overflow-hidden transition-all duration-300 ${
                                    isGestionOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                                }`}>
                                    <div className={`ml-4 pl-4 border-l border-[var(--border-ui)] space-y-1 mt-1 ${
                                        isHovered || isMobileMenuOpen ? '' : 'hidden md:block'
                                    }`}>
                                        {gestionItems.map((item, index) => (
                                            <Link
                                                key={index}
                                                href={route(item.route)}
                                                className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-300 group ${
                                                    item.active
                                                    ? 'bg-[var(--solar-gold)]/20 text-[var(--solar-gold)]'
                                                    : 'hover:bg-[var(--solar-gold)]/10 text-[var(--text-secondary)] hover:text-[var(--solar-gold)]'
                                                }`}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                <item.icon className={`h-5 w-5 min-w-[20px] ${item.active ? 'text-[var(--solar-gold)]' : 'group-hover:text-[var(--solar-gold)]'}`} />
                                                <span className={`font-medium whitespace-nowrap text-sm transition-all duration-300 ${
                                                    isHovered || isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
                                                }`}>
                                                    {item.label}
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Gestión de Proyectos Dropdown */}
                            <div
                                onMouseEnter={() => { setIsProyectosHovered(true); setIsProyectosOpen(true); }}
                                onMouseLeave={() => { setIsProyectosHovered(false); setIsProyectosOpen(false); }}
                            >
                                <button
                                    onClick={() => setIsProyectosOpen(!isProyectosOpen)}
                                    className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-300 group ${
                                        isProyectosActive
                                        ? 'bg-[var(--solar-gold)] text-slate-900 shadow-[0_0_15px_rgba(84,143,75,0.4)]'
                                        : 'hover:bg-[var(--solar-gold)]/10 text-[var(--text-secondary)] hover:text-[var(--solar-gold)]'
                                    }`}
                                >
                                    <Briefcase className={`h-6 w-6 min-w-[24px] ${isProyectosActive ? 'text-white' : 'group-hover:text-[var(--solar-gold)]'}`} />
                                    <span className={`font-medium whitespace-nowrap transition-all duration-300 flex-1 text-left ${
                                        isHovered || isMobileMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                                    }`}>
                                        Gestión de Proyectos
                                    </span>
                                    <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isProyectosActive || isProyectosOpen ? 'text-white rotate-180' : ''} ${
                                        isHovered || isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
                                    }`} />
                                </button>

                                <div className={`overflow-hidden transition-all duration-300 ${
                                    isProyectosOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                                }`}>
                                    <div className={`ml-4 pl-4 border-l border-[var(--border-ui)] space-y-1 mt-1 ${
                                        isHovered || isMobileMenuOpen ? '' : 'hidden md:block'
                                    }`}>
                                        {proyectosItems.map((item, index) => (
                                            <Link
                                                key={index}
                                                href={route(item.route)}
                                                className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-300 group ${
                                                    item.active
                                                    ? 'bg-[var(--solar-gold)]/20 text-[var(--solar-gold)]'
                                                    : 'hover:bg-[var(--solar-gold)]/10 text-[var(--text-secondary)] hover:text-[var(--solar-gold)]'
                                                }`}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                <item.icon className={`h-5 w-5 min-w-[20px] ${item.active ? 'text-[var(--solar-gold)]' : 'group-hover:text-[var(--solar-gold)]'}`} />
                                                <span className={`font-medium whitespace-nowrap text-sm transition-all duration-300 ${
                                                    isHovered || isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
                                                }`}>
                                                    {item.label}
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Operaciones Técnicas Dropdown */}
                            <div
                                onMouseEnter={() => { setIsOperacionesHovered(true); setIsOperacionesOpen(true); }}
                                onMouseLeave={() => { setIsOperacionesHovered(false); setIsOperacionesOpen(false); }}
                            >
                                <button
                                    onClick={() => setIsOperacionesOpen(!isOperacionesOpen)}
                                    className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-300 group ${
                                        isOperacionesActive
                                        ? 'bg-[var(--solar-gold)] text-slate-900 shadow-[0_0_15px_rgba(84,143,75,0.4)]'
                                        : 'hover:bg-[var(--solar-gold)]/10 text-[var(--text-secondary)] hover:text-[var(--solar-gold)]'
                                    }`}
                                >
                                    <Wrench className={`h-6 w-6 min-w-[24px] ${isOperacionesActive ? 'text-white' : 'group-hover:text-[var(--solar-gold)]'}`} />
                                    <span className={`font-medium whitespace-nowrap transition-all duration-300 flex-1 text-left ${
                                        isHovered || isMobileMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                                    }`}>
                                        Operaciones Técnicas
                                    </span>
                                    <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isOperacionesActive || isOperacionesOpen ? 'text-white rotate-180' : ''} ${
                                        isHovered || isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
                                    }`} />
                                </button>

                                <div className={`overflow-hidden transition-all duration-300 ${
                                    isOperacionesOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                                }`}>
                                    <div className={`ml-4 pl-4 border-l border-[var(--border-ui)] space-y-1 mt-1 ${
                                        isHovered || isMobileMenuOpen ? '' : 'hidden md:block'
                                    }`}>
                                        {operacionesTecnicasItems.map((item, index) => (
                                            <Link
                                                key={index}
                                                href={route(item.route)}
                                                className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-300 group ${
                                                    item.active
                                                    ? 'bg-[var(--solar-gold)]/20 text-[var(--solar-gold)]'
                                                    : 'hover:bg-[var(--solar-gold)]/10 text-[var(--text-secondary)] hover:text-[var(--solar-gold)]'
                                                }`}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                <item.icon className={`h-5 w-5 min-w-[20px] ${item.active ? 'text-[var(--solar-gold)]' : 'group-hover:text-[var(--solar-gold)]'}`} />
                                                <span className={`font-medium whitespace-nowrap text-sm transition-all duration-300 ${
                                                    isHovered || isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
                                                }`}>
                                                    {item.label}
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </nav>

                {/* User Info & Settings */}
                <div className="p-3 border-t border-[var(--border-ui)] bg-slate-500/5">
                    <Link
                        href={route('profile.edit')}
                        className={`flex items-center gap-3 p-2 rounded-xl transition-all duration-300 ${
                            isHovered || isMobileMenuOpen ? 'bg-slate-500/10' : ''
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        {user?.profile_photo_url ? (
                            <img
                                src={user.profile_photo_url}
                                alt={user?.name ?? 'Usuario'}
                                className="h-10 w-10 rounded-full object-cover shrink-0 shadow-[0_0_10px_rgba(84,143,75,0.4)]"
                            />
                        ) : (
                            <div className="h-10 w-10 rounded-full bg-[var(--solar-gold)] flex items-center justify-center text-slate-900 font-bold shrink-0 shadow-[0_0_10px_rgba(84,143,75,0.4)]">
                                {user?.name?.charAt(0) ?? 'U'}
                            </div>
                        )}
                        <div className={`flex-1 overflow-hidden transition-all duration-300 ${
                            isHovered || isMobileMenuOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'
                        }`}>
                            <p className="text-sm font-bold truncate">{user?.name ?? 'Usuario'}</p>
                            <p className="text-xs text-[var(--text-secondary)] truncate">{user?.email ?? ''}</p>
                        </div>
                    </Link>
                    
                    <Link 
                        href={route('logout')} 
                        method="post" 
                        as="button"
                        className="w-full flex items-center gap-4 p-3 mt-2 rounded-xl text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-500/10 transition-all duration-300"
                    >
                        <LogOut className="h-6 w-6 min-w-[24px]" />
                        <span className={`font-medium transition-all duration-300 ${
                            isHovered || isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
                        }`}>
                            Cerrar Sesión
                        </span>
                    </Link>

                                    </div>
            </aside>

            {/* Main Content Area */}
            <div className={`flex-1 transition-all duration-300 ease-in-out pl-0 md:pl-20 ${
                isHovered ? 'md:pl-64' : ''
            }`}>
                {/* Top Header */}
                {header && (
                    <header className="h-20 flex items-center px-4 md:px-8 border-b border-[var(--border-ui)] bg-[var(--surface)] backdrop-blur-sm sticky top-0 z-30">
                        <div className="flex items-center flex-1 gap-4 overflow-hidden">
                            <button 
                                onClick={() => setIsMobileMenuOpen(true)}
                                className="md:hidden p-2 rounded-xl bg-slate-500/10 text-[var(--text-secondary)] hover:bg-slate-500/20 hover:text-[var(--solar-gold)] transition-colors shrink-0"
                            >
                                <Menu className="h-6 w-6" />
                            </button>
                            <h2 className="font-outfit text-xl md:text-2xl font-bold text-[var(--text-primary)] truncate">
                                {header}
                            </h2>
                        </div>
                        
                        <div className="flex items-center gap-2 md:gap-4 shrink-0">
                            <Link href={route('settings.index')} className="p-2 rounded-lg bg-slate-500/10 text-[var(--text-secondary)] hover:text-[var(--solar-gold)] transition-colors">
                                <Settings className="h-5 w-5" />
                            </Link>
                        </div>
                    </header>
                )}

                <main className="p-4 md:p-8 w-full relative z-10">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={route().current() as string}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>

            <Toast />
        </div>
    );
}
