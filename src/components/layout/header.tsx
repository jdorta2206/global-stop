
import Image from 'next/image';
import Link from 'next/link';
import { AuthStatus } from '@/components/auth/auth-status';
import { useLanguage } from '@/contexts/language-context';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

const HEADER_TEXTS = {
  homePageAriaLabel: { es: "Página de inicio de Global Stop", en: "Global Stop Home Page" },
  logoAlt: { es: "Logo de Global Stop Game", en: "Global Stop Game Logo" },
  changeLanguageAriaLabel: { es: "Cambiar idioma", en: "Change language" },
  switchToEnglishText: { es: "Switch to English", en: "Switch to English" },
  switchToSpanishText: { es: "Cambiar a Español", en: "Cambiar a Español" },
};

export function AppHeader() {
  const { language, setLanguage, translate } = useLanguage();

  const toggleLanguage = () => {
    const newLang = language === 'es' ? 'en' : 'es';
    setLanguage(newLang);
  };

  const switchToButtonText = language === 'es' ? translate(HEADER_TEXTS.switchToEnglishText) : translate(HEADER_TEXTS.switchToSpanishText);

  return (
    <header className="py-3 px-4 md:px-8 border-b border-border bg-card shadow-sm sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center hover:opacity-90 transition-opacity" aria-label={translate(HEADER_TEXTS.homePageAriaLabel)}>
          <Image
            src="/logo_stop_game.png"
            alt={translate(HEADER_TEXTS.logoAlt)}
            width={48}
            height={48}
            className="h-10 md:h-12 w-auto"
            priority
            data-ai-hint="game logo"
          />
        </Link>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <Button
            variant="ghost"
            onClick={toggleLanguage}
            className="px-2 sm:px-3 py-1.5 text-sm flex items-center"
            aria-label={translate(HEADER_TEXTS.changeLanguageAriaLabel)}
          >
            <Globe className="h-5 w-5" />
            <span className="ml-2 hidden sm:inline">{switchToButtonText}</span>
          </Button>
          <AuthStatus />
        </div>
      </div>
    </header>
  );
}
