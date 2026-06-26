import React from 'react';
import { 
  Play, Pause, SkipForward, SkipBack, Shuffle, Repeat, 
  Volume2, VolumeX, Maximize2, Minimize2, Music, Heart, Download
} from 'lucide-react';

export default function Player({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  shuffle,
  repeat,
  onPlayPause,
  onNext,
  onPrev,
  onSeek,
  onVolumeChange,
  onToggleShuffle,
  onToggleRepeat,
  onToggleMute,
  showVisualizer,
  setShowVisualizer,
  isLoading,
  onAdminUnlock,
  likedTrackIds = [],
  onToggleLike = () => {},
  downloadingIds = [],
  onDownload = () => {}
}) {

  // Formatea segundos en mm:ss
  const formatTime = (time) => {
    if (isNaN(time)) return '00:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Manejar cambio en la barra de progreso
  const handleProgressChange = (e) => {
    const newTime = parseFloat(e.target.value);
    onSeek(newTime);
  };

  const percent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="music-player">
      {/* SECCIÓN CANCIÓN (IZQUIERDA) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '0' }}>
        {currentTrack ? (
          <>
            {/* Portada de disco giratoria */}
            <div 
              onDoubleClick={onAdminUnlock}
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #531b93, var(--primary))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 12px var(--primary-glow)',
                border: '2px solid rgba(157, 78, 221, 0.4)',
                flexShrink: 0,
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer'
              }}
              className={isPlaying ? 'animate-spin-slow' : ''}
              title="Doble clic para administración"
            >
              {/* Centro de vinilo */}
              <div style={{
                position: 'absolute',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-player)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                zIndex: 2
              }} />
              
              <Music size={24} color="#fff" style={{ opacity: 0.8 }} />
            </div>

            {/* Texto de Canción */}
            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <span style={{ 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#fff',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {currentTrack.title}
              </span>
              <span style={{ 
                fontSize: '12px', 
                color: 'var(--text-muted)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                marginTop: '2px'
              }}>
                {isLoading ? '📥 Descargando de Google Drive...' : currentTrack.artist}
              </span>
            </div>
            {/* Botón de favoritos (Me Gusta) */}
            <button
              onClick={() => onToggleLike(currentTrack.id)}
              style={{
                color: likedTrackIds.includes(currentTrack.id) ? 'var(--primary-hover)' : 'var(--text-muted)',
                marginLeft: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
              className="glow-hover"
              title={likedTrackIds.includes(currentTrack.id) ? 'Quitar de favoritos' : 'Guardar en tus favoritos'}
            >
              <Heart 
                size={18} 
                fill={likedTrackIds.includes(currentTrack.id) ? 'var(--primary-hover)' : 'none'} 
              />
            </button>

            {/* Botón de descargar */}
            <button
              onClick={() => onDownload(currentTrack)}
              disabled={downloadingIds.includes(currentTrack.id)}
              style={{
                color: downloadingIds.includes(currentTrack.id) ? 'var(--primary)' : 'var(--text-muted)',
                marginLeft: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
              className="glow-hover"
              title="Descargar esta canción"
            >
              {downloadingIds.includes(currentTrack.id) ? (
                <div style={{
                  width: '18px',
                  height: '18px',
                  border: '2px solid rgba(157, 78, 221, 0.2)',
                  borderTop: '2px solid var(--primary)',
                  borderRadius: '50%',
                  animation: 'spin-slow 1s linear infinite'
                }} />
              ) : (
                <Download size={18} />
              )}
            </button>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)', fontSize: '13px' }}>
            <div 
              onDoubleClick={onAdminUnlock}
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px dashed rgba(157, 78, 221, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title="Doble clic para administración"
            >
              <Music size={20} style={{ opacity: 0.3 }} />
            </div>
            <span>Ninguna canción seleccionada</span>
          </div>
        )}
      </div>

      {/* CONTROLES DE REPRODUCCIÓN (CENTRO) */}
      <div className="desktop-only" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        width: '40%',
        maxWidth: '500px'
      }}>
        {/* Botones de Control */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button 
            onClick={onToggleShuffle} 
            style={{ color: shuffle ? 'var(--primary-hover)' : 'var(--text-muted)' }}
            className="glow-hover"
            title="Aleatorio"
          >
            <Shuffle size={16} />
          </button>
          
          <button 
            onClick={onPrev} 
            style={{ color: 'var(--text-main)' }}
            className="glow-hover"
            title="Anterior"
          >
            <SkipBack size={20} fill="currentColor" />
          </button>
          
          <button
            onClick={onPlayPause}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: '#fff',
              color: '#000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 10px rgba(255, 255, 255, 0.3)',
              transform: 'scale(1)',
              transition: 'transform 0.1s ease'
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            title={isPlaying ? 'Pausar' : 'Reproducir'}
          >
            {isLoading ? (
              <div style={{
                width: '18px',
                height: '18px',
                border: '2px solid rgba(0,0,0,0.1)',
                borderTop: '2px solid #000',
                borderRadius: '50%',
                animation: 'spin-slow 1s linear infinite'
              }} />
            ) : isPlaying ? (
              <Pause size={18} fill="currentColor" />
            ) : (
              <Play size={18} fill="currentColor" style={{ marginLeft: '2px' }} />
            )}
          </button>
          
          <button 
            onClick={onNext} 
            style={{ color: 'var(--text-main)' }}
            className="glow-hover"
            title="Siguiente"
          >
            <SkipForward size={20} fill="currentColor" />
          </button>
          
          <button 
            onClick={onToggleRepeat} 
            style={{ color: repeat ? 'var(--primary-hover)' : 'var(--text-muted)' }}
            className="glow-hover"
            title="Repetir"
          >
            <Repeat size={16} />
          </button>
        </div>

        {/* Barra de progreso */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', width: '35px', textAlign: 'right' }}>
            {formatTime(currentTime)}
          </span>
          
          <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleProgressChange}
              style={{
                width: '100%',
                height: '4px',
                borderRadius: '2px',
                cursor: 'pointer',
                accentColor: 'var(--primary)',
                background: `linear-gradient(to right, var(--primary) ${percent}%, rgba(255,255,255,0.1) ${percent}%)`,
                outline: 'none',
                WebkitAppearance: 'none'
              }}
              className="player-slider"
            />
          </div>
          
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', width: '35px', textAlign: 'left' }}>
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* CONTROLES DE VOLUMEN / ACCIONES (DERECHA) */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'flex-end', 
        gap: '16px', 
        width: 'auto', 
        minWidth: '0' 
      }}>
        {/* Controles móviles compactos */}
        <div className="mobile-only" style={{ alignItems: 'center', gap: '12px', marginRight: '8px' }}>
          <button
            onClick={onPlayPause}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#fff',
              color: '#000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 8px rgba(255,255,255,0.2)'
            }}
          >
            {isLoading ? (
              <div style={{
                width: '14px',
                height: '14px',
                border: '2px solid rgba(0,0,0,0.1)',
                borderTop: '2px solid #000',
                borderRadius: '50%',
                animation: 'spin-slow 1s linear infinite'
              }} />
            ) : isPlaying ? (
              <Pause size={16} fill="currentColor" />
            ) : (
              <Play size={16} fill="currentColor" style={{ marginLeft: '2px' }} />
            )}
          </button>
          <button onClick={onNext} style={{ color: '#fff', display: 'flex', alignItems: 'center' }}>
            <SkipForward size={20} fill="currentColor" />
          </button>
        </div>

        {/* Botón para expandir visualizador */}
        <button 
          onClick={() => setShowVisualizer(!showVisualizer)}
          style={{ 
            color: showVisualizer ? 'var(--primary-hover)' : 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: '600'
          }}
          className="glow-hover"
          title={showVisualizer ? 'Cerrar Visualizador' : 'Abrir Visualizador'}
        >
          {showVisualizer ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          <span style={{ display: 'none' }}>Visualizador</span>
        </button>

        {/* Volumen en Escritorio */}
        <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              onClick={onToggleMute} 
              style={{ color: isMuted ? '#ffb703' : 'var(--text-muted)' }}
            >
              {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              style={{
                width: '80px',
                height: '4px',
                cursor: 'pointer',
                accentColor: 'var(--primary)',
                background: `linear-gradient(to right, var(--primary) ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.1) ${(isMuted ? 0 : volume) * 100}%)`,
                outline: 'none',
                WebkitAppearance: 'none'
              }}
            />
          </div>
        </div>
      </div>

      {/* Custom Styles for input range sliders */}
      <style>{`
        .player-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 0px;
          height: 0px;
          border-radius: 50%;
          background: #fff;
          transition: all 0.1s ease;
          box-shadow: 0 0 5px rgba(0,0,0,0.5);
        }
        .player-slider:hover::-webkit-slider-thumb {
          width: 12px;
          height: 12px;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--primary-light);
        }
      `}</style>
    </div>
  );
}
