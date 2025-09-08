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
    'screenshots.title': 'Scopri FastClub in Azione',
    
    // Waiting List
    'waitingList.title': 'Lista d\'Attesa',
    'waitingList.subtitle': 'Siamo in fase di test limitato. Iscriviti per essere tra i primi ad accedere!',
    
    // CTA Section
    'cta.title': 'Hai già un account?',
    'cta.button': 'Accedi Ora',
    
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
    'screenshots.title': 'Discover FastClub in Action',
    
    // Waiting List
    'waitingList.title': 'Waiting List',
    'waitingList.subtitle': 'We are in limited testing phase. Sign up to be among the first to access!',
    
    // CTA Section
    'cta.title': 'Already have an account?',
    'cta.button': 'Login Now',
    
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
    'screenshots.title': 'Descubre FastClub en Acción',
    
    // Waiting List
    'waitingList.title': 'Lista de Espera',
    'waitingList.subtitle': '¡Estamos en fase de pruebas limitadas. Regístrate para estar entre los primeros en acceder!',
    
    // CTA Section
    'cta.title': '¿Ya tienes una cuenta?',
    'cta.button': 'Acceder Ahora',
    
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
  }
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('it');

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