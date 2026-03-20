const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const CANVAS_W = canvas.width;
const CANVAS_H = canvas.height;

// --- State ---
let player, ghosts, itemManager, keys, score, elapsed, gameState, footstepTimer;
let showMinimap = true;

function init() {
  player      = new Player();
  ghosts      = GHOST_DEFS.map(d => new Ghost(d.x, d.y, d.patrol));
  itemManager = new ItemManager();
  keys        = {};
  score       = 0;
  elapsed     = 0;
  gameState   = 'playing';
  footstepTimer = 0;
  Audio.ambience();
}

// --- Input ---
document.addEventListener('keydown', e => {
  keys[e.key] = true;
  if (e.key === ' ' && gameState === 'playing') {
    e.preventDefault();
    itemManager.useItem(ghosts, player);
  }
  if ((e.key === 'q' || e.key === 'Q') && gameState === 'playing') {
    itemManager.cycleSelected();
  }
  if ((e.key === 'm' || e.key === 'M') && gameState === 'playing') {
    showMinimap = !showMinimap;
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
  const radius = player.flashlightTimer > 0 ? 200 : 100;
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
  fill.style.background = pct > 50 ? '#888' : pct > 25 ? '#bbb' : '#fff';

  document.getElementById('score').textContent = score;
  document.getElementById('timer').textContent = Math.floor(elapsed);

  // inventory slots
  itemManager.drawHUDInventory(ctx, CANVAS_W, CANVAS_H);

  // toast
  if (toastTimer > 0) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, toastTimer);
    ctx.fillStyle = 'rgba(0,0,0,0.75)';
    ctx.fillRect(CANVAS_W / 2 - 160, 12, 320, 30);
    ctx.fillStyle = '#ddd';
    ctx.font = '13px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(toastMsg, CANVAS_W / 2, 32);
    ctx.restore();
  }

  // --- Exit compass (bigger) ---
  const EXIT_COL = 34, EXIT_ROW = 54;
  const exitWorldX = EXIT_COL * TILE_SIZE + TILE_SIZE / 2;
  const exitWorldY = EXIT_ROW * TILE_SIZE + TILE_SIZE / 2;

  const adx = exitWorldX - player.x;
  const ady = exitWorldY - player.y;
  const dist = Math.sqrt(adx * adx + ady * ady);
  const angle = Math.atan2(ady, adx);

  const { x: camX2, y: camY2 } = getCamera();
  const exitScreenX = exitWorldX - camX2;
  const exitScreenY = exitWorldY - camY2;
  const onScreen = exitScreenX > 20 && exitScreenX < CANVAS_W - 20
                && exitScreenY > 20 && exitScreenY < CANVAS_H - 20;

  if (!onScreen) {
    // compass position — bottom-left so it doesn't clash with minimap
    const cx = 52;
    const cy = CANVAS_H - 90;
    const arrowLen = 22;
    const circleR  = 34;

    // outer glow ring
    const pulse = 0.4 + 0.6 * Math.sin(Date.now() * 0.004);
    ctx.beginPath();
    ctx.arc(cx, cy, circleR + 4, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(220,220,220,${pulse * 0.35})`;
    ctx.lineWidth = 3;
    ctx.stroke();

    // background circle
    ctx.beginPath();
    ctx.arc(cx, cy, circleR, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.75)';
    ctx.fill();
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // inner ring decoration
    ctx.beginPath();
    ctx.arc(cx, cy, circleR - 6, 0, Math.PI * 2);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // N/S/E/W tick marks
    for (let i = 0; i < 8; i++) {
      const tickAngle = (i / 8) * Math.PI * 2;
      const inner = circleR - 10;
      const outer = circleR - 5;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(tickAngle) * inner, cy + Math.sin(tickAngle) * inner);
      ctx.lineTo(cx + Math.cos(tickAngle) * outer, cy + Math.sin(tickAngle) * outer);
      ctx.strokeStyle = '#444';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // arrow shadow
    ctx.save();
    ctx.translate(cx + 1, cy + 1);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(-arrowLen * 0.5, 0);
    ctx.lineTo(arrowLen * 0.8, 0);
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.restore();

    // arrow
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    // shaft
    ctx.beginPath();
    ctx.moveTo(-arrowLen * 0.5, 0);
    ctx.lineTo(arrowLen * 0.7, 0);
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.stroke();

    // arrowhead
    ctx.beginPath();
    ctx.moveTo(arrowLen * 0.7,  0);
    ctx.lineTo(arrowLen * 0.15, -7);
    ctx.lineTo(arrowLen * 0.15,  7);
    ctx.closePath();
    ctx.fillStyle = '#fff';
    ctx.fill();

    // tail dot
    ctx.beginPath();
    ctx.arc(-arrowLen * 0.5, 0, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#888';
    ctx.fill();

    ctx.restore();

    // "EXIT" label inside compass
    ctx.fillStyle = '#999';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('EXIT', cx, cy + circleR + 14);

    // distance label
    const meters = Math.round(dist / TILE_SIZE);
    ctx.fillStyle = '#666';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${meters}m`, cx, cy + circleR + 26);

  } else {
    // exit is on screen — floating label above it
    ctx.save();
    const pulse2 = 0.6 + 0.4 * Math.sin(Date.now() * 0.005);
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    const labelW = 40;
    ctx.fillStyle = `rgba(0,0,0,${pulse2 * 0.7})`;
    ctx.fillRect(exitScreenX - labelW/2, exitScreenY - 38, labelW, 18);
    ctx.fillStyle = `rgba(255,255,255,${pulse2})`;
    ctx.fillText('EXIT', exitScreenX, exitScreenY - 24);
    ctx.restore();
  }
}

function drawOverlay(title, sub) {
  ctx.fillStyle = 'rgba(0,0,0,0.82)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 38px monospace';
  ctx.fillText(title, CANVAS_W / 2, CANVAS_H / 2 - 20);
  ctx.fillStyle = '#aaa';
  ctx.font = '16px monospace';
  ctx.fillText(sub, CANVAS_W / 2, CANVAS_H / 2 + 18);
  ctx.fillStyle = '#666';
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

    // mark explored tiles around player
    markExplored(player.x, player.y);

    // footstep sound
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
          g._warnTimer = (g._warnTimer || 0) - dt;
          if (g._warnTimer <= 0) { Audio.ghostNearby(); g._warnTimer = 2; }
        }
      }
    });

    // win
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

  // minimap — drawn on top of darkness
  if (showMinimap && gameState === 'playing') {
    drawMinimap(ctx, CANVAS_W, CANVAS_H, player.x, player.y, ghosts);
  }

  if (gameState === 'won')  drawOverlay('YOU ESCAPED!', `Score: ${score}  |  Time: ${Math.floor(elapsed)}s`);
  if (gameState === 'lost') drawOverlay('LOST YOUR MIND...', `You survived ${Math.floor(elapsed)}s`);

  requestAnimationFrame(loop);
}

// wait for first keypress — fixes AudioContext autoplay block
gameState = 'waiting';
document.addEventListener('keydown', function startGame() {
  document.removeEventListener('keydown', startGame);
  init();
  requestAnimationFrame(loop);
}, { once: true });

// start screen
requestAnimationFrame(function drawStart(ts) {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 38px monospace';
  ctx.fillText('👻 GHOST ESCAPE', CANVAS_W / 2, CANVAS_H / 2 - 50);
  ctx.fillStyle = '#888';
  ctx.font = '15px monospace';
  ctx.fillText('Navigate the haunted mansion and find the exit', CANVAS_W / 2, CANVAS_H / 2 - 10);
  ctx.fillStyle = '#555';
  ctx.font = '13px monospace';
  ctx.fillText('WASD — move    SPACE — use item    Q — switch item    M — minimap', CANVAS_W / 2, CANVAS_H / 2 + 25);
  ctx.fillStyle = '#333';
  ctx.font = '12px monospace';
  ctx.fillText('Press any key to begin...', CANVAS_W / 2, CANVAS_H / 2 + 60);

  // flicker effect on prompt
  const flicker = 0.5 + 0.5 * Math.sin(ts * 0.003);
  ctx.fillStyle = `rgba(255,255,255,${flicker * 0.4})`;
  ctx.fillText('Press any key to begin...', CANVAS_W / 2, CANVAS_H / 2 + 60);

  if (gameState === 'waiting') requestAnimationFrame(drawStart);
});