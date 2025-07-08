'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Share2, Users, Trophy, Globe, MessageCircle, Play } from 'lucide-react';

export default function LandingPage() {
  const [language, setLanguage] = useState<'es' | 'en'>('es');

  const content = {
    es: {
      title: "¡Juega Stop Online!",
      subtitle: "El juego de palabras más divertido para jugar con amigos",
      description: "¡Juega al clásico juego Stop, multilenguaje, contra la IA o amigos! Compite con tus amigos en el clásico juego de Stop. Demuestra tu vocabulario y velocidad mental en categorías como países, animales, nombres y mucho más.",
      playButton: "¡Jugar Ahora!",
      shareButton: "Compartir en WhatsApp",
      howToPlay: "Cómo Jugar",
      categories: "Categorías",
      features: "Características",
      multiplayerTitle: "Multijugador",
      multiplayerDesc: "Juega con amigos en tiempo real",
      fastTitle: "Rápido y Divertido",
      fastDesc: "Partidas dinámicas de 5 minutos",
      competitiveTitle: "Competitivo",
      competitiveDesc: "Sistema de puntuación justo",
      steps: [
        "Únete a una sala con tus amigos",
        "Espera a que se genere una letra aleatoria",
        "Completa todas las categorías con esa letra",
        "¡El primero en terminar dice STOP!",
        "Compara respuestas y gana puntos"
      ],
      categoryList: [
        "País", "Animal", "Nombre", "Apellido", 
        "Color", "Comida", "Objeto", "Profesión"
      ],
      featureList: [
        "Multijugador en tiempo real",
        "Salas privadas con código",
        "Sistema de puntuación automático",
        "Interfaz intuitiva y responsive",
        "Compatible con móviles"
      ]
    },
    en: {
      title: "Play Stop Online!",
      subtitle: "The most fun word game to play with friends",
      description: "Play the classic Stop game, multilingual, against AI or friends! Compete with your friends in the classic Stop game. Show your vocabulary and mental speed in categories like countries, animals, names and much more.",
      playButton: "Play Now!",
      shareButton: "Share on WhatsApp",
      howToPlay: "How to Play",
      categories: "Categories",
      features: "Features",
      multiplayerTitle: "Multiplayer",
      multiplayerDesc: "Play with friends in real time",
      fastTitle: "Fast and Fun",
      fastDesc: "Dynamic 5-minute games",
      competitiveTitle: "Competitive",
      competitiveDesc: "Fair scoring system",
      steps: [
        "Join a room with your friends",
        "Wait for a random letter to be generated",
        "Complete all categories with that letter",
        "The first to finish says STOP!",
        "Compare answers and earn points"
      ],
      categoryList: [
        "Country", "Animal", "Name", "Surname", 
        "Color", "Food", "Object", "Profession"
      ],
      featureList: [
        "Real-time multiplayer",
        "Private rooms with code",
        "Automatic scoring system",
        "Intuitive and responsive interface",
        "Mobile compatible"
      ]
    }
  };

  const shareOnWhatsApp = () => {
    const text = language === 'es' 
      ? "¡Ven a jugar Stop conmigo! 🎮 El juego de palabras más divertido. Compite y demuestra tu vocabulario 🧠"
      : "Come play Stop with me! 🎮 The most fun word game. Compete and show your vocabulary 🧠";
    
    const url = window.location.href;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + "\n" + url)}`;
    window.open(whatsappUrl, '_blank');
  };

  const t = content[language];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-400">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
              <Image 
                src="/icons/icon-192x192.png" 
                alt="Stop Logo" 
                width={32} 
                height={32}
                className="rounded-full"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <span className="hidden text-blue-600 font-bold text-lg">S</span>
            </div>
            <h1 className="text-2xl font-bold text-white">STOP</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex bg-white/20 rounded-full p-1">
              <button
                onClick={() => setLanguage('es')}
                className={`px-3 py-1 rounded-full text-sm transition-all ${
                  language === 'es' ? 'bg-white text-blue-600' : 'text-white'
                }`}
              >
                ES
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 rounded-full text-sm transition-all ${
                  language === 'en' ? 'bg-white text-blue-600' : 'text-white'
                }`}
              >
                EN
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Logo Principal */}
          <div className="mb-8">
            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-2xl mx-auto mb-6">
              <Image 
                src="/icons/icon-512x512.png" 
                alt="Stop Logo" 
                width={100} 
                height={100}
                className="rounded-full"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <span className="hidden text-blue-600 font-bold text-6xl">S</span>
            </div>
          </div>

          <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">
            {t.title}
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            {t.subtitle}
          </p>
          <p className="text-white/80 mb-12 max-w-3xl mx-auto">
            {t.description}
          </p>

          {/* Botones principales */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-blue-50 transition-all transform hover:scale-105 flex items-center justify-center space-x-2 shadow-lg">
              <Play size={20} />
              <span>{t.playButton}</span>
            </button>
            <button 
              onClick={shareOnWhatsApp}
              className="bg-green-500 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-green-600 transition-all transform hover:scale-105 flex items-center justify-center space-x-2 shadow-lg"
            >
              <MessageCircle size={20} />
              <span>{t.shareButton}</span>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <Users className="w-12 h-12 text-white mb-4 mx-auto" />
              <h3 className="text-xl font-bold text-white mb-2">{t.multiplayerTitle}</h3>
              <p className="text-white/80">{t.multiplayerDesc}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <Trophy className="w-12 h-12 text-white mb-4 mx-auto" />
              <h3 className="text-xl font-bold text-white mb-2">{t.fastTitle}</h3>
              <p className="text-white/80">{t.fastDesc}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <Globe className="w-12 h-12 text-white mb-4 mx-auto" />
              <h3 className="text-xl font-bold text-white mb-2">{t.competitiveTitle}</h3>
              <p className="text-white/80">{t.competitiveDesc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* How to Play Section */}
      <section className="bg-white/10 backdrop-blur-sm py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-white text-center mb-12">{t.howToPlay}</h2>
          <div className="max-w-3xl mx-auto">
            <div className="space-y-6">
              {t.steps.map((step, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-white text-blue-600 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <p className="text-white/90 text-lg">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-white text-center mb-12">{t.categories}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {t.categoryList.map((category, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center">
                <span className="text-white font-semibold">{category}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white/10 backdrop-blur-sm py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-white text-center mb-12">{t.features}</h2>
          <div className="max-w-3xl mx-auto">
            <div className="space-y-4">
              {t.featureList.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span className="text-white/90 text-lg">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-white mb-8">
            {language === 'es' ? '¿Listo para jugar?' : 'Ready to play?'}
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-blue-50 transition-all transform hover:scale-105 flex items-center justify-center space-x-2 shadow-lg">
              <Play size={20} />
              <span>{t.playButton}</span>
            </button>
            <button 
              onClick={shareOnWhatsApp}
              className="bg-green-500 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-green-600 transition-all transform hover:scale-105 flex items-center justify-center space-x-2 shadow-lg"
            >
              <Share2 size={20} />
              <span>{t.shareButton}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/20 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-white/60">
            {language === 'es' 
              ? '© 2024 Stop Game. Todos los derechos reservados.'
              : '© 2024 Stop Game. All rights reserved.'
            }
          </p>
        </div>
      </footer>
    </div>
  );
}
