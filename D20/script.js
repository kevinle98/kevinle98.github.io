let D20;
let num = 10;
let rollStartTime;
let ellipsisCount = 0;
let lastUpdateTime = 0;
let canRoll = true;
let rolling = false;
let crit = false;
let displayMath = false;
let currentClassIndex = 0;

let classes = [
    {
        name: 'Mage',
        Strength: 5,
        Intelligence: 15,
        Finesse: 10
    },
    {
        name: 'Paladin',
        Strength: 15,
        Intelligence: 10,
        Finesse: 5
    },
    {
        name: 'Rogue',
        Strength: 10,
        Intelligence: 5,
        Finesse: 15
    }
];

let skillCheck = [
    {
        Skill: 'Intelligence',
        Action: 'Recall a potion recipe (15)',
        Difficulty: 15,
    },
    {
        Skill: 'Strength',
        Action: 'Break down a door (15)',
        Difficulty: 15,
    },
    {
        Skill: 'Finesse',
        Action: 'Pick a lock (15)',
        Difficulty: 15,
    },
    {
        Skill: 'Intelligence',
        Action: 'Identify a religious artifact (20)',
        Difficulty: 20,
    },
    {
        Skill: 'Strength',
        Action: 'Jump over a ravine (20)',
        Difficulty: 20,
    },
    {
        Skill: 'Finesse',
        Action: 'Sneak past a guard (20)',
        Difficulty: 20,
    },

    {
        Skill: 'Intelligence',
        Action: 'Decipher an ancient rune (25)',
        Difficulty: 25,
    },
    {
        Skill: 'Strength',
        Action: 'Smash a giant boulder (25)',
        Difficulty: 25,
    },
    {
        Skill: 'Finesse',
        Action: 'Persuade a city official (25)',
        Difficulty: 25,
    },
]
let currentClass = classes[0];
let currentSkillCheck
let lastSkillCheckIndex = -1;

function preload() {
    D20 = loadImage('D20.png');
}

function setup() {
    createCanvas(800, 800);
    textFont('monospace');
    generateNewSkillCheck();
}

function draw() {
    background(24);
    drawDice();
    drawRollingText();
    drawClassInfo();
    drawTextBox();
    drawCrit();
}

function drawDice() {
    imageMode(CENTER);
    image(D20, width / 2, height /2, width / 4, height / 4);
}

function drawRollingText() {
    textAlign(CENTER, CENTER);

    if (rolling) {
        updateRolling();
    } else {
        textStyle(NORMAL)
        textSize(28);
        fill(255);
        text(num, width - (width / 2), height / 2);
    }
}

function updateRolling() {
    let ellipsis = '.'.repeat(ellipsisCount);

    textSize(20);
    fill(255);
    text(ellipsis, width - (width / 2), height / 2);
    if (millis() - rollStartTime > ellipsisCount * 500) {
        ellipsisCount++;
    }
    if (ellipsisCount > 3) {
        num = int(random(1, 21));
        crit = (num === 20);
        finishRolling();
    }
}

function finishRolling() {
    rolling = false;

    let skillValue = currentClass[currentSkillCheck.Skill];
    let totalSkillValue = num + skillValue;
    let checkResult = totalSkillValue >= currentSkillCheck.Difficulty ? "Success!" : "Fail!";
    console.log(checkResult, `Roll: ${num}, Skill: ${skillValue}, Total: ${totalSkillValue}`);
    ellipsisCount = 0;
    canRoll = false;
    displayMath = true;
}

function drawClassInfo() {
    push();
    textSize(24);
    //textStyle(BOLD);
    textAlign(LEFT);
    fill(255);
    text(`Class: ${currentClass.name}`, 25, 35);
    fill(255, 90, 90);
    text(`Strength: ${currentClass.Strength}`, 25, 70);
    fill(85, 160, 220);
    text(`Intelligence: ${currentClass.Intelligence}`, 25, 105);
    fill(255, 210, 105);
    text(`Finesse: ${currentClass.Finesse}`, 25, 140);
    pop();
}

function drawTextBox() {
    push();
    fill(0);
    stroke(255);
    strokeWeight(4);
    rectMode(CENTER);
    rect((width / 2), height - 100, 750, 140, 20);
    pop();
}

function drawCrit() {
    if (crit) {
        let xOffset = random(-5, 5);
        let yOffset = random(-5, 5);


        fill(255);
        textStyle(BOLD);
        textSize(48);
        textAlign(CENTER, CENTER);
        fill(0, 255, 0);
        text("CRITICAL ROLL!!", (width / 2) + xOffset, (height - 100) + yOffset);
    } else {
        drawSkillCheck();
    }
}

function drawSkillCheck() {
    push();
    textSize(28);
    textAlign(CENTER, CENTER);
    if (currentSkillCheck.Skill === 'Strength') fill(255, 90, 90);
    if (currentSkillCheck.Skill === 'Intelligence') fill(85, 160, 220);
    if (currentSkillCheck.Skill === 'Finesse') fill(255, 210, 105);
    text(currentSkillCheck.Action, width / 2, height - 140);
    pop();

    if (displayMath) {
        drawMath();
    }
}

function drawMath() {
    let skillValue = currentClass[currentSkillCheck.Skill];
    let totalSkillValue = num + skillValue;
    textSize(24);
    fill(255);
    text(`${num} (Roll) + ${skillValue} (Skill) = ${totalSkillValue}`, width / 2, height - 100);
    let checkResult = totalSkillValue >= currentSkillCheck.Difficulty ? "Success!" : "Fail!";
    textSize(40);
    textStyle(BOLD);
    if (checkResult === "Success!") {
        fill(0, 255, 0);
    } else {
        fill(255, 0, 0);
    }
    text(checkResult, width / 2, height - 60);
}

function mousePressed() {
    if (canRoll) {
        rollDice();
    }
}

function rollDice() {
    rolling = true;
    rollStartTime = millis();
    ellipsisCount = 0;
}

function keyPressed() {
    if (canRoll) {
        if (key === '1') {
            currentClass = classes[0];
        }
        if (key === '2') {
            currentClass = classes[1];
        }
        if (key === '3') {
            currentClass = classes[2];
        }
    }

    if (!canRoll) {
        if (key === ' ') {
            generateNewSkillCheck();
        }
    }
}

function generateNewSkillCheck() {
    let skillCheckIndex;
    do {
        skillCheckIndex = int(random(0, skillCheck.length));
    } while (skillCheckIndex === lastSkillCheckIndex);
    lastSkillCheckIndex = skillCheckIndex;

    currentSkillCheck = skillCheck[skillCheckIndex];
    displayMath = false;
    canRoll = true;
    crit = false;
}