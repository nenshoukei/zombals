import { useEffect, useState } from 'react';
import CardView, { CardViewProps } from '#/components/card/CardView';

export type ZoomableCardViewProps = Omit<CardViewProps, 'size'>;

export default function ZoomableCardView(props: ZoomableCardViewProps) {
  const [isMouseOn, setIsMouseOn] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

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

  return (
    <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="relative">
      {isZoomed && (
        <div className="absolute top-[-30px] left-[-25px] z-10">
          <CardView size="md" {...props} />
        </div>
      )}
      <CardView size="sm" {...props} />
    </div>
  );
}
