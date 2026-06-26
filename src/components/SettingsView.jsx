import React from 'react';
import DriveConnector from './DriveConnector';
import { ShieldAlert } from 'lucide-react';

// Icono SVG personalizado de GitHub para evitar fallas de exportación en lucide
const GitHubIcon = ({ size = 16 }) => (
  <svg 
    height={size} 
    width={size} 
    viewBox="0 0 16 16" 
    fill="currentColor"
    style={{ display: 'inline-block', verticalAlign: 'text-bottom' }}
  >
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
  </svg>
);


export default function SettingsView({
  clientId,
  setClientId,
  folderId,
  setFolderId,
  isConnected,
  onConnect,
  onDisconnect,
  isDemoMode,
  setUseDemoMode
}) {
  
  const handleClearCache = () => {
    if (window.confirm('¿Estás seguro de que deseas restablecer la aplicación? Esto borrará tus credenciales guardadas en local.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', animation: 'fadeIn 0.3s ease-out' }}>
      <div>
        <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px', color: '#fff' }}>
          Configuración
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          Configura tus llaves de Google Drive y personaliza tu reproductor.
        </p>
      </div>

      <DriveConnector
        clientId={clientId}
        setClientId={setClientId}
        folderId={folderId}
        setFolderId={setFolderId}
        isConnected={isConnected}
        onConnect={onConnect}
        onDisconnect={onDisconnect}
        isDemoMode={isDemoMode}
        setUseDemoMode={setUseDemoMode}
      />

      {/* Otras Opciones de Configuración */}
      <div className="glass" style={{
        padding: '24px',
        borderRadius: '16px',
        maxWidth: '600px',
        width: '100%',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', borderBottom: '1px solid rgba(157, 78, 221, 0.1)', paddingBottom: '10px' }}>
          Opciones Adicionales
        </h3>

        {/* Borrar caché */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>Restablecer Aplicación</h4>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Borra el Client ID, el Folder ID y desconecta tus cuentas del almacenamiento local.</p>
          </div>
          <button
            onClick={handleClearCache}
            style={{
              background: 'rgba(230, 57, 70, 0.1)',
              border: '1px solid #e63946',
              color: '#e63946',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
          >
            Borrar Todo
          </button>
        </div>

        {/* GitHub Info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>Código Abierto (Open Source)</h4>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Esta página es 100% estática y segura. Puedes auditar su código o subir tu propia versión a tu repositorio.</p>
          </div>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#fff',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              textDecoration: 'none',
              transition: 'all 0.2s'
            }}
            className="glow-hover"
          >
            <GitHubIcon size={16} /> GitHub
          </a>
        </div>
      </div>
      
      {/* Aviso de Privacidad y Seguridad */}
      <div style={{
        maxWidth: '600px',
        width: '100%',
        margin: '0 auto',
        display: 'flex',
        gap: '12px',
        padding: '0 8px',
        fontSize: '11px',
        color: 'var(--text-muted)',
        lineHeight: '1.4'
      }}>
        <ShieldAlert size={18} style={{ color: 'var(--primary-hover)', flexShrink: 0 }} />
        <div>
          <strong style={{ color: '#fff' }}>Nota sobre Privacidad:</strong> Tus datos de autenticación no se envían a ningún servidor de terceros. Toda la autenticación de Google se gestiona directamente en tu navegador y el token de acceso se almacena en memoria volátil de JavaScript, borrándose automáticamente al cerrar o recargar la pestaña.
        </div>
      </div>
    </div>
  );
}
