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

    const nx = this.x + dx * this.speed * dt;
    const ny = this.y + dy * this.speed * dt;
    const pad = 10;

    if (!isWall(nx + pad, this.y) && !isWall(nx - pad, this.y)) this.x = nx;
    if (!isWall(this.x, ny + pad) && !isWall(this.x, ny - pad)) this.y = ny;

    if (this.flashlightTimer > 0) this.flashlightTimer -= dt;
    if (this.invincibleTimer > 0) this.invincibleTimer -= dt;
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