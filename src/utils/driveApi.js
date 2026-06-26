/**
 * Utilidades para interactuar con la API de Google Drive v3
 */

// Alcances (scopes) necesarios para leer archivos
export const SCOPES = 'https://www.googleapis.com/auth/drive.readonly';

/**
 * Obtiene la URL de streaming para un archivo de audio.
 * @param {string} fileId - ID del archivo en Google Drive.
 * @param {string} accessToken - Token de acceso OAuth2.
 * @returns {string} URL de streaming directa para la etiqueta <audio>.
 */
export function getStreamUrl(fileId, accessToken) {
  if (!fileId || !accessToken) return '';
  return `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&access_token=${accessToken}`;
}

/**
 * Obtiene la información (metadatos) de una carpeta.
 * @param {string} folderId - ID de la carpeta en Google Drive.
 * @param {string} accessToken - Token de acceso OAuth2.
 * @returns {Promise<Object>} Datos de la carpeta.
 */
export async function getFolderMetadata(folderId, accessToken) {
  if (!folderId || !accessToken) return null;
  
  try {
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${folderId}?fields=id,name`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Error al obtener metadatos de la carpeta');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error in getFolderMetadata:', error);
    throw error;
  }
}

/**
 * Obtiene la lista de archivos de audio dentro de una carpeta o de todo el Drive.
 * @param {string} accessToken - Token de acceso OAuth2.
 * @param {string} [folderId] - ID de la carpeta (opcional).
 * @returns {Promise<Array>} Lista de objetos de canciones formateados.
 */
export async function listAudioFiles(accessToken, folderId = null) {
  if (!accessToken) return [];
  
  // Construir la consulta q para Google Drive API
  // Buscamos archivos que tengan mimeType de audio y que no estén en la papelera
  let query = "mimeType contains 'audio/' and trashed = false";
  
  if (folderId) {
    // Si hay una carpeta específica, buscamos archivos cuyos padres incluyan esa carpeta
    query = `'${folderId}' in parents and ${query}`;
  }
  
  let files = [];
  let nextPageToken = null;
  
  try {
    do {
      let url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=nextPageToken,files(id,name,mimeType,size,createdTime)&pageSize=100`;
      if (nextPageToken) {
        url += `&pageToken=${nextPageToken}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error?.message || 'Error al listar archivos de Google Drive');
      }
      
      const data = await response.json();
      if (data.files) {
        files = [...files, ...data.files];
      }
      nextPageToken = data.nextPageToken;
    } while (nextPageToken);
    
    // Formatear los archivos para la aplicación
    return files.map(file => {
      // Intentar extraer artista y título del nombre del archivo (ej. "Artista - Cancion.mp3")
      // Quitar extensión del nombre del archivo
      const cleanName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      const parts = cleanName.split(' - ');
      
      let artist = 'Artista Desconocido';
      let title = cleanName;
      
      if (parts.length > 1) {
        artist = parts[0].trim();
        title = parts.slice(1).join(' - ').trim();
      }
      
      return {
        id: file.id,
        name: file.name,
        title: title,
        artist: artist,
        album: 'Google Drive',
        duration: null, // Se calculará al reproducir o cargar los metadatos de audio
        size: parseInt(file.size || 0),
        createdTime: file.createdTime,
        mimeType: file.mimeType
      };
    });
  } catch (error) {
    console.error('Error in listAudioFiles:', error);
    throw error;
  }
}

/**
 * Descarga un archivo de Google Drive como un objeto Blob de manera directa y segura.
 * Esto evita el bloqueo de redirecciones y cookies de terceros en navegadores como Brave/Safari.
 * @param {string} fileId - ID del archivo de Google Drive.
 * @param {string} accessToken - Token de acceso de Google.
 * @returns {Promise<Blob>} El contenido del archivo como un Blob.
 */
export async function fetchAudioBlob(fileId, accessToken) {
  if (!fileId || !accessToken) throw new Error('Credenciales incompletas');
  
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    }
  );
  
  if (!response.ok) {
    throw new Error('Error al descargar el archivo de audio de Google Drive');
  }
  
  return await response.blob();
}

