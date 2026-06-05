// CS2 Map Tactical Blueprint Layouts
// Fully responsive vector-based maps with dark grid style, glowing rooms, and animated tactical routes.

export function getMapBlueprintSVG(mapId) {
  const blueprints = {
    Ancient: `
      <svg viewBox="0 0 400 280" class="tactical-blueprint-svg">
        <defs>
          <pattern id="blueprint-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(0, 255, 204, 0.04)" stroke-width="1"/>
          </pattern>
          <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="glow-orange" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        <!-- Grid Background -->
        <rect width="100%" height="100%" fill="url(#blueprint-grid)" />
        <rect width="100%" height="100%" fill="none" stroke="var(--color-green-glow)" stroke-width="2" />

        <!-- Title -->
        <text x="15" y="25" class="blueprint-title">MAP: ANCIENT (远古遗迹)</text>
        <text x="15" y="40" class="blueprint-subtitle">Scale: 1:1250 | Elevation: Ground Level</text>

        <!-- CT Spawn (Top) -->
        <g transform="translate(200, 50)">
          <circle r="12" class="blueprint-point ct" />
          <text y="4" class="blueprint-point-text">CT</text>
          <text y="24" class="blueprint-label">CT Base</text>
        </g>

        <!-- T Spawn (Bottom) -->
        <g transform="translate(200, 230)">
          <circle r="12" class="blueprint-point t" />
          <text y="4" class="blueprint-point-text">T</text>
          <text y="24" class="blueprint-label">T Base</text>
        </g>

        <!-- Bombsite A (Left) -->
        <g transform="translate(80, 130)">
          <circle r="16" class="blueprint-bombsite" filter="url(#glow-orange)" />
          <text y="5" class="blueprint-bombsite-text">A</text>
          <text y="28" class="blueprint-label highlighted">A Site</text>
        </g>

        <!-- Bombsite B (Right) -->
        <g transform="translate(320, 130)">
          <circle r="16" class="blueprint-bombsite" filter="url(#glow-orange)" />
          <text y="5" class="blueprint-bombsite-text">B</text>
          <text y="28" class="blueprint-label highlighted">B Site</text>
        </g>

        <!-- Walls & Lanes (Tactical layout) -->
        <!-- CT paths to sites -->
        <path d="M 200,50 L 140,70 L 80,114" class="blueprint-wall" />
        <path d="M 200,50 L 260,70 L 320,114" class="blueprint-wall" />
        <path d="M 200,50 L 200,100" class="blueprint-wall" /> <!-- Mid CT -->

        <!-- T paths to sites -->
        <path d="M 200,230 L 120,210 L 80,146" class="blueprint-wall" />
        <path d="M 200,230 L 280,210 L 320,146" class="blueprint-wall" />
        <path d="M 200,230 L 200,180" class="blueprint-wall" stroke-dasharray="4" /> <!-- T Mid -->

        <!-- Mid Area -->
        <rect x="170" y="110" width="60" height="60" class="blueprint-room" />
        <text x="200" y="144" class="blueprint-room-text">MID</text>
        <path d="M 170,140 L 80,130" class="blueprint-wall" /> <!-- Mid to A Link (Donut) -->
        <path d="M 230,140 L 320,130" class="blueprint-wall" /> <!-- Mid to B Link (Cave) -->

        <!-- Tactical labels -->
        <text x="110" y="90" class="blueprint-callout">Donut (甜甜圈)</text>
        <text x="290" y="90" class="blueprint-callout">Cave (主坑)</text>
        <text x="200" y="195" class="blueprint-callout">Red Room (红房)</text>

        <!-- Animated Attack Vectors -->
        <path d="M 200,230 Q 110,220 80,146" class="blueprint-vector vector-a" />
        <path d="M 200,230 Q 290,220 320,146" class="blueprint-vector vector-b" />
        <path d="M 200,230 L 200,170" class="blueprint-vector vector-mid" />
      </svg>
    `,
    Dust2: `
      <svg viewBox="0 0 400 280" class="tactical-blueprint-svg">
        <defs>
          <pattern id="blueprint-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(0, 255, 204, 0.04)" stroke-width="1"/>
          </pattern>
          <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <rect width="100%" height="100%" fill="url(#blueprint-grid)" />
        <rect width="100%" height="100%" fill="none" stroke="var(--color-green-glow)" stroke-width="2" />
        <text x="15" y="25" class="blueprint-title">MAP: DUST2 (炙热沙城2)</text>
        <text x="15" y="40" class="blueprint-subtitle">Scale: 1:1100 | Desert Tactics</text>

        <!-- Spawns -->
        <g transform="translate(300, 110)"> <!-- CT Spawn -->
          <circle r="12" class="blueprint-point ct" />
          <text y="4" class="blueprint-point-text">CT</text>
          <text y="24" class="blueprint-label">CT Spawn</text>
        </g>
        <g transform="translate(200, 235)"> <!-- T Spawn -->
          <circle r="12" class="blueprint-point t" />
          <text y="4" class="blueprint-point-text">T</text>
          <text y="24" class="blueprint-label">T Spawn</text>
        </g>

        <!-- Bombsites -->
        <g transform="translate(320, 50)"> <!-- A Site -->
          <circle r="16" class="blueprint-bombsite" />
          <text y="5" class="blueprint-bombsite-text">A</text>
          <text y="28" class="blueprint-label highlighted">A Site</text>
        </g>
        <g transform="translate(80, 50)"> <!-- B Site -->
          <circle r="16" class="blueprint-bombsite" />
          <text y="5" class="blueprint-bombsite-text">B</text>
          <text y="28" class="blueprint-label highlighted">B Site</text>
        </g>

        <!-- Dust2 corridors -->
        <path d="M 200,235 L 200,160" class="blueprint-wall" /> <!-- T Spawn to Mid -->
        <path d="M 200,160 L 300,110" class="blueprint-wall" /> <!-- Mid to CT -->
        <path d="M 300,110 L 320,50" class="blueprint-wall" /> <!-- CT to A -->
        
        <!-- Long A Path -->
        <path d="M 200,235 L 360,235 L 360,110 L 320,50" class="blueprint-wall" /> <!-- Long A -->
        <text x="360" y="170" class="blueprint-callout" transform="rotate(-90 360 170)">LONG A (A大)</text>

        <!-- Short A Path -->
        <path d="M 200,160 L 270,160 L 270,75 L 320,50" class="blueprint-wall" /> <!-- Short A -->
        <text x="250" y="80" class="blueprint-callout">Catwalk (小道)</text>

        <!-- B Tunnels -->
        <path d="M 200,235 L 80,235 L 80,140 L 80,50" class="blueprint-wall" /> <!-- Lower / Upper Tunnels -->
        <text x="65" y="180" class="blueprint-callout" transform="rotate(-90 65 180)">B TUNNELS (B洞)</text>

        <!-- Mid Doors -->
        <rect x="185" y="130" width="30" height="15" class="blueprint-room" />
        <text x="200" y="141" class="blueprint-room-text">DOORS</text>

        <!-- Vectors -->
        <path d="M 200,235 L 360,235 L 360,110 L 320,50" class="blueprint-vector vector-a" />
        <path d="M 200,235 L 80,235 L 80,50" class="blueprint-vector vector-b" />
        <path d="M 200,235 L 200,160 L 270,160 L 270,75 L 320,50" class="blueprint-vector vector-mid" />
      </svg>
    `,
    Inferno: `
      <svg viewBox="0 0 400 280" class="tactical-blueprint-svg">
        <defs>
          <pattern id="blueprint-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(0, 255, 204, 0.04)" stroke-width="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#blueprint-grid)" />
        <rect width="100%" height="100%" fill="none" stroke="var(--color-green-glow)" stroke-width="2" />
        <text x="15" y="25" class="blueprint-title">MAP: INFERNO (炼狱小镇)</text>
        <text x="15" y="40" class="blueprint-subtitle">Scale: 1:1200 | Banana Control Focus</text>

        <!-- Spawns -->
        <g transform="translate(340, 220)"> <!-- CT Spawn -->
          <circle r="12" class="blueprint-point ct" />
          <text y="4" class="blueprint-point-text">CT</text>
          <text y="24" class="blueprint-label">CT Spawn</text>
        </g>
        <g transform="translate(60, 220)"> <!-- T Spawn -->
          <circle r="12" class="blueprint-point t" />
          <text y="4" class="blueprint-point-text">T</text>
          <text y="24" class="blueprint-label">T Spawn</text>
        </g>

        <!-- Bombsites -->
        <g transform="translate(280, 70)"> <!-- A Site -->
          <circle r="16" class="blueprint-bombsite" />
          <text y="5" class="blueprint-bombsite-text">A</text>
          <text y="28" class="blueprint-label highlighted">A Site</text>
        </g>
        <g transform="translate(120, 70)"> <!-- B Site -->
          <circle r="16" class="blueprint-bombsite" />
          <text y="5" class="blueprint-bombsite-text">B</text>
          <text y="28" class="blueprint-label highlighted">B Site</text>
        </g>

        <!-- Inferno Layout -->
        <path d="M 60,220 L 150,220" class="blueprint-wall" /> <!-- T Spawn to Mid -->
        <path d="M 150,220 L 150,110 L 280,70" class="blueprint-wall" /> <!-- Mid to A -->
        
        <!-- Banana -->
        <path d="M 150,220 L 120,180 L 120,70" class="blueprint-wall" stroke-width="4" />
        <text x="100" y="150" class="blueprint-callout" transform="rotate(-75 100 150)">BANANA (香蕉道)</text>

        <!-- Apartments -->
        <path d="M 60,220 L 60,110 L 220,110 L 280,70" class="blueprint-wall" />
        <text x="130" y="95" class="blueprint-callout">Apartments (二楼)</text>

        <path d="M 340,220 L 340,110 L 280,70" class="blueprint-wall" /> <!-- CT to A -->
        <path d="M 340,220 L 220,220 L 180,180 L 120,70" class="blueprint-wall" stroke-dasharray="3" /> <!-- CT to B -->

        <!-- Vectors -->
        <path d="M 60,220 Q 150,220 120,70" class="blueprint-vector vector-b" />
        <path d="M 60,220 L 150,220 L 150,110 L 280,70" class="blueprint-vector vector-mid" />
        <path d="M 60,220 L 60,110 L 220,110 L 280,70" class="blueprint-vector vector-a" />
      </svg>
    `,
    Mirage: `
      <svg viewBox="0 0 400 280" class="tactical-blueprint-svg">
        <defs>
          <pattern id="blueprint-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(0, 255, 204, 0.04)" stroke-width="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#blueprint-grid)" />
        <rect width="100%" height="100%" fill="none" stroke="var(--color-green-glow)" stroke-width="2" />
        <text x="15" y="25" class="blueprint-title">MAP: MIRAGE (荒漠迷城)</text>
        <text x="15" y="40" class="blueprint-subtitle">Scale: 1:1150 | A-Ramp & Mid Control</text>

        <!-- Spawns -->
        <g transform="translate(320, 180)"> <!-- CT Spawn -->
          <circle r="12" class="blueprint-point ct" />
          <text y="4" class="blueprint-point-text">CT</text>
          <text y="24" class="blueprint-label">CT Spawn</text>
        </g>
        <g transform="translate(80, 230)"> <!-- T Spawn -->
          <circle r="12" class="blueprint-point t" />
          <text y="4" class="blueprint-point-text">T</text>
          <text y="24" class="blueprint-label">T Spawn</text>
        </g>

        <!-- Bombsites -->
        <g transform="translate(320, 70)"> <!-- A Site -->
          <circle r="16" class="blueprint-bombsite" />
          <text y="5" class="blueprint-bombsite-text">A</text>
          <text y="28" class="blueprint-label highlighted">A Site</text>
        </g>
        <g transform="translate(180, 60)"> <!-- B Site -->
          <circle r="16" class="blueprint-bombsite" />
          <text y="5" class="blueprint-bombsite-text">B</text>
          <text y="28" class="blueprint-label highlighted">B Site</text>
        </g>

        <!-- Layout lanes -->
        <path d="M 80,230 L 220,230 L 220,130" class="blueprint-wall" /> <!-- T Spawn to Mid -->
        
        <!-- Connector & Window -->
        <rect x="205" y="100" width="30" height="30" class="blueprint-room" />
        <text x="220" y="117" class="blueprint-room-text">MID</text>
        <path d="M 220,130 L 320,70" class="blueprint-wall" /> <!-- Connector to A -->
        
        <!-- B Palace / Apartments -->
        <path d="M 80,230 L 80,120 L 180,60" class="blueprint-wall" />
        <text x="80" y="85" class="blueprint-callout">Apps (二楼)</text>

        <!-- A Ramp / Palace -->
        <path d="M 80,230 L 320,180 M 320,180 L 320,70" class="blueprint-wall" /> <!-- A Slope -->
        <text x="260" y="150" class="blueprint-callout">A Ramp (A坡)</text>

        <!-- Vectors -->
        <path d="M 80,230 Q 250,220 320,70" class="blueprint-vector vector-a" />
        <path d="M 80,230 L 80,120 L 180,60" class="blueprint-vector vector-b" />
        <path d="M 80,230 L 220,230 L 220,130 L 320,70" class="blueprint-vector vector-mid" />
      </svg>
    `,
    Nuke: `
      <svg viewBox="0 0 400 280" class="tactical-blueprint-svg">
        <defs>
          <pattern id="blueprint-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(0, 255, 204, 0.04)" stroke-width="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#blueprint-grid)" />
        <rect width="100%" height="100%" fill="none" stroke="var(--color-green-glow)" stroke-width="2" />
        <text x="15" y="25" class="blueprint-title">MAP: NUKE (核子危机)</text>
        <text x="15" y="40" class="blueprint-subtitle">Scale: 1:1300 | Multi-level Verticals</text>

        <!-- Spawns -->
        <g transform="translate(340, 130)"> <!-- CT Spawn -->
          <circle r="12" class="blueprint-point ct" />
          <text y="4" class="blueprint-point-text">CT</text>
          <text y="24" class="blueprint-label">CT Spawn</text>
        </g>
        <g transform="translate(60, 130)"> <!-- T Spawn -->
          <circle r="12" class="blueprint-point t" />
          <text y="4" class="blueprint-point-text">T</text>
          <text y="24" class="blueprint-label">T Spawn</text>
        </g>

        <!-- Upper Bombsite A -->
        <g transform="translate(200, 100)">
          <circle r="15" class="blueprint-bombsite" />
          <text y="5" class="blueprint-bombsite-text">A</text>
          <text y="-20" class="blueprint-label highlighted">A (Upper)</text>
        </g>

        <!-- Lower Bombsite B (Dashed layer) -->
        <g transform="translate(200, 180)">
          <circle r="15" class="blueprint-bombsite" stroke-dasharray="3" style="stroke: #ff9900" />
          <text y="5" class="blueprint-bombsite-text" style="fill: #ff9900">B</text>
          <text y="26" class="blueprint-label" style="color: #ff9900">B (Lower)</text>
        </g>

        <!-- Nuke Layout Rooms -->
        <rect x="150" y="80" width="100" height="130" class="blueprint-room" />
        <text x="200" y="150" class="blueprint-room-text">REACTOR</text>

        <!-- Outer Yard path -->
        <path d="M 60,130 L 150,240 L 340,240 L 340,130" class="blueprint-wall" stroke-width="3" />
        <text x="250" y="255" class="blueprint-callout">YARD (外场)</text>

        <!-- Lobby & Ramp -->
        <path d="M 60,130 L 120,80 L 150,80" class="blueprint-wall" />
        <path d="M 150,210 L 120,210 L 120,130" class="blueprint-wall" />
        <text x="100" y="65" class="blueprint-callout">Lobby (大厅)</text>
        <text x="100" y="225" class="blueprint-callout">Ramp (斜坡)</text>

        <!-- Vectors -->
        <path d="M 60,130 L 120,80 L 200,100" class="blueprint-vector vector-a" />
        <path d="M 60,130 L 150,240 L 340,240 L 200,180" class="blueprint-vector vector-b" />
        <path d="M 60,130 L 120,210 L 200,180" class="blueprint-vector vector-mid" />
      </svg>
    `,
    Anubis: `
      <svg viewBox="0 0 400 280" class="tactical-blueprint-svg">
        <defs>
          <pattern id="blueprint-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(0, 255, 204, 0.04)" stroke-width="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#blueprint-grid)" />
        <rect width="100%" height="100%" fill="none" stroke="var(--color-green-glow)" stroke-width="2" />
        <text x="15" y="25" class="blueprint-title">MAP: ANUBIS (阿努比斯)</text>
        <text x="15" y="40" class="blueprint-subtitle">Scale: 1:1200 | Water Control & Fast Rotates</text>

        <!-- Spawns -->
        <g transform="translate(200, 40)"> <!-- CT Spawn -->
          <circle r="12" class="blueprint-point ct" />
          <text y="4" class="blueprint-point-text">CT</text>
          <text y="24" class="blueprint-label">CT Spawn</text>
        </g>
        <g transform="translate(200, 240)"> <!-- T Spawn -->
          <circle r="12" class="blueprint-point t" />
          <text y="4" class="blueprint-point-text">T</text>
          <text y="24" class="blueprint-label">T Spawn</text>
        </g>

        <!-- Bombsites -->
        <g transform="translate(320, 130)"> <!-- A Site -->
          <circle r="16" class="blueprint-bombsite" />
          <text y="5" class="blueprint-bombsite-text">A</text>
          <text y="28" class="blueprint-label highlighted">A Site</text>
        </g>
        <g transform="translate(80, 130)"> <!-- B Site -->
          <circle r="16" class="blueprint-bombsite" />
          <text y="5" class="blueprint-bombsite-text">B</text>
          <text y="28" class="blueprint-label highlighted">B Site</text>
        </g>

        <!-- Layout paths -->
        <path d="M 200,240 Q 110,210 80,130" class="blueprint-wall" /> <!-- T to B (Canal/Main) -->
        <path d="M 200,240 Q 290,210 320,130" class="blueprint-wall" /> <!-- T to A (Ramp) -->
        <path d="M 200,40 Q 110,70 80,130" class="blueprint-wall" /> <!-- CT to B -->
        <path d="M 200,40 Q 290,70 320,130" class="blueprint-wall" /> <!-- CT to A -->

        <!-- Mid & Water canal -->
        <path d="M 200,240 L 200,40" class="blueprint-wall" stroke-dasharray="5" /> <!-- Mid river -->
        <rect x="175" y="115" width="50" height="40" class="blueprint-room" />
        <text x="200" y="139" class="blueprint-room-text">MID</text>
        <text x="240" y="180" class="blueprint-callout">Water (水下)</text>

        <!-- Vectors -->
        <path d="M 200,240 Q 90,200 80,130" class="blueprint-vector vector-b" />
        <path d="M 200,240 Q 310,200 320,130" class="blueprint-vector vector-a" />
        <path d="M 200,240 L 200,155" class="blueprint-vector vector-mid" />
      </svg>
    `,
    Overpass: `
      <svg viewBox="0 0 400 280" class="tactical-blueprint-svg">
        <defs>
          <pattern id="blueprint-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(0, 255, 204, 0.04)" stroke-width="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#blueprint-grid)" />
        <rect width="100%" height="100%" fill="none" stroke="var(--color-green-glow)" stroke-width="2" />
        <text x="15" y="25" class="blueprint-title">MAP: OVERPASS (死亡游乐园)</text>
        <text x="15" y="40" class="blueprint-subtitle">Scale: 1:1250 | Bathrooms & Playground</text>

        <!-- Spawns -->
        <g transform="translate(200, 60)"> <!-- CT Spawn (Middle Upper) -->
          <circle r="12" class="blueprint-point ct" />
          <text y="4" class="blueprint-point-text">CT</text>
          <text y="24" class="blueprint-label">CT Spawn</text>
        </g>
        <g transform="translate(200, 240)"> <!-- T Spawn (Bottom) -->
          <circle r="12" class="blueprint-point t" />
          <text y="4" class="blueprint-point-text">T</text>
          <text y="24" class="blueprint-label">T Spawn</text>
        </g>

        <!-- Bombsites -->
        <g transform="translate(100, 110)"> <!-- A Site (Upper Left) -->
          <circle r="16" class="blueprint-bombsite" />
          <text y="5" class="blueprint-bombsite-text">A</text>
          <text y="28" class="blueprint-label highlighted">A Site</text>
        </g>
        <g transform="translate(100, 190)"> <!-- B Site (Lower Left) -->
          <circle r="16" class="blueprint-bombsite" />
          <text y="5" class="blueprint-bombsite-text">B</text>
          <text y="28" class="blueprint-label highlighted">B Site</text>
        </g>

        <!-- Layout -->
        <path d="M 200,240 L 320,240 L 320,130 L 200,60" class="blueprint-wall" /> <!-- T Spawn to Playground / Toilet -->
        <text x="320" y="180" class="blueprint-callout" transform="rotate(-90 320 180)">PLAYGROUND (游乐场)</text>

        <path d="M 200,240 L 100,190" class="blueprint-wall" /> <!-- T Spawn to B Site direct (Monster) -->
        <text x="140" y="220" class="blueprint-callout">Monster (工地/长廊)</text>

        <path d="M 200,60 L 100,110" class="blueprint-wall" /> <!-- CT to A -->
        <path d="M 200,60 L 100,190" class="blueprint-wall" stroke-dasharray="3" /> <!-- CT to B -->

        <!-- Bathrooms / Mid Link -->
        <rect x="180" y="120" width="50" height="30" class="blueprint-room" />
        <text x="205" y="138" class="blueprint-room-text">TOILETS</text>

        <!-- Vectors -->
        <path d="M 200,240 L 320,240 L 320,130 L 100,110" class="blueprint-vector vector-a" />
        <path d="M 200,240 L 100,190" class="blueprint-vector vector-b" />
        <path d="M 200,240 L 200,150 L 100,110" class="blueprint-vector vector-mid" />
      </svg>
    `,
    Vertigo: `
      <svg viewBox="0 0 400 280" class="tactical-blueprint-svg">
        <defs>
          <pattern id="blueprint-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(0, 255, 204, 0.04)" stroke-width="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#blueprint-grid)" />
        <rect width="100%" height="100%" fill="none" stroke="var(--color-green-glow)" stroke-width="2" />
        <text x="15" y="25" class="blueprint-title">MAP: VERTIGO (殒命大厦)</text>
        <text x="15" y="40" class="blueprint-subtitle">Scale: 1:1200 | Floor 51st Tactical Layout</text>

        <!-- Spawns -->
        <g transform="translate(200, 160)"> <!-- CT Spawn (Middle Center) -->
          <circle r="12" class="blueprint-point ct" />
          <text y="4" class="blueprint-point-text">CT</text>
          <text y="24" class="blueprint-label">CT Spawn</text>
        </g>
        <g transform="translate(200, 240)"> <!-- T Spawn (Bottom) -->
          <circle r="12" class="blueprint-point t" />
          <text y="4" class="blueprint-point-text">T</text>
          <text y="24" class="blueprint-label">T Spawn</text>
        </g>

        <!-- Bombsites -->
        <g transform="translate(80, 70)"> <!-- A Site (Top Left) -->
          <circle r="16" class="blueprint-bombsite" />
          <text y="5" class="blueprint-bombsite-text">A</text>
          <text y="28" class="blueprint-label highlighted">A Site (A坡)</text>
        </g>
        <g transform="translate(320, 70)"> <!-- B Site (Top Right) -->
          <circle r="16" class="blueprint-bombsite" />
          <text y="5" class="blueprint-bombsite-text">B</text>
          <text y="28" class="blueprint-label highlighted">B Site (B楼梯)</text>
        </g>

        <!-- Vertigo Layout -->
        <path d="M 200,240 L 80,240 L 80,70" class="blueprint-wall" /> <!-- T to A Ramp -->
        <path d="M 200,240 L 320,240 L 320,70" class="blueprint-wall" /> <!-- T to B Stairs -->
        
        <!-- Mid Elevator Area -->
        <rect x="175" y="80" width="50" height="40" class="blueprint-room" />
        <text x="200" y="104" class="blueprint-room-text">ELEVATOR</text>
        
        <path d="M 200,160 L 200,120" class="blueprint-wall" /> <!-- CT to Mid -->
        <path d="M 200,160 L 80,70" class="blueprint-wall" stroke-dasharray="3" /> <!-- CT to A -->
        <path d="M 200,160 L 320,70" class="blueprint-wall" stroke-dasharray="3" /> <!-- CT to B -->

        <!-- Vectors -->
        <path d="M 200,240 L 80,240 L 80,70" class="blueprint-vector vector-a" />
        <path d="M 200,240 L 320,240 L 320,70" class="blueprint-vector vector-b" />
        <path d="M 200,240 L 200,120" class="blueprint-vector vector-mid" />
      </svg>
    `,
    Train: `
      <svg viewBox="0 0 400 280" class="tactical-blueprint-svg">
        <defs>
          <pattern id="blueprint-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(0, 255, 204, 0.04)" stroke-width="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#blueprint-grid)" />
        <rect width="100%" height="100%" fill="none" stroke="var(--color-green-glow)" stroke-width="2" />
        <text x="15" y="25" class="blueprint-title">MAP: TRAIN (列车停放站)</text>
        <text x="15" y="40" class="blueprint-subtitle">Scale: 1:1300 | Train Tracks & Sniper Lines</text>

        <!-- Spawns -->
        <g transform="translate(340, 130)"> <!-- CT Spawn (Right) -->
          <circle r="12" class="blueprint-point ct" />
          <text y="4" class="blueprint-point-text">CT</text>
          <text y="24" class="blueprint-label">CT Spawn</text>
        </g>
        <g transform="translate(60, 130)"> <!-- T Spawn (Left) -->
          <circle r="12" class="blueprint-point t" />
          <text y="4" class="blueprint-point-text">T</text>
          <text y="24" class="blueprint-label">T Spawn</text>
        </g>

        <!-- Bombsites -->
        <g transform="translate(220, 80)"> <!-- A Site (Main Yard Upper) -->
          <circle r="16" class="blueprint-bombsite" />
          <text y="5" class="blueprint-bombsite-text">A</text>
          <text y="28" class="blueprint-label highlighted">A Site (电工室侧)</text>
        </g>
        <g transform="translate(220, 190)"> <!-- B Site (Lower Yard B) -->
          <circle r="16" class="blueprint-bombsite" />
          <text y="5" class="blueprint-bombsite-text">B</text>
          <text y="28" class="blueprint-label highlighted">B Site (红楼侧)</text>
        </g>

        <!-- Train Rails (Abstract) -->
        <line x1="150" y1="60" x2="310" y2="60" class="blueprint-wall" stroke-width="4" stroke-dasharray="8 4" />
        <line x1="150" y1="100" x2="310" y2="100" class="blueprint-wall" stroke-width="4" stroke-dasharray="8 4" />
        <line x1="150" y1="170" x2="310" y2="170" class="blueprint-wall" stroke-width="4" stroke-dasharray="8 4" />
        <line x1="150" y1="210" x2="310" y2="210" class="blueprint-wall" stroke-width="4" stroke-dasharray="8 4" />

        <text x="180" y="45" class="blueprint-callout">Tracks (轨道区)</text>

        <!-- Corridor paths -->
        <path d="M 60,130 L 150,60" class="blueprint-wall" /> <!-- Ivy path -->
        <path d="M 60,130 L 150,210" class="blueprint-wall" /> <!-- B Ramp path -->
        <path d="M 340,130 L 310,60" class="blueprint-wall" /> <!-- CT A exit -->
        <path d="M 340,130 L 310,210" class="blueprint-wall" /> <!-- CT B exit -->

        <!-- Z Connector -->
        <rect x="250" y="120" width="20" height="40" class="blueprint-room" />
        <text x="260" y="144" class="blueprint-room-text">Z</text>

        <!-- Vectors -->
        <path d="M 60,130 L 150,60 L 220,80" class="blueprint-vector vector-a" />
        <path d="M 60,130 L 150,210 L 220,190" class="blueprint-vector vector-b" />
        <path d="M 60,130 L 150,130 L 250,140 L 220,190" class="blueprint-vector vector-mid" />
      </svg>
    `
  };

  if (!mapId) {
    return `
      <svg viewBox="0 0 400 280" class="tactical-blueprint-svg">
        <rect width="100%" height="100%" fill="none" stroke="var(--color-green-glow)" stroke-width="2" />
        <text x="200" y="140" text-anchor="middle" class="blueprint-title">暂无地图平面图数据</text>
      </svg>
    `;
  }
  
  const key = Object.keys(blueprints).find(k => k.toLowerCase() === mapId.toLowerCase());
  return blueprints[key] || `
    <svg viewBox="0 0 400 280" class="tactical-blueprint-svg">
      <rect width="100%" height="100%" fill="none" stroke="var(--color-green-glow)" stroke-width="2" />
      <text x="200" y="140" text-anchor="middle" class="blueprint-title">暂无地图平面图数据 (${mapId})</text>
    </svg>
  `;
}
