/**
 * Gera um caminho SVG estático baseado nos parâmetros do blob.
 * Útil para thumbnails e previews rápidos sem overhead de física.
 */
export function generateStaticBlobPath(complexity: number, contrast: number, size: number): string {
  const centerPos = size / 2;
  const radius = size / 3;
  const points: { x: number; y: number }[] = [];
  const angleStep = (Math.PI * 2) / complexity;

  // Gerar pontos iniciais (mesma lógica do useBlobPhysics)
  for (let i = 0; i < complexity; i++) {
    const angle = i * angleStep;
    // Usamos uma semente determinística ou fixa para thumbnails se quisermos, 
    // mas Math.random() aqui é ok para uma "foto" rápida.
    const variance = (contrast / 10) * (radius * 0.4);
    const r = radius + (Math.random() - 0.5) * variance;
    
    const x = centerPos + r * Math.cos(angle);
    const y = centerPos + r * Math.sin(angle);
    
    points.push({ x, y });
  }

  // Interpolação Spline (Quadratic Bezier via Midpoints)
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
