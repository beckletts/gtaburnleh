import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Car, MapPin, Trophy, Heart, Star, Clock, Volume2, Key } from 'lucide-react';

const GrandThefTAuto = () => {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('menu');
  const [isometricView, setIsometricView] = useState(true); // Toggle for isometric vs orthographic
  
  // World is now 2400x2400 (4x bigger!) with larger viewport
  const WORLD_WIDTH = 2400;
  const WORLD_HEIGHT = 2400;
  const VIEWPORT_WIDTH = 1000;
  const VIEWPORT_HEIGHT = 700;

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

    // Draw vehicle based on type
    if (vehicleType === 'boy_racer') {
      // Sports car - sleek design
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(-9, -5.5, 18, 11);

      ctx.fillStyle = color;
      ctx.fillRect(-8, -5, 16, 10);

      // White racing stripe
      ctx.fillStyle = '#fff';
      ctx.fillRect(-8, -0.5, 16, 1);

      // Windscreen
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(4, -3.5, 3, 7);

      // Headlights
      ctx.fillStyle = '#ffff00';
      ctx.fillRect(7, -3.5, 1, 1.5);
      ctx.fillRect(7, 2, 1, 1.5);

      // Taillights
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(-8, -3.5, 1, 1.5);
      ctx.fillRect(-8, 2, 1, 1.5);

      // Wheels
      ctx.fillStyle = '#000';
      ctx.fillRect(-6, -5.5, 3, 2);
      ctx.fillRect(-6, 3.5, 3, 2);
      ctx.fillRect(3, -5.5, 3, 2);
      ctx.fillRect(3, 3.5, 3, 2);

      // Spoiler
      ctx.fillStyle = '#000';
      ctx.fillRect(-9, -3, 1, 6);
      ctx.fillRect(-10, -4, 2, 8);

    } else if (vehicleType === 'police') {
      // Police car
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(-9, -5.5, 18, 11);

      ctx.fillStyle = '#fff';
      ctx.fillRect(-8, -5, 16, 10);

      // Blue stripe
      ctx.fillStyle = '#0051ba';
      ctx.fillRect(-4, -3, 8, 1.5);
      ctx.fillRect(-4, 1.5, 8, 1.5);

      // Siren
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(-1.5, -5, 3, 1.5);

      // Windscreen
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(4, -3.5, 3, 7);

      // Wheels
      ctx.fillStyle = '#000';
      ctx.fillRect(-6, -5.5, 3, 2);
      ctx.fillRect(-6, 3.5, 3, 2);
      ctx.fillRect(3, -5.5, 3, 2);
      ctx.fillRect(3, 3.5, 3, 2);

    } else if (vehicleType === 'van') {
      // Van - boxy design
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(-10, -6, 20, 12);

      ctx.fillStyle = color;
      ctx.fillRect(-9, -5.5, 18, 11);

      // Windows
      ctx.fillStyle = '#4a4a4a';
      ctx.fillRect(4, -4, 4, 3);
      ctx.fillRect(4, 1, 4, 3);
      ctx.fillRect(-3, -4, 6, 3);
      ctx.fillRect(-3, 1, 6, 3);

      // Wheels
      ctx.fillStyle = '#000';
      ctx.fillRect(-7, -6, 4, 2.5);
      ctx.fillRect(-7, 3.5, 4, 2.5);
      ctx.fillRect(4, -6, 4, 2.5);
      ctx.fillRect(4, 3.5, 4, 2.5);

    } else if (vehicleType === 'range_rover') {
      // SUV - tall and boxy
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(-9, -6, 18, 12);

      ctx.fillStyle = color;
      ctx.fillRect(-8, -5.5, 16, 11);

      // Chrome details
      ctx.fillStyle = '#c0c0c0';
      ctx.fillRect(-8, -5.5, 16, 1);
      ctx.fillRect(-8, 4.5, 16, 1);

      // Windscreen
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(3, -4, 4, 8);

      // Wheels (bigger)
      ctx.fillStyle = '#000';
      ctx.fillRect(-6, -6.5, 4, 3);
      ctx.fillRect(-6, 3.5, 4, 3);
      ctx.fillRect(3, -6.5, 4, 3);
      ctx.fillRect(3, 3.5, 4, 3);

    } else {
      // Normal car - generic sedan
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(-9, -5.5, 18, 11);

      ctx.fillStyle = color;
      ctx.fillRect(-8, -5, 16, 10);

      // Windscreen
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(4, -3.5, 3, 7);

      // Headlights
      ctx.fillStyle = '#ffff00';
      ctx.fillRect(7, -3.5, 1, 1.5);
      ctx.fillRect(7, 2, 1, 1.5);

      // Taillights
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(-8, -3.5, 1, 1.5);
      ctx.fillRect(-8, 2, 1, 1.5);

      // Wheels
      ctx.fillStyle = '#000';
      ctx.fillRect(-6, -5.5, 3, 2);
      ctx.fillRect(-6, 3.5, 3, 2);
      ctx.fillRect(3, -5.5, 3, 2);
      ctx.fillRect(3, 3.5, 3, 2);
    }

    return canvas;
  };

  // Generate pedestrian sprite
  const generatePedSprite = (color, direction) => {
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');

    ctx.imageSmoothingEnabled = false;
    ctx.translate(8, 8);
    ctx.rotate(direction);

    // Body
    ctx.fillStyle = color;
    ctx.fillRect(-2, -3, 4, 6);

    // Head
    ctx.fillStyle = '#ffdbac';
    ctx.fillRect(-1.5, -5, 3, 2);

    // Legs
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(-2, 3, 1.5, 3);
    ctx.fillRect(0.5, 3, 1.5, 3);

    // Arms (animated based on direction)
    const armOffset = Math.sin(direction * 4) * 0.5;
    ctx.fillRect(-3, -1 + armOffset, 1, 3);
    ctx.fillRect(2, -1 - armOffset, 1, 3);

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

  // Draw isometric building with textures and details
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
    x: 400,
    y: 300,
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

  // Road network waypoints for NPC pathfinding
  const roadRoutes = {
    m65_motorway: [
      { x: 50, y: 1000 }, { x: 200, y: 950 }, { x: 400, y: 920 },
      { x: 650, y: 880 }, { x: 900, y: 950 }, { x: 1150, y: 1050 },
      { x: 1400, y: 1180 }, { x: 1650, y: 1320 }, { x: 1900, y: 1420 }, { x: 2150, y: 1480 }
    ],
    a646_scenic: [
      { x: 300, y: 300 }, { x: 400, y: 450 }, { x: 550, y: 700 },
      { x: 650, y: 1000 }, { x: 750, y: 1300 }, { x: 850, y: 1550 }, { x: 945, y: 1752 }
    ],
    a679_route: [
      { x: 1330, y: 760 }, { x: 1400, y: 920 }, { x: 1500, y: 1100 },
      { x: 1620, y: 1280 }, { x: 1740, y: 1425 }
    ],
    a56_burnley: [
      { x: 100, y: 200 }, { x: 250, y: 260 }, { x: 380, y: 280 },
      { x: 520, y: 310 }, { x: 680, y: 380 }, { x: 850, y: 480 }
    ],
    burnley_streets: [
      { x: 200, y: 200 }, { x: 200, y: 300 }, { x: 300, y: 300 },
      { x: 400, y: 300 }, { x: 400, y: 200 }, { x: 300, y: 200 }, { x: 200, y: 200 }
    ],
    blackburn_streets: [
      { x: 1600, y: 1400 }, { x: 1600, y: 1500 }, { x: 1750, y: 1500 },
      { x: 1750, y: 1650 }, { x: 1900, y: 1650 }, { x: 1900, y: 1500 }, { x: 1600, y: 1500 }
    ],
    b6235_shortcut: [
      { x: 450, y: 600 }, { x: 500, y: 750 }, { x: 530, y: 940 }, { x: 580, y: 1120 }
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
  const [inCombat, setInCombat] = useState(false);
  const [combatTarget, setCombatTarget] = useState(null);

  // Expanded building collision boxes - proper scale
  const buildings = [
    // BURNLEY AREA (left side of map, around 200-600 x, 200-600 y)
    { x: 150, y: 200, width: 120, height: 120, name: "Turf Moor", town: "burnley" },
    { x: 350, y: 240, width: 100, height: 90, name: "Charter Walk Centre", town: "burnley" },
    { x: 360, y: 180, width: 70, height: 50, name: "St James Street", town: "burnley" },
    { x: 320, y: 360, width: 60, height: 50, name: "Burnley Market Hall", town: "burnley" },
    { x: 256, y: 260, width: 60, height: 50, name: "The Turf Pub", town: "burnley" },
    { x: 480, y: 240, width: 70, height: 60, name: "Weavers Triangle", town: "burnley" },
    { x: 180, y: 280, width: 50, height: 40, name: "Burnley Central Stn", town: "burnley" },
    { x: 280, y: 180, width: 50, height: 40, name: "Mechanics Theatre", town: "burnley" },
    
    // BLACKBURN AREA (right side of map, around 1800-2200 x, 1600-2000 y)
    { x: 1880, y: 1680, width: 120, height: 120, name: "Ewood Park", town: "blackburn" },
    { x: 1712, y: 1520, width: 90, height: 90, name: "Blackburn Cathedral", town: "blackburn" },
    { x: 1640, y: 1400, width: 90, height: 50, name: "King William Street", town: "blackburn" },
    { x: 1880, y: 1400, width: 90, height: 60, name: "The Mall Blackburn", town: "blackburn" },
    { x: 1700, y: 1240, width: 70, height: 50, name: "King George's Hall", town: "blackburn" },
    { x: 1860, y: 1540, width: 60, height: 50, name: "Blackburn Museum", town: "blackburn" },
    { x: 2080, y: 1560, width: 50, height: 50, name: "Cathedral Square", town: "blackburn" },
    { x: 1580, y: 1540, width: 50, height: 50, name: "Church Street", town: "blackburn" },
    
    // MIDDLE AREAS
    { x: 1128, y: 912, width: 60, height: 50, name: "King Street Kebabs", town: "neutral" },
    { x: 1280, y: 1140, width: 100, height: 50, name: "M65 Services", town: "neutral" },
    { x: 1400, y: 880, width: 100, height: 80, name: "Holland's Pies", town: "accrington" },
    { x: 1280, y: 720, width: 100, height: 80, name: "Accrington Stanley", town: "accrington" },
    { x: 480, y: 900, width: 100, height: 80, name: "Padiham Mill", town: "padiham" },
    { x: 1920, y: 2080, width: 30, height: 100, name: "Darwen Tower", town: "darwen" },
    { x: 900, y: 1712, width: 90, height: 80, name: "Whalley Village", town: "whalley" }
  ];

  const missions = [
    {
      id: 1,
      title: "The Baxenden Pie Heist",
      description: "Drive across to Holland's Pie factory and nick a pie! Long drive ahead.",
      pickupLocation: { x: 1450, y: 920 },
      deliverLocation: { x: 290, y: 285 },
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
      deliverLocation: { x: 290, y: 285 },
      reward: 300,
      respectGain: 15,
      type: 'fragile_delivery',
      cargoHealth: 100,
      completed: false
    },
    {
      id: 3,
      title: "Cross-Town Kebab Run",
      description: "Get kebabs from King Street and deliver to Turf Moor. It's a proper drive!",
      pickupLocation: { x: 1158, y: 937 },
      deliverLocation: { x: 210, y: 260 },
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
        { x: 520, y: 270 },
        { x: 480, y: 360 },
        { x: 400, y: 400 }
      ],
      reward: 450,
      respectGain: 12,
      type: 'multi_checkpoint',
      completed: false
    },
    {
      id: 6,
      title: "The M65 Race",
      description: "Race from Whalley to Blackburn along the M65! Beat the Range Rover!",
      startLocation: { x: 945, y: 1752 },
      finishLocation: { x: 1740, y: 1425 },
      reward: 1000,
      respectGain: 30,
      type: 'race',
      completed: false
    },
    {
      id: 7,
      title: "Cathedral Quarter Heist",
      description: "Steal from posh restaurant near Blackburn Cathedral. Instant heat!",
      pickupLocation: { x: 1757, y: 1565 },
      deliverLocation: { x: 600, y: 900 },
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
    // Burnley
    { name: "Turf Moor", x: 210, y: 260, type: "burnley" },
    { name: "Charter Walk", x: 400, y: 285, type: "burnley" },
    { name: "St James St", x: 395, y: 205, type: "burnley" },
    { name: "The Turf Pub", x: 290, y: 285, type: "burnley" },
    { name: "Weavers Triangle", x: 520, y: 270, type: "burnley" },
    
    // Blackburn
    { name: "Ewood Park", x: 1940, y: 1740, type: "blackburn" },
    { name: "Cathedral", x: 1757, y: 1565, type: "blackburn" },
    { name: "The Mall", x: 1925, y: 1430, type: "blackburn" },
    { name: "King William St", x: 1685, y: 1425, type: "blackburn" },
    { name: "Corporation Park", x: 2180, y: 1760, type: "blackburn" },
    
    // Other
    { name: "King Street", x: 1200, y: 1000, type: "neutral" },
    { name: "M65 Services", x: 1330, y: 1165, type: "neutral" },
    { name: "Baxenden", x: 1450, y: 920, type: "accrington" },
    { name: "Accrington", x: 1330, y: 760, type: "accrington" },
    { name: "Padiham", x: 530, y: 940, type: "burnley" },
    { name: "Darwen Tower", x: 1935, y: 2130, type: "blackburn" },
    { name: "Whalley", x: 945, y: 1752, type: "posh" }
  ];

  // Radio stations
  const radioStations = [
    { name: "BBC Radio Lancashire", songs: ["Local news...", "Traffic update...", "Weather: Raining"] },
    { name: "Claret FM", songs: ["UTC! UTC!", "Burnley anthems", "No surrender!"] },
    { name: "Rovers Radio", songs: ["Blue & White Army", "Ewood Park chants"] },
    { name: "Northern Soul FM", songs: ["Keep the Faith", "Wigan Casino classics"] },
    { name: "OFF", songs: [] }
  ];

  // Territory definitions
  const territoryData = [
    { id: 1, x: 200, y: 250, width: 400, height: 350, gang: 'burnley', name: 'Burnley Town' },
    { id: 2, x: 1600, y: 1400, width: 500, height: 500, gang: 'blackburn', name: 'Blackburn' },
    { id: 3, x: 1200, y: 700, width: 300, height: 250, gang: 'neutral', name: 'Accrington' },
    { id: 4, x: 400, y: 850, width: 250, height: 200, gang: 'neutral', name: 'Padiham' },
    { id: 5, x: 800, y: 1650, width: 300, height: 200, gang: 'neutral', name: 'Whalley' }
  ];

  // Properties you can buy
  const propertyData = [
    { id: 1, name: "The Turf Pub", x: 290, y: 285, cost: 50000, income: 500, type: 'pub' },
    { id: 2, name: "Holland's Pies", x: 1450, y: 920, cost: 100000, income: 1000, type: 'business' },
    { id: 3, name: "King Street Kebabs", x: 1158, y: 937, cost: 30000, income: 300, type: 'business' },
    { id: 4, name: "Padiham Safe House", x: 530, y: 940, cost: 75000, income: 0, type: 'safehouse' },
    { id: 5, name: "Charter Walk Lockup", x: 400, y: 285, cost: 25000, income: 0, type: 'garage' },
    { id: 6, name: "Whalley Abbey", x: 945, y: 1752, cost: 200000, income: 2000, type: 'luxury' }
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

  // Add particle effect
  const addParticles = (x, y, type, count = 5) => {
    const newParticles = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: Date.now() + i + Math.random(),
        x,
        y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 30,
        type,
        color: type === 'crash' ? '#ff6600' : 
               type === 'money' ? '#ffd700' : 
               type === 'wood' ? '#8b4513' : '#fff'
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  };

  // Sound effect
  const playSound = (sound) => {
    setSoundEffect(sound);
    setTimeout(() => setSoundEffect(null), 500);
  };

  // Main game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = setInterval(() => {
      setGameTime(prev => prev + 1);

      // Time of day progression (1 minute = 1 hour)
      if (gameTime % 60 === 0) {
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
        } else if (keys['ArrowDown'] || keys['s']) {
          newPlayer.speed = Math.max(newPlayer.speed - (currentVehicle.acceleration * 1.5), -currentVehicle.maxSpeed * 0.5);
        } else {
          newPlayer.speed *= 0.95;
        }
        
        // Handle steering with vehicle stats
        if (Math.abs(newPlayer.speed) > 0.5) {
          const turnSpeed = currentVehicle.handling * Math.min(Math.abs(newPlayer.speed), 3);
          if (keys['ArrowLeft'] || keys['a']) {
            newPlayer.angle -= turnSpeed;
          }
          if (keys['ArrowRight'] || keys['d']) {
            newPlayer.angle += turnSpeed;
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
              addParticles(newPlayer.x, newPlayer.y, 'crash', 5);
              playSound('crash');
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
      
      // Update police
      if (player.wantedLevel > 0) {
        setPolice(prev => {
          let cops = [...prev];
          
          const maxCops = Math.min(player.wantedLevel, 3);
          if (cops.length < maxCops && Math.random() < 0.01) {
            cops.push({
              id: Date.now(),
              x: player.x + (Math.random() - 0.5) * 500,
              y: player.y + (Math.random() - 0.5) * 500,
              angle: 0,
              speed: 2,
              sirenPhase: 0
            });
          }
          
          cops = cops.map(cop => {
            const targetAngle = Math.atan2(player.y - cop.y, player.x - cop.x);
            cop.angle += (targetAngle - cop.angle) * 0.03;
            
            cop.x += Math.cos(cop.angle) * cop.speed;
            cop.y += Math.sin(cop.angle) * cop.speed;
            cop.sirenPhase = (cop.sirenPhase + 0.1) % (Math.PI * 2);
            
            const dist = getDistance(player.x, player.y, cop.x, cop.y);
            if (dist < 20 && Math.random() < 0.02) {
              setPlayer(p => ({ ...p, health: Math.max(0, p.health - 0.5) }));
            }
            
            return cop;
          });
          
          return cops;
        });
      } else {
        setPolice([]);
      }
      
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
      
      // Update particles
      setParticles(prev =>
        prev.map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          life: p.life - 1,
          vy: p.vy + 0.1
        })).filter(p => p.life > 0)
      );

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
              addParticles(npc.x, npc.y, 'crash', 8);
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
  }, [gameState, keys, player, currentMission, missionState, missionTimer, npcs, pedestrians, police, pickups, gameTime, missionTarget, raceOpponent, checkpointsVisited, environmentObjects, bullets, properties, ownedProperties, timeOfDay]);

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

    // Helper function to convert world coords to screen coords
    const toScreen = (worldX, worldY) => {
      if (isometricView) {
        // Apply isometric transformation
        const iso = worldToIso(worldX, worldY);
        const cameraIso = worldToIso(camera.x, camera.y);
        return {
          x: iso.x - cameraIso.x + VIEWPORT_WIDTH / 2,
          y: iso.y - cameraIso.y + VIEWPORT_HEIGHT / 3
        };
      } else {
        // Orthographic (original view)
        return {
          x: worldX - camera.x,
          y: worldY - camera.y
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
    
    // === REALISTIC GTA-STYLE ROAD NETWORK ===

    // M65 MOTORWAY (Main Highway) - Dark, wide, winding
    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 56;
    ctx.beginPath();
    let s = toScreen(50, 1000);
    ctx.moveTo(s.x, s.y);
    s = toScreen(200, 950);
    ctx.lineTo(s.x, s.y);
    s = toScreen(400, 920);
    let cp1 = toScreen(300, 930);
    ctx.quadraticCurveTo(cp1.x, cp1.y, s.x, s.y);
    s = toScreen(650, 880);
    cp1 = toScreen(520, 900);
    ctx.quadraticCurveTo(cp1.x, cp1.y, s.x, s.y);
    s = toScreen(900, 950);
    cp1 = toScreen(780, 910);
    ctx.quadraticCurveTo(cp1.x, cp1.y, s.x, s.y);
    s = toScreen(1150, 1050);
    cp1 = toScreen(1020, 1000);
    ctx.quadraticCurveTo(cp1.x, cp1.y, s.x, s.y);
    s = toScreen(1400, 1180);
    cp1 = toScreen(1270, 1110);
    ctx.quadraticCurveTo(cp1.x, cp1.y, s.x, s.y);
    s = toScreen(1650, 1320);
    cp1 = toScreen(1520, 1250);
    ctx.quadraticCurveTo(cp1.x, cp1.y, s.x, s.y);
    s = toScreen(1900, 1420);
    cp1 = toScreen(1780, 1370);
    ctx.quadraticCurveTo(cp1.x, cp1.y, s.x, s.y);
    s = toScreen(2150, 1480);
    ctx.lineTo(s.x, s.y);
    ctx.stroke();

    // A-ROADS (Major connecting roads) - Medium width, winding
    ctx.strokeStyle = '#383838';
    ctx.lineWidth = 42;

    // A646 - Burnley to Whalley (scenic route)
    ctx.beginPath();
    s = toScreen(300, 300);
    ctx.moveTo(s.x, s.y);
    s = toScreen(400, 450);
    cp1 = toScreen(330, 380);
    ctx.quadraticCurveTo(cp1.x, cp1.y, s.x, s.y);
    s = toScreen(550, 700);
    cp1 = toScreen(460, 570);
    ctx.quadraticCurveTo(cp1.x, cp1.y, s.x, s.y);
    s = toScreen(650, 1000);
    cp1 = toScreen(580, 850);
    ctx.quadraticCurveTo(cp1.x, cp1.y, s.x, s.y);
    s = toScreen(750, 1300);
    cp1 = toScreen(680, 1150);
    ctx.quadraticCurveTo(cp1.x, cp1.y, s.x, s.y);
    s = toScreen(850, 1550);
    cp1 = toScreen(780, 1420);
    ctx.quadraticCurveTo(cp1.x, cp1.y, s.x, s.y);
    s = toScreen(945, 1752);
    ctx.lineTo(s.x, s.y);
    ctx.stroke();

    // A679 - Accrington to Blackburn
    ctx.beginPath();
    s = toScreen(1330, 760);
    ctx.moveTo(s.x, s.y);
    s = toScreen(1400, 920);
    cp1 = toScreen(1350, 840);
    ctx.quadraticCurveTo(cp1.x, cp1.y, s.x, s.y);
    s = toScreen(1500, 1100);
    cp1 = toScreen(1440, 1010);
    ctx.quadraticCurveTo(cp1.x, cp1.y, s.x, s.y);
    s = toScreen(1620, 1280);
    cp1 = toScreen(1550, 1190);
    ctx.quadraticCurveTo(cp1.x, cp1.y, s.x, s.y);
    s = toScreen(1740, 1425);
    ctx.lineTo(s.x, s.y);
    ctx.stroke();

    // A56 - Through Burnley (alternative route)
    ctx.beginPath();
    s = toScreen(100, 200);
    ctx.moveTo(s.x, s.y);
    s = toScreen(250, 260);
    ctx.lineTo(s.x, s.y);
    s = toScreen(380, 280);
    cp1 = toScreen(320, 270);
    ctx.quadraticCurveTo(cp1.x, cp1.y, s.x, s.y);
    s = toScreen(520, 310);
    ctx.lineTo(s.x, s.y);
    s = toScreen(680, 380);
    cp1 = toScreen(600, 340);
    ctx.quadraticCurveTo(cp1.x, cp1.y, s.x, s.y);
    s = toScreen(850, 480);
    cp1 = toScreen(760, 420);
    ctx.quadraticCurveTo(cp1.x, cp1.y, s.x, s.y);
    ctx.stroke();

    // B-ROADS (Shortcuts and scenic routes) - Narrower, more winding
    ctx.strokeStyle = '#424242';
    ctx.lineWidth = 34;

    // B6235 - Padiham back road
    ctx.beginPath();
    s = toScreen(450, 600);
    ctx.moveTo(s.x, s.y);
    s = toScreen(500, 750);
    cp1 = toScreen(460, 680);
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

    // LOCAL STREETS (Town areas) - Narrow
    ctx.strokeStyle = '#484848';
    ctx.lineWidth = 28;

    // Burnley town grid
    ctx.beginPath();
    s = toScreen(200, 200);
    ctx.moveTo(s.x, s.y);
    s = toScreen(200, 450);
    ctx.lineTo(s.x, s.y);
    ctx.stroke();

    ctx.beginPath();
    s = toScreen(400, 200);
    ctx.moveTo(s.x, s.y);
    s = toScreen(400, 500);
    ctx.lineTo(s.x, s.y);
    ctx.stroke();

    ctx.beginPath();
    s = toScreen(150, 300);
    ctx.moveTo(s.x, s.y);
    s = toScreen(550, 300);
    ctx.lineTo(s.x, s.y);
    ctx.stroke();

    ctx.beginPath();
    s = toScreen(180, 400);
    ctx.moveTo(s.x, s.y);
    s = toScreen(500, 420);
    cp1 = toScreen(340, 410);
    ctx.quadraticCurveTo(cp1.x, cp1.y, s.x, s.y);
    ctx.stroke();

    // Blackburn town grid
    ctx.beginPath();
    s = toScreen(1600, 1400);
    ctx.moveTo(s.x, s.y);
    s = toScreen(1600, 1700);
    ctx.lineTo(s.x, s.y);
    ctx.stroke();

    ctx.beginPath();
    s = toScreen(1750, 1350);
    ctx.moveTo(s.x, s.y);
    s = toScreen(1750, 1650);
    ctx.lineTo(s.x, s.y);
    ctx.stroke();

    ctx.beginPath();
    s = toScreen(1900, 1400);
    ctx.moveTo(s.x, s.y);
    s = toScreen(1900, 1800);
    ctx.lineTo(s.x, s.y);
    ctx.stroke();

    ctx.beginPath();
    s = toScreen(1580, 1500);
    ctx.moveTo(s.x, s.y);
    s = toScreen(2000, 1500);
    ctx.lineTo(s.x, s.y);
    ctx.stroke();

    ctx.beginPath();
    s = toScreen(1650, 1650);
    ctx.moveTo(s.x, s.y);
    s = toScreen(1950, 1650);
    ctx.lineTo(s.x, s.y);
    ctx.stroke();

    // DARWEN TOWER scenic road (winding mountain road)
    ctx.lineWidth = 30;
    ctx.beginPath();
    s = toScreen(1800, 1800);
    ctx.moveTo(s.x, s.y);
    s = toScreen(1830, 1920);
    cp1 = toScreen(1810, 1860);
    ctx.quadraticCurveTo(cp1.x, cp1.y, s.x, s.y);
    s = toScreen(1880, 2040);
    cp1 = toScreen(1850, 1970);
    ctx.quadraticCurveTo(cp1.x, cp1.y, s.x, s.y);
    s = toScreen(1935, 2130);
    cp1 = toScreen(1900, 2080);
    ctx.quadraticCurveTo(cp1.x, cp1.y, s.x, s.y);
    ctx.stroke();

    // ROAD MARKINGS (Center lines on main roads)
    ctx.strokeStyle = '#ffeb3b';
    ctx.lineWidth = 3;
    ctx.setLineDash([25, 15]);

    // M65 markings
    ctx.beginPath();
    s = toScreen(50, 1000);
    ctx.moveTo(s.x, s.y);
    s = toScreen(400, 920);
    cp1 = toScreen(250, 960);
    ctx.quadraticCurveTo(cp1.x, cp1.y, s.x, s.y);
    s = toScreen(900, 950);
    cp1 = toScreen(650, 880);
    ctx.quadraticCurveTo(cp1.x, cp1.y, s.x, s.y);
    s = toScreen(1400, 1180);
    cp1 = toScreen(1150, 1050);
    ctx.quadraticCurveTo(cp1.x, cp1.y, s.x, s.y);
    s = toScreen(1900, 1420);
    cp1 = toScreen(1650, 1300);
    ctx.quadraticCurveTo(cp1.x, cp1.y, s.x, s.y);
    ctx.stroke();

    ctx.setLineDash([]);
    
    // Leeds-Liverpool Canal
    ctx.strokeStyle = '#4682b4';
    ctx.lineWidth = 16;
    ctx.beginPath();
    screen = toScreen(120, 800);
    ctx.moveTo(screen.x, screen.y);
    screen = toScreen(600, 700);
    ctx.quadraticCurveTo(screen.x - 100, screen.y, screen.x, screen.y);
    screen = toScreen(1200, 800);
    ctx.lineTo(screen.x, screen.y);
    ctx.stroke();
    
    // Corporation Park
    screen = toScreen(2040, 1600);
    ctx.fillStyle = '#2d8b3d';
    ctx.fillRect(screen.x, screen.y, 280, 320);
    
    // Trees in park
    for (let i = 0; i < 20; i++) {
      screen = toScreen(2080 + (i % 5) * 50, 1640 + Math.floor(i / 5) * 70);
      ctx.fillStyle = '#4a5d23';
      ctx.beginPath();
      ctx.arc(screen.x, screen.y, 16, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Buildings
    buildings.forEach(building => {
      screen = toScreen(building.x, building.y);

      // Only draw if on screen
      if (screen.x + building.width > 0 && screen.x < VIEWPORT_WIDTH &&
          screen.y + building.height > 0 && screen.y < VIEWPORT_HEIGHT) {

        // Use improved isometric building renderer
        drawIsometricBuilding(ctx, screen.x, screen.y, building, isNight);
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
          if (spritesLoaded && sprites.police) {
            const dirIndex = getDirectionIndex(data.angle);
            const sprite = sprites.police[dirIndex];

            if (sprite) {
              ctx.drawImage(sprite, screen.x - 16, screen.y - 16, 32, 32);

              // Animated siren light
              ctx.fillStyle = Math.sin(data.sirenPhase) > 0 ? '#ff0000' : '#0000ff';
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
            }
          } else {
            // Fallback rendering
            const currentVehicle = vehicleStats[data.vehicle];
            ctx.save();
            ctx.translate(screen.x, screen.y);
            ctx.rotate(data.angle);

            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.fillRect(-18, -11, 36, 22);

            ctx.fillStyle = currentVehicle.color;
            ctx.fillRect(-16, -9, 32, 18);

            if (data.vehicle === 'boy_racer') {
              ctx.fillStyle = '#fff';
              ctx.fillRect(-16, -1, 32, 2);
            }

            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(8, -7, 6, 14);

            ctx.fillStyle = '#ffff00';
            ctx.fillRect(14, -7, 2, 3);
            ctx.fillRect(14, 4, 2, 3);

            ctx.fillStyle = '#ff0000';
            ctx.fillRect(-16, -7, 2, 3);
            ctx.fillRect(-16, 4, 2, 3);

            ctx.fillStyle = '#000';
            ctx.fillRect(-12, -11, 6, 4);
            ctx.fillRect(-12, 7, 6, 4);
            ctx.fillRect(6, -11, 6, 4);
            ctx.fillRect(6, 7, 6, 4);

            ctx.fillStyle = '#c0c0c0';
            ctx.fillRect(-11, -10, 4, 2);
            ctx.fillRect(-11, 8, 4, 2);
            ctx.fillRect(7, -10, 4, 2);
            ctx.fillRect(7, 8, 4, 2);

            if (data.vehicle === 'boy_racer') {
              ctx.fillStyle = '#000';
              ctx.fillRect(-18, -6, 2, 12);
              ctx.fillRect(-20, -8, 4, 16);
            }

            ctx.fillStyle = '#333';
            ctx.fillRect(-18, 5, 3, 2);

            if (Math.abs(data.speed) > 4) {
              ctx.fillStyle = '#ff4500';
              ctx.beginPath();
              ctx.moveTo(0, -8);
              ctx.lineTo(-8, -5);
              ctx.lineTo(-5, -2);
              ctx.lineTo(-10, 0);
              ctx.lineTo(-5, 2);
              ctx.lineTo(-8, 5);
              ctx.lineTo(0, 8);
              ctx.fill();
            }

            ctx.restore();
          }
          break;
      }
    });

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

      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.globalAlpha = alpha * 0.5;
      ctx.fillRect(screen.x - 1, screen.y + 1, 4, 4);

      // Glow effect for certain particles
      if (p.color === '#ffd700' || p.color === '#ffeb3b') {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha * 0.3;
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, 6, 0, Math.PI * 2);
        ctx.fill();
      }

      // Main particle
      ctx.fillStyle = p.color;
      ctx.globalAlpha = alpha;
      const size = Math.max(2, 4 * (p.life / 30)); // Shrinks as it fades
      ctx.fillRect(screen.x - size/2, screen.y - size/2, size, size);

      // Highlight pixel for sparkle effect
      ctx.fillStyle = '#fff';
      ctx.globalAlpha = alpha * 0.7;
      ctx.fillRect(screen.x - 1, screen.y - 1, 1, 1);

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
                         loc.type === 'blackburn' ? '#0051ba' : '#888';
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

  }, [player, gameState, currentMission, missionState, npcs, pedestrians, police, pickups, particles, gameTime, showMiniMap, missionTarget, raceOpponent, checkpointsVisited, environmentObjects, nearbyVehicle, camera, bullets, properties, territories, timeOfDay]);

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

          // Create bullet
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
          // Melee attack
          npcs.forEach(npc => {
            const dist = getDistance(player.x, player.y, npc.x, npc.y);
            if (dist < weapon.range) {
              setNpcs(prev => prev.filter(n => n.id !== npc.id));
              addParticles(npc.x, npc.y, 'crash', 5);
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

    // Toggle isometric view (V)
    if (e.key === 'v' || e.key === 'V') {
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
      <div className="w-full h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center p-8 bg-black bg-opacity-70 rounded-lg max-w-2xl">
          <h1 className="text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-900">
            GRAND THEF T'AUTO
          </h1>
          <h2 className="text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-900">
            BURNLEY EDITION
          </h2>
          <p className="text-xl text-gray-300 mb-6 italic">
            "Full GTA Experience in East Lancashire!"
          </p>
          <div className="text-left text-gray-300 mb-6 space-y-1">
            <p className="text-base font-bold text-yellow-500">⚡ NEW FEATURES:</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <p>🔫 Weapons & Combat</p>
              <p>🏠 Property Ownership</p>
              <p>📊 Character Stats & Skills</p>
              <p>🏴 Territory Control</p>
              <p>🌅 Day/Night Cycle</p>
              <p>📻 Radio Stations</p>
              <p>💾 Save/Load Game</p>
              <p>💰 Passive Income</p>
            </div>

            <p className="text-base font-bold text-yellow-500 mt-3">🎮 CONTROLS:</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0 text-xs">
              <p>• WASD - Drive</p>
              <p>• F - Shoot/Attack</p>
              <p>• E - Steal car</p>
              <p>• Q - Switch weapon</p>
              <p>• SPACE - Horn</p>
              <p>• R - Change radio</p>
              <p>• B - Buy property</p>
              <p>• F5/F9 - Save/Load</p>
            </div>
          </div>
          <button
            onClick={startGame}
            className="bg-red-700 hover:bg-red-800 text-white font-bold py-4 px-8 rounded-lg text-xl transition-all transform hover:scale-105"
          >
            START GAME
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
                <p className="text-xs text-gray-400">No properties owned</p>
              ) : (
                <ul className="text-xs space-y-0.5">
                  {ownedProperties.map(propId => {
                    const prop = properties.find(p => p.id === propId);
                    return prop ? (
                      <li key={propId} className="text-gray-300">
                        • {prop.name} (+£{prop.income}/5s)
                      </li>
                    ) : null;
                  })}
                </ul>
              )}
            </div>

            <div className="bg-black bg-opacity-90 p-2 rounded-lg text-white">
              <h3 className="font-bold mb-1 text-purple-500 text-sm">🎮 CONTROLS</h3>
              <div className="grid grid-cols-2 gap-x-2 gap-y-0 text-xs text-gray-300">
                <div>• WASD - Drive</div>
                <div>• F - Shoot</div>
                <div>• E - Steal car</div>
                <div>• Q - Weapon</div>
                <div>• R - Radio</div>
                <div>• B - Buy</div>
                <div>• F5 - Save</div>
                <div>• F9 - Load</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrandThefTAuto;