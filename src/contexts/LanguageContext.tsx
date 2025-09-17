import { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'it' | 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const translations = {
  it: {
    // Header & Navigation
    'nav.login': 'Accedi alla Piattaforma',
    'nav.register': 'Registrati Gratis',
    'nav.learnMore': 'Scopri di Più',
    
    // Hero Section
    'hero.title': 'La Piattaforma AI per la Gestione Completa del tuo Club',
    'hero.subtitle': 'Automatizza documenti, gestisci soci e organizza eventi con l\'intelligenza artificiale. FastClub semplifica la vita del tuo club.',
    
    // Features
    'features.title': 'Caratteristiche Principali',
    'features.documents.title': 'Documenti AI',
    'features.documents.desc': 'Genera automaticamente verbali, comunicazioni e documenti ufficiali',
    'features.automation.title': 'Automazioni Smart',
    'features.automation.desc': 'Workflow intelligenti per semplificare le operazioni quotidiane',
    'features.design.title': 'Design AI',
    'features.design.desc': 'Interfaccia intuitiva progettata per massimizzare l\'efficienza',
    'features.management.title': 'Gestione Intelligente',
    'features.management.desc': 'Dashboard completa per monitorare ogni aspetto del club',
    'features.gdpr.title': 'GDPR Compliant',
    'features.gdpr.desc': 'Sicurezza e privacy garantite secondo le normative europee',
    'features.trial.title': 'Prova Gratuita',
    'features.trial.desc': 'Inizia subito con 30 giorni di prova gratuita, senza impegni',
    
    // Screenshots
    'screenshots.title': 'Esplora',
    'screenshots.titleSuffix': 'in Dettaglio',
    'screenshots.subtitle': 'Una panoramica completa delle funzionalità avanzate della piattaforma',
    'screenshots.dashboard.title': 'Dashboard del Club',
    'screenshots.dashboard.desc': 'Panoramica completa con statistiche in tempo reale, navigazione intuitiva tra le sezioni del club',
    'screenshots.secretariat.title': 'Segreteria Digitale',
    'screenshots.secretariat.desc': 'Gestione documenti, verbali riunioni, programmi mensili e comunicazioni ufficiali',
    'screenshots.communication.title': 'Comunicazione AI',
    'screenshots.communication.desc': 'Generatore intelligente di locandine, gestione social media e strumenti di marketing',
    'screenshots.treasury.title': 'Tesoreria Avanzata',
    'screenshots.treasury.desc': 'Bilanci, transazioni, report finanziari e gestione budget del club',
    'screenshots.presidency.title': 'Area Presidenza',
    'screenshots.presidency.desc': 'Coordinamento progetti, governance del club e strumenti di leadership',
    'screenshots.members.title': 'Gestione Soci',
    'screenshots.members.desc': 'Anagrafica completa, presenze, quote sociali e riconoscimenti membri',
    
    // Pricing
    'pricing.title': 'Scegli il Piano Perfetto per il tuo Club',
    'pricing.subtitle': 'Inizia gratis per 30 giorni, senza carta di credito richiesta',
    'pricing.free.title': 'Prova Gratuita',
    'pricing.free.price': 'Gratuito',
    'pricing.free.duration': '30 giorni',
    'pricing.free.features': [
      'Accesso completo a tutte le funzionalità',
      'Gestione illimitata soci',
      'Generazione documenti AI',
      'Dashboard avanzata',
      'Supporto email'
    ],
    'pricing.free.cta': 'Inizia Prova Gratuita',
    'pricing.pro.title': 'Piano Professional',
    'pricing.pro.price': 'da 15€',
    'pricing.pro.duration': 'al mese',
    'pricing.pro.features': [
      'Tutte le funzionalità della prova gratuita',
      'Backup automatico cloud',
      'Integrazione email avanzata',
      'Supporto prioritario 24/7',
      'Training personalizzato',
      'Aggiornamenti continui'
    ],
    'pricing.pro.cta': 'Scegli Professional',
    'pricing.note': 'Nessun impegno • Annulla quando vuoi • Supporto italiano',
    'pricing.details': 'Prezzo basato sul numero di membri: €15 (fino a 20), €25 (fino a 30), €35 (fino a 50), €50 (oltre 50)',
    'pricing.startTrial': 'Inizia la tua prova gratuita oggi',

    // CTA Section
    'cta.title': 'Hai già un account?',
    'cta.button': 'Accedi Ora',
    'cta.security': 'Accesso sicuro • Dati protetti • Supporto 24/7',
    
    // Auth Page
    'auth.title': 'FastClub',
    'auth.description': 'Inizia subito con FastClub - La piattaforma AI per la gestione completa del tuo club. Registrati per 30 giorni di prova gratuita.',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.emailPlaceholder': 'nome@esempio.it',
    'auth.passwordPlaceholder': '••••••••',
    'auth.login': 'Accedi',
    'auth.register': 'Registrati',
    'auth.loggingIn': 'Accesso in corso...',
    'auth.noAccount': 'Non hai ancora un account?',
    'auth.hasAccount': 'Hai già un account?',
    'auth.signUp': 'Crea il tuo account',
    'auth.signIn': 'Accedi al tuo account',
    
    // Footer
    'footer.email': 'Email:',
    'footer.copyright': '© 2024',
    'footer.allRights': 'Tutti i diritti riservati.',
  },
  
  en: {
    // Header & Navigation
    'nav.login': 'Access Platform',
    'nav.register': 'Register Free',
    'nav.learnMore': 'Learn More',
    
    // Hero Section
    'hero.title': 'The AI Platform for Complete Club Management',
    'hero.subtitle': 'Automate documents, manage members and organize events with artificial intelligence. FastClub simplifies your club life.',
    
    // Features
    'features.title': 'Key Features',
    'features.documents.title': 'AI Documents',
    'features.documents.desc': 'Automatically generate meeting minutes, communications and official documents',
    'features.automation.title': 'Smart Automations',
    'features.automation.desc': 'Intelligent workflows to simplify daily operations',
    'features.design.title': 'AI Design',
    'features.design.desc': 'Intuitive interface designed to maximize efficiency',
    'features.management.title': 'Smart Management',
    'features.management.desc': 'Complete dashboard to monitor every aspect of the club',
    'features.gdpr.title': 'GDPR Compliant',
    'features.gdpr.desc': 'Security and privacy guaranteed according to European regulations',
    'features.trial.title': 'Free Trial',
    'features.trial.desc': 'Start now with 30 days free trial, no commitment',
    
    // Screenshots
    'screenshots.title': 'Explore',
    'screenshots.titleSuffix': 'in Detail',
    'screenshots.subtitle': 'A comprehensive overview of the platform\'s advanced features',
    'screenshots.dashboard.title': 'Club Dashboard',
    'screenshots.dashboard.desc': 'Complete overview with real-time statistics, intuitive navigation between club sections',
    'screenshots.secretariat.title': 'Digital Secretariat',
    'screenshots.secretariat.desc': 'Document management, meeting minutes, monthly programs and official communications',
    'screenshots.communication.title': 'AI Communication',
    'screenshots.communication.desc': 'Intelligent poster generator, social media management and marketing tools',
    'screenshots.treasury.title': 'Advanced Treasury',
    'screenshots.treasury.desc': 'Budgets, transactions, financial reports and club budget management',
    'screenshots.presidency.title': 'Presidency Area',
    'screenshots.presidency.desc': 'Project coordination, club governance and leadership tools',
    'screenshots.members.title': 'Member Management',
    'screenshots.members.desc': 'Complete registry, attendance, membership fees and member recognition',
    
    // Pricing
    'pricing.title': 'Choose the Perfect Plan for Your Club',
    'pricing.subtitle': 'Start free for 30 days, no credit card required',
    'pricing.free.title': 'Free Trial',
    'pricing.free.price': 'Free',
    'pricing.free.duration': '30 days',
    'pricing.free.features': [
      'Full access to all features',
      'Unlimited member management',
      'AI document generation',
      'Advanced dashboard',
      'Email support'
    ],
    'pricing.free.cta': 'Start Free Trial',
    'pricing.pro.title': 'Professional Plan',
    'pricing.pro.price': 'from €15',
    'pricing.pro.duration': 'per month',
    'pricing.pro.features': [
      'All free trial features',
      'Automatic cloud backup',
      'Advanced email integration',
      'Priority 24/7 support',
      'Personalized training',
      'Continuous updates'
    ],
    'pricing.pro.cta': 'Choose Professional',
    'pricing.note': 'No commitment • Cancel anytime • Italian support',
    'pricing.details': 'Pricing based on member count: €15 (up to 20), €25 (up to 30), €35 (up to 50), €50 (over 50)',
    'pricing.startTrial': 'Start your free trial today',

    // CTA Section
    'cta.title': 'Already have an account?',
    'cta.button': 'Login Now',
    'cta.security': 'Secure access • Protected data • 24/7 support',
    
    // Auth Page
    'auth.title': 'FastClub',
    'auth.description': 'Get started with FastClub - The AI platform for complete club management. Sign up for a 30-day free trial.',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.emailPlaceholder': 'name@example.com',
    'auth.passwordPlaceholder': '••••••••',
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.loggingIn': 'Logging in...',
    'auth.noAccount': 'Don\'t have an account yet?',
    'auth.hasAccount': 'Already have an account?',
    'auth.signUp': 'Create your account',
    'auth.signIn': 'Sign in to your account',
    
    // Footer
    'footer.email': 'Email:',
    'footer.copyright': '© 2024',
    'footer.allRights': 'All rights reserved.',
  },
  
  es: {
    // Header & Navigation
    'nav.login': 'Acceder a la Plataforma',
    'nav.register': 'Registrarse Gratis',
    'nav.learnMore': 'Saber Más',
    
    // Hero Section
    'hero.title': 'La Plataforma AI para la Gestión Completa de tu Club',
    'hero.subtitle': 'Automatiza documentos, gestiona socios y organiza eventos con inteligencia artificial. FastClub simplifica la vida de tu club.',
    
    // Features
    'features.title': 'Características Principales',
    'features.documents.title': 'Documentos AI',
    'features.documents.desc': 'Genera automáticamente actas, comunicaciones y documentos oficiales',
    'features.automation.title': 'Automatizaciones Inteligentes',
    'features.automation.desc': 'Flujos de trabajo inteligentes para simplificar las operaciones diarias',
    'features.design.title': 'Diseño AI',
    'features.design.desc': 'Interfaz intuitiva diseñada para maximizar la eficiencia',
    'features.management.title': 'Gestión Inteligente',
    'features.management.desc': 'Dashboard completo para monitorizar todos los aspectos del club',
    'features.gdpr.title': 'Cumple GDPR',
    'features.gdpr.desc': 'Seguridad y privacidad garantizadas según las normativas europeas',
    'features.trial.title': 'Prueba Gratuita',
    'features.trial.desc': 'Comienza ahora con 30 días de prueba gratuita, sin compromisos',
    
    // Screenshots
    'screenshots.title': 'Explora',
    'screenshots.titleSuffix': 'en Detalle',
    'screenshots.subtitle': 'Una visión completa de las características avanzadas de la plataforma',
    'screenshots.dashboard.title': 'Dashboard del Club',
    'screenshots.dashboard.desc': 'Vista completa con estadísticas en tiempo real, navegación intuitiva entre secciones del club',
    'screenshots.secretariat.title': 'Secretaría Digital',
    'screenshots.secretariat.desc': 'Gestión de documentos, actas de reuniones, programas mensuales y comunicaciones oficiales',
    'screenshots.communication.title': 'Comunicación AI',
    'screenshots.communication.desc': 'Generador inteligente de carteles, gestión de redes sociales y herramientas de marketing',
    'screenshots.treasury.title': 'Tesorería Avanzada',
    'screenshots.treasury.desc': 'Presupuestos, transacciones, informes financieros y gestión del presupuesto del club',
    'screenshots.presidency.title': 'Área Presidencia',
    'screenshots.presidency.desc': 'Coordinación de proyectos, gobernanza del club y herramientas de liderazgo',
    'screenshots.members.title': 'Gestión de Socios',
    'screenshots.members.desc': 'Registro completo, asistencia, cuotas de membresía y reconocimiento de miembros',
    
    // Pricing
    'pricing.title': 'Elige el Plan Perfecto para tu Club',
    'pricing.subtitle': 'Comienza gratis por 30 días, sin tarjeta de crédito requerida',
    'pricing.free.title': 'Prueba Gratuita',
    'pricing.free.price': 'Gratis',
    'pricing.free.duration': '30 días',
    'pricing.free.features': [
      'Acceso completo a todas las funciones',
      'Gestión ilimitada de socios',
      'Generación de documentos AI',
      'Dashboard avanzado',
      'Soporte por email'
    ],
    'pricing.free.cta': 'Comenzar Prueba Gratuita',
    'pricing.pro.title': 'Plan Profesional',
    'pricing.pro.price': 'desde 15€',
    'pricing.pro.duration': 'al mes',
    'pricing.pro.features': [
      'Todas las funciones de la prueba gratuita',
      'Backup automático en la nube',
      'Integración avanzada de email',
      'Soporte prioritario 24/7',
      'Entrenamiento personalizado',
      'Actualizaciones continuas'
    ],
    'pricing.pro.cta': 'Elegir Profesional',
    'pricing.note': 'Sin compromiso • Cancela cuando quieras • Soporte italiano',
    'pricing.details': 'Precio basado en número de miembros: €15 (hasta 20), €25 (hasta 30), €35 (hasta 50), €50 (más de 50)',
    'pricing.startTrial': 'Comienza tu prueba gratuita hoy',

    // CTA Section
    'cta.title': '¿Ya tienes una cuenta?',
    'cta.button': 'Acceder Ahora',
    'cta.security': 'Acceso seguro • Datos protegidos • Soporte 24/7',
    
    // Auth Page
    'auth.title': 'FastClub',
    'auth.description': 'Comienza con FastClub - La plataforma AI para la gestión completa de tu club. Regístrate para una prueba gratuita de 30 días.',
    'auth.email': 'Email',
    'auth.password': 'Contraseña',
    'auth.emailPlaceholder': 'nombre@ejemplo.com',
    'auth.passwordPlaceholder': '••••••••',
    'auth.login': 'Acceder',
    'auth.register': 'Registrarse',
    'auth.loggingIn': 'Accediendo...',
    'auth.noAccount': '¿No tienes cuenta aún?',
    'auth.hasAccount': '¿Ya tienes una cuenta?',
    'auth.signUp': 'Crea tu cuenta',
    'auth.signIn': 'Inicia sesión en tu cuenta',
    
    // Footer
    'footer.email': 'Email:',
    'footer.copyright': '© 2024',
    'footer.allRights': 'Todos los derechos reservados.',
  }
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  // Auto-detect browser language
  const getInitialLanguage = (): Language => {
    const browserLang = navigator.language.split('-')[0];
    const supportedLanguages = ['it', 'en', 'es'];
    return supportedLanguages.includes(browserLang as Language) ? browserLang as Language : 'en';
  };

  const [language, setLanguage] = useState<Language>(getInitialLanguage());

  const t = (key: string): string => {
    const value = translations[language][key as keyof typeof translations[typeof language]];
    if (Array.isArray(value)) {
      return value.join(', '); // Fallback for arrays when used as string
    }
    return value || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};