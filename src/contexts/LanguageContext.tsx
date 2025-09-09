import { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'it' | 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  it: {
    // Header & Navigation
    'nav.login': 'Accedi alla Piattaforma',
    'nav.waitingList': 'Entra in Lista d\'Attesa',
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
    
    // Waiting List
    'waitingList.title': 'Lista d\'Attesa',
    'waitingList.subtitle': 'Siamo in fase di test limitato. Iscriviti per essere tra i primi ad accedere!',
    
    // CTA Section
    'cta.title': 'Hai già un account?',
    'cta.button': 'Accedi Ora',
    'cta.security': 'Accesso sicuro • Dati protetti • Supporto 24/7',
    
    // Auth Page
    'auth.title': 'FastClub',
    'auth.description': 'Siamo attualmente in fase di testing con accesso limitato. Se hai già un account puoi accedere, altrimenti iscriviti alla lista d\'attesa.',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.emailPlaceholder': 'nome@esempio.it',
    'auth.passwordPlaceholder': '••••••••',
    'auth.login': 'Accedi',
    'auth.loggingIn': 'Accesso in corso...',
    'auth.noAccount': 'Non hai ancora un account?',
    'auth.joinWaitingList': 'Iscriviti alla Lista d\'Attesa',
    
    // Footer
    'footer.email': 'Email:',
    'footer.copyright': '© 2024',
    'footer.allRights': 'Tutti i diritti riservati.',

    // Waiting List Form
    'form.title': 'Entra in Lista d\'Attesa',
    'form.subtitle': 'Sii tra i primi a scoprire',
    'form.subtitleSuffix': 'quando sarà disponibile',
    'form.firstName': 'Nome',
    'form.lastName': 'Cognome',
    'form.clubName': 'Nome Club/Associazione',
    'form.city': 'Città',
    'form.email': 'Email',
    'form.firstNamePlaceholder': 'Il tuo nome',
    'form.lastNamePlaceholder': 'Il tuo cognome',
    'form.clubNamePlaceholder': 'Nome del tuo club o associazione',
    'form.cityPlaceholder': 'La tua città',
    'form.emailPlaceholder': 'la.tua.email@esempio.com',
    'form.submit': 'Entra in Lista d\'Attesa',
    'form.submitting': 'Registrazione...',
    'form.required': '* Campi obbligatori. La tua email non sarà condivisa con terzi.',
    'form.success.title': 'Registrazione Completata!',
    'form.success.message': 'Grazie per il tuo interesse. Ti contatteremo presto con tutti i dettagli di',
    'form.error.allFields': 'Tutti i campi sono obbligatori',
    'form.error.emailExists': 'Questa email è già registrata nella waiting list',
    'form.error.generic': 'Errore durante la registrazione. Riprova più tardi.',
    'form.success.toast': 'Registrazione completata! Controlla la tua email per il messaggio di benvenuto.',
  },
  
  en: {
    // Header & Navigation
    'nav.login': 'Access Platform',
    'nav.waitingList': 'Join Waiting List',
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
    
    // Waiting List
    'waitingList.title': 'Waiting List',
    'waitingList.subtitle': 'We are in limited testing phase. Sign up to be among the first to access!',
    
    // CTA Section
    'cta.title': 'Already have an account?',
    'cta.button': 'Login Now',
    'cta.security': 'Secure access • Protected data • 24/7 support',
    
    // Auth Page
    'auth.title': 'FastClub',
    'auth.description': 'We are currently in limited access testing phase. If you already have an account you can log in, otherwise join the waiting list.',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.emailPlaceholder': 'name@example.com',
    'auth.passwordPlaceholder': '••••••••',
    'auth.login': 'Login',
    'auth.loggingIn': 'Logging in...',
    'auth.noAccount': 'Don\'t have an account yet?',
    'auth.joinWaitingList': 'Join the Waiting List',
    
    // Footer
    'footer.email': 'Email:',
    'footer.copyright': '© 2024',
    'footer.allRights': 'All rights reserved.',

    // Waiting List Form
    'form.title': 'Join Waiting List',
    'form.subtitle': 'Be among the first to discover',
    'form.subtitleSuffix': 'when it\'s available',
    'form.firstName': 'First Name',
    'form.lastName': 'Last Name',
    'form.clubName': 'Club/Association Name',
    'form.city': 'City',
    'form.email': 'Email',
    'form.firstNamePlaceholder': 'Your first name',
    'form.lastNamePlaceholder': 'Your last name',
    'form.clubNamePlaceholder': 'Your club or association name',
    'form.cityPlaceholder': 'Your city',
    'form.emailPlaceholder': 'your.email@example.com',
    'form.submit': 'Join Waiting List',
    'form.submitting': 'Submitting...',
    'form.required': '* Required fields. Your email will not be shared with third parties.',
    'form.success.title': 'Registration Complete!',
    'form.success.message': 'Thank you for your interest. We\'ll contact you soon with all the details about',
    'form.error.allFields': 'All fields are required',
    'form.error.emailExists': 'This email is already registered in the waiting list',
    'form.error.generic': 'Error during registration. Please try again later.',
    'form.success.toast': 'Registration complete! Check your email for the welcome message.',
  },
  
  es: {
    // Header & Navigation
    'nav.login': 'Acceder a la Plataforma',
    'nav.waitingList': 'Unirse a Lista de Espera',
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
    
    // Waiting List
    'waitingList.title': 'Lista de Espera',
    'waitingList.subtitle': '¡Estamos en fase de pruebas limitadas. Regístrate para estar entre los primeros en acceder!',
    
    // CTA Section
    'cta.title': '¿Ya tienes una cuenta?',
    'cta.button': 'Acceder Ahora',
    'cta.security': 'Acceso seguro • Datos protegidos • Soporte 24/7',
    
    // Auth Page
    'auth.title': 'FastClub',
    'auth.description': 'Actualmente estamos en fase de pruebas con acceso limitado. Si ya tienes una cuenta puedes acceder, de lo contrario únete a la lista de espera.',
    'auth.email': 'Email',
    'auth.password': 'Contraseña',
    'auth.emailPlaceholder': 'nombre@ejemplo.com',
    'auth.passwordPlaceholder': '••••••••',
    'auth.login': 'Acceder',
    'auth.loggingIn': 'Accediendo...',
    'auth.noAccount': '¿No tienes cuenta aún?',
    'auth.joinWaitingList': 'Unirse a la Lista de Espera',
    
    // Footer
    'footer.email': 'Email:',
    'footer.copyright': '© 2024',
    'footer.allRights': 'Todos los derechos reservados.',

    // Waiting List Form
    'form.title': 'Unirse a Lista de Espera',
    'form.subtitle': 'Sé uno de los primeros en descubrir',
    'form.subtitleSuffix': 'cuando esté disponible',
    'form.firstName': 'Nombre',
    'form.lastName': 'Apellido',
    'form.clubName': 'Nombre del Club/Asociación',
    'form.city': 'Ciudad',
    'form.email': 'Email',
    'form.firstNamePlaceholder': 'Tu nombre',
    'form.lastNamePlaceholder': 'Tu apellido',
    'form.clubNamePlaceholder': 'Nombre de tu club o asociación',
    'form.cityPlaceholder': 'Tu ciudad',
    'form.emailPlaceholder': 'tu.email@ejemplo.com',
    'form.submit': 'Unirse a Lista de Espera',
    'form.submitting': 'Enviando...',
    'form.required': '* Campos obligatorios. Tu email no será compartido con terceros.',
    'form.success.title': '¡Registro Completado!',
    'form.success.message': 'Gracias por tu interés. Te contactaremos pronto con todos los detalles de',
    'form.error.allFields': 'Todos los campos son obligatorios',
    'form.error.emailExists': 'Este email ya está registrado en la lista de espera',
    'form.error.generic': 'Error durante el registro. Inténtalo de nuevo más tarde.',
    'form.success.toast': '¡Registro completado! Revisa tu email para el mensaje de bienvenida.',
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
    return translations[language][key as keyof typeof translations[typeof language]] || key;
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