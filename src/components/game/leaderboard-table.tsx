
"use client";

import type { PlayerScore } from '@/app/page';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserCircle } from 'lucide-react';

interface LeaderboardTableProps {
  scores: PlayerScore[];
  caption?: string;
}

export function LeaderboardTable({ scores, caption }: LeaderboardTableProps) {
  if (!scores || scores.length === 0) {
    return <p className="text-muted-foreground text-center py-4">No hay puntuaciones para mostrar.</p>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        {caption && <caption className="mt-4 text-sm text-muted-foreground">{caption}</caption>}
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px] text-center">#</TableHead>
            <TableHead className="w-[80px] hidden sm:table-cell">Avatar</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead className="text-right">Puntuación</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {scores.map((player, index) => (
            <TableRow key={player.name + index} className={index < 3 ? 'bg-card/50' : ''}>
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
              <TableCell className="text-right font-semibold">{player.score}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
