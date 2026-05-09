/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Download, Code, Share2, LogIn, LogOut, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Layout } from './components/layout/Layout';
import { BlobViewer } from './components/blob/BlobViewer';
import { Slider } from './components/ui/Slider';
import { IconButton } from './components/ui/IconButton';
import { ColorPicker } from './components/ui/ColorPicker';
import { Button } from './components/ui/Button';
import { CodeModal } from './components/ui/CodeModal';
import { useBlobPhysics } from './hooks/useBlobPhysics';
import { useFirebase } from './hooks/useFirebase';
import { generateStaticBlobPath } from './services/blobUtils';

export default function App() {
  // Firebase Hook
  const { user, login, logout, presets, savePreset, deletePreset } = useFirebase();

  // Estado da aplicação
  const [complexity, setComplexity] = useState(12);
  const [contrast, setContrast] = useState(5);     
  const [stiffness, setStiffness] = useState(5);   
  const [gravityEnabled, setGravityEnabled] = useState(false); 
  const [color, setColor] = useState('#FF0066');   
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Estado do Mouse para Interatividade
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    // Mapeamos a posição do mouse para o sistema de coordenadas 500x500 do SVG
    const x = ((clientX - rect.left) / rect.width) * 500;
    const y = ((clientY - rect.top) / rect.height) * 500;
    
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos(null);
    setIsMouseDown(false);
  };

  // Gancho de Física em Tempo Real (Sistema Massa-Mola & Verlet)
  const blobPath = useBlobPhysics({
    size: 500,
    complexity,
    contrast,
    stiffness,
    gravityEnabled,
    mousePos,
    isMouseDown,
  });

  const handleRandomize = () => {
    setComplexity(Math.floor(Math.random() * 34) + 6);
    setContrast(Math.random() * 10);
    setStiffness(Math.floor(Math.random() * 9) + 1);
    const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    setColor(randomColor);
  };

  // Gera a string final do SVG para cópia e download
  const svgCode = `<svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">\n  <path fill="${color}" d="${blobPath}" />\n</svg>`;

  const handleDownload = () => {
    const blob = new Blob([svgCode], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'blob.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSave = async () => {
    if (!user) {
      login();
      return;
    }
    
    const name = presetName.trim() || `Blob ${new Date().toLocaleDateString()}`;
    setIsSaving(true);
    try {
      await savePreset({
        name,
        color,
        complexity,
        contrast,
        stiffness,
        gravityEnabled
      });
      setPresetName('');
    } finally {
      setIsSaving(false);
    }
  };

  const applyPreset = (p: any) => {
    setColor(p.color);
    setComplexity(p.complexity);
    setContrast(p.contrast);
    setStiffness(p.stiffness);
    setGravityEnabled(p.gravityEnabled || false);
  };

  const headerActions = (
    <div className="flex items-center gap-4 z-20">
      {user ? (
        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-[10px] font-bold text-white/90 leading-none">{user.displayName}</span>
            <span className="text-[8px] font-mono text-blue-400 leading-none uppercase tracking-tighter">Authorized User</span>
          </div>
          <img src={user.photoURL || ''} alt="avatar" className="w-8 h-8 rounded-full border border-white/20 shadow-glow" />
          <button onClick={logout} className="p-2 text-white/40 hover:text-white transition-colors" title="Logout">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <Button onClick={login} variant="secondary" className="px-4 py-2 h-9 text-[9px]">
          <LogIn className="w-3 h-3" />
          Connect Studio
        </Button>
      )}
    </div>
  );

  return (
    <Layout headerActions={headerActions}>
      <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-12 py-12">
        {/* Blob Viewer Area com Interatividade */}
        <div 
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseDown={() => setIsMouseDown(true)}
          onMouseUp={() => setIsMouseDown(false)}
          onMouseLeave={handleMouseLeave}
          onTouchMove={handleMouseMove}
          onTouchStart={() => setIsMouseDown(true)}
          onTouchEnd={handleMouseLeave}
          className="w-full max-w-md aspect-square flex items-center justify-center glass-panel rounded-3xl p-8 cursor-grab active:cursor-grabbing touch-none overflow-hidden select-none relative group"
        >
          {/* Subtle glow behind the blob */}
          <div className="absolute inset-0 bg-blue-500/5 blur-3xl rounded-full scale-75 group-hover:scale-90 transition-transform duration-1000" />
          
          <BlobViewer path={blobPath} color={color} />
          
          {/* HUD Decoration */}
          <div className="absolute top-4 left-4 flex gap-1">
            <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" />
            <div className="w-1 h-1 bg-blue-400/50 rounded-full" />
            <div className="w-1 h-1 bg-blue-400/30 rounded-full" />
          </div>
          <div className="absolute bottom-4 right-4 text-[10px] font-mono opacity-20 uppercase tracking-widest px-2">
            Physic Engine Active
          </div>
        </div>

        {/* Controls Area */}
        <div className="w-full max-w-md flex flex-col gap-8 glass-panel rounded-3xl p-8 border border-white/5">
          
          {/* Top Controls: Color, Randomize & Gravity Toggle */}
          <div className="flex items-center justify-between pb-6 border-b border-white/5">
            <ColorPicker color={color} onChange={setColor} />
            <div className="flex gap-3">
              <button
                onClick={() => setGravityEnabled(!gravityEnabled)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold tracking-widest uppercase transition-all border ${
                  gravityEnabled 
                    ? 'bg-blue-500/20 border-blue-500/50 text-blue-300' 
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}
              >
                Gravity {gravityEnabled ? 'ON' : 'OFF'}
              </button>
              <IconButton onClick={handleRandomize} title="Randomize Shape" />
            </div>
          </div>

          {/* Sliders */}
          <div className="flex flex-col gap-8">
            <Slider 
              label="Complexity" 
              min={6} 
              max={40} 
              value={complexity} 
              onChange={setComplexity} 
            />
            <Slider 
              label="Contrast" 
              min={0} 
              max={10} 
              value={contrast} 
              onChange={setContrast} 
            />
            <Slider 
              label="Stiffness" 
              min={1} 
              max={10} 
              value={stiffness} 
              onChange={setStiffness} 
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-4 pt-6 border-t border-white/5">
            <div className="flex gap-4">
              <Button variant="primary" className="flex-1 shadow-lg shadow-blue-500/20" onClick={handleDownload}>
                <Download className="w-4 h-4" />
                Download
              </Button>
              <Button variant="secondary" className="flex-1" onClick={() => setIsModalOpen(true)}>
                <Code className="w-4 h-4" />
                Code
              </Button>
            </div>
            
            <div className="flex gap-2 relative">
              <input 
                type="text" 
                placeholder="Name your blob..." 
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                className="flex-grow bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-blue-500/50 transition-colors"
                onFocus={() => !user && login()}
              />
              <Button 
                variant="secondary" 
                className="px-6 py-2" 
                onClick={handleSave}
                disabled={isSaving}
              >
                <Share2 className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Share'}
              </Button>
            </div>
          </div>

        </div>
      </div>

      {/* Technical Description Block */}
      <div className="w-full max-w-5xl mt-12 mb-24 px-4 flex flex-col gap-12 z-10">
        <div className="glass-panel rounded-3xl p-8 md:p-12 border border-white/5 flex flex-col gap-8">
          <section className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold gradient-text">Blob Physics Simulator</h2>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed">
              O Blob Physics Simulator expande o conceito de geometria estática do blobmaker.app, transformando presets fixos de "gelatina" em um simulador de massa dinâmico e interativo. Desenvolvido para servir como um ilustrador educacional sobre conceitos de massa, volume, elasticidade e densidade, o programa funciona tanto em ambientes com gravidade quanto em gravidade zero. Projetado para integração em simuladores e jogos virtuais, ele oferece alta personalização, permitindo o ajuste de cores, densidade de vértices, distorção de formas e coeficientes elásticos, proporcionando uma experiênci visualmente fluida e fisicamente coerente.
            </p>
          </section>

          <section className="flex flex-col gap-4">
            <h3 className="text-lg font-bold text-slate-200">Como a Física do Blob funciona</h3>
            <div className="space-y-4 text-slate-400 text-sm md:text-base leading-relaxed">
              <p>
                A alma deste simulador reside na combinação de um sistema de partículas com um modelo de pressão interna. Diferente de um objeto rígido, o "blob" é tratado como um polígono dinâmico composto por uma série de partículas conectadas em anel. Cada uma dessas partículas possui massa e velocidade, reagindo individualmente a forças externas, como a gravidade ou a interação com o mouse, enquanto se mantém unida às suas vizinhas por meio de "molas virtuais" (constraints). Essas molas ditam a elasticidade do contorno, tentando manter a distância original entre os pontos.
              </p>
              <p>
                O grande diferencial deste simulador é o uso da Conservação de Volume via Pressão. Para evitar que o corpo colapse ou se transforme em uma linha ao sofrer pressão, o algoritmo calcula em tempo real a área interna do polígono utilizando a fórmula do cadarço (Shoelace formula). Se a área atual for menor que a área original "em repouso", o sistema interpreta isso como uma compressão de um gás interno e aplica forças de expansão em cada partícula do contorno. Essa força é direcionada para fora, seguindo o vetor normal de cada vértice, criando o efeito de uma bolha ou bexiga de água que sempre tenta retomar sua forma original.
              </p>
              <p>
                Para garantir a estética visual característica, o programa utiliza técnicas de interpolação. Em vez de exibir as linhas retas que conectam as partículas físicas, o renderizador desenha curvas suaves (como Splines ou curvas de Bezier) que passam por esses pontos de controle. O resultado é um corpo macio, deformável e visualmente contínuo, capaz de absorver impactos, espremer-se por espaços estreitos e quicar com uma inércia que simula perfeitamente materiais viscosos ou elásticos.
              </p>
            </div>
          </section>
        </div>
      </div>

      {/* Community Gallery Section */}
      <div className="w-full max-w-5xl mb-24 px-4 flex flex-col gap-8 z-10">
        <div className="flex justify-between items-end">
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold gradient-text">Community Gallery</h2>
            <p className="text-slate-500 text-xs font-mono uppercase tracking-[0.2em]">Latest Physical Entities</p>
          </div>
          <div className="text-[10px] font-bold text-blue-500/50 uppercase tracking-widest bg-blue-500/5 px-3 py-1 rounded-full border border-blue-500/10">
            {presets.length} Entries Active
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {presets.map((p) => (
              <motion.div 
                key={p.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="glass-card rounded-2xl p-6 flex flex-col gap-4 group hover:border-blue-500/30 transition-colors relative"
              >
                <div 
                  className="w-full aspect-video flex items-center justify-center rounded-xl bg-black/40 cursor-pointer overflow-hidden p-4"
                  onClick={() => applyPreset(p)}
                >
                   <BlobViewer path={generateStaticBlobPath(p.complexity, p.contrast, 200)} color={p.color} />
                </div>
                
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <h4 className="text-sm font-bold text-slate-200 line-clamp-1">{p.name}</h4>
                    <span className="text-[10px] text-slate-500">by {p.authorName}</span>
                  </div>
                  {user && user.uid === p.authorId && (
                    <button 
                      onClick={() => deletePreset(p.id)}
                      className="text-slate-600 hover:text-red-400 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex gap-2 overflow-hidden">
                  <span className="text-[8px] font-mono bg-white/5 border border-white/10 px-2 py-0.5 rounded opacity-60">C:{p.complexity}</span>
                  <span className="text-[8px] font-mono bg-white/5 border border-white/10 px-2 py-0.5 rounded opacity-60">S:{p.stiffness}</span>
                  <span className="text-[8px] font-mono bg-white/5 border border-white/10 px-2 py-0.5 rounded opacity-60 uppercase">{p.color}</span>
                </div>
                
                {/* Apply Overlay on Hover */}
                <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-b-2xl pointer-events-none" />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Modal de Código */}
      <CodeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        svgCode={svgCode} 
      />
    </Layout>
  );
}
