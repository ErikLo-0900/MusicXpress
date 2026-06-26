import React from 'react';
import { Home, Search, Library, Settings, Music, Disc, Radio, CloudLightning, Heart } from 'lucide-react';

export default function Sidebar({ 
  currentTab, 
  setCurrentTab, 
  isConnected, 
  isDemoMode,
  folderName
}) {
  const menuItems = [
    { id: 'home', label: 'Inicio', icon: Home },
    { id: 'search', label: 'Buscar', icon: Search },
    { id: 'library', label: 'Tu Biblioteca', icon: Library },
  ];

  return (
    <div className="desktop-sidebar" style={{
      width: 'var(--sidebar-width)',
      height: '100%',
      backgroundColor: 'var(--bg-sidebar)',
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid var(--border-color)',
      padding: '24px 16px',
      zIndex: 5
    }}>
      {/* Logo */}
      <div 
        onDoubleClick={() => {
          const pass = prompt('Contraseña de administrador:');
          if (pass === 'erison1') {
            setCurrentTab('settings');
          }
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '32px',
          padding: '0 8px',
          cursor: 'pointer'
        }}
        title="Administración"
      >
        <div style={{
          background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))',
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 15px var(--primary-glow)'
        }}>
          <Music size={20} color="#fff" />
        </div>
        <span style={{
          fontSize: '20px',
          fontWeight: '800',
          letterSpacing: '1px',
          background: 'linear-gradient(to right, #fff, var(--primary-light))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          MusicXpress
        </span>
      </div>

      {/* Navegación Principal */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '12px 16px',
                borderRadius: '8px',
                color: isActive ? '#fff' : 'var(--text-muted)',
                backgroundColor: isActive ? 'rgba(157, 78, 221, 0.15)' : 'transparent',
                fontWeight: isActive ? '600' : '500',
                fontSize: '14px',
                transition: 'all 0.2s ease',
                borderLeft: isActive ? '3px solid var(--primary-hover)' : '3px solid transparent'
              }}
              className={isActive ? '' : 'glow-hover'}
            >
              <Icon size={18} style={{ color: isActive ? 'var(--primary-hover)' : 'inherit' }} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div style={{
        margin: '24px 0',
        height: '1px',
        background: 'rgba(157, 78, 221, 0.15)'
      }} />

      {/* Playlist / Carpetas */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
        <span style={{
          fontSize: '11px',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          color: 'var(--text-muted)',
          fontWeight: '700',
          padding: '0 8px'
        }}>
          Playlists
        </span>
        
        {/* Playlist de canciones favoritas */}
        <button 
          onClick={() => setCurrentTab('liked')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '8px 12px',
            borderRadius: '6px',
            color: currentTab === 'liked' ? '#fff' : 'var(--text-muted)',
            backgroundColor: currentTab === 'liked' ? 'rgba(157, 78, 221, 0.12)' : 'transparent',
            fontSize: '13px',
            textAlign: 'left',
            width: '100%',
            marginBottom: '4px'
          }}
        >
          <Heart size={14} fill={currentTab === 'liked' ? 'var(--primary-hover)' : 'none'} style={{ color: 'var(--primary-hover)', flexShrink: 0 }} />
          <span>Canciones que te gustan</span>
        </button>

        {/* Playlist dinámica de Google Drive Folder o Demo */}
        {isConnected && folderName ? (
          <button 
            onClick={() => setCurrentTab('library')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '8px 12px',
              borderRadius: '6px',
              color: currentTab === 'library' ? '#fff' : 'var(--text-muted)',
              fontSize: '13px',
              textAlign: 'left'
            }}
          >
            <Disc size={14} style={{ color: 'var(--primary-hover)' }} />
            <span style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '180px'
            }}>
              📁 {folderName}
            </span>
          </button>
        ) : isDemoMode ? (
          <button 
            onClick={() => setCurrentTab('library')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '8px 12px',
              borderRadius: '6px',
              color: currentTab === 'library' ? '#fff' : 'var(--text-muted)',
              fontSize: '13px',
              textAlign: 'left'
            }}
          >
            <Radio size={14} style={{ color: 'var(--primary-hover)' }} />
            <span style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '180px'
            }}>
              📻 Música de Demo
            </span>
          </button>
        ) : (
          <div style={{
            fontSize: '12px',
            color: 'var(--text-muted)',
            padding: '0 8px',
            fontStyle: 'italic'
          }}>
            Conecta tu Drive para ver tus canciones...
          </div>
        )}
      </div>

      {/* Cloud Status Footer */}
      <div style={{
        marginTop: 'auto',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '10px',
        padding: '12px',
        border: '1px solid rgba(157, 78, 221, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
          <CloudLightning size={14} style={{ 
            color: isConnected ? '#4caf50' : isDemoMode ? 'var(--primary-hover)' : '#ffb703' 
          }} />
          <span style={{ fontWeight: '600' }}>Google Drive API</span>
        </div>
        <span style={{
          fontSize: '11px',
          color: 'var(--text-muted)'
        }}>
          {isConnected ? 'Sincronizado' : isDemoMode ? 'Modo Demo Activo' : 'Desconectado'}
        </span>
      </div>
    </div>
  );
}
