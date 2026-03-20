class Ghost {
  constructor(x, y, patrolPoints) {
    this.x = x;
    this.y = y;
    this.patrolPoints = patrolPoints;
    this.patrolIndex  = 0;
    this.speed        = 58;
    this.state        = 'patrol';
    this.repelTimer   = 0;
    this.frozenTimer  = 0;
    this.bob          = Math.random() * Math.PI * 2;
    this.alpha        = 0.85;
    this._warnTimer   = 0;
  }

  update(dt, player) {
    this.bob += dt * 1.5;
    if (this.frozenTimer > 0) { this.frozenTimer -= dt; return; }
    if (this.repelTimer  > 0) {
      this.repelTimer -= dt;
      const dx = this.x - player.x, dy = this.y - player.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      this._move(dx / dist * this.speed * dt, dy / dist * this.speed * dt);
      return;
    }
    const dx = player.x - this.x, dy = player.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 200) this.state = 'chase';
    else if (dist > 300) this.state = 'patrol';

    if (this.state === 'chase') {
      this._move(dx / dist * this.speed * dt, dy / dist * this.speed * dt);
    } else {
      const target = this.patrolPoints[this.patrolIndex];
      const pdx = target.x - this.x, pdy = target.y - this.y;
      const pdist = Math.sqrt(pdx * pdx + pdy * pdy);
      if (pdist < 8) {
        this.patrolIndex = (this.patrolIndex + 1) % this.patrolPoints.length;
      } else {
        this._move(pdx / pdist * this.speed * 0.5 * dt, pdy / pdist * this.speed * 0.5 * dt);
      }
    }
  }

  _move(dx, dy) {
    const nx = this.x + dx, ny = this.y + dy;
    const pad = 10;
    if (!isWall(nx + pad, this.y) && !isWall(nx - pad, this.y)) this.x = nx;
    if (!isWall(this.x, ny + pad) && !isWall(this.x, ny - pad)) this.y = ny;
  }

  draw(ctx, cameraX, cameraY) {
    const sx = this.x - cameraX;
    const sy = this.y - cameraY + Math.sin(this.bob) * 4;
    if (sx < -30 || sx > 670 || sy < -30 || sy > 510) return;

    ctx.save();
    ctx.globalAlpha = this.frozenTimer > 0 ? 0.5 : this.alpha;

    const color = this.repelTimer  > 0 ? '#fca5a5' :
                  this.frozenTimer > 0 ? '#93c5fd' :
                  this.state === 'chase' ? '#f87171' : '#a78bfa';

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(sx, sy - 6, 12, Math.PI, 0);
    ctx.lineTo(sx + 12, sy + 10);
    for (let i = 3; i >= 0; i--) {
      const wx = sx - 12 + (i + 0.5) * 6;
      ctx.quadraticCurveTo(wx, sy + (i % 2 === 0 ? 16 : 6), wx - 3, sy + 10);
    }
    ctx.closePath();
    ctx.fill();

    // eyes
    ctx.fillStyle = this.state === 'chase' ? '#fff' : '#1e1b4b';
    ctx.beginPath(); ctx.arc(sx - 4, sy - 6, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(sx + 4, sy - 6, 3, 0, Math.PI * 2); ctx.fill();
    if (this.state === 'chase') {
      ctx.fillStyle = '#ff0000';
      ctx.beginPath(); ctx.arc(sx - 4, sy - 6, 1.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(sx + 4, sy - 6, 1.5, 0, Math.PI * 2); ctx.fill();
    }

    if (this.frozenTimer > 0) {
      ctx.strokeStyle = '#93c5fd';
      ctx.lineWidth = 2;
      ctx.strokeRect(sx - 14, sy - 20, 28, 34);
    }
    ctx.restore();
  }
}

const GHOST_DEFS = [
  { x:  3*TILE_SIZE, y:  5*TILE_SIZE, patrol: [
      {x:3*TILE_SIZE,y:5*TILE_SIZE},{x:5*TILE_SIZE,y:5*TILE_SIZE},{x:5*TILE_SIZE,y:1*TILE_SIZE}]},
  { x: 20*TILE_SIZE, y:  3*TILE_SIZE, patrol: [
      {x:20*TILE_SIZE,y:3*TILE_SIZE},{x:25*TILE_SIZE,y:3*TILE_SIZE},{x:25*TILE_SIZE,y:7*TILE_SIZE}]},
  { x:  8*TILE_SIZE, y: 13*TILE_SIZE, patrol: [
      {x:8*TILE_SIZE,y:13*TILE_SIZE},{x:12*TILE_SIZE,y:13*TILE_SIZE},{x:12*TILE_SIZE,y:9*TILE_SIZE}]},
  { x: 17*TILE_SIZE, y: 19*TILE_SIZE, patrol: [
      {x:17*TILE_SIZE,y:19*TILE_SIZE},{x:20*TILE_SIZE,y:19*TILE_SIZE},{x:20*TILE_SIZE,y:23*TILE_SIZE}]},
  { x:  5*TILE_SIZE, y: 25*TILE_SIZE, patrol: [
      {x:5*TILE_SIZE,y:25*TILE_SIZE},{x:9*TILE_SIZE,y:25*TILE_SIZE},{x:9*TILE_SIZE,y:29*TILE_SIZE}]},
  { x: 25*TILE_SIZE, y: 25*TILE_SIZE, patrol: [
      {x:25*TILE_SIZE,y:25*TILE_SIZE},{x:27*TILE_SIZE,y:25*TILE_SIZE},{x:27*TILE_SIZE,y:29*TILE_SIZE}]},
];