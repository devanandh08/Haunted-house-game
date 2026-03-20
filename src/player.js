class Player {
  constructor() {
    this.x = 2 * TILE_SIZE + TILE_SIZE / 2;
    this.y = 2 * TILE_SIZE + TILE_SIZE / 2;
    this.speed = 110;
    this.sanity = 100;
    this.flashlightTimer = 0;
    this.invincibleTimer = 0;
  }

  update(dt, keys) {
    let dx = 0, dy = 0;
    if (keys['ArrowLeft']  || keys['a'] || keys['A']) dx -= 1;
    if (keys['ArrowRight'] || keys['d'] || keys['D']) dx += 1;
    if (keys['ArrowUp']    || keys['w'] || keys['W']) dy -= 1;
    if (keys['ArrowDown']  || keys['s'] || keys['S']) dy += 1;

    if (dx !== 0 && dy !== 0) { dx *= 0.707; dy *= 0.707; }

    const speed = this.speed * dt;
    const r = 10; // player radius — must match wall check below

    // move X axis first, then Y separately so we slide along walls
    const nx = this.x + dx * speed;
    if (!this._collides(nx, this.y, r)) {
      this.x = nx;
    } else {
      // try to slide — snap to wall edge
      this.x = dx > 0
        ? Math.floor((nx + r) / TILE_SIZE) * TILE_SIZE - r - 0.5
        : Math.ceil((nx  - r) / TILE_SIZE) * TILE_SIZE + r + 0.5;
    }

    const ny = this.y + dy * speed;
    if (!this._collides(this.x, ny, r)) {
      this.y = ny;
    } else {
      this.y = dy > 0
        ? Math.floor((ny + r) / TILE_SIZE) * TILE_SIZE - r - 0.5
        : Math.ceil((ny  - r) / TILE_SIZE) * TILE_SIZE + r + 0.5;
    }

    if (this.flashlightTimer  > 0) this.flashlightTimer  -= dt;
    if (this.invincibleTimer  > 0) this.invincibleTimer  -= dt;
  }

  // check all 4 corners + 4 edge midpoints of the player circle
  _collides(px, py, r) {
    const points = [
      [px - r, py - r], // top-left
      [px + r, py - r], // top-right
      [px - r, py + r], // bottom-left
      [px + r, py + r], // bottom-right
      [px,     py - r], // top-mid
      [px,     py + r], // bottom-mid
      [px - r, py    ], // left-mid
      [px + r, py    ], // right-mid
    ];
    return points.some(([x, y]) => isWall(x, y));
  }

  takeDamage(amount) {
    if (this.invincibleTimer > 0) return;
    this.sanity -= amount;
    this.invincibleTimer = 1.2;
    if (this.sanity < 0) this.sanity = 0;
  }

  draw(ctx, cameraX, cameraY) {
    const sx = this.x - cameraX;
    const sy = this.y - cameraY;

    // flashlight glow
    if (this.flashlightTimer > 0) {
      const gradient = ctx.createRadialGradient(sx, sy, 10, sx, sy, 180);
      gradient.addColorStop(0, 'rgba(255,240,180,0.18)');
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(sx, sy, 180, 0, Math.PI * 2);
      ctx.fill();
    }

    // player body — flicker when hit
    ctx.save();
    if (this.invincibleTimer > 0) ctx.globalAlpha = Math.sin(Date.now() * 0.02) * 0.5 + 0.5;
    ctx.fillStyle = '#34d399';
    ctx.beginPath();
    ctx.arc(sx, sy, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ecfdf5';
    ctx.lineWidth = 2;
    ctx.stroke();
    // face dot
    ctx.fillStyle = '#065f46';
    ctx.beginPath(); ctx.arc(sx - 3, sy - 2, 2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(sx + 3, sy - 2, 2, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
}