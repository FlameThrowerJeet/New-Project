import React, { useRef, useEffect, RefObject } from 'react';
import '../../styles/ScrollableContainer.css';

interface ScrollableContainerProps {
  children: React.ReactNode;
  className?: string;
  maxHeight?: string;
  maxWidth?: string;
  style?: React.CSSProperties;
  terminalStyle?: boolean;
  containerRef?: RefObject<HTMLDivElement>;
}

const ScrollableContainer: React.FC<ScrollableContainerProps> = ({
  children,
  className = '',
  maxHeight = '100%',
  maxWidth = '100%',
  style = {},
  terminalStyle = false,
  containerRef,
}) => {
  const internalRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startScrollTop = useRef(0);

  // Use the provided ref or fall back to internal ref
  const usedRef = containerRef || internalRef;

  // Handle custom scrollbar thumb positioning
  useEffect(() => {
    const container = usedRef.current;
    const thumb = thumbRef.current;
    if (!container || !thumb) return;

    const updateThumbPosition = () => {
      if (!container || !thumb) return;

      const { scrollTop, scrollHeight, clientHeight } = container;
      // Don't divide by zero
      if (scrollHeight <= clientHeight) {
        thumb.style.display = 'none';
        return;
      } else {
        thumb.style.display = 'block';
      }

      const thumbHeight = Math.max((clientHeight / scrollHeight) * clientHeight, 30); // Min height of 30px
      const thumbTop = (scrollTop / (scrollHeight - clientHeight)) * (clientHeight - thumbHeight);

      thumb.style.height = `${thumbHeight}px`;
      thumb.style.top = `${thumbTop}px`;
    };

    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      isDragging.current = true;
      startY.current = e.clientY;
      startScrollTop.current = container.scrollTop;
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      // Add active class
      thumb.classList.add('dragging');
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !container) return;

      const deltaY = e.clientY - startY.current;
      const { clientHeight, scrollHeight } = container;
      const thumbHeight = Math.max((clientHeight / scrollHeight) * clientHeight, 30);
      const scrollRange = scrollHeight - clientHeight;
      const dragRatio = (clientHeight - thumbHeight) / scrollRange;

      container.scrollTop = startScrollTop.current + (deltaY / dragRatio);
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);

      // Remove active class
      if (thumb) thumb.classList.remove('dragging');
    };

    // Initialize
    updateThumbPosition();

    // Event listeners
    container.addEventListener('scroll', updateThumbPosition);
    thumb.addEventListener('mousedown', handleMouseDown);

    // Handle window resize
    window.addEventListener('resize', updateThumbPosition);

    // Clean up
    return () => {
      container.removeEventListener('scroll', updateThumbPosition);
      thumb.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('resize', updateThumbPosition);
    };
  }, [usedRef]);

  return (
    <div
      className={`scrollable-container ${terminalStyle ? 'terminal-scrollable' : ''} ${className}`}
      style={{
        maxHeight,
        maxWidth,
        ...style,
      }}
      ref={usedRef}
    >
      <div className="scrollable-content">{children}</div>
      <div className="scroll-track">
        <div className="scroll-thumb" ref={thumbRef}></div>
      </div>
    </div>
  );
};

export default ScrollableContainer;