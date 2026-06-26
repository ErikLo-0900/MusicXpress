import React from 'react';
import { Play, Music, Radio, Key, FolderOpen, LogIn, Heart } from 'lucide-react';

export default function HomeView({ 
  isConnected, 
  isDemoMode, 
  tracksCount, 
  folderName,
  onPlayAll,
  setCurrentTab,
  recentTracks = [],
  currentTrack = null,
  isPlaying = false,
  onTrackSelect,
  likedTrackIds = [],
  onToggleLike = () => {}
}) {
  
  // Saludo dinámico según la hora local
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return '¡Buenos días!';
    if (hour >= 12 && hour < 20) return '¡Buenas tardes!';
    return '¡Buenas noches!';
  };

  const steps = [
    {
      title: '1. Ajustes del Cliente',
      desc: 'Ingresa tu Client ID de Google OAuth en la pestaña de Ajustes.',
      icon: Key,
      color: '#e0aaff'
    },
    {
      title: '2. Selecciona Carpeta',
      desc: 'Copia y pega el ID de tu carpeta de música de Google Drive.',
      icon: FolderOpen,
      color: '#c77dff'
    },
    {
      title: '3. Inicia Sesión',
      desc: 'Conéctate de manera segura usando tu cuenta de Google.',
      icon: LogIn,
      color: '#9d4edd'
    }
  ];

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      {/* Saludo */}
      <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '24px', color: '#fff' }}>
        {getGreeting()}
      </h1>

      {/* Tarjeta de bienvenida destacada */}
      <div 
        className="glass" 
        style={{
          borderRadius: '16px',
          padding: '32px',
          background: 'linear-gradient(135deg, rgba(83, 27, 147, 0.4), rgba(157, 78, 221, 0.15))',
          border: '1px solid rgba(157, 78, 221, 0.25)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '24px',
          marginBottom: '32px',
          boxShadow: '0 8px 32px rgba(157, 78, 221, 0.1)'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '500px' }}>
          <span style={{ 
            fontSize: '12px', 
            fontWeight: '700', 
            textTransform: 'uppercase', 
            letterSpacing: '1.5px', 
            color: 'var(--primary-light)'
          }}>
            Playlist Destacada
          </span>
          <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#fff' }}>
            {isConnected ? `Carpeta: ${folderName}` : isDemoMode ? 'Modo Demostración' : 'Conecta tu Biblioteca'}
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            {isConnected 
              ? `Reproduce los ${tracksCount} archivos de audio escaneados desde tu carpeta específica de Google Drive.`
              : isDemoMode 
                ? 'Reproduce una selección preestablecida de pistas libres de derechos de autor para probar la experiencia.'
                : 'Escucha tu música directamente desde tu Google Drive. Configura tus llaves de acceso en la pestaña de Ajustes.'}
          </p>
        </div>
        
        {(isConnected || isDemoMode) && tracksCount > 0 && (
          <button
            onClick={onPlayAll}
            style={{
              background: '#fff',
              color: '#000',
              padding: '16px 28px',
              borderRadius: '30px',
              fontWeight: '700',
              fontSize: '15px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 10px 25px rgba(255, 255, 255, 0.15)',
              transition: 'transform 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Play size={18} fill="currentColor" /> Reproducir Todo
          </button>
        )}
      </div>

      {/* Grid de Secciones Rápidas */}
      <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px', color: '#fff' }}>
        Acceso Rápido
      </h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '40px'
      }}>
        {/* Tarjeta 1 */}
        <div 
          onClick={() => setCurrentTab(isConnected || isDemoMode ? 'library' : 'settings')}
          className="glass glow-hover" 
          style={{
            borderRadius: '12px',
            padding: '20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}
        >
          <div style={{
            background: 'rgba(157, 78, 221, 0.2)',
            width: '44px',
            height: '44px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Music size={20} color="var(--primary-hover)" />
          </div>
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#fff' }}>Mi Biblioteca</h4>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {tracksCount} canciones listadas
            </span>
          </div>
        </div>

        {/* Tarjeta 2 */}
        <div 
          onClick={() => setCurrentTab('search')}
          className="glass glow-hover" 
          style={{
            borderRadius: '12px',
            padding: '20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}
        >
          <div style={{
            background: 'rgba(157, 78, 221, 0.2)',
            width: '44px',
            height: '44px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Radio size={20} color="var(--primary-hover)" />
          </div>
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#fff' }}>Buscador</h4>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Buscar archivos de audio</span>
          </div>
        </div>
      </div>

      {/* Sección de Reproducido Recientemente */}
      {recentTracks && recentTracks.length > 0 && (
        <div style={{ marginBottom: '40px', animation: 'fadeIn 0.3s ease-out' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px', color: '#fff' }}>
            Escuchado Recientemente
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '16px'
          }}>
            {recentTracks.map((track) => {
              const isCurrent = currentTrack && currentTrack.id === track.id;
              const isLiked = likedTrackIds.includes(track.id);
              
              return (
                <div
                  key={track.id}
                  onClick={() => onTrackSelect(track, recentTracks)}
                  className="glass"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    border: isCurrent ? '1px solid var(--primary-hover)' : '1px solid rgba(255, 255, 255, 0.05)',
                    backgroundColor: isCurrent ? 'rgba(157, 78, 221, 0.08)' : 'rgba(18, 12, 30, 0.4)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.borderColor = 'var(--primary)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(157, 78, 221, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.borderColor = isCurrent ? 'var(--primary-hover)' : 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '0', flex: 1 }}>
                    {/* Icono de vinilo */}
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #240046, var(--primary))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      position: 'relative'
                    }}
                    className={isCurrent && isPlaying ? 'animate-spin-slow' : ''}
                    >
                      <div style={{
                        position: 'absolute',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#08060c'
                      }} />
                      <Music size={16} color="#fff" style={{ opacity: 0.6 }} />
                    </div>
                    
                    {/* Título & Artista */}
                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: '0' }}>
                      <span style={{
                        fontWeight: '600',
                        fontSize: '14px',
                        color: isCurrent ? 'var(--primary-hover)' : '#fff',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {track.title}
                      </span>
                      <span style={{
                        fontSize: '12px',
                        color: 'var(--text-muted)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        marginTop: '2px'
                      }}>
                        {track.artist}
                      </span>
                    </div>
                  </div>

                  {/* Icono de corazón (favorito) */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleLike(track.id);
                    }}
                    style={{
                      color: isLiked ? 'var(--primary-hover)' : 'rgba(255, 255, 255, 0.15)',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginLeft: '8px'
                    }}
                    className="glow-hover"
                  >
                    <Heart size={14} fill={isLiked ? 'var(--primary-hover)' : 'none'} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sección de Onboarding si no está conectado */}
      {!isConnected && !isDemoMode && (
        <div style={{ marginTop: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: 'var(--text-muted)' }}>
            Cómo conectar tu música en 3 sencillos pasos:
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px'
          }}>
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              return (
                <div 
                  key={index}
                  className="glass" 
                  style={{
                    borderRadius: '12px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.03)'
                  }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(157, 78, 221, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `1px solid ${step.color}`
                  }}>
                    <StepIcon size={18} style={{ color: step.color }} />
                  </div>
                  <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#fff' }}>
                    {step.title}
                  </h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px' }}>
            <button
              onClick={() => setCurrentTab('settings')}
              style={{
                background: 'var(--primary)',
                color: '#fff',
                padding: '12px 32px',
                borderRadius: '30px',
                fontWeight: '600',
                fontSize: '14px',
                boxShadow: '0 0 15px var(--primary-glow)',
                transition: 'all 0.2s'
              }}
              className="glow-hover"
            >
              Ir a Configuración
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
