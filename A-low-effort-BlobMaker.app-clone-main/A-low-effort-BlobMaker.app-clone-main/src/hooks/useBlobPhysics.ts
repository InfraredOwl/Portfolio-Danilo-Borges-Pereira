import { useState, useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  oldX: number;
  oldY: number;
  isLocked?: boolean;
}

interface Spring {
  p1: number; // index da partícula 1
  p2: number; // index da partícula 2
  length: number;
  stiffness: number;
}

interface BlobPhysicsConfig {
  complexity: number;
  contrast: number;
  stiffness: number;
  gravityEnabled: boolean;
  mousePos: { x: number; y: number } | null;
  isMouseDown: boolean;
  size: number;
}

export function useBlobPhysics({ complexity, contrast, stiffness, gravityEnabled, mousePos, isMouseDown, size }: BlobPhysicsConfig) {
  const [path, setPath] = useState('');
  const particlesRef = useRef<Particle[]>([]);
  const springsRef = useRef<Spring[]>([]);
  const targetAreaRef = useRef<number>(0);
  const grabRef = useRef<number | null>(null);
  const requestRef = useRef<number>(null);
  
  const centerPos = size / 2;
  const radius = size / 3;

  // Escalonamento da rigidez baseado no slider (1 a 10)
  const structuralStiffness = (stiffness / 10) * 0.9 + 0.05; 

  // Inicialização do Sistema Massa-Mola
  useEffect(() => {
    const particles: Particle[] = [];
    const springs: Spring[] = [];
    const angleStep = (Math.PI * 2) / complexity;
    
    // Agora NÃO usamos uma partícula central fixa para a Opção 2
    // O volume será mantido por pressão interna

    // 1. Partículas do Perímetro
    for (let i = 0; i < complexity; i++) {
      const angle = i * angleStep;
      const variance = (contrast / 10) * (radius * 0.4);
      const r = radius + (Math.random() - 0.5) * variance;
      
      const x = centerPos + r * Math.cos(angle);
      const y = centerPos + r * Math.sin(angle);
      
      particles.push({ x, y, oldX: x, oldY: y });
    }

    // 2. Molas Estruturais (Perímetro)
    for (let i = 0; i < complexity; i++) {
      const next = (i + 1) % complexity;
      const dx = particles[i].x - particles[next].x;
      const dy = particles[i].y - particles[next].y;
      springs.push({
        p1: i,
        p2: next,
        length: Math.sqrt(dx * dx + dy * dy),
        stiffness: structuralStiffness
      });
    }

    // 3. Calcular Área Alvo (Shoelace Formula)
    let area = 0;
    for (let i = 0; i < complexity; i++) {
      const p1 = particles[i];
      const p2 = particles[(i + 1) % complexity];
      area += (p1.x * p2.y) - (p2.x * p1.y);
    }
    targetAreaRef.current = Math.abs(area) * 0.5;

    particlesRef.current = particles;
    springsRef.current = springs;
  }, [complexity, contrast, size]);

  // Atualiza a rigidez das molas existentes quando o slider muda
  useEffect(() => {
    if (!springsRef.current.length) return;
    springsRef.current.forEach((s) => {
      s.stiffness = structuralStiffness;
    });
  }, [stiffness, complexity]);

  const update = () => {
    if (!particlesRef.current.length) return;

    const particles = particlesRef.current;
    const springs = springsRef.current;
    const friction = 0.98;
    const gravity = gravityEnabled ? 0.35 : 0;
    const iterations = 5; 

    // 1. Integração Verlet (Movimento)
    for (const p of particles) {
      if (p.isLocked) continue;

      const vx = (p.x - p.oldX) * friction;
      const vy = (p.y - p.oldY) * friction;

      p.oldX = p.x;
      p.oldY = p.y;
      p.x += vx;
      p.y += vy + gravity;
    }

    // 2. Modelo de Pressão de Gás (Conservação de Área)
    // Calcular área atual
    let currentArea = 0;
    for (let i = 0; i < particles.length; i++) {
      const p1 = particles[i];
      const p2 = particles[(i + 1) % particles.length];
      currentArea += (p1.x * p2.y) - (p2.x * p1.y);
    }
    currentArea = Math.abs(currentArea) * 0.5;

    // Calcular força de pressão baseada na diferença de área
    const areaDiff = targetAreaRef.current - currentArea;
    const pressureMultiplier = 0.0002 * stiffness; // Escala com a rigidez
    const pressure = areaDiff * pressureMultiplier;

    for (let i = 0; i < particles.length; i++) {
      const pPrev = particles[(i - 1 + particles.length) % particles.length];
      const pNext = particles[(i + 1) % particles.length];
      const p = particles[i];

      // Calcular a Normal do vértice (vetor perpendicular ao segmento entre vizinhos)
      const nx = pNext.y - pPrev.y;
      const ny = -(pNext.x - pPrev.x);
      const nLength = Math.sqrt(nx * nx + ny * ny) || 1;

      // Aplicar pressão interna ao longo da normal
      p.x += (nx / nLength) * pressure;
      p.y += (ny / nLength) * pressure;
    }

    // 3. Interação de Arrastar (Mouse/Touch)
    if (mousePos && isMouseDown) {
      if (grabRef.current === null) {
        let minDist = 50;
        let foundIdx = null;
        for (let i = 0; i < particles.length; i++) {
          const dx = particles[i].x - mousePos.x;
          const dy = particles[i].y - mousePos.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < minDist) {
            minDist = d;
            foundIdx = i;
          }
        }
        grabRef.current = foundIdx;
      }

      if (grabRef.current !== null) {
        const p = particles[grabRef.current];
        p.x = mousePos.x;
        p.y = mousePos.y;
      }
    } else {
      grabRef.current = null;
    }

    // 4. Solver de Restrições (Springs)
    for (let it = 0; it < iterations; it++) {
      for (const s of springs) {
        const p1 = particles[s.p1];
        const p2 = particles[s.p2];

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const diff = (s.length - dist) / dist * s.stiffness;

        const offsetX = dx * 0.5 * diff;
        const offsetY = dy * 0.5 * diff;

        if (!p1.isLocked) { p1.x -= offsetX; p1.y -= offsetY; }
        if (!p2.isLocked) { p2.x += offsetX; p2.y += offsetY; }
      }

      // Restrições de borda
      for (const p of particles) {
        const margin = 20;
        if (p.x < margin) p.x = margin;
        if (p.x > size - margin) p.x = size - margin;
        if (p.y < margin) p.y = margin;
        if (p.y > size - margin) p.y = size - margin;
      }
    }

    // 5. Renderização (Spline)
    const points = particles;
    const midpoints = points.map((p, i) => {
      const nextP = points[(i + 1) % points.length];
      return {
        x: (p.x + nextP.x) / 2,
        y: (p.y + nextP.y) / 2
      };
    });

    let newPath = `M ${midpoints[0].x} ${midpoints[0].y}`;
    for (let i = 0; i < points.length; i++) {
      const controlPoint = points[(i + 1) % points.length];
      const endPoint = midpoints[(i + 1) % midpoints.length];
      newPath += ` Q ${controlPoint.x} ${controlPoint.y}, ${endPoint.x} ${endPoint.y}`;
    }
    
    setPath(newPath + ' Z');
    requestRef.current = requestAnimationFrame(update);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [mousePos, isMouseDown]);

  return path;
}

