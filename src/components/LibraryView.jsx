import React from 'react';
import { Music, Play, Disc, Heart } from 'lucide-react';
import TrackList from './TrackList';

export default function LibraryView({
  tracks = [],
  currentTrack = null,
  isPlaying = false,
  onTrackSelect,
  onPlayAll,
  isConnected,
  isDemoMode,
  folderName,
  isLikedSongsView = false,
  likedTrackIds = [],
  onToggleLike = () => {},
  downloadingIds = [],
  onDownloadTrack = () => {}
}) {
  
  // Calcular tamaño total de la biblioteca
  const calculateTotalSize = () => {
    const bytes = tracks.reduce((sum, t) => sum + (t.size || 0), 0);
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      {/* Cabecera de Biblioteca */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: '24px',
        marginBottom: '30px',
        flexWrap: 'wrap'
      }}>
        {/* Imagen representativa */}
        <div style={{
          width: '180px',
          height: '180px',
          borderRadius: '16px',
          background: isLikedSongsView 
            ? 'linear-gradient(135deg, #7209b7, #f72585)' 
            : 'linear-gradient(135deg, #240046, var(--primary))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: isLikedSongsView 
            ? '0 10px 30px rgba(247, 37, 133, 0.4)' 
            : '0 10px 30px var(--primary-glow)',
          border: isLikedSongsView 
            ? '2px solid rgba(247, 37, 133, 0.5)' 
            : '2px solid rgba(157, 78, 221, 0.3)',
          flexShrink: 0
        }}>
          {isLikedSongsView ? (
            <Heart size={72} color="#fff" fill="#fff" style={{ opacity: 0.9 }} />
          ) : (
            <Music size={72} color="#fff" style={{ opacity: 0.8 }} />
          )}
        </div>

        {/* Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: isLikedSongsView ? '#f72585' : 'var(--primary-light)' }}>
            {isLikedSongsView ? 'Colección Personalizada' : 'Playlist de Google Drive'}
          </span>
          <h1 style={{ fontSize: '38px', fontWeight: '800', color: '#fff', margin: '4px 0', lineHeight: '1.1' }}>
            {isLikedSongsView ? 'Canciones que te gustan' : (isConnected ? folderName : isDemoMode ? 'Biblioteca Demo' : 'Tu Biblioteca')}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
            <span style={{ color: '#fff', fontWeight: '600' }}>MusicXpress</span>
            <span>•</span>
            <span>{tracks.length} canciones</span>
            <span>•</span>
            <span>Tamaño total: {calculateTotalSize()}</span>
          </div>
        </div>
      </div>

      {/* Controles de Biblioteca */}
      {(isConnected || isDemoMode) && tracks.length > 0 && (
        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
          <button
            onClick={onPlayAll}
            style={{
              background: 'var(--primary)',
              color: '#fff',
              padding: '12px 28px',
              borderRadius: '30px',
              fontWeight: '700',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 15px var(--primary-glow)',
              transition: 'transform 0.2s'
            }}
            className="glow-hover"
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Play size={16} fill="currentColor" /> Reproducir Todo
          </button>
        </div>
      )}

      {/* Lista de Canciones */}
      <TrackList
        tracks={tracks}
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onTrackSelect={onTrackSelect}
        likedTrackIds={likedTrackIds}
        onToggleLike={onToggleLike}
        downloadingIds={downloadingIds}
        onDownloadTrack={onDownloadTrack}
      />
    </div>
  );
}
