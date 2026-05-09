import React from 'react';

interface BlobViewerProps {
  path: string;
  color: string;
}

export function BlobViewer({ path, color }: BlobViewerProps) {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg
        viewBox="0 0 500 500"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full max-w-[400px] max-h-[400px]"
        shapeRendering="geometricPrecision"
      >
        <path
          d={path}
          fill={color}
          style={{ 
            filter: `drop-shadow(0 0 15px ${color}44)`,
            transition: 'fill 0.3s ease' 
          }}
          className="drop-shadow-2xl"
        />
      </svg>
    </div>
  );
}
