import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import CardView, { CardViewProps } from '#/components/card/CardView';

const isTouchDevice = 'ontouchstart' in window;

export type ZoomableCardViewProps = Omit<CardViewProps, 'size'>;

export default function ZoomableCardView({ onPress, ...props }: ZoomableCardViewProps) {
  const [isMouseOn, setIsMouseOn] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const zoomedCardRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = useCallback(() => {
    if (isTouchDevice) return;
    setIsMouseOn(true);
  }, []);
  const handleMouseLeave = useCallback(() => {
    if (isTouchDevice) return;
    setIsMouseOn(false);
  }, []);

  const [touchStarted, setTouchStarted] = useState(false);
  const touchStartPos = useRef({ x: 0, y: 0 });
  const touchCurrentPos = useRef({ x: 0, y: 0 });
  const handleTouchStart = useCallback((ev: React.TouchEvent<HTMLDivElement>) => {
    setTouchStarted(true);
    touchStartPos.current = { x: ev.touches[0].clientX, y: ev.touches[0].clientY };
    touchCurrentPos.current = { x: ev.touches[0].clientX, y: ev.touches[0].clientY };
  }, []);
  useEffect(() => {
    if (!touchStarted) return;
    const timer = setTimeout(() => {
      setTouchStarted(false);
      if (
        Math.abs(touchStartPos.current.x - touchCurrentPos.current.x) < 10 &&
        Math.abs(touchStartPos.current.y - touchCurrentPos.current.y) < 10
      ) {
        setIsZoomed(true);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [touchStarted]);
  const handleTouchMove = useCallback((ev: React.TouchEvent<HTMLDivElement>) => {
    touchCurrentPos.current = { x: ev.touches[0].clientX, y: ev.touches[0].clientY };
  }, []);
  const handleTouchEnd = useCallback(() => {
    setTouchStarted(false);
  }, []);

  const handlePress: Exclude<CardViewProps['onPress'], undefined> = useCallback(
    (ev) => {
      if (isZoomed) return;
      if (onPress) {
        onPress(ev);
      } else {
        setIsZoomed(true);
      }
    },
    [isZoomed, onPress],
  );

  const handleBackdropTouch = useCallback((ev: React.TouchEvent<HTMLDivElement>) => {
    ev.preventDefault();
    ev.stopPropagation();
    setIsZoomed(false);
  }, []);

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

    zoomedCardRef.current.style.display = 'block';

    const containerRect = containerRef.current.getBoundingClientRect();
    const zoomedCardRect = zoomedCardRef.current.getBoundingClientRect();
    let left: number;
    let top: number;
    if (isTouchDevice) {
      left = (window.innerWidth - zoomedCardRect.width) / 2;
      top = (window.innerHeight - zoomedCardRect.height) / 2;
    } else {
      left = containerRect.left - (zoomedCardRect.width - containerRect.width) / 2;
      top = containerRect.top - (zoomedCardRect.height - containerRect.height) / 2;
    }

    if (left < 0) left = 0;
    if (top < 0) top = 0;
    if (left + zoomedCardRect.width > window.innerWidth) left = window.innerWidth - zoomedCardRect.width;
    if (top + zoomedCardRect.height > window.innerHeight) top = window.innerHeight - zoomedCardRect.height;

    zoomedCardRef.current.style.left = `${left + window.scrollX}px`;
    zoomedCardRef.current.style.top = `${top + window.scrollY}px`;
  }, [isZoomed]);

  return (
    <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="relative" ref={containerRef}>
      <div onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} onTouchCancel={handleTouchEnd}>
        <CardView size="sm" isPressable onPress={handlePress} {...props} />
      </div>
      {createPortal(
        <>
          {(isMouseOn || isZoomed) && (
            <div key="cardView" className="absolute z-[1001] hidden" onContextMenu={(ev) => ev.preventDefault()} ref={zoomedCardRef}>
              <CardView
                size="md"
                {...props}
                isPressable={!isTouchDevice && props.isPressable}
                onPress={isTouchDevice ? undefined : onPress}
              />
            </div>
          )}
          {isTouchDevice && isZoomed && (
            <div
              key="backdrop"
              onTouchEnd={handleBackdropTouch}
              onWheel={(ev) => ev.preventDefault()}
              onContextMenu={(ev) => ev.preventDefault()}
              className="z-[1000] fixed backdrop-blur-md backdrop-saturate-150 w-screen h-screen inset-0"
            ></div>
          )}
        </>,
        document.body,
      )}
    </div>
  );
}
