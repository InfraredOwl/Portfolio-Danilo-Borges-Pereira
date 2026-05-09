/**
 * Módulo de Geração de Blobs (Alta Coesão)
 * Responsável apenas por cálculos matemáticos e geração de SVG Path.
 * Nenhuma dependência externa.
 */

export interface BlobConfig {
  size: number;       // Tamanho da viewBox (ex: 500)
  complexity: number; // Número de vértices (polígonos)
  contrast: number;   // Nível de distorção/aleatoriedade
}

// Função auxiliar para gerar números aleatórios em um intervalo
const random = (min: number, max: number) => Math.random() * (max - min) + min;

/**
 * Calcula as coordenadas dos vértices e gera o path SVG.
 */
export function generateBlobPath({ size, complexity, contrast }: BlobConfig): string {
  const center = size / 2;
  // O raio base ocupa um pouco mais de 1/3 para compensar o leve encolhimento da curva quadrática
  const baseRadius = size / 2.8; 
  const angleStep = (Math.PI * 2) / complexity;
  const points: { x: number; y: number }[] = [];

  // 1. Calcular coordenadas polares e converter para cartesianas
  for (let i = 0; i < complexity; i++) {
    const angle = i * angleStep;
    
    // O contraste define o quanto o raio pode variar. 
    // Contraste 0 = círculo perfeito. Contraste alto = forma muito distorcida.
    const variance = (contrast / 10) * (baseRadius * 0.6); 
    const r = baseRadius + random(-variance, variance);
    
    points.push({
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    });
  }

  // 2. Gerar o path SVG suave usando curvas de Bezier
  return createSmoothPath(points);
}

/**
 * Converte um array de pontos em um path SVG fechado e arredondado.
 * Utiliza uma interpolação simplificada (Catmull-Rom para Cubic Bezier).
 */
function createSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';

  // Truque matemático para formas orgânicas perfeitas (Continuidade C1):
  // Em vez de tentar passar a linha exatamente pelos pontos gerados (o que pode criar "bicos"),
  // usamos os pontos médios entre eles como as âncoras reais do SVG, e os pontos gerados
  // como os "pontos de controle" (control points) de curvas de Bezier Quadráticas (Q).
  // Isso garante que a transição de uma curva para a outra seja matematicamente perfeita e sem quinas.
  
  const midpoints = points.map((p, i) => {
    const nextP = points[(i + 1) % points.length];
    return {
      x: (p.x + nextP.x) / 2,
      y: (p.y + nextP.y) / 2
    };
  });

  let path = `M ${midpoints[0].x} ${midpoints[0].y}`;

  for (let i = 0; i < points.length; i++) {
    const controlPoint = points[(i + 1) % points.length];
    const endPoint = midpoints[(i + 1) % midpoints.length];
    path += ` Q ${controlPoint.x} ${controlPoint.y}, ${endPoint.x} ${endPoint.y}`;
  }

  return path + ' Z';
}
