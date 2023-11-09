let player, floor, ground, bound, platform, coin, npc;
let npcText = 'My coins!!';
let coinCount = 18

function setup() {
  createCanvas(600, 600);
  background('lightblue');
  world.gravity.y = 10;

  
  floor = createSprite(300, 550, 600, 100);
  floor.color = 'lightgreen';
  floor.collider = 'static';
  
  ground = createSprite(300, 566, 600, 66);
  ground.color = 'tan';
  ground.collider = 'static';
  
  bound = new Group();
  let boundsPositions = [
    { x: 300, y: 0, w: 600, h: 5 },
    { x: 300, y: 600, w: 600, h: 5 },
    { x: 0, y: 300, w: 5, h: 600 },
    { x: 600, y: 300, w: 5, h: 600 }
  ];

  for (let pos of boundsPositions) {
    let bound = createSprite(pos.x, pos.y, pos.w, pos.h);
    bound.color = 'black';
    bound.collider = 'static';
  }
  
  platforms = new Group();
  let platformPosition = [
    { x: 150, y: 425, w: 150, h: 10 },
    { x: 450, y: 375, w: 180, h: 10 },
    { x: 140, y: 320, w: 150, h: 10 },
    { x: 360, y: 240, w: 150, h: 10 },
    { x: 160, y: 170, w: 150, h: 10 },
    { x: 400, y: 100, w: 250, h: 10 },
  ];
  
  coins = new Group();
  
  for (let pos of platformPosition) {
    let platform = createSprite(pos.x, pos.y, pos.w, pos.h);
    platform.color = 'tan';
    platform.stroke = 'brown';
    platform.collider = 'static';
    
    
    for (let i = 0; i < 3; i++) {
      coin = createSprite(
        pos.x - pos.w / 4 + i * (pos.w / 4),
        pos.y - 20, 10, 10
      );
      
      coin.color = 'yellow';
      coin.stroke = 'goldenrod';
      coin.collider = 'none';
      coins.add(coin);
    }
  }
  
  player = new Sprite(300, 450, 30, 30);
  player.color = 'salmon';
  player.stroke = 'red';
  
  npc = new Sprite (500, 79, 30, 30);
  npc.color = 'darkturquoise';
  npc.stroke = 'teal';
  npc.collider = 'none';
}

function draw() {
  clear();
  playerInput();
  background('lightblue');
  player.overlap(coins, collect);
  
  fill('black');
  textFont('monospace');
  textAlign(CENTER, BOTTOM);
  textSize(14);
  text(npcText, npc.position.x, npc.position.y - npc.height / 2 - 10);
  player.overlap(npc, changeText);
}

function collect(player, coin) {
	coin.remove();
    coinCount--;
}

function playerInput(){
  if (kb.presses('W')) {
    player.bearing = -90;
    player.applyForce(400);
  }

  if (kb.pressing('A')) {
    player.velocity.x = -3;
    } 
  else if (kb.pressing('D')) {
    player.velocity.x = 3;
  }
}

function changeText(){
  if (coinCount > 0) {
    npcText = 'You missed ' + coinCount + ', you fool!';
  } else {
    npcText = 'Thank you!';
  }
}

