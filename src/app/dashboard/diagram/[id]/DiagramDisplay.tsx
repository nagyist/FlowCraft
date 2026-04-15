import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

interface DiagramDisplayProps {
  svgCode?: string;
  mermaidCode?: string;
  imageUrl?: string;
}

const DiagramDisplay: React.FC<DiagramDisplayProps> = ({ svgCode, mermaidCode, imageUrl }) => {
  const mermaidRef = useRef<HTMLDivElement>(null);
  const [svgOutput, setSvgOutput] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    if (!mermaidCode) return;

    (async () => {
      const { default: mermaid } = await import('mermaid');
      if (cancelled) return;
      mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose',
      });

      try {
        const cleanCode = mermaidCode
          .replace(/^```mermaid\n/, '')
          .replace(/\n```$/, '')
          .trim();

        if (mermaidRef.current) mermaidRef.current.innerHTML = '';

        const { svg } = await mermaid.render(
          'mermaid-diagram-' + Math.random().toString(36).substring(7),
          cleanCode,
        );
        if (!cancelled) setSvgOutput(svg);
      } catch (error) {
        console.error('Error rendering Mermaid diagram:', error);
        if (!cancelled && mermaidRef.current) {
          mermaidRef.current.innerHTML = '<p>Error rendering diagram</p>';
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mermaidCode]);

  if (svgCode) {
    return (
      <div
        className="w-full"
        dangerouslySetInnerHTML={{ __html: svgCode }}
      />
    );
  }

  if (mermaidCode) {
    return (
      <>
        {svgOutput ? (
          <div
            className="w-full"
            dangerouslySetInnerHTML={{ __html: svgOutput }}
          />
        ) : (
          <div ref={mermaidRef} className="mermaid-diagram" />
        )}
      </>
    );
  }

  if (imageUrl) {
    return (
      <div className="max-w-full h-auto mx-auto relative">
        <Image
          src={imageUrl}
          alt="Diagram"
          width={1200}
          height={800}
          sizes="(max-width: 768px) 100vw, 80vw"
          style={{ maxWidth: '100%', height: 'auto' }}
          unoptimized
        />
      </div>
    );
  }

  return null;
};

export default DiagramDisplay;
