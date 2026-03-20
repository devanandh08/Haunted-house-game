const ITEM_TYPES = {
  SALT:       { label: 'Salt',       color: '#e0e0e0', effect: 'repel',  uses: 3 },
  FLASHLIGHT: { label: 'Flashlight', color: '#fbbf24', effect: 'light',  uses: 1 },
  TRAP:       { label: 'Trap',       color: '#34d399', effect: 'freeze', uses: 1 },
  HOLYWATER:  { label: 'Holy Water', color: '#60a5fa', effect: 'burst',  uses: 2 },
};

const ITEM_SPAWNS = [
  { type: 'SALT',       col: 3,  row: 1  },
  { type: 'FLASHLIGHT', col: 12, row: 3  },
  { type: 'TRAP',       col: 5,  row: 7  },
  { type: 'HOLYWATER',  col: 20, row: 5  },
  { type: 'SALT',       col: 8,  row: 11 },
  { type: 'FLASHLIGHT', col: 25, row: 9  },
  { type: 'TRAP',       col: 15, row: 15 },
  { type: 'HOLYWATER',  col: 3,  row: 19 },
  { type: 'SALT',       col: 22, row: 17 },
  { type: 'TRAP',       col: 10, row: 23 },
  { type: 'SALT',       col: 27, row: 21 },
  { type: 'HOLYWATER',  col: 17, row: 27 },
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
    this.selectedIndex = 0;
  }

  // cycle selected item with Q
  cycleSelected() {
    if (this.inventory.length === 0) { showToast('No items!'); return; }
    this.selectedIndex = (this.selectedIndex + 1) % this.inventory.length;
    const item = this.inventory[this.selectedIndex];
    showToast(`Selected: ${item.label} (x${item.uses})`);
    Audio.trapSet(); // small click sound for switching
  }

  // keep selectedIndex valid after use/removal
  _clampIndex() {
    if (this.inventory.length === 0) { this.selectedIndex = 0; return; }
    if (this.selectedIndex >= this.inventory.length) {
      this.selectedIndex = this.inventory.length - 1;
    }
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
        if (this.inventory.length < 4) {
          item.collected = true;
          this.inventory.push({ ...ITEM_TYPES[item.type], type: item.type });
          Audio.pickup();
          showToast(`Picked up: ${ITEM_TYPES[item.type].label}! (Q to switch)`);
        } else {
          showToast('Inventory full! (max 4 items)');
        }
      }
    });
  }

  useItem(ghosts, player) {
    if (this.inventory.length === 0) { showToast('No items!'); return; }
    this._clampIndex();
    const item = this.inventory[this.selectedIndex];

    if (item.effect === 'repel') {
      let hit = false;
      ghosts.forEach(g => {
        const dx = g.x - player.x, dy = g.y - player.y;
        if (Math.sqrt(dx * dx + dy * dy) < 130) { g.repelTimer = 3; hit = true; }
      });
      Audio.saltThrow();
      if (hit) { Audio.ghostRepelled(); showToast('Salt thrown — ghost repelled!'); }
      else showToast('Salt thrown! (no ghost in range)');

    } else if (item.effect === 'freeze') {
      let hit = false;
      ghosts.forEach(g => {
        const dx = g.x - player.x, dy = g.y - player.y;
        if (Math.sqrt(dx * dx + dy * dy) < 160) { g.frozenTimer = 4; hit = true; }
      });
      Audio.trapSet();
      if (hit) { Audio.ghostFrozen(); showToast('Trap set — ghost frozen!'); }
      else showToast('Trap set! (no ghost in range)');

    } else if (item.effect === 'burst') {
      ghosts.forEach(g => {
        const dx = g.x - player.x, dy = g.y - player.y;
        if (Math.sqrt(dx * dx + dy * dy) < 200) { g.repelTimer = 6; g.frozenTimer = 1; }
      });
      Audio.holyWater();
      Audio.ghostRepelled();
      showToast('Holy water burst — all nearby ghosts repelled!');

    } else if (item.effect === 'light') {
      player.flashlightTimer = 12;
      Audio.flashlight();
      showToast('Flashlight on for 12 seconds!');
    }

    item.uses--;
    if (item.uses <= 0) {
      this.inventory.splice(this.selectedIndex, 1);
      this._clampIndex();
    }
  }

  draw(ctx, cameraX, cameraY) {
    this.items.forEach(item => {
      if (item.collected) return;
      const screenX = item.x - cameraX;
      const screenY = item.y - cameraY + Math.sin(item.bob) * 3;

      if (screenX < -20 || screenX > 660 || screenY < -20 || screenY > 500) return;

      const info = ITEM_TYPES[item.type];

      // glow ring
      ctx.beginPath();
      ctx.arc(screenX, screenY, 13, 0, Math.PI * 2);
      ctx.fillStyle = info.color + '22';
      ctx.fill();

      // item circle
      ctx.beginPath();
      ctx.arc(screenX, screenY, 9, 0, Math.PI * 2);
      ctx.fillStyle = info.color;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // label above
      ctx.fillStyle = info.color;
      ctx.font = '9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(info.label, screenX, screenY - 15);
    });
  }

  drawHUDInventory(ctx, canvasW, canvasH) {
    const slotSize = 52;
    const padding  = 6;
    const totalW   = this.inventory.length * (slotSize + padding) + padding;
    const startX   = (canvasW - totalW) / 2;
    const y        = canvasH - slotSize - 10;

    // background bar
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.beginPath();
    ctx.roundRect(startX - 4, y - 4, totalW + 8, slotSize + 24, 8);
    ctx.fill();

    // label
    ctx.fillStyle = '#555';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Q: switch  |  SPACE: use', canvasW / 2, y - 8);

    this.inventory.forEach((item, i) => {
      const sx = startX + i * (slotSize + padding) + padding;

      // slot background
      const isSelected = i === this.selectedIndex;
      ctx.fillStyle = isSelected ? 'rgba(124,58,237,0.5)' : 'rgba(30,20,50,0.8)';
      ctx.strokeStyle = isSelected ? '#a78bfa' : '#3d2d5e';
      ctx.lineWidth = isSelected ? 2 : 1;
      ctx.beginPath();
      ctx.roundRect(sx, y, slotSize, slotSize, 6);
      ctx.fill();
      ctx.stroke();

      // selected arrow
      if (isSelected) {
        ctx.fillStyle = '#a78bfa';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('▼', sx + slotSize / 2, y - 2);
      }

      // item color dot
      ctx.beginPath();
      ctx.arc(sx + slotSize / 2, y + 18, 9, 0, Math.PI * 2);
      ctx.fillStyle = item.color;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.stroke();

      // item name
      ctx.fillStyle = isSelected ? '#e9d5ff' : '#888';
      ctx.font = '9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(item.label, sx + slotSize / 2, y + 34);

      // uses count
      ctx.fillStyle = isSelected ? '#a78bfa' : '#555';
      ctx.font = '10px monospace';
      ctx.fillText(`x${item.uses}`, sx + slotSize / 2, y + 46);
    });

    if (this.inventory.length === 0) {
      ctx.fillStyle = '#444';
      ctx.font = '11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('no items', canvasW / 2, y + 28);
    }
  }
}