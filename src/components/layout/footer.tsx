
import type { Language } from '@/contexts/language-context';

interface AppFooterProps {
  language: Language;
}

const FOOTER_TEXTS = {
  copyright: { 
    es: "Stop. Todos los derechos reservados.", 
    en: "Stop. All rights reserved.", 
    fr: "Stop. Tous droits réservés.", 
    pt: "Stop. Todos os derechos reservados." 
  },
  tagline: { 
    es: "Un juego de palabras interactivo para todos.", 
    en: "An interactive word game for everyone.", 
    fr: "Un jeu de mots interactif pour tous.", 
    pt: "Um jogo de palavras interativo para todos." 
  },
};

export function AppFooter({ language }: AppFooterProps) {
  const translate = (textKey: keyof typeof FOOTER_TEXTS) => {
    return FOOTER_TEXTS[textKey][language] || FOOTER_TEXTS[textKey]['en'];
  }

  return (
    <footer className="py-6 px-4 md:px-8 border-t border-border bg-card mt-auto">
      <div className="container mx-auto text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} {translate('copyright')}</p>
        <p>{translate('tagline')}</p>
      </div>
    </footer>
  );
}
