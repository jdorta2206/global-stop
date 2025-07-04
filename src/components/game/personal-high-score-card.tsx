"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Language } from '@/contexts/language-context';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { useToast } from './ui/use-toast';

interface PersonalHighScoreCardProps {
  className?: string;
  language: Language;
  userId?: string;
}

const TEXTS = {
  title: { es: "Tu Récord Personal", en: "Personal Best", fr: "Votre Record", pt: "Seu Recorde" },
  subtitle: { 
    es: (score: number) => `Actual: ${score} puntos`, 
    en: (score: number) => `Current: ${score} pts`, 
    fr: (score: number) => `Actuel: ${score} pts`, 
    pt: (score: number) => `Atual: ${score} pts` 
  },
  loading: { es: "Cargando...", en: "Loading...", fr: "Chargement...", pt: "Carregando..." },
  error: { es: "Error al cargar", en: "Loading error", fr: "Erreur de chargement", pt: "Erro ao carregar" },
  updateSuccess: { es: "¡Nuevo récord!", en: "New high score!", fr: "Nouveau record !", pt: "Novo recorde!" },
  shareButton: { es: "Compartir", en: "Share", fr: "Partager", pt: "Compartilhar" },
} as const;

export function PersonalHighScoreCard({ className = "", language, userId }: PersonalHighScoreCardProps) {
  const [highScore, setHighScore] = useState<number>(0);
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();
  const { toast } = useToast();

  const translate = (textKey: keyof typeof TEXTS, dynamicValue?: number): string => {
    const text = TEXTS[textKey][language] || TEXTS[textKey]['en'];
    return typeof text === 'function' ? text(dynamicValue ?? 0) : text;
  };

  const localeForNumber = {
    es: 'es-ES',
    fr: 'fr-FR',
    pt: 'pt-PT',
    en: 'en-US'
  }[language] || 'en-US';

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const fetchHighScore = async () => {
      try {
        setIsLoading(true);
        const { data, error: queryError } = await supabase
          .from('player_stats')
          .select('high_score, current_score')
          .eq('user_id', userId)
          .single();

        if (queryError) throw queryError;

        setHighScore(data?.high_score ?? 0);
        setCurrentScore(data?.current_score ?? 0);
      } catch (err) {
        console.error("Error fetching high score:", err);
        setError(translate('error'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchHighScore();

    const channel = supabase
      .channel(`user_scores:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'player_stats',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const newHigh = payload.new.high_score as number;
          if (newHigh > highScore) {
            toast({
              title: translate('updateSuccess'),
              variant: 'default',
            });
          }
          setHighScore(newHigh);
          setCurrentScore(payload.new.current_score as number);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase, language, highScore, toast]);

  const handleShare = async () => {
    const shareData = {
      title: translate('title'),
      text: `${translate('title')}: ${highScore.toLocaleString(localeForNumber)}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.text);
        toast({
          title: translate('shareButton'),
          description: "Score copied to clipboard!",
        });
      }
    } catch (err) {
      console.error("Sharing failed:", err);
    }
  };

  if (isLoading) {
    return (
      <Card className={cn("shadow-lg rounded-xl", className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-medium text-primary">
            {translate('title')}
          </CardTitle>
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="h-10 flex items-center">
            <p className="text-muted-foreground">{translate('loading')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn("shadow-lg rounded-xl", className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-medium text-primary">
            {translate('title')}
          </CardTitle>
          <Trophy className="h-6 w-6 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("shadow-lg rounded-xl", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-medium text-primary">
          {translate('title')}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleShare}
            className="text-xs h-6 px-2"
          >
            {translate('shareButton')}
          </Button>
          <Trophy className="h-6 w-6 text-yellow-500" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-2">
          <div className="text-4xl font-bold text-foreground">
            {highScore.toLocaleString(localeForNumber)}
          </div>
          <div className="text-sm text-muted-foreground mb-1">
            {translate('subtitle', currentScore)}
          </div>
        </div>
        <div className="w-full bg-secondary rounded-full h-2 mt-3">
          <div 
            className="bg-primary h-2 rounded-full" 
            style={{ 
              width: `${Math.min(100, (currentScore / Math.max(highScore, 1)) * 100}%` 
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
