import { useLongPress } from '@uidotdev/usehooks';
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
  const longPressAttrs = useLongPress(
    () => {
      setIsZoomed(true);
    },
    {
      threshold: 500,
    },
  );

  const handleMouseEnter = useCallback(() => {
    if (isTouchDevice) return;
    setIsMouseOn(true);
  }, []);
  const handleMouseLeave = useCallback(() => {
    if (isTouchDevice) return;
    setIsMouseOn(false);
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
    <>
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
      <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="relative" ref={containerRef}>
        <div {...longPressAttrs}>
          <CardView size="sm" isPressable onPress={handlePress} {...props} />
        </div>
      </div>
    </>
  );
}
