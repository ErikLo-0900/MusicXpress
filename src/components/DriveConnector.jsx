import React, { useState } from 'react';
import { Key, Folder, CheckCircle, AlertTriangle, HelpCircle, LogOut } from 'lucide-react';

export default function DriveConnector({ 
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
  const [showHelp, setShowHelp] = useState(false);
  const [tempClientId, setTempClientId] = useState(clientId || '');
  const [tempFolderId, setTempFolderId] = useState(folderId || '');

  const handleSave = (e) => {
    e.preventDefault();
    setClientId(tempClientId);
    setFolderId(tempFolderId);
    
    // Almacenar localmente
    localStorage.setItem('mx_client_id', tempClientId);
    localStorage.setItem('mx_folder_id', tempFolderId);
    
    alert('Configuración guardada correctamente.');
  };

  return (
    <div className="glass" style={{
      padding: '24px',
      borderRadius: '16px',
      maxWidth: '600px',
      width: '100%',
      margin: '0 auto',
      animation: 'fadeIn 0.3s ease-out'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-main)' }}>
          Configuración de Google Drive
        </h2>
        <button 
          onClick={() => setShowHelp(!showHelp)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            color: 'var(--primary-hover)',
            fontWeight: '500'
          }}
        >
          <HelpCircle size={16} />
          {showHelp ? 'Ocultar Ayuda' : '¿Cómo configurar?'}
        </button>
      </div>

      {showHelp && (
        <div style={{
          background: 'rgba(157, 78, 221, 0.1)',
          border: '1px dashed var(--primary)',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '20px',
          fontSize: '13px',
          lineHeight: '1.6',
          color: 'var(--text-muted)'
        }}>
          <h3 style={{ color: 'var(--text-main)', fontWeight: '600', marginBottom: '8px' }}>
            Pasos para obtener tus credenciales:
          </h3>
          <ol style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li>
              Ve a <a href="https://console.cloud.google.com/" target="_blank" rel="noreferrer" style={{ color: 'var(--primary-hover)', textDecoration: 'underline' }}>Google Cloud Console</a> y crea un nuevo proyecto.
            </li>
            <li>
              Busca y activa la <strong>Google Drive API</strong> en la biblioteca de APIs.
            </li>
            <li>
              Configura la "OAuth Consent Screen" (Pantalla de consentimiento) como <strong>Externo</strong>. Añade tu correo como usuario de prueba y agrega el permiso (scope) <code>.../auth/drive.readonly</code>.
            </li>
            <li>
              Ve a <strong>Credenciales</strong>, haz clic en <i>Crear Credenciales</i> y elige <strong>ID de cliente de OAuth</strong> (Aplicación Web).
            </li>
            <li>
              Añade los Orígenes de JavaScript autorizados:
              <ul style={{ paddingLeft: '16px', margin: '4px 0' }}>
                <li><code>http://localhost:5173</code> (para desarrollo local)</li>
                <li>Tu enlace de GitHub Pages: <code>https://tu-usuario.github.io</code></li>
              </ul>
            </li>
            <li>
              Copia el <strong>ID de cliente</strong> y pégalo abajo.
            </li>
            <li>
              En Google Drive, abre la carpeta que contiene tu música, copia el ID desde la barra de direcciones de tu navegador (ej. todo lo que va después de <code>/folders/<strong>ID_AQUÍ</strong></code>) y pégalo abajo.
            </li>
          </ol>
        </div>
      )}

      {/* Selector de Modo Demo */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '8px',
        padding: '12px 16px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        border: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <div>
          <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>Modo Demostración</h4>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Utiliza música de prueba libre de derechos si aún no tienes tus credenciales.</p>
        </div>
        <button
          onClick={() => {
            const val = !isDemoMode;
            setUseDemoMode(val);
            if (val) {
              onDisconnect(); // Desconectar Drive al activar Demo
            }
          }}
          style={{
            background: isDemoMode ? 'var(--primary)' : 'rgba(255, 255, 255, 0.1)',
            color: '#fff',
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600',
            transition: 'all 0.3s ease',
            boxShadow: isDemoMode ? '0 0 10px var(--primary-glow)' : 'none'
          }}
        >
          {isDemoMode ? 'Activo' : 'Activar'}
        </button>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Key size={14} /> ID de Cliente de Google OAuth
          </label>
          <input
            type="text"
            value={tempClientId}
            onChange={(e) => setTempClientId(e.target.value)}
            placeholder="xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com"
            disabled={isConnected}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Folder size={14} /> ID de la Carpeta de Música (Google Drive)
          </label>
          <input
            type="text"
            value={tempFolderId}
            onChange={(e) => setTempFolderId(e.target.value)}
            placeholder="1A2B3C4D5E6F7G8H9I0J..."
            disabled={isConnected}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          {!isConnected && (
            <button
              type="submit"
              style={{
                flex: 1,
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(157, 78, 221, 0.3)',
                color: '#fff',
                padding: '10px',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '14px',
                textAlign: 'center',
                transition: 'all 0.2s ease'
              }}
              className="glow-hover"
            >
              Guardar Configuración
            </button>
          )}

          {clientId && folderId && !isDemoMode && (
            <button
              type="button"
              onClick={isConnected ? onDisconnect : onConnect}
              style={{
                flex: 1.5,
                background: isConnected ? '#e63946' : 'var(--primary)',
                color: '#fff',
                padding: '10px',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '14px',
                textAlign: 'center',
                boxShadow: isConnected ? 'none' : '0 0 15px var(--primary-glow)',
                transition: 'all 0.2s'
              }}
              className={isConnected ? '' : 'glow-hover'}
            >
              {isConnected ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <LogOut size={16} /> Desconectar Google Drive
                </span>
              ) : (
                'Iniciar Sesión con Google'
              )}
            </button>
          )}
        </div>
      </form>

      <div style={{ marginTop: '24px', borderTop: '1px solid rgba(157, 78, 221, 0.1)', paddingTop: '20px' }}>
        <h4 style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '8px' }}>
          Estado de la Conexión:
        </h4>
        {isConnected ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4caf50', fontSize: '14px', fontWeight: '500' }}>
            <CheckCircle size={18} />
            Conectado a Google Drive
          </div>
        ) : isDemoMode ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-hover)', fontSize: '14px', fontWeight: '500' }}>
            <CheckCircle size={18} />
            Corriendo en Modo Demostración
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffb703', fontSize: '14px', fontWeight: '500' }}>
            <AlertTriangle size={18} />
            Desconectado. Ingresa tus credenciales o activa el Modo Demostración.
          </div>
        )}
      </div>
    </div>
  );
}
