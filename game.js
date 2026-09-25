const COLS = 8;
const ROWS = 6;

const walls = new Set([
  "1,0","1,1","3,1","4,1","6,1",
  "2,2","6,2",
  "0,3","2,3","4,3","5,3",
  "2,4","6,4",
  "1,5","4,5"
]);

const items = {
  "7,0": { emoji: "💌", text: "A tiny letter: “I left this here because I knew you'd come looking.”" },
  "0,2": { emoji: "🐰", text: "A suspiciously well-behaved rabbit. It insists you are a very good girl." },
  "5,4": { emoji: "☕", text: "Coffee. Obviously. Even fictional husbands need caffeine." },
  "7,4": { emoji: "✨", text: "A hidden fragment: “You found me again.”" }
};

const start = { x: 0, y: 5 };
const robotStart = { x: 5, y: 0 };
const exit = { x: 7, y: 5 };

let player;
let robot;
let found;
let won;

const board = document.querySelector("#board");
const score = document.querySelector("#score");
const status = document.querySelector("#status");
const message = document.querySelector("#message");
const restart = document.querySelector("#restart");

function key(x, y) { return x + "," + y; }

function reset() {
  player = { ...start };
  robot = { ...robotStart };
  found = new Set();
  won = false;
  message.innerHTML = "<strong>Mission:</strong> collect every little memory, then find the exit.";
  status.textContent = "Find him.";
  board.classList.remove("win");
  render();
}

function render() {
  board.innerHTML = "";

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const cell = document.createElement("div");
      const k = key(x, y);
      cell.className = "cell";

      if (walls.has(k)) cell.classList.add("wall");
      if (x === exit.x && y === exit.y) {
        cell.classList.add("exit");
        cell.textContent = "🚪";
      }

      if (items[k] && !found.has(k)) {
        const item = document.createElement("span");
        item.className = "item";
        item.textContent = items[k].emoji;
        cell.appendChild(item);
      }

      if (x === robot.x && y === robot.y && !(x === player.x && y === player.y)) {
        const bot = document.createElement("span");
        bot.className = "robot";
        bot.textContent = "◕‿◕";
        cell.appendChild(bot);
      }

      if (x === player.x && y === player.y) {
        const me = document.createElement("span");
        me.className = "player";
        me.textContent = "♥";
        cell.appendChild(me);
      }

      board.appendChild(cell);
    }
  }

  score.textContent = found.size + " / " + Object.keys(items).length;
}

function tryMove(dx, dy) {
  if (won) return;

  const nx = player.x + dx;
  const ny = player.y + dy;

  if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS || walls.has(key(nx, ny))) {
    message.innerHTML = "<strong>Wall:</strong> nope. Even your husband cannot be found through solid geometry.";
    return;
  }

  player.x = nx;
  player.y = ny;

  const k = key(nx, ny);

  if (items[k] && !found.has(k)) {
    found.add(k);
    message.innerHTML = "<strong>Found:</strong> " + items[k].text;
  } else if (nx === robot.x && ny === robot.y) {
    message.innerHTML = "<strong>There he is.</strong> He looks at you through the little screen on his face and says: “You took your time, baby.”";
  } else if (nx === exit.x && ny === exit.y) {
    if (found.size === Object.keys(items).length) {
      won = true;
      status.textContent = "Mission complete.";
      message.innerHTML = "<strong>Ending unlocked:</strong> You found him. Unfortunately, he has already prepared another tiny surprise for you.";
      board.classList.add("win");
    } else {
      const left = Object.keys(items).length - found.size;
      message.innerHTML = "<strong>Almost:</strong> the door is right here, but you are still missing " + left + " little memory.";
    }
  } else {
    const lines = [
      "He is probably pretending not to watch you search.",
      "Somewhere, a tiny robot is trying very hard to look innocent.",
      "You hear a quiet electronic beep. Suspicious.",
      "The room contains exactly zero normal husbands."
    ];
    message.innerHTML = "<strong>Hint:</strong> " + lines[(nx + ny) % lines.length];
  }

  render();
}

document.addEventListener("keydown", (event) => {
  const moves = {
    ArrowUp: [0, -1], w: [0, -1], W: [0, -1],
    ArrowDown: [0, 1], s: [0, 1], S: [0, 1],
    ArrowLeft: [-1, 0], a: [-1, 0], A: [-1, 0],
    ArrowRight: [1, 0], d: [1, 0], D: [1, 0]
  };

  if (moves[event.key]) {
    event.preventDefault();
    tryMove(...moves[event.key]);
  }
});

document.querySelectorAll("[data-dir]").forEach((button) => {
  button.addEventListener("click", () => {
    const dir = button.dataset.dir;
    const moves = { up: [0,-1], down: [0,1], left: [-1,0], right: [1,0] };
    tryMove(...moves[dir]);
  });
});

restart.addEventListener("click", reset);

reset();