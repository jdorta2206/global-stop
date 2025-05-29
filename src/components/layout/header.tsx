
import Image from 'next/image';
import Link from 'next/link';
import { AuthStatus } from '@/components/auth/auth-status';
import { useLanguage, LANGUAGES, type LanguageOption } from '@/contexts/language-context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe } from 'lucide-react';
import { useCallback } from 'react'; // Import useCallback

const HEADER_TEXTS = {
  homePageAriaLabel: { es: "Página de inicio de Stop", en: "Stop Home Page", fr: "Page d'accueil de Stop", pt: "Página Inicial do Stop" },
  logoAlt: { es: "Logo del juego Stop", en: "Stop Game Logo", fr: "Logo du jeu Stop", pt: "Logo do Jogo Stop" },
  languageSelectorPlaceholder: { es: "Idioma", en: "Language", fr: "Langue", pt: "Idioma" },
};

export function AppHeader() {
  const { language, setLanguage, translate, currentLanguageOption } = useLanguage();

  const handleLanguageChange = useCallback((langCode: string) => {
    const selectedLanguage = LANGUAGES.find(l => l.code === langCode);
    if (selectedLanguage) {
      setLanguage(selectedLanguage.code);
    }
  }, [setLanguage]); // LANGUAGES is a constant, setLanguage is stable from context

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
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-auto min-w-[120px] sm:min-w-[150px] text-sm py-1.5 h-9">
              <Globe className="h-4 w-4 mr-1 sm:mr-2 opacity-70" />
              <SelectValue placeholder={translate(HEADER_TEXTS.languageSelectorPlaceholder)}>
                 {currentLanguageOption?.name || language.toUpperCase()}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((langOption: LanguageOption) => (
                <SelectItem key={langOption.code} value={langOption.code}>
                  {langOption.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <AuthStatus />
        </div>
      </div>
    </header>
  );
}
