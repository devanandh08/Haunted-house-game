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

  // --- Exit direction arrow ---
  const EXIT_COL = 34, EXIT_ROW = 54; // match your exit tile in map.js
  const exitWorldX = EXIT_COL * TILE_SIZE + TILE_SIZE / 2;
  const exitWorldY = EXIT_ROW * TILE_SIZE + TILE_SIZE / 2;

  const adx = exitWorldX - player.x;
  const ady = exitWorldY - player.y;
  const dist = Math.sqrt(adx * adx + ady * ady);
  const angle = Math.atan2(ady, adx);

  // only show when exit is off-screen
  const { x: camX2, y: camY2 } = getCamera();
  const exitScreenX = exitWorldX - camX2;
  const exitScreenY = exitWorldY - camY2;
  const onScreen = exitScreenX > 20 && exitScreenX < CANVAS_W - 20
                && exitScreenY > 20 && exitScreenY < CANVAS_H - 20;

  if (!onScreen) {
    // compass sits in top-right corner
    const cx = CANVAS_W - 36;
    const cy = 36;
    const arrowLen = 14;

    // background circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, 22, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.fill();
    ctx.strokeStyle = '#4c1d95';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // pulsing ring — glows purple
    const pulse = 0.5 + 0.5 * Math.sin(Date.now() * 0.004);
    ctx.beginPath();
    ctx.arc(cx, cy, 22, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(167,139,250,${pulse * 0.6})`;
    ctx.lineWidth = 2;
    ctx.stroke();

    // arrow pointing at exit
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    // arrow shaft
    ctx.beginPath();
    ctx.moveTo(-arrowLen * 0.4, 0);
    ctx.lineTo(arrowLen * 0.7, 0);
    ctx.strokeStyle = '#a78bfa';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.stroke();

    // arrowhead
    ctx.beginPath();
    ctx.moveTo(arrowLen * 0.7,  0);
    ctx.lineTo(arrowLen * 0.2,  -5);
    ctx.lineTo(arrowLen * 0.2,   5);
    ctx.closePath();
    ctx.fillStyle = '#a78bfa';
    ctx.fill();

    // small dot at tail
    ctx.beginPath();
    ctx.arc(-arrowLen * 0.4, 0, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = '#6d28d9';
    ctx.fill();

    ctx.restore();

    // distance label below compass
    const meters = Math.round(dist / TILE_SIZE);
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(CANVAS_W - 58, 62, 44, 16);
    ctx.fillStyle = '#7c3aed';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${meters}m`, CANVAS_W - 36, 74);
  } else {
    // exit is visible — show a small "EXIT" label above it instead
    ctx.save();
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    const pulse2 = 0.6 + 0.4 * Math.sin(Date.now() * 0.005);
    ctx.fillStyle = `rgba(196,181,253,${pulse2})`;
    ctx.fillText('EXIT', exitScreenX, exitScreenY - 24);
    ctx.restore();
  }
}

init();
requestAnimationFrame(loop);