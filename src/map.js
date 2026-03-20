const TILE_SIZE = 32;

// 0 = floor, 1 = wall, 2 = door (exit)
const MAP_DATA = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1],
  [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,0,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1],
  [1,1,1,0,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,0,0,0,0,0,1],
  [1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,1,0,0,0,0,0,1],
  [1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,1,0,0,0,0,0,1],
  [1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
  [1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,1,0,0,0,0,0,1],
  [1,0,0,0,0,0,1,0,0,0,1,1,1,0,0,0,1,1,1,0,1,0,1,0,1,1,1,0,0,1,0,0,0,0,0,1],
  [1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,1,0,1,0,1,0,1,0,0,0,0,1,0,0,0,0,0,1],
  [1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,1,0,1,0,1,0,1,0,0,0,0,1,0,0,0,0,0,1],
  [1,1,0,1,1,1,1,0,0,0,1,0,0,0,0,0,0,0,1,0,1,0,1,0,1,0,0,0,0,1,1,1,0,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,1,1,1,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1],
  [1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,1,1,1,1,1,1,0,1,1,1,1,1,1,1,0,1,1,1,0,1,1,1,1,1,1,0,1,1,1,1,0,0,1],
  [1,0,0,1,0,0,0,0,1,0,1,0,0,0,0,0,1,0,0,0,1,0,1,0,0,0,0,1,0,1,0,0,0,0,0,1],
  [1,0,0,1,0,0,0,0,1,0,1,0,0,0,0,0,1,0,0,0,1,0,1,0,0,0,0,1,0,1,0,0,0,0,0,1],
  [1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,1],
  [1,0,0,1,0,0,0,0,1,0,1,0,0,0,0,0,1,0,0,0,1,0,1,0,0,0,0,1,0,1,0,0,0,0,0,1],
  [1,0,0,1,1,1,1,1,1,0,1,1,1,1,1,1,1,0,0,0,1,0,1,1,1,1,1,1,0,1,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

const MAP_ROWS = MAP_DATA.length;
const MAP_COLS = MAP_DATA[0].length;

// tracks which tiles the player has visited
const explored = Array.from({ length: MAP_ROWS }, () => new Array(MAP_COLS).fill(false));

function markExplored(playerX, playerY) {
  const pcol = Math.floor(playerX / TILE_SIZE);
  const prow = Math.floor(playerY / TILE_SIZE);
  const visionRadius = 4;
  for (let r = prow - visionRadius; r <= prow + visionRadius; r++) {
    for (let c = pcol - visionRadius; c <= pcol + visionRadius; c++) {
      if (r >= 0 && r < MAP_ROWS && c >= 0 && c < MAP_COLS) {
        explored[r][c] = true;
      }
    }
  }
}

function drawMap(ctx, cameraX, cameraY) {
  for (let r = 0; r < MAP_ROWS; r++) {
    for (let c = 0; c < MAP_COLS; c++) {
      const tile = MAP_DATA[r][c];
      const x = c * TILE_SIZE - cameraX;
      const y = r * TILE_SIZE - cameraY;
      if (x + TILE_SIZE < 0 || x > 640 || y + TILE_SIZE < 0 || y > 480) continue;

      if (tile === 1) {
        ctx.fillStyle = '#1c1c1c';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        ctx.strokeStyle = '#2e2e2e';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
        ctx.strokeStyle = '#111';
        ctx.lineWidth = 0.3;
        ctx.strokeRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
      } else if (tile === 0) {
        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        // subtle floor grain
        ctx.strokeStyle = '#242424';
        ctx.lineWidth = 0.2;
        ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
      } else if (tile === 2) {
        ctx.fillStyle = '#555';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        const glow = ctx.createRadialGradient(
          x + TILE_SIZE/2, y + TILE_SIZE/2, 2,
          x + TILE_SIZE/2, y + TILE_SIZE/2, TILE_SIZE * 2
        );
        glow.addColorStop(0, 'rgba(255,255,255,0.25)');
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glow;
        ctx.fillRect(x - TILE_SIZE*2, y - TILE_SIZE*2, TILE_SIZE*5, TILE_SIZE*5);
        ctx.fillStyle = '#fff';
        ctx.font = '20px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('🚪', x + TILE_SIZE/2, y + TILE_SIZE - 5);
      }
    }
  }
}

function isWall(px, py) {
  const col = Math.floor(px / TILE_SIZE);
  const row = Math.floor(py / TILE_SIZE);
  if (row < 0 || row >= MAP_ROWS || col < 0 || col >= MAP_COLS) return true;
  return MAP_DATA[row][col] === 1;
}

function isExit(px, py) {
  const col = Math.floor(px / TILE_SIZE);
  const row = Math.floor(py / TILE_SIZE);
  if (row < 0 || row >= MAP_ROWS || col < 0 || col >= MAP_COLS) return false;
  return MAP_DATA[row][col] === 2;
}

// --- Minimap ---
const MINI_TILE  = 4;   // pixels per tile on minimap
const MINI_W     = MAP_COLS * MINI_TILE;
const MINI_H     = MAP_ROWS * MINI_TILE;
const MINI_PAD   = 12;  // distance from edge of canvas

function drawMinimap(ctx, canvasW, canvasH, playerX, playerY, ghosts) {
  const ox = canvasW  - MINI_W - MINI_PAD;  // top-right corner
  const oy = MINI_PAD;

  // outer border
  ctx.fillStyle = 'rgba(0,0,0,0.75)';
  ctx.fillRect(ox - 3, oy - 3, MINI_W + 6, MINI_H + 6);
  ctx.strokeStyle = '#444';
  ctx.lineWidth = 1;
  ctx.strokeRect(ox - 3, oy - 3, MINI_W + 6, MINI_H + 6);

  // tiles — only draw explored ones
  for (let r = 0; r < MAP_ROWS; r++) {
    for (let c = 0; c < MAP_COLS; c++) {
      if (!explored[r][c]) continue;
      const tile = MAP_DATA[r][c];
      const tx = ox + c * MINI_TILE;
      const ty = oy + r * MINI_TILE;
      if (tile === 1) {
        ctx.fillStyle = '#111';
      } else if (tile === 2) {
        ctx.fillStyle = '#fff';
      } else {
        ctx.fillStyle = '#555';
      }
      ctx.fillRect(tx, ty, MINI_TILE, MINI_TILE);
    }
  }

  // ghost dots — only show on minimap if explored
  ghosts.forEach(g => {
    const gc = Math.floor(g.x / TILE_SIZE);
    const gr = Math.floor(g.y / TILE_SIZE);
    if (!explored[gr]?.[gc]) return;
    ctx.beginPath();
    ctx.arc(ox + gc * MINI_TILE + MINI_TILE/2, oy + gr * MINI_TILE + MINI_TILE/2, 2.5, 0, Math.PI*2);
    ctx.fillStyle = g.state === 'chase' ? '#ff4444' : '#aaa';
    ctx.fill();
  });

  // player dot
  const px = ox + Math.floor(playerX / TILE_SIZE) * MINI_TILE + MINI_TILE/2;
  const py = oy + Math.floor(playerY / TILE_SIZE) * MINI_TILE + MINI_TILE/2;
  ctx.beginPath();
  ctx.arc(px, py, 3, 0, Math.PI * 2);
  ctx.fillStyle = '#fff';
  ctx.fill();
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1;
  ctx.stroke();

  // label
  ctx.fillStyle = '#666';
  ctx.font = '9px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('M: hide map', ox, oy + MINI_H + 14);
} 