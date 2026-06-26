import React from 'react';
import { Play, Pause, Music, Disc, Clock, Heart, Download } from 'lucide-react';

export default function TrackList({ 
  tracks = [], 
  currentTrack = null, 
  isPlaying = false, 
  onTrackSelect,
  likedTrackIds = [],
  onToggleLike = () => {},
  downloadingIds = [],
  onDownloadTrack = () => {}
}) {
  
  const formatSize = (bytes) => {
    if (!bytes) return '--';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  if (tracks.length === 0) {
    return (
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
        <Music size={48} style={{ opacity: 0.3, color: 'var(--primary)' }} />
        <p style={{ fontSize: '15px' }}>No hay canciones disponibles en esta vista.</p>
        <p style={{ fontSize: '12px' }}>Asegúrate de conectar Google Drive con música o activar el Modo Demo en Ajustes.</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', overflowX: 'auto', marginTop: '16px' }}>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        textAlign: 'left',
        fontSize: '14px'
      }}>
        <thead>
          <tr style={{
            borderBottom: '1px solid rgba(157, 78, 221, 0.15)',
            color: 'var(--text-muted)',
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            <th style={{ padding: '12px 8px', width: '50px', textAlign: 'center' }}>#</th>
            <th style={{ padding: '12px 16px' }}>Título</th>
            <th className="hide-mobile" style={{ padding: '12px 16px' }}>Álbum / Origen</th>
            <th className="hide-mobile" style={{ padding: '12px 16px', width: '120px' }}>Tamaño</th>
            <th style={{ padding: '12px 8px', width: '80px', textAlign: 'center' }}>Acciones</th>
            <th style={{ padding: '12px 16px', width: '60px', textAlign: 'center' }}>
              <Clock size={16} />
            </th>
          </tr>
        </thead>
        <tbody>
          {tracks.map((track, index) => {
            const isCurrent = currentTrack && currentTrack.id === track.id;
            
            return (
              <tr 
                key={track.id}
                onClick={() => onTrackSelect(track, tracks)}
                style={{
                  borderBottom: '1px solid rgba(255, 255, 255, 0.02)',
                  cursor: 'pointer',
                  borderRadius: '6px',
                  transition: 'all 0.2s ease',
                  backgroundColor: isCurrent ? 'rgba(157, 78, 221, 0.08)' : 'transparent'
                }}
                className="track-row"
              >
                {/* Play icon or Number */}
                <td style={{ 
                  padding: '12px 8px', 
                  textAlign: 'center', 
                  color: isCurrent ? 'var(--primary-hover)' : 'var(--text-muted)'
                }}>
                  <div style={{ position: 'relative', width: '24px', height: '24px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="track-number" style={{ display: isCurrent ? 'none' : 'block' }}>
                      {index + 1}
                    </span>
                    <span className="track-play-icon" style={{ display: isCurrent ? 'block' : 'none' }}>
                      {isCurrent && isPlaying ? (
                        <Pause size={14} fill="currentColor" />
                      ) : (
                        <Play size={14} fill="currentColor" />
                      )}
                    </span>
                  </div>
                </td>
                
                {/* Title & Artist */}
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ 
                      fontWeight: '500', 
                      color: isCurrent ? 'var(--primary-hover)' : 'var(--text-main)',
                      fontSize: '15px'
                    }}>
                      {track.title}
                    </span>
                    <span style={{ 
                      fontSize: '13px', 
                      color: 'var(--text-muted)',
                      marginTop: '2px'
                    }}>
                      {track.artist}
                    </span>
                  </div>
                </td>
                
                {/* Album */}
                <td className="hide-mobile" style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Disc size={14} style={{ opacity: 0.5 }} />
                    <span>{track.album}</span>
                  </div>
                </td>
                
                {/* Size */}
                <td className="hide-mobile" style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>
                  {formatSize(track.size)}
                </td>
                
                {/* Actions (Like & Download) */}
                <td style={{ padding: '12px 8px' }}>
                  <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', alignItems: 'center' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleLike(track.id);
                      }}
                      style={{
                        color: likedTrackIds.includes(track.id) ? 'var(--primary-hover)' : 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'transform 0.2s ease'
                      }}
                      className={`like-btn ${likedTrackIds.includes(track.id) ? 'liked' : ''}`}
                      title={likedTrackIds.includes(track.id) ? 'Quitar de favoritos' : 'Guardar en favoritos'}
                    >
                      <Heart 
                        size={14} 
                        fill={likedTrackIds.includes(track.id) ? 'var(--primary-hover)' : 'none'} 
                      />
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDownloadTrack(track);
                      }}
                      disabled={downloadingIds.includes(track.id)}
                      style={{
                        color: downloadingIds.includes(track.id) ? 'var(--primary)' : 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'transform 0.2s ease'
                      }}
                      className="download-btn"
                      title="Descargar canción"
                    >
                      {downloadingIds.includes(track.id) ? (
                        <div style={{
                          width: '12px',
                          height: '12px',
                          border: '2px solid rgba(157, 78, 221, 0.2)',
                          borderTop: '2px solid var(--primary)',
                          borderRadius: '50%',
                          animation: 'spin-slow 1s linear infinite'
                        }} />
                      ) : (
                        <Download size={14} />
                      )}
                    </button>
                  </div>
                </td>

                {/* Duration */}
                <td style={{ padding: '12px 16px', color: 'var(--text-muted)', textAlign: 'center' }}>
                  {track.duration || '--:--'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      {/* Styles for row hover play icon toggle */}
      <style>{`
        .track-row .like-btn, .track-row .download-btn {
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        .track-row:hover .like-btn, .track-row:hover .download-btn, .track-row .like-btn.liked {
          opacity: 1;
        }
        .track-row:hover {
          background-color: rgba(255, 255, 255, 0.05) !important;
        }
        .track-row:hover .track-number {
          display: none !important;
        }
        .track-row:hover .track-play-icon {
          display: block !important;
          color: var(--primary-hover);
        }
      `}</style>
    </div>
  );
}
