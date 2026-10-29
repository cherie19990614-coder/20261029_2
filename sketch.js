// ==========================================
// 專案名稱：《兒歌主題小達人》— 音樂旋律扭蛋機 (RWD + 經典兒歌 + 選項隨機打亂 + 答題計時器)
// ==========================================

let gameState = "START"; // "START", "QUIZ", "RESULT"
let currentQ = 0;
let score = 0;
let selectedOption = null;
let isAnswered = false;
let feedbackMessage = "";
let audioCtx = null;
let audioUnlocked = false;

// ⏱️ 計時器相關變數
let timeLeft = 15;      // 每題 15 秒
let timerInterval = null; // 計時器物件

// 專案基準設計尺寸 (依據裝置動態切換)
let baseWidth = 1280;
let baseHeight = 800;
let isMobile = false;

// 8 道原始題目庫
let rawQuestions = [
  {
    title: "第 1 題：動物跳躍旋律",
    question: "聽到這段短促有彈性的音效，最適合搭配哪種動物兒歌主題？",
    cardType: "rabbit",
    soundType: "rabbit_jump",
    options: ["① 大象緩慢走路", "② 小白兔蹦蹦跳", "③ 小魚在水裡游", "④ 老鷹在天空飛"],
    originalAnswer: 1, // 原本正確答案的文字是 "② 小白兔蹦蹦跳"
    explanation: "聲音短促又有彈性（跳音 Staccato），非常適合表現小白兔活潑跳躍的情境！",
    target: "旋律辨識"
  },
  {
    title: "第 2 題：音樂速度變化",
    question: "聽聽看這段兒歌前奏，音樂速度發生了什麼變化？",
    cardType: "running",
    soundType: "speed_up",
    options: ["① 音量越來越小", "② 完全沒有變化", "③ 速度越來越快", "④ 速度越來越慢"],
    originalAnswer: 2,
    explanation: "音樂節奏由慢逐漸變快（Accelerando），常用在表現遊戲冒險準備衝刺的情境。",
    target: "旋律辨識"
  },
  {
    title: "第 3 題：情感氛圍感受",
    question: "觀察畫面的視覺波浪，最適合哪種兒歌主題的氣氛？",
    cardType: "lullaby",
    soundType: "lullaby_wave",
    options: ["① 搖籃曲（平靜安詳）", "② 進行曲（熱鬧歡快）", "③ 萬聖節歌曲（恐怖怪異）", "④ 運動會衝刺歌曲"],
    originalAnswer: 0,
    explanation: "平緩圓滑的波浪線條，給人寧靜、柔和與放鬆的感受，最適合抒情睡前搖籃曲。",
    target: "情感氛圍"
  },
  {
    title: "第 4 題：生活情境連結",
    question: "聽這段帶有點神祕感低沉的旋律，最像哪種兒歌節慶主題？",
    cardType: "halloween",
    soundType: "mystery",
    options: ["① 新年恭喜發財", "② 萬聖節探索派對", "③ 兒童節歡樂遊行", "④ 母親節溫馨感恩"],
    originalAnswer: 1,
    explanation: "低沉且帶有小調氛圍的旋律，最常用來營造神奇、冒險或萬聖節探索的氛圍！",
    target: "生活情境"
  },
  {
    title: "第 5 題：樂曲奏法辨識",
    question: "聽這段滑順連貫的聲音，這是「連音（Legato）」還是「跳音（Staccato）」？",
    cardType: "water",
    soundType: "legato",
    options: ["① 非常刺耳的雜音", "② 強烈打擊的鼓聲", "③ 短促跳躍的跳音", "④ 圓滑連貫的連音"],
    originalAnswer: 3,
    explanation: "音符與音符之間完全連在一起沒有間斷，聽起來很平滑，這就叫作 \"連音\"。",
    target: "旋律辨識"
  },
  {
    title: "第 6 題：天氣情境辨識",
    question: "聽聽這段清脆叮咚的不規則聲音，最像是哪種天氣兒歌的主題？",
    cardType: "rain",
    soundType: "rain_drops",
    options: ["① 下雨天小雨滴打在窗戶上", "② 大太陽晴空萬里", "③ 刮大風樹葉飄落", "④ 下大雪鋪滿大地"],
    originalAnswer: 0,
    explanation: "清脆且隨機的高音叮咚聲，就像小雨滴落在屋簷或窗戶上的兒歌聲響！",
    target: "生活情境"
  },
  {
    title: "第 7 題：律動節拍感受",
    question: "畫面上圖案規律「強—弱、強—弱」跳動，屬於哪一種兒歌律動節拍？",
    cardType: "march",
    soundType: "march_beat",
    options: ["① 三拍子（華爾滋圓舞曲）", "② 二拍子（進行曲/跑步）", "③ 自由無節拍", "④ 完全靜止"],
    originalAnswer: 1,
    explanation: "一強一弱規律的節奏跳動，最適合用在木頭人遊戲或踏步進行曲。",
    target: "情感氛圍"
  },
  {
    title: "第 8 題：過關慶祝旋律",
    question: "聽這段明亮歡快的階梯爬升旋律，適合用在遊戲兒歌的什麼時刻？",
    cardType: "victory",
    soundType: "victory_tune",
    options: ["① 遊戲失敗重新開始", "② 角色的等待時間", "③ 無聊的休息時間", "④ 挑戰成功勝利過關"],
    originalAnswer: 3,
    explanation: "明亮上升的和諧階梯音色，最適合表現開心慶祝、順利破關的歡樂勝利時刻！",
    target: "生活情境"
  }
];

// 經過隨機打亂後的題目陣列
let questions = [];

function setup() {
  if (windowWidth < 768 || windowHeight > windowWidth) {
    isMobile = true;
    baseWidth = 390;
    baseHeight = 800;
  } else {
    isMobile = false;
    baseWidth = 1280;
    baseHeight = 800;
  }

  let cnv = createCanvas(windowWidth, windowHeight);
  cnv.parent(document.body);
  textAlign(CENTER, CENTER);
  rectMode(CORNER);
}

function windowResized() {
  if (windowWidth < 768 || windowHeight > windowWidth) {
    isMobile = true;
    baseWidth = 390;
    baseHeight = 800;
  } else {
    isMobile = false;
    baseWidth = 1280;
    baseHeight = 800;
  }
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background(248, 250, 252);

  let scaleX = width / baseWidth;
  let scaleY = height / baseHeight;
  let currentScale = min(scaleX, scaleY);

  push();
  translate((width - baseWidth * currentScale) / 2, (height - baseHeight * currentScale) / 2);
  scale(currentScale);

  if (isMobile) {
    drawMobileLayout();
  } else {
    drawDesktopLayout();
  }

  pop();
}

function drawDesktopLayout() {
  if (gameState === "START") {
    drawStartScreenDesktop();
  } else if (gameState === "QUIZ") {
    drawQuizScreenDesktop();
  } else if (gameState === "RESULT") {
    drawResultScreenDesktop();
  }
}

function drawMobileLayout() {
  if (gameState === "START") {
    drawStartScreenMobile();
  } else if (gameState === "QUIZ") {
    drawQuizScreenMobile();
  } else if (gameState === "RESULT") {
    drawResultScreenMobile();
  }
}

function drawStartScreenDesktop() {
  fill(30, 41, 59);
  textSize(42);
  textStyle(BOLD);
  text("🎵 兒歌主題小達人", baseWidth / 2, 95);
  textSize(24);
  fill(79, 70, 229);
  text("～音樂旋律扭蛋機～", baseWidth / 2, 150);

  stroke(226, 232, 240);
  fill(255);
  rect(140, 210, 480, 340, 20);
  noStroke();
  fill(99, 102, 241, 150);
  let waveTime = millis() / 300;
  for (let i = 0; i < 22; i++) {
    let h = sin(waveTime + i * 0.35) * 65 + 75;
    rect(180 + i * 19, 410 - h, 12, h * 2, 6);
  }
  fill(100);
  textSize(18);
  text("✨ 動態音波視覺預覽 ✨", 380, 505);

  fill(241, 245, 249);
  rect(660, 210, 480, 340, 20);
  fill(15, 23, 42);
  textSize(22);
  textStyle(BOLD);
  textAlign(LEFT, CENTER);
  text("🎯 本次冒險學習目標：", 700, 265);
  textStyle(NORMAL);
  textSize(18);
  text("• 辨識旋律特徵與要素（跳音 / 連音 / 速度）", 700, 335);
  text("• 連結生活情境主題（動物 / 天氣 / 節慶）", 700, 405);
  text("• 說明情感氛圍律動（歡樂 / 平靜 / 神祕）", 700, 475);
  textAlign(CENTER, CENTER);

  fill(79, 70, 229);
  rect(baseWidth / 2 - 200, 610, 400, 75, 36);
  fill(255);
  textSize(24);
  textStyle(BOLD);
  text("🎵 開始音樂扭蛋旅程", baseWidth / 2, 648);

  if (!audioUnlocked) {
    textSize(14);
    fill(239, 68, 68);
    text("💡 首次點擊按鈕將自動解鎖音訊播放", baseWidth / 2, 720);
  }
}

function drawStartScreenMobile() {
  fill(30, 41, 59);
  textSize(30);
  textStyle(BOLD);
  text("🎵 兒歌主題小達人", baseWidth / 2, 60);
  textSize(18);
  fill(79, 70, 229);
  text("～音樂旋律扭蛋機～", baseWidth / 2, 100);

  stroke(226, 232, 240);
  fill(255);
  rect(25, 130, 340, 160, 16);
  noStroke();
  fill(99, 102, 241, 150);
  let waveTime = millis() / 300;
  for (let i = 0; i < 12; i++) {
    let h = sin(waveTime + i * 0.4) * 30 + 40;
    rect(55 + i * 23, 220 - h, 10, h * 2, 4);
  }
  fill(100);
  textSize(14);
  text("✨ 動態音波視覺預覽 ✨", baseWidth / 2, 265);

  fill(241, 245, 249);
  rect(25, 310, 340, 210, 16);
  fill(15, 23, 42);
  textSize(16);
  textStyle(BOLD);
  textAlign(LEFT, CENTER);
  text("🎯 本次冒險學習目標：", 45, 345);
  textStyle(NORMAL);
  textSize(13);
  text("• 辨識旋律特徵與要素（跳音/連音）", 45, 390);
  text("• 連結生活情境主題（動物/天氣）", 45, 435);
  text("• 說明情感氛圍律動（歡樂/平靜）", 45, 480);
  textAlign(CENTER, CENTER);

  fill(79, 70, 229);
  rect(35, 570, 320, 65, 30);
  fill(255);
  textSize(20);
  textStyle(BOLD);
  text("🎵 開始音樂扭蛋旅程", baseWidth / 2, 603);

  if (!audioUnlocked) {
    textSize(12);
    fill(239, 68, 68);
    text("💡 點擊按鈕自動解鎖聲音", baseWidth / 2, 665);
  }
}

function drawQuizScreenDesktop() {
  let q = questions[currentQ];

  fill(30, 41, 59);
  textSize(22);
  textStyle(BOLD);
  textAlign(LEFT, CENTER);
  text(`第 ${currentQ + 1} / ${questions.length} 題`, 80, 50);

  // 進度條
  stroke(226, 232, 240);
  fill(226, 232, 240);
  rect(280, 42, 500, 14, 7);
  noStroke();
  fill(79, 70, 229);
  rect(280, 42, (500 / questions.length) * (currentQ + 1), 14, 7);

  // ⏱️ 顯示計時器與星星分數
  textAlign(RIGHT, CENTER);
  fill(239, 68, 68);
  text(`⏱️ ${timeLeft}s`, 1080, 50);
  fill(30, 41, 59);
  text(`🌟 ${score}`, 1200, 50);
  textAlign(CENTER, CENTER);

  stroke(203, 213, 225);
  fill(255);
  rect(80, 100, 520, 410, 20);
  noStroke();
  drawCardIllustration(340, 235, q.cardType);

  fill(59, 130, 246);
  rect(140, 390, 400, 46, 23);
  fill(255);
  textSize(17);
  textStyle(BOLD);
  text("🔊 點擊重聽經典兒歌旋律", 340, 413);

  fill(15, 23, 42);
  textSize(18);
  textStyle(BOLD);
  text(q.question, 340, 468);

  for (let i = 0; i < q.options.length; i++) {
    let btnY = 100 + i * 92;
    if (isAnswered) {
      if (i === q.answer) fill(34, 197, 94);
      else if (i === selectedOption) fill(239, 68, 68);
      else fill(241, 245, 249);
    } else {
      fill(255);
      stroke(203, 213, 225);
    }
    rect(640, btnY, 560, 74, 14);
    noStroke();
    fill(isAnswered && (i === q.answer || i === selectedOption) ? 255 : 51);
    textSize(20);
    textStyle(NORMAL);
    textAlign(LEFT, CENTER);
    text(q.options[i], 675, btnY + 37);
  }
  textAlign(CENTER, CENTER);

  if (isAnswered) {
    fill(238, 242, 255);
    stroke(199, 210, 254);
    rect(80, 530, 1120, 220, 16);
    noStroke();
    fill(30, 27, 75);
    textSize(20);
    textStyle(BOLD);
    text(feedbackMessage, baseWidth / 2, 575);
    textSize(18);
    textStyle(NORMAL);
    text(q.explanation, baseWidth / 2, 625);
    fill(79, 70, 229);
    rect(baseWidth / 2 - 120, 675, 240, 56, 28);
    fill(255);
    textSize(20);
    textStyle(BOLD);
    text("➔ 進入下一題", baseWidth / 2, 703);
  }
}

function drawQuizScreenMobile() {
  let q = questions[currentQ];

  fill(30, 41, 59);
  textSize(15);
  textStyle(BOLD);
  textAlign(LEFT, CENTER);
  text(`第 ${currentQ + 1} 題`, 20, 25);

  // 手機版計時器與星星
  fill(239, 68, 68);
  text(`⏱️ ${timeLeft}s`, 270, 25);
  fill(30, 41, 59);
  text(`🌟 ${score}`, 345, 25);

  stroke(226, 232, 240);
  fill(226, 232, 240);
  rect(20, 42, 350, 8, 4);
  noStroke();
  fill(79, 70, 229);
  rect(20, 42, (350 / questions.length) * (currentQ + 1), 8, 4);

  fill(15, 23, 42);
  textSize(13);
  textStyle(BOLD);
  text(q.question, baseWidth / 2, 78);

  fill(59, 130, 246);
  rect(65, 105, 260, 34, 17);
  fill(255);
  textSize(13);
  textStyle(BOLD);
  text("🔊 點擊重聽經典兒歌旋律", baseWidth / 2, 122);

  for (let i = 0; i < q.options.length; i++) {
    let btnY = 150 + i * 58;
    if (isAnswered) {
      if (i === q.answer) fill(34, 197, 94);
      else if (i === selectedOption) fill(239, 68, 68);
      else fill(241, 245, 249);
    } else {
      fill(255);
      stroke(203, 213, 225);
    }
    rect(20, btnY, 350, 48, 10);
    noStroke();
    fill(isAnswered && (i === q.answer || i === selectedOption) ? 255 : 51);
    textSize(13);
    textStyle(NORMAL);
    textAlign(LEFT, CENTER);
    text(q.options[i], 35, btnY + 24);
  }
  textAlign(CENTER, CENTER);

  if (isAnswered) {
    fill(238, 242, 255);
    stroke(199, 210, 254);
    rect(20, 395, 350, 350, 12);
    noStroke();

    fill(30, 27, 75);
    textSize(14);
    textStyle(BOLD);
    text(feedbackMessage, baseWidth / 2, 425);

    textSize(11);
    textStyle(NORMAL);
    text(q.explanation, baseWidth / 2, 530);

    fill(79, 70, 229);
    rect(baseWidth / 2 - 90, 675, 180, 45, 22);
    fill(255);
    textSize(15);
    textStyle(BOLD);
    text("➔ 進入下一題", baseWidth / 2, 697);
  }
}

function drawResultScreenDesktop() {
  fill(30, 41, 59);
  textSize(38);
  textStyle(BOLD);
  text("🍕 恭喜完成音樂冒險！", baseWidth / 2, 75);

  textSize(22);
  fill(79, 70, 229);
  text(`獲得音樂扭蛋星星總數：🌟 ${score} / ${questions.length}`, baseWidth / 2, 130);

  let pizzaX = 380;
  let pizzaY = 380;
  let pizzaR = 150;
  let angles = [PI * 1.0, PI * 0.6, PI * 0.4];
  let colors = [color(34, 197, 94), color(234, 179, 8), color(59, 130, 246)];
  let labels = ["🟢 旋律特徵 50%", "🟡 生活情境 30%", "🔵 情感氛圍 20%"];

  let lastAngle = 0;
  for (let i = 0; i < angles.length; i++) {
    fill(colors[i]);
    arc(pizzaX, pizzaY, pizzaR * 2, pizzaR * 2, lastAngle, lastAngle + angles[i]);
    lastAngle += angles[i];
  }

  textAlign(LEFT, CENTER);
  textSize(20);
  textStyle(BOLD);
  fill(30, 41, 59);
  text("📊 學習目標達成占比：", 680, 240);
  textStyle(NORMAL);
  for (let i = 0; i < labels.length; i++) {
    text(labels[i], 680, 295 + i * 45);
  }

  stroke(203, 213, 225);
  fill(254, 243, 199);
  rect(665, 455, 520, 130, 16);
  noStroke();
  fill(180, 83, 9);
  textSize(20);
  textStyle(BOLD);
  text("🎁 成功解鎖紀念徽章：", 695, 500);
  textSize(18);
  textStyle(NORMAL);
  text("【跳跳兔音樂大師紀念徽章】", 695, 545);

  textAlign(CENTER, CENTER);
  fill(79, 70, 229);
  rect(baseWidth / 2 - 175, 680, 350, 68, 34);
  fill(255);
  textSize(22);
  textStyle(BOLD);
  text("🏠 重新開始音樂扭蛋旅程", baseWidth / 2, 714);
}

function drawResultScreenMobile() {
  fill(30, 41, 59);
  textSize(26);
  textStyle(BOLD);
  text("🍕 恭喜完成音樂冒險！", baseWidth / 2, 50);

  textSize(16);
  fill(79, 70, 229);
  text(`獲得星星總數：🌟 ${score} / ${questions.length}`, baseWidth / 2, 90);

  let pizzaX = baseWidth / 2;
  let pizzaY = 210;
  let pizzaR = 85;
  let angles = [PI * 1.0, PI * 0.6, PI * 0.4];
  let colors = [color(34, 197, 94), color(234, 179, 8), color(59, 130, 246)];
  let lastAngle = 0;
  for (let i = 0; i < angles.length; i++) {
    fill(colors[i]);
    arc(pizzaX, pizzaY, pizzaR * 2, pizzaR * 2, lastAngle, lastAngle + angles[i]);
    lastAngle += angles[i];
  }

  textAlign(LEFT, CENTER);
  textSize(14);
  textStyle(BOLD);
  fill(30, 41, 59);
  text("📊 學習目標達成：", 45, 325);
  textStyle(NORMAL);
  let labels = ["🟢 旋律特徵 50%", "🟡 生活情境 30%", "🔵 情感氛圍 20%"];
  for (let i = 0; i < labels.length; i++) {
    text(labels[i], 45, 355 + i * 28);
  }

  stroke(203, 213, 225);
  fill(254, 243, 199);
  rect(25, 455, 340, 85, 12);
  noStroke();
  fill(180, 83, 9);
  textSize(15);
  textStyle(BOLD);
  text("🎁 解鎖紀念徽章：", 45, 480);
  textSize(14);
  textStyle(NORMAL);
  text("【跳跳兔音樂大師紀念徽章】", 45, 515);

  textAlign(CENTER, CENTER);
  fill(79, 70, 229);
  rect(35, 600, 320, 60, 28);
  fill(255);
  textSize(18);
  textStyle(BOLD);
  text("🏠 重新開始音樂扭蛋旅程", baseWidth / 2, 630);
}

function drawCardIllustration(cx, cy, type) {
  push();
  translate(cx, cy);
  let t = millis() / 400;

  if (type === "rabbit") {
    fill(254, 226, 226);
    ellipse(0, 25, 90, 54);
    let jumpY = sin(t * 4) * -15;
    ellipse(0, jumpY - 12, 54, 54);
    ellipse(-15, jumpY - 38, 14, 36);
    ellipse(15, jumpY - 38, 14, 36);
    fill(100);
    textSize(16);
    text("🐰 動物卡：跳跳兔旋律", 0, 85);
  } else if (type === "running") {
    fill(79, 70, 229);
    let runX = sin(t * 6) * 35;
    circle(runX, 0, 50);
    fill(100);
    textSize(16);
    text("🏃 人物卡：速度變快", 0, 85);
  } else if (type === "lullaby") {
    fill(254, 249, 195);
    circle(0, -15, 75);
    noFill();
    stroke(59, 130, 246);
    strokeWeight(4);
    beginShape();
    for (let x = -90; x <= 90; x += 5) {
      let y = sin(x * 0.08 + t * 2) * 15 + 35;
      vertex(x, y);
    }
    endShape();
    noStroke();
    fill(100);
    textSize(16);
    text("🌙 情境卡：平靜搖籃曲", 0, 85);
  } else {
    fill(186, 230, 253);
    for (let i = -2; i <= 2; i++) {
      let dropY = sin(t * 3 + i) * 22;
      ellipse(i * 35, dropY, 14, 24);
    }
    fill(100);
    textSize(16);
    text("🌧️ 自然卡：音效音樂體驗", 0, 85);
  }
  pop();
}

function mousePressed() {
  handleInteraction(mouseX, mouseY);
}

function touchStarted() {
  if (touches.length > 0) {
    handleInteraction(touches[0].x, touches[0].y);
  }
  return false;
}

function handleInteraction(rawX, rawY) {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().then(() => {
      audioUnlocked = true;
    });
  } else {
    audioUnlocked = true;
  }

  let scaleX = width / baseWidth;
  let scaleY = height / baseHeight;
  let currentScale = min(scaleX, scaleY);

  let offsetX = (width - baseWidth * currentScale) / 2;
  let offsetY = (height - baseHeight * currentScale) / 2;

  let x = (rawX - offsetX) / currentScale;
  let y = (rawY - offsetY) / currentScale;

  if (gameState === "START") {
    if (isMobile) {
      if (x > 35 && x < 355 && y > 570 && y < 635) {
        startGame();
      }
    } else {
      if (x > baseWidth / 2 - 200 && x < baseWidth / 2 + 200 && y > 610 && y < 685) {
        startGame();
      }
    }
  } else if (gameState === "QUIZ") {
    if (isMobile) {
      if (x > 65 && x < 325 && y > 105 && y < 141) {
        playQuestionSound(questions[currentQ].soundType);
        return;
      }

      if (!isAnswered) {
        for (let i = 0; i < 4; i++) {
          let btnY = 150 + i * 58;
          if (x > 20 && x < 370 && y > btnY && y < btnY + 48) {
            processAnswer(i);
          }
        }
      } else {
        if (x > baseWidth / 2 - 90 && x < baseWidth / 2 + 90 && y > 675 && y < 720) {
          nextQuestion();
        }
      }
    } else {
      if (x > 140 && x < 540 && y > 390 && y < 436) {
        playQuestionSound(questions[currentQ].soundType);
        return;
      }

      if (!isAnswered) {
        for (let i = 0; i < 4; i++) {
          let btnY = 100 + i * 92;
          if (x > 640 && x < 1200 && y > btnY && y < btnY + 74) {
            processAnswer(i);
          }
        }
      } else {
        if (x > baseWidth / 2 - 120 && x < baseWidth / 2 + 120 && y > 675 && y < 731) {
          nextQuestion();
        }
      }
    }
  } else if (gameState === "RESULT") {
    if (isMobile) {
      if (x > 35 && x < 355 && y > 600 && y < 660) {
        gameState = "START";
      }
    } else {
      if (x > baseWidth / 2 - 175 && x < baseWidth / 2 + 175 && y > 680 && y < 748) {
        gameState = "START";
      }
    }
  }
}

function startGame() {
  gameState = "QUIZ";
  currentQ = 0;
  score = 0;

  // 🎲 每次開始遊戲時，深層複製題目並將選項隨機打亂
  questions = JSON.parse(JSON.stringify(rawQuestions));
  for (let q of questions) {
    let originalCorrectText = q.options[q.originalAnswer];
    // Fisher-Yates shuffle 打亂選項陣列
    for (let i = q.options.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      let temp = q.options[i];
      q.options[i] = q.options[j];
      q.options[j] = temp;
    }
    // 重新定位打亂後的正確答案索引
    q.answer = q.options.indexOf(originalCorrectText);
  }

  resetQuestionState();
  playSynthesizedSound("start");
  playQuestionSound(questions[currentQ].soundType);
}

// ⏱️ 啟動計時器
function startTimer() {
  stopTimer();
  timeLeft = 15;
  timerInterval = setInterval(() => {
    if (!isAnswered && gameState === "QUIZ") {
      timeLeft--;
      if (timeLeft <= 0) {
        stopTimer();
        isAnswered = true;
        feedbackMessage = "⏰ 時間到！來看看正確觀念解說：";
        playSynthesizedSound("wrong");
      }
    }
  }, 1000);
}

// ⏱️ 停止計時器
function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function processAnswer(optionIndex) {
  if (isAnswered) return;
  stopTimer(); // 答題後停止計時
  selectedOption = optionIndex;
  isAnswered = true;
  let q = questions[currentQ];

  if (selectedOption === q.answer) {
    score++;
    feedbackMessage = "🎉 答對了！獲得 1 顆音樂星星！";
    playSynthesizedSound("correct");
  } else {
    feedbackMessage = "❌ 答錯囉！請看正確觀念解說：";
    playSynthesizedSound("wrong");
  }
}

function nextQuestion() {
  currentQ++;
  if (currentQ < questions.length) {
    resetQuestionState();
    playQuestionSound(questions[currentQ].soundType);
  } else {
    stopTimer();
    gameState = "RESULT";
    playSynthesizedSound("victory");
  }
}

function resetQuestionState() {
  selectedOption = null;
  isAnswered = false;
  feedbackMessage = "";
  startTimer(); // 重置並啟動新一題計時
}

// ==========================================
// 6. 經典兒歌主旋律播放器 (Web Audio API 演奏真實兒歌曲調)
// ==========================================
function playQuestionSound(type) {
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  try {
    let now = audioCtx.currentTime;

    const C4 = 261.63, D4 = 293.66, E4 = 329.63, F4 = 349.23, G4 = 392.00, A4 = 440.00, B4 = 493.88, C5 = 523.25, D5 = 587.33, E5 = 659.25, G5 = 783.99;

    let notes = [];

    if (type === "rabbit_jump") {
      notes = [
        { freq: C5, time: 0.0, dur: 0.2 },
        { freq: C5, time: 0.25, dur: 0.2 },
        { freq: G5, time: 0.5, dur: 0.2 },
        { freq: G5, time: 0.75, dur: 0.2 },
        { freq: A4, time: 1.0, dur: 0.2 },
        { freq: A4, time: 1.25, dur: 0.2 },
        { freq: G5, time: 1.5, dur: 0.4 }
      ];
    } else if (type === "speed_up") {
      notes = [
        { freq: C4, time: 0.0, dur: 0.35 },
        { freq: D4, time: 0.35, dur: 0.35 },
        { freq: E4, time: 0.7, dur: 0.3 },
        { freq: C4, time: 1.0, dur: 0.3 },
        { freq: E4, time: 1.3, dur: 0.2 },
        { freq: F4, time: 1.5, dur: 0.2 },
        { freq: G4, time: 1.7, dur: 0.3 }
      ];
    } else if (type === "lullaby_wave") {
      notes = [
        { freq: G4, time: 0.0, dur: 0.4 },
        { freq: E4, time: 0.4, dur: 0.4 },
        { freq: C4, time: 0.8, dur: 0.5 },
        { freq: D4, time: 1.3, dur: 0.4 },
        { freq: E4, time: 1.7, dur: 0.6 }
      ];
    } else if (type === "mystery") {
      notes = [
        { freq: A4, time: 0.0, dur: 0.3 },
        { freq: F4, time: 0.35, dur: 0.3 },
        { freq: D4, time: 0.7, dur: 0.3 },
        { freq: E4, time: 1.05, dur: 0.3 },
        { freq: C4, time: 1.4, dur: 0.5 }
      ];
    } else if (type === "legato") {
      notes = [
        { freq: C4, time: 0.0, dur: 0.3 },
        { freq: E4, time: 0.3, dur: 0.3 },
        { freq: G4, time: 0.6, dur: 0.3 },
        { freq: C5, time: 0.9, dur: 0.4 },
        { freq: G4, time: 1.3, dur: 0.5 }
      ];
    } else if (type === "rain_drops") {
      notes = [
        { freq: G5, time: 0.0, dur: 0.2 },
        { freq: E5, time: 0.25, dur: 0.2 },
        { freq: E5, time: 0.5, dur: 0.3 },
        { freq: D5, time: 0.85, dur: 0.2 },
        { freq: C5, time: 1.1, dur: 0.2 },
        { freq: D5, time: 1.35, dur: 0.3 }
      ];
    } else if (type === "march_beat") {
      notes = [
        { freq: C4, time: 0.0, dur: 0.25 },
        { freq: G4, time: 0.3, dur: 0.25 },
        { freq: A4, time: 0.6, dur: 0.25 },
        { freq: G4, time: 0.9, dur: 0.3 },
        { freq: E4, time: 1.25, dur: 0.25 },
        { freq: C4, time: 1.5, dur: 0.4 }
      ];
    } else if (type === "victory_tune") {
      notes = [
        { freq: C4, time: 0.0, dur: 0.2 },
        { freq: E4, time: 0.2, dur: 0.2 },
        { freq: G4, time: 0.4, dur: 0.2 },
        { freq: C5, time: 0.6, dur: 0.2 },
        { freq: E5, time: 0.8, dur: 0.3 },
        { freq: G5, time: 1.1, dur: 0.6 }
      ];
    }

    for (let note of notes) {
      let osc = audioCtx.createOscillator();
      let gain = audioCtx.createGain();
      
      if (type === "rabbit_jump" || type === "victory_tune") {
        osc.type = 'triangle';
      } else if (type === "speed_up" || type === "mystery") {
        osc.type = 'sawtooth';
      } else if (type === "march_beat") {
        osc.type = 'square';
      } else {
        osc.type = 'sine';
      }

      let noteStart = now + note.time;
      let noteEnd = noteStart + note.dur;

      osc.frequency.setValueAtTime(note.freq, noteStart);
      gain.gain.setValueAtTime(0.18, noteStart);
      gain.gain.exponentialRampToValueAtTime(0.001, noteEnd);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(noteStart);
      osc.stop(noteEnd);
    }

  } catch (e) {
    console.log("Question sound error:", e);
  }
}

// ==========================================
// 7. 通用互動音效合成器
// ==========================================
function playSynthesizedSound(type) {
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  try {
    let osc = audioCtx.createOscillator();
    let gainNode = audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    let now = audioCtx.currentTime;

    if (type === "start") {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.3);
      gainNode.gain.setValueAtTime(0.15, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === "correct") {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.1);
      osc.frequency.setValueAtTime(783.99, now + 0.2);
      gainNode.gain.setValueAtTime(0.2, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    } else if (type === "wrong") {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(160, now + 0.3);
      gainNode.gain.setValueAtTime(0.12, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === "victory") {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.5);
      gainNode.gain.setValueAtTime(0.22, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
    }
  } catch (e) {
    console.log("Audio play error:", e);
  }
}