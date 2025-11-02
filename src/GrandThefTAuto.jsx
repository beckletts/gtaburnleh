import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Car, MapPin, Trophy, Heart, Star, Clock, Volume2, Key } from 'lucide-react';

const GrandThefTAuto = () => {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('menu');
  const [isometricView, setIsometricView] = useState(false); // Start with orthographic for clarity
  const [showTutorial, setShowTutorial] = useState(true); // Show tutorial on first start
  
  // Expanded world for realistic Lancashire scale
  const WORLD_WIDTH = 3600;
  const WORLD_HEIGHT = 3600;
  const VIEWPORT_WIDTH = 1000;
  const VIEWPORT_HEIGHT = 700;
  const ZOOM_FACTOR = 1.5; // Zoom in 1.5x for better GTA-style view and easier lane control

  // Isometric projection settings
  const TILE_WIDTH = 32;  // Width of isometric tile diamond
  const TILE_HEIGHT = 16; // Height of isometric tile diamond
  const ISO_ANGLE = Math.PI / 4; // 45 degree angle for isometric

  // Isometric transformation functions
  const worldToIso = (worldX, worldY) => {
    // Convert world coordinates to isometric coordinates
    const isoX = (worldX - worldY) * Math.cos(ISO_ANGLE);
    const isoY = (worldX + worldY) * Math.sin(ISO_ANGLE);
    return { x: isoX, y: isoY };
  };

  const isoToWorld = (isoX, isoY) => {
    // Convert isometric coordinates back to world coordinates
    const worldX = (isoX / Math.cos(ISO_ANGLE) + isoY / Math.sin(ISO_ANGLE)) / 2;
    const worldY = (isoY / Math.sin(ISO_ANGLE) - isoX / Math.cos(ISO_ANGLE)) / 2;
    return { x: worldX, y: worldY };
  };

  // Sprite system
  const [sprites, setSprites] = useState({});
  const [spritesLoaded, setSpritesLoaded] = useState(false);

  // Generate vehicle sprites (pixel art style)
  const generateVehicleSprite = (color, vehicleType, direction) => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');

    ctx.imageSmoothingEnabled = false;

    // Center point
    ctx.translate(16, 16);
    ctx.rotate(direction);

    // Helper function for darker shade
    const darken = (c) => {
      const col = parseInt(c.replace('#',''), 16);
      const r = Math.max(0, ((col >> 16) & 255) - 40);
      const g = Math.max(0, ((col >> 8) & 255) - 40);
      const b = Math.max(0, (col & 255) - 40);
      return `rgb(${r},${g},${b})`;
    };

    // Draw vehicle based on type
    if (vehicleType === 'boy_racer') {
      // Sports car - sleek design with GTA1 style
      // Black outline/shadow
      ctx.fillStyle = '#000';
      ctx.fillRect(-10, -6, 20, 12);

      // Main body (darker shade on bottom)
      ctx.fillStyle = darken(color);
      ctx.fillRect(-9, -5, 18, 5);
      ctx.fillStyle = color;
      ctx.fillRect(-9, -5, 18, 10);

      // White racing stripe (GTA style)
      ctx.fillStyle = '#fff';
      ctx.fillRect(-9, -1, 18, 2);
      ctx.fillRect(-9, 0, 18, 1);

      // Windscreen (darker, more defined)
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(3, -4, 5, 8);
      ctx.fillStyle = '#1a1a2a';
      ctx.fillRect(4, -3, 3, 6);

      // Headlights (brighter yellow)
      ctx.fillStyle = '#ffff00';
      ctx.fillRect(8, -4, 1, 2);
      ctx.fillRect(8, 2, 1, 2);

      // Taillights (brighter red)
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(-9, -4, 1, 2);
      ctx.fillRect(-9, 2, 1, 2);

      // Wheels with detail
      ctx.fillStyle = '#000';
      ctx.fillRect(-7, -6, 4, 2);
      ctx.fillRect(-7, 4, 4, 2);
      ctx.fillRect(3, -6, 4, 2);
      ctx.fillRect(3, 4, 4, 2);

      // Wheel hubs
      ctx.fillStyle = '#444';
      ctx.fillRect(-6, -5, 2, 1);
      ctx.fillRect(-6, 4, 2, 1);
      ctx.fillRect(4, -5, 2, 1);
      ctx.fillRect(4, 4, 2, 1);

      // Spoiler (more pronounced)
      ctx.fillStyle = '#000';
      ctx.fillRect(-10, -4, 1, 8);
      ctx.fillRect(-11, -3, 2, 6);

    } else if (vehicleType === 'police') {
      // Police car - Classic GTA style
      // Black outline
      ctx.fillStyle = '#000';
      ctx.fillRect(-10, -6, 20, 12);

      // White/light blue body
      ctx.fillStyle = '#e8e8f0';
      ctx.fillRect(-9, -5, 18, 10);

      // Blue stripe (classic police livery)
      ctx.fillStyle = '#0051ba';
      ctx.fillRect(-9, -2, 18, 4);

      // "POLICE" text representation with pixels
      ctx.fillStyle = '#fff';
      ctx.fillRect(-2, -1, 1, 1);
      ctx.fillRect(0, -1, 1, 1);
      ctx.fillRect(2, -1, 1, 1);

      // Flashing siren (red and blue)
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(-2, -6, 2, 1);
      ctx.fillStyle = '#0051ff';
      ctx.fillRect(0, -6, 2, 1);

      // Windscreen
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(3, -4, 5, 8);
      ctx.fillStyle = '#1a2a3a';
      ctx.fillRect(4, -3, 3, 6);

      // Headlights
      ctx.fillStyle = '#fff';
      ctx.fillRect(8, -4, 1, 2);
      ctx.fillRect(8, 2, 1, 2);

      // Taillights
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(-9, -4, 1, 2);
      ctx.fillRect(-9, 2, 1, 2);

      // Wheels
      ctx.fillStyle = '#000';
      ctx.fillRect(-7, -6, 4, 2);
      ctx.fillRect(-7, 4, 4, 2);
      ctx.fillRect(3, -6, 4, 2);
      ctx.fillRect(3, 4, 4, 2);

      // Wheel hubs
      ctx.fillStyle = '#444';
      ctx.fillRect(-6, -5, 2, 1);
      ctx.fillRect(-6, 4, 2, 1);
      ctx.fillRect(4, -5, 2, 1);
      ctx.fillRect(4, 4, 2, 1);

    } else if (vehicleType === 'van') {
      // Van - boxy design, GTA style
      // Black outline
      ctx.fillStyle = '#000';
      ctx.fillRect(-11, -7, 22, 14);

      // Main body
      ctx.fillStyle = darken(color);
      ctx.fillRect(-10, -6, 20, 6);
      ctx.fillStyle = color;
      ctx.fillRect(-10, -6, 20, 12);

      // Windscreen (front)
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(6, -5, 4, 10);
      ctx.fillStyle = '#1a2a3a';
      ctx.fillRect(7, -4, 2, 8);

      // Side windows (dark)
      ctx.fillStyle = '#1a1a2a';
      ctx.fillRect(-4, -5, 6, 3);
      ctx.fillRect(-4, 2, 6, 3);

      // Door lines
      ctx.fillStyle = '#000';
      ctx.fillRect(0, -6, 1, 12);
      ctx.fillRect(-5, -6, 1, 12);

      // Headlights
      ctx.fillStyle = '#fff';
      ctx.fillRect(9, -5, 1, 2);
      ctx.fillRect(9, 3, 1, 2);

      // Taillights
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(-10, -5, 1, 2);
      ctx.fillRect(-10, 3, 1, 2);

      // Wheels (larger for van)
      ctx.fillStyle = '#000';
      ctx.fillRect(-8, -7, 4, 2);
      ctx.fillRect(-8, 5, 4, 2);
      ctx.fillRect(4, -7, 4, 2);
      ctx.fillRect(4, 5, 4, 2);

      // Wheel hubs
      ctx.fillStyle = '#444';
      ctx.fillRect(-7, -6, 2, 1);
      ctx.fillRect(-7, 5, 2, 1);
      ctx.fillRect(5, -6, 2, 1);
      ctx.fillRect(5, 5, 2, 1);

    } else if (vehicleType === 'range_rover') {
      // SUV - tall and boxy, GTA style
      // Black outline
      ctx.fillStyle = '#000';
      ctx.fillRect(-10, -7, 20, 14);

      // Main body (tall)
      ctx.fillStyle = darken(color);
      ctx.fillRect(-9, -6, 18, 6);
      ctx.fillStyle = color;
      ctx.fillRect(-9, -6, 18, 12);

      // Chrome trim/bumper
      ctx.fillStyle = '#c0c0c0';
      ctx.fillRect(-9, -6, 18, 1);
      ctx.fillRect(-9, 5, 18, 1);
      ctx.fillRect(7, -6, 2, 12);

      // Windscreen (larger for SUV)
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(2, -5, 5, 10);
      ctx.fillStyle = '#1a2a3a';
      ctx.fillRect(3, -4, 3, 8);

      // Side windows
      ctx.fillStyle = '#1a2a3a';
      ctx.fillRect(-5, -5, 6, 3);
      ctx.fillRect(-5, 2, 6, 3);

      // Headlights (bigger)
      ctx.fillStyle = '#fff';
      ctx.fillRect(8, -5, 1, 2);
      ctx.fillRect(8, 3, 1, 2);

      // Taillights
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(-9, -5, 1, 2);
      ctx.fillRect(-9, 3, 1, 2);

      // Wheels (bigger for SUV)
      ctx.fillStyle = '#000';
      ctx.fillRect(-7, -7, 5, 3);
      ctx.fillRect(-7, 4, 5, 3);
      ctx.fillRect(3, -7, 5, 3);
      ctx.fillRect(3, 4, 5, 3);

      // Wheel hubs (larger)
      ctx.fillStyle = '#666';
      ctx.fillRect(-6, -6, 3, 2);
      ctx.fillRect(-6, 4, 3, 2);
      ctx.fillRect(4, -6, 3, 2);
      ctx.fillRect(4, 4, 3, 2);

    } else {
      // Normal car - generic sedan, GTA style
      // Black outline
      ctx.fillStyle = '#000';
      ctx.fillRect(-10, -6, 20, 12);

      // Main body with shading
      ctx.fillStyle = darken(color);
      ctx.fillRect(-9, -5, 18, 5);
      ctx.fillStyle = color;
      ctx.fillRect(-9, -5, 18, 10);

      // Windscreen
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(3, -4, 5, 8);
      ctx.fillStyle = '#1a2a3a';
      ctx.fillRect(4, -3, 3, 6);

      // Side windows
      ctx.fillStyle = '#1a2a3a';
      ctx.fillRect(-3, -4, 6, 2);
      ctx.fillRect(-3, 2, 6, 2);

      // Headlights
      ctx.fillStyle = '#ffff00';
      ctx.fillRect(8, -4, 1, 2);
      ctx.fillRect(8, 2, 1, 2);

      // Taillights
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(-9, -4, 1, 2);
      ctx.fillRect(-9, 2, 1, 2);

      // Wheels
      ctx.fillStyle = '#000';
      ctx.fillRect(-7, -6, 4, 2);
      ctx.fillRect(-7, 4, 4, 2);
      ctx.fillRect(3, -6, 4, 2);
      ctx.fillRect(3, 4, 4, 2);

      // Wheel hubs
      ctx.fillStyle = '#444';
      ctx.fillRect(-6, -5, 2, 1);
      ctx.fillRect(-6, 4, 2, 1);
      ctx.fillRect(4, -5, 2, 1);
      ctx.fillRect(4, 4, 2, 1);
    }

    return canvas;
  };

  // Generate pedestrian sprite - GTA style
  const generatePedSprite = (color, direction, frame = 0) => {
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');

    ctx.imageSmoothingEnabled = false;
    ctx.translate(8, 8);
    ctx.rotate(direction);

    // Walking animation offset
    const walkCycle = Math.sin(frame * 0.2) * 0.5;

    // Shadow (like GTA 1/2)
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(-3, 5, 6, 1);

    // Body with outline
    ctx.fillStyle = '#000';
    ctx.fillRect(-2.5, -4, 5, 8);

    ctx.fillStyle = color;
    ctx.fillRect(-2, -3.5, 4, 7);

    // Head with outline
    ctx.fillStyle = '#000';
    ctx.fillRect(-2, -6, 4, 2.5);

    ctx.fillStyle = '#ffdbac';
    ctx.fillRect(-1.5, -5.5, 3, 2);

    // Legs with walking animation
    ctx.fillStyle = '#000';
    ctx.fillRect(-2.5, 3, 2, 3.5);
    ctx.fillRect(0.5, 3, 2, 3.5);

    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(-2, 3.5 + walkCycle, 1.5, 3);
    ctx.fillRect(0.5, 3.5 - walkCycle, 1.5, 3);

    // Arms with walking animation
    ctx.fillStyle = '#000';
    ctx.fillRect(-3.5, -1, 1.5, 3);
    ctx.fillRect(2, -1, 1.5, 3);

    ctx.fillStyle = color;
    ctx.fillRect(-3, -0.5 + walkCycle, 1, 2.5);
    ctx.fillRect(2, -0.5 - walkCycle, 1, 2.5);

    return canvas;
  };

  // Helper function to get sprite direction index from angle
  const getDirectionIndex = (angle) => {
    // Normalize angle to 0-2π
    let normalized = angle % (Math.PI * 2);
    if (normalized < 0) normalized += Math.PI * 2;

    // Convert to 8 directions (0-7)
    // 0 = right, 1 = down-right, 2 = down, 3 = down-left, 4 = left, 5 = up-left, 6 = up, 7 = up-right
    const directionIndex = Math.round(normalized / (Math.PI / 4)) % 8;
    return directionIndex;
  };

  // Draw top-down building with height shadows
  const drawTopDownBuilding = (ctx, screenX, screenY, building, isDark) => {
    const { width, height, town, name, type } = building;

    // Building height for shadow (taller buildings = more layers)
    const buildingStories = type === 'residential' ? 2 : town === 'burnley' || town === 'blackburn' ? 4 : 3;
    const layerOffset = 2; // Pixel offset per floor layer
    const shadowOffset = buildingStories * 4; // Shadow extends based on height

    // Base color based on town
    let baseColor, roofColor, wallColor;
    if (town === 'burnley') {
      baseColor = '#8b4545';
      roofColor = '#6c1c3f';
      wallColor = '#6f3535';
    } else if (town === 'blackburn') {
      baseColor = '#4a6fa5';
      roofColor = '#0051ba';
      wallColor = '#3a5a85';
    } else if (town === 'whalley') {
      baseColor = '#d4af37';
      roofColor = '#b8960f';
      wallColor = '#b89f27';
    } else if (type === 'residential') {
      baseColor = '#c9b393';
      roofColor = '#8b6f47';
      wallColor = '#a99373';
    } else {
      baseColor = '#8b6f47';
      roofColor = '#6f5832';
      wallColor = '#6f5f37';
    }

    // Apply night darkening
    if (isDark) {
      baseColor = darkenColor(baseColor, 0.5);
      roofColor = darkenColor(roofColor, 0.5);
      wallColor = darkenColor(wallColor, 0.5);
    }

    // Draw graduated shadow (fading with distance)
    for (let i = buildingStories; i > 0; i--) {
      const shadowAlpha = 0.15 * (i / buildingStories); // Fade out as it gets further
      const offset = (buildingStories - i + 1) * 2;
      ctx.fillStyle = `rgba(0,0,0,${shadowAlpha})`;
      ctx.fillRect(
        screenX + offset,
        screenY + offset,
        width * ZOOM_FACTOR,
        height * ZOOM_FACTOR
      );
    }

    // Draw building layers to show height (each floor)
    for (let layer = buildingStories - 1; layer >= 0; layer--) {
      const layerX = screenX - (layer * layerOffset);
      const layerY = screenY - (layer * layerOffset);

      // Side wall (right edge - shows depth)
      if (layer > 0) {
        ctx.fillStyle = wallColor;
        ctx.fillRect(
          layerX + width * ZOOM_FACTOR,
          layerY,
          layerOffset,
          height * ZOOM_FACTOR + layerOffset
        );

        // Side wall (bottom edge - shows depth)
        ctx.fillRect(
          layerX,
          layerY + height * ZOOM_FACTOR,
          width * ZOOM_FACTOR + layerOffset,
          layerOffset
        );
      }

      // Building floor
      ctx.fillStyle = layer === 0 ? baseColor : darkenColor(baseColor, 0.9 - (layer * 0.1));
      ctx.fillRect(layerX, layerY, width * ZOOM_FACTOR, height * ZOOM_FACTOR);
    }

    // Draw roof (top layer)
    const topX = screenX - ((buildingStories - 1) * layerOffset);
    const topY = screenY - ((buildingStories - 1) * layerOffset);

    ctx.fillStyle = roofColor;
    ctx.fillRect(topX, topY, width * ZOOM_FACTOR, 5 * ZOOM_FACTOR); // Roof edge/overhang

    // Building outline on top layer
    ctx.strokeStyle = darkenColor(roofColor, 0.7);
    ctx.lineWidth = 1;
    ctx.strokeRect(topX, topY, width * ZOOM_FACTOR, height * ZOOM_FACTOR);

    // Windows for larger buildings (small dots for top-down view)
    if (width > 30 && height > 30) {
      ctx.fillStyle = isDark ? '#ffeb3b' : '#87ceeb';
      const windowSize = 2 * ZOOM_FACTOR;
      const windowSpacing = 8 * ZOOM_FACTOR;

      for (let wx = topX + 5 * ZOOM_FACTOR; wx < topX + width * ZOOM_FACTOR - 5 * ZOOM_FACTOR; wx += windowSpacing) {
        for (let wy = topY + 8 * ZOOM_FACTOR; wy < topY + height * ZOOM_FACTOR - 5 * ZOOM_FACTOR; wy += windowSpacing) {
          ctx.fillRect(wx, wy, windowSize, windowSize);
        }
      }
    }
  };

  // Draw isometric building with textures and details (legacy)
  const drawIsometricBuilding = (ctx, screenX, screenY, building, isDark) => {
    const { width, height, town, name } = building;

    // Building height (3D depth)
    const buildingHeight = 40;

    // Base color based on town
    let baseColor, accentColor, roofColor;
    if (town === 'burnley') {
      baseColor = '#8b4545';
      accentColor = '#6c1c3f';
      roofColor = '#5a1a2f';
    } else if (town === 'blackburn') {
      baseColor = '#4a6fa5';
      accentColor = '#0051ba';
      roofColor = '#003d8a';
    } else if (town === 'whalley') {
      baseColor = '#d4af37';
      accentColor = '#f5deb3';
      roofColor = '#b8960f';
    } else {
      baseColor = '#8b6f47';
      accentColor = '#a0826d';
      roofColor = '#6f5832';
    }

    // Apply night darkening
    if (isDark) {
      baseColor = darkenColor(baseColor, 0.5);
      accentColor = darkenColor(accentColor, 0.5);
      roofColor = darkenColor(roofColor, 0.5);
    }

    // Draw shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(screenX + 5, screenY + 5, width, height);

    // Draw building base (front face)
    ctx.fillStyle = baseColor;
    ctx.fillRect(screenX, screenY, width, height);

    // Draw brick/texture pattern
    ctx.strokeStyle = darkenColor(baseColor, 0.8);
    ctx.lineWidth = 0.5;

    // Horizontal lines (brick rows)
    for (let y = 0; y < height; y += 8) {
      ctx.beginPath();
      ctx.moveTo(screenX, screenY + y);
      ctx.lineTo(screenX + width, screenY + y);
      ctx.stroke();
    }

    // Vertical lines (brick columns - offset every other row)
    for (let y = 0; y < height; y += 16) {
      for (let x = 0; x < width; x += 16) {
        ctx.beginPath();
        ctx.moveTo(screenX + x, screenY + y);
        ctx.lineTo(screenX + x, screenY + y + 8);
        ctx.stroke();
      }
      for (let x = 8; x < width; x += 16) {
        ctx.beginPath();
        ctx.moveTo(screenX + x, screenY + y + 8);
        ctx.lineTo(screenX + x, screenY + y + 16);
        ctx.stroke();
      }
    }

    // Draw windows
    const windowsPerRow = Math.floor(width / 25);
    const windowRows = Math.floor(height / 30);

    for (let row = 0; row < windowRows; row++) {
      for (let col = 0; col < windowsPerRow; col++) {
        const wx = screenX + 10 + col * 25;
        const wy = screenY + 15 + row * 30;

        // Window frame
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(wx, wy, 12, 18);

        // Window glass (lit up at night)
        if (isDark) {
          ctx.fillStyle = Math.random() > 0.3 ? '#ffeb3b' : '#1a1a1a';
        } else {
          ctx.fillStyle = '#87ceeb';
        }
        ctx.fillRect(wx + 1, wy + 1, 10, 16);

        // Window divider
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(wx + 6, wy);
        ctx.lineTo(wx + 6, wy + 18);
        ctx.stroke();
      }
    }

    // Draw roof/top face (isometric)
    if (isometricView) {
      ctx.fillStyle = roofColor;
      ctx.beginPath();
      ctx.moveTo(screenX, screenY);
      ctx.lineTo(screenX + width / 2, screenY - 10);
      ctx.lineTo(screenX + width, screenY);
      ctx.lineTo(screenX + width / 2, screenY + 10);
      ctx.closePath();
      ctx.fill();

      // Roof details
      ctx.strokeStyle = darkenColor(roofColor, 0.7);
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Building outline
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(screenX, screenY, width, height);

    // Label
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 11px Arial';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.strokeText(name, screenX + 5, screenY - 5);
    ctx.fillText(name, screenX + 5, screenY - 5);
  };

  // Helper function to darken a hex color
  const darkenColor = (hex, factor) => {
    const rgb = parseInt(hex.slice(1), 16);
    const r = Math.floor(((rgb >> 16) & 255) * factor);
    const g = Math.floor(((rgb >> 8) & 255) * factor);
    const b = Math.floor((rgb & 255) * factor);
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  };

  // Initialize sprites on mount
  useEffect(() => {
    const loadSprites = () => {
      const newSprites = {};

      // 8 directions (N, NE, E, SE, S, SW, W, NW)
      const directions = [0, Math.PI/4, Math.PI/2, 3*Math.PI/4, Math.PI, 5*Math.PI/4, 3*Math.PI/2, 7*Math.PI/4];

      // Vehicle types
      const vehicleTypes = ['boy_racer', 'range_rover', 'van', 'police', 'normal_car'];

      vehicleTypes.forEach(type => {
        newSprites[type] = {};
        const color = vehicleStats[type]?.color || '#555';

        directions.forEach((dir, index) => {
          newSprites[type][index] = generateVehicleSprite(color, type, dir);
        });
      });

      // Pedestrian sprites
      const pedColors = ['#6c1c3f', '#0051ba', '#555', '#2c3e50'];
      newSprites.pedestrians = {};

      pedColors.forEach((color, colorIndex) => {
        newSprites.pedestrians[colorIndex] = {};
        directions.forEach((dir, index) => {
          newSprites.pedestrians[colorIndex][index] = generatePedSprite(color, dir);
        });
      });

      setSprites(newSprites);
      setSpritesLoaded(true);
    };

    loadSprites();
  }, []);

  const [player, setPlayer] = useState({
    x: 2350,  // Burnley town center - Church Street/St James St junction
    y: 720,   // St James's Street - main shopping area
    angle: 0,
    speed: 0,
    health: 100,
    maxHealth: 100,
    armor: 0,
    money: 0,
    respect: 0,
    wantedLevel: 0,
    vehicle: 'boy_racer',
    // Character stats
    stamina: 100,
    strength: 10,
    shooting: 10,
    driving: 10,
    stealth: 10,
    // Equipment
    weapon: 'fists',
    ammo: { pistol: 50, shotgun: 20, rifle: 100 },
    // Gang affiliation
    gang: 'burnley',
    gangRep: { burnley: 100, blackburn: -50, neutral: 0 }
  });
  
  // Camera follows player
  const [camera, setCamera] = useState({
    x: 0,
    y: 0
  });
  
  // Vehicle stats
  const vehicleStats = {
    boy_racer: { maxSpeed: 6, acceleration: 0.3, handling: 0.04, name: "Boy Racer", color: '#6c1c3f' },
    range_rover: { maxSpeed: 5, acceleration: 0.25, handling: 0.03, name: "Range Rover", color: '#2c3e50' },
    van: { maxSpeed: 4.5, acceleration: 0.2, handling: 0.025, name: "White Van", color: '#f5f5f5' },
    police: { maxSpeed: 6.5, acceleration: 0.35, handling: 0.045, name: "Police Car", color: '#fff' },
    normal_car: { maxSpeed: 5, acceleration: 0.25, handling: 0.035, name: "Regular Car", color: '#555' }
  };

  // Weapon stats
  const weaponStats = {
    fists: { damage: 5, range: 15, fireRate: 500, ammoType: null, name: "Fists" },
    bat: { damage: 15, range: 20, fireRate: 600, ammoType: null, name: "Cricket Bat" },
    pistol: { damage: 20, range: 150, fireRate: 300, ammoType: 'pistol', name: "Pistol" },
    shotgun: { damage: 40, range: 80, fireRate: 800, ammoType: 'shotgun', name: "Shotgun" },
    rifle: { damage: 30, range: 200, fireRate: 150, ammoType: 'rifle', name: "Rifle" }
  };

  // REALISTIC ROAD NETWORK - Scaled for 3600x3600 world
  // Based on actual Lancashire road network
  const roadRoutes = {
    // ========== M65 MOTORWAY - Main artery across Lancashire ==========
    // Runs WEST to EAST: Blackburn → Accrington → Burnley
    m65_motorway: [
      { x: 250, y: 820, name: "M65 West (Blackburn)" },
      { x: 400, y: 800 },
      { x: 550, y: 780 },
      { x: 700, y: 765 },
      { x: 850, y: 755 },
      { x: 1000, y: 750, name: "M65 (Whalley)" },
      { x: 1150, y: 750 },
      { x: 1300, y: 750, name: "M65 (Accrington)" },
      { x: 1450, y: 750 },
      { x: 1600, y: 750 },
      { x: 1750, y: 750, name: "M65 (Padiham)" },
      { x: 1900, y: 750 },
      { x: 2050, y: 745 },
      { x: 2200, y: 740 },
      { x: 2350, y: 735, name: "M65 (Burnley)" },
      { x: 2500, y: 730 },
      { x: 2650, y: 725 },
      { x: 2800, y: 720 },  // Toward Nelson
      { x: 2950, y: 715 },
      { x: 3100, y: 710 }   // Toward Colne
    ],

    // ========== BURNLEY TOWN STREETS ==========
    // Church Street - Main shopping street (north-south)
    church_street_burnley: [
      { x: 2350, y: 580, name: "Church Street North" },
      { x: 2350, y: 630 },
      { x: 2350, y: 680 },
      { x: 2350, y: 730 },
      { x: 2350, y: 780 },
      { x: 2350, y: 830 },
      { x: 2350, y: 880, name: "Church Street South" }
    ],

    // St James Street (east-west through center)
    st_james_street: [
      { x: 2200, y: 720, name: "St James St West" },
      { x: 2250, y: 720 },
      { x: 2300, y: 720 },
      { x: 2350, y: 720 },  // Church St crossing
      { x: 2400, y: 720 },
      { x: 2450, y: 720 },
      { x: 2500, y: 720, name: "St James St East" }
    ],

    // Manchester Road (south of center)
    manchester_road: [
      { x: 2200, y: 850, name: "Manchester Rd West" },
      { x: 2250, y: 850 },
      { x: 2300, y: 850 },
      { x: 2350, y: 850 },
      { x: 2400, y: 850 },
      { x: 2450, y: 850 },
      { x: 2500, y: 850, name: "Manchester Rd East" }
    ],

    // ========== BLACKBURN TOWN STREETS ==========
    // King William Street (main shopping)
    king_william_street: [
      { x: 450, y: 970, name: "King William St West" },
      { x: 500, y: 970 },
      { x: 550, y: 970 },
      { x: 600, y: 970 },
      { x: 650, y: 970 },
      { x: 700, y: 970 },
      { x: 750, y: 970, name: "King William St East" }
    ],

    // Darwen Street
    darwen_street: [
      { x: 600, y: 920, name: "Darwen St North" },
      { x: 600, y: 970 },
      { x: 600, y: 1020 },
      { x: 600, y: 1070 },
      { x: 600, y: 1120, name: "Darwen St South" }
    ],

    // Church Street Blackburn (north-south)
    church_street_blackburn: [
      { x: 550, y: 1050, name: "Church St BB North" },
      { x: 550, y: 1100 },
      { x: 550, y: 1150 },
      { x: 550, y: 1200, name: "Church St BB South" }
    ],

    // ========== ACCRINGTON ROADS ==========
    // Blackburn Road (main street)
    blackburn_road_accrington: [
      { x: 1300, y: 920, name: "Blackburn Rd" },
      { x: 1350, y: 920 },
      { x: 1400, y: 920 },
      { x: 1450, y: 920 },
      { x: 1500, y: 920 },
      { x: 1550, y: 920, name: "Blackburn Rd East" }
    ],

    // Union Road (through center)
    union_road_accrington: [
      { x: 1400, y: 870, name: "Union Rd North" },
      { x: 1400, y: 920 },
      { x: 1400, y: 970 },
      { x: 1400, y: 1020, name: "Union Rd South" }
    ],

    // ========== A682 BURNLEY ROAD (Burnley to Rawtenstall) ==========
    // Scenic route through Rossendale Valley
    a682_burnley_road: [
      { x: 2350, y: 900, name: "A682 Burnley Start" },
      { x: 2360, y: 950 },
      { x: 2370, y: 1000 },
      { x: 2380, y: 1050 },
      { x: 2385, y: 1100, name: "Singing Ringing Tree" },
      { x: 2380, y: 1150 },
      { x: 2370, y: 1200 },
      { x: 2350, y: 1250, name: "Clow Bridge" },
      { x: 2320, y: 1300 },
      { x: 2280, y: 1350 },
      { x: 2230, y: 1400 },
      { x: 2180, y: 1450, name: "Crawshawbooth" },
      { x: 2130, y: 1500 },
      { x: 2080, y: 1550 },
      { x: 2040, y: 1600 },
      { x: 2010, y: 1650 },
      { x: 2000, y: 1700 },
      { x: 2000, y: 1750, name: "Rawtenstall" },
      { x: 2000, y: 1800 },
      { x: 1980, y: 1850 },
      { x: 1950, y: 1900 },
      { x: 1900, y: 1950 },
      { x: 1850, y: 2000, name: "Bacup" }
    ],

    // ========== A671 (Burnley to Whalley via Padiham) ==========
    a671_burnley_whalley: [
      { x: 2250, y: 760, name: "A671 Burnley" },
      { x: 2150, y: 760 },
      { x: 2050, y: 760 },
      { x: 1950, y: 760 },
      { x: 1850, y: 760 },
      { x: 1750, y: 760, name: "A671 Padiham" },
      { x: 1650, y: 760 },
      { x: 1550, y: 750 },
      { x: 1450, y: 730 },
      { x: 1350, y: 700 },
      { x: 1250, y: 660 },
      { x: 1150, y: 610 },
      { x: 1050, y: 550, name: "A671 Whalley" }
    ],

    // ========== A679 (Accrington to Blackburn) ==========
    a679_accrington_blackburn: [
      { x: 1400, y: 800, name: "A679 Accrington" },
      { x: 1320, y: 820 },
      { x: 1240, y: 840 },
      { x: 1160, y: 860 },
      { x: 1080, y: 880 },
      { x: 1000, y: 900 },
      { x: 920, y: 920 },
      { x: 840, y: 940 },
      { x: 760, y: 960 },
      { x: 680, y: 980, name: "A679 Blackburn" }
    ],

    // ========== A646 (Burnley to Todmorden) ==========
    a646_east: [
      { x: 2500, y: 700, name: "A646 Burnley" },
      { x: 2600, y: 685 },
      { x: 2700, y: 670 },
      { x: 2800, y: 655 },
      { x: 2900, y: 640, name: "A646 East" }
    ],

    // ========== COLNE ROAD (Burnley to Nelson to Colne) ==========
    colne_road: [
      { x: 2500, y: 680, name: "Colne Rd Burnley" },
      { x: 2600, y: 650 },
      { x: 2700, y: 620 },
      { x: 2800, y: 590 },
      { x: 2900, y: 570, name: "Nelson" },
      { x: 3000, y: 550 },
      { x: 3100, y: 530 },
      { x: 3200, y: 510, name: "Colne" }
    ],

    // ========== RAWTENSTALL TOWN STREETS ==========
    rawtenstall_center: [
      { x: 1950, y: 1750 }, { x: 2000, y: 1750 }, { x: 2050, y: 1750 },
      { x: 2100, y: 1750 }, { x: 2150, y: 1750 },
      { x: 2100, y: 1800 }, { x: 2050, y: 1800 }, { x: 2000, y: 1800 }
    ]
  };

  const [currentMission, setCurrentMission] = useState(null);
  const [missionProgress, setMissionProgress] = useState('');
  const [missionState, setMissionState] = useState(null);
  const [missionTimer, setMissionTimer] = useState(null);
  const [missionTarget, setMissionTarget] = useState(null);
  const [checkpointsVisited, setCheckpointsVisited] = useState([]);
  const [raceOpponent, setRaceOpponent] = useState(null);
  
  const [keys, setKeys] = useState({});
  const [npcs, setNpcs] = useState([]);
  const [pedestrians, setPedestrians] = useState([]);
  const [police, setPolice] = useState([]);
  const [traffic, setTraffic] = useState([]);
  const [pickups, setPickups] = useState([]);
  const [environmentObjects, setEnvironmentObjects] = useState([]);
  const [particles, setParticles] = useState([]);
  const [gameTime, setGameTime] = useState(0);
  const [showMiniMap, setShowMiniMap] = useState(true);
  const [soundEffect, setSoundEffect] = useState(null);
  const [nearbyVehicle, setNearbyVehicle] = useState(null);

  // New game systems
  const [timeOfDay, setTimeOfDay] = useState(12); // 0-24 hours
  const [radioStation, setRadioStation] = useState(0);
  const [territories, setTerritories] = useState([]);
  const [properties, setProperties] = useState([]);
  const [ownedProperties, setOwnedProperties] = useState([]);
  const [bullets, setBullets] = useState([]);
  const [lastShot, setLastShot] = useState(0);
  const [screenShake, setScreenShake] = useState({ x: 0, y: 0, intensity: 0 });
  const [inCombat, setInCombat] = useState(false);
  const [combatTarget, setCombatTarget] = useState(null);

  // REALISTIC LANCASHIRE TOWN LAYOUTS - Based on Google Maps data
  // World scale: 3600x3600 (1 pixel ≈ 10 meters in real life)
  // M65 Motorway: y ≈ 750 (runs west to east across map)
  //
  // ROAD CLEARANCES (road width + pavements on both sides):
  // - Town streets (28px): require 22px clearance each side (14px pavement + buffer)
  // - A-roads (42px): require 30px clearance each side
  // - M65 (56px): require 44px clearance each side
  const buildings = [
    // ========== BURNLEY TOWN CENTRE (East side: x: 2200-2800, y: 600-900) ==========
    // Population: 87,000 - Major town with proper street grid
    // KEY ROADS: Church Street (x=2350), St James Street (y=720), Manchester Road (y=850)

    // TURF MOOR - Burnley FC Stadium (southeast of center, clear of roads)
    { x: 2850, y: 900, width: 150, height: 120, name: "Turf Moor Stadium", town: "burnley" },

    // WEST OF CHURCH STREET (x < 2328) - Buildings on west side with pavement clearance
    // North section (above St James St)
    { x: 2220, y: 650, width: 45, height: 35, name: "Charter Walk Shopping", town: "burnley" },
    { x: 2270, y: 650, width: 45, height: 35, name: "Mall Shops", town: "burnley" },
    { x: 2220, y: 690, width: 45, height: 25, name: "M&S Building", town: "burnley" },
    { x: 2270, y: 690, width: 45, height: 25, name: "Market Stalls", town: "burnley" },

    // Between St James (y=720) and Manchester Rd (y=850)
    { x: 2220, y: 750, width: 45, height: 35, name: "Town Hall", town: "burnley" },
    { x: 2270, y: 750, width: 45, height: 35, name: "St Peter's Church", town: "burnley" },
    { x: 2220, y: 790, width: 45, height: 30, name: "Council Offices", town: "burnley" },
    { x: 2270, y: 790, width: 45, height: 30, name: "Shops", town: "burnley" },

    // South of Manchester Road (y > 864)
    { x: 2220, y: 875, width: 45, height: 40, name: "Retail Park", town: "burnley" },
    { x: 2270, y: 875, width: 45, height: 40, name: "Superstore", town: "burnley" },

    // EAST OF CHURCH STREET (x > 2372) - Buildings on east side with pavement clearance
    // North section
    { x: 2385, y: 650, width: 50, height: 35, name: "Weavers Triangle", town: "burnley" },
    { x: 2440, y: 650, width: 45, height: 35, name: "Industrial Units", town: "burnley" },
    { x: 2490, y: 650, width: 40, height: 35, name: "Warehouse", town: "burnley" },
    { x: 2385, y: 690, width: 50, height: 25, name: "Burnley Central", town: "burnley" },
    { x: 2440, y: 690, width: 45, height: 25, name: "Office Buildings", town: "burnley" },

    // Between St James and Manchester
    { x: 2385, y: 750, width: 50, height: 35, name: "Library", town: "burnley" },
    { x: 2440, y: 750, width: 45, height: 35, name: "Medical Centre", town: "burnley" },
    { x: 2490, y: 750, width: 40, height: 35, name: "Clinic", town: "burnley" },
    { x: 2385, y: 790, width: 50, height: 30, name: "Business Park", town: "burnley" },
    { x: 2440, y: 790, width: 45, height: 30, name: "Tech Centre", town: "burnley" },

    // South of Manchester Road
    { x: 2385, y: 875, width: 50, height: 40, name: "Industrial Est", town: "burnley" },
    { x: 2440, y: 875, width: 45, height: 40, name: "Depot", town: "burnley" },

    // BURNLEY CENTRAL STATION (special position, has its own access)
    { x: 2500, y: 780, width: 50, height: 40, name: "Burnley Central Station", town: "burnley" },

    // Northern Burnley residential areas (well clear of roads)
    { x: 2220, y: 580, width: 40, height: 30, name: "Rose Grove", town: "burnley" },
    { x: 2265, y: 580, width: 40, height: 30, name: "Houses", town: "burnley" },
    { x: 2310, y: 580, width: 40, height: 30, name: "Houses", town: "burnley" },
    { x: 2385, y: 580, width: 40, height: 30, name: "Houses", town: "burnley" },
    { x: 2430, y: 580, width: 40, height: 30, name: "Houses", town: "burnley" },

    // ========== BLACKBURN TOWN CENTRE (West side: x: 400-900, y: 900-1300) ==========
    // Population: 120,000 - Largest town, extensive center
    // KEY ROADS: King William St (y=970), Darwen St (x=600), Church St (x=550)

    // EWOOD PARK - Blackburn Rovers Stadium (southwest, well clear of roads)
    { x: 320, y: 1100, width: 160, height: 140, name: "Ewood Park Stadium", town: "blackburn" },

    // NORTH OF KING WILLIAM STREET (y < 948)
    // West of Darwen Street (x < 578)
    { x: 450, y: 920, width: 50, height: 25, name: "Shopping Centre", town: "blackburn" },
    { x: 505, y: 920, width: 50, height: 25, name: "Mall", town: "blackburn" },
    // East of Darwen Street (x > 622)
    { x: 635, y: 920, width: 50, height: 25, name: "Shops", town: "blackburn" },
    { x: 690, y: 920, width: 50, height: 25, name: "Market Hall", town: "blackburn" },
    { x: 745, y: 920, width: 50, height: 25, name: "Retail", town: "blackburn" },

    // BETWEEN KING WILLIAM (y=970) and CATHEDRAL AREA - Respecting street boundaries
    // West of Church Street (x < 528)
    { x: 450, y: 1000, width: 50, height: 40, name: "Town Hall", town: "blackburn" },
    { x: 450, y: 1045, width: 50, height: 40, name: "Council Offices", town: "blackburn" },
    // Between Church St (x=550) and Darwen St (x=600) - narrow corridor
    // East of Darwen Street (x > 622)
    { x: 635, y: 1000, width: 50, height: 40, name: "George's Hall", town: "blackburn" },
    { x: 690, y: 1000, width: 50, height: 40, name: "Theatre", town: "blackburn" },
    { x: 745, y: 1000, width: 50, height: 40, name: "Museum", town: "blackburn" },

    // CATHEDRAL AREA (special position - major landmark)
    { x: 575, y: 1060, width: 80, height: 70, name: "Blackburn Cathedral", town: "blackburn" },
    { x: 660, y: 1060, width: 60, height: 70, name: "Cathedral Square", town: "blackburn" },

    // SOUTH OF CATHEDRAL - proper clearance from streets
    { x: 450, y: 1140, width: 50, height: 45, name: "Church St Shops", town: "blackburn" },
    { x: 505, y: 1140, width: 50, height: 45, name: "Offices", town: "blackburn" },
    { x: 635, y: 1140, width: 50, height: 45, name: "Library", town: "blackburn" },
    { x: 690, y: 1140, width: 50, height: 45, name: "Police Station", town: "blackburn" },

    // NORTHERN Blackburn residential (clear of roads)
    { x: 450, y: 850, width: 45, height: 25, name: "Houses", town: "blackburn" },
    { x: 500, y: 850, width: 45, height: 25, name: "Houses", town: "blackburn" },
    { x: 635, y: 850, width: 45, height: 25, name: "Houses", town: "blackburn" },
    { x: 685, y: 850, width: 45, height: 25, name: "Houses", town: "blackburn" },
    { x: 735, y: 850, width: 45, height: 25, name: "Houses", town: "blackburn" },

    // SOUTHERN Blackburn areas (well south of town center)
    { x: 450, y: 1200, width: 50, height: 40, name: "Retail Park", town: "blackburn" },
    { x: 505, y: 1200, width: 50, height: 40, name: "Business Park", town: "blackburn" },

    // ========== ACCRINGTON TOWN CENTRE (Central: x: 1300-1700, y: 850-1100) ==========
    // Population: 35,000 - Medium town
    // KEY ROADS: Blackburn Road (y=920), Union Road (x=1400)

    // ACCRINGTON STANLEY - Crown Ground Stadium (south of center, clear of roads)
    { x: 1550, y: 1060, width: 120, height: 90, name: "Crown Ground Stadium", town: "accrington" },

    // NORTH OF BLACKBURN ROAD (y < 898)
    // West of Union Road (x < 1378)
    { x: 1310, y: 870, width: 55, height: 25, name: "Arndale Centre", town: "accrington" },
    // East of Union Road (x > 1422)
    { x: 1435, y: 870, width: 55, height: 25, name: "Market Hall", town: "accrington" },
    { x: 1495, y: 870, width: 55, height: 25, name: "Town Hall", town: "accrington" },

    // SOUTH OF BLACKBURN ROAD (y > 942)
    // West of Union Road
    { x: 1310, y: 955, width: 55, height: 40, name: "Peel Centre", town: "accrington" },
    { x: 1310, y: 1000, width: 55, height: 40, name: "Shopping Area", town: "accrington" },
    // East of Union Road
    { x: 1435, y: 955, width: 55, height: 40, name: "Shops", town: "accrington" },
    { x: 1495, y: 955, width: 55, height: 40, name: "Offices", town: "accrington" },

    // HOLLANDS PIES factory area (south, well clear of roads)
    { x: 1310, y: 1085, width: 90, height: 60, name: "Hollands Pies Factory", town: "accrington" },

    // ========== NELSON TOWN (Northeast: x: 2800-3100, y: 500-700) ==========
    // Population: 30,000 - North of M65, clear of Colne Road
    { x: 2850, y: 540, width: 60, height: 40, name: "Nelson Town Centre", town: "nelson" },
    { x: 2915, y: 540, width: 60, height: 40, name: "Market", town: "nelson" },
    { x: 2980, y: 540, width: 60, height: 40, name: "Retail", town: "nelson" },
    { x: 2850, y: 585, width: 60, height: 35, name: "Houses", town: "nelson" },
    { x: 2915, y: 585, width: 60, height: 35, name: "Houses", town: "nelson" },

    // ========== COLNE (Far Northeast: x: 3100-3400, y: 400-600) ==========
    // North of Colne Road, proper clearance
    { x: 3150, y: 460, width: 70, height: 40, name: "Colne Town Hall", town: "colne" },
    { x: 3225, y: 460, width: 70, height: 40, name: "Market", town: "colne" },
    { x: 3300, y: 460, width: 70, height: 40, name: "Shops", town: "colne" },
    { x: 3150, y: 545, width: 70, height: 40, name: "Shopping Area", town: "colne" },

    // ========== RAWTENSTALL (South: x: 1900-2200, y: 1700-1950) ==========
    // Rossendale Valley - Population: 23,000
    // Main street runs through center, buildings on both sides
    { x: 1920, y: 1735, width: 65, height: 45, name: "Rawtenstall Town Hall", town: "rawtenstall" },
    { x: 1990, y: 1735, width: 65, height: 45, name: "Market", town: "rawtenstall" },
    { x: 2060, y: 1735, width: 65, height: 45, name: "Shops", town: "rawtenstall" },
    { x: 2130, y: 1735, width: 65, height: 45, name: "Retail", town: "rawtenstall" },
    { x: 1920, y: 1785, width: 65, height: 45, name: "Valley Centre", town: "rawtenstall" },
    { x: 1990, y: 1785, width: 65, height: 45, name: "Bus Station", town: "rawtenstall" },
    { x: 2060, y: 1785, width: 65, height: 45, name: "Library", town: "rawtenstall" },
    { x: 2130, y: 1785, width: 65, height: 45, name: "Offices", town: "rawtenstall" },

    // ========== PADIHAM (x: 1600-1850, y: 700-850) ==========
    // On A671, buildings positioned alongside road with clearance
    { x: 1640, y: 795, width: 60, height: 40, name: "Padiham Town Centre", town: "padiham" },
    { x: 1705, y: 795, width: 60, height: 40, name: "Memorial Park", town: "padiham" },
    { x: 1770, y: 795, width: 60, height: 40, name: "Mill", town: "padiham" },

    // ========== DARWEN (Southwest: x: 250-500, y: 1400-1600) ==========
    // South of Blackburn, clear of all major roads
    { x: 300, y: 1450, width: 65, height: 50, name: "Darwen Town Centre", town: "darwen" },
    { x: 370, y: 1450, width: 65, height: 50, name: "Market Square", town: "darwen" },
    { x: 300, y: 1510, width: 65, height: 45, name: "Darwen Tower", town: "darwen" },

    // ========== SMALLER VILLAGES ==========
    // Whalley - west of A671, clear of M65
    { x: 980, y: 530, width: 50, height: 40, name: "Whalley Abbey", town: "whalley" },
    { x: 1035, y: 530, width: 50, height: 40, name: "Whalley Village", town: "whalley" },

    // Clitheroe (North) - well north of M65
    { x: 780, y: 340, width: 60, height: 45, name: "Clitheroe Castle", town: "clitheroe" },
    { x: 845, y: 340, width: 60, height: 45, name: "Market", town: "clitheroe" },

    // Great Harwood - positioned clear of A679
    { x: 1180, y: 980, width: 50, height: 40, name: "Great Harwood Centre", town: "great_harwood" },

    // Bacup (South of Rossendale) - end of A682
    { x: 1750, y: 2020, width: 60, height: 50, name: "Bacup Town Square", town: "bacup" },
    { x: 1815, y: 2020, width: 60, height: 50, name: "Bacup Market", town: "bacup" },

    // ========== LANDMARKS (scenic spots, off main roads) ==========
    { x: 2480, y: 1120, width: 40, height: 40, name: "Singing Ringing Tree", town: "burnley" },
    { x: 2200, y: 1350, width: 50, height: 40, name: "Ogden Reservoir", town: "rossendale" },
    { x: 1900, y: 1550, width: 50, height: 40, name: "Cowpe Reservoir", town: "rossendale" }
  ];

  // Speed cameras on major roads (updated for new scale)
  const speedCameras = [
    // M65 MOTORWAY cameras
    { x: 600, y: 780, road: "M65", speedLimit: 60 },      // Blackburn section
    { x: 1300, y: 750, road: "M65", speedLimit: 60 },    // Accrington section
    { x: 2000, y: 745, road: "M65", speedLimit: 60 },    // Padiham section
    { x: 2350, y: 735, road: "M65", speedLimit: 60 },    // Burnley section

    // A682 (Burnley to Rawtenstall) cameras - known locations
    { x: 2370, y: 1000, road: "A682", speedLimit: 30 },  // Rose Hill
    { x: 2350, y: 1250, road: "A682", speedLimit: 30 },  // Clow Bridge
    { x: 2180, y: 1450, road: "A682", speedLimit: 30 },  // Crawshawbooth
    { x: 2010, y: 1650, road: "A682", speedLimit: 30 },  // Near Rawtenstall

    // A671 cameras
    { x: 1750, y: 760, road: "A671", speedLimit: 40 },   // Padiham area
    { x: 1050, y: 550, road: "A671", speedLimit: 40 },   // Near Whalley
  ];

  const missions = [
    {
      id: 1,
      title: "The Holland's Pie Heist",
      description: "Drive to Holland's Pie factory in Accrington and nick a pie!",
      pickupLocation: { x: 680, y: 510 },  // Updated to match relocated building
      deliverLocation: { x: 1100, y: 360 },
      reward: 500,
      respectGain: 10,
      timeLimit: 90,
      type: 'timed_pickup',
      completed: false
    },
    {
      id: 2,
      title: "Charter Walk Delivery",
      description: "Deliver scarves from Charter Walk to The Turf pub. Don't crash!",
      deliverLocation: { x: 1100, y: 360 },
      reward: 300,
      respectGain: 15,
      type: 'fragile_delivery',
      cargoHealth: 100,
      completed: false
    },
    {
      id: 3,
      title: "Cross-Town Kebab Run",
      description: "Get kebabs from Blackburn and deliver to Turf Moor. Long drive!",
      pickupLocation: { x: 320, y: 540 },
      deliverLocation: { x: 1050, y: 320 },
      reward: 600,
      respectGain: 12,
      timeLimit: 120,
      type: 'timed_delivery',
      completed: false
    },
    {
      id: 4,
      title: "Hunt the Rovers Fan",
      description: "Chase down a Blackburn fan from Cathedral Square. He's got a head start!",
      reward: 600,
      respectGain: 20,
      type: 'chase',
      completed: false
    },
    {
      id: 5,
      title: "Weavers Triangle Tour",
      description: "Visit 3 historic mill sites around Burnley's Weavers Triangle.",
      checkpoints: [
        { x: 1290, y: 400 },  // Updated to match relocated Weavers Triangle
        { x: 1255, y: 400 },  // Updated to match relocated Market Hall
        { x: 1150, y: 385 }   // Updated to match Station Block area
      ],
      reward: 450,
      respectGain: 12,
      type: 'multi_checkpoint',
      completed: false
    },
    {
      id: 6,
      title: "The M65 Race",
      description: "Race from Whalley to Burnley along the M65! Beat the Range Rover!",
      startLocation: { x: 650, y: 250 },
      finishLocation: { x: 1300, y: 350 },
      reward: 1000,
      respectGain: 30,
      type: 'race',
      completed: false
    },
    {
      id: 7,
      title: "Cathedral Quarter Heist",
      description: "Steal from posh restaurant near Blackburn Cathedral. Instant heat!",
      pickupLocation: { x: 320, y: 520 },
      deliverLocation: { x: 1100, y: 900 },
      reward: 800,
      respectGain: 18,
      timeLimit: 90,
      type: 'stealth',
      wantedOnPickup: true,
      completed: false
    },
    {
      id: 8,
      title: "Property Empire",
      description: "Buy 3 properties to start your business empire in Lancashire!",
      reward: 1500,
      respectGain: 25,
      type: 'buy_properties',
      targetCount: 3,
      completed: false
    },
    {
      id: 9,
      title: "Gang Warfare",
      description: "Defend Burnley territory from Blackburn invaders! Take out 5 enemy vehicles.",
      reward: 2000,
      respectGain: 40,
      type: 'gang_war',
      killCount: 0,
      targetKills: 5,
      completed: false
    },
    {
      id: 10,
      title: "Skills Challenge",
      description: "Max out your Driving skill to become a proper wheelman!",
      reward: 1000,
      respectGain: 30,
      type: 'skill_challenge',
      skillRequired: 'driving',
      targetLevel: 50,
      completed: false
    }
  ];

  const locations = [
    // Burnley (EAST side: x: 1000-1400)
    { name: "Turf Moor", x: 1050, y: 320, type: "burnley" },
    { name: "Charter Walk", x: 1150, y: 340, type: "burnley" },
    { name: "St James St", x: 1250, y: 300, type: "burnley" },
    { name: "The Turf Pub", x: 1100, y: 360, type: "burnley" },
    { name: "Weavers Triangle", x: 1290, y: 400, type: "burnley" },  // Updated to match relocated building
    { name: "Burnley Market", x: 1255, y: 400, type: "burnley" },  // Updated to match relocated building (Market Hall)

    // Blackburn (WEST side: x: 200-500)
    { name: "Ewood Park", x: 280, y: 480, type: "blackburn" },
    { name: "Cathedral", x: 320, y: 520, type: "blackburn" },
    { name: "The Mall", x: 350, y: 480, type: "blackburn" },
    { name: "King William St", x: 250, y: 450, type: "blackburn" },
    { name: "Corporation Park", x: 220, y: 550, type: "blackburn" },

    // Accrington (MIDDLE: x: 600-800)
    { name: "Accrington Stanley", x: 770, y: 320, type: "accrington" },  // Updated to match relocated building
    { name: "Holland's Pies", x: 680, y: 510, type: "accrington" },  // Updated to match relocated building
    { name: "Accrington Town", x: 720, y: 400, type: "accrington" },

    // Other towns
    { name: "Padiham", x: 850, y: 380, type: "padiham" },
    { name: "Whalley", x: 620, y: 250, type: "posh" },  // Updated to match relocated building
    { name: "Darwen Tower", x: 200, y: 800, type: "blackburn" },
    { name: "M65 Services", x: 900, y: 390, type: "neutral" },

    // Rossendale Valley (SOUTH of Burnley along A682)
    { name: "Rawtenstall", x: 1100, y: 930, type: "rossendale" },
    { name: "Crawshawbooth", x: 1120, y: 730, type: "rossendale" },
    { name: "New Hall Hey", x: 1115, y: 780, type: "rossendale" },
    { name: "Clow Bridge", x: 1200, y: 610, type: "rossendale" },

    // Sailing club
    { name: "Sailing Club", x: 1310, y: 630, type: "sailing" },

    // Landmarks
    { name: "Singing Ringing Tree", x: 1400, y: 280, type: "landmark" }
  ];

  // Radio stations
  const radioStations = [
    { name: "BBC Radio Lancashire", songs: ["Local news...", "Traffic update...", "Weather: Raining"] },
    { name: "Claret FM", songs: ["UTC! UTC!", "Burnley anthems", "No surrender!"] },
    { name: "Rovers Radio", songs: ["Blue & White Army", "Ewood Park chants"] },
    { name: "Northern Soul FM", songs: ["Keep the Faith", "Wigan Casino classics"] },
    { name: "OFF", songs: [] }
  ];

  // Territory definitions - CORRECTED GEOGRAPHY
  const territoryData = [
    { id: 1, x: 1000, y: 280, width: 400, height: 200, gang: 'burnley', name: 'Burnley Town' },
    { id: 2, x: 200, y: 400, width: 350, height: 300, gang: 'blackburn', name: 'Blackburn' },
    { id: 3, x: 600, y: 350, width: 250, height: 200, gang: 'neutral', name: 'Accrington' },
    { id: 4, x: 800, y: 350, width: 120, height: 100, gang: 'neutral', name: 'Padiham' },
    { id: 5, x: 600, y: 200, width: 120, height: 120, gang: 'neutral', name: 'Whalley' },
    { id: 6, x: 1050, y: 650, width: 150, height: 350, gang: 'neutral', name: 'Rossendale Valley' }
  ];

  // Properties you can buy - CORRECTED GEOGRAPHY
  const propertyData = [
    { id: 1, name: "The Turf Pub", x: 1100, y: 360, cost: 50000, income: 500, type: 'pub' },
    { id: 2, name: "Holland's Pies", x: 680, y: 510, cost: 100000, income: 1000, type: 'business' },  // Updated to match relocated building
    { id: 3, name: "Blackburn Kebabs", x: 320, y: 540, cost: 30000, income: 300, type: 'business' },
    { id: 4, name: "Padiham Safe House", x: 850, y: 400, cost: 75000, income: 0, type: 'safehouse' },
    { id: 5, name: "Charter Walk Lockup", x: 1150, y: 340, cost: 25000, income: 0, type: 'garage' },  // Updated to match relocated Charter Walk
    { id: 6, name: "Whalley Abbey", x: 620, y: 250, cost: 200000, income: 2000, type: 'luxury' }  // Updated to match relocated building
  ];

  // Initialize everything
  useEffect(() => {
    if (gameState === 'playing' && npcs.length === 0) {
      // Create NPC traffic
      const initialNpcs = [];
      const routeKeys = Object.keys(roadRoutes);

      for (let i = 0; i < 12; i++) {
        const vehicleType = i < 2 ? 'range_rover' : i < 4 ? 'van' : 'normal_car';
        const routeKey = routeKeys[i % routeKeys.length];
        const route = roadRoutes[routeKey];
        const waypointIndex = Math.floor(Math.random() * route.length);
        const waypoint = route[waypointIndex];

        initialNpcs.push({
          id: i,
          x: waypoint.x + (Math.random() - 0.5) * 30,
          y: waypoint.y + (Math.random() - 0.5) * 30,
          angle: Math.random() * Math.PI * 2,
          speed: Math.random() * 1.2 + 0.8,
          vehicle: vehicleType,
          color: vehicleStats[vehicleType].color,
          route: routeKey,
          waypointIndex: waypointIndex,
          direction: Math.random() > 0.5 ? 1 : -1
        });
      }
      setNpcs(initialNpcs);

      // Create pedestrians
      const initialPeds = [];
      locations.forEach((loc, i) => {
        if (i < 10) {
          initialPeds.push({
            id: i,
            x: loc.x + (Math.random() - 0.5) * 80,
            y: loc.y + (Math.random() - 0.5) * 80,
            angle: Math.random() * Math.PI * 2,
            speed: 0.3,
            type: loc.type
          });
        }
      });
      setPedestrians(initialPeds);

      // Create pickups spread across map
      const initialPickups = [
        { id: 1, x: 280, y: 380, type: 'health', icon: '🥧' },
        { id: 2, x: 1120, y: 1280, type: 'health', icon: '☕' },
        { id: 3, x: 1680, y: 1120, type: 'money', icon: '💷', value: 100 },
        { id: 4, x: 720, y: 1680, type: 'money', icon: '💷', value: 100 },
        { id: 5, x: 2080, y: 600, type: 'respect', icon: '⭐', value: 5 },
        { id: 6, x: 600, y: 1200, type: 'health', icon: '🥧' },
        { id: 7, x: 1400, y: 1800, type: 'money', icon: '💷', value: 150 }
      ];
      setPickups(initialPickups);

      // Create environmental objects
      const objects = [];
      
      // Lamp posts along main roads
      for (let i = 0; i < 40; i++) {
        objects.push({
          id: `lamp_${i}`,
          x: 400 + i * 50,
          y: 400,
          type: 'lamppost',
          destroyed: false
        });
      }
      
      // More lamp posts
      for (let i = 0; i < 40; i++) {
        objects.push({
          id: `lamp2_${i}`,
          x: 800,
          y: 400 + i * 50,
          type: 'lamppost',
          destroyed: false
        });
      }
      
      // Bins around town centres
      for (let i = 0; i < 20; i++) {
        objects.push({
          id: `bin_${i}`,
          x: 300 + Math.random() * 400,
          y: 200 + Math.random() * 400,
          type: 'bin',
          destroyed: false
        });
      }
      
      for (let i = 0; i < 20; i++) {
        objects.push({
          id: `bin2_${i}`,
          x: 1600 + Math.random() * 400,
          y: 1400 + Math.random() * 400,
          type: 'bin',
          destroyed: false
        });
      }
      
      // Market stalls
      objects.push({ id: 'stall_1', x: 310, y: 420, type: 'stall', destroyed: false });
      objects.push({ id: 'stall_2', x: 350, y: 420, type: 'stall', destroyed: false });
      objects.push({ id: 'stall_3', x: 390, y: 420, type: 'stall', destroyed: false });
      objects.push({ id: 'stall_4', x: 1900, y: 1540, type: 'stall', destroyed: false });
      objects.push({ id: 'stall_5', x: 1940, y: 1540, type: 'stall', destroyed: false });
      
      // Phone boxes
      objects.push({ id: 'phone_1', x: 380, y: 250, type: 'phonebox', destroyed: false });
      objects.push({ id: 'phone_2', x: 1720, y: 1460, type: 'phonebox', destroyed: false });
      objects.push({ id: 'phone_3', x: 1200, y: 1000, type: 'phonebox', destroyed: false });
      
      setEnvironmentObjects(objects);

      // Initialize territories
      setTerritories(territoryData.map(t => ({ ...t })));

      // Initialize properties
      setProperties(propertyData.map(p => ({ ...p, owned: false })));
    }
  }, [gameState]);

  // Camera follows player
  useEffect(() => {
    if (gameState === 'playing') {
      setCamera({
        x: Math.max(0, Math.min(player.x - VIEWPORT_WIDTH / 2, WORLD_WIDTH - VIEWPORT_WIDTH)),
        y: Math.max(0, Math.min(player.y - VIEWPORT_HEIGHT / 2, WORLD_HEIGHT - VIEWPORT_HEIGHT))
      });
    }
  }, [player.x, player.y, gameState]);

  // Collision detection
  const checkCollision = (x, y, width = 16, height = 16) => {
    for (const building of buildings) {
      if (
        x + width/2 < building.x + building.width &&
        x - width/2 > building.x &&
        y + height/2 < building.y + building.height &&
        y - height/2 > building.y
      ) {
        return building;
      }
    }
    return null;
  };

  // Distance helper
  const getDistance = (x1, y1, x2, y2) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  };

  // Enhanced particle system
  const addParticles = (x, y, type, count = 5, angle = null) => {
    const newParticles = [];

    for (let i = 0; i < count; i++) {
      let particle = {
        id: Date.now() + i + Math.random(),
        x,
        y,
        life: 30,
        type
      };

      switch(type) {
        case 'smoke': // Tire smoke
          particle.vx = (Math.random() - 0.5) * 1.5;
          particle.vy = (Math.random() - 0.5) * 1.5;
          particle.life = 20 + Math.random() * 10;
          particle.color = `rgba(100, 100, 100, ${0.4 + Math.random() * 0.3})`;
          particle.size = 3 + Math.random() * 3;
          particle.growth = 0.2; // Smoke expands
          break;

        case 'muzzle': // Muzzle flash
          const spread = angle !== null ? angle : Math.random() * Math.PI * 2;
          particle.vx = Math.cos(spread) * (2 + Math.random() * 2);
          particle.vy = Math.sin(spread) * (2 + Math.random() * 2);
          particle.life = 5 + Math.random() * 3;
          particle.color = i % 2 === 0 ? '#ffff00' : '#ff6600';
          particle.size = 2 + Math.random() * 2;
          particle.glow = true;
          break;

        case 'explosion': // Big boom
          const expAngle = (Math.PI * 2 / count) * i;
          particle.vx = Math.cos(expAngle) * (3 + Math.random() * 4);
          particle.vy = Math.sin(expAngle) * (3 + Math.random() * 4);
          particle.life = 15 + Math.random() * 10;
          particle.color = ['#ff0000', '#ff6600', '#ffff00', '#ff9900'][i % 4];
          particle.size = 4 + Math.random() * 4;
          particle.glow = true;
          break;

        case 'sparks': // Metal sparks
          particle.vx = (Math.random() - 0.5) * 6;
          particle.vy = (Math.random() - 0.5) * 6 - 2; // Bias upward
          particle.life = 10 + Math.random() * 10;
          particle.color = ['#ffff00', '#ff9900', '#fff'][i % 3];
          particle.size = 1 + Math.random();
          particle.glow = true;
          break;

        case 'blood': // Combat hit
          particle.vx = (Math.random() - 0.5) * 3;
          particle.vy = (Math.random() - 0.5) * 3;
          particle.life = 20;
          particle.color = '#8b0000';
          particle.size = 2 + Math.random() * 2;
          break;

        case 'crash': // Vehicle collision
          particle.vx = (Math.random() - 0.5) * 5;
          particle.vy = (Math.random() - 0.5) * 5;
          particle.life = 25;
          particle.color = ['#ff6600', '#cc5500', '#994400'][i % 3];
          particle.size = 2 + Math.random() * 3;
          break;

        case 'money': // Cash pickup
          particle.vx = (Math.random() - 0.5) * 2;
          particle.vy = -3 - Math.random() * 2; // Float up
          particle.life = 40;
          particle.color = '#ffd700';
          particle.size = 3;
          particle.glow = true;
          break;

        default: // Generic
          particle.vx = (Math.random() - 0.5) * 4;
          particle.vy = (Math.random() - 0.5) * 4;
          particle.color = '#fff';
          particle.size = 2;
      }

      newParticles.push(particle);
    }

    setParticles(prev => [...prev, ...newParticles]);
  };

  // Screen shake effect
  const addScreenShake = (intensity = 5) => {
    setScreenShake({
      x: (Math.random() - 0.5) * intensity,
      y: (Math.random() - 0.5) * intensity,
      intensity
    });
  };

  // Web Audio API - Retro sound generator
  const audioContext = useRef(null);

  useEffect(() => {
    // Initialize audio context on first user interaction
    const initAudio = () => {
      if (!audioContext.current) {
        audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
      }
    };

    window.addEventListener('click', initAudio, { once: true });
    window.addEventListener('keydown', initAudio, { once: true });

    return () => {
      window.removeEventListener('click', initAudio);
      window.removeEventListener('keydown', initAudio);
    };
  }, []);

  const playSound = (soundType, options = {}) => {
    if (!audioContext.current) return;

    const ctx = audioContext.current;
    const now = ctx.currentTime;

    try {
      switch(soundType) {
        case 'engine': {
          // Continuous engine rumble
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const noise = ctx.createBufferSource();

          // Create noise buffer for engine texture
          const bufferSize = ctx.sampleRate * 0.1;
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
          }
          noise.buffer = buffer;
          noise.loop = true;

          const speed = options.speed || 1;
          const freq = 40 + (speed * 15); // Engine pitch increases with speed

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now);
          gain.gain.setValueAtTime(0.15, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

          osc.connect(gain);
          noise.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          noise.start(now);
          osc.stop(now + 0.3);
          noise.stop(now + 0.3);
          break;
        }

        case 'gunshot': {
          // Retro gunshot sound
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();

          osc.type = 'square';
          osc.frequency.setValueAtTime(200, now);
          osc.frequency.exponentialRampToValueAtTime(50, now + 0.05);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(800, now);

          gain.gain.setValueAtTime(0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.1);
          break;
        }

        case 'shotgun': {
          // Deeper, louder gunshot
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(100, now);
          osc.frequency.exponentialRampToValueAtTime(30, now + 0.08);

          gain.gain.setValueAtTime(0.4, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.15);
          break;
        }

        case 'crash': {
          // Metallic crash sound
          const noise = ctx.createBufferSource();
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();

          const bufferSize = ctx.sampleRate * 0.3;
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize / 3));
          }
          noise.buffer = buffer;

          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(400, now);

          const intensity = options.intensity || 1;
          gain.gain.setValueAtTime(0.4 * intensity, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

          noise.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);

          noise.start(now);
          break;
        }

        case 'explosion': {
          // Big explosion
          const osc = ctx.createOscillator();
          const noise = ctx.createBufferSource();
          const gain = ctx.createGain();

          const bufferSize = ctx.sampleRate * 0.5;
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize / 2));
          }
          noise.buffer = buffer;

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(80, now);
          osc.frequency.exponentialRampToValueAtTime(20, now + 0.5);

          gain.gain.setValueAtTime(0.6, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

          osc.connect(gain);
          noise.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          noise.start(now);
          osc.stop(now + 0.5);
          break;
        }

        case 'siren': {
          // Police siren wail
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(600, now);
          osc.frequency.linearRampToValueAtTime(800, now + 0.3);
          osc.frequency.linearRampToValueAtTime(600, now + 0.6);

          gain.gain.setValueAtTime(0.2, now);
          gain.gain.setValueAtTime(0.2, now + 0.6);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.6);
          break;
        }

        case 'pickup': {
          // Item pickup sound (ascending tone)
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(400, now);
          osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);

          gain.gain.setValueAtTime(0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.15);
          break;
        }

        case 'missionComplete': {
          // Success jingle
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();

          osc1.type = 'sine';
          osc2.type = 'sine';

          osc1.frequency.setValueAtTime(523, now); // C
          osc1.frequency.setValueAtTime(659, now + 0.1); // E
          osc1.frequency.setValueAtTime(784, now + 0.2); // G

          osc2.frequency.setValueAtTime(523 * 2, now);
          osc2.frequency.setValueAtTime(659 * 2, now + 0.1);
          osc2.frequency.setValueAtTime(784 * 2, now + 0.2);

          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(ctx.destination);

          osc1.start(now);
          osc2.start(now);
          osc1.stop(now + 0.4);
          osc2.stop(now + 0.4);
          break;
        }

        case 'missionFail': {
          // Failure sound
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(300, now);
          osc.frequency.exponentialRampToValueAtTime(100, now + 0.3);

          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.3);
          break;
        }

        case 'horn': {
          // Car horn
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'square';
          osc.frequency.setValueAtTime(220, now);

          gain.gain.setValueAtTime(0.3, now);
          gain.gain.setValueAtTime(0.3, now + 0.2);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.2);
          break;
        }

        case 'health': {
          // Health pickup (rising pitch, healing feel)
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(300, now);
          osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);

          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.2);
          break;
        }

        case 'money': {
          // Money pickup (cash register cha-ching)
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();

          osc1.type = 'sine';
          osc2.type = 'sine';
          osc1.frequency.setValueAtTime(800, now);
          osc2.frequency.setValueAtTime(1000, now);

          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(ctx.destination);

          osc1.start(now);
          osc2.start(now);
          osc1.stop(now + 0.15);
          osc2.stop(now + 0.15);
          break;
        }

        case 'respect': {
          // Respect gain (power-up sound)
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(200, now);
          osc.frequency.exponentialRampToValueAtTime(400, now + 0.12);

          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.15);
          break;
        }

        case 'checkpoint': {
          // Checkpoint passed (quick confirmation beep)
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(600, now);
          osc.frequency.setValueAtTime(800, now + 0.05);

          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.1);
          break;
        }

        case 'carjack': {
          // Car theft sound (door slam + ignition)
          const noise = ctx.createBufferSource();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          // Create short noise burst for door slam
          const bufferSize = ctx.sampleRate * 0.1;
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize / 4));
          }
          noise.buffer = buffer;

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(80, now + 0.1);
          osc.frequency.exponentialRampToValueAtTime(120, now + 0.25);

          gain.gain.setValueAtTime(0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

          noise.connect(gain);
          osc.connect(gain);
          gain.connect(ctx.destination);

          noise.start(now);
          osc.start(now + 0.1);
          osc.stop(now + 0.3);
          break;
        }

        case 'shoot': {
          // Generic shoot sound (same as gunshot for now)
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();

          osc.type = 'square';
          osc.frequency.setValueAtTime(200, now);
          osc.frequency.exponentialRampToValueAtTime(50, now + 0.05);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(800, now);

          gain.gain.setValueAtTime(0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.1);
          break;
        }

        case 'mission_start': {
          // Mission start (descending tone)
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(800, now);
          osc.frequency.exponentialRampToValueAtTime(400, now + 0.2);

          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.25);
          break;
        }

        case 'mission_complete': {
          // Alias for missionComplete
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();

          osc1.type = 'sine';
          osc2.type = 'sine';

          osc1.frequency.setValueAtTime(523, now); // C
          osc1.frequency.setValueAtTime(659, now + 0.1); // E
          osc1.frequency.setValueAtTime(784, now + 0.2); // G

          osc2.frequency.setValueAtTime(523 * 2, now);
          osc2.frequency.setValueAtTime(659 * 2, now + 0.1);
          osc2.frequency.setValueAtTime(784 * 2, now + 0.2);

          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(ctx.destination);

          osc1.start(now);
          osc2.start(now);
          osc1.stop(now + 0.4);
          osc2.stop(now + 0.4);
          break;
        }

        case 'mission_fail': {
          // Alias for missionFail
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(300, now);
          osc.frequency.exponentialRampToValueAtTime(100, now + 0.3);

          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.3);
          break;
        }

        case 'ambient_traffic': {
          // Distant traffic rumble
          const osc = ctx.createOscillator();
          const noise = ctx.createBufferSource();
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();

          // Low rumble
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(60, now);
          osc.frequency.linearRampToValueAtTime(50, now + 2);

          // Noise for texture
          const bufferSize = ctx.sampleRate * 2;
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.5;
          }
          noise.buffer = buffer;

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(200, now);

          gain.gain.setValueAtTime(0.03, now); // Very quiet
          gain.gain.setValueAtTime(0.03, now + 2);

          osc.connect(filter);
          noise.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          noise.start(now);
          osc.stop(now + 2);
          break;
        }

        case 'ambient_city': {
          // Distant city sounds (wind, distant activity)
          const noise = ctx.createBufferSource();
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();

          const bufferSize = ctx.sampleRate * 1.5;
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.3;
          }
          noise.buffer = buffer;

          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(400, now);

          gain.gain.setValueAtTime(0.02, now); // Very quiet
          gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

          noise.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);

          noise.start(now);
          break;
        }

        default:
          break;
      }
    } catch (error) {
      console.warn('Audio playback error:', error);
    }

    // Keep old visual feedback
    setSoundEffect(soundType);
    setTimeout(() => setSoundEffect(null), 500);
  };

  // Main game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = setInterval(() => {
      setGameTime(prev => prev + 1);

      // Time of day progression (5 minutes = 1 hour for slower transitions)
      if (gameTime % 300 === 0) {
        setTimeOfDay(prev => (prev + 1) % 24);
      }

      // Collect property income every 5 seconds
      if (gameTime % 300 === 0 && ownedProperties.length > 0) {
        let totalIncome = 0;
        ownedProperties.forEach(propId => {
          const prop = properties.find(p => p.id === propId);
          if (prop && prop.income > 0) {
            totalIncome += prop.income;
          }
        });
        if (totalIncome > 0) {
          setPlayer(p => ({ ...p, money: p.money + totalIncome }));
          setMissionProgress(`Collected £${totalIncome} from properties!`);
          setTimeout(() => setMissionProgress(''), 2000);
        }
      }

      // Play ambient city sounds periodically
      if (gameTime % 600 === 0) { // Every 10 seconds
        if (Math.random() < 0.4) {
          playSound('ambient_traffic');
        }
      }
      if (gameTime % 450 === 0) { // Every 7.5 seconds, offset from traffic
        if (Math.random() < 0.3) {
          playSound('ambient_city');
        }
      }

      // Update mission timer
      if (missionTimer !== null && missionTimer > 0) {
        setMissionTimer(prev => Math.max(0, prev - 1/60));
        if (missionTimer <= 0) {
          failMission("Time's up, mate!");
        }
      }
      
      // Get current vehicle stats
      const currentVehicle = vehicleStats[player.vehicle];
      
      // Update player
      setPlayer(prev => {
        let newPlayer = { ...prev };
        
        // Handle acceleration/braking with vehicle stats
        if (keys['ArrowUp'] || keys['w']) {
          newPlayer.speed = Math.min(newPlayer.speed + currentVehicle.acceleration, currentVehicle.maxSpeed);
          // Engine sound when accelerating (occasional, not constant)
          if (Math.random() < 0.05) {
            playSound('engine', { speed: Math.abs(newPlayer.speed) });
          }
        } else if (keys['ArrowDown'] || keys['s']) {
          newPlayer.speed = Math.max(newPlayer.speed - (currentVehicle.acceleration * 1.5), -currentVehicle.maxSpeed * 0.5);
        } else {
          newPlayer.speed *= 0.95;
        }
        
        // Handle steering with vehicle stats
        if (Math.abs(newPlayer.speed) > 0.5) {
          const turnSpeed = currentVehicle.handling * Math.min(Math.abs(newPlayer.speed), 3);
          const isTurning = keys['ArrowLeft'] || keys['a'] || keys['ArrowRight'] || keys['d'];

          if (keys['ArrowLeft'] || keys['a']) {
            newPlayer.angle -= turnSpeed;
          }
          if (keys['ArrowRight'] || keys['d']) {
            newPlayer.angle += turnSpeed;
          }

          // Add tire smoke when drifting (turning fast at high speed)
          if (isTurning && Math.abs(newPlayer.speed) > 2 && Math.random() < 0.3) {
            const tireX = newPlayer.x - Math.cos(newPlayer.angle) * 10;
            const tireY = newPlayer.y - Math.sin(newPlayer.angle) * 10;
            addParticles(tireX, tireY, 'smoke', 2);
          }
        }
        
        // Calculate new position
        let newX = newPlayer.x + Math.cos(newPlayer.angle) * newPlayer.speed;
        let newY = newPlayer.y + Math.sin(newPlayer.angle) * newPlayer.speed;
        
        // Keep in world bounds
        newX = Math.max(40, Math.min(WORLD_WIDTH - 40, newX));
        newY = Math.max(40, Math.min(WORLD_HEIGHT - 40, newY));
        
        // Check building collision
        if (Math.abs(newPlayer.speed) > 0.1) {
          const collision = checkCollision(newX, newY, 18, 18);
          if (collision) {
            newPlayer.speed *= -0.3;
            const damage = Math.min(Math.abs(newPlayer.speed) * 3, 10);
            newPlayer.health = Math.max(0, newPlayer.health - damage);

            if (damage > 1) {
              addParticles(newPlayer.x, newPlayer.y, 'crash', 8);
              addParticles(newPlayer.x, newPlayer.y, 'sparks', 12); // Metal on metal
              addScreenShake(Math.min(damage * 2, 15)); // Shake based on impact
              playSound('crash', { intensity: damage / 10 }); // Scale sound with damage
            }
            
            // Damage cargo
            if (missionState === 'deliver' && currentMission) {
              const mission = missions.find(m => m.id === currentMission);
              if (mission?.type === 'fragile_delivery' && mission.cargoHealth) {
                mission.cargoHealth = Math.max(0, mission.cargoHealth - 15);
                if (mission.cargoHealth <= 0) {
                  failMission("Scarves destroyed!");
                }
              }
            }
          } else {
            newPlayer.x = newX;
            newPlayer.y = newY;
          }
        } else {
          newPlayer.x = newX;
          newPlayer.y = newY;
        }
        
        // Check environmental object collisions
        environmentObjects.forEach(obj => {
          if (!obj.destroyed) {
            const dist = getDistance(newPlayer.x, newPlayer.y, obj.x, obj.y);
            if (dist < 15 && Math.abs(newPlayer.speed) > 2) {
              obj.destroyed = true;
              addParticles(obj.x, obj.y, obj.type === 'stall' ? 'wood' : 'crash', 8);
              playSound('crash');
              newPlayer.wantedLevel = Math.min(5, newPlayer.wantedLevel + 0.5);
              newPlayer.respect += 2;
            }
          }
        });
        
        // Wanted level decay
        if (newPlayer.wantedLevel > 0 && Math.random() < 0.001) {
          newPlayer.wantedLevel = Math.max(0, newPlayer.wantedLevel - 1);
        }
        
        return newPlayer;
      });
      
      // Check for nearby vehicle to steal
      let closestVehicle = null;
      let closestDist = 40;
      
      npcs.forEach(npc => {
        const dist = getDistance(player.x, player.y, npc.x, npc.y);
        if (dist < closestDist) {
          closestVehicle = npc;
          closestDist = dist;
        }
      });
      
      setNearbyVehicle(closestVehicle);
      
      // Update NPC cars with waypoint following
      setNpcs(prev => prev.map(npc => {
        let newNpc = { ...npc };
        const route = roadRoutes[npc.route];

        if (route && route.length > 0) {
          // Get current and next waypoint
          const currentWaypoint = route[npc.waypointIndex];
          const distToWaypoint = getDistance(npc.x, npc.y, currentWaypoint.x, currentWaypoint.y);

          // If close to waypoint, move to next one
          if (distToWaypoint < 50) {
            newNpc.waypointIndex = (npc.waypointIndex + npc.direction + route.length) % route.length;
          }

          const targetWaypoint = route[newNpc.waypointIndex];
          const targetAngle = Math.atan2(targetWaypoint.y - npc.y, targetWaypoint.x - npc.x);

          // Smoothly turn towards target
          let angleDiff = targetAngle - npc.angle;
          while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
          while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

          newNpc.angle += angleDiff * 0.08;

          // Add slight random swerving for realism
          if (Math.random() < 0.05) {
            newNpc.angle += (Math.random() - 0.5) * 0.1;
          }
        } else {
          // Fallback to old behavior if no route
          if (Math.random() < 0.02) {
            newNpc.angle += (Math.random() - 0.5) * 0.3;
          }
        }

        newNpc.x += Math.cos(newNpc.angle) * newNpc.speed;
        newNpc.y += Math.sin(newNpc.angle) * newNpc.speed;

        // Bounce off edges
        if (newNpc.x < 40 || newNpc.x > WORLD_WIDTH - 40) {
          newNpc.angle = Math.PI - newNpc.angle;
          newNpc.x = Math.max(40, Math.min(WORLD_WIDTH - 40, newNpc.x));
        }
        if (newNpc.y < 40 || newNpc.y > WORLD_HEIGHT - 40) {
          newNpc.angle = -newNpc.angle;
          newNpc.y = Math.max(40, Math.min(WORLD_HEIGHT - 40, newNpc.y));
        }

        // Player collision
        const dist = getDistance(player.x, player.y, newNpc.x, newNpc.y);
        if (dist < 22 && Math.abs(player.speed) > 1 && Math.random() < 0.05) {
          setPlayer(p => ({
            ...p,
            health: Math.max(0, p.health - 3),
            wantedLevel: Math.min(5, p.wantedLevel + 0.5)
          }));
          addParticles(player.x, player.y, 'crash', 3);
          playSound('crash');
        }

        return newNpc;
      }));
      
      // Update race opponent
      if (raceOpponent) {
        setRaceOpponent(prev => {
          const mission = missions.find(m => m.id === currentMission);
          if (!mission || !mission.finishLocation) return null;
          
          const targetAngle = Math.atan2(
            mission.finishLocation.y - prev.y,
            mission.finishLocation.x - prev.x
          );
          
          let newOpponent = { ...prev };
          newOpponent.angle += (targetAngle - newOpponent.angle) * 0.1;
          newOpponent.x += Math.cos(newOpponent.angle) * newOpponent.speed;
          newOpponent.y += Math.sin(newOpponent.angle) * newOpponent.speed;
          
          // Check if opponent finished
          const distToFinish = getDistance(newOpponent.x, newOpponent.y, mission.finishLocation.x, mission.finishLocation.y);
          if (distToFinish < 50) {
            failMission("The Range Rover won! Proper embarrassing.");
            return null;
          }
          
          return newOpponent;
        });
      }
      
      // Update chase target
      if (missionTarget && missionState === 'chase') {
        setMissionTarget(prev => {
          let newTarget = { ...prev };
          
          // Run away from player
          const awayAngle = Math.atan2(prev.y - player.y, prev.x - player.x);
          newTarget.angle += (awayAngle - newTarget.angle) * 0.1;
          newTarget.x += Math.cos(newTarget.angle) * newTarget.speed;
          newTarget.y += Math.sin(newTarget.angle) * newTarget.speed;
          
          // Keep in bounds
          newTarget.x = Math.max(60, Math.min(WORLD_WIDTH - 60, newTarget.x));
          newTarget.y = Math.max(60, Math.min(WORLD_HEIGHT - 60, newTarget.y));
          
          return newTarget;
        });
        
        // Check if caught
        const dist = getDistance(player.x, player.y, missionTarget.x, missionTarget.y);
        if (dist < 25) {
          const mission = missions.find(m => m.id === currentMission);
          completeMission(mission);
        }
      }
      
      // Update pedestrians
      setPedestrians(prev => prev.map(ped => {
        let newPed = { ...ped };
        
        if (Math.random() < 0.03) {
          newPed.angle += (Math.random() - 0.5) * 1;
        }
        
        newPed.x += Math.cos(newPed.angle) * newPed.speed;
        newPed.y += Math.sin(newPed.angle) * newPed.speed;
        
        newPed.x = Math.max(40, Math.min(WORLD_WIDTH - 40, newPed.x));
        newPed.y = Math.max(40, Math.min(WORLD_HEIGHT - 40, newPed.y));
        
        const dist = getDistance(player.x, player.y, newPed.x, newPed.y);
        if (dist < 30 && Math.abs(player.speed) > 3) {
          newPed.angle = Math.atan2(newPed.y - player.y, newPed.x - player.x);
          newPed.speed = 1.5;
          
          if (dist < 15) {
            setPlayer(p => ({ ...p, wantedLevel: Math.min(5, p.wantedLevel + 2) }));
            playSound('horn');
          }
        } else {
          newPed.speed = 0.3;
        }
        
        return newPed;
      }));
      
      // Update police with smarter AI
      if (player.wantedLevel > 0) {
        setPolice(prev => {
          let cops = [...prev];

          // More cops at higher wanted levels (up to 5)
          const maxCops = Math.min(player.wantedLevel * 2, 8);

          // Spawn ground units
          const groundCops = cops.filter(c => c.type !== 'helicopter' && c.type !== 'roadblock');
          if (groundCops.length < maxCops && Math.random() < 0.015) {
            cops.push({
              id: Date.now() + Math.random(),
              x: player.x + (Math.random() - 0.5) * 600,
              y: player.y + (Math.random() - 0.5) * 600,
              angle: 0,
              speed: 2.2 + (player.wantedLevel * 0.2), // Faster at higher stars
              sirenPhase: 0,
              type: 'car',
              aggression: player.wantedLevel // More aggressive at higher wanted levels
            });
            playSound('siren');
          }

          // Spawn helicopters at 4+ stars
          if (player.wantedLevel >= 4) {
            const helis = cops.filter(c => c.type === 'helicopter');
            if (helis.length < 1 && Math.random() < 0.005) {
              cops.push({
                id: Date.now() + Math.random(),
                x: player.x + (Math.random() - 0.5) * 800,
                y: player.y - 400, // Spawn from above/behind
                angle: 0,
                speed: 2.5,
                type: 'helicopter',
                altitude: 100,
                rotorPhase: 0
              });
              playSound('siren');
            }
          }

          // Create roadblocks at 3+ stars
          if (player.wantedLevel >= 3) {
            const roadblocks = cops.filter(c => c.type === 'roadblock');
            if (roadblocks.length < 2 && Math.random() < 0.002) {
              // Place roadblock ahead of player
              const aheadX = player.x + Math.cos(player.angle) * 400;
              const aheadY = player.y + Math.sin(player.angle) * 400;

              cops.push({
                id: Date.now() + Math.random(),
                x: aheadX,
                y: aheadY,
                angle: player.angle + Math.PI, // Face toward player
                speed: 0, // Stationary
                type: 'roadblock',
                sirenPhase: 0,
                health: 50
              });
            }
          }

          cops = cops.map(cop => {
            if (cop.type === 'helicopter') {
              // Helicopter AI - fly above and track player
              const targetAngle = Math.atan2(player.y - cop.y, player.x - cop.x);
              cop.angle += (targetAngle - cop.angle) * 0.05;

              cop.x += Math.cos(cop.angle) * cop.speed;
              cop.y += Math.sin(cop.angle) * cop.speed;
              cop.rotorPhase = (cop.rotorPhase + 0.3) % (Math.PI * 2);

              // Helicopter shoots at high wanted levels
              const dist = getDistance(player.x, player.y, cop.x, cop.y);
              if (dist < 200 && Math.random() < 0.01 && player.wantedLevel >= 5) {
                setPlayer(p => ({ ...p, health: Math.max(0, p.health - 1) }));
                addParticles(player.x, player.y, 'sparks', 3);
              }
            } else if (cop.type === 'roadblock') {
              // Roadblock - stationary but damages player on collision
              cop.sirenPhase = (cop.sirenPhase + 0.1) % (Math.PI * 2);

              const dist = getDistance(player.x, player.y, cop.x, cop.y);
              if (dist < 30 && Math.abs(player.speed) > 2) {
                addParticles(cop.x, cop.y, 'crash', 15);
                addScreenShake(15);
                playSound('crash', { intensity: 1 });
                setPlayer(p => ({
                  ...p,
                  health: Math.max(0, p.health - 15),
                  speed: p.speed * -0.5
                }));
                cop.health -= 25;
                if (cop.health <= 0) {
                  return null; // Destroy roadblock
                }
              }
            } else {
              // Regular police car AI - smarter pursuit
              const distToPlayer = getDistance(player.x, player.y, cop.x, cop.y);

              // Predict player position
              const predictX = player.x + Math.cos(player.angle) * Math.abs(player.speed) * 10;
              const predictY = player.y + Math.sin(player.angle) * Math.abs(player.speed) * 10;

              const targetAngle = Math.atan2(predictY - cop.y, predictX - cop.x);
              cop.angle += (targetAngle - cop.angle) * (0.04 + cop.aggression * 0.01);

              // Speed up when close, try to ram
              if (distToPlayer < 100) {
                cop.speed = Math.min(cop.speed * 1.05, 4);
              }

              cop.x += Math.cos(cop.angle) * cop.speed;
              cop.y += Math.sin(cop.angle) * cop.speed;
              cop.sirenPhase = (cop.sirenPhase + 0.1) % (Math.PI * 2);

              // Damage player on contact
              if (distToPlayer < 20) {
                if (Math.random() < 0.03 * cop.aggression) {
                  setPlayer(p => ({ ...p, health: Math.max(0, p.health - 0.8) }));
                  addParticles(cop.x, cop.y, 'sparks', 2);
                }
              }
            }

            return cop;
          }).filter(cop => cop !== null);

          return cops;
        });
      } else {
        setPolice([]);
      }

      // Update traffic
      setTraffic(prev => {
        let vehicles = [...prev];

        // Spawn new traffic vehicles (max 8 on screen)
        if (vehicles.length < 8 && Math.random() < 0.03) {
          const routeNames = Object.keys(roadRoutes);
          const randomRoute = routeNames[Math.floor(Math.random() * routeNames.length)];
          const route = roadRoutes[randomRoute];

          if (route && route.length > 1) {
            const vehicleTypes = ['normal_car', 'van', 'range_rover'];
            const colors = ['#666', '#888', '#555', '#777', '#999'];

            vehicles.push({
              id: Date.now() + Math.random(),
              x: route[0].x,
              y: route[0].y,
              angle: 0,
              speed: 1.2 + Math.random() * 0.8, // Random speed 1.2-2.0
              route: route,
              waypointIndex: 0,
              vehicle: vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)],
              color: colors[Math.floor(Math.random() * colors.length)]
            });
          }
        }

        // Update each traffic vehicle
        vehicles = vehicles.map(car => {
          if (!car.route || car.waypointIndex >= car.route.length) {
            return null; // Remove if no route or finished
          }

          const targetWaypoint = car.route[car.waypointIndex];
          const distToWaypoint = getDistance(car.x, car.y, targetWaypoint.x, targetWaypoint.y);

          // Move to next waypoint when close enough
          if (distToWaypoint < 30) {
            car.waypointIndex++;
            if (car.waypointIndex >= car.route.length) {
              return null; // Reached end of route, remove vehicle
            }
          }

          // Steer towards current waypoint
          const targetAngle = Math.atan2(targetWaypoint.y - car.y, targetWaypoint.x - car.x);
          car.angle += (targetAngle - car.angle) * 0.05;

          // Move forward
          car.x += Math.cos(car.angle) * car.speed;
          car.y += Math.sin(car.angle) * car.speed;

          // Check collision with player
          const distToPlayer = getDistance(car.x, car.y, player.x, player.y);
          if (distToPlayer < 25 && Math.abs(player.speed) > 1) {
            // Traffic collision!
            addParticles(car.x, car.y, 'crash', 5);
            addScreenShake(5);
            playSound('crash', { intensity: 0.5 });
            setPlayer(p => ({
              ...p,
              health: Math.max(0, p.health - 2),
              speed: p.speed * 0.5
            }));
            return null; // Remove car after collision
          }

          return car;
        }).filter(car => car !== null); // Remove nulls

        return vehicles;
      });

      // Check pickups
      pickups.forEach(pickup => {
        const dist = getDistance(player.x, player.y, pickup.x, pickup.y);
        if (dist < 20) {
          if (pickup.type === 'health') {
            setPlayer(p => ({ ...p, health: Math.min(100, p.health + 25) }));
            playSound('health');
          } else if (pickup.type === 'money') {
            setPlayer(p => ({ ...p, money: p.money + pickup.value }));
            addParticles(pickup.x, pickup.y, 'money', 10);
            playSound('money');
          } else if (pickup.type === 'respect') {
            setPlayer(p => ({ ...p, respect: p.respect + pickup.value }));
            playSound('respect');
          }
          setPickups(prev => prev.filter(p => p.id !== pickup.id));
        }
      });
      
      // Mission logic
      if (currentMission && missionState) {
        const mission = missions.find(m => m.id === currentMission);
        
        // Timed pickup/delivery
        if ((mission?.type === 'timed_pickup' || mission?.type === 'timed_delivery' || mission?.type === 'stealth') && mission.pickupLocation && mission.deliverLocation) {
          if (missionState === 'pickup') {
            const dist = getDistance(player.x, player.y, mission.pickupLocation.x, mission.pickupLocation.y);
            if (dist < 50) {
              setMissionState('deliver');
              setMissionProgress(`Got it! Now deliver before time runs out!`);
              playSound('pickup');
              
              if (mission.wantedOnPickup) {
                setPlayer(p => ({ ...p, wantedLevel: 3 }));
              }
            }
          } else if (missionState === 'deliver') {
            const dist = getDistance(player.x, player.y, mission.deliverLocation.x, mission.deliverLocation.y);
            if (dist < 50) {
              completeMission(mission);
            }
          }
        }
        
        // Fragile delivery
        if (mission?.type === 'fragile_delivery' && mission.deliverLocation) {
          const dist = getDistance(player.x, player.y, mission.deliverLocation.x, mission.deliverLocation.y);
          if (dist < 50) {
            completeMission(mission);
          }
        }
        
        // Multi-checkpoint
        if (mission?.type === 'multi_checkpoint' && mission.checkpoints) {
          mission.checkpoints.forEach((checkpoint, index) => {
            if (!checkpointsVisited.includes(index)) {
              const dist = getDistance(player.x, player.y, checkpoint.x, checkpoint.y);
              if (dist < 50) {
                setCheckpointsVisited(prev => [...prev, index]);
                playSound('checkpoint');
                setMissionProgress(`Checkpoint ${index + 1}/${mission.checkpoints.length}!`);
                
                if (checkpointsVisited.length + 1 === mission.checkpoints.length) {
                  completeMission(mission);
                }
              }
            }
          });
        }
        
        // Race
        if (mission?.type === 'race' && mission.finishLocation && raceOpponent) {
          const dist = getDistance(player.x, player.y, mission.finishLocation.x, mission.finishLocation.y);
          if (dist < 50) {
            completeMission(mission);
            setRaceOpponent(null);
          }
        }

        // Property Empire
        if (mission?.type === 'buy_properties') {
          if (ownedProperties.length >= mission.targetCount) {
            completeMission(mission);
          }
        }

        // Skill Challenge
        if (mission?.type === 'skill_challenge') {
          const skillValue = player[mission.skillRequired];
          if (skillValue >= mission.targetLevel) {
            completeMission(mission);
          }
        }
      }
      
      // Update particles with enhanced physics
      setParticles(prev =>
        prev.map(p => ({
          ...p,
          x: p.x + (p.vx || 0),
          y: p.y + (p.vy || 0),
          life: p.life - 1,
          vy: (p.vy || 0) + (p.type === 'smoke' ? 0.05 : 0.1), // Smoke rises slower
          vx: (p.vx || 0) * 0.98, // Air resistance
          size: p.growth ? (p.size || 2) + (p.growth || 0) : (p.size || 2)
        })).filter(p => p.life > 0)
      );

      // Update screen shake (decay)
      setScreenShake(prev => ({
        x: prev.x * 0.8,
        y: prev.y * 0.8,
        intensity: prev.intensity * 0.8
      }));

      // Update bullets
      setBullets(prev => {
        return prev.map(bullet => {
          const newBullet = { ...bullet };
          newBullet.x += Math.cos(bullet.angle) * bullet.speed;
          newBullet.y += Math.sin(bullet.angle) * bullet.speed;
          newBullet.life--;

          // Check bullet hits on NPCs
          npcs.forEach(npc => {
            const dist = getDistance(newBullet.x, newBullet.y, npc.x, npc.y);
            if (dist < 15 && !bullet.hit) {
              newBullet.hit = true;
              newBullet.life = 0;
              setNpcs(prev => prev.filter(n => n.id !== npc.id));
              addParticles(npc.x, npc.y, 'blood', 12); // Blood splatter
              addParticles(npc.x, npc.y, 'sparks', 5); // Some sparks too
              setPlayer(p => ({ ...p, respect: p.respect + 5, shooting: Math.min(100, p.shooting + 0.5) }));
            }
          });

          // Check bullet hits on pedestrians
          pedestrians.forEach(ped => {
            const dist = getDistance(newBullet.x, newBullet.y, ped.x, ped.y);
            if (dist < 10 && !bullet.hit) {
              newBullet.hit = true;
              newBullet.life = 0;
              setPedestrians(prev => prev.filter(p => p.id !== ped.id));
              addParticles(ped.x, ped.y, 'blood', 12); // Blood splatter
              setPlayer(p => ({ ...p, wantedLevel: Math.min(5, p.wantedLevel + 3) }));
            }
          });

          return newBullet;
        }).filter(b => b.life > 0 && !b.hit);
      });

      // Driving skill improvement
      if (Math.abs(player.speed) > 3) {
        if (Math.random() < 0.001) {
          setPlayer(p => ({ ...p, driving: Math.min(100, p.driving + 0.1) }));
        }
      }

      if (player.health <= 0) {
        gameOver("Wrecked!");
      }
      
    }, 1000 / 60);

    return () => clearInterval(gameLoop);
  }, [gameState, keys, player, currentMission, missionState, missionTimer, npcs, pedestrians, police, traffic, pickups, gameTime, missionTarget, raceOpponent, checkpointsVisited, environmentObjects, bullets, properties, ownedProperties, timeOfDay]);

  // Drawing with camera system
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Clear - adjust color based on time of day
    const isNight = timeOfDay < 6 || timeOfDay > 20;
    const isDusk = (timeOfDay >= 18 && timeOfDay <= 20) || (timeOfDay >= 5 && timeOfDay < 7);
    const baseColor = isNight ? '#1a2e14' : isDusk ? '#2d4a1f' : '#3d6e23';
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);

    // Helper function to convert world coords to screen coords with zoom and screen shake
    const toScreen = (worldX, worldY) => {
      if (isometricView) {
        // Apply isometric transformation
        const iso = worldToIso(worldX, worldY);
        const cameraIso = worldToIso(camera.x, camera.y);
        // Zoom around center of viewport with screen shake
        const offsetX = iso.x - cameraIso.x - VIEWPORT_WIDTH / 2;
        const offsetY = iso.y - cameraIso.y - VIEWPORT_HEIGHT / 3;
        return {
          x: offsetX * ZOOM_FACTOR + VIEWPORT_WIDTH / 2 + screenShake.x,
          y: offsetY * ZOOM_FACTOR + VIEWPORT_HEIGHT / 3 + screenShake.y
        };
      } else {
        // Orthographic (original view) with zoom applied around center and screen shake
        const offsetX = worldX - camera.x - VIEWPORT_WIDTH / 2;
        const offsetY = worldY - camera.y - VIEWPORT_HEIGHT / 2;
        return {
          x: offsetX * ZOOM_FACTOR + VIEWPORT_WIDTH / 2 + screenShake.x,
          y: offsetY * ZOOM_FACTOR + VIEWPORT_HEIGHT / 2 + screenShake.y
        };
      }
    };

    // Draw territories first (under everything)
    territories.forEach(territory => {
      const screen = toScreen(territory.x, territory.y);
      if (screen.x + territory.width > 0 && screen.x < VIEWPORT_WIDTH &&
          screen.y + territory.height > 0 && screen.y < VIEWPORT_HEIGHT) {
        ctx.fillStyle = territory.gang === 'burnley' ? 'rgba(108, 28, 63, 0.2)' :
                        territory.gang === 'blackburn' ? 'rgba(0, 81, 186, 0.2)' :
                        'rgba(128, 128, 128, 0.1)';
        ctx.fillRect(screen.x, screen.y, territory.width, territory.height);
        ctx.strokeStyle = territory.gang === 'burnley' ? '#6c1c3f' :
                          territory.gang === 'blackburn' ? '#0051ba' : '#888';
        ctx.lineWidth = 2;
        ctx.strokeRect(screen.x, screen.y, territory.width, territory.height);
      }
    });

    // Grass texture
    ctx.fillStyle = isNight ? '#1a2a10' : '#2d5016';
    for (let i = 0; i < 200; i++) {
      const worldX = Math.random() * WORLD_WIDTH;
      const worldY = Math.random() * WORLD_HEIGHT;
      const screenX = worldX - camera.x;
      const screenY = worldY - camera.y;
      if (screenX >= 0 && screenX < VIEWPORT_WIDTH && screenY >= 0 && screenY < VIEWPORT_HEIGHT) {
        ctx.fillRect(screenX, screenY, 2, 2);
      }
    }

    // === REALISTIC GTA-STYLE ROAD NETWORK WITH PAVEMENTS ===
    // Updated road system with clear pavements and lane markings

    // Helper function to draw roads with pavements like classic GTA
    const drawRoadWithPavement = (route, roadWidth, hasLaneMarkings = false, isMajorRoad = false) => {
      // Draw pavement/sidewalk (outer layer - lighter)
      ctx.strokeStyle = '#6a6a6a';  // Gray pavement
      ctx.lineWidth = (roadWidth + 16) * ZOOM_FACTOR;  // Pavement extends beyond road
      ctx.lineCap = 'butt';
      ctx.lineJoin = 'miter';

      ctx.beginPath();
      route.forEach((point, i) => {
        let s = toScreen(point.x, point.y);
        if (i === 0) {
          ctx.moveTo(s.x, s.y);
        } else {
          if (i > 0 && i < route.length - 1 && isMajorRoad) {
            const prev = route[i - 1];
            let cp1 = toScreen((prev.x + point.x) / 2, (prev.y + point.y) / 2);
            ctx.quadraticCurveTo(cp1.x, cp1.y, s.x, s.y);
          } else {
            ctx.lineTo(s.x, s.y);
          }
        }
      });
      ctx.stroke();

      // Draw road surface (inner layer - dark)
      ctx.strokeStyle = '#2a2a2a';  // Dark road surface
      ctx.lineWidth = roadWidth * ZOOM_FACTOR;

      ctx.beginPath();
      route.forEach((point, i) => {
        let s = toScreen(point.x, point.y);
        if (i === 0) {
          ctx.moveTo(s.x, s.y);
        } else {
          if (i > 0 && i < route.length - 1 && isMajorRoad) {
            const prev = route[i - 1];
            let cp1 = toScreen((prev.x + point.x) / 2, (prev.y + point.y) / 2);
            ctx.quadraticCurveTo(cp1.x, cp1.y, s.x, s.y);
          } else {
            ctx.lineTo(s.x, s.y);
          }
        }
      });
      ctx.stroke();

      // Draw lane markings if requested
      if (hasLaneMarkings) {
        ctx.strokeStyle = '#ffeb3b';  // Yellow lane marking
        ctx.lineWidth = 2 * ZOOM_FACTOR;
        ctx.setLineDash([12 * ZOOM_FACTOR, 8 * ZOOM_FACTOR]);

        ctx.beginPath();
        route.forEach((point, i) => {
          let s = toScreen(point.x, point.y);
          if (i === 0) {
            ctx.moveTo(s.x, s.y);
          } else {
            if (i > 0 && i < route.length - 1 && isMajorRoad) {
              const prev = route[i - 1];
              let cp1 = toScreen((prev.x + point.x) / 2, (prev.y + point.y) / 2);
              ctx.quadraticCurveTo(cp1.x, cp1.y, s.x, s.y);
            } else {
              ctx.lineTo(s.x, s.y);
            }
          }
        });
        ctx.stroke();
        ctx.setLineDash([]);
      }
    };

    // M65 MOTORWAY (Main Highway connecting Blackburn-Accrington-Burnley)
    drawRoadWithPavement(roadRoutes.m65_motorway, 56, true, true);

    // A-ROADS (Major connecting roads) - Medium width with pavements
    // A646 - East from Burnley towards Todmorden
    drawRoadWithPavement(roadRoutes.a646_east, 42, true, false);

    // A679 - Accrington to Blackburn
    drawRoadWithPavement(roadRoutes.a679_accrington_blackburn, 42, true, true);

    // A671 - Burnley to Padiham to Whalley (main route)
    drawRoadWithPavement(roadRoutes.a671_burnley_whalley, 42, true, true);

    // A682 (Burnley Road) - South from Burnley through Rossendale Valley
    drawRoadWithPavement(roadRoutes.a682_burnley_road, 42, true, true);

    // Colne Road - Burnley to Nelson to Colne
    drawRoadWithPavement(roadRoutes.colne_road, 42, true, true);

    // === LANDMARK ACCESS ROADS (narrow roads branching from main roads) ===
    ctx.strokeStyle = '#4a4a4a';
    ctx.lineWidth = 22 * ZOOM_FACTOR;

    // Access road to Rossendale Valley Sailing Club (branches east from A682)
    ctx.beginPath();
    let sailS = toScreen(1250, 640);
    ctx.moveTo(sailS.x, sailS.y);
    sailS = toScreen(1300, 630);
    let sailCp1 = toScreen(1275, 635);
    ctx.quadraticCurveTo(sailCp1.x, sailCp1.y, sailS.x, sailS.y);
    sailS = toScreen(1360, 610);
    sailCp1 = toScreen(1330, 620);
    ctx.quadraticCurveTo(sailCp1.x, sailCp1.y, sailS.x, sailS.y);
    sailS = toScreen(1420, 615);
    sailCp1 = toScreen(1390, 612);
    ctx.quadraticCurveTo(sailCp1.x, sailCp1.y, sailS.x, sailS.y);
    sailS = toScreen(1490, 620);
    sailCp1 = toScreen(1455, 617);
    ctx.quadraticCurveTo(sailCp1.x, sailCp1.y, sailS.x, sailS.y);
    ctx.stroke();

    // Access road to Singing Ringing Tree (branches east from A682)
    ctx.beginPath();
    let treeS = toScreen(1275, 525);
    ctx.moveTo(treeS.x, treeS.y);
    treeS = toScreen(1295, 525);
    let treeCp1 = toScreen(1285, 525);
    ctx.quadraticCurveTo(treeCp1.x, treeCp1.y, treeS.x, treeS.y);
    treeS = toScreen(1320, 530);
    treeCp1 = toScreen(1307, 527);
    ctx.quadraticCurveTo(treeCp1.x, treeCp1.y, treeS.x, treeS.y);
    ctx.stroke();

    // Access road to Darwen Tower (branches from scenic road)
    ctx.beginPath();
    let towerS = toScreen(200, 800);
    ctx.moveTo(towerS.x, towerS.y);
    towerS = toScreen(190, 810);
    let towerCp1 = toScreen(195, 805);
    ctx.quadraticCurveTo(towerCp1.x, towerCp1.y, towerS.x, towerS.y);
    towerS = toScreen(180, 820);
    towerCp1 = toScreen(185, 815);
    ctx.quadraticCurveTo(towerCp1.x, towerCp1.y, towerS.x, towerS.y);
    ctx.stroke();

    // B-ROADS (Shortcuts and scenic routes) - Narrower, more winding (scaled for zoom)
    ctx.strokeStyle = '#424242';
    ctx.lineWidth = 34 * ZOOM_FACTOR;

    // B6235 - Padiham back road
    ctx.beginPath();
    let s = toScreen(450, 600);
    ctx.moveTo(s.x, s.y);
    s = toScreen(500, 750);
    let cp1 = toScreen(460, 680);
    ctx.quadraticCurveTo(cp1.x, cp1.y, s.x, s.y);
    s = toScreen(530, 940);
    cp1 = toScreen(510, 840);
    ctx.quadraticCurveTo(cp1.x, cp1.y, s.x, s.y);
    s = toScreen(580, 1120);
    cp1 = toScreen(540, 1030);
    ctx.quadraticCurveTo(cp1.x, cp1.y, s.x, s.y);
    ctx.stroke();

    // B6233 - Hill road to Accrington
    ctx.beginPath();
    s = toScreen(950, 600);
    ctx.moveTo(s.x, s.y);
    s = toScreen(1050, 650);
    cp1 = toScreen(1000, 610);
    ctx.quadraticCurveTo(cp1.x, cp1.y, s.x, s.y);
    s = toScreen(1180, 720);
    cp1 = toScreen(1110, 680);
    ctx.quadraticCurveTo(cp1.x, cp1.y, s.x, s.y);
    s = toScreen(1280, 760);
    ctx.lineTo(s.x, s.y);
    ctx.stroke();

    // B6234 - Whalley to M65
    ctx.beginPath();
    s = toScreen(945, 1752);
    ctx.moveTo(s.x, s.y);
    s = toScreen(1000, 1600);
    cp1 = toScreen(960, 1680);
    ctx.quadraticCurveTo(cp1.x, cp1.y, s.x, s.y);
    s = toScreen(1080, 1420);
    cp1 = toScreen(1030, 1510);
    ctx.quadraticCurveTo(cp1.x, cp1.y, s.x, s.y);
    s = toScreen(1150, 1280);
    ctx.lineTo(s.x, s.y);
    ctx.stroke();

    // LOCAL STREETS (Town areas) - Narrow with pavements
    // Burnley town center streets
    drawRoadWithPavement(roadRoutes.st_james_street, 28, false, false);
    drawRoadWithPavement(roadRoutes.church_street_burnley, 28, false, false);
    drawRoadWithPavement(roadRoutes.manchester_road, 28, false, false);

    // Blackburn town center streets
    drawRoadWithPavement(roadRoutes.king_william_street, 28, false, false);
    drawRoadWithPavement(roadRoutes.darwen_street, 28, false, false);
    drawRoadWithPavement(roadRoutes.church_street_blackburn, 28, false, false);

    // Accrington town center streets
    drawRoadWithPavement(roadRoutes.blackburn_road_accrington, 28, false, false);
    drawRoadWithPavement(roadRoutes.union_road_accrington, 28, false, false);

    // Rawtenstall town center
    drawRoadWithPavement(roadRoutes.rawtenstall_center, 28, false, false);

    // DARWEN TOWER scenic road (winding mountain road southwest of Blackburn)
    ctx.strokeStyle = '#484848';
    ctx.lineWidth = 30 * ZOOM_FACTOR;
    ctx.beginPath();
    s = toScreen(220, 650);  // Start from Blackburn area
    ctx.moveTo(s.x, s.y);
    s = toScreen(210, 700);
    cp1 = toScreen(215, 675);
    ctx.quadraticCurveTo(cp1.x, cp1.y, s.x, s.y);
    s = toScreen(205, 750);
    cp1 = toScreen(208, 725);
    ctx.quadraticCurveTo(cp1.x, cp1.y, s.x, s.y);
    s = toScreen(200, 800);  // Arrive at Darwen Tower
    cp1 = toScreen(203, 775);
    ctx.quadraticCurveTo(cp1.x, cp1.y, s.x, s.y);
    ctx.stroke();
    
    // Leeds-Liverpool Canal (runs through Burnley)
    ctx.strokeStyle = '#4682b4';
    ctx.lineWidth = 16 * ZOOM_FACTOR;
    ctx.beginPath();
    screen = toScreen(900, 300);
    ctx.moveTo(screen.x, screen.y);
    screen = toScreen(1100, 320);
    ctx.quadraticCurveTo(screen.x - 50, screen.y, screen.x, screen.y);
    screen = toScreen(1300, 360);
    ctx.lineTo(screen.x, screen.y);
    ctx.stroke();

    // Clow Bridge Reservoir (irregular water body east of road, matching real shape)
    ctx.fillStyle = '#3a7ca5';  // Water blue
    ctx.beginPath();

    // Create irregular reservoir shape - well east of A682 road
    let reservoirPoints = [
      { x: 1340, y: 550 },   // Northwest corner (moved 120px east)
      { x: 1400, y: 545 },   // North edge
      { x: 1460, y: 560 },   // Northeast with curve
      { x: 1480, y: 600 },   // East edge bulge
      { x: 1470, y: 650 },   // Southeast curve
      { x: 1440, y: 680 },   // South bulge
      { x: 1400, y: 690 },   // South center
      { x: 1360, y: 685 },   // Southwest
      { x: 1330, y: 660 },   // West edge curve
      { x: 1325, y: 610 },   // West side
      { x: 1330, y: 570 }    // Back to northwest
    ];

    screen = toScreen(reservoirPoints[0].x, reservoirPoints[0].y);
    ctx.moveTo(screen.x, screen.y);

    // Draw smooth curves between points
    for (let i = 1; i < reservoirPoints.length; i++) {
      const current = toScreen(reservoirPoints[i].x, reservoirPoints[i].y);
      const prev = toScreen(reservoirPoints[i - 1].x, reservoirPoints[i - 1].y);
      const cpx = (prev.x + current.x) / 2;
      const cpy = (prev.y + current.y) / 2;
      ctx.quadraticCurveTo(prev.x, prev.y, cpx, cpy);
      ctx.lineTo(current.x, current.y);
    }

    ctx.closePath();
    ctx.fill();

    // Water texture (darker patches for realistic water)
    ctx.fillStyle = 'rgba(30, 60, 90, 0.2)';
    const waterPatches = [
      { x: 1380, y: 580, w: 40, h: 35 },
      { x: 1420, y: 610, w: 35, h: 30 },
      { x: 1360, y: 640, w: 38, h: 28 },
      { x: 1400, y: 655, w: 32, h: 25 }
    ];

    waterPatches.forEach(patch => {
      screen = toScreen(patch.x, patch.y);
      ctx.fillRect(screen.x, screen.y, patch.w * ZOOM_FACTOR, patch.h * ZOOM_FACTOR);
    });

    // Reservoir edge line (shoreline)
    ctx.strokeStyle = 'rgba(50, 90, 120, 0.6)';
    ctx.lineWidth = 2 * ZOOM_FACTOR;
    ctx.beginPath();
    screen = toScreen(reservoirPoints[0].x, reservoirPoints[0].y);
    ctx.moveTo(screen.x, screen.y);
    reservoirPoints.forEach(point => {
      screen = toScreen(point.x, point.y);
      ctx.lineTo(screen.x, screen.y);
    });
    ctx.closePath();
    ctx.stroke();

    // Corporation Park (Blackburn - west side)
    screen = toScreen(220, 550);
    ctx.fillStyle = '#2d8b3d';
    ctx.fillRect(screen.x, screen.y, 140 * ZOOM_FACTOR, 160 * ZOOM_FACTOR);

    // Trees in park
    for (let i = 0; i < 12; i++) {
      screen = toScreen(230 + (i % 4) * 25, 560 + Math.floor(i / 4) * 35);
      ctx.fillStyle = '#4a5d23';
      ctx.beginPath();
      ctx.arc(screen.x, screen.y, 8 * ZOOM_FACTOR, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Buildings
    buildings.forEach(building => {
      screen = toScreen(building.x, building.y);

      // Only draw if on screen
      if (screen.x + building.width > 0 && screen.x < VIEWPORT_WIDTH &&
          screen.y + building.height > 0 && screen.y < VIEWPORT_HEIGHT) {

        // Special rendering for Rossendale Valley Sailing Club
        if (building.type === 'sailing_club') {
          // Sailing club building
          ctx.fillStyle = '#d4a574';  // Light brown/tan for boat house
          ctx.fillRect(screen.x, screen.y, building.width * ZOOM_FACTOR, building.height * ZOOM_FACTOR);

          // Roof (darker brown)
          ctx.fillStyle = '#8b6914';
          ctx.beginPath();
          ctx.moveTo(screen.x - 5 * ZOOM_FACTOR, screen.y);
          ctx.lineTo(screen.x + building.width * ZOOM_FACTOR / 2, screen.y - 15 * ZOOM_FACTOR);
          ctx.lineTo(screen.x + (building.width + 5) * ZOOM_FACTOR, screen.y);
          ctx.closePath();
          ctx.fill();

          // Windows
          ctx.fillStyle = '#87ceeb';
          ctx.fillRect(screen.x + 8 * ZOOM_FACTOR, screen.y + 10 * ZOOM_FACTOR, 8 * ZOOM_FACTOR, 8 * ZOOM_FACTOR);
          ctx.fillRect(screen.x + 20 * ZOOM_FACTOR, screen.y + 10 * ZOOM_FACTOR, 8 * ZOOM_FACTOR, 8 * ZOOM_FACTOR);

          // Door
          ctx.fillStyle = '#654321';
          ctx.fillRect(screen.x + 35 * ZOOM_FACTOR, screen.y + 15 * ZOOM_FACTOR, 10 * ZOOM_FACTOR, 15 * ZOOM_FACTOR);

          // Draw sailboats moored at the club (5 boats)
          const boats = [
            { x: building.x - 15, y: building.y + 25 },
            { x: building.x - 8, y: building.y + 30 },
            { x: building.x + 5, y: building.y + 28 },
            { x: building.x + 18, y: building.y + 32 },
            { x: building.x + 30, y: building.y + 29 }
          ];

          boats.forEach((boat, i) => {
            const boatScreen = toScreen(boat.x, boat.y);

            // Boat hull
            ctx.fillStyle = i % 2 === 0 ? '#ffffff' : '#3a7ca5';
            ctx.beginPath();
            ctx.moveTo(boatScreen.x - 6 * ZOOM_FACTOR, boatScreen.y);
            ctx.lineTo(boatScreen.x + 6 * ZOOM_FACTOR, boatScreen.y);
            ctx.lineTo(boatScreen.x + 4 * ZOOM_FACTOR, boatScreen.y + 8 * ZOOM_FACTOR);
            ctx.lineTo(boatScreen.x - 4 * ZOOM_FACTOR, boatScreen.y + 8 * ZOOM_FACTOR);
            ctx.closePath();
            ctx.fill();

            // Mast (brown pole)
            ctx.strokeStyle = '#654321';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(boatScreen.x, boatScreen.y);
            ctx.lineTo(boatScreen.x, boatScreen.y - 20 * ZOOM_FACTOR);
            ctx.stroke();

            // Sail (triangular)
            ctx.fillStyle = i % 3 === 0 ? '#ff6b6b' : i % 3 === 1 ? '#4ecdc4' : '#ffe66d';
            ctx.globalAlpha = 0.7;
            ctx.beginPath();
            ctx.moveTo(boatScreen.x, boatScreen.y - 20 * ZOOM_FACTOR);
            ctx.lineTo(boatScreen.x, boatScreen.y - 2 * ZOOM_FACTOR);
            ctx.lineTo(boatScreen.x + 8 * ZOOM_FACTOR, boatScreen.y - 10 * ZOOM_FACTOR);
            ctx.closePath();
            ctx.fill();
            ctx.globalAlpha = 1.0;
          });

          // Jetty/dock (wooden planks)
          ctx.fillStyle = '#8b7355';
          ctx.fillRect(screen.x - 10 * ZOOM_FACTOR, screen.y + 20 * ZOOM_FACTOR, 8 * ZOOM_FACTOR, 30 * ZOOM_FACTOR);
          ctx.fillRect(screen.x + 52 * ZOOM_FACTOR, screen.y + 20 * ZOOM_FACTOR, 8 * ZOOM_FACTOR, 30 * ZOOM_FACTOR);

        } else {
          // Use view-appropriate renderer
          if (isometricView) {
            drawIsometricBuilding(ctx, screen.x, screen.y, building, isNight);
          } else {
            drawTopDownBuilding(ctx, screen.x, screen.y, building, isNight);
          }
        }
      }
    });
    
    // Environmental objects (enhanced with shadows and details)
    environmentObjects.forEach(obj => {
      if (!obj.destroyed) {
        screen = toScreen(obj.x, obj.y);

        if (screen.x > -50 && screen.x < VIEWPORT_WIDTH + 50 &&
            screen.y > -50 && screen.y < VIEWPORT_HEIGHT + 50) {

          if (obj.type === 'lamppost') {
            // Shadow
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.fillRect(screen.x + 1, screen.y + 1, 4, 15);

            // Pole
            ctx.fillStyle = '#555';
            ctx.fillRect(screen.x - 2, screen.y - 15, 4, 15);

            // Light (glowing at night)
            if (isNight) {
              ctx.fillStyle = 'rgba(255, 235, 59, 0.3)';
              ctx.beginPath();
              ctx.arc(screen.x, screen.y - 15, 12, 0, Math.PI * 2);
              ctx.fill();
            }

            ctx.fillStyle = isNight ? '#ffeb3b' : '#f5f5dc';
            ctx.beginPath();
            ctx.arc(screen.x, screen.y - 15, 4, 0, Math.PI * 2);
            ctx.fill();

            // Light bracket
            ctx.fillStyle = '#333';
            ctx.fillRect(screen.x - 5, screen.y - 16, 10, 2);

          } else if (obj.type === 'bin') {
            // Shadow
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.fillRect(screen.x - 3, screen.y - 5, 8, 10);

            // Bin body
            ctx.fillStyle = '#444';
            ctx.fillRect(screen.x - 4, screen.y - 6, 8, 10);

            // Lid
            ctx.fillStyle = '#555';
            ctx.fillRect(screen.x - 5, screen.y - 7, 10, 2);

            // Bin details
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;
            ctx.strokeRect(screen.x - 4, screen.y - 6, 8, 10);

          } else if (obj.type === 'stall') {
            // Shadow
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.fillRect(screen.x - 9, screen.y - 7, 20, 16);

            // Stall body
            ctx.fillStyle = '#8b4513';
            ctx.fillRect(screen.x - 10, screen.y - 8, 20, 16);

            // Awning
            ctx.fillStyle = '#ff6347';
            ctx.fillRect(screen.x - 12, screen.y - 12, 24, 5);

            // Awning stripes
            ctx.fillStyle = '#fff';
            ctx.fillRect(screen.x - 10, screen.y - 12, 4, 5);
            ctx.fillRect(screen.x - 2, screen.y - 12, 4, 5);
            ctx.fillRect(screen.x + 6, screen.y - 12, 4, 5);

            // Goods on stall
            ctx.fillStyle = '#32cd32';
            ctx.fillRect(screen.x - 8, screen.y - 6, 4, 4);
            ctx.fillStyle = '#ff4500';
            ctx.fillRect(screen.x - 2, screen.y - 6, 4, 4);
            ctx.fillStyle = '#ffeb3b';
            ctx.fillRect(screen.x + 4, screen.y - 6, 4, 4);

          } else if (obj.type === 'phonebox') {
            // Shadow
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.fillRect(screen.x - 3, screen.y - 9, 8, 10);

            // Phone box body (British red)
            ctx.fillStyle = '#cc0000';
            ctx.fillRect(screen.x - 4, screen.y - 10, 8, 10);

            // Window panes
            ctx.fillStyle = isNight ? 'rgba(255, 235, 59, 0.5)' : '#87ceeb';
            ctx.fillRect(screen.x - 3, screen.y - 9, 2, 3);
            ctx.fillRect(screen.x + 1, screen.y - 9, 2, 3);
            ctx.fillRect(screen.x - 3, screen.y - 5, 2, 3);
            ctx.fillRect(screen.x + 1, screen.y - 5, 2, 3);

            // Window frames
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 0.5;
            ctx.strokeRect(screen.x - 3, screen.y - 9, 6, 8);

            // Phone box top (crown)
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.moveTo(screen.x - 5, screen.y - 10);
            ctx.lineTo(screen.x, screen.y - 13);
            ctx.lineTo(screen.x + 5, screen.y - 10);
            ctx.fill();
          }
        }
      }
    });

    // Speed cameras
    speedCameras.forEach(camera => {
      screen = toScreen(camera.x, camera.y);

      if (screen.x > -50 && screen.x < VIEWPORT_WIDTH + 50 &&
          screen.y > -50 && screen.y < VIEWPORT_HEIGHT + 50) {

        // Camera pole (yellow with black stripes)
        ctx.fillStyle = '#333';
        ctx.fillRect(screen.x - 2, screen.y - 20, 4, 20);

        // Yellow markings on pole
        ctx.fillStyle = '#ffeb3b';
        ctx.fillRect(screen.x - 2, screen.y - 20, 4, 3);
        ctx.fillRect(screen.x - 2, screen.y - 14, 4, 3);
        ctx.fillRect(screen.x - 2, screen.y - 8, 4, 3);

        // Camera box
        ctx.fillStyle = '#666';
        ctx.fillRect(screen.x - 6, screen.y - 24, 12, 6);

        // Camera lens (with red flash if player is speeding nearby)
        const distToPlayer = Math.sqrt((player.x - camera.x) ** 2 + (player.y - camera.y) ** 2);
        const playerSpeed = Math.abs(player.speed) * 10; // Convert to approximate MPH
        const isSpeeding = distToPlayer < 50 && playerSpeed > camera.speedLimit;

        ctx.fillStyle = isSpeeding ? '#ff0000' : '#1a1a1a';
        ctx.beginPath();
        ctx.arc(screen.x, screen.y - 21, 3, 0, Math.PI * 2);
        ctx.fill();

        // Flash effect if speeding
        if (isSpeeding && gameTime % 10 < 5) {
          ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
          ctx.beginPath();
          ctx.arc(screen.x, screen.y - 21, 6, 0, Math.PI * 2);
          ctx.fill();
        }

        // Speed limit sign below camera
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(screen.x, screen.y - 30, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#cc0000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(screen.x, screen.y - 30, 8, 0, Math.PI * 2);
        ctx.stroke();

        // Speed limit number
        ctx.fillStyle = '#000';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(camera.speedLimit, screen.x, screen.y - 27);
      }
    });

    // Depth sorting for isometric view
    // Collect all dynamic objects that need depth sorting
    const renderObjects = [];

    // Add pickups
    pickups.forEach(pickup => {
      renderObjects.push({ type: 'pickup', data: pickup, y: pickup.y });
    });

    // Add pedestrians
    pedestrians.forEach(ped => {
      renderObjects.push({ type: 'pedestrian', data: ped, y: ped.y });
    });

    // Add NPC cars
    npcs.forEach(npc => {
      renderObjects.push({ type: 'npc', data: npc, y: npc.y });
    });

    // Add police
    police.forEach(cop => {
      renderObjects.push({ type: 'police', data: cop, y: cop.y });
    });

    // Add traffic
    traffic.forEach(car => {
      renderObjects.push({ type: 'traffic', data: car, y: car.y });
    });

    // Add chase target
    if (missionTarget && missionState === 'chase') {
      renderObjects.push({ type: 'chaseTarget', data: missionTarget, y: missionTarget.y });
    }

    // Add race opponent
    if (raceOpponent) {
      renderObjects.push({ type: 'raceOpponent', data: raceOpponent, y: raceOpponent.y });
    }

    // Add player
    renderObjects.push({ type: 'player', data: player, y: player.y });

    // Sort all objects by y-position (depth) for proper isometric rendering
    if (isometricView) {
      renderObjects.sort((a, b) => a.y - b.y);
    }

    // Render all sorted objects
    renderObjects.forEach(obj => {
      const data = obj.data;
      screen = toScreen(data.x, data.y);

      // Skip if off-screen
      if (screen.x < -50 || screen.x > VIEWPORT_WIDTH + 50 ||
          screen.y < -50 || screen.y > VIEWPORT_HEIGHT + 50) {
        return;
      }

      switch (obj.type) {
        case 'pickup':
          ctx.save();
          ctx.translate(screen.x, screen.y);
          ctx.scale(Math.sin(gameTime * 0.1) * 0.2 + 1, Math.sin(gameTime * 0.1) * 0.2 + 1);
          ctx.font = '20px Arial';
          ctx.fillText(data.icon, -10, 10);
          ctx.restore();
          break;

        case 'pedestrian':
          if (spritesLoaded && sprites.pedestrians) {
            const colorIndex = data.type === 'burnley' ? 0 : data.type === 'blackburn' ? 1 : 2;
            const dirIndex = getDirectionIndex(data.angle || 0);
            const sprite = sprites.pedestrians[colorIndex]?.[dirIndex];

            if (sprite) {
              ctx.drawImage(sprite, screen.x - 8, screen.y - 8, 16, 16);
            } else {
              // Fallback
              ctx.fillStyle = data.type === 'burnley' ? '#6c1c3f' :
                              data.type === 'blackburn' ? '#0051ba' : '#555';
              ctx.beginPath();
              ctx.arc(screen.x, screen.y, 4, 0, Math.PI * 2);
              ctx.fill();
            }
          } else {
            // Fallback while loading
            ctx.fillStyle = data.type === 'burnley' ? '#6c1c3f' :
                            data.type === 'blackburn' ? '#0051ba' : '#555';
            ctx.beginPath();
            ctx.arc(screen.x, screen.y, 4, 0, Math.PI * 2);
            ctx.fill();
          }
          break;

        case 'npc':
          if (spritesLoaded && sprites[data.vehicle || 'normal_car']) {
            const dirIndex = getDirectionIndex(data.angle);
            const sprite = sprites[data.vehicle || 'normal_car'][dirIndex];

            if (sprite) {
              ctx.drawImage(sprite, screen.x - 16, screen.y - 16, 32, 32);

              // Draw selection indicator if nearby
              if (nearbyVehicle && nearbyVehicle.id === data.id) {
                ctx.strokeStyle = '#00ff00';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(screen.x, screen.y, 20, 0, Math.PI * 2);
                ctx.stroke();
              }
            }
          } else {
            // Fallback rendering
            ctx.save();
            ctx.translate(screen.x, screen.y);
            ctx.rotate(data.angle);
            ctx.fillStyle = data.color;
            ctx.fillRect(-12, -8, 24, 16);
            ctx.fillStyle = '#000';
            ctx.fillRect(-12, -7, 5, 3);
            ctx.fillRect(-12, 4, 5, 3);

            if (nearbyVehicle && nearbyVehicle.id === data.id) {
              ctx.strokeStyle = '#00ff00';
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.arc(0, 0, 20, 0, Math.PI * 2);
              ctx.stroke();
            }

            ctx.restore();
          }
          break;

        case 'police':
          if (data.type === 'helicopter') {
            // Draw helicopter
            ctx.save();
            ctx.translate(screen.x, screen.y);

            // Shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fillRect(-15, 5, 30, 10);

            // Body
            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(-12, -8, 24, 12);
            ctx.fillStyle = '#333';
            ctx.fillRect(-10, -6, 20, 8);

            // Cockpit
            ctx.fillStyle = '#0a3d62';
            ctx.fillRect(-6, -5, 12, 6);

            // Spinning rotor (animated)
            ctx.strokeStyle = 'rgba(100, 100, 100, 0.5)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(Math.cos(data.rotorPhase) * 20, Math.sin(data.rotorPhase) * 20 - 8);
            ctx.lineTo(Math.cos(data.rotorPhase + Math.PI) * 20, Math.sin(data.rotorPhase + Math.PI) * 20 - 8);
            ctx.stroke();

            // Searchlight at night
            if (timeOfDay < 6 || timeOfDay > 20) {
              ctx.fillStyle = 'rgba(255, 255, 200, 0.1)';
              ctx.beginPath();
              ctx.arc(0, 10, 40, 0, Math.PI * 2);
              ctx.fill();
            }

            ctx.restore();
          } else if (data.type === 'roadblock') {
            // Draw roadblock - two police cars forming barrier
            ctx.save();
            ctx.translate(screen.x, screen.y);
            ctx.rotate(data.angle);

            // Car 1
            ctx.fillStyle = '#fff';
            ctx.fillRect(-30, -8, 20, 16);
            ctx.fillStyle = '#0051ba';
            ctx.fillRect(-28, -6, 16, 3);
            ctx.fillRect(-28, 3, 16, 3);

            // Car 2
            ctx.fillRect(10, -8, 20, 16);
            ctx.fillRect(12, -6, 16, 3);
            ctx.fillRect(12, 3, 16, 3);

            // Flashing lights
            const sirenColor = Math.sin(data.sirenPhase) > 0 ? '#ff0000' : '#0000ff';
            ctx.fillStyle = sirenColor;
            ctx.fillRect(-25, -10, 6, 3);
            ctx.fillRect(15, -10, 6, 3);

            ctx.restore();
          } else {
            // Regular police car
            if (spritesLoaded && sprites.police) {
              const dirIndex = getDirectionIndex(data.angle);
              const sprite = sprites.police[dirIndex];

              if (sprite) {
                ctx.drawImage(sprite, screen.x - 16, screen.y - 16, 32, 32);

                // Enhanced animated siren light with glow
                const sirenColor = Math.sin(data.sirenPhase) > 0 ? '#ff0000' : '#0000ff';
                const sirenIntensity = Math.abs(Math.sin(data.sirenPhase));

                // Outer glow
                ctx.fillStyle = sirenColor;
                ctx.globalAlpha = sirenIntensity * 0.3;
                ctx.beginPath();
                ctx.arc(screen.x, screen.y - 8, 12, 0, Math.PI * 2);
                ctx.fill();

                // Inner glow
                ctx.globalAlpha = sirenIntensity * 0.6;
                ctx.beginPath();
                ctx.arc(screen.x, screen.y - 8, 6, 0, Math.PI * 2);
                ctx.fill();

                // Siren light itself
                ctx.globalAlpha = 1;
                ctx.fillStyle = sirenColor;
                ctx.beginPath();
                ctx.arc(screen.x, screen.y - 8, 3, 0, Math.PI * 2);
                ctx.fill();
              }
            } else {
              // Fallback
              ctx.save();
              ctx.translate(screen.x, screen.y);
              ctx.rotate(data.angle);
              ctx.fillStyle = '#fff';
              ctx.fillRect(-12, -8, 24, 16);
              ctx.fillStyle = '#0051ba';
              ctx.fillRect(-8, -6, 16, 3);
              ctx.fillRect(-8, 3, 16, 3);
              ctx.fillStyle = Math.sin(data.sirenPhase) > 0 ? '#ff0000' : '#0000ff';
              ctx.fillRect(-3, -10, 6, 3);
              ctx.restore();
            }
          }
          break;

        case 'traffic':
          // Render traffic vehicles using sprites
          if (spritesLoaded && sprites[data.vehicle]) {
            const dirIndex = getDirectionIndex(data.angle);
            const sprite = sprites[data.vehicle][dirIndex];

            if (sprite) {
              ctx.drawImage(sprite, screen.x - 16, screen.y - 16, 32, 32);
            }
          } else {
            // Fallback simple rendering
            ctx.save();
            ctx.translate(screen.x, screen.y);
            ctx.rotate(data.angle);
            ctx.fillStyle = data.color || '#666';
            ctx.fillRect(-12, -8, 24, 16);
            ctx.fillStyle = '#fff';
            ctx.fillRect(8, -6, 3, 3); // Headlights
            ctx.fillRect(8, 3, 3, 3);
            ctx.restore();
          }
          break;

        case 'chaseTarget':
          if (spritesLoaded && sprites.normal_car) {
            const dirIndex = getDirectionIndex(data.angle);
            const sprite = sprites.normal_car[dirIndex];

            if (sprite) {
              ctx.drawImage(sprite, screen.x - 16, screen.y - 16, 32, 32);

              // Target indicator
              ctx.strokeStyle = '#ff0000';
              ctx.lineWidth = 3;
              ctx.beginPath();
              ctx.arc(screen.x, screen.y, 25, 0, Math.PI * 2);
              ctx.stroke();
            }
          } else {
            // Fallback
            ctx.save();
            ctx.translate(screen.x, screen.y);
            ctx.rotate(data.angle);
            ctx.fillStyle = '#0051ba';
            ctx.fillRect(-12, -8, 24, 16);
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 0, 25, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
          }
          break;

        case 'raceOpponent':
          if (spritesLoaded && sprites.boy_racer) {
            const dirIndex = getDirectionIndex(data.angle);
            const sprite = sprites.boy_racer[dirIndex];

            if (sprite) {
              ctx.drawImage(sprite, screen.x - 16, screen.y - 16, 32, 32);
            }
          } else {
            // Fallback
            ctx.save();
            ctx.translate(screen.x, screen.y);
            ctx.rotate(data.angle);
            ctx.fillStyle = data.color;
            ctx.fillRect(-12, -8, 24, 16);
            ctx.restore();
          }
          break;

        case 'player':
          if (spritesLoaded && sprites[data.vehicle]) {
            const dirIndex = getDirectionIndex(data.angle);
            const sprite = sprites[data.vehicle][dirIndex];

            if (sprite) {
              ctx.drawImage(sprite, screen.x - 16, screen.y - 16, 32, 32);

              // Exhaust flame when speeding
              if (Math.abs(data.speed) > 4) {
                const exhaustAngle = data.angle + Math.PI; // Behind the car
                const exhaustX = screen.x + Math.cos(exhaustAngle) * 12;
                const exhaustY = screen.y + Math.sin(exhaustAngle) * 12;

                ctx.fillStyle = '#ff4500';
                ctx.globalAlpha = 0.6;
                ctx.beginPath();
                ctx.arc(exhaustX, exhaustY, 4, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
              }

              // Vehicle damage effects (smoke when damaged, fire when critical)
              if (data.health < 50) {
                // Smoke from hood
                if (Math.random() < 0.15) {
                  const hoodAngle = data.angle;
                  const hoodX = data.x + Math.cos(hoodAngle) * 8;
                  const hoodY = data.y + Math.sin(hoodAngle) * 8;
                  addParticles(hoodX, hoodY, 'smoke', 1);
                }
              }

              if (data.health < 20) {
                // Fire! Critical damage
                if (Math.random() < 0.2) {
                  const hoodAngle = data.angle;
                  const hoodX = data.x + Math.cos(hoodAngle) * 8;
                  const hoodY = data.y + Math.sin(hoodAngle) * 8;
                  addParticles(hoodX, hoodY, 'explosion', 2);
                }
              }
            }
          } else {
            // Fallback rendering - EXTRA LARGE AND BRIGHT for visibility
            const currentVehicle = vehicleStats[data.vehicle];
            ctx.save();
            ctx.translate(screen.x, screen.y);
            ctx.rotate(data.angle);

            // Shadow (bigger)
            ctx.fillStyle = 'rgba(0,0,0,0.4)';
            ctx.fillRect(-30, -20, 60, 40);

            // Main body (MUCH bigger and brighter)
            ctx.fillStyle = '#ff0000'; // Bright red for maximum visibility
            ctx.fillRect(-28, -18, 56, 36);

            // Racing stripe
            ctx.fillStyle = '#ffff00'; // Bright yellow
            ctx.fillRect(-28, -2, 56, 4);

            // Bright headlights at front
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(22, -10, 4, 6);
            ctx.fillRect(22, 4, 4, 6);

            // Windows
            ctx.fillStyle = '#87CEEB'; // Light blue
            ctx.fillRect(-5, -12, 15, 10);
            ctx.fillRect(-5, 2, 15, 10);

            ctx.restore();
          }
          break;
      }
    });

    // PLAYER INDICATOR - Always visible bright marker
    const playerScreen = toScreen(player.x, player.y);
    // Pulsing circle
    const pulseSize = 40 + Math.sin(gameTime * 0.1) * 5;
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 4;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(playerScreen.x, playerScreen.y, pulseSize, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Arrow pointing down at player
    ctx.fillStyle = '#ffff00';
    ctx.font = 'bold 50px Arial';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 8;
    ctx.fillText('↓', playerScreen.x, playerScreen.y - 55);

    // "YOU" label
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px Arial';
    ctx.fillText('YOU', playerScreen.x, playerScreen.y - 70);
    ctx.shadowBlur = 0;

    // Tutorial overlay
    if (showTutorial && gameTime < 600) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(VIEWPORT_WIDTH / 2 - 200, 50, 400, 180);

      ctx.fillStyle = '#ffff00';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('HOW TO PLAY', VIEWPORT_WIDTH / 2, 85);

      ctx.fillStyle = '#fff';
      ctx.font = '18px Arial';
      ctx.fillText('Press W or ↑ to accelerate', VIEWPORT_WIDTH / 2, 120);
      ctx.fillText('Press A/D or ←/→ to turn', VIEWPORT_WIDTH / 2, 145);
      ctx.fillText('Press SPACE for horn', VIEWPORT_WIDTH / 2, 170);
      ctx.fillText('Press F to attack', VIEWPORT_WIDTH / 2, 195);

      ctx.font = '14px Arial';
      ctx.fillStyle = '#999';
      ctx.fillText('Press V to dismiss', VIEWPORT_WIDTH / 2, 220);
    }

    // Mission markers (render after all objects)
    if (currentMission && missionState) {
      const mission = missions.find(m => m.id === currentMission);
      
      // Checkpoints
      if (mission?.type === 'multi_checkpoint' && mission.checkpoints) {
        mission.checkpoints.forEach((checkpoint, index) => {
          if (!checkpointsVisited.includes(index)) {
            screen = toScreen(checkpoint.x, checkpoint.y);
            const pulse = Math.sin(gameTime * 0.1) * 5;
            ctx.fillStyle = '#ffff00';
            ctx.beginPath();
            ctx.arc(screen.x, screen.y, 30 + pulse, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.font = 'bold 24px Arial';
            ctx.fillText((index + 1).toString(), screen.x - 8, screen.y + 8);
          }
        });
      }
      
      // Pickup/deliver markers
      let targetX, targetY;
      let markerColor = '#ffff00';
      
      if (missionState === 'pickup' && mission.pickupLocation) {
        targetX = mission.pickupLocation.x;
        targetY = mission.pickupLocation.y;
      } else if (missionState === 'deliver' && mission.deliverLocation) {
        targetX = mission.deliverLocation.x;
        targetY = mission.deliverLocation.y;
        markerColor = '#00ff00';
      } else if (mission?.type === 'race' && mission.finishLocation) {
        targetX = mission.finishLocation.x;
        targetY = mission.finishLocation.y;
        markerColor = '#ff00ff';
      } else if (mission?.type === 'fragile_delivery' && mission.deliverLocation) {
        targetX = mission.deliverLocation.x;
        targetY = mission.deliverLocation.y;
        markerColor = '#00ff00';
      }
      
      if (targetX && targetY) {
        screen = toScreen(targetX, targetY);
        const pulse = Math.sin(gameTime * 0.1) * 8;
        ctx.fillStyle = markerColor;
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, 40 + pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.font = 'bold 32px Arial';
        ctx.fillText(missionState === 'pickup' || mission?.type === 'fragile_delivery' ? '!' : '✓', screen.x - 10, screen.y + 12);
      }
    }
    
    // Particles (enhanced with shadows and glow)
    particles.forEach(p => {
      screen = toScreen(p.x, p.y);
      const alpha = p.life / 30;
      const size = p.size || 2;

      // Glow effect for glowing particles (muzzle flash, explosions, sparks)
      if (p.glow) {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha * 0.4;
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, size * 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Shadow for smoke
      if (p.type === 'smoke') {
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.globalAlpha = alpha * 0.3;
        ctx.beginPath();
        ctx.arc(screen.x + 2, screen.y + 2, size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Main particle
      if (p.type === 'smoke') {
        // Render smoke as soft circles
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha * 0.6;
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Render other particles as pixels/squares
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.fillRect(screen.x - size/2, screen.y - size/2, size, size);
      }

      // Highlight pixel for sparkle effect on glowing particles
      if (p.glow && p.type !== 'smoke') {
        ctx.fillStyle = '#fff';
        ctx.globalAlpha = alpha * 0.8;
        ctx.fillRect(screen.x, screen.y, 1, 1);
      }

      ctx.globalAlpha = 1;
    });

    // Bullets (enhanced with glow and trail)
    bullets.forEach(bullet => {
      screen = toScreen(bullet.x, bullet.y);
      if (screen.x > -20 && screen.x < VIEWPORT_WIDTH + 20 &&
          screen.y > -20 && screen.y < VIEWPORT_HEIGHT + 20) {

        // Glow effect
        ctx.fillStyle = 'rgba(255, 255, 0, 0.2)';
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, 6, 0, Math.PI * 2);
        ctx.fill();

        // Bullet trail with gradient effect
        const trailX = screen.x - Math.cos(bullet.angle) * 15;
        const trailY = screen.y - Math.sin(bullet.angle) * 15;

        ctx.strokeStyle = 'rgba(255, 255, 0, 0.4)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(screen.x, screen.y);
        ctx.lineTo(trailX, trailY);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(255, 200, 0, 0.2)';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(screen.x, screen.y);
        ctx.lineTo(trailX, trailY);
        ctx.stroke();

        // Main bullet
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, 3, 0, Math.PI * 2);
        ctx.fill();

        // Highlight
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(screen.x - 1, screen.y - 1, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Property markers
    properties.forEach(prop => {
      screen = toScreen(prop.x, prop.y);
      if (screen.x > -50 && screen.x < VIEWPORT_WIDTH + 50 &&
          screen.y > -50 && screen.y < VIEWPORT_HEIGHT + 50) {
        const dist = getDistance(player.x, player.y, prop.x, prop.y);
        if (dist < 50) {
          // Show property info when nearby
          ctx.fillStyle = prop.owned ? '#00ff00' : '#ffd700';
          ctx.beginPath();
          ctx.arc(screen.x, screen.y, 25, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#000';
          ctx.font = 'bold 20px Arial';
          ctx.fillText(prop.owned ? '✓' : '£', screen.x - 8, screen.y + 8);

          if (!prop.owned) {
            ctx.fillStyle = '#fff';
            ctx.font = '10px Arial';
            ctx.fillText(`£${prop.cost/1000}k`, screen.x - 15, screen.y - 30);
          }
        } else {
          // Small marker when far
          ctx.fillStyle = prop.owned ? '#00ff00' : '#ffd700';
          ctx.fillRect(screen.x - 3, screen.y - 3, 6, 6);
        }
      }
    });

    // Town and location labels - CORRECTED GEOGRAPHY
    // Larger font for main towns, smaller for landmarks
    ctx.textAlign = 'center';

    // Draw location labels on the map
    const streetLabels = [
      // MAIN TOWNS (one label each, prominent)
      { name: "BURNLEY", x: 1200, y: 360, size: 18, bold: true },
      { name: "BLACKBURN", x: 320, y: 500, size: 18, bold: true },
      { name: "ACCRINGTON", x: 700, y: 400, size: 16, bold: true },

      // Smaller towns
      { name: "Rawtenstall", x: 1100, y: 930, size: 14, bold: false },
      { name: "Crawshawbooth", x: 1120, y: 730, size: 12, bold: false },
      { name: "Padiham", x: 850, y: 380, size: 12, bold: false },
      { name: "Whalley", x: 650, y: 250, size: 12, bold: false },
      { name: "Darwen", x: 200, y: 850, size: 12, bold: false },

      // Villages along A682
      { name: "Clow Bridge", x: 1200, y: 610, size: 11, bold: false },
      { name: "New Hall Hey", x: 1115, y: 780, size: 10, bold: false },

      // Key landmarks (only show notable ones)
      { name: "Turf Moor", x: 1050, y: 305, size: 11, bold: false },
      { name: "Ewood Park", x: 280, y: 465, size: 11, bold: false },
      { name: "Singing Ringing Tree", x: 1400, y: 270, size: 10, bold: false },
      { name: "Sailing Club", x: 1310, y: 645, size: 10, bold: false },

      // Major roads (reduced to avoid clutter)
      { name: "M65", x: 800, y: 390, size: 11, bold: false },
      { name: "A682", x: 1130, y: 650, size: 10, bold: false }
    ];

    streetLabels.forEach(label => {
      const screen = toScreen(label.x, label.y);
      if (screen.x > 0 && screen.x < VIEWPORT_WIDTH && screen.y > 0 && screen.y < VIEWPORT_HEIGHT) {
        // Set font size and weight based on label properties
        ctx.font = `${label.bold ? 'bold' : 'normal'} ${label.size}px Arial`;

        // Draw label with outline for visibility
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.strokeText(label.name, screen.x, screen.y);
        ctx.fillStyle = label.bold ? '#FFD700' : '#FFF';  // Gold for main towns, white for others
        ctx.fillText(label.name, screen.x, screen.y);
      }
    });

    ctx.textAlign = 'left'; // Reset alignment

    // Mini-map (showing full world)
    if (showMiniMap) {
      const miniSize = 150;
      const miniX = VIEWPORT_WIDTH - miniSize - 10;
      const miniY = 10;
      const scale = miniSize / WORLD_WIDTH;
      
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(miniX, miniY, miniSize, miniSize);
      
      // Locations
      locations.forEach(loc => {
        ctx.fillStyle = loc.type === 'burnley' ? '#6c1c3f' :
                         loc.type === 'blackburn' ? '#0051ba' :
                         loc.type === 'rossendale' ? '#228b22' :
                         loc.type === 'sailing' ? '#4ecdc4' :
                         loc.type === 'landmark' ? '#ffd700' : '#888';
        ctx.fillRect(miniX + loc.x * scale - 1, miniY + loc.y * scale - 1, 2, 2);
      });
      
      // Player
      ctx.fillStyle = '#00ff00';
      ctx.beginPath();
      ctx.arc(miniX + player.x * scale, miniY + player.y * scale, 3, 0, Math.PI * 2);
      ctx.fill();
      
      // Mission marker
      if (currentMission && missionState) {
        const mission = missions.find(m => m.id === currentMission);
        let targetX, targetY;
        
        if (missionState === 'pickup' && mission.pickupLocation) {
          targetX = mission.pickupLocation.x;
          targetY = mission.pickupLocation.y;
        } else if (missionState === 'deliver' && mission.deliverLocation) {
          targetX = mission.deliverLocation.x;
          targetY = mission.deliverLocation.y;
        }
        
        if (targetX && targetY) {
          ctx.fillStyle = missionState === 'pickup' ? '#ffff00' : '#00ff00';
          ctx.fillRect(miniX + targetX * scale - 2, miniY + targetY * scale - 2, 4, 4);
        }
      }
      
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.strokeRect(miniX, miniY, miniSize, miniSize);
    }

    // Night-time overlay
    if (isNight) {
      ctx.fillStyle = 'rgba(0, 0, 20, 0.4)';
      ctx.fillRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);
    } else if (isDusk) {
      ctx.fillStyle = 'rgba(0, 0, 20, 0.2)';
      ctx.fillRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);
    }

  }, [player, gameState, currentMission, missionState, npcs, pedestrians, police, traffic, pickups, particles, gameTime, showMiniMap, missionTarget, raceOpponent, checkpointsVisited, environmentObjects, nearbyVehicle, camera, bullets, properties, territories, timeOfDay, spritesLoaded, sprites, showTutorial]);

  const handleKeyDown = (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
      e.preventDefault();
    }
    
    setKeys(prev => ({ ...prev, [e.key]: true }));
    
    // Horn
    if (e.key === ' ') {
      playSound('horn');
      setPedestrians(prev => prev.map(ped => {
        const dist = getDistance(player.x, player.y, ped.x, ped.y);
        if (dist < 50) {
          return {
            ...ped,
            angle: Math.atan2(ped.y - player.y, ped.x - player.x),
            speed: 2
          };
        }
        return ped;
      }));
    }
    
    // Steal vehicle
    if ((e.key === 'e' || e.key === 'E') && nearbyVehicle) {
      const vehicleType = nearbyVehicle.vehicle;
      setPlayer(prev => ({ ...prev, vehicle: vehicleType }));
      setNpcs(prev => prev.filter(n => n.id !== nearbyVehicle.id));
      setNearbyVehicle(null);
      playSound('carjack');
      setMissionProgress(`Nicked a ${vehicleStats[vehicleType].name}!`);
      setTimeout(() => setMissionProgress(''), 2000);
    }

    // Shooting
    if ((e.key === 'f' || e.key === 'F')) {
      const now = Date.now();
      const weapon = weaponStats[player.weapon];

      if (now - lastShot > weapon.fireRate) {
        // Check ammo
        if (weapon.ammoType && player.ammo[weapon.ammoType] <= 0) {
          setMissionProgress("Out of ammo!");
          setTimeout(() => setMissionProgress(''), 1000);
          return;
        }

        // Fire weapon
        setLastShot(now);

        if (weapon.ammoType) {
          setPlayer(prev => ({
            ...prev,
            ammo: {
              ...prev.ammo,
              [weapon.ammoType]: prev.ammo[weapon.ammoType] - 1
            }
          }));

          // Create bullet with muzzle flash
          const muzzleX = player.x + Math.cos(player.angle) * 15;
          const muzzleY = player.y + Math.sin(player.angle) * 15;

          addParticles(muzzleX, muzzleY, 'muzzle', 8, player.angle); // Muzzle flash
          addScreenShake(2); // Small shake when shooting

          // Play weapon sound based on type
          if (player.weapon === 'shotgun') {
            playSound('shotgun');
          } else if (player.weapon === 'rifle' || player.weapon === 'pistol') {
            playSound('gunshot');
          }

          setBullets(prev => [...prev, {
            id: now,
            x: player.x,
            y: player.y,
            angle: player.angle,
            speed: 15,
            life: 100,
            damage: weapon.damage,
            hit: false
          }]);
        } else {
          // Melee attack with blood splatter
          npcs.forEach(npc => {
            const dist = getDistance(player.x, player.y, npc.x, npc.y);
            if (dist < weapon.range) {
              setNpcs(prev => prev.filter(n => n.id !== npc.id));
              addParticles(npc.x, npc.y, 'blood', 8); // Blood instead of crash
              addScreenShake(1); // Tiny shake for melee
              setPlayer(p => ({ ...p, strength: Math.min(100, p.strength + 0.5) }));
            }
          });
        }

        playSound('shoot');
      }
    }

    // Weapon switching (Q)
    if (e.key === 'q' || e.key === 'Q') {
      const weapons = ['fists', 'bat', 'pistol', 'shotgun', 'rifle'];
      const currentIndex = weapons.indexOf(player.weapon);
      const nextWeapon = weapons[(currentIndex + 1) % weapons.length];
      setPlayer(prev => ({ ...prev, weapon: nextWeapon }));
      setMissionProgress(`Equipped ${weaponStats[nextWeapon].name}`);
      setTimeout(() => setMissionProgress(''), 1500);
    }

    // Radio (R)
    if (e.key === 'r' || e.key === 'R') {
      setRadioStation(prev => (prev + 1) % radioStations.length);
    }

    // Buy property (B)
    if (e.key === 'b' || e.key === 'B') {
      properties.forEach(prop => {
        const dist = getDistance(player.x, player.y, prop.x, prop.y);
        if (dist < 50 && !prop.owned) {
          if (player.money >= prop.cost) {
            setPlayer(prev => ({ ...prev, money: prev.money - prop.cost }));
            prop.owned = true;
            setOwnedProperties(prev => [...prev, prop.id]);
            setMissionProgress(`Bought ${prop.name} for £${prop.cost}!`);
            playSound('money');
            setTimeout(() => setMissionProgress(''), 3000);
          } else {
            setMissionProgress(`Need £${prop.cost - player.money} more!`);
            setTimeout(() => setMissionProgress(''), 2000);
          }
        }
      });
    }

    // Save game (F5)
    if (e.key === 'F5') {
      e.preventDefault();
      saveGame();
    }

    // Toggle isometric view (V) and dismiss tutorial
    if (e.key === 'v' || e.key === 'V') {
      setShowTutorial(false); // Dismiss tutorial
      setIsometricView(prev => !prev);
      setMissionProgress(isometricView ? 'Switched to Top-Down View' : 'Switched to Isometric View');
      setTimeout(() => setMissionProgress(''), 2000);
    }

    // Load game (F9)
    if (e.key === 'F9') {
      e.preventDefault();
      loadGame();
    }
  };

  const handleKeyUp = (e) => {
    setKeys(prev => ({ ...prev, [e.key]: false }));
  };

  // Focus canvas when game starts
  useEffect(() => {
    if (gameState === 'playing' && canvasRef.current) {
      canvasRef.current.focus();
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const handleKey = (e) => handleKeyDown(e);
    const handleKeyUpEvent = (e) => handleKeyUp(e);

    window.addEventListener('keydown', handleKey);
    window.addEventListener('keyup', handleKeyUpEvent);

    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('keyup', handleKeyUpEvent);
    };
  }, [gameState]);

  const startGame = () => {
    setGameState('playing');
    setMissionProgress("Welcome to Grand Thef t'Auto! Combat, properties, territories - it's proper GTA now!");
    setTimeout(() => setMissionProgress(''), 6000);
  };

  const startMission = (missionId) => {
    const mission = missions.find(m => m.id === missionId);
    setCurrentMission(missionId);
    setCheckpointsVisited([]);
    
    if (mission.type === 'chase') {
      setMissionState('chase');
      setMissionTarget({
        x: 1800,
        y: 1600,
        angle: 0,
        speed: 3.5,
        color: '#0051ba'
      });
      setMissionProgress("Chase that Rovers fan! Get within 25m!");
    } else if (mission.type === 'race') {
      setMissionState('race');
      setRaceOpponent({
        x: mission.startLocation.x,
        y: mission.startLocation.y,
        angle: 0,
        speed: 4.5,
        color: '#2c3e50'
      });
      setMissionProgress("Race to the finish! It's a long drive!");
    } else if (mission.type === 'multi_checkpoint') {
      setMissionState('checkpoints');
      setMissionProgress(`Visit all ${mission.checkpoints.length} checkpoints!`);
    } else if (mission.type === 'timed_pickup' || mission.type === 'timed_delivery' || mission.type === 'stealth') {
      setMissionState('pickup');
      setMissionTimer(mission.timeLimit || null);
      setMissionProgress(`${mission.title}: Long drive ahead - get going!`);
    } else if (mission.type === 'fragile_delivery') {
      setMissionState('deliver');
      mission.cargoHealth = 100;
      setMissionProgress(`${mission.title}: Don't crash!`);
    }
    
    playSound('mission_start');
  };

  const completeMission = (mission) => {
    setPlayer(prev => ({
      ...prev,
      money: prev.money + mission.reward,
      respect: prev.respect + mission.respectGain,
      wantedLevel: 0
    }));
    
    const messages = ["Top job!", "Proper brilliant!", "Champion!", "Reyt good!", "Mint!"];
    setMissionProgress(`MISSION COMPLETE! ${messages[Math.floor(Math.random() * messages.length)]} +£${mission.reward} +${mission.respectGain} respect`);
    addParticles(player.x, player.y, 'money', 20);
    playSound('mission_complete');
    
    setCurrentMission(null);
    setMissionState(null);
    setMissionTimer(null);
    setMissionTarget(null);
    setRaceOpponent(null);
    setCheckpointsVisited([]);
    mission.completed = true;
    
    setTimeout(() => setMissionProgress(''), 5000);
  };

  const failMission = (reason) => {
    setMissionProgress(`MISSION FAILED: ${reason}`);
    setCurrentMission(null);
    setMissionState(null);
    setMissionTimer(null);
    setMissionTarget(null);
    setRaceOpponent(null);
    setCheckpointsVisited([]);
    playSound('mission_fail');
    
    setTimeout(() => setMissionProgress(''), 3000);
  };

  const gameOver = (reason) => {
    // Big explosion effect on death!
    addParticles(player.x, player.y, 'explosion', 30);
    addParticles(player.x, player.y, 'smoke', 15);
    addScreenShake(25); // Big shake!
    playSound('explosion'); // BOOM!

    setMissionProgress(`WRECKED: ${reason}`);
    setTimeout(() => {
      setPlayer(prev => ({
        ...prev,
        x: 400,
        y: 300,
        health: 50,
        wantedLevel: 0,
        speed: 0,
        angle: 0
      }));
      setMissionProgress('Respawned. Watch yourself!');
      setCurrentMission(null);
      setMissionState(null);
      setPolice([]);
      setTraffic([]);
    }, 3000);
  };

  // Save game
  const saveGame = () => {
    const saveData = {
      player,
      ownedProperties,
      territories,
      timeOfDay,
      missions: missions.map(m => ({ id: m.id, completed: m.completed }))
    };
    localStorage.setItem('grandThefTAutoSave', JSON.stringify(saveData));
    setMissionProgress('Game saved!');
    setTimeout(() => setMissionProgress(''), 2000);
  };

  // Load game
  const loadGame = () => {
    const saveData = localStorage.getItem('grandThefTAutoSave');
    if (saveData) {
      const data = JSON.parse(saveData);
      setPlayer(data.player);
      setOwnedProperties(data.ownedProperties || []);
      setTerritories(data.territories || territories);
      setTimeOfDay(data.timeOfDay || 12);
      if (data.missions) {
        data.missions.forEach(savedMission => {
          const mission = missions.find(m => m.id === savedMission.id);
          if (mission) mission.completed = savedMission.completed;
        });
      }
      setMissionProgress('Game loaded!');
      setTimeout(() => setMissionProgress(''), 2000);
    }
  };

  if (gameState === 'menu') {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-gray-900 via-red-950 to-black flex items-center justify-center">
        <div className="text-center p-8 bg-gradient-to-br from-gray-900 to-black border-4 border-red-600 rounded-lg max-w-2xl shadow-2xl">
          <h1 className="text-6xl font-bold mb-4 text-yellow-400 drop-shadow-[0_0_20px_rgba(234,179,8,0.5)]">
            GRAND THEF T'AUTO
          </h1>
          <h2 className="text-4xl font-bold mb-6 text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]">
            BURNLEY EDITION
          </h2>
          <p className="text-xl text-yellow-300 mb-6 italic font-semibold">
            "Full GTA Experience in East Lancashire!"
          </p>
          <div className="text-left text-white mb-6 space-y-2 bg-black bg-opacity-40 p-4 rounded-lg">
            <p className="text-lg font-bold text-yellow-400 border-b border-yellow-600 pb-1">⚡ NEW FEATURES:</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-200">
              <p>🔫 Weapons & Combat</p>
              <p>🏠 Property Ownership</p>
              <p>📊 Character Stats & Skills</p>
              <p>🏴 Territory Control</p>
              <p>🌅 Day/Night Cycle</p>
              <p>📻 Radio Stations</p>
              <p>💾 Save/Load Game</p>
              <p>💰 Passive Income</p>
            </div>

            <p className="text-lg font-bold text-yellow-400 mt-3 border-b border-yellow-600 pb-1">🎮 CONTROLS:</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-200">
              <p>• <span className="text-white font-semibold">WASD</span> - Drive</p>
              <p>• <span className="text-white font-semibold">F</span> - Shoot/Attack</p>
              <p>• <span className="text-white font-semibold">E</span> - Steal car</p>
              <p>• <span className="text-white font-semibold">Q</span> - Switch weapon</p>
              <p>• <span className="text-white font-semibold">SPACE</span> - Horn</p>
              <p>• <span className="text-white font-semibold">R</span> - Change radio</p>
              <p>• <span className="text-white font-semibold">B</span> - Buy property</p>
              <p>• <span className="text-white font-semibold">V</span> - Toggle view</p>
              <p>• <span className="text-white font-semibold">F5/F9</span> - Save/Load</p>
            </div>
          </div>
          <button
            onClick={startGame}
            className="bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white font-bold py-4 px-8 rounded-lg text-xl transition-all transform hover:scale-105 shadow-lg border-2 border-red-500"
          >
            🚗 START GAME 🚗
          </button>
        </div>
      </div>
    );
  }

  const currentVehicle = vehicleStats[player.vehicle];

  return (
    <div className="w-full h-screen bg-gradient-to-b from-gray-900 to-black flex flex-col overflow-hidden">
      {/* Compact Header */}
      <div className="bg-gradient-to-r from-red-900 to-red-800 px-4 py-2 shadow-lg border-b-2 border-red-600">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-yellow-400 drop-shadow-lg">Grand Thef t'Auto: Burnley</h1>
          <div className="flex gap-6 items-center text-white text-sm">
            <div className="flex items-center gap-1 bg-black bg-opacity-40 px-2 py-1 rounded">
              <Car className="w-4 h-4 text-yellow-400" />
              <span className="font-semibold">{currentVehicle.name}</span>
            </div>
            {soundEffect && (
              <div className="text-yellow-400 animate-pulse">
                <Volume2 className="w-5 h-5" />
              </div>
            )}
            {nearbyVehicle && (
              <div className="bg-green-600 px-2 py-1 rounded animate-pulse font-bold">
                <Key className="w-4 h-4 inline mr-1" />
                Press E!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content - Side by Side */}
      <div className="flex-1 flex gap-3 p-3 min-h-0">
        {/* Left: Game Canvas */}
        <div className="flex-shrink-0 flex flex-col">
          <canvas
            ref={canvasRef}
            width={VIEWPORT_WIDTH}
            height={VIEWPORT_HEIGHT}
            className="border-4 border-red-700 rounded-lg bg-green-900 shadow-2xl"
            tabIndex={0}
            style={{ cursor: 'crosshair' }}
          />

          {/* Compact Stats Bar Below Canvas */}
          <div className="mt-2 bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg p-2 border border-gray-700">
            <div className="grid grid-cols-5 gap-3 text-white text-xs">
              <div className="flex items-center gap-1">
                <Heart className="w-3 h-3 text-red-500" />
                <div className="flex-1 bg-gray-700 h-2 rounded">
                  <div className="bg-red-600 h-2 rounded" style={{ width: `${player.health}%` }} />
                </div>
                <span className="font-mono text-red-400">{player.health}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-blue-400">🛡️</span>
                <div className="flex-1 bg-gray-700 h-2 rounded">
                  <div className="bg-blue-500 h-2 rounded" style={{ width: `${player.armor}%` }} />
                </div>
                <span className="font-mono text-blue-400">{player.armor}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-green-400">£</span>
                <span className="font-mono font-bold text-green-400">£{player.money.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Trophy className="w-3 h-3 text-yellow-500" />
                <span className="font-mono text-yellow-400">{player.respect}</span>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-3 h-3"
                    fill={i < player.wantedLevel ? '#ef4444' : 'none'}
                    color="#ef4444"
                  />
                ))}
              </div>
            </div>
            <div className="grid grid-cols-5 gap-3 text-white text-xs mt-1.5">
              <div className="flex items-center gap-1">
                <span className="text-yellow-400">🔫</span>
                <span className="text-yellow-300 font-semibold">{weaponStats[player.weapon].name}</span>
                {weaponStats[player.weapon].ammoType && (
                  <span className="text-gray-400 font-mono">({player.ammo[weaponStats[player.weapon].ammoType]})</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Car className="w-3 h-3 text-blue-400" />
                <span className="font-mono text-blue-300">{Math.abs(player.speed).toFixed(1)} mph</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-blue-400" />
                <span className="font-mono text-blue-300">{String(timeOfDay).padStart(2, '0')}:00</span>
                <span>{timeOfDay < 6 || timeOfDay > 20 ? '🌙' : timeOfDay < 12 ? '🌅' : timeOfDay < 18 ? '☀️' : '🌆'}</span>
              </div>
              <div className="flex items-center gap-1 col-span-2">
                <span className="text-purple-400">📻</span>
                <span className="truncate text-purple-300">{radioStations[radioStation].name}</span>
              </div>
              {/* Travel time/distance display */}
              {(() => {
                // Calculate nearest major destination and travel time
                const destinations = [
                  { name: "Rawtenstall", x: 1100, y: 930, color: "text-emerald-400" },
                  { name: "Blackburn", x: 320, y: 500, color: "text-blue-400" },
                  { name: "Accrington", x: 700, y: 400, color: "text-orange-400" },
                  { name: "Whalley", x: 650, y: 250, color: "text-purple-400" }
                ];

                const nearestDests = destinations
                  .map(dest => {
                    const distance = Math.sqrt((player.x - dest.x) ** 2 + (player.y - dest.y) ** 2);
                    // Scale: ~100 units = 1 mile, average speed 30mph in game
                    const miles = (distance / 100).toFixed(1);
                    const minutes = Math.round(distance / 50); // Approximate travel time
                    return { ...dest, distance, miles, minutes };
                  })
                  .sort((a, b) => a.distance - b.distance)
                  .slice(0, 2); // Show 2 nearest

                return nearestDests.map((dest, i) => (
                  <div key={i} className="flex items-center gap-1 text-xs col-span-2">
                    <span className="text-gray-400">📍</span>
                    <span className={dest.color}>{dest.name}</span>
                    <span className="text-gray-400 font-mono">{dest.miles}mi</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-400 font-mono">~{dest.minutes}min</span>
                  </div>
                ));
              })()}

              {missionTimer !== null && (
                <div className="flex items-center gap-1 col-span-5">
                  <Clock className="w-3 h-3 text-yellow-500" />
                  <span className={`font-mono font-bold ${missionTimer < 10 ? 'text-red-500 animate-pulse' : 'text-yellow-400'}`}>
                    MISSION TIMER: {Math.ceil(missionTimer)}s
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Mission & Info Panel */}
        <div className="flex-1 flex flex-col gap-2 overflow-hidden min-w-0">
          {/* Missions Panel */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-yellow-600 rounded-lg p-3 flex-1 overflow-hidden flex flex-col shadow-xl">
            <h2 className="text-xl font-bold text-yellow-400 mb-2 flex items-center border-b border-yellow-600 pb-2">
              <MapPin className="w-5 h-5 mr-2" />
              MISSIONS
            </h2>
            <div className="space-y-2 overflow-y-auto flex-1 pr-2 custom-scrollbar">
              {missions.map(mission => (
                <div
                  key={mission.id}
                  className={`p-2.5 rounded-lg border-2 transition-all ${
                    mission.completed
                      ? 'bg-gradient-to-r from-green-900 to-green-800 border-green-500'
                      : currentMission === mission.id
                      ? 'bg-gradient-to-r from-yellow-900 to-yellow-800 border-yellow-500 shadow-lg'
                      : 'bg-gradient-to-r from-gray-800 to-gray-700 border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <h3 className="font-bold text-white text-sm mb-1 flex items-center">
                    {mission.title}
                    {mission.completed && <span className="ml-auto text-green-400">✓ DONE</span>}
                  </h3>
                  <p className="text-xs text-gray-200 mb-2 leading-relaxed">{mission.description}</p>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-green-400 font-bold">💰 £{mission.reward}</span>
                    <span className="text-yellow-400 font-bold">⭐ +{mission.respectGain} Respect</span>
                  </div>
                  {!mission.completed && currentMission !== mission.id && (
                    <button
                      onClick={() => startMission(mission.id)}
                      className="mt-2 w-full bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white font-bold text-sm py-1.5 px-3 rounded shadow-md transition-all"
                    >
                      START MISSION
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Stats & Property - Side by Side */}
          <div className="flex gap-2">
            {/* Stats */}
            <div className="flex-1 bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-blue-600 rounded-lg p-2.5 shadow-xl">
              <h3 className="font-bold mb-2 text-blue-400 text-sm border-b border-blue-600 pb-1">📊 SKILLS</h3>
              <div className="text-xs space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-16 text-blue-300 font-semibold">Driving:</span>
                  <div className="flex-1 bg-gray-700 h-2 rounded border border-gray-600">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded" style={{ width: `${player.driving}%` }} />
                  </div>
                  <span className="w-8 text-right text-blue-300 font-mono">{player.driving}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-16 text-red-300 font-semibold">Shooting:</span>
                  <div className="flex-1 bg-gray-700 h-2 rounded border border-gray-600">
                    <div className="bg-gradient-to-r from-red-500 to-red-400 h-2 rounded" style={{ width: `${player.shooting}%` }} />
                  </div>
                  <span className="w-8 text-right text-red-300 font-mono">{player.shooting}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-16 text-green-300 font-semibold">Strength:</span>
                  <div className="flex-1 bg-gray-700 h-2 rounded border border-gray-600">
                    <div className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded" style={{ width: `${player.strength}%` }} />
                  </div>
                  <span className="w-8 text-right text-green-300 font-mono">{player.strength}</span>
                </div>
              </div>
            </div>

            {/* Property */}
            <div className="flex-1 bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-green-600 rounded-lg p-2.5 shadow-xl">
              <h3 className="font-bold mb-2 text-green-400 text-sm border-b border-green-600 pb-1">🏠 PROPERTY</h3>
              {ownedProperties.length === 0 ? (
                <p className="text-xs text-gray-300 italic">No properties owned</p>
              ) : (
                <ul className="text-xs space-y-1">
                  {ownedProperties.map(propId => {
                    const prop = properties.find(p => p.id === propId);
                    return prop ? (
                      <li key={propId} className="text-green-200">
                        • <span className="text-white font-semibold">{prop.name}</span>
                        <span className="text-green-400 font-mono"> +£{prop.income}/5s</span>
                      </li>
                    ) : null;
                  })}
                </ul>
              )}
            </div>

            {/* Controls */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-purple-600 rounded-lg p-2.5 shadow-xl">
              <h3 className="font-bold mb-2 text-purple-400 text-sm border-b border-purple-600 pb-1">🎮 CONTROLS</h3>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-gray-200">
                <div className="text-purple-300">• <span className="text-white font-semibold">WASD</span> - Drive</div>
                <div className="text-purple-300">• <span className="text-white font-semibold">F</span> - Shoot</div>
                <div className="text-purple-300">• <span className="text-white font-semibold">E</span> - Steal</div>
                <div className="text-purple-300">• <span className="text-white font-semibold">Q</span> - Weapon</div>
                <div className="text-purple-300">• <span className="text-white font-semibold">R</span> - Radio</div>
                <div className="text-purple-300">• <span className="text-white font-semibold">V</span> - View</div>
                <div className="text-purple-300">• <span className="text-white font-semibold">F5</span> - Save</div>
                <div className="text-purple-300">• <span className="text-white font-semibold">F9</span> - Load</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrandThefTAuto;