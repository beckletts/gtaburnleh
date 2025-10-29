import React, { useState, useEffect, useRef } from 'react';
import { Car, MapPin, Trophy, Heart, Star, Clock, Volume2, Key } from 'lucide-react';

const GrandThefTAuto = () => {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('menu');
  
  // World is now 2400x2400 (4x bigger!) but viewport is still 600x600
  const WORLD_WIDTH = 2400;
  const WORLD_HEIGHT = 2400;
  const VIEWPORT_WIDTH = 600;
  const VIEWPORT_HEIGHT = 600;
  
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
    x: 400 - VIEWPORT_WIDTH / 2,
    y: 300 - VIEWPORT_HEIGHT / 2
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
      for (let i = 0; i < 12; i++) {
        const vehicleType = i < 2 ? 'range_rover' : i < 4 ? 'van' : 'normal_car';
        initialNpcs.push({
          id: i,
          x: Math.random() * (WORLD_WIDTH - 400) + 200,
          y: Math.random() * (WORLD_HEIGHT - 400) + 200,
          angle: Math.random() * Math.PI * 2,
          speed: Math.random() * 1 + 0.5,
          vehicle: vehicleType,
          color: vehicleStats[vehicleType].color
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
      
      // Update NPC cars
      setNpcs(prev => prev.map(npc => {
        let newNpc = { ...npc };
        
        if (Math.random() < 0.02) {
          newNpc.angle += (Math.random() - 0.5) * 0.3;
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
      return {
        x: worldX - camera.x,
        y: worldY - camera.y
      };
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
    
    // Draw roads (long realistic streets)
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 48;
    ctx.beginPath();
    // Manchester Road - long horizontal through Burnley
    let screen = toScreen(100, 400);
    ctx.moveTo(screen.x, screen.y);
    screen = toScreen(700, 400);
    ctx.lineTo(screen.x, screen.y);
    // Continue across to middle
    screen = toScreen(1200, 1000);
    ctx.lineTo(screen.x, screen.y);
    // M65 motorway
    screen = toScreen(1200, 1000);
    ctx.moveTo(screen.x, screen.y);
    screen = toScreen(2000, 1400);
    ctx.lineTo(screen.x, screen.y);
    // Church Street vertical through Blackburn
    screen = toScreen(1700, 1200);
    ctx.moveTo(screen.x, screen.y);
    screen = toScreen(1700, 1800);
    ctx.lineTo(screen.x, screen.y);
    // More connecting roads
    screen = toScreen(400, 200);
    ctx.moveTo(screen.x, screen.y);
    screen = toScreen(400, 1000);
    ctx.lineTo(screen.x, screen.y);
    screen = toScreen(800, 400);
    ctx.moveTo(screen.x, screen.y);
    screen = toScreen(800, 2000);
    ctx.lineTo(screen.x, screen.y);
    ctx.stroke();
    
    // Road markings
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.setLineDash([20, 20]);
    ctx.beginPath();
    screen = toScreen(100, 400);
    ctx.moveTo(screen.x, screen.y);
    screen = toScreen(1200, 1000);
    ctx.lineTo(screen.x, screen.y);
    screen = toScreen(2000, 1400);
    ctx.lineTo(screen.x, screen.y);
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
        
        ctx.fillStyle = building.town === 'burnley' ? '#6c1c3f' :
                        building.town === 'blackburn' ? '#0051ba' :
                        building.town === 'whalley' ? '#f5deb3' : '#8b4513';
        ctx.fillRect(screen.x, screen.y, building.width, building.height);
        
        // Label
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px Arial';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.strokeText(building.name, screen.x, screen.y - 8);
        ctx.fillText(building.name, screen.x, screen.y - 8);
      }
    });
    
    // Environmental objects
    environmentObjects.forEach(obj => {
      if (!obj.destroyed) {
        screen = toScreen(obj.x, obj.y);
        
        if (screen.x > -50 && screen.x < VIEWPORT_WIDTH + 50 &&
            screen.y > -50 && screen.y < VIEWPORT_HEIGHT + 50) {
          
          if (obj.type === 'lamppost') {
            ctx.fillStyle = '#555';
            ctx.fillRect(screen.x - 2, screen.y - 15, 4, 15);
            ctx.fillStyle = '#ffeb3b';
            ctx.beginPath();
            ctx.arc(screen.x, screen.y - 15, 4, 0, Math.PI * 2);
            ctx.fill();
          } else if (obj.type === 'bin') {
            ctx.fillStyle = '#444';
            ctx.fillRect(screen.x - 4, screen.y - 6, 8, 10);
          } else if (obj.type === 'stall') {
            ctx.fillStyle = '#8b4513';
            ctx.fillRect(screen.x - 10, screen.y - 8, 20, 16);
            ctx.fillStyle = '#ff6347';
            ctx.fillRect(screen.x - 8, screen.y - 12, 16, 4);
          } else if (obj.type === 'phonebox') {
            ctx.fillStyle = '#cc0000';
            ctx.fillRect(screen.x - 4, screen.y - 10, 8, 10);
            ctx.fillStyle = '#fff';
            ctx.fillRect(screen.x - 2, screen.y - 8, 4, 6);
          }
        }
      }
    });
    
    // Pickups
    pickups.forEach(pickup => {
      screen = toScreen(pickup.x, pickup.y);
      if (screen.x > -50 && screen.x < VIEWPORT_WIDTH + 50 &&
          screen.y > -50 && screen.y < VIEWPORT_HEIGHT + 50) {
        ctx.save();
        ctx.translate(screen.x, screen.y);
        ctx.scale(Math.sin(gameTime * 0.1) * 0.2 + 1, Math.sin(gameTime * 0.1) * 0.2 + 1);
        ctx.font = '20px Arial';
        ctx.fillText(pickup.icon, -10, 10);
        ctx.restore();
      }
    });
    
    // Pedestrians
    pedestrians.forEach(ped => {
      screen = toScreen(ped.x, ped.y);
      if (screen.x > -50 && screen.x < VIEWPORT_WIDTH + 50 &&
          screen.y > -50 && screen.y < VIEWPORT_HEIGHT + 50) {
        ctx.fillStyle = ped.type === 'burnley' ? '#6c1c3f' : 
                         ped.type === 'blackburn' ? '#0051ba' : '#555';
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    
    // NPC cars
    npcs.forEach(npc => {
      screen = toScreen(npc.x, npc.y);
      if (screen.x > -50 && screen.x < VIEWPORT_WIDTH + 50 &&
          screen.y > -50 && screen.y < VIEWPORT_HEIGHT + 50) {
        ctx.save();
        ctx.translate(screen.x, screen.y);
        ctx.rotate(npc.angle);
        ctx.fillStyle = npc.color;
        ctx.fillRect(-12, -8, 24, 16);
        ctx.fillStyle = '#000';
        ctx.fillRect(-12, -7, 5, 3);
        ctx.fillRect(-12, 4, 5, 3);
        
        if (nearbyVehicle && nearbyVehicle.id === npc.id) {
          ctx.strokeStyle = '#00ff00';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, 20, 0, Math.PI * 2);
          ctx.stroke();
        }
        
        ctx.restore();
      }
    });
    
    // Police
    police.forEach(cop => {
      screen = toScreen(cop.x, cop.y);
      if (screen.x > -50 && screen.x < VIEWPORT_WIDTH + 50 &&
          screen.y > -50 && screen.y < VIEWPORT_HEIGHT + 50) {
        ctx.save();
        ctx.translate(screen.x, screen.y);
        ctx.rotate(cop.angle);
        ctx.fillStyle = '#fff';
        ctx.fillRect(-12, -8, 24, 16);
        ctx.fillStyle = '#0051ba';
        ctx.fillRect(-8, -6, 16, 3);
        ctx.fillRect(-8, 3, 16, 3);
        ctx.fillStyle = Math.sin(cop.sirenPhase) > 0 ? '#ff0000' : '#0000ff';
        ctx.fillRect(-3, -10, 6, 3);
        ctx.restore();
      }
    });
    
    // Chase target
    if (missionTarget && missionState === 'chase') {
      screen = toScreen(missionTarget.x, missionTarget.y);
      ctx.save();
      ctx.translate(screen.x, screen.y);
      ctx.rotate(missionTarget.angle);
      ctx.fillStyle = '#0051ba';
      ctx.fillRect(-12, -8, 24, 16);
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 25, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    
    // Race opponent
    if (raceOpponent) {
      screen = toScreen(raceOpponent.x, raceOpponent.y);
      ctx.save();
      ctx.translate(screen.x, screen.y);
      ctx.rotate(raceOpponent.angle);
      ctx.fillStyle = raceOpponent.color;
      ctx.fillRect(-12, -8, 24, 16);
      ctx.restore();
    }
    
    // Mission markers
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
    
    // Player car (always centered)
    const currentVehicle = vehicleStats[player.vehicle];
    screen = toScreen(player.x, player.y);
    ctx.save();
    ctx.translate(screen.x, screen.y);
    ctx.rotate(player.angle);
    
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(-18, -11, 36, 22);
    
    ctx.fillStyle = currentVehicle.color;
    ctx.fillRect(-16, -9, 32, 18);
    
    if (player.vehicle === 'boy_racer') {
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
    
    if (player.vehicle === 'boy_racer') {
      ctx.fillStyle = '#000';
      ctx.fillRect(-18, -6, 2, 12);
      ctx.fillRect(-20, -8, 4, 16);
    }
    
    ctx.fillStyle = '#333';
    ctx.fillRect(-18, 5, 3, 2);
    
    if (Math.abs(player.speed) > 4) {
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
    
    // Particles
    particles.forEach(p => {
      screen = toScreen(p.x, p.y);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life / 30;
      ctx.fillRect(screen.x - 2, screen.y - 2, 4, 4);
      ctx.globalAlpha = 1;
    });

    // Bullets
    bullets.forEach(bullet => {
      screen = toScreen(bullet.x, bullet.y);
      if (screen.x > -20 && screen.x < VIEWPORT_WIDTH + 20 &&
          screen.y > -20 && screen.y < VIEWPORT_HEIGHT + 20) {
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, 3, 0, Math.PI * 2);
        ctx.fill();
        // Bullet trail
        ctx.strokeStyle = 'rgba(255, 255, 0, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(screen.x, screen.y);
        const trailX = screen.x - Math.cos(bullet.angle) * 10;
        const trailY = screen.y - Math.sin(bullet.angle) * 10;
        ctx.lineTo(trailX, trailY);
        ctx.stroke();
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
      const miniX = 440;
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

    // Load game (F9)
    if (e.key === 'F9') {
      e.preventDefault();
      loadGame();
    }
  };

  const handleKeyUp = (e) => {
    setKeys(prev => ({ ...prev, [e.key]: false }));
  };

  useEffect(() => {
    if (gameState !== 'playing') return;
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, player.x, player.y, nearbyVehicle]);

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
    <div className="w-full min-h-screen bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-black bg-opacity-80 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-red-600">Grand Thef t'auto</h1>
            <div className="flex gap-4 items-center">
              <div className="text-white text-sm">
                <Car className="w-4 h-4 inline mr-1" />
                {currentVehicle.name}
              </div>
              {soundEffect && (
                <div className="text-yellow-500 animate-pulse">
                  <Volume2 className="w-6 h-6" />
                </div>
              )}
              {nearbyVehicle && (
                <div className="text-green-500 animate-pulse text-sm">
                  <Key className="w-4 h-4 inline mr-1" />
                  Press E!
                </div>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-white text-xs mt-2">
            <div className="flex items-center gap-2">
              <Heart className="w-3 h-3 text-red-500" />
              <div className="w-20 bg-gray-700 h-3 rounded">
                <div
                  className="bg-red-600 h-3 rounded transition-all"
                  style={{ width: `${player.health}%` }}
                />
              </div>
              <span>{player.health}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-400">🛡️</span>
              <div className="w-20 bg-gray-700 h-3 rounded">
                <div
                  className="bg-blue-500 h-3 rounded transition-all"
                  style={{ width: `${player.armor}%` }}
                />
              </div>
              <span>{player.armor}</span>
            </div>
            <div className="flex items-center gap-2">
              <Car className="w-3 h-3 text-blue-500" />
              <span>{Math.abs(player.speed).toFixed(1)} mph</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">£</span>
              <span>£{player.money.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-3 h-3 text-yellow-500" />
              <span>Respect: {player.respect}</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-3 h-3 text-red-500" />
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-2 h-2"
                  fill={i < player.wantedLevel ? '#ef4444' : 'none'}
                  color="#ef4444"
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-yellow-500">🔫</span>
              <span>{weaponStats[player.weapon].name}</span>
              {weaponStats[player.weapon].ammoType && (
                <span className="text-gray-400">({player.ammo[weaponStats[player.weapon].ammoType]})</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3 text-blue-400" />
              <span>{String(timeOfDay).padStart(2, '0')}:00 {timeOfDay < 6 || timeOfDay > 20 ? '🌙' : timeOfDay < 12 ? '🌅' : timeOfDay < 18 ? '☀️' : '🌆'}</span>
            </div>
            <div className="flex items-center gap-2 col-span-2">
              <span className="text-purple-400">📻</span>
              <span className="truncate">{radioStations[radioStation].name}</span>
            </div>
            {missionTimer !== null && (
              <div className="flex items-center gap-2 col-span-2">
                <Clock className="w-3 h-3 text-yellow-500" />
                <span className={missionTimer < 10 ? 'text-red-500 animate-pulse font-bold' : ''}>
                  Timer: {Math.ceil(missionTimer)}s
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <canvas
              ref={canvasRef}
              width={VIEWPORT_WIDTH}
              height={VIEWPORT_HEIGHT}
              className="border-4 border-red-700 rounded-lg bg-green-900"
            />
            
            {missionProgress && (
              <div className="mt-4 bg-black bg-opacity-90 p-4 rounded-lg text-white border-2 border-yellow-500">
                <p className="text-sm font-bold">{missionProgress}</p>
              </div>
            )}
            
            {currentMission && missionState && (
              <div className="mt-2 bg-black bg-opacity-80 p-3 rounded-lg text-white">
                <div className="text-xs">
                  <span className="text-yellow-500 font-bold">ACTIVE:</span>
                  <span className="ml-2">{missions.find(m => m.id === currentMission)?.title}</span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-black bg-opacity-80 p-4 rounded-lg max-h-96 overflow-y-auto">
              <h2 className="text-xl font-bold text-yellow-500 mb-3">
                <MapPin className="w-5 h-5 inline mr-2" />
                MISSIONS
              </h2>
              <div className="space-y-2">
                {missions.map(mission => (
                  <div
                    key={mission.id}
                    className={`p-3 rounded border-2 ${
                      mission.completed 
                        ? 'bg-green-900 border-green-600' 
                        : currentMission === mission.id
                        ? 'bg-yellow-900 border-yellow-600'
                        : 'bg-gray-800 border-gray-600'
                    }`}
                  >
                    <h3 className="font-bold text-white text-sm mb-1">
                      {mission.title} {mission.completed && '✓'}
                    </h3>
                    <p className="text-xs text-gray-300 mb-2">{mission.description}</p>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>£{mission.reward}</span>
                      <span>+{mission.respectGain}</span>
                    </div>
                    {!mission.completed && currentMission !== mission.id && (
                      <button
                        onClick={() => startMission(mission.id)}
                        className="mt-2 w-full bg-red-700 hover:bg-red-800 text-white text-xs py-1 px-2 rounded"
                      >
                        Start
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-black bg-opacity-80 p-4 rounded-lg text-white">
              <h3 className="font-bold mb-2 text-yellow-500">📊 STATS:</h3>
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span>Driving:</span>
                  <div className="w-24 bg-gray-700 h-2 rounded mt-1">
                    <div className="bg-blue-500 h-2 rounded" style={{ width: `${player.driving}%` }} />
                  </div>
                </div>
                <div className="flex justify-between">
                  <span>Shooting:</span>
                  <div className="w-24 bg-gray-700 h-2 rounded mt-1">
                    <div className="bg-red-500 h-2 rounded" style={{ width: `${player.shooting}%` }} />
                  </div>
                </div>
                <div className="flex justify-between">
                  <span>Strength:</span>
                  <div className="w-24 bg-gray-700 h-2 rounded mt-1">
                    <div className="bg-green-500 h-2 rounded" style={{ width: `${player.strength}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-black bg-opacity-80 p-4 rounded-lg text-white">
              <h3 className="font-bold mb-2 text-green-500">🏠 PROPERTY:</h3>
              {ownedProperties.length === 0 ? (
                <p className="text-xs text-gray-400">No properties owned</p>
              ) : (
                <ul className="text-xs space-y-1">
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

            <div className="bg-black bg-opacity-80 p-4 rounded-lg text-white">
              <h3 className="font-bold mb-2 text-purple-500">🎮 CONTROLS:</h3>
              <ul className="text-xs space-y-1 text-gray-300">
                <li>• WASD - Drive</li>
                <li>• E - Steal car</li>
                <li>• F - Shoot/Attack</li>
                <li>• Q - Switch weapon</li>
                <li>• R - Change radio</li>
                <li>• B - Buy property</li>
                <li>• F5 - Save game</li>
                <li>• F9 - Load game</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-4 bg-black bg-opacity-80 p-3 rounded-lg text-center text-gray-400 text-xs">
          <p>🎮 Full GTA Experience: Weapons • Combat • Properties • Territories • Day/Night • Skills • Save/Load</p>
        </div>
      </div>
    </div>
  );
};

export default GrandThefTAuto;