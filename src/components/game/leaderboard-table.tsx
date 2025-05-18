
"use client";

import type { PlayerScore } from '@/app/page';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserCircle } from 'lucide-react';
import type { Language } from '@/contexts/language-context';

interface LeaderboardTableProps {
  scores: PlayerScore[];
  caption?: string;
  language: Language;
}

const TEXTS = {
  rank: { es: "#", en: "#", fr: "#", pt: "#" },
  avatar: { es: "Avatar", en: "Avatar", fr: "Avatar", pt: "Avatar" },
  name: { es: "Nombre", en: "Name", fr: "Nom", pt: "Nome" },
  score: { es: "Puntuación", en: "Score", fr: "Score", pt: "Pontuação" },
  noScores: { es: "No hay puntuaciones para mostrar.", en: "No scores to display.", fr: "Aucun score à afficher.", pt: "Não há pontuações para exibir." },
};

export function LeaderboardTable({ scores, caption, language }: LeaderboardTableProps) {
  const translate = (textKey: keyof typeof TEXTS) => {
    return TEXTS[textKey][language] || TEXTS[textKey]['en'];
  };

  if (!scores || scores.length === 0) {
    return <p className="text-muted-foreground text-center py-4">{translate('noScores')}</p>;
  }
  
  const localeForNumber = language === 'es' ? 'es-ES' : language === 'fr' ? 'fr-FR' : language === 'pt' ? 'pt-PT' : 'en-US';

  return (
    <div className="rounded-md border">
      <Table>
        {caption && <caption className="mt-4 text-sm text-muted-foreground">{caption}</caption>}
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px] text-center">{translate('rank')}</TableHead>
            <TableHead className="w-[80px] hidden sm:table-cell">{translate('avatar')}</TableHead>
            <TableHead>{translate('name')}</TableHead>
            <TableHead className="text-right">{translate('score')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {scores.map((player, index) => (
            <TableRow key={player.name + index + player.score} className={index < 3 ? 'bg-card/50' : ''}>
              <TableCell className="font-medium text-center">{index + 1}</TableCell>
              <TableCell className="hidden sm:table-cell">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={player.avatar || `https://placehold.co/40x40.png?text=${player.name.charAt(0)}`} alt={player.name} data-ai-hint="profile person" />
                  <AvatarFallback>
                    {player.name ? player.name.charAt(0).toUpperCase() : <UserCircle size={20}/>}
                  </AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell>{player.name}</TableCell>
              <TableCell className="text-right font-semibold">{player.score.toLocaleString(localeForNumber)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
