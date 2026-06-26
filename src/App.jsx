import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Player from './components/Player';
import HomeView from './components/HomeView';
import SearchView from './components/SearchView';
import LibraryView from './components/LibraryView';
import SettingsView from './components/SettingsView';
import Visualizer from './components/Visualizer';
import { listAudioFiles, getFolderMetadata, getStreamUrl, fetchAudioBlob } from './utils/driveApi';
import { Music, AlertCircle, Home, Search, Library, Settings, Heart } from 'lucide-react';

// Canciones de prueba para el Modo Demostración
const DEMO_TRACKS = [
  {
    id: 'demo-1',
    title: 'SoundHelix Song 1 (Synth Pop)',
    artist: 'SoundHelix Instrumental',
    album: 'SoundHelix Demo Vol. 1',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    size: 6127450,
    duration: '06:12'
  },
  {
    id: 'demo-2',
    title: 'SoundHelix Song 2 (Ambient Rock)',
    artist: 'SoundHelix Instrumental',
    album: 'SoundHelix Demo Vol. 1',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    size: 7384501,
    duration: '07:05'
  },
  {
    id: 'demo-3',
    title: 'SoundHelix Song 4 (Progressive)',
    artist: 'SoundHelix Instrumental',
    album: 'SoundHelix Demo Vol. 2',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    size: 5124902,
    duration: '05:02'
  },
  {
    id: 'demo-4',
    title: 'SoundHelix Song 8 (Chill Groove)',
    artist: 'SoundHelix Instrumental',
    album: 'SoundHelix Demo Vol. 2',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    size: 5543209,
    duration: '05:38'
  }
];

export default function App() {
  // Credenciales por defecto obtenidas de tu configuración (hardcoded)
  const DEFAULT_CLIENT_ID = '453073155462-k34c64009fj03d44eqtr6k49ebv6n9tf.apps.googleusercontent.com';
  const DEFAULT_FOLDER_ID = '1WcktOLMC8HyKtVeAULlip53vLZkRIQRW';

  // Configuración de Google Drive
  const [clientId, setClientId] = useState(() => localStorage.getItem('mx_client_id') || DEFAULT_CLIENT_ID);
  const [folderId, setFolderId] = useState(() => localStorage.getItem('mx_folder_id') || DEFAULT_FOLDER_ID);
  const [accessToken, setAccessToken] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [folderName, setFolderName] = useState('');

  // Modo Demo
  const [isDemoMode, setIsDemoMode] = useState(() => {
    // Si no hay credenciales guardadas ni por defecto, arrancar en demo
    const savedClient = localStorage.getItem('mx_client_id') || DEFAULT_CLIENT_ID;
    const savedFolder = localStorage.getItem('mx_folder_id') || DEFAULT_FOLDER_ID;
    return !(savedClient && savedFolder);
  });

  // Estado de Música
  const [tracks, setTracks] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(() => parseFloat(localStorage.getItem('mx_volume') || '0.5'));
  const [isMuted, setIsMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTrackUrl, setCurrentTrackUrl] = useState('');

  // Estado de Me Gusta (Favoritos) y Cola Activa
  const [likedTrackIds, setLikedTrackIds] = useState(() => {
    try {
      const saved = localStorage.getItem('mx_liked_tracks');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error(e);
      return [];
    }
  });
  const [activeQueue, setActiveQueue] = useState([]);

  // Alternar Favorito
  const toggleLikeTrack = (trackId) => {
    setLikedTrackIds(prev => {
      const updated = prev.includes(trackId)
        ? prev.filter(id => id !== trackId)
        : [...prev, trackId];
      localStorage.setItem('mx_liked_tracks', JSON.stringify(updated));
      return updated;
    });
  };

  // Reproducir cola completa
  const handlePlayAllFromQueue = (queue) => {
    if (queue && queue.length > 0) {
      handleTrackSelect(queue[0], queue);
    }
  };

  // Estado del Ecualizador
  const [eqBass, setEqBass] = useState(() => parseFloat(localStorage.getItem('mx_eq_bass') || '0'));
  const [eqMid, setEqMid] = useState(() => parseFloat(localStorage.getItem('mx_eq_mid') || '0'));
  const [eqTreble, setEqTreble] = useState(() => parseFloat(localStorage.getItem('mx_eq_treble') || '0'));

  const handleEqChange = (band, val) => {
    const numericVal = parseFloat(val);
    localStorage.setItem(`mx_eq_${band}`, numericVal.toString());
    if (band === 'bass') {
      setEqBass(numericVal);
      if (window.bassFilter) window.bassFilter.gain.value = numericVal;
    } else if (band === 'mid') {
      setEqMid(numericVal);
      if (window.midFilter) window.midFilter.gain.value = numericVal;
    } else if (band === 'treble') {
      setEqTreble(numericVal);
      if (window.trebleFilter) window.trebleFilter.gain.value = numericVal;
    }
  };

  const handleResetEq = () => {
    handleEqChange('bass', 0);
    handleEqChange('mid', 0);
    handleEqChange('treble', 0);
  };

  // Estado del Historial Reciente
  const [recentTracks, setRecentTracks] = useState(() => {
    try {
      const saved = localStorage.getItem('mx_recent_tracks');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error(e);
      return [];
    }
  });

  // Estado de Descargas en Progreso
  const [downloadingIds, setDownloadingIds] = useState([]);

  // Descargar Archivo de Audio
  const downloadTrack = async (track) => {
    if (!track || downloadingIds.includes(track.id)) return;
    
    setDownloadingIds(prev => [...prev, track.id]);
    try {
      let blob;
      // Si es pista demo, hacer fetch del origen público
      if (isDemoMode || track.id.startsWith('demo-')) {
        const res = await fetch(track.src);
        if (!res.ok) throw new Error('Error al descargar archivo demo');
        blob = await res.blob();
      } else {
        // Si es de Google Drive, descargar usando la API oficial
        blob = await fetchAudioBlob(track.id, accessToken);
      }
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Sanitizar el nombre del archivo y conservar la extensión adecuada
      const name = track.title || 'audio';
      const hasExtension = /\.[a-zA-Z0-9]+$/.test(name);
      a.download = hasExtension ? name : `${name}.mp3`;
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error al descargar la canción:', err);
      alert('Error: No se pudo descargar el archivo de música de Google Drive o del origen demo.');
    } finally {
      setDownloadingIds(prev => prev.filter(id => id !== track.id));
    }
  };

  // Estados para contraseña maestra de ajustes (erison1)
  const [isSettingsUnlocked, setIsSettingsUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  // Navegación
  const [currentTab, setCurrentTab] = useState('home');
  const [showVisualizer, setShowVisualizer] = useState(false);

  const audioRef = useRef(null);
  const tokenClientRef = useRef(null);
  const currentBlobUrlRef = useRef(null);

  // Cleanup de blobs creados para evitar fugas de memoria
  useEffect(() => {
    return () => {
      if (currentBlobUrlRef.current) {
        URL.revokeObjectURL(currentBlobUrlRef.current);
      }
    };
  }, []);

  // Controlar la reproducción al cambiar la URL del audio
  useEffect(() => {
    if (currentTrackUrl && audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => {
          console.error('Error al iniciar reproducción:', err);
          setIsPlaying(false);
        });
    }
  }, [currentTrackUrl]);

  // Cargar canciones en base a la conexión
  useEffect(() => {
    if (isDemoMode) {
      setTracks(DEMO_TRACKS);
      setFolderName('Biblioteca Demo');
      setIsConnected(false);
    } else if (isConnected && accessToken) {
      loadDriveTracks();
    } else {
      setTracks([]);
      setFolderName('');
    }
  }, [isConnected, accessToken, isDemoMode, folderId]);

  // Soporte de atajos de teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeEl = document.activeElement;
      if (
        activeEl && 
        (activeEl.tagName === 'INPUT' || 
         activeEl.tagName === 'TEXTAREA' || 
         activeEl.tagName === 'SELECT' || 
         activeEl.isContentEditable)
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case ' ': // Espacio: Play/Pause
          e.preventDefault();
          handlePlayPause();
          break;
        case 'arrowright': // Flecha derecha: Avanzar 10s
          e.preventDefault();
          if (audioRef.current) {
            handleSeek(Math.min(audioRef.current.duration || 0, audioRef.current.currentTime + 10));
          }
          break;
        case 'arrowleft': // Flecha izquierda: Retroceder 10s
          e.preventDefault();
          if (audioRef.current) {
            handleSeek(Math.max(0, audioRef.current.currentTime - 10));
          }
          break;
        case 'arrowup': // Flecha arriba: Volumen +5%
          e.preventDefault();
          handleVolumeChange(Math.min(1, volume + 0.05));
          break;
        case 'arrowdown': // Flecha abajo: Volumen -5%
          e.preventDefault();
          handleVolumeChange(Math.max(0, volume - 0.05));
          break;
        case 'm': // M: Silenciar/Mute
          handleToggleMute();
          break;
        case 'n': // N: Siguiente canción
          handleNext();
          break;
        case 'p': // P: Canción anterior
          handlePrev();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentTrack, isPlaying, volume, isMuted, tracks, activeQueue, shuffle, repeat]);

  // Integración con Media Session API
  useEffect(() => {
    if (!navigator.mediaSession || !currentTrack || !window.MediaMetadata) return;

    const generateArtwork = (title, artist) => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        if (!ctx) return '';
        
        const grad = ctx.createLinearGradient(0, 0, 512, 512);
        grad.addColorStop(0, '#3b0ca3');
        grad.addColorStop(0.5, '#7209b7');
        grad.addColorStop(1, '#f72585');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 512, 512);
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 4;
        for (let r = 80; r <= 220; r += 40) {
          ctx.beginPath();
          ctx.arc(256, 256, r, 0, Math.PI * 2);
          ctx.stroke();
        }
        
        ctx.beginPath();
        ctx.arc(256, 256, 40, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(8, 6, 12, 0.6)';
        ctx.fill();
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 110px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🎵', 256, 256);
        
        ctx.font = 'bold 26px system-ui, sans-serif';
        ctx.fillStyle = '#ffffff';
        const displayTitle = title.length > 25 ? title.substring(0, 22) + '...' : title;
        ctx.fillText(displayTitle, 256, 430);
        
        ctx.font = '500 20px system-ui, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        const displayArtist = artist.length > 30 ? artist.substring(0, 27) + '...' : artist;
        ctx.fillText(displayArtist, 256, 465);

        return canvas.toDataURL('image/png');
      } catch (err) {
        console.error('Error al generar cover art en canvas:', err);
        return '';
      }
    };

    const artworkUrl = generateArtwork(currentTrack.title, currentTrack.artist || 'Desconocido');

    navigator.mediaSession.metadata = new window.MediaMetadata({
      title: currentTrack.title,
      artist: currentTrack.artist || 'Desconocido',
      album: currentTrack.album || 'MusicXpress Cloud',
      artwork: artworkUrl ? [{ src: artworkUrl, sizes: '512x512', type: 'image/png' }] : []
    });

  }, [currentTrack]);

  // Action handlers de Media Session
  useEffect(() => {
    if (!navigator.mediaSession) return;

    try {
      navigator.mediaSession.setActionHandler('play', handlePlayPause);
      navigator.mediaSession.setActionHandler('pause', handlePlayPause);
      navigator.mediaSession.setActionHandler('previoustrack', handlePrev);
      navigator.mediaSession.setActionHandler('nexttrack', handleNext);
      
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.fastSeek && audioRef.current && audioRef.current.fastSeek) {
          audioRef.current.fastSeek(details.seekTime);
        } else {
          handleSeek(details.seekTime);
        }
      });
      
      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        const offset = details.seekOffset || 10;
        if (audioRef.current) {
          handleSeek(Math.max(0, audioRef.current.currentTime - offset));
        }
      });
      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        const offset = details.seekOffset || 10;
        if (audioRef.current) {
          handleSeek(Math.min(audioRef.current.duration || 0, audioRef.current.currentTime + offset));
        }
      });
    } catch (error) {
      console.warn('Media Session Action Handlers no soportados:', error);
    }

    return () => {
      const actions = ['play', 'pause', 'previoustrack', 'nexttrack', 'seekto', 'seekbackward', 'seekforward'];
      actions.forEach(action => {
        try {
          navigator.mediaSession.setActionHandler(action, null);
        } catch (e) {}
      });
    };
  }, [currentTrack, tracks, activeQueue, shuffle, repeat, isPlaying]);

  // Sincronizar estado de reproducción de Media Session
  useEffect(() => {
    if (!navigator.mediaSession) return;
    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
  }, [isPlaying]);

  // Desbloquear ajustes con contraseña maestra
  const handleUnlockSettings = () => {
    if (passwordInput === 'erison1') {
      setIsSettingsUnlocked(true);
      setShowAdminLogin(false);
      setPasswordError(false);
      setPasswordInput('');
    } else {
      setPasswordError(true);
    }
  };

  // Desbloquear ajustes desde doble clic oculto (Player)
  const handleAdminUnlock = () => {
    const pass = prompt('Contraseña de administrador:');
    if (pass === 'erison1') {
      setShowVisualizer(false);
      setCurrentTab('settings');
    } else if (pass !== null) {
      alert('Contraseña incorrecta.');
    }
  };

  // Cargar canciones de Google Drive
  const loadDriveTracks = async () => {
    try {
      if (folderId) {
        const folderMeta = await getFolderMetadata(folderId, accessToken);
        if (folderMeta) {
          setFolderName(folderMeta.name);
        }
      } else {
        setFolderName('Todo el Drive');
      }

      const files = await listAudioFiles(accessToken, folderId || null);
      setTracks(files);
      
      // Intentar recuperar duración cargando el audio en segundo plano (opcional)
    } catch (error) {
      console.error('Error cargando audios de Drive:', error);
      alert('Error al acceder a Google Drive. Por favor, vuelve a iniciar sesión.');
      handleDisconnect();
    }
  };

  // Inicializar Google Identity Services Client
  useEffect(() => {
    // Verificar si el script de Google ya se cargó
    const initGoogleOAuth = () => {
      if (window.google && window.google.accounts && window.google.accounts.oauth2 && clientId) {
        try {
          tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
            client_id: clientId,
            scope: 'https://www.googleapis.com/auth/drive.readonly',
            callback: (tokenResponse) => {
              if (tokenResponse && tokenResponse.access_token) {
                setAccessToken(tokenResponse.access_token);
                setIsConnected(true);
                setIsDemoMode(false);
                // Programar renovación automática del token si expira
                const expiresInMs = (tokenResponse.expires_in || 3600) * 1000;
                setTimeout(() => {
                  // Renovar silenciosamente
                  tokenClientRef.current.requestAccessToken({ prompt: '' });
                }, expiresInMs - 60000); // 1 min antes de expirar
              }
            },
          });
        } catch (e) {
          console.error('Error al inicializar token client:', e);
        }
      }
    };

    // Intentar inicializar de inmediato o esperar a que la librería cargue
    if (window.google) {
      initGoogleOAuth();
    } else {
      // Reintentar en 1 segundo si aún no está lista
      const timer = setTimeout(initGoogleOAuth, 1000);
      return () => clearTimeout(timer);
    }
  }, [clientId]);

  // Conectar con Google OAuth
  const handleConnect = () => {
    if (!clientId) {
      alert('Por favor, introduce tu Client ID en la pestaña de Ajustes.');
      setCurrentTab('settings');
      return;
    }
    
    if (tokenClientRef.current) {
      tokenClientRef.current.requestAccessToken({ prompt: 'select_account' });
    } else {
      // Si no se inicializó correctamente (por ejemplo, porque se cambió el Client ID recientemente)
      try {
        tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'https://www.googleapis.com/auth/drive.readonly',
          callback: (tokenResponse) => {
            if (tokenResponse && tokenResponse.access_token) {
              setAccessToken(tokenResponse.access_token);
              setIsConnected(true);
              setIsDemoMode(false);
            }
          },
        });
        tokenClientRef.current.requestAccessToken({ prompt: 'select_account' });
      } catch (err) {
        console.error('Error al conectar Google OAuth:', err);
        alert('No se pudo conectar a Google. Revisa que tu Client ID sea correcto y que estés en un dominio autorizado.');
      }
    }
  };

  // Desconectar Google Drive
  const handleDisconnect = () => {
    setAccessToken('');
    setIsConnected(false);
    setFolderName('');
    setTracks([]);
    if (currentTrack && currentTrack.id !== 'demo-1') {
      setCurrentTrack(null);
      setIsPlaying(false);
    }
  };

  // Activar Modo Demo
  const handleSetUseDemoMode = (useDemo) => {
    setIsDemoMode(useDemo);
    if (useDemo) {
      handleDisconnect();
    }
  };

  // --- REPRODUCTOR DE AUDIO CONTROLES ---

  // Reproducir/Pausar
  const handlePlayPause = () => {
    if (!currentTrack) {
      if (tracks.length > 0) {
        handleTrackSelect(tracks[0]);
      }
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(e => console.log('Error play:', e));
      setIsPlaying(true);
    }
  };

  // Siguiente Canción
  const handleNext = () => {
    const queue = activeQueue.length > 0 ? activeQueue : tracks;
    if (queue.length === 0) return;
    let nextIndex = 0;
    
    if (shuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else if (currentTrack) {
      const currentIndex = queue.findIndex(t => t.id === currentTrack.id);
      nextIndex = (currentIndex + 1) % queue.length;
    }
    
    handleTrackSelect(queue[nextIndex], queue);
  };

  // Canción Anterior
  const handlePrev = () => {
    const queue = activeQueue.length > 0 ? activeQueue : tracks;
    if (queue.length === 0) return;
    let prevIndex = 0;
    
    if (shuffle) {
      prevIndex = Math.floor(Math.random() * queue.length);
    } else if (currentTrack) {
      const currentIndex = queue.findIndex(t => t.id === currentTrack.id);
      prevIndex = (currentIndex - 1 + queue.length) % queue.length;
    }
    
    handleTrackSelect(queue[prevIndex], queue);
  };

  // Seleccionar y reproducir canción
  const handleTrackSelect = async (track, customQueue = null) => {
    if (!track) return;
    
    if (customQueue) {
      setActiveQueue(customQueue);
    } else if (activeQueue.length === 0) {
      setActiveQueue(tracks);
    }
    
    setCurrentTrack(track);
    setIsPlaying(false);

    // Agregar a historial de reproducción reciente (máximo 6)
    setRecentTracks(prev => {
      const filtered = prev.filter(t => t.id !== track.id);
      const updated = [track, ...filtered].slice(0, 6);
      localStorage.setItem('mx_recent_tracks', JSON.stringify(updated));
      return updated;
    });
    
    // Si es modo demo o pista demo, reproducir por streaming directo
    if (isDemoMode || track.id.startsWith('demo-')) {
      setIsLoading(false);
      setCurrentTrackUrl(track.src);
      return;
    }
    
    // Si es de Google Drive, descargar como Blob para evitar bloqueos CORS y cookies en Brave/Safari
    try {
      setIsLoading(true);
      setCurrentTrackUrl(''); // Limpiar anterior para pausar
      
      // Liberar el blob anterior de la memoria del navegador
      if (currentBlobUrlRef.current) {
        URL.revokeObjectURL(currentBlobUrlRef.current);
      }
      
      const blob = await fetchAudioBlob(track.id, accessToken);
      const blobUrl = URL.createObjectURL(blob);
      currentBlobUrlRef.current = blobUrl;
      
      setIsLoading(false);
      setCurrentTrackUrl(blobUrl);
    } catch (err) {
      setIsLoading(false);
      console.error('Fallo al descargar el archivo de Drive:', err);
      alert('No se pudo descargar el archivo de audio de Google Drive. Comprueba tu conexión o vuelve a iniciar sesión.');
    }
  };

  // Avanzar/retroceder en barra de progreso
  const handleSeek = (newTime) => {
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Controlar Volumen
  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    localStorage.setItem('mx_volume', newVolume.toString());
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : newVolume;
    }
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    if (audioRef.current) {
      audioRef.current.volume = nextMute ? 0 : volume;
    }
  };

  // Manejo de eventos del nodo <audio> nativo
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleDurationChange = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleAudioEnded = () => {
    if (repeat) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else {
      handleNext();
    }
  };

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      handleTrackSelect(tracks[0]);
    }
  };

  // Renderizar la vista activa
  const renderView = () => {
    if (showVisualizer) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          height: '100%',
          justifyContent: 'center',
          gap: '24px',
          padding: '20px',
          animation: 'fadeIn 0.4s ease-out'
        }}>
          {/* Tarjeta de Canción en Visualizador */}
          <div style={{
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div 
              style={{
                width: '160px',
                height: '160px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #531b93, var(--primary))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 30px var(--primary-glow)',
                border: '4px solid rgba(157, 78, 221, 0.4)',
                position: 'relative'
              }}
              className={isPlaying ? 'animate-spin-slow' : ''}
            >
              <div style={{
                position: 'absolute',
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-base)',
                border: '2px solid rgba(255, 255, 255, 0.1)',
                zIndex: 2
              }} />
              <Music size={64} color="#fff" style={{ opacity: 0.8 }} />
            </div>
            
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#fff', marginTop: '12px' }}>
              {currentTrack ? currentTrack.title : 'Silencio'}
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--text-muted)' }}>
              {currentTrack ? currentTrack.artist : 'Sin pista seleccionada'}
            </p>
          </div>

          {/* Visualizador de Canvas */}
          <div style={{
            width: '100%',
            maxWidth: '800px',
            height: '320px',
            borderRadius: '16px',
            overflow: 'hidden',
            border: '1px solid var(--border-color)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
          }}>
            <Visualizer 
              audioElement={audioRef.current} 
              isPlaying={isPlaying} 
            />
          </div>

          {/* Panel de Ecualizador de Audio */}
          <div className="glass" style={{
            width: '100%',
            maxWidth: '800px',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid rgba(157, 78, 221, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            marginTop: '8px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '15px', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🎛️ Ecualizador de Audio
              </span>
              <button 
                onClick={handleResetEq}
                style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  color: 'var(--primary-light)',
                  background: 'rgba(157, 78, 221, 0.15)',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  border: '1px solid rgba(157, 78, 221, 0.3)',
                  cursor: 'pointer'
                }}
                className="glow-hover"
              >
                Restablecer
              </button>
            </div>
            
            <div style={{
              display: 'flex',
              gap: '24px',
              justifyContent: 'space-around',
              alignItems: 'center',
              padding: '10px 0',
              flexWrap: 'wrap'
            }}>
              {/* Bajos */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', flex: '1 1 200px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Bajos (200 Hz)</span>
                <input 
                  type="range"
                  min="-12"
                  max="12"
                  step="1"
                  value={eqBass}
                  onChange={(e) => handleEqChange('bass', e.target.value)}
                  style={{
                    width: '100%',
                    height: '6px',
                    accentColor: 'var(--primary)',
                    cursor: 'pointer'
                  }}
                />
                <span style={{ fontSize: '13px', fontWeight: '700', color: eqBass > 0 ? 'var(--primary-hover)' : eqBass < 0 ? '#ffb703' : '#fff' }}>
                  {eqBass > 0 ? `+${eqBass}` : eqBass} dB
                </span>
              </div>

              {/* Medios */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', flex: '1 1 200px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Medios (1 kHz)</span>
                <input 
                  type="range"
                  min="-12"
                  max="12"
                  step="1"
                  value={eqMid}
                  onChange={(e) => handleEqChange('mid', e.target.value)}
                  style={{
                    width: '100%',
                    height: '6px',
                    accentColor: 'var(--primary)',
                    cursor: 'pointer'
                  }}
                />
                <span style={{ fontSize: '13px', fontWeight: '700', color: eqMid > 0 ? 'var(--primary-hover)' : eqMid < 0 ? '#ffb703' : '#fff' }}>
                  {eqMid > 0 ? `+${eqMid}` : eqMid} dB
                </span>
              </div>

              {/* Agudos */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', flex: '1 1 200px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Agudos (3 kHz)</span>
                <input 
                  type="range"
                  min="-12"
                  max="12"
                  step="1"
                  value={eqTreble}
                  onChange={(e) => handleEqChange('treble', e.target.value)}
                  style={{
                    width: '100%',
                    height: '6px',
                    accentColor: 'var(--primary)',
                    cursor: 'pointer'
                  }}
                />
                <span style={{ fontSize: '13px', fontWeight: '700', color: eqTreble > 0 ? 'var(--primary-hover)' : eqTreble < 0 ? '#ffb703' : '#fff' }}>
                  {eqTreble > 0 ? `+${eqTreble}` : eqTreble} dB
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    switch (currentTab) {
      case 'home':
        return (
          <HomeView
            isConnected={isConnected}
            isDemoMode={isDemoMode}
            tracksCount={tracks.length}
            folderName={folderName}
            onPlayAll={handlePlayAll}
            setCurrentTab={setCurrentTab}
            recentTracks={recentTracks}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onTrackSelect={handleTrackSelect}
            likedTrackIds={likedTrackIds}
            onToggleLike={toggleLikeTrack}
          />
        );
      case 'search':
        return (
          <SearchView
            tracks={tracks}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onTrackSelect={handleTrackSelect}
            likedTrackIds={likedTrackIds}
            onToggleLike={toggleLikeTrack}
            downloadingIds={downloadingIds}
            onDownloadTrack={downloadTrack}
          />
        );
      case 'library':
        return (
          <LibraryView
            tracks={tracks}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onTrackSelect={handleTrackSelect}
            onPlayAll={handlePlayAll}
            isConnected={isConnected}
            isDemoMode={isDemoMode}
            folderName={folderName}
            likedTrackIds={likedTrackIds}
            onToggleLike={toggleLikeTrack}
            downloadingIds={downloadingIds}
            onDownloadTrack={downloadTrack}
          />
        );
      case 'liked':
        return (
          <LibraryView
            tracks={tracks.filter(t => likedTrackIds.includes(t.id))}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onTrackSelect={handleTrackSelect}
            onPlayAll={() => handlePlayAllFromQueue(tracks.filter(t => likedTrackIds.includes(t.id)))}
            isConnected={isConnected}
            isDemoMode={isDemoMode}
            folderName="Canciones que te gustan"
            isLikedSongsView={true}
            likedTrackIds={likedTrackIds}
            onToggleLike={toggleLikeTrack}
            downloadingIds={downloadingIds}
            onDownloadTrack={downloadTrack}
          />
        );
      case 'settings':
        return (
          <SettingsView
            clientId={clientId}
            setClientId={setClientId}
            folderId={folderId}
            setFolderId={setFolderId}
            isConnected={isConnected}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
            isDemoMode={isDemoMode}
            setUseDemoMode={handleSetUseDemoMode}
          />
        );
      default:
        return <div style={{ color: '#fff' }}>Página no encontrada.</div>;
    }
  };

  // Si el usuario no está conectado y no está en modo demo, forzar pantalla de inicio de sesión limpia
  if (!isConnected && !isDemoMode) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100vw',
        backgroundColor: 'var(--bg-base)',
        padding: '24px',
        animation: 'fadeIn 0.5s ease-out'
      }}>
        {showAdminLogin ? (
          /* Desbloquear ajustes */
          <div className="glass" style={{ padding: '32px', borderRadius: '16px', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px', color: '#fff' }}>Área de Administración</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>Ingresa la contraseña maestra para configurar las llaves de la app.</p>
            <input
              type="password"
              placeholder="Contraseña Maestra"
              value={passwordInput}
              onChange={(e) => { setPasswordInput(e.target.value); setPasswordError(false); }}
              style={{ width: '100%', marginBottom: '12px', textAlign: 'center' }}
              onKeyDown={(e) => e.key === 'Enter' && handleUnlockSettings()}
            />
            {passwordError && <p style={{ color: '#e63946', fontSize: '12px', marginBottom: '12px' }}>Contraseña incorrecta.</p>}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => { setShowAdminLogin(false); setPasswordInput(''); setPasswordError(false); }}
                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '13px' }}
              >
                Volver
              </button>
              <button
                onClick={handleUnlockSettings}
                style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'var(--primary)', color: '#fff', fontSize: '13px', fontWeight: '600' }}
              >
                Ingresar
              </button>
            </div>
          </div>
        ) : isSettingsUnlocked ? (
          /* Ajustes desbloqueados temporalmente para configurar */
          <div style={{ width: '100%', maxWidth: '600px', height: '90vh', overflowY: 'auto', padding: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
              <button
                onClick={() => { setIsSettingsUnlocked(false); }}
                style={{ padding: '8px 16px', borderRadius: '20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '12px', fontWeight: '600' }}
                className="glow-hover"
              >
                Cerrar Configuración
              </button>
            </div>
            <SettingsView
              clientId={clientId}
              setClientId={setClientId}
              folderId={folderId}
              setFolderId={setFolderId}
              isConnected={isConnected}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
              isDemoMode={isDemoMode}
              setUseDemoMode={handleSetUseDemoMode}
            />
          </div>
        ) : (
          /* Landing de Login limpia */
          <div className="glass" style={{
            padding: '40px',
            borderRadius: '24px',
            maxWidth: '450px',
            width: '100%',
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(83, 27, 147, 0.3), rgba(157, 78, 221, 0.1))',
            border: '1px solid rgba(157, 78, 221, 0.2)',
            boxShadow: '0 10px 40px rgba(157, 78, 221, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))',
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px var(--primary-glow)'
            }}>
              <Music size={32} color="#fff" />
            </div>

            <div>
              <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>
                MusicXpress
              </h1>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                Tu música en la nube, sin rodeos. Conéctate a tu Google Drive para comenzar a reproducir.
              </p>
            </div>

            <button
              onClick={handleConnect}
              style={{
                width: '100%',
                background: 'var(--primary)',
                color: '#fff',
                padding: '14px',
                borderRadius: '30px',
                fontWeight: '700',
                fontSize: '15px',
                boxShadow: '0 6px 20px var(--primary-glow)',
                transition: 'transform 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
              }}
              className="glow-hover"
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              Iniciar Sesión con Google
            </button>

            {/* Acceso de administrador oculto */}
            <button
              onClick={() => setShowAdminLogin(true)}
              style={{
                fontSize: '11px',
                color: 'rgba(255,255,255,0.15)',
                marginTop: '16px',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.15)'}
            >
              ⚙️ Administrar configuración
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      width: '100vw',
      backgroundColor: 'var(--bg-base)'
    }}>
      <audio
        ref={audioRef}
        crossOrigin={isDemoMode ? "anonymous" : undefined}
        src={currentTrackUrl || ''}
        onTimeUpdate={handleTimeUpdate}
        onDurationChange={handleDurationChange}
        onEnded={handleAudioEnded}
        loop={repeat}
      />

      {/* Main Grid: Sidebar + Vista de Contenido */}
      <div style={{
        display: 'flex',
        flex: 1,
        height: 'calc(100vh - var(--player-height))',
        width: '100%',
        overflow: 'hidden'
      }}>
        {/* Barra Lateral */}
        <Sidebar 
          currentTab={showVisualizer ? 'visualizer' : currentTab} 
          setCurrentTab={(tab) => {
            setShowVisualizer(false);
            setCurrentTab(tab);
          }}
          isConnected={isConnected}
          isDemoMode={isDemoMode}
          folderName={folderName}
        />

        {/* Contenido Principal */}
        <main style={{
          flex: 1,
          height: '100%',
          overflowY: 'auto',
          padding: '30px 40px',
          position: 'relative'
        }}>
          {/* Alerta de advertencia en Chrome si no carga por políticas de orígenes */}
          {!window.google && currentTab === 'settings' && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: 'rgba(230, 57, 70, 0.1)',
              border: '1px solid #e63946',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '20px',
              color: '#e63946',
              fontSize: '13px'
            }}>
              <AlertCircle size={18} />
              <span>Cargando servicios de autenticación de Google... Si esto tarda, comprueba tu conexión a internet o desactiva bloqueadores de anuncios.</span>
            </div>
          )}
          {renderView()}
        </main>
      </div>

      {/* Reproductor Inferior */}
      <Player
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        isMuted={isMuted}
        shuffle={shuffle}
        repeat={repeat}
        onPlayPause={handlePlayPause}
        onNext={handleNext}
        onPrev={handlePrev}
        onSeek={handleSeek}
        onVolumeChange={handleVolumeChange}
        onToggleShuffle={() => setShuffle(!shuffle)}
        onToggleRepeat={() => setRepeat(!repeat)}
        onToggleMute={handleToggleMute}
        showVisualizer={showVisualizer}
        setShowVisualizer={setShowVisualizer}
        isLoading={isLoading}
        onAdminUnlock={handleAdminUnlock}
        likedTrackIds={likedTrackIds}
        onToggleLike={toggleLikeTrack}
        downloadingIds={downloadingIds}
        onDownload={downloadTrack}
      />

      {/* Barra de Navegación Móvil */}
      <div className="mobile-nav">
        <button 
          onClick={() => { setShowVisualizer(false); setCurrentTab('home'); }} 
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: (!showVisualizer && currentTab === 'home') ? 'var(--primary-hover)' : 'var(--text-muted)' }}
        >
          <Home size={18} />
          <span style={{ fontSize: '10px', fontWeight: '500' }}>Inicio</span>
        </button>
        <button 
          onClick={() => { setShowVisualizer(false); setCurrentTab('search'); }} 
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: (!showVisualizer && currentTab === 'search') ? 'var(--primary-hover)' : 'var(--text-muted)' }}
        >
          <Search size={18} />
          <span style={{ fontSize: '10px', fontWeight: '500' }}>Buscar</span>
        </button>
        <button 
          onClick={() => { setShowVisualizer(false); setCurrentTab('library'); }} 
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: (!showVisualizer && currentTab === 'library') ? 'var(--primary-hover)' : 'var(--text-muted)' }}
        >
          <Library size={18} />
          <span style={{ fontSize: '10px', fontWeight: '500' }}>Biblioteca</span>
        </button>
        <button 
          onClick={() => { setShowVisualizer(false); setCurrentTab('liked'); }} 
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: (!showVisualizer && currentTab === 'liked') ? 'var(--primary-hover)' : 'var(--text-muted)' }}
        >
          <Heart size={18} fill={(!showVisualizer && currentTab === 'liked') ? 'var(--primary-hover)' : 'none'} style={{ color: (!showVisualizer && currentTab === 'liked') ? 'var(--primary-hover)' : 'var(--text-muted)' }} />
          <span style={{ fontSize: '10px', fontWeight: '500' }}>Me Gusta</span>
        </button>
      </div>
    </div>
  );
}
