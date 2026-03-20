const TILE_SIZE = 32;

// 0=floor  1=wall  2=exit door  3=floor(dark room — renders differently)
const MAP_DATA = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,0,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,1,1,0,0,0,1,1,0,0,0,1,1,0,0,0,1,1,0,0,0,1,1,0,0,0,0,1],
  [1,0,0,1,1,0,0,0,1,1,0,0,0,1,1,0,0,0,1,1,0,0,0,1,1,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,0,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,1],
  [1,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,0,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],
  [1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

const MAP_ROWS = MAP_DATA.length;
const MAP_COLS = MAP_DATA[0].length;

// Room name overlays — shown as faint labels on the map
const ROOM_LABELS = [
  { label: 'Entry Hall',      col: 1,  row: 1  },
  { label: 'Living Room',     col: 7,  row: 1  },
  { label: 'Library',         col: 14, row: 1  },
  { label: 'Attic',           col: 20, row: 1  },
  { label: 'Kitchen',         col: 1,  row: 7  },
  { label: 'Dining Room',     col: 7,  row: 7  },
  { label: 'Study',           col: 14, row: 7  },
  { label: 'Secret Passage',  col: 20, row: 7  },
  { label: 'Basement',        col: 1,  row: 14 },
  { label: 'Boiler Room',     col: 7,  row: 14 },
  { label: 'Exit Corridor',   col: 14, row: 14 },
  { label: 'Front Door',      col: 20, row: 21 },
];

function drawMap(ctx, cameraX, cameraY) {
  for (let r = 0; r < MAP_ROWS; r++) {
    for (let c = 0; c < MAP_COLS; c++) {
      const tile = MAP_DATA[r][c];
      const x = c * TILE_SIZE - cameraX;
      const y = r * TILE_SIZE - cameraY;

      // skip tiles fully off screen
      if (x > 640 + TILE_SIZE || x < -TILE_SIZE) continue;
      if (y > 480 + TILE_SIZE || y < -TILE_SIZE) continue;

      if (tile === 1) {
        ctx.fillStyle = '#1a0a2e';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        ctx.strokeStyle = '#2d1b4e';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
      } else if (tile === 0) {
        ctx.fillStyle = '#0d0d1a';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
      } else if (tile === 2) {
        ctx.fillStyle = '#7c3aed';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = '#c4b5fd';
        ctx.font = '20px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('🚪', x + TILE_SIZE / 2, y + TILE_SIZE - 4);
      }
    }
  }

  // draw faint room labels
  ctx.font = '10px monospace';
  ctx.fillStyle = 'rgba(120,80,200,0.25)';
  ctx.textAlign = 'left';
  ROOM_LABELS.forEach(({ label, col, row }) => {
    const x = col * TILE_SIZE - cameraX + 4;
    const y = row * TILE_SIZE - cameraY + 14;
    ctx.fillText(label, x, y);
  });
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