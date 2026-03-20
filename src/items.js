const ITEM_TYPES = {
  SALT:       { label: 'Salt',        color: '#e0e0e0', effect: 'repel',  uses: 3 },
  FLASHLIGHT: { label: 'Flashlight',  color: '#fbbf24', effect: 'light',  uses: 1 },
  TRAP:       { label: 'Trap',        color: '#34d399', effect: 'freeze', uses: 1 },
  HOLYWATER:  { label: 'Holy Water',  color: '#60a5fa', effect: 'burst',  uses: 2 },
};

const ITEM_SPAWNS = [
  { type: 'SALT',       col: 2,  row: 2  },
  { type: 'FLASHLIGHT', col: 8,  row: 2  },
  { type: 'TRAP',       col: 14, row: 2  },
  { type: 'HOLYWATER',  col: 17, row: 7  },
  { type: 'SALT',       col: 6,  row: 9  },
  { type: 'TRAP',       col: 11, row: 12 },
  { type: 'HOLYWATER',  col: 3,  row: 13 },
  { type: 'SALT',       col: 16, row: 13 },
];

class ItemManager {
  constructor() {
    this.items = ITEM_SPAWNS.map(s => ({
      ...s,
      x: s.col * TILE_SIZE + TILE_SIZE / 2,
      y: s.row * TILE_SIZE + TILE_SIZE / 2,
      collected: false,
      bob: Math.random() * Math.PI * 2,
    }));
    this.inventory = [];
  }

  update(dt) {
    this.items.forEach(item => item.bob += dt * 2);
  }

  tryPickup(player) {
    this.items.forEach(item => {
      if (item.collected) return;
      const dx = player.x - item.x;
      const dy = player.y - item.y;
      if (Math.sqrt(dx * dx + dy * dy) < TILE_SIZE) {
        item.collected = true;
        if (this.inventory.length < 3) {
          this.inventory.push({ ...ITEM_TYPES[item.type], type: item.type });
          showToast(`Picked up: ${ITEM_TYPES[item.type].label}!`);
        } else {
          showToast('Inventory full! (max 3 items)');
        }
      }
    });
  }

  useItem(ghosts, player) {
    if (this.inventory.length === 0) { showToast('No items!'); return; }
    const item = this.inventory[0];
    if (item.effect === 'repel') {
      ghosts.forEach(g => {
        const dx = g.x - player.x, dy = g.y - player.y;
        if (Math.sqrt(dx * dx + dy * dy) < 120) {
          g.repelTimer = 3;
          showToast('Salt thrown — ghost repelled!');
        }
      });
    } else if (item.effect === 'freeze') {
      ghosts.forEach(g => {
        const dx = g.x - player.x, dy = g.y - player.y;
        if (Math.sqrt(dx * dx + dy * dy) < 150) {
          g.frozenTimer = 4;
        }
      });
      showToast('Trap set — ghost frozen!');
    } else if (item.effect === 'burst') {
      ghosts.forEach(g => {
        const dx = g.x - player.x, dy = g.y - player.y;
        if (Math.sqrt(dx * dx + dy * dy) < 200) {
          g.repelTimer = 6;
          g.frozenTimer = 1;
        }
      });
      showToast('Holy water burst!');
    } else if (item.effect === 'light') {
      player.flashlightTimer = 10;
      showToast('Flashlight on!');
    }
    item.uses--;
    if (item.uses <= 0) this.inventory.shift();
  }

  draw(ctx, cameraX, cameraY) {
    this.items.forEach(item => {
      if (item.collected) return;
      const screenX = item.x - cameraX;
      const screenY = item.y - cameraY + Math.sin(item.bob) * 3;
      const info = ITEM_TYPES[item.type];
      ctx.beginPath();
      ctx.arc(screenX, screenY, 9, 0, Math.PI * 2);
      ctx.fillStyle = info.color;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  }
}