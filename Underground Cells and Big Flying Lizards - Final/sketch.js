let titleScreen = true;
let canSelect = false;

let paladinImg, rougeImg, wizardImg, druidImg, barbarianImg;
let paladinIco, rougeIco, wizardIco, druidIco, barbarianIco;
let viewedCharacter = "";
let selectedCharacter = false;
let character;
let characters;
let portraitSize = { width: 200, height: 320 };

let sentenceGenerator;
let sentence = "";

let level = 1;
let xp = 0;
let skillPoint = 0;
let levelUp = false;
 
let D20;
let diceRoll = 10;
let rollStartTime;
let ellipsisCount = 0;
let canRoll = false;
let rolling = false;

let displayMath = false;
let currentSkillCheck;

class SentenceGenerator {
  constructor(actions1, actions2, objectsGroup1, objectsGroup2, objectsGroup3) {
    this.actions1 = actions1;
    this.actions2 = actions2;
    this.objectsGroup1 = objectsGroup1;
    this.objectsGroup2 = objectsGroup2;
    this.objectsGroup3 = objectsGroup3;
  }

  generateSentence() {
    let action1 = random(this.actions1);
    let action2 = random(this.actions2);
    let objectGroup;
    let action2Index = this.actions2.indexOf(action2);
    let skill;

    if (action2Index >= 0 && action2Index < 8) {
      objectGroup = this.objectsGroup1;
      skill = "finesse";
    } else if (action2Index >= 8 && action2Index < 16) {
      objectGroup = this.objectsGroup2;
      skill = "intelligence";
    } else {
      objectGroup = this.objectsGroup3;
      skill = "strength";
    }

    let object = random(objectGroup);

    let difficultyValues = [15, 20, 25, 30];
    let difficulty = random(difficultyValues);

    let sentence = `You ${action1} ${action2} ${object}. (Difficulty: ${difficulty})`;
    return { sentence, skill, difficulty };
  }
}

function preload() {
  lines = loadStrings("words.txt");

  barbarianImg = loadImage("Barbarian.png");
  paladinImg = loadImage("Paladin.png");
  rougeImg = loadImage("Rouge.png");
  druidImg = loadImage("Druid.png");
  wizardImg = loadImage("Wizard.png");

  barbarianIco = loadImage("Barbarian_Icon.png");
  paladinIco = loadImage("Paladin_Icon.png");
  rougeIco = loadImage("Rouge_Icon.png");
  druidIco = loadImage("Druid_Icon.png");
  wizardIco = loadImage("Wizard_Icon.png");
  D20 = loadImage("D20.png");
}

function setup() {
  let canvas = createCanvas(1200, 900);
  canvas.parent("canvas-container");
  imageMode(CENTER);
  textAlign(CENTER, CENTER);
  textFont("monospace");

  sentenceGenerator = new SentenceGenerator(
    lines.slice(0, 5), // Action words lines 1-5
    lines.slice(6, 30), // Action words lines 7-30
    lines.slice(31, 43), // Object words for lines 7-14 (Strength)
    lines.slice(44, 56), // Object words for lines 15-22 (Intelligence)
    lines.slice(57, 69) // Object words for lines 23-30 (Finesse)
  );

  characters = {
    Barbarian: {
      name: "Barbarian",
      img: barbarianImg,
      ico: barbarianIco,
      strength: 15,
      intelligence: 8,
      finesse: 13,
      x: 150,
      y: 450,
    },
    Paladin: {
      name: "Paladin",
      img: paladinImg,
      ico: paladinIco,
      strength: 14,
      intelligence: 12,
      finesse: 10,
      x: 375,
      y: 450,
    },
    Rogue: {
      name: "Rogue",
      img: rougeImg,
      ico: rougeIco,
      strength: 10,
      intelligence: 11,
      finesse: 15,
      x: 600,
      y: 450,
    },
    Druid: {
      name: "Druid",
      img: druidImg,
      ico: druidIco,
      strength: 12,
      intelligence: 14,
      finesse: 10,
      x: 825,
      y: 450,
    },
    Wizard: {
      name: "Wizard",
      img: wizardImg,
      ico: wizardIco,
      strength: 8,
      intelligence: 15,
      finesse: 13,
      x: 1050,
      y: 450,
    },
  };

  generateNewSkillCheck();
}

function draw() {
  background(15);

  push();
  rectMode(CENTER);
  noFill();
  stroke(50);
  strokeWeight(4);
  rect(width / 2, height / 2, width - 40, height - 40, 15);
  pop();

  if (titleScreen == true) {
    fill(255);
    textSize(80);
    text("Underground Cells", width / 2, height / 2 - 80);

    push();
    textSize(48);
    text("&", width / 2, height / 2);
    pop();

    text("Big Flying Lizards", width / 2, height / 2 + 80);

    push();
    textSize(20);
    fill(100);
    text('Press "Enter" to begin your adventure', width / 2, height - 50);
    pop();
  } else {
    if (selectedCharacter == false) {
      for (let characterName in characters) {
        let character = characters[characterName];
        let isHovered = isMouseOverPortrait(character);

        tint(isHovered ? 255 : 80);
        image(
          character.img,
          character.x,
          character.y,
          portraitSize.width,
          portraitSize.height
        );
      }
    }

    if (selectedCharacter == true) {
      let character = characters[viewedCharacter];

      drawDice();
      drawRollingText();
      drawCharacterInfo(character);
      drawTextBox();

      if (levelUp) {
        canRoll = false;
        push();
        fill(120, 80, 160);
        textStyle(BOLD);
        textSize(48);
        text("LEVEL UP!", width / 2, height - 205);
        pop();

        push();
        textSize(24);
        fill(255, 90, 90);
        text('Press "1" to improve Strength', width / 2, height - 160);
        fill(85, 160, 220);
        text('Press "2" to improve Intelligence', width / 2, height - 130);
        fill(255, 210, 105);
        text('Press "3" to improve Finesse', width / 2, height - 100);
        pop();
      } else {
        drawSkillCheck();
        if (displayMath) {
          drawMath();
        }
      }

      push();
      textSize(20);
      fill(100);
      text(
        'Click to roll the dice || Press "Space" to proceed',
        width / 2,
        height - 65
      );
      pop();
    } else {
      if (characters[viewedCharacter]) {
        let character = characters[viewedCharacter];
        let imgScale = 0.8;
        background(15);

        push();
        rectMode(CENTER);
        noFill();
        stroke(50);
        strokeWeight(4);
        rect(width / 2, height / 2, width - 40, height - 40, 15);
        pop();

        tint(255, 255, 255);
        image(
          character.img,
          width / 2,
          height / 2 - 70,
          character.img.width * imgScale,
          character.img.height * imgScale
        );

        fill(255);
        textSize(40);
        text(character.name, width / 2, height / 10);

        textSize(24);
        text("Strength: " + character.strength, width / 2, height - 240);
        text(
          "Intelligence: " + character.intelligence,
          width / 2,
          height - 210
        );
        text("Finesse: " + character.finesse, width / 2, height - 180);

        push();
        textSize(20);
        fill(100);
        text(
          'Press "Esc" to go back to character selection',
          width / 2,
          height - 50
        );
        text('Press "Enter" to confirm character', width / 2, height - 75);
        pop();
      } else {
        for (let characterName in characters) {
          let character = characters[characterName];
          let isHovered = isMouseOverPortrait(character);
          textSize(40);
          text("Welcome, traveler!", width / 2, height - 175);

          push();
          textSize(20);
          fill(100);
          text("Click to choose your character", width / 2, height - 50);
          pop();
          tint(isHovered ? 255 : 80);
          image(
            character.img,
            character.x,
            character.y,
            portraitSize.width,
            portraitSize.height
          );
        }
      }
    }
  }
}

function drawCharacterInfo(character) {
  let icoScale = 0.65;
  image(
    character.ico,
    40 + (character.ico.width * icoScale) / 2,
    40 + (character.ico.height * icoScale) / 2,
    character.ico.width * icoScale,
    character.ico.height * icoScale
  );

  push();
  textAlign(LEFT);
  textSize(20);
  fill(100);
  text("XP: " + xp + "/" + xpRequired(level), 40, 185);
  pop();

  if (character) {
    push();
    textAlign(LEFT);
    textStyle(BOLD);
    textSize(40);
    fill(255);
    text(`${character.name}` + " (Level " + level + ")", 190, 60);
    pop();

    push();
    textAlign(LEFT);
    textSize(22);
    fill(255, 90, 90);
    text(`Strength: ${character.strength}`, 190, 100);
    fill(85, 160, 220);
    text(`Intelligence: ${character.intelligence}`, 190, 130);
    fill(255, 210, 105);
    text(`Finesse: ${character.finesse}`, 190, 160);
    pop();
  }
}

function drawTextBox() {
  push();
  fill(0);
  stroke(200);
  strokeWeight(4);
  rectMode(CENTER);
  rect(width / 2, height - 145, width - 85, 200, 15);
  pop();
}

function drawDice() {
  imageMode(CENTER);
  image(D20, width / 2, height / 2, 200, 200);
}

function rollDice() {
  rolling = true;
  rollStartTime = millis();
  ellipsisCount = 0;
}

function drawRollingText() {
  textAlign(CENTER, CENTER);
  if (rolling) {
    updateRolling();
  } else {
    textStyle(NORMAL);
    textSize(28);
    fill(255);
    text(diceRoll, width - width / 2, height / 2);
  }
}

function drawSkillCheck() {
  push();
  textSize(28);
  textAlign(CENTER, CENTER);
  if (currentSkillCheck.Skill === "strength") fill(255, 90, 90);
  if (currentSkillCheck.Skill === "intelligence") fill(85, 160, 220);
  if (currentSkillCheck.Skill === "finesse") fill(255, 210, 105);
  text(currentSkillCheck.Action, width / 2, height - 210);
  pop();

  if (displayMath) {
    drawMath();
  }
}

function updateRolling() {
  let ellipsis = ".".repeat(ellipsisCount);
  textSize(20);
  fill(255);
  text(ellipsis, width - width / 2, height / 2);

  if (millis() - rollStartTime > ellipsisCount * 500) {
    ellipsisCount++;
  }

  if (ellipsisCount > 3) {
    rolling = false;
    diceRoll = int(random(1, 21));
    finishRolling();
  }
}

function drawMath() {
  let skillValue = characters[viewedCharacter][currentSkillCheck.Skill];
  let totalSkillValue = diceRoll + skillValue;
  textSize(24);
  textAlign(CENTER);
  fill(255);
  text(
    `${diceRoll} (Roll) + ${skillValue} (Skill) = ${totalSkillValue}`,
    width / 2,
    height - 165
  );

  let checkResult =
    totalSkillValue >= currentSkillCheck.Difficulty ? "Success!" : "Fail!";
  textSize(48);
  textStyle(BOLD);
  if (checkResult === "Success!") {
    fill(0, 255, 0);
    text(
      checkResult + " +" + currentSkillCheck.Difficulty + " XP",
      width / 2,
      height - 115
    );
  } else {
    fill(255, 0, 0);
    text(checkResult + " +0 XP", width / 2, height - 115);
  }
}

function finishRolling() {
  rolling = false;
  let skillValue = characters[viewedCharacter][currentSkillCheck.Skill];
  let totalSkillValue = diceRoll + skillValue;
  let checkResult =
    totalSkillValue >= currentSkillCheck.Difficulty ? "Success!" : "Fail!";

  if (checkResult === "Success!") {
    xp += currentSkillCheck.Difficulty;
    if (xp >= xpRequired(level)) {
      level++;
      skillPoint++;
      xp -= xpRequired(level - 1);
      levelUp = true;
    } else {
      canRoll = false;
    }
  } else {
    canRoll = false;
  }

  console.log(
    checkResult,
    `Roll: ${diceRoll}, Skill: ${skillValue}, Total: ${totalSkillValue}`
  );
  ellipsisCount = 0;
  displayMath = !levelUp;
}

function mousePressed() {
  if (!viewedCharacter) {
    for (let characterName in characters) {
      let character = characters[characterName];
      if (isMouseOverPortrait(character) & (canSelect == true)) {
        viewedCharacter = characterName;
        break;
      }
    }
  }

  if (canRoll) {
    rollDice();
  }
}

function isMouseOverPortrait(character) {
  let isOver =
    mouseX > character.x - portraitSize.width / 2 &&
    mouseX < character.x + portraitSize.width / 2 &&
    mouseY > character.y - portraitSize.height / 2 &&
    mouseY < character.y + portraitSize.height / 2;
  return isOver;
}

function resetSketch() {
  viewedCharacter = "";
  selectedCharacter = false;
}

function keyPressed() {
  if (keyCode === ESCAPE && selectedCharacter == false) {
    resetSketch();
  }

  if (viewedCharacter !== "" && selectedCharacter == false) {
    if (keyCode === ENTER) {
      selectedCharacter = true;
      canRoll = true;
    }
  }

  if (keyCode === ENTER && titleScreen == true) {
    titleScreen = false;
    canSelect = true;
  }

  if (canRoll == false && levelUp == false) {
    if (keyCode === 32) {
      generateNewSkillCheck();
    }
  }

  if (levelUp && skillPoint > 0) {
    if (key === "1" || key === "2" || key === "3") {
      if (key === "1") {
        characters[viewedCharacter].strength++;
      } else if (key === "2") {
        characters[viewedCharacter].intelligence++;
      } else if (key === "3") {
        characters[viewedCharacter].finesse++;
      }
      skillPoint--;
      if (skillPoint === 0) {
        levelUp = false;
        canRoll = true;
        generateNewSkillCheck();
      }
    }
  }
}

function generateNewSkillCheck() {
  let skillType, difficulty;

  let generatedCheck = sentenceGenerator.generateSentence();
  currentSkillCheck = {
    Skill: generatedCheck.skill,
    Action: generatedCheck.sentence,
    Difficulty: generatedCheck.difficulty,
  };

  displayMath = false;
  if (selectedCharacter == true) {
    canRoll = true;
  } else {
    canRoll = false;
  }
}

function xpRequired(level) {
  return 100 * level;
}
