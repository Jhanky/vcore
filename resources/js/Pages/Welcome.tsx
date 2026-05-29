import { Head, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Sun, Zap, TrendingUp, Users, Briefcase, Calculator, ArrowRight, CheckCircle, Building2, Bot } from 'lucide-react';

export default function Welcome({ auth, laravelVersion, phpVersion }: any) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const features = [
        {
            icon: Users,
            title: 'Gestión de Clientes',
            description: 'Administra leads, clientes activos y perdidos con seguimiento completo de interacciones y estados.',
        },
        {
            icon: Briefcase,
            title: 'Proyectos Fotovoltaicos',
            description: 'Control integral de proyectos con hitos, estados técnicos, documentos y seguimiento UPME.',
        },
        {
            icon: Calculator,
            title: 'Cotizaciones Dinámicas',
            description: 'Genera cotizaciones profesionales con análisis automático de equipos y especificaciones técnicas.',
        },
        {
            icon: TrendingUp,
            title: 'Análisis y Métricas',
            description: 'Dashboard con estadísticas de ventas, pipeline de proyectos y rendimiento comercial.',
        },
        {
            icon: Bot,
            title: 'Integración con IA',
            description: 'Conecta con Claude y otros sistemas de inteligencia artificial mediante protocolo MCP para automatización inteligente.',
        },
    ];

    const stats = [
        { value: '100%', label: 'Energía Solar' },
        { value: 'Colombia', label: 'Mercado Local' },
        { value: '24/7', label: 'Monitoreo' },
    ];

    return (
        <>
            <Head title="Energy 4.0 - CRM de Energía Solar" />

            <div className="min-h-screen bg-[var(--bg-main)] light">
                {/* Header / Navbar */}
                <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-[var(--border-ui)]">
                    <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[var(--lima)] flex items-center justify-center">
                                <Sun className="h-6 w-6 text-white" />
                            </div>
                            <span className="font-outfit font-bold text-xl text-[var(--text-primary)]">Energy 4.0</span>
                        </div>

                        <nav className="hidden md:flex items-center gap-8">
                            <a href="#features" className="text-[var(--text-secondary)] hover:text-[var(--lima)] transition-colors">Características</a>
                            <a href="#benefits" className="text-[var(--text-secondary)] hover:text-[var(--lima)] transition-colors">Beneficios</a>
                            <a href="#contact" className="text-[var(--text-secondary)] hover:text-[var(--lima)] transition-colors">Contacto</a>
                        </nav>

                        <div className="flex items-center gap-4">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="flex items-center gap-2 bg-[var(--lima)] text-white font-bold px-5 py-2.5 rounded-xl hover:brightness-110 transition-all shadow-lg"
                                >
                                    Dashboard
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            ) : (
                                <Link
                                    href={route('login')}
                                    className="flex items-center gap-2 bg-[var(--lima)] text-white font-bold px-5 py-2.5 rounded-xl hover:brightness-110 transition-all shadow-lg"
                                >
                                    Iniciar Sesión
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            )}
                        </div>
                    </div>
                </header>

                {/* Hero Section */}
                <section className={`relative min-h-screen flex items-center justify-center pt-20 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    {/* Background decoration */}
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[var(--lima)]/10 blur-3xl" />
                        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[var(--verde-oscuro)]/10 blur-3xl" />
                    </div>

                    <div className="max-w-7xl mx-auto px-6 py-20 text-center relative z-10">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--surface)] border border-[var(--border-ui)] mb-8">
                            <Zap className="h-4 w-4 text-[var(--lima)]" />
                            <span className="text-sm text-[var(--text-secondary)]">CRM especializado para energía solar</span>
                        </div>

                        {/* Main heading */}
                        <h1 className="font-outfit text-5xl md:text-7xl font-bold mb-6 leading-tight">
                            <span className="text-[var(--text-primary)]">Gestiona tu negocio</span>
                            <br />
                            <span className="text-[var(--lima)]">de energía solar</span>
                            <br />
                            <span className="text-[var(--text-primary)]">como nunca antes</span>
                        </h1>

                        <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-12">
                            La plataforma integral para empresas colombianas del sector fotovoltaico.
                            Administra clientes, proyectos, cotizaciones y optimiza tu commercial.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="flex items-center gap-3 bg-[var(--lima)] text-white font-bold px-8 py-4 rounded-2xl hover:brightness-110 transition-all shadow-xl text-lg"
                                >
                                    Ir al Dashboard
                                    <ArrowRight className="h-5 w-5" />
                                </Link>
                            ) : (
                                <Link
                                    href={route('login')}
                                    className="flex items-center gap-3 bg-[var(--lima)] text-white font-bold px-8 py-4 rounded-2xl hover:brightness-110 transition-all shadow-xl text-lg"
                                >
                                    Iniciar Sesión
                                    <ArrowRight className="h-5 w-5" />
                                </Link>
                            )}
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
                            {stats.map((stat, index) => (
                                <div key={index} className="text-center">
                                    <div className="font-outfit text-3xl md:text-4xl font-bold text-[var(--lima)] mb-1">{stat.value}</div>
                                    <div className="text-sm text-[var(--text-secondary)]">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Scroll indicator */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                        <div className="w-6 h-10 rounded-full border-2 border-[var(--border-ui)] flex items-start justify-center p-2">
                            <div className="w-1.5 h-3 bg-[var(--lima)] rounded-full animate-pulse" />
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-24 bg-[var(--bg-content)]">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-16">
                            <span className="inline-block px-4 py-2 rounded-full bg-[var(--lima)]/10 text-[var(--lima)] text-sm font-bold mb-4">
                                CARACTERÍSTICAS
                            </span>
                            <h2 className="font-outfit text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">
                                Todo lo que necesitas
                            </h2>
                            <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
                                Herramientas diseñadas específicamente para el mercado colombiano de energía solar
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {features.map((feature, index) => (
                                <div
                                    key={index}
                                    className="group glass rounded-3xl p-8 hover:border-[var(--lima)]/50 transition-all duration-300"
                                >
                                    <div className="w-14 h-14 rounded-2xl bg-[var(--lima)]/10 flex items-center justify-center mb-6 group-hover:bg-[var(--lima)]/20 transition-colors">
                                        <feature.icon className="h-7 w-7 text-[var(--lima)]" />
                                    </div>
                                    <h3 className="font-outfit text-xl font-bold text-[var(--text-primary)] mb-3">{feature.title}</h3>
                                    <p className="text-[var(--text-secondary)]">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Benefits Section */}
                <section id="benefits" className="py-24">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <div>
                                <span className="inline-block px-4 py-2 rounded-full bg-[var(--verde-oscuro)]/10 text-white text-sm font-bold mb-4">
                                    BENEFICIOS
                                </span>
                                <h2 className="font-outfit text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-6">
                                    Optimiza cada etapa de tu negocio
                                </h2>
                                <p className="text-[var(--text-secondary)] text-lg mb-8">
                                    Desde la captación de leads hasta el cierre de proyectos, tener todo centralizado en una sola plataforma.
                                </p>

                                <div className="space-y-4">
                                    {[
                                        'Seguimiento completo del pipeline comercial',
                                        'Automatización de cotizaciones y propuestas',
                                        'Control de proyectos con estados técnicos',
                                        'Integración con requisitos UPME',
                                        'Reportes y análisis en tiempo real',
                                    ].map((benefit, index) => (
                                        <div key={index} className="flex items-center gap-3">
                                            <CheckCircle className="h-5 w-5 text-[var(--lima)] shrink-0" />
                                            <span className="text-[var(--text-primary)]">{benefit}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-10">
                                    <Link
                                        href={auth.user ? route('dashboard') : route('login')}
                                        className="inline-flex items-center gap-2 text-[var(--lima)] font-bold hover:underline"
                                    >
                                        {auth.user ? 'Ir al Dashboard' : 'Iniciar sesión'}
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            </div>

                            {/* Visual element */}
                            <div className="relative">
                                <div className="glass rounded-3xl p-8 border border-[var(--lima)]/20">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-12 h-12 rounded-xl bg-[var(--lima)] flex items-center justify-center">
                                            <Building2 className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-[var(--text-primary)]">Panel de Control</div>
                                            <div className="text-sm text-[var(--text-secondary)]">Vista general del negocio</div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {[
                                            { label: 'Clientes activos', value: '47', color: 'bg-[var(--lima)]' },
                                            { label: 'Proyectos en curso', value: '23', color: 'bg-[var(--verde-oscuro)]' },
                                            { label: 'Cotizaciones pendientes', value: '12', color: 'bg-[var(--verde-medio)]' },
                                        ].map((item, index) => (
                                            <div key={index} className="flex items-center gap-4">
                                                <div className="flex-1">
                                                    <div className="text-sm text-[var(--text-secondary)] mb-1">{item.label}</div>
                                                    <div className="h-2 bg-[var(--surface)] rounded-full overflow-hidden">
                                                        <div className={`h-full ${item.color} rounded-full w-3/4`} />
                                                    </div>
                                                </div>
                                                <div className="font-outfit text-2xl font-bold text-[var(--text-primary)]">{item.value}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Decorative elements */}
                                <div className="absolute -top-4 -right-4 w-24 h-24 bg-[var(--lima)]/20 rounded-full blur-2xl" />
                                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-[var(--verde-oscuro)]/20 rounded-full blur-2xl" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section id="contact" className="py-24 bg-[var(--bg-content)]">
                    <div className="max-w-4xl mx-auto px-6 text-center">
                        <div className="glass rounded-3xl p-12 border border-[var(--lima)]/20">
                            <div className="w-20 h-20 rounded-full bg-[var(--lima)]/10 flex items-center justify-center mx-auto mb-8">
                                <Sun className="h-10 w-10 text-[var(--lima)]" />
                            </div>

                            <h2 className="font-outfit text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4">
                                Impulsa tu negocio solar hoy
                            </h2>
                            <p className="text-[var(--text-secondary)] text-lg mb-8 max-w-xl mx-auto">
                                Únete a las empresas colombianas que ya están optimizando su gestión comercial con Energy 4.0
                            </p>

                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="inline-flex items-center gap-3 bg-[var(--lima)] text-white font-bold px-8 py-4 rounded-2xl hover:brightness-110 transition-all shadow-xl text-lg"
                                >
                                    Acceder al Dashboard
                                    <ArrowRight className="h-5 w-5" />
                                </Link>
                            ) : (
                                <Link
                                    href={route('login')}
                                    className="inline-flex items-center gap-3 bg-[var(--lima)] text-white font-bold px-8 py-4 rounded-2xl hover:brightness-110 transition-all shadow-xl text-lg"
                                >
                                    Iniciar Sesión
                                    <ArrowRight className="h-5 w-5" />
                                </Link>
                            )}
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="py-12 border-t border-[var(--border-ui)]">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[var(--lima)] flex items-center justify-center">
                                    <Sun className="h-6 w-6 text-white" />
                                </div>
                                <span className="font-outfit font-bold text-xl text-[var(--text-primary)]">Energy 4.0</span>
                            </div>

                            <div className="text-[var(--text-secondary)] text-sm">
                                &copy; {new Date().getFullYear()} Energy 4.0. CRM de Energía Solar para Colombia.
                            </div>

                            <div className="flex items-center gap-4">
                                <Link
                                    href={route('login')}
                                    className="text-sm text-[var(--text-secondary)] hover:text-[var(--lima)] transition-colors"
                                >
                                    Iniciar Sesión
                                </Link>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}