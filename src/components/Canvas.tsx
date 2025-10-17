import React, { useRef, useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import BoardItem from './BoardItem';
import zoneConfig from '../data/zone-config.json';

// Types for styled components
interface ZoneContainerProps {
  color: string;
  gradient?: string;
  borderGradient?: string;
}

const CanvasContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background: #f8f9fa;
  background-image: 
    radial-gradient(circle, #e0e0e0 1px, transparent 1px);
  background-size: 20px 20px;
`;

const CanvasContent = styled(motion.div)`
  width: 100%;
  height: 100%;
  position: relative;
  transform-origin: 0 0;
`;

const ZoneContainer = styled.div<ZoneContainerProps>`
  position: absolute;
  border: ${zoneConfig.settings.borderWidth}px solid ${props => props.color};
  border-radius: ${zoneConfig.settings.borderRadius}px;
  background: ${props => props.gradient || props.color};
  box-shadow: ${zoneConfig.settings.boxShadow};
  pointer-events: none;
  z-index: 1; /* Zones underneath items */
  transition: all 0.3s ease;
  
  ${zoneConfig.settings.hoverEffect && `
    &:hover {
      transform: scale(1.02);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
    }
  `}
`;

const ZoneLabel = styled.div`
  position: absolute;
  top: 8px;
  left: 8px;
  background: ${zoneConfig.settings.labelBackgroundColor};
  padding: ${zoneConfig.settings.labelPadding};
  border-radius: 8px;
  font-size: ${zoneConfig.settings.labelFontSize}px;
  font-weight: ${zoneConfig.settings.labelFontWeight};
  color: ${zoneConfig.settings.labelTextColor};
  pointer-events: none;
  z-index: 2;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const Canvas = ({
  items,
  selectedItemId,
  onUpdateItem,
  onDeleteItem,
  onSelectItem,
  onFocusRequest,
  onAddItem,
  onResetBoard,
}) => {
  const canvasRef = useRef(null);
  const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });

  // Handle viewport changes
  const updateViewport = useCallback((newViewport) => {
    setViewport(newViewport);
    if (canvasRef.current) {
      canvasRef.current.style.transform = `translate(${newViewport.x}px, ${newViewport.y}px) scale(${newViewport.zoom})`;
    }
  }, []);

  // Center viewport on specific item with simple 3-step animation
  const centerOnItem = useCallback((itemId, finalZoom = 0.8, duration = 3000) => {
    const item = items.find((i) => i.id === itemId);
    if (!item || !canvasRef.current) return;

    const container = canvasRef.current.parentElement;
    if (!container) return;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    const start = { ...viewport };
    const clampZoom = (z) => Math.max(0.1, Math.min(3, z));
    
    // Simple easing function
    const easeInOut = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    // 3 equal phases
    const phaseDuration = duration / 3;
    const t1 = phaseDuration;      // Step 1: zoom out
    const t2 = phaseDuration * 2;  // Step 2: move to target center
    const t3 = duration;           // Step 3: zoom in

    // Step 1: Zoom out from current viewport (to 30% of current zoom)
    const zoomOutZoom = clampZoom(start.zoom * 0.3);

    // Step 2: Calculate position to center the target object
    const targetObjectCenterX = item.x + item.width / 2;
    const targetObjectCenterY = item.y + item.height / 2;
    const targetViewportX = (containerWidth / 2) - targetObjectCenterX * zoomOutZoom;
    const targetViewportY = (containerHeight / 2) - targetObjectCenterY * zoomOutZoom;

    // Step 3: Calculate final position with target zoom
    const finalViewportX = (containerWidth / 2) - targetObjectCenterX * finalZoom;
    const finalViewportY = (containerHeight / 2) - targetObjectCenterY * finalZoom;

    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      let current;
      if (elapsed <= t1) {
        // Step 1: Zoom out from current viewport center
        const k = easeInOut(elapsed / t1);
        const currentZoom = start.zoom + (zoomOutZoom - start.zoom) * k;
        
        // Keep current viewport center fixed during zoom out
        const currentCenterX = (containerWidth / 2 - start.x) / start.zoom;
        const currentCenterY = (containerHeight / 2 - start.y) / start.zoom;
        const newX = (containerWidth / 2) - currentCenterX * currentZoom;
        const newY = (containerHeight / 2) - currentCenterY * currentZoom;
        
        current = { x: newX, y: newY, zoom: currentZoom };
      } else if (elapsed <= t2) {
        // Step 2: Pan viewport to target object center
        const k = easeInOut((elapsed - t1) / (t2 - t1));
        // Get the current viewport position at the end of step 1
        const step1EndX = (containerWidth / 2) - ((containerWidth / 2 - start.x) / start.zoom) * zoomOutZoom;
        const step1EndY = (containerHeight / 2) - ((containerHeight / 2 - start.y) / start.zoom) * zoomOutZoom;
        
        const currentX = step1EndX + (targetViewportX - step1EndX) * k;
        const currentY = step1EndY + (targetViewportY - step1EndY) * k;
        
        current = { x: currentX, y: currentY, zoom: zoomOutZoom };
      } else {
        // Step 3: Zoom in to target object
        const k = easeInOut((elapsed - t2) / (t3 - t2));
        const currentX = targetViewportX + (finalViewportX - targetViewportX) * k;
        const currentY = targetViewportY + (finalViewportY - targetViewportY) * k;
        const currentZoom = zoomOutZoom + (finalZoom - zoomOutZoom) * k;
        
        current = { x: currentX, y: currentY, zoom: currentZoom };
      }

      updateViewport(current);

      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [items, viewport, updateViewport]);

  // Handle mouse wheel for zooming (zoom around cursor)
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const container = e.currentTarget as HTMLElement;
    const rect = container.getBoundingClientRect();

    // Mouse position in screen space relative to container
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Compute new zoom
    const step = 0.1;
    const factor = e.deltaY > 0 ? 1 - step : 1 + step; // out vs in
    const newZoom = Math.max(0.1, Math.min(3, viewport.zoom * factor));

    // World coordinates under cursor before zoom
    const worldX = (mouseX - viewport.x) / viewport.zoom;
    const worldY = (mouseY - viewport.y) / viewport.zoom;

    // New translation so the same world point stays under cursor
    const newX = mouseX - worldX * newZoom;
    const newY = mouseY - worldY * newZoom;

    updateViewport({ x: newX, y: newY, zoom: newZoom });
  }, [viewport, updateViewport]);

  // Handle panning
  const handleMouseDown = useCallback((e) => {
    // Allow panning with left mouse button on canvas background, or middle mouse button
    if (e.button === 0 || e.button === 1) {
      // Only start panning if clicking on the canvas background (not on items)
      if (e.target === e.currentTarget || e.target.closest('[data-item-id]') === null) {
        e.preventDefault();
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
        setLastPanPoint({ x: viewport.x, y: viewport.y });
      }
    }
  }, [viewport]);

  const handleMouseMove = useCallback((e) => {
    // This is now handled by global event listeners
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle canvas clicks
  const handleCanvasClick = useCallback((e) => {
    if (e.target === canvasRef.current) {
      onSelectItem(null);
    }
  }, [onSelectItem]);

  // Mouse event listeners for better panning
  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (isDragging) {
        e.preventDefault();
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;
        
        updateViewport({
          x: lastPanPoint.x + deltaX,
          y: lastPanPoint.y + deltaY,
          zoom: viewport.zoom
        });
      }
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, dragStart, lastPanPoint, viewport.zoom, updateViewport]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'r' && e.ctrlKey) {
        e.preventDefault();
        updateViewport({ x: 0, y: 0, zoom: 1 });
      }
      if (e.key === 'f' && e.ctrlKey) {
        e.preventDefault();
        // Center on first item if available
        if (items.length > 0) {
          centerOnItem(items[0].id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [updateViewport, centerOnItem, items]);

  // Expose centerOnItem function to parent
  useEffect(() => {
    if (onFocusRequest) {
      // Make centerOnItem available globally for focus requests
      (window as any).centerOnItem = centerOnItem;
    }
  }, [centerOnItem, onFocusRequest]);

  // Expose helper to place an item at current viewport center and persist
  useEffect(() => {
    (window as any).placeItemAtViewportCenter = async (itemId: string) => {
      try {
        const container = canvasRef.current?.parentElement as HTMLElement | null;
        if (!container) return;
        const item = items.find((i) => i.id === itemId);
        if (!item) return;

        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        // World coords of viewport center
        const centerWorldX = (containerWidth / 2 - viewport.x) / viewport.zoom;
        const centerWorldY = (containerHeight / 2 - viewport.y) / viewport.zoom;

        const newX = Math.round(centerWorldX - (item.width || 0) / 2);
        const newY = Math.round(centerWorldY - (item.height || 0) / 2);

        onUpdateItem(itemId, { x: newX, y: newY });

        // Persist to backend if available
        try {
          await fetch(`/api/board-items/${itemId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ x: newX, y: newY })
          });
        } catch (_) { /* ignore */ }
      } catch (_) { /* ignore */ }
    };
  }, [items, viewport, onUpdateItem]);

  // Expose a getter for current viewport center in world coordinates
  useEffect(() => {
    (window as any).getViewportCenterWorld = () => {
      const container = canvasRef.current?.parentElement as HTMLElement | null;
      if (!container) return null;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      const x = (containerWidth / 2 - viewport.x) / viewport.zoom;
      const y = (containerHeight / 2 - viewport.y) / viewport.zoom;
      return { x, y, zoom: viewport.zoom };
    };
  }, [viewport]);

  return (
    <CanvasContainer
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleCanvasClick}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      <CanvasContent
        ref={canvasRef}
        style={{
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
        }}
      >
        {/* Render Zones - Behind objects */}
        {zoneConfig.zones.map((zone) => (
          <ZoneContainer
            key={zone.name}
            style={{
              left: zone.x,
              top: zone.y,
              width: zone.width,
              height: zone.height,
              borderColor: zone.color,
            }}
            color={zone.color}
            gradient={zone.gradient}
            borderGradient={zone.borderGradient}
          >
            <ZoneLabel>
              {zone.label}
            </ZoneLabel>
          </ZoneContainer>
        ))}

        {/* Render Objects - On top of zones */}
        <AnimatePresence>
          {items.map((item) => (
            <BoardItem
              key={item.id}
              item={item}
              isSelected={selectedItemId === item.id}
              onUpdate={onUpdateItem}
              onDelete={onDeleteItem}
              onSelect={onSelectItem}
            />
          ))}
        </AnimatePresence>
      </CanvasContent>

      {/* Instructions */}
      <div style={{
        position: 'absolute',
        bottom: 20,
        left: 20,
        background: 'rgba(0,0,0,0.7)',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '4px',
        fontSize: '12px',
        zIndex: 1000
      }}>
        Left click empty area to pan • Middle mouse to pan • Mouse wheel to zoom • Ctrl+R to reset view • Ctrl+F to focus on first item
      </div>
    </CanvasContainer>
  );
};

export default Canvas;