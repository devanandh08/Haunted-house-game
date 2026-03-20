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
    const r = 10;
    const nx = this.x + dx;
    const ny = this.y + dy;

    const canX = ![ 
      [nx + r, this.y], [nx - r, this.y],
      [nx + r, this.y - r], [nx - r, this.y - r],
      [nx + r, this.y + r], [nx - r, this.y + r],
    ].some(([x, y]) => isWall(x, y));

    const canY = ![
      [this.x, ny + r], [this.x, ny - r],
      [this.x - r, ny + r], [this.x - r, ny - r],
      [this.x + r, ny + r], [this.x + r, ny - r],
    ].some(([x, y]) => isWall(x, y));

    if (canX) this.x = nx;
    if (canY) this.y = ny;
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
  // top-left chamber
  { x: 4*TILE_SIZE, y: 2*TILE_SIZE, patrol: [
    {x:1*TILE_SIZE, y:1*TILE_SIZE},
    {x:8*TILE_SIZE, y:1*TILE_SIZE},
    {x:8*TILE_SIZE, y:5*TILE_SIZE},
    {x:1*TILE_SIZE, y:5*TILE_SIZE},
  ]},
  // top-right chamber
  { x: 28*TILE_SIZE, y: 3*TILE_SIZE, patrol: [
    {x:24*TILE_SIZE, y:1*TILE_SIZE},
    {x:34*TILE_SIZE, y:1*TILE_SIZE},
    {x:34*TILE_SIZE, y:5*TILE_SIZE},
    {x:24*TILE_SIZE, y:5*TILE_SIZE},
  ]},
  // middle corridor
  { x: 10*TILE_SIZE, y: 11*TILE_SIZE, patrol: [
    {x:1*TILE_SIZE,  y:11*TILE_SIZE},
    {x:13*TILE_SIZE, y:11*TILE_SIZE},
    {x:13*TILE_SIZE, y:8*TILE_SIZE},
  ]},
  // middle-right corridor
  { x: 28*TILE_SIZE, y: 18*TILE_SIZE, patrol: [
    {x:25*TILE_SIZE, y:15*TILE_SIZE},
    {x:34*TILE_SIZE, y:15*TILE_SIZE},
    {x:34*TILE_SIZE, y:20*TILE_SIZE},
    {x:25*TILE_SIZE, y:20*TILE_SIZE},
  ]},
  // lower inner chamber
  { x: 14*TILE_SIZE, y: 38*TILE_SIZE, patrol: [
    {x:11*TILE_SIZE, y:33*TILE_SIZE},
    {x:19*TILE_SIZE, y:33*TILE_SIZE},
    {x:19*TILE_SIZE, y:42*TILE_SIZE},
    {x:11*TILE_SIZE, y:42*TILE_SIZE},
  ]},
  // bottom hallway
  { x: 17*TILE_SIZE, y: 47*TILE_SIZE, patrol: [
    {x:1*TILE_SIZE,  y:47*TILE_SIZE},
    {x:34*TILE_SIZE, y:47*TILE_SIZE},
  ]},
  // bottom-left room
  { x: 5*TILE_SIZE, y: 51*TILE_SIZE, patrol: [
    {x:4*TILE_SIZE,  y:49*TILE_SIZE},
    {x:7*TILE_SIZE,  y:49*TILE_SIZE},
    {x:7*TILE_SIZE,  y:53*TILE_SIZE},
    {x:4*TILE_SIZE,  y:53*TILE_SIZE},
  ]},
  // guarding the exit
  { x: 30*TILE_SIZE, y: 53*TILE_SIZE, patrol: [
    {x:25*TILE_SIZE, y:54*TILE_SIZE},
    {x:33*TILE_SIZE, y:54*TILE_SIZE},
  ]},
];