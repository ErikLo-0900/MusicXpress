import React, { useState } from 'react';
import { Search, Compass, Music } from 'lucide-react';
import TrackList from './TrackList';

export default function SearchView({ 
  tracks = [], 
  currentTrack = null, 
  isPlaying = false, 
  onTrackSelect,
  likedTrackIds = [],
  onToggleLike = () => {},
  downloadingIds = [],
  onDownloadTrack = () => {}
}) {
  const [query, setQuery] = useState('');

  // Filtrar canciones localmente
  const filteredTracks = tracks.filter(track => {
    const term = query.toLowerCase();
    return (
      track.title.toLowerCase().includes(term) ||
      track.artist.toLowerCase().includes(term) ||
      (track.album && track.album.toLowerCase().includes(term))
    );
  });

  const genres = [
    { name: 'Lo-Fi Chill', grad: 'linear-gradient(135deg, #7b2cbf, #240046)', tag: 'lo-fi' },
    { name: 'Synthwave', grad: 'linear-gradient(135deg, #ff007f, #3a0ca3)', tag: 'synthwave' },
    { name: 'Rock / Metal', grad: 'linear-gradient(135deg, #0b090a, #4a154b)', tag: 'rock' },
    { name: 'Acoustic / Indie', grad: 'linear-gradient(135deg, #8338ec, #ff006e)', tag: 'acoustic' },
    { name: 'Electrónica', grad: 'linear-gradient(135deg, #3a86c8, #8338ec)', tag: 'electronic' },
    { name: 'Jazz & Blues', grad: 'linear-gradient(135deg, #3d348b, #7678ed)', tag: 'jazz' }
  ];

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      {/* Barra de Búsqueda */}
      <div style={{
        position: 'sticky',
        top: 0,
        backgroundColor: 'var(--bg-base)',
        paddingBottom: '20px',
        zIndex: 4,
        display: 'flex',
        alignItems: 'center',
        width: '100%'
      }}>
        <div style={{
          position: 'relative',
          width: '100%',
          maxWidth: '450px'
        }}>
          <Search 
            size={18} 
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)'
            }} 
          />
          <input
            type="text"
            placeholder="¿Qué deseas escuchar hoy? (Buscar artista, título...)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px 12px 46px',
              fontSize: '14px',
              borderRadius: '24px',
              border: '1px solid rgba(157, 78, 221, 0.25)',
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#fff',
              outline: 'none',
              transition: 'all 0.3s'
            }}
            className="search-input"
          />
        </div>
      </div>

      {query ? (
        // Resultados de Búsqueda
        <div style={{ marginTop: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#fff', marginBottom: '12px' }}>
            Resultados para "{query}"
          </h2>
          {filteredTracks.length > 0 ? (
            <TrackList
              tracks={filteredTracks}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              onTrackSelect={onTrackSelect}
              likedTrackIds={likedTrackIds}
              onToggleLike={onToggleLike}
              downloadingIds={downloadingIds}
              onDownloadTrack={onDownloadTrack}
            />
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '60px 20px',
              color: 'var(--text-muted)',
              textAlign: 'center',
              gap: '12px'
            }}>
              <Compass size={40} style={{ opacity: 0.3, color: 'var(--primary)' }} />
              <p>No se encontraron canciones que coincidan con la búsqueda.</p>
            </div>
          )}
        </div>
      ) : (
        // Categorías de Exploración
        <div style={{ marginTop: '16px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#fff', marginBottom: '16px' }}>
            Explorar todo
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: '16px'
          }}>
            {genres.map((genre, idx) => (
              <div
                key={idx}
                onClick={() => setQuery(genre.tag)}
                style={{
                  background: genre.grad,
                  borderRadius: '12px',
                  height: '140px',
                  padding: '16px',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  border: '1px solid rgba(255, 255, 255, 0.05)'
                }}
                className="genre-card"
              >
                <span style={{
                  fontSize: '16px',
                  fontWeight: '700',
                  color: '#fff',
                  display: 'block',
                  lineHeight: '1.2'
                }}>
                  {genre.name}
                </span>
                
                {/* Icono de fondo girado */}
                <Music size={60} style={{
                  position: 'absolute',
                  right: '-15px',
                  bottom: '-15px',
                  opacity: 0.15,
                  transform: 'rotate(25deg)'
                }} />
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        .search-input:focus {
          border-color: var(--primary);
          box-shadow: 0 0 10px var(--primary-glow);
          background: rgba(255, 255, 255, 0.08);
        }
        .genre-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(157, 78, 221, 0.2);
        }
      `}</style>
    </div>
  );
}
