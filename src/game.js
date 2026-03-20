const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const CANVAS_W = canvas.width;
const CANVAS_H = canvas.height;

// --- State ---
let player, ghosts, itemManager, keys, score, elapsed, gameState, footstepTimer;

function init() {
  player      = new Player();
  ghosts      = GHOST_DEFS.map(d => new Ghost(d.x, d.y, d.patrol));
  itemManager = new ItemManager();
  keys        = {};
  score       = 0;
  elapsed     = 0;
  gameState   = 'playing'; // playing | won | lost
  Audio.ambience(); 
  footstepTimer = 0;
}

// --- Input ---
document.addEventListener('keydown', e => {
  keys[e.key] = true;
  if (e.key === ' ' && gameState === 'playing') {
    e.preventDefault();
    itemManager.useItem(ghosts, player);
  }
  if ((e.key === 'q' || e.key === 'Q') && gameState === 'playing') {
    itemManager.cycleSelected();          // ← add this
  }
  if (e.key === 'Enter' && gameState !== 'playing') init();
});
document.addEventListener('keyup', e => keys[e.key] = false);

// --- Toast ---
let toastMsg = '', toastTimer = 0;
function showToast(msg) { toastMsg = msg; toastTimer = 2.5; }

// --- Camera ---
function getCamera() {
  return {
    x: Math.max(0, Math.min(player.x - CANVAS_W / 2, MAP_COLS * TILE_SIZE - CANVAS_W)),
    y: Math.max(0, Math.min(player.y - CANVAS_H / 2, MAP_ROWS * TILE_SIZE - CANVAS_H)),
  };
}

// --- Darkness overlay ---
function drawDarkness(cameraX, cameraY) {
  const sx = player.x - cameraX, sy = player.y - cameraY;
  const radius = player.flashlightTimer > 0 ? 170 : 90;
  const gradient = ctx.createRadialGradient(sx, sy, radius * 0.3, sx, sy, radius);
  gradient.addColorStop(0, 'rgba(0,0,0,0)');
  gradient.addColorStop(1, 'rgba(0,0,0,0.97)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
}

// --- HUD ---
function drawHUD() {
  // sanity bar
  const fill = document.getElementById('sanity-fill');
  const pct = Math.max(0, player.sanity);
  fill.style.width = pct + '%';
  fill.style.background = pct > 50 ? '#7c3aed' : pct > 25 ? '#f59e0b' : '#ef4444';

  document.getElementById('score').textContent = score;
  document.getElementById('timer').textContent = Math.floor(elapsed);

  // inventory
  itemManager.drawHUDInventory(ctx, CANVAS_W, CANVAS_H);

  // toast
  if (toastTimer > 0) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, toastTimer);
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(CANVAS_W / 2 - 140, 12, 280, 30);
    ctx.fillStyle = '#fcd34d';
    ctx.font = '13px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(toastMsg, CANVAS_W / 2, 32);
    ctx.restore();
  }
}

function drawOverlay(title, sub) {
  ctx.fillStyle = 'rgba(0,0,0,0.75)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#c4b5fd';
  ctx.font = 'bold 36px monospace';
  ctx.fillText(title, CANVAS_W / 2, CANVAS_H / 2 - 20);
  ctx.fillStyle = '#a1a1aa';
  ctx.font = '16px monospace';
  ctx.fillText(sub, CANVAS_W / 2, CANVAS_H / 2 + 18);
  ctx.fillStyle = '#6d28d9';
  ctx.font = '13px monospace';
  ctx.fillText('Press ENTER to play again', CANVAS_W / 2, CANVAS_H / 2 + 50);
}

// --- Game loop ---
let lastTime = 0;
function loop(ts) {
  const dt = Math.min((ts - lastTime) / 1000, 0.05);
  lastTime = ts;

  if (gameState === 'playing') {
    elapsed += dt;
    score = Math.floor(elapsed * 10);
    if (toastTimer > 0) toastTimer -= dt;

  // footstep sound when moving
  footstepTimer -= dt;
  if (footstepTimer <= 0) {
    const moving = ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','a','d','w','s','A','D','W','S']
      .some(k => keys[k]);
    if (moving) { Audio.footstep(); footstepTimer = 0.3; }
    else footstepTimer = 0.1;
  }

    player.update(dt, keys);
    itemManager.update(dt);
    itemManager.tryPickup(player);
    ghosts.forEach(g => g.update(dt, player));

    // ghost contact
    ghosts.forEach(g => {
      const dx = g.x - player.x, dy = g.y - player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 90 && g.repelTimer <= 0 && g.frozenTimer <= 0) {
        if (dist < 20) {
          const wasAlive = player.sanity > 0;
          player.takeDamage(18);
          if (wasAlive && player.invincibleTimer > 1.1) Audio.playerHit();
          if (player.sanity <= 0) { gameState = 'lost'; Audio.gameOver(); }
        } else {
          // ghost nearby pulse — throttled to every 2s
          g._warnTimer = (g._warnTimer || 0) - dt;
          if (g._warnTimer <= 0) { Audio.ghostNearby(); g._warnTimer = 2; }
        }
      }
    });

    // win check
    if (isExit(player.x, player.y)) {
      score += 500;
      gameState = 'won';
      Audio.win();
    }
  }

  // --- Draw ---
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  const { x: camX, y: camY } = getCamera();

  drawMap(ctx, camX, camY);
  itemManager.draw(ctx, camX, camY);
  ghosts.forEach(g => g.draw(ctx, camX, camY));
  player.draw(ctx, camX, camY);
  drawDarkness(camX, camY);
  drawHUD();

  if (gameState === 'won')  drawOverlay('YOU ESCAPED!', `Score: ${score}  |  Time: ${Math.floor(elapsed)}s`);
  if (gameState === 'lost') drawOverlay('LOST YOUR MIND...', `You survived ${Math.floor(elapsed)}s`);

  requestAnimationFrame(loop);
}

init();
requestAnimationFrame(loop);