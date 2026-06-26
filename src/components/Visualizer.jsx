import React, { useEffect, useRef, useState } from 'react';

/**
 * Inicializa y conecta el analizador de audio al elemento <audio>.
 * Previene el error de "HTMLMediaElement already connected".
 */
function getOrCreateAnalyser(audioElement) {
  if (!audioElement) return null;
  
  if (window.audioAnalyser) {
    return window.audioAnalyser;
  }
  
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContextClass();
    const analyser = ctx.createAnalyser();
    
    // Configuración del analizador
    analyser.fftSize = 256; // 128 contenedores de frecuencia
    
    // Filtros del Ecualizador (Bajos, Medios, Agudos)
    const bass = ctx.createBiquadFilter();
    bass.type = 'lowshelf';
    bass.frequency.value = 200; // Bajos hasta 200Hz
    bass.gain.value = parseFloat(localStorage.getItem('mx_eq_bass') || '0');
    
    const mid = ctx.createBiquadFilter();
    mid.type = 'peaking';
    mid.Q.value = 1.0;
    mid.frequency.value = 1000; // Medios alrededor de 1000Hz
    mid.gain.value = parseFloat(localStorage.getItem('mx_eq_mid') || '0');
    
    const treble = ctx.createBiquadFilter();
    treble.type = 'highshelf';
    treble.frequency.value = 3000; // Agudos desde 3000Hz
    treble.gain.value = parseFloat(localStorage.getItem('mx_eq_treble') || '0');
    
    // Conectar en serie: source -> bass -> mid -> treble -> analyser -> destination
    const source = ctx.createMediaElementSource(audioElement);
    source.connect(bass);
    bass.connect(mid);
    mid.connect(treble);
    treble.connect(analyser);
    analyser.connect(ctx.destination);
    
    window.audioCtx = ctx;
    window.audioAnalyser = analyser;
    window.bassFilter = bass;
    window.midFilter = mid;
    window.trebleFilter = treble;
    
    return analyser;
  } catch (e) {
    console.error('Error al inicializar el contexto de audio:', e);
    return null;
  }
}

export default function Visualizer({ audioElement, isPlaying, themeColor = '#9d4edd' }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [visualizerType, setVisualizerType] = useState('bars'); // 'bars' o 'waves'
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!audioElement) return;

    let analyser = null;
    
    // Escuchar el evento de play para inicializar el contexto de audio
    // (los navegadores bloquean el AudioContext hasta que hay interacción del usuario)
    const handleStart = () => {
      analyser = getOrCreateAnalyser(audioElement);
      if (window.audioCtx && window.audioCtx.state === 'suspended') {
        window.audioCtx.resume();
      }
    };

    audioElement.addEventListener('play', handleStart);
    
    // Si ya está reproduciéndose, inicializar inmediatamente
    if (isPlaying) {
      handleStart();
    }

    return () => {
      audioElement.removeEventListener('play', handleStart);
    };
  }, [audioElement, isPlaying]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Ajustar resolución del canvas para pantallas retina
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * (window.devicePixelRatio || 1);
      canvas.height = rect.height * (window.devicePixelRatio || 1);
      ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const draw = () => {
      const analyser = window.audioAnalyser;
      const bufferLength = analyser ? analyser.frequencyBinCount : 128;
      const dataArray = new Uint8Array(bufferLength);
      
      if (analyser && isPlaying) {
        if (window.audioCtx && window.audioCtx.state === 'suspended') {
          window.audioCtx.resume();
        }
        
        if (visualizerType === 'bars') {
          analyser.getByteFrequencyData(dataArray);
        } else {
          analyser.getByteTimeDomainData(dataArray);
        }
      } else {
        // Generar un patrón estático suave o simulación de onda si no está reproduciendo
        for (let i = 0; i < bufferLength; i++) {
          dataArray[i] = visualizerType === 'bars' ? 0 : 128;
        }
      }

      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);

      // Limpiar lienzo con un negro translúcido para efecto estela
      ctx.fillStyle = 'rgba(8, 6, 12, 0.15)';
      ctx.fillRect(0, 0, width, height);

      if (visualizerType === 'bars') {
        // --- VISUALIZADOR DE BARRAS DE FRECUENCIA ---
        const barWidth = (width / bufferLength) * 1.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const percent = dataArray[i] / 255;
          const barHeight = percent * height * 0.8;

          // Crear degradado morado neón
          const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
          gradient.addColorStop(0, '#531b93'); // Púrpura oscuro en la base
          gradient.addColorStop(0.5, '#9d4edd'); // Morado medio
          gradient.addColorStop(1, '#c77dff'); // Morado brillante / neón en la punta

          ctx.fillStyle = gradient;
          
          // Dibujar barras redondeadas
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(x, height - barHeight, barWidth - 2, barHeight, [4, 4, 0, 0]);
          } else {
            ctx.rect(x, height - barHeight, barWidth - 2, barHeight);
          }
          ctx.fill();

          // Agregar un pequeño destello en las frecuencias altas/bajas con volumen alto
          if (percent > 0.8) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#e0aaff';
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x, height - barHeight - 2, barWidth - 2, 2);
            ctx.shadowBlur = 0; // Resetear sombra
          }

          x += barWidth;
        }
      } else {
        // --- VISUALIZADOR DE ONDA TEMPORAL (OSCILOSCOPIO) ---
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#c77dff';
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(157, 78, 221, 0.5)';
        
        ctx.beginPath();

        const sliceWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * height) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }

          x += sliceWidth;
        }

        ctx.lineTo(width, height / 2);
        ctx.stroke();
        ctx.shadowBlur = 0; // Resetear sombra
      }

      // Dibujar un círculo pulsante en el centro (Efecto ritmo)
      let sum = 0;
      for (let i = 0; i < 20; i++) { // Rango de bajos
        sum += dataArray[i] || 0;
      }
      const averageBass = sum / 20;
      const pulseFactor = 1 + (averageBass / 255) * 0.15;

      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.beginPath();
      ctx.arc(0, 0, 40 * pulseFactor, 0, 2 * Math.PI);
      
      // Degradado circular de fondo
      const radialGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, 50 * pulseFactor);
      radialGrad.addColorStop(0, 'rgba(157, 78, 221, 0.3)');
      radialGrad.addColorStop(0.8, 'rgba(157, 78, 221, 0.05)');
      radialGrad.addColorStop(1, 'rgba(157, 78, 221, 0)');
      
      ctx.fillStyle = radialGrad;
      ctx.fill();
      ctx.restore();

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, visualizerType]);

  const toggleType = () => {
    setVisualizerType(prev => prev === 'bars' ? 'waves' : 'bars');
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '120px' }}>
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          borderRadius: '12px',
          background: 'rgba(8, 6, 12, 0.3)'
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          display: 'flex',
          gap: '8px',
          zIndex: 10
        }}
      >
        <button
          onClick={toggleType}
          style={{
            background: 'rgba(157, 78, 221, 0.25)',
            border: '1px solid rgba(157, 78, 221, 0.4)',
            color: '#e0aaff',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: '600',
            backdropFilter: 'blur(4px)',
            transition: 'all 0.2s ease',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
          className="glow-hover"
        >
          {visualizerType === 'bars' ? 'Onda' : 'Barras'}
        </button>
      </div>
    </div>
  );
}
