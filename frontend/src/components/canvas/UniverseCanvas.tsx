import React, { useRef, useEffect } from 'react';
import { useIdeas } from '../../context/IdeaContext';
import { Idea } from '../../types';

interface PhysicsBubble {
  id: string;
  idea: Idea;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  scale: number;
  categoryColor: string;
  phase: number;
  hoverProgress: number;
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

  // Interaction tracking refs
  const draggedBubbleRef = useRef<PhysicsBubble | null>(null);
  const dragStartPosRef = useRef({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);
  const hoveredBubbleIdRef = useRef<string | null>(null);
  const lastMousePosRef = useRef({ x: 0, y: 0 });

  // Floating outside tooltip refs
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const tooltipTitleRef = useRef<HTMLSpanElement | null>(null);
  const tooltipCatRef = useRef<HTMLSpanElement | null>(null);

  // Simulation state
  const bubblesRef = useRef<PhysicsBubble[]>([]);
  const animFrameIdRef = useRef<number | null>(null);

  // Initialize or update bubbles from ideas
  useEffect(() => {
    const currentMap = new Map(bubblesRef.current.map((b) => [b.id, b]));
    const width = window.innerWidth;
    const height = window.innerHeight;

    const updated: PhysicsBubble[] = ideas.map((idea, index) => {
      const existing = currentMap.get(idea.id);
      const catColor = idea.category?.color_hex || '#B8A5E8';

      // Base radius varies naturally to create composition depth (50px to 80px)
      const depth = (idea.notes_count || 0) + (idea.tasks_count || 0);
      const baseRadius = 50 + (idea.importance || 3) * 4.5 + Math.min(depth * 2.5, 12);

      if (existing) {
        existing.idea = idea;
        existing.baseRadius = baseRadius;
        existing.categoryColor = catColor;
        return existing;
      }

      // Initial distributed positions across screen
      let x = idea.canvas_x || 0;
      let y = idea.canvas_y || 0;

      if (!x || !y || x === 0) {
        const angle = (index / Math.max(ideas.length, 1)) * Math.PI * 2;
        const dist = 130 + (index % 4) * 85;
        x = width / 2 + Math.cos(angle) * dist;
        y = height / 2 + Math.sin(angle) * dist;
      } else {
        // Offset saved relative canvas coords to screen center
        x = width / 2 + x;
        y = height / 2 + y;
      }

      // Ensure within screen margins
      x = Math.max(baseRadius + 25, Math.min(width - baseRadius - 25, x));
      y = Math.max(baseRadius + 85, Math.min(height - baseRadius - 100, y));

      // Speed inversely proportional to size for realistic floatiness
      const speed = (85 / baseRadius) * 0.38;
      const moveAngle = Math.random() * Math.PI * 2;

      return {
        id: idea.id,
        idea,
        x,
        y,
        vx: Math.cos(moveAngle) * speed,
        vy: Math.sin(moveAngle) * speed,
        radius: baseRadius,
        baseRadius,
        scale: 1,
        categoryColor: catColor,
        phase: Math.random() * Math.PI * 2,
        hoverProgress: 0,
      };
    });

    bubblesRef.current = updated;
  }, [ideas]);

  // Main Animation and Physics Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.05);
      lastTime = currentTime;

      const width = canvas.width;
      const height = canvas.height;

      // 1. Clear with transparent wash to reveal warm ivory background
      ctx.clearRect(0, 0, width, height);

      // 2. Draw Gentle Idea Connections (Delicate gossamer pearlescent thread with shimmer)
      const bubbleMap = new Map(bubblesRef.current.map((b) => [b.id, b]));
      for (const conn of connections) {
        const b1 = bubbleMap.get(conn.source_idea_id);
        const b2 = bubbleMap.get(conn.target_idea_id);
        if (b1 && b2) {
          ctx.beginPath();
          ctx.moveTo(b1.x, b1.y);
          // Elegant gentle quadratic curve
          const midX = (b1.x + b2.x) / 2 + (b2.y - b1.y) * 0.12;
          const midY = (b1.y + b2.y) / 2 + (b1.x - b2.x) * 0.12;
          ctx.quadraticCurveTo(midX, midY, b2.x, b2.y);
          ctx.strokeStyle = 'rgba(201, 143, 164, 0.45)';
          ctx.lineWidth = 1.4;
          ctx.setLineDash([4, 6]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      // 3. Update Physics Simulation
      const bubbles = bubblesRef.current;
      const topBoundary = 78; // Below top navbar
      const bottomBoundary = height - 95; // Above quick capture bar

      if (!physicsPaused && !reducedMotion) {
        for (let i = 0; i < bubbles.length; i++) {
          const b1 = bubbles[i];

          // Skip physics update while dragging
          if (b1 === draggedBubbleRef.current) continue;

          // Organic buoyancy & micro-currents (distinct frequency per bubble)
          b1.phase += dt * 1.1;
          const driftX = Math.cos(b1.phase * 0.75 + i * 1.2) * 0.07;
          const driftY = Math.sin(b1.phase * 0.65 + i * 0.9) * 0.09;

          b1.vx += driftX;
          b1.vy += driftY;

          // Apply velocity
          b1.x += b1.vx;
          b1.y += b1.vy;

          // Natural air resistance / velocity dampening
          b1.vx *= 0.993;
          b1.vy *= 0.993;

          // Boundary Collisions (Soft elastic bounce off canvas borders)
          const r = b1.radius;
          const restitution = 0.85; // Bounce elasticity

          if (b1.x - r < 20) {
            b1.x = 20 + r;
            b1.vx = Math.abs(b1.vx) * restitution;
          } else if (b1.x + r > width - 20) {
            b1.x = width - 20 - r;
            b1.vx = -Math.abs(b1.vx) * restitution;
          }

          if (b1.y - r < topBoundary) {
            b1.y = topBoundary + r;
            b1.vy = Math.abs(b1.vy) * restitution;
          } else if (b1.y + r > bottomBoundary) {
            b1.y = bottomBoundary - r;
            b1.vy = -Math.abs(b1.vy) * restitution;
          }

          // Bubble-to-Bubble Elastic Collisions (Preserve perfect circles)
          for (let j = i + 1; j < bubbles.length; j++) {
            const b2 = bubbles[j];
            const dx = b2.x - b1.x;
            const dy = b2.y - b1.y;
            const dist = Math.hypot(dx, dy) || 1;
            const minDist = b1.radius + b2.radius + 6; // Soft cushion margin

            if (dist < minDist) {
              const overlap = (minDist - dist) * 0.5;
              const nx = dx / dist;
              const ny = dy / dist;

              // Separate overlapping bubbles gently without squashing
              if (b1 !== draggedBubbleRef.current) {
                b1.x -= nx * overlap;
                b1.y -= ny * overlap;
              }
              if (b2 !== draggedBubbleRef.current) {
                b2.x += nx * overlap;
                b2.y += ny * overlap;
              }

              // Elastic impulse exchange
              const kx = b1.vx - b2.vx;
              const ky = b1.vy - b2.vy;
              const p = (2 * (nx * kx + ny * ky)) / (b1.baseRadius + b2.baseRadius);

              if (b1 !== draggedBubbleRef.current) {
                b1.vx -= p * b2.baseRadius * nx * 0.82;
                b1.vy -= p * b2.baseRadius * ny * 0.82;
              }
              if (b2 !== draggedBubbleRef.current) {
                b2.vx += p * b1.baseRadius * nx * 0.82;
                b2.vy += p * b1.baseRadius * ny * 0.82;
              }
            }
          }
        }
      }

      // 4. Render Physical Iridescent Soap Bubbles
      for (let i = 0; i < bubbles.length; i++) {
        const b = bubbles[i];
        const isHovered = hoveredBubbleIdRef.current === b.id;
        const isSelected = selectedIdeaId === b.id;

        // Smooth hover scale animation (enlarges by 8%, perfectly circular)
        const targetHover = isHovered || isSelected ? 1 : 0;
        b.hoverProgress += (targetHover - b.hoverProgress) * 0.16;
        b.radius = b.baseRadius * (1 + b.hoverProgress * 0.08);

        const r = b.radius;
        const x = b.x;
        const y = b.y;

        // A. Delicate Soft Ambient Shadow below bubble (spherical depth without weight)
        ctx.save();
        ctx.shadowColor = 'rgba(73, 54, 59, 0.06)';
        ctx.shadowBlur = r * 0.45;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = r * 0.25;
        ctx.beginPath();
        ctx.arc(x, y, r - 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.01)';
        ctx.fill();
        ctx.restore();

        // B. Clear Translucent Interior (97% clear air, background completely visible)
        const coreGradient = ctx.createRadialGradient(
          x - r * 0.22,
          y - r * 0.26,
          r * 0.05,
          x,
          y,
          r
        );
        coreGradient.addColorStop(0, 'rgba(255, 252, 248, 0.08)');
        coreGradient.addColorStop(0.5, 'rgba(255, 252, 248, 0.02)');
        coreGradient.addColorStop(0.82, 'rgba(248, 229, 233, 0.06)');
        coreGradient.addColorStop(0.94, 'rgba(239, 203, 213, 0.12)');
        coreGradient.addColorStop(1, 'rgba(255, 240, 245, 0.18)');

        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = coreGradient;
        ctx.fill();

        // C. Shifting Rainbow Iridescence along Edge (Thin-film interference fringe)
        const timeShift = currentTime * 0.0005 + b.phase;
        const rx1 = x - r * Math.cos(timeShift);
        const ry1 = y - r * Math.sin(timeShift);
        const rx2 = x + r * Math.cos(timeShift);
        const ry2 = y + r * Math.sin(timeShift);

        const rimGradient = ctx.createLinearGradient(rx1, ry1, rx2, ry2);
        rimGradient.addColorStop(0.00, 'rgba(239, 203, 213, 0.65)'); // Powder pink
        rimGradient.addColorStop(0.20, 'rgba(182, 232, 238, 0.55)'); // Luminous cyan
        rimGradient.addColorStop(0.45, 'rgba(233, 216, 185, 0.55)'); // Pale champagne gold
        rimGradient.addColorStop(0.70, 'rgba(201, 143, 164, 0.60)'); // Muted rose
        rimGradient.addColorStop(0.88, 'rgba(157, 123, 138, 0.45)'); // Muted mauve
        rimGradient.addColorStop(1.00, 'rgba(239, 203, 213, 0.65)'); // Powder pink loop

        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.strokeStyle = rimGradient;
        ctx.lineWidth = isSelected ? 2.2 : (isHovered ? 1.8 : 1.3);
        ctx.stroke();

        // D. Inner Grazing-Angle Reflection Line
        ctx.beginPath();
        ctx.arc(x, y, r - 1.4, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // E. Primary Upper-Left Crescent Specular Highlight (Follows sphere curvature)
        // 1. Curved crescent stroke along perimeter
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, r - 2.2, -Math.PI * 0.85, -Math.PI * 0.22);
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.88)';
        ctx.lineWidth = Math.max(1.5, r * 0.035);
        ctx.stroke();
        ctx.restore();

        // 2. Soft elliptical specular glint inside curvature
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(
          x - r * 0.36,
          y - r * 0.38,
          r * 0.28,
          r * 0.13,
          -Math.PI / 4,
          0,
          Math.PI * 2
        );
        const specGrad = ctx.createLinearGradient(
          x - r * 0.5,
          y - r * 0.5,
          x - r * 0.2,
          y - r * 0.25
        );
        specGrad.addColorStop(0.0, 'rgba(255, 255, 255, 0.95)');
        specGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.45)');
        specGrad.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');
        ctx.fillStyle = specGrad;
        ctx.fill();
        ctx.restore();

        // 3. Tiny brilliant daylight sparkle
        ctx.beginPath();
        ctx.arc(x - r * 0.46, y - r * 0.44, Math.max(1.8, r * 0.04), 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.98)';
        ctx.fill();

        // F. Secondary Bottom-Right Curved Bounce (Ground reflection)
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, r - 2.2, Math.PI * 0.15, Math.PI * 0.65);
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'rgba(157, 227, 236, 0.45)';
        ctx.lineWidth = Math.max(1.2, r * 0.025);
        ctx.stroke();
        ctx.restore();

        // Soft bottom-right interior sheen
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(
          x + r * 0.30,
          y + r * 0.32,
          r * 0.22,
          r * 0.09,
          -Math.PI / 4,
          0,
          Math.PI * 2
        );
        const botGrad = ctx.createLinearGradient(
          x + r * 0.15,
          y + r * 0.20,
          x + r * 0.40,
          y + r * 0.40
        );
        botGrad.addColorStop(0, 'rgba(216, 197, 244, 0.32)');
        botGrad.addColorStop(0.5, 'rgba(157, 227, 236, 0.32)');
        botGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = botGrad;
        ctx.fill();
        ctx.restore();

        // G. (Bubbles are purely visual objects: no text or labels rendered on the bubble)
      }

      // Update Floating Outside Hover Tooltip
      if (tooltipRef.current) {
        const hoveredB = bubbles.find((b) => b.id === hoveredBubbleIdRef.current);
        if (hoveredB) {
          tooltipRef.current.style.opacity = '1';
          tooltipRef.current.style.transform = `translate3d(${hoveredB.x}px, ${hoveredB.y - hoveredB.radius - 12}px, 0) translate(-50%, -100%)`;
          if (tooltipTitleRef.current) {
            tooltipTitleRef.current.textContent = hoveredB.idea.title || 'Spark';
          }
          if (tooltipCatRef.current) {
            if (hoveredB.idea.category?.name) {
              tooltipCatRef.current.textContent = hoveredB.idea.category.name.toLowerCase();
              tooltipCatRef.current.style.display = 'block';
            } else {
              tooltipCatRef.current.style.display = 'none';
            }
          }
        } else {
          tooltipRef.current.style.opacity = '0';
        }
      }

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

  // --- Mouse & Touch Interaction Handlers ---

  const findBubbleAt = (screenX: number, screenY: number): PhysicsBubble | null => {
    for (let i = bubblesRef.current.length - 1; i >= 0; i--) {
      const b = bubblesRef.current[i];
      const dist = Math.hypot(b.x - screenX, b.y - screenY);
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
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // Hover detection
    const hovered = findBubbleAt(e.clientX, e.clientY);
    hoveredBubbleIdRef.current = hovered ? hovered.id : null;
    if (canvasRef.current) {
      canvasRef.current.style.cursor = hovered ? 'pointer' : 'default';
    }

    // Dragging bubble (strictly preserves circular geometry)
    if (draggedBubbleRef.current) {
      hasMovedRef.current = true;
      const dx = e.clientX - lastMousePosRef.current.x;
      const dy = e.clientY - lastMousePosRef.current.y;

      draggedBubbleRef.current.x = e.clientX;
      draggedBubbleRef.current.y = e.clientY;

      // Transfer release impulse
      draggedBubbleRef.current.vx = dx * 0.42;
      draggedBubbleRef.current.vy = dy * 0.42;

      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseUp = () => {
    if (draggedBubbleRef.current) {
      const b = draggedBubbleRef.current;
      if (hasMovedRef.current) {
        // Persist relative position to center
        const relX = b.x - window.innerWidth / 2;
        const relY = b.y - window.innerHeight / 2;
        updateIdeaPosition(b.id, relX, relY);
      } else {
        // Clean click -> open idea workspace
        selectIdea(b.id);
      }
    }

    draggedBubbleRef.current = null;
  };

  // Touch support for mobile devices
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      hasMovedRef.current = false;
      const clicked = findBubbleAt(touch.clientX, touch.clientY);
      if (clicked) {
        draggedBubbleRef.current = clicked;
        dragStartPosRef.current = { x: touch.clientX, y: touch.clientY };
        lastMousePosRef.current = { x: touch.clientX, y: touch.clientY };
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (draggedBubbleRef.current && e.touches.length === 1) {
      hasMovedRef.current = true;
      const touch = e.touches[0];
      const dx = touch.clientX - lastMousePosRef.current.x;
      const dy = touch.clientY - lastMousePosRef.current.y;

      draggedBubbleRef.current.x = touch.clientX;
      draggedBubbleRef.current.y = touch.clientY;
      draggedBubbleRef.current.vx = dx * 0.42;
      draggedBubbleRef.current.vy = dy * 0.42;
      lastMousePosRef.current = { x: touch.clientX, y: touch.clientY };
    }
  };

  const handleTouchEnd = () => {
    handleMouseUp();
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="w-full h-full block"
      />

      {/* Floating Outside Hover Tooltip */}
      <div
        ref={tooltipRef}
        className="pointer-events-none absolute z-30 transition-opacity duration-150 top-0 left-0 opacity-0"
      >
        <div className="bg-pearl/95 backdrop-blur-md border border-powder/80 shadow-[0_4px_20px_rgba(73,54,59,0.08)] rounded-xl px-3.5 py-1.5 flex flex-col items-center gap-0.5 text-center whitespace-nowrap">
          <span ref={tooltipTitleRef} className="font-serif text-sm font-semibold text-cocoa tracking-wide" />
          <span ref={tooltipCatRef} className="font-editorial italic text-xs text-mauve hidden lowercase" />
        </div>
        <div className="w-2 h-2 bg-pearl border-b border-r border-powder/80 rotate-45 mx-auto -mt-1" />
      </div>
    </div>
  );
};
