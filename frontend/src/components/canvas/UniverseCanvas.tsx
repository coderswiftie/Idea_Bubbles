import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useIdeas } from '../../context/IdeaContext';
import { Idea } from '../../types';

interface Particle {
  x: number;
  y: number;
  size: number;
  alpha: number;
  speed: number;
}

interface PhysicsBubble {
  id: string;
  idea: Idea;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  isFixed: boolean;
}

export const UniverseCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const {
    ideas,
    connections,
    selectedIdeaId,
    selectIdea,
    updateIdeaPosition,
    reducedMotion,
    physicsPaused,
  } = useIdeas();

  // Viewport transformation state (pan & zoom)
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const transformRef = useRef(transform);
  transformRef.current = transform;

  // Interaction tracking refs
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const draggedBubbleRef = useRef<PhysicsBubble | null>(null);
  const dragStartPosRef = useRef({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);
  const hoveredBubbleIdRef = useRef<string | null>(null);

  // Simulation state
  const bubblesRef = useRef<PhysicsBubble[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameIdRef = useRef<number | null>(null);

  // Initialize or update bubbles from ideas
  useEffect(() => {
    const currentMap = new Map(bubblesRef.current.map((b) => [b.id, b]));
    const width = window.innerWidth;
    const height = window.innerHeight;

    const updated: PhysicsBubble[] = ideas.map((idea, index) => {
      const existing = currentMap.get(idea.id);
      const categoryColor = idea.category?.color_hex || '#8B5CF6';

      // Calculate radius based on importance (1-5) and progress depth
      const depth = (idea.notes_count || 0) + (idea.tasks_count || 0);
      const baseRadius = 46 + (idea.importance || 3) * 4 + Math.min(depth * 3, 14);

      if (existing) {
        existing.idea = idea;
        existing.radius = baseRadius;
        existing.color = categoryColor;
        return existing;
      }

      // Initial coordinates
      let x = idea.canvas_x || 0;
      let y = idea.canvas_y || 0;

      // If idea coordinates are 0/unset, arrange organically in spiral or spread
      if (!idea.canvas_fixed && (!idea.canvas_x || idea.canvas_x === 0)) {
        const angle = index * 0.85;
        const dist = 90 + index * 45;
        x = Math.cos(angle) * dist;
        y = Math.sin(angle) * dist;
      }

      return {
        id: idea.id,
        idea,
        x,
        y,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: baseRadius,
        color: categoryColor,
        isFixed: idea.canvas_fixed || false,
      };
    });

    bubblesRef.current = updated;
  }, [ideas]);

  // Initialize ambient background star particles
  useEffect(() => {
    const count = 75;
    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: (Math.random() - 0.5) * 3000,
        y: (Math.random() - 0.5) * 3000,
        size: Math.random() * 1.8 + 0.6,
        alpha: Math.random() * 0.6 + 0.15,
        speed: Math.random() * 0.15 + 0.05,
      });
    }
    particlesRef.current = particles;
  }, []);

  // Center viewport initially
  useEffect(() => {
    setTransform({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2 - 20,
      scale: 1,
    });
  }, []);

  // Screen to World coordinates
  const screenToWorld = useCallback((screenX: number, screenY: number) => {
    const { x, y, scale } = transformRef.current;
    return {
      x: (screenX - x) / scale,
      y: (screenY - y) / scale,
    };
  }, []);

  // Main Animation and Physics Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      const width = canvas.width;
      const height = canvas.height;
      const { x: panX, y: panY, scale } = transformRef.current;

      // 1. Clear Canvas with deep midnight charcoal
      ctx.fillStyle = '#0B0D12';
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.translate(panX, panY);
      ctx.scale(scale, scale);

      // 2. Draw Ambient Stars
      ctx.fillStyle = '#F4F0E8';
      for (const p of particlesRef.current) {
        if (!reducedMotion && !physicsPaused) {
          p.y -= p.speed;
          if (p.y < -1500) p.y = 1500;
        }
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;

      // 3. Draw Idea Connections (Curved ethereal lines)
      const bubbleMap = new Map(bubblesRef.current.map((b) => [b.id, b]));
      for (const conn of connections) {
        const b1 = bubbleMap.get(conn.source_idea_id);
        const b2 = bubbleMap.get(conn.target_idea_id);
        if (b1 && b2) {
          ctx.beginPath();
          ctx.moveTo(b1.x, b1.y);
          // Subtle quadratic curve
          const midX = (b1.x + b2.x) / 2 + (b2.y - b1.y) * 0.15;
          const midY = (b1.y + b2.y) / 2 + (b1.x - b2.x) * 0.15;
          ctx.quadraticCurveTo(midX, midY, b2.x, b2.y);
          ctx.strokeStyle = 'rgba(139, 92, 246, 0.22)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      // 4. Update Physics Simulation (if not paused & not reduced motion)
      const bubbles = bubblesRef.current;
      if (!physicsPaused && !reducedMotion) {
        for (let i = 0; i < bubbles.length; i++) {
          const b1 = bubbles[i];
          if (b1 === draggedBubbleRef.current) continue;

          // Gentle center gravity (drifts towards universe center without collapsing)
          const distToCenter = Math.hypot(b1.x, b1.y);
          if (distToCenter > 300) {
            b1.vx -= (b1.x / distToCenter) * 0.04;
            b1.vy -= (b1.y / distToCenter) * 0.04;
          }

          // Gentle ambient float
          b1.x += b1.vx;
          b1.y += b1.vy;
          b1.vx *= 0.985; // Damping
          b1.vy *= 0.985;

          // Soft sinusoidal wave for organic buoyancy
          b1.vy += Math.sin(currentTime * 0.0015 + i) * 0.02;

          // Bubble-to-Bubble Collision Avoidance
          for (let j = i + 1; j < bubbles.length; j++) {
            const b2 = bubbles[j];
            const dx = b2.x - b1.x;
            const dy = b2.y - b1.y;
            const dist = Math.hypot(dx, dy) || 1;
            const minDist = b1.radius + b2.radius + 18; // Soft buffer space

            if (dist < minDist) {
              const overlap = (minDist - dist) * 0.5;
              const nx = dx / dist;
              const ny = dy / dist;

              if (b1 !== draggedBubbleRef.current) {
                b1.x -= nx * overlap * 0.5;
                b1.y -= ny * overlap * 0.5;
                b1.vx -= nx * 0.1;
                b1.vy -= ny * 0.1;
              }
              if (b2 !== draggedBubbleRef.current) {
                b2.x += nx * overlap * 0.5;
                b2.y += ny * overlap * 0.5;
                b2.vx += nx * 0.1;
                b2.vy += ny * 0.1;
              }
            }
          }
        }
      }

      // 5. Draw Bubbles
      for (const b of bubbles) {
        const isHovered = hoveredBubbleIdRef.current === b.id;
        const isSelected = selectedIdeaId === b.id;
        const isDragged = draggedBubbleRef.current === b;

        // Outer Glow
        if (isHovered || isSelected || isDragged) {
          ctx.save();
          ctx.shadowColor = b.color;
          ctx.shadowBlur = isSelected ? 30 : 20;
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.radius + 4, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
          ctx.fill();
          ctx.restore();
        }

        // Translucent Spherical Body
        const gradient = ctx.createRadialGradient(
          b.x - b.radius * 0.35,
          b.y - b.radius * 0.35,
          b.radius * 0.1,
          b.x,
          b.y,
          b.radius
        );

        // Curated iridescent gradient
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
        gradient.addColorStop(0.4, `${b.color}44`);
        gradient.addColorStop(0.85, `${b.color}18`);
        gradient.addColorStop(1, 'rgba(11, 13, 18, 0.7)');

        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Subtle Border Ring
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.strokeStyle = isSelected
          ? '#F4F0E8'
          : isHovered
          ? `${b.color}cc`
          : `${b.color}55`;
        ctx.lineWidth = isSelected ? 2.5 : 1.2;
        ctx.stroke();

        // Top-left Specular Highlight
        ctx.beginPath();
        ctx.ellipse(
          b.x - b.radius * 0.35,
          b.y - b.radius * 0.38,
          b.radius * 0.28,
          b.radius * 0.14,
          Math.PI / 4,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fill();

        // Title and Category Text Inside Bubble
        ctx.fillStyle = '#F4F0E8';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '600 12px "Plus Jakarta Sans", sans-serif';

        // Truncate title to fit bubble width
        let title = b.idea.title || 'Spark';
        const maxTextWidth = b.radius * 1.6;
        if (ctx.measureText(title).width > maxTextWidth) {
          while (title.length > 3 && ctx.measureText(title + '...').width > maxTextWidth) {
            title = title.slice(0, -1);
          }
          title += '...';
        }

        ctx.fillText(title, b.x, b.y - (b.idea.category ? 5 : 0));

        // Category Subtitle
        if (b.idea.category) {
          ctx.fillStyle = `${b.color}dd`;
          ctx.font = '500 9px "Plus Jakarta Sans", sans-serif';
          let catName = b.idea.category.name;
          if (catName.length > 15) catName = catName.slice(0, 13) + '..';
          ctx.fillText(catName, b.x, b.y + 11);
        }

        // Status / Milestone Indicator Dot
        if (b.idea.status === 'ACTIVE_PROJECT') {
          ctx.beginPath();
          ctx.arc(b.x + b.radius * 0.65, b.y - b.radius * 0.65, 5, 0, Math.PI * 2);
          ctx.fillStyle = '#10B981';
          ctx.fill();
        } else if (b.idea.status === 'DEVELOPING') {
          ctx.beginPath();
          ctx.arc(b.x + b.radius * 0.65, b.y - b.radius * 0.65, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#38BDF8';
          ctx.fill();
        }
      }

      ctx.restore();

      animFrameIdRef.current = requestAnimationFrame(loop);
    };

    animFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [connections, selectedIdeaId, reducedMotion, physicsPaused]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- Mouse / Touch Interaction Handlers ---

  const findBubbleAt = (screenX: number, screenY: number): PhysicsBubble | null => {
    const world = screenToWorld(screenX, screenY);
    for (let i = bubblesRef.current.length - 1; i >= 0; i--) {
      const b = bubblesRef.current[i];
      const dist = Math.hypot(b.x - world.x, b.y - world.y);
      if (dist <= b.radius) {
        return b;
      }
    }
    return null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    hasMovedRef.current = false;
    const clickedBubble = findBubbleAt(e.clientX, e.clientY);

    if (clickedBubble) {
      draggedBubbleRef.current = clickedBubble;
      dragStartPosRef.current = { x: e.clientX, y: e.clientY };
    } else {
      isPanningRef.current = true;
      panStartRef.current = {
        x: e.clientX - transformRef.current.x,
        y: e.clientY - transformRef.current.y,
      };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // Hover detection
    const hovered = findBubbleAt(e.clientX, e.clientY);
    hoveredBubbleIdRef.current = hovered ? hovered.id : null;
    if (canvasRef.current) {
      canvasRef.current.style.cursor = hovered
        ? 'pointer'
        : isPanningRef.current
        ? 'grabbing'
        : 'default';
    }

    // Panning canvas
    if (isPanningRef.current) {
      hasMovedRef.current = true;
      setTransform((prev) => ({
        ...prev,
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y,
      }));
      return;
    }

    // Dragging bubble
    if (draggedBubbleRef.current) {
      hasMovedRef.current = true;
      const world = screenToWorld(e.clientX, e.clientY);
      draggedBubbleRef.current.x = world.x;
      draggedBubbleRef.current.y = world.y;
      draggedBubbleRef.current.vx = 0;
      draggedBubbleRef.current.vy = 0;
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    // If was dragging bubble and actually moved, persist position
    if (draggedBubbleRef.current && hasMovedRef.current) {
      const b = draggedBubbleRef.current;
      updateIdeaPosition(b.id, b.x, b.y);
    } else if (draggedBubbleRef.current && !hasMovedRef.current) {
      // Just a clean click -> open idea workspace!
      selectIdea(draggedBubbleRef.current.id);
    }

    draggedBubbleRef.current = null;
    isPanningRef.current = false;
  };

  // Zooming via Wheel
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = 1.08;
    const direction = e.deltaY > 0 ? 1 / zoomFactor : zoomFactor;

    setTransform((prev) => {
      const newScale = Math.min(Math.max(prev.scale * direction, 0.25), 3.0);
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      // Zoom centered on mouse
      const newX = mouseX - (mouseX - prev.x) * (newScale / prev.scale);
      const newY = mouseY - (mouseY - prev.y) * (newScale / prev.scale);

      return { x: newX, y: newY, scale: newScale };
    });
  };

  // Canvas Control Buttons (Zoom In, Zoom Out, Center, Pause)
  const handleZoom = (inOut: 'in' | 'out') => {
    const factor = inOut === 'in' ? 1.25 : 0.8;
    setTransform((prev) => {
      const newScale = Math.min(Math.max(prev.scale * factor, 0.25), 3.0);
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      return {
        x: centerX - (centerX - prev.x) * (newScale / prev.scale),
        y: centerY - (centerY - prev.y) * (newScale / prev.scale),
        scale: newScale,
      };
    });
  };

  const handleResetCenter = () => {
    setTransform({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2 - 20,
      scale: 1,
    });
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-midnight-900">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        className="w-full h-full block"
      />

      {/* Floating Canvas Controls */}
      <div className="absolute bottom-24 right-6 flex flex-col gap-2 z-20">
        <button
          onClick={() => handleZoom('in')}
          title="Zoom In"
          className="w-9 h-9 rounded-full glass-panel flex items-center justify-center text-ivory-100 hover:text-white hover:border-cosmic-lavender transition-all"
        >
          <span className="text-lg font-bold">+</span>
        </button>
        <button
          onClick={() => handleZoom('out')}
          title="Zoom Out"
          className="w-9 h-9 rounded-full glass-panel flex items-center justify-center text-ivory-100 hover:text-white hover:border-cosmic-lavender transition-all"
        >
          <span className="text-lg font-bold">−</span>
        </button>
        <button
          onClick={handleResetCenter}
          title="Recenter Universe"
          className="w-9 h-9 rounded-full glass-panel flex items-center justify-center text-ivory-100 hover:text-white hover:border-cosmic-lavender transition-all text-xs"
        >
          ◎
        </button>
      </div>
    </div>
  );
};
