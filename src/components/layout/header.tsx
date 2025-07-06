import Image from 'next/image';
import Link from 'next/link';
import { AuthStatus } from '@/components/auth/auth-status';
import { useLanguage, LANGUAGES, type LanguageOption } from '@/contexts/language-context';
import { useCallback } from 'react';
import { Globe } from 'lucide-react';

const HEADER_TEXTS = {
 homePageAriaLabel: { es: "Página de inicio de Stop", en: "Stop Home Page", fr: "Page d'accueil de Stop", pt: "Página Inicial do Stop" },
 logoAlt: { es: "Logo del juego Stop", en: "Stop Game Logo", fr: "Logo du jeu Stop", pt: "Logo do Jogo Stop" },
 languageSelectorPlaceholder: { es: "Idioma", en: "Language", fr: "Langue", pt: "Idioma" },
};

export function AppHeader() {
 const { language, setLanguage, translate } = useLanguage();

 const handleLanguageChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
   setLanguage(e.target.value as any);
 }, [setLanguage]);

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
         />
       </Link>
       <div className="flex items-center space-x-2 sm:space-x-4">
         <div className="flex items-center gap-2">
           <Globe className="h-4 w-4 opacity-70" />
           <select 
             value={language} 
             onChange={handleLanguageChange}
             className="w-[140px] h-10 px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
           >
             {LANGUAGES.map((langOption) => (
               <option key={langOption.code} value={langOption.code}>
                 {langOption.name}
               </option>
             ))}
           </select>
         </div>
         <AuthStatus />
       </div>
     </div>
   </header>
 );
}