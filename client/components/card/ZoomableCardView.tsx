import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import CardView, { CardViewProps } from '#/components/card/CardView';

export type ZoomableCardViewProps = Omit<CardViewProps, 'size'> & {
  size?: 'xs' | 'sm';
};

const sizeDiffMap = {
  sm: [30, 20],
  xs: [45, 37],
};

export default function ZoomableCardView({ size, ...props }: ZoomableCardViewProps) {
  const [isMouseOn, setIsMouseOn] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const zoomedCardRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    setIsMouseOn(true);
  };
  const handleMouseLeave = () => {
    setIsMouseOn(false);
  };

  useEffect(() => {
    if (!isMouseOn) {
      setIsZoomed(false);
      return;
    }
    const timer = setTimeout(() => {
      setIsZoomed(true);
    }, 500);
    return () => clearTimeout(timer);
  }, [isMouseOn]);

  useEffect(() => {
    if (!isZoomed) {
      if (zoomedCardRef.current) zoomedCardRef.current.style.display = 'none';
      return;
    }
    if (!containerRef.current || !zoomedCardRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const zoomedCardRect = zoomedCardRef.current.getBoundingClientRect();
    let top = containerRect.top - sizeDiffMap[size ?? 'sm'][0];
    let left = containerRect.left - sizeDiffMap[size ?? 'sm'][1];

    if (top < 0) top = 0;
    if (left < 0) left = 0;
    if (top + zoomedCardRect.height > window.innerHeight) top = window.innerHeight - zoomedCardRect.height;
    if (left + zoomedCardRect.width > window.innerWidth) left = window.innerWidth - zoomedCardRect.width;

    zoomedCardRef.current.style.top = `${top}px`;
    zoomedCardRef.current.style.left = `${left}px`;
    zoomedCardRef.current.style.display = 'block';
  }, [isZoomed, size]);

  return (
    <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="relative" ref={containerRef}>
      {createPortal(
        <div className="absolute z-[60] hidden" ref={zoomedCardRef}>
          {isMouseOn && <CardView size="md" {...props} />}
        </div>,
        document.body,
      )}
      <CardView size={size ?? 'sm'} {...props} />
    </div>
  );
}
