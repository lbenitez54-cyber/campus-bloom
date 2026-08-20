import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Music,
  Headphones,
  ExternalLink,
  Sparkles,
  Check,
  X,
  Volume2,
  ListMusic,
  Plus,
  Play,
  RotateCcw,
  CheckCircle2,
  Flame,
  Coffee,
  Trees,
  BookOpen,
} from 'lucide-react';

export interface SpotifyPlaylistPreset {
  id: string;
  name: string;
  tagline: string;
  category: 'lofi' | 'piano' | 'ambient' | 'focus' | 'classical';
  embedUrl: string;
  coverImage?: string;
  iconName: 'lofi' | 'piano' | 'ambient' | 'coffee' | 'focus' | 'classical';
  colorTheme: {
    bg: string;
    text: string;
    border: string;
  };
}

export const PRESET_PLAYLISTS: SpotifyPlaylistPreset[] = [
  {
    id: 'preset-lofi-beats',
    name: 'Lofi Study Beats',
    tagline: 'Ritmos relajantes y suaves para sesiones intensas de estudio',
    category: 'lofi',
    embedUrl: 'https://open.spotify.com/embed/playlist/0vvXsW14ReMVt3NVW1U4ag?utm_source=generator&theme=0',
    iconName: 'lofi',
    colorTheme: {
      bg: 'bg-[#ffd9df]',
      text: 'text-[#783e4c]',
      border: 'border-[#ffb7c5]',
    },
  },
  {
    id: 'preset-piano-focus',
    name: 'Piano de Concentración',
    tagline: 'Melodías acústicas minimalistas que facilitan la memoria a largo plazo',
    category: 'piano',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX4sWSpwq3LiO?utm_source=generator&theme=0',
    iconName: 'piano',
    colorTheme: {
      bg: 'bg-[#fedbc7]',
      text: 'text-[#6b3820]',
      border: 'border-[#facbb2]',
    },
  },
  {
    id: 'preset-ambient-botanic',
    name: 'Ambiente Botánico & Zen',
    tagline: 'Ondas alpha, naturaleza y frecuencias verdes curativas',
    category: 'ambient',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX3Ogo9pFvBkY?utm_source=generator&theme=0',
    iconName: 'ambient',
    colorTheme: {
      bg: 'bg-[#cde9ac]',
      text: 'text-[#374d20]',
      border: 'border-[#b4cf95]',
    },
  },
  {
    id: 'preset-rainy-coffee',
    name: 'Café de Estudio Lluvioso',
    tagline: 'Atmósfera acogedora con llovizna suave y acordes cálidos',
    category: 'focus',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWZqd5JICZI0u?utm_source=generator&theme=0',
    iconName: 'coffee',
    colorTheme: {
      bg: 'bg-[#d8e2dc]',
      text: 'text-[#284b63]',
      border: 'border-[#b9c9c0]',
    },
  },
  {
    id: 'preset-deep-focus-med',
    name: 'Deep Focus • Medicina FCM',
    tagline: 'Frecuencias binaurales e instrumental profundo para memorizar',
    category: 'focus',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DXdLEN7aqioXM?utm_source=generator&theme=0',
    iconName: 'focus',
    colorTheme: {
      bg: 'bg-[#e2d4f0]',
      text: 'text-[#4c2d73]',
      border: 'border-[#ceb9e6]',
    },
  },
  {
    id: 'preset-classical-study',
    name: 'Clásica para Rendimiento',
    tagline: 'Mozart, Bach y Chopin optimizados para la agilidad cognitiva',
    category: 'classical',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWZeKCadgRdKQ?utm_source=generator&theme=0',
    iconName: 'classical',
    colorTheme: {
      bg: 'bg-[#fce1e4]',
      text: 'text-[#73333e]',
      border: 'border-[#f7c2c9]',
    },
  },
];

export function convertToSpotifyEmbedUrl(inputUrl: string): string | null {
  const trimmed = inputUrl.trim();
  if (!trimmed) return null;

  // Already an embed URL
  if (trimmed.includes('open.spotify.com/embed/')) {
    return trimmed;
  }

  // Matches open.spotify.com/playlist/ID, open.spotify.com/album/ID, open.spotify.com/track/ID, open.spotify.com/episode/ID
  const match = trimmed.match(/open\.spotify\.com\/(playlist|album|track|episode|show)\/([a-zA-Z0-9]+)/);
  if (match) {
    const type = match[1];
    const id = match[2];
    return `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`;
  }

  // Matches spotify URI: spotify:playlist:ID, spotify:track:ID, etc.
  const uriMatch = trimmed.match(/spotify:(playlist|album|track|episode|show):([a-zA-Z0-9]+)/);
  if (uriMatch) {
    const type = uriMatch[1];
    const id = uriMatch[2];
    return `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`;
  }

  return null;
}

interface SpotifyPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activePlaylist: SpotifyPlaylistPreset;
  onSelectPlaylist: (playlist: SpotifyPlaylistPreset) => void;
}

export const SpotifyPlayerModal: React.FC<SpotifyPlayerModalProps> = ({
  isOpen,
  onClose,
  activePlaylist,
  onSelectPlaylist,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [customUrlInput, setCustomUrlInput] = useState<string>('');
  const [customUrlError, setCustomUrlError] = useState<string | null>(null);
  const [customSuccessMsg, setCustomSuccessMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'player' | 'presets' | 'custom'>('player');

  // Handle escape and click outside
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        const triggerBtn = document.getElementById('header-spotify-player-toggle-btn');
        if (triggerBtn && triggerBtn.contains(e.target as Node)) return;
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomUrlError(null);
    setCustomSuccessMsg(null);

    const embedUrl = convertToSpotifyEmbedUrl(customUrlInput);
    if (!embedUrl) {
      setCustomUrlError('Por favor introduce un enlace válido de Spotify (ej: https://open.spotify.com/playlist/...)');
      return;
    }

    const customPreset: SpotifyPlaylistPreset = {
      id: `custom-${Date.now()}`,
      name: 'Mi Playlist de Spotify',
      tagline: 'Lista de reproducción personalizada por el usuario',
      category: 'focus',
      embedUrl: embedUrl,
      iconName: 'focus',
      colorTheme: {
        bg: 'bg-[#cde9ac]',
        text: 'text-[#374d20]',
        border: 'border-[#b4cf95]',
      },
    };

    onSelectPlaylist(customPreset);
    setCustomSuccessMsg('¡Playlist cargada con éxito en el reproductor!');
    setCustomUrlInput('');
    setTimeout(() => {
      setActiveTab('player');
      setCustomSuccessMsg(null);
    }, 900);
  };

  const getPlaylistIcon = (icon: string) => {
    switch (icon) {
      case 'piano':
        return <Music className="w-4 h-4" />;
      case 'ambient':
        return <Trees className="w-4 h-4" />;
      case 'coffee':
        return <Coffee className="w-4 h-4" />;
      case 'focus':
        return <Flame className="w-4 h-4" />;
      case 'classical':
        return <BookOpen className="w-4 h-4" />;
      default:
        return <Headphones className="w-4 h-4" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={modalRef}
          id="spotify-floating-player-modal"
          initial={{ opacity: 0, y: -12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.96 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="absolute right-2 sm:right-6 top-16 w-[calc(100vw-16px)] sm:w-[440px] max-h-[88vh] flex flex-col rounded-[26px] bg-white/85 backdrop-blur-2xl border border-white/90 shadow-2xl shadow-[#4e6535]/15 z-50 overflow-hidden text-[#1b1c1c]"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-black/5 bg-gradient-to-b from-white/90 to-white/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Spotify official green round icon */}
              <div className="w-10 h-10 rounded-2xl bg-[#1DB954] shadow-md shadow-[#1DB954]/25 flex items-center justify-center text-white flex-shrink-0">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.494 17.315c-.216.353-.674.464-1.027.248-2.813-1.718-6.352-2.107-10.523-1.155-.403.092-.807-.16-.899-.562-.092-.402.16-.807.562-.899 4.568-1.043 8.49-.603 11.64 1.341.353.216.464.674.247 1.027zm1.464-3.256c-.272.44-.849.579-1.289.307-3.22-1.978-8.128-2.55-11.936-1.393-.497.151-1.026-.134-1.177-.63-.151-.497.134-1.026.63-1.177 4.354-1.321 9.772-.682 13.465 1.585.44.272.579.849.307 1.308zm.126-3.398C15.228 8.39 8.877 8.18 5.166 9.307c-.6.182-1.23-.162-1.412-.762-.182-.6.162-1.23.762-1.412 4.267-1.295 11.284-1.053 15.654 1.542.54.32.716 1.022.396 1.562-.32.54-1.022.716-1.562.396z" />
                </svg>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-heading text-base font-extrabold text-[#1b1c1c] tracking-tight">
                    Spotify Focus & Estudio
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#cde9ac] text-[#374d20] border border-[#b4cf95]">
                    Lo-Fi
                  </span>
                </div>
                <p className="text-[11.5px] text-[#514345]/80 font-medium">
                  {activePlaylist.name}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-[#514345] hover:text-[#1b1c1c] hover:bg-white/80 transition-colors"
              aria-label="Cerrar reproductor Spotify"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Nav Tabs */}
          <div className="px-4 py-2 bg-black/[0.02] border-b border-black/5 flex items-center justify-between gap-1.5 text-xs font-semibold">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveTab('player')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all text-[11.5px] flex items-center gap-1.5 ${
                  activeTab === 'player'
                    ? 'bg-[#4e6535] text-white shadow-xs'
                    : 'bg-white/60 text-[#514345] hover:bg-white/90'
                }`}
              >
                <Headphones className="w-3.5 h-3.5" /> Reproductor
              </button>

              <button
                onClick={() => setActiveTab('presets')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all text-[11.5px] flex items-center gap-1.5 ${
                  activeTab === 'presets'
                    ? 'bg-[#864e5a] text-white shadow-xs'
                    : 'bg-white/60 text-[#514345] hover:bg-white/90'
                }`}
              >
                <ListMusic className="w-3.5 h-3.5" /> Playlists ({PRESET_PLAYLISTS.length})
              </button>

              <button
                onClick={() => setActiveTab('custom')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all text-[11.5px] flex items-center gap-1.5 ${
                  activeTab === 'custom'
                    ? 'bg-[#864e5a] text-white shadow-xs'
                    : 'bg-white/60 text-[#514345] hover:bg-white/90'
                }`}
              >
                <Plus className="w-3.5 h-3.5" /> Mi Enlace
              </button>
            </div>
          </div>

          {/* Modal Content */}
          <div className="p-4 flex-1 overflow-y-auto max-h-[62vh]">
            {activeTab === 'player' && (
              <div className="space-y-3.5">
                {/* Embedded Spotify Iframe */}
                <div className="rounded-[20px] overflow-hidden shadow-md border border-black/10 bg-[#121212]">
                  <iframe
                    key={activePlaylist.embedUrl}
                    style={{ borderRadius: '18px' }}
                    src={activePlaylist.embedUrl}
                    width="100%"
                    height="172"
                    frameBorder="0"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    title={`Spotify Player - ${activePlaylist.name}`}
                  />
                </div>

                {/* Current Active Info Card */}
                <div className="p-3.5 rounded-2xl bg-white/70 border border-white/90 flex items-start justify-between gap-3 shadow-2xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold border ${activePlaylist.colorTheme.bg} ${activePlaylist.colorTheme.text} ${activePlaylist.colorTheme.border}`}>
                        En Reproducción
                      </span>
                      <h4 className="text-[13px] font-bold text-[#1b1c1c]">
                        {activePlaylist.name}
                      </h4>
                    </div>
                    <p className="text-[11.5px] text-[#514345] leading-relaxed font-medium">
                      {activePlaylist.tagline}
                    </p>
                  </div>

                  <button
                    onClick={() => setActiveTab('presets')}
                    className="p-2 rounded-xl bg-white hover:bg-[#ffd9df] text-[#864e5a] border border-black/5 shadow-2xs transition-colors flex-shrink-0"
                    title="Cambiar lista temática"
                  >
                    <ListMusic className="w-4 h-4" />
                  </button>
                </div>

                {/* Quick Switch Row with Pills */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-[#514345]/80 uppercase tracking-wider">
                    Cambio Rápido de Ambiente:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {PRESET_PLAYLISTS.slice(0, 4).map((p) => {
                      const isCurrent = p.id === activePlaylist.id;
                      return (
                        <button
                          key={p.id}
                          onClick={() => onSelectPlaylist(p)}
                          className={`p-2.5 rounded-xl text-left border transition-all flex items-center gap-2 ${
                            isCurrent
                              ? 'bg-[#cde9ac] text-[#374d20] border-[#b4cf95] shadow-xs ring-1 ring-[#4e6535]/30'
                              : 'bg-white/60 hover:bg-white text-[#514345] border-white/80'
                          }`}
                        >
                          <div className={`p-1.5 rounded-lg ${isCurrent ? 'bg-white text-[#4e6535]' : 'bg-black/5 text-[#514345]'}`}>
                            {getPlaylistIcon(p.iconName)}
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-[11px] font-bold truncate">{p.name}</p>
                            <p className="text-[9.5px] opacity-75 truncate">{p.category}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'presets' && (
              <div className="space-y-2.5">
                <p className="text-xs text-[#514345] font-medium mb-1">
                  Selecciona una de las listas diseñadas para mejorar la retención de estudio:
                </p>
                {PRESET_PLAYLISTS.map((preset) => {
                  const isCurrent = preset.id === activePlaylist.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => {
                        onSelectPlaylist(preset);
                        setActiveTab('player');
                      }}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isCurrent
                          ? 'bg-gradient-to-r from-white/95 to-[#f4faf0] border-[#b4cf95] shadow-sm ring-1 ring-[#4e6535]/30'
                          : 'bg-white/60 hover:bg-white/90 border-white/80'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${preset.colorTheme.bg} ${preset.colorTheme.text} shadow-2xs`}>
                          {getPlaylistIcon(preset.iconName)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-bold text-[#1b1c1c]">{preset.name}</h4>
                            {isCurrent && (
                              <span className="px-1.5 py-0.2 rounded-md bg-[#4e6535] text-white text-[9px] font-bold">
                                Activa
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#514345]/80 line-clamp-1">
                            {preset.tagline}
                          </p>
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        {isCurrent ? (
                          <div className="w-7 h-7 rounded-xl bg-[#cde9ac] text-[#374d20] flex items-center justify-center shadow-xs">
                            <Check className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="w-7 h-7 rounded-xl bg-white/80 hover:bg-[#ffd9df] text-[#864e5a] flex items-center justify-center border border-black/5 shadow-2xs">
                            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === 'custom' && (
              <div className="space-y-3.5">
                <div className="p-3.5 rounded-2xl bg-white/70 border border-white/90 space-y-2">
                  <div className="flex items-center gap-2 text-[#4e6535]">
                    <Sparkles className="w-4 h-4 text-[#4e6535]" />
                    <h4 className="text-xs font-bold text-[#1b1c1c]">Pega tu propia Playlist de Spotify</h4>
                  </div>
                  <p className="text-[11.5px] text-[#514345] leading-relaxed">
                    Copia el enlace de cualquier lista, álbum o canción desde tu app de Spotify y pégalo aquí para reproducirlo en CampusBloom.
                  </p>
                </div>

                <form onSubmit={handleApplyCustomUrl} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#514345] block">
                      Enlace de Spotify:
                    </label>
                    <input
                      type="url"
                      placeholder="https://open.spotify.com/playlist/..."
                      value={customUrlInput}
                      onChange={(e) => setCustomUrlInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/90 border border-black/10 focus:border-[#4e6535] focus:ring-2 focus:ring-[#4e6535]/20 text-xs font-medium outline-none transition-all placeholder:text-[#514345]/50 shadow-inner"
                    />
                  </div>

                  {customUrlError && (
                    <p className="text-[11px] text-[#ba1a1a] font-semibold bg-[#ba1a1a]/10 p-2 rounded-xl border border-[#ba1a1a]/20">
                      {customUrlError}
                    </p>
                  )}

                  {customSuccessMsg && (
                    <p className="text-[11px] text-[#374d20] font-semibold bg-[#cde9ac] p-2 rounded-xl border border-[#b4cf95] flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#4e6535]" /> {customSuccessMsg}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-[#4e6535] hover:bg-[#3d5029] text-white text-xs font-bold transition-all shadow-md shadow-[#4e6535]/20 flex items-center justify-center gap-2"
                  >
                    <Music className="w-3.5 h-3.5" /> Cargar en el Reproductor
                  </button>
                </form>

                <div className="pt-2 text-[10.5px] text-[#514345]/70 space-y-1">
                  <p className="font-semibold">Ejemplos compatibles:</p>
                  <p className="font-mono text-[10px] truncate bg-black/5 p-1 rounded-md">
                    https://open.spotify.com/playlist/37i9dQZF1DX8Uebhn9wzrS
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div className="p-3 px-4 border-t border-black/5 bg-white/70 flex items-center justify-between text-xs text-[#514345]">
            <span className="text-[11px] font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#1DB954] animate-pulse"></span>
              Spotify Web Player
            </span>

            <a
              href="https://open.spotify.com"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] font-bold text-[#4e6535] hover:underline flex items-center gap-1"
            >
              Abrir Spotify <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
