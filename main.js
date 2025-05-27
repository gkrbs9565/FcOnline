// =========================
// LoadingScene.js
// =========================
class LoadingScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LoadingScene' });
  }
  init(data) {
    this.nextScene = data.next || 'GameScene';
    this.duration = data.duration || 5000;
  }

  preload() {
    // — GameScene에 사용할 에셋 로드 —
    this.load.image('bg', 'assets/background.png');
    this.load.image('ball', 'assets/ball.png');
    this.load.image('player_front', 'assets/player_front.png');
    for (let i = 1; i <= 5; i++) {
      this.load.image(`run_left${i}`, `assets/player_left${i - 1}.png`);
      this.load.image(`run_right${i}`, `assets/player_right${i - 1}.png`);
    }
    this.load.image('run_up1', 'assets/player_up1.png');
    this.load.image('run_up2', 'assets/player_up2.png');
    this.load.image('run_down1', 'assets/player_down1.png');
    this.load.image('run_down2', 'assets/player_down2.png');

    // — 킥 모션 3프레임 로드 —
    this.load.image('player_shoot1', 'assets/player_shoot1.png');
    this.load.image('player_shoot2', 'assets/player_shoot2.png');
    this.load.image('player_shoot3', 'assets/player_shoot3.png');

    // — 로딩 영상 로드 —
    this.load.video('loadingVid', 'assets/loading_video.mp4', 'loadeddata', false, true);
  }

  create() {
    const { width, height } = this.scale;

    // 비디오 중앙 배치 및 재생
    const vid = this.add.video(width / 2, height / 2, 'loadingVid')
      .setOrigin(0.5)
      .play(true);

    vid.once('play', () => {
      const targetRatio = 16 / 9;
      const containerRatio = width / height;
      let vidW, vidH;

      if (containerRatio > targetRatio) {
        // 화면이 더 넓으면 → 너비에 딱 맞추고 높이 오버플로우
        vidW = width;
        vidH = width / targetRatio;
      } else {
        // 화면이 더 좁으면 → 높이에 딱 맞추고 너비 오버플로우
        vidH = height;
        vidW = height * targetRatio;
      }

      vid.setDisplaySize(vidW, vidH);
      vid.setPosition(width / 2, height / 2);
    });

    // duration 후 전환
    this.time.delayedCall(this.duration, () => {
      vid.stop();
      this.scene.start(this.nextScene);
    });
  }

}

// =========================
// 1. StartScene
// =========================
class StartScene extends Phaser.Scene {
  constructor() { super({ key: 'StartScene' }); }

  preload() {
    // 시작화면에 필요한 배경만 미리 로드
    this.load.image('startBg', 'assets/start_bg.png');
  }

  create() {
    const { width, height } = this.scale;

    // 1) 배경 즉시 그리기 → 검은화면 제거
    this.add.image(0, 0, 'startBg')
      .setOrigin(0)
      .setDisplaySize(width, height);

    // 2) 볼륨 표시 텍스트(초기값) 및 키 등록
    this.volText = this.add.text(20, 20, 'BGM Volume: 10%', { font: '23px Arial', fill: '#000' });
    this.volUpKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.volDownKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);

    // 3) 버튼 스타일 & 배치 (즉시 표시)
    const pad = 20, sp = 30, btnY = height - pad;
    const startStyle = {
      font: '40px Arial', color: '#ca1d2e',
      backgroundColor: '#FFA500', stroke: '#000', strokeThickness: 3,
      padding: { x: 50, y: 9 }
    };
    const tutoStyle = {
      font: '40px Arial', color: '#fff',
      backgroundColor: '#87CEEB', stroke: '#005F7F', strokeThickness: 3,
      padding: { x: 24, y: 8 }
    };

    this.add.text(width / 2 - sp / 2, btnY, '시작', startStyle)
      .setOrigin(1, 1)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.scene.start('LoadingScene', { next: 'GameScene', duration: 3000 });
      });

    this.add.text(width / 2 + sp / 2, btnY, '튜토리얼', tutoStyle)
      .setOrigin(0, 1)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.scene.start('TutorialScene');
      });

    // 4) 뒤에서 BGM·로딩 비디오를 비동기로 불러오기
    this.load.audio('bgm', 'assets/bgm.mp3');
    this.load.video('loadingVid', 'assets/loading_video.mp4', 'loadeddata', false, true);

    this.load.once('complete', () => {
      if (this.sound.context.state === 'suspended') {
        this.sound.context.resume();
      }
      this.bgm = this.sound.add('bgm', { volume: 0.1, loop: true });
      this.bgm.play();
    });
    this.load.start();
  }

  update() {
    if (this.bgm) {
      if (Phaser.Input.Keyboard.JustDown(this.volUpKey)) {
        const v = Phaser.Math.Clamp(this.bgm.volume + 0.1, 0, 1);
        this.bgm.setVolume(v);
        this.volText.setText(`BGM Volume: ${Math.round(v * 100)}%`);
      }
      if (Phaser.Input.Keyboard.JustDown(this.volDownKey)) {
        const v = Phaser.Math.Clamp(this.bgm.volume - 0.1, 0, 1);
        this.bgm.setVolume(v);
        this.volText.setText(`BGM Volume: ${Math.round(v * 100)}%`);
      }
    }
  }
}

// =========================
// TutorialScene.js (전체화면, 중앙 버튼, 개별 배경)
// =========================
class TutorialScene extends Phaser.Scene {
  constructor() { super({ key: 'TutorialScene' }); }

  preload() {
    this.load.image('tutorial1', 'assets/tutorial1.png');
    this.load.image('tutorial2', 'assets/tutorial2.png');
  }

  create() {
    const { width, height } = this.scale;

    // 슬라이드 데이터
    this.slideIndex = 0;
    this.slides = ['tutorial1', 'tutorial2'];

    // 전체 화면 이미지
    this.slideImage = this.add.image(width / 2, height / 2, this.slides[this.slideIndex])
      .setOrigin(0.5)
      .setDisplaySize(width, height);

    // 버튼 스타일 및 크기
    const btnStyle = { font: '24px Arial', fill: '#000' };
    const btnWidth = 100;
    const btnHeight = 50;
    const spacing = 150;
    const yPos = height - 60;

    // prev 버튼 배경
    this.prevBg = this.add.rectangle(
      width / 2 - spacing, yPos,
      btnWidth, btnHeight,
      0xffffff
    ).setOrigin(0.5);
    // prev 버튼 텍스트
    this.prevText = this.add.text(
      width / 2 - spacing, yPos,
      'Prev', btnStyle
    )
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.changeSlide(-1));

    // next 버튼 배경
    this.nextBg = this.add.rectangle(
      width / 2, yPos,
      btnWidth, btnHeight,
      0xffffff
    ).setOrigin(0.5);
    // next 버튼 텍스트
    this.nextText = this.add.text(
      width / 2, yPos,
      'Next', btnStyle
    )
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.changeSlide(1));

    // 돌아가기 버튼 배경
    this.backBg = this.add.rectangle(
      width / 2 + spacing, yPos,
      btnWidth, btnHeight,
      0xffffff
    ).setOrigin(0.5);
    // 돌아가기 버튼 텍스트
    this.backText = this.add.text(
      width / 2 + spacing, yPos,
      '돌아가기', btnStyle
    )
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.scene.start('StartScene'));

    // 리사이즈 대응
    this.scale.on('resize', () => this._resizeSlide());
  }

  changeSlide(direction) {
    this.slideIndex = Phaser.Math.Clamp(
      this.slideIndex + direction,
      0, this.slides.length - 1
    );
    this.slideImage.setTexture(this.slides[this.slideIndex]);
  }

  _resizeSlide() {
    const { width, height } = this.scale;
    this.slideImage
      .setPosition(width / 2, height / 2)
      .setDisplaySize(width, height);

    const btnWidth = 100;
    const btnHeight = 50;
    const spacing = 150;
    const yPos = height - 60;

    this.prevBg
      .setPosition(width / 2 - spacing, yPos)
      .setSize(btnWidth, btnHeight);
    this.prevText.setPosition(width / 2 - spacing, yPos);

    this.nextBg
      .setPosition(width / 2, yPos)
      .setSize(btnWidth, btnHeight);
    this.nextText.setPosition(width / 2, yPos);

    this.backBg
      .setPosition(width / 2 + spacing, yPos)
      .setSize(btnWidth, btnHeight);
    this.backText.setPosition(width / 2 + spacing, yPos);
  }
}


// =========================
// GameScene.js
// =========================
class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {
    // 리소스 로드
    this.load.image('bg', 'assets/background.png');
    this.load.image('ball', 'assets/ball.png');
    this.load.image('player_front', 'assets/player_front.png');
    this.load.image('player2_front', 'assets/player2_front.png');
    for (let i = 1; i <= 5; i++) {
      this.load.image(`run_left${i}`, `assets/player_left${i - 1}.png`);
      this.load.image(`run_right${i}`, `assets/player_right${i - 1}.png`);
      this.load.image(`p2_run_left${i}`, `assets/player2_left${i - 1}.png`);
      this.load.image(`p2_run_right${i}`, `assets/player2_right${i - 1}.png`);
    }
    this.load.image('run_up1', 'assets/player_up1.png');
    this.load.image('run_up2', 'assets/player_up2.png');
    this.load.image('run_down1', 'assets/player_down1.png');
    this.load.image('run_down2', 'assets/player_down2.png');
    this.load.image('p2_run_up1', 'assets/player2_up1.png');
    this.load.image('p2_run_up2', 'assets/player2_up2.png');
    this.load.image('p2_run_down1', 'assets/player2_down1.png');
    this.load.image('p2_run_down2', 'assets/player2_down2.png');
  }

  create() {
    const { width, height } = this.scale;

    // 배경
    this.add.image(0, 0, 'bg')
      .setOrigin(0)
      .setDisplaySize(width, height);

    // 리사이즈 대응
    this.scale.on('resize', gs =>
      this.cameras.main.setViewport(0, 0, gs.width, gs.height)
    );

    // — 절대 크기(px) 설정 —
    const CHAR_W = 43, CHAR_H = 64, BALL_S = 28;

    // 입력 설정
    this.keys = this.input.keyboard.addKeys({ up: 'W', left: 'A', down: 'S', right: 'D' });
    this.shootKey = this.input.keyboard.addKey('SPACE');
    this.sprintKey = this.input.keyboard.addKey('E');
    this.isSprinting = false;
    this.sprintKey.on('down', () => this.isSprinting = !this.isSprinting);

    this.keys2 = this.input.keyboard.addKeys({ up: 'UP', left: 'LEFT', down: 'DOWN', right: 'RIGHT' });
    this.shootKey2 = this.input.keyboard.addKey('ENTER');
    this.sprintKey2 = this.input.keyboard.addKey('SHIFT');
    this.isSprinting2 = false;
    this.sprintKey2.on('down', () => this.isSprinting2 = !this.isSprinting2);

    // 플레이어1 스프라이트 (고정 스케일)
    const p1Img = this.textures.get('player_front').getSourceImage();
    this.player1 = this.physics.add.sprite(width * 0.1, height / 2, 'player_front')
      .setScale(CHAR_W / p1Img.width, CHAR_H / p1Img.height)
      .setCollideWorldBounds(true);

    // 플레이어2 스프라이트
    const p2Img = this.textures.get('player2_front').getSourceImage();
    this.player2 = this.physics.add.sprite(width * 0.9, height / 2, 'player2_front')
      .setScale(CHAR_W / p2Img.width, CHAR_H / p2Img.height)
      .setCollideWorldBounds(true)
      .setTint(0x0000ff);

    // 공
    this.ball = this.physics.add.sprite(width / 2, height / 2, 'ball')
      .setDisplaySize(BALL_S, BALL_S)
      .setCircle(BALL_S / 2)
      .setBounce(0.8)
      .setCollideWorldBounds(true)
      .setOrigin(0.5);
    this.ball.owner = null;
    this.ball.shouldRotate = false;
    this.ball.shouldAccel = false;
    this.ball.lastDir = { x: 0, y: -1 };
    this.ball.maxSpeed = 400;
    this.ball.accelRate = 800;
    this.ballOffset = CHAR_H / 2 + BALL_S / 2;

    // 충돌 처리
    this.physics.add.overlap(this.player1, this.ball, (p, b) => this._claimBall(p, b));
    this.physics.add.overlap(this.player2, this.ball, (p, b) => this._claimBall(p, b));

    // 파워바 초기화
    this.minPower = 200;
    this.maxPower = 500;
    this.chargeRate = 300;
    this.powerBar = this.add.graphics();
    this.shootPower = this.minPower;
    this.isCharging = false;

    this.powerBar2 = this.add.graphics();
    this.shootPower2 = this.minPower;
    this.isCharging2 = false;

    // 애니메이션 정의 (플레이어1)
    this.anims.create({
      key: 'run_left',
      frames: ['run_left1', 'run_left2', 'run_left3', 'run_left4', 'run_left5'].map(k => ({ key: k })),
      frameRate: 12, repeat: -1
    });
    this.anims.create({
      key: 'run_right',
      frames: ['run_right1', 'run_right2', 'run_right3', 'run_right4', 'run_right5'].map(k => ({ key: k })),
      frameRate: 12, repeat: -1
    });
    this.anims.create({
      key: 'run_up',
      frames: ['run_up1', 'run_up2'].map(k => ({ key: k })),
      frameRate: 8, repeat: -1
    });
    this.anims.create({
      key: 'run_down',
      frames: ['run_down1', 'run_down2'].map(k => ({ key: k })),
      frameRate: 8, repeat: -1
    });

    // 애니메이션 정의 (플레이어2)
    this.anims.create({
      key: 'p2_run_left',
      frames: ['p2_run_left1', 'p2_run_left2', 'p2_run_left3', 'p2_run_left4', 'p2_run_left5'].map(k => ({ key: k })),
      frameRate: 12, repeat: -1
    });
    this.anims.create({
      key: 'p2_run_right',
      frames: ['p2_run_right1', 'p2_run_right2', 'p2_run_right3', 'p2_run_right4', 'p2_run_right5'].map(k => ({ key: k })),
      frameRate: 12, repeat: -1
    });
    this.anims.create({
      key: 'p2_run_up',
      frames: ['p2_run_up1', 'p2_run_up2'].map(k => ({ key: k })),
      frameRate: 8, repeat: -1
    });
    this.anims.create({
      key: 'p2_run_down',
      frames: ['p2_run_down1', 'p2_run_down2'].map(k => ({ key: k })),
      frameRate: 8, repeat: -1
    });
  }

  update(time, delta) {
    // 플레이어1 이동 & 애니메이션
    this._moveAndAnimate(this.player1, this.keys,
      'run_left', 'run_right', 'run_up', 'run_down', this.isSprinting
    );

    // 플레이어1 슛 처리
    if (this.ball.owner === this.player1) {
      const dir = this._getDirection(this.keys, this.ball.lastDir);
      this.ball.setPosition(
        this.player1.x + dir.x * this.ballOffset,
        this.player1.y + dir.y * this.ballOffset + 15
      );
      this._chargeAndShoot('shootKey', this.powerBar, 'shootPower', 'isCharging', dir, delta);
    }

    // 플레이어2 이동 & 애니메이션
    this._moveAndAnimate(this.player2, this.keys2,
      'p2_run_left', 'p2_run_right', 'p2_run_up', 'p2_run_down', this.isSprinting2
    );

    // 플레이어2 슛 처리
    if (this.ball.owner === this.player2) {
      const dir2 = this._getDirection(this.keys2, this.ball.lastDir);
      this.ball.setPosition(
        this.player2.x + dir2.x * this.ballOffset,
        this.player2.y + dir2.y * this.ballOffset + 15
      );
      this._chargeAndShoot('shootKey2', this.powerBar2, 'shootPower2', 'isCharging2', dir2, delta);
    }

    // 공 가속 및 회전 마무리
    if (this.ball.shouldAccel) {
      const v = this.ball.body.velocity;
      const mag = Math.hypot(v.x, v.y);
      if (mag >= this.ball.maxSpeed) {
        this.ball.body.setAcceleration(0);
        this.ball.body.setVelocity(
          this.ball.lastDir.x * this.ball.maxSpeed,
          this.ball.lastDir.y * this.ball.maxSpeed
        );
        this.ball.shouldAccel = false;
      }
    }
    if (this.ball.shouldRotate) {
      this.ball.rotation += 0.1;
    }
  }

  // 공 소유 처리 헬퍼
  _claimBall(player, ball) {
    if (!ball.owner) {
      ball.owner = player;
      ball.body.moves = false;
      ball.shouldRotate = true;
    }
  }

  // 이동 & 애니메이션 공통 헬퍼
  _moveAndAnimate(sprite, keys, leftKey, rightKey, upKey, downKey, sprintFlag) {
    const speed = sprintFlag ? 260 : 180;
    sprite.setVelocity(0);
    let moving = false;

    if (keys.left.isDown) { sprite.setVelocityX(-speed); sprite.anims.play(leftKey, true); moving = true; }
    if (keys.right.isDown) { sprite.setVelocityX(speed); sprite.anims.play(rightKey, true); moving = true; }
    if (keys.up.isDown) { sprite.setVelocityY(-speed); if (!moving) sprite.anims.play(upKey, true); moving = true; }
    if (keys.down.isDown) { sprite.setVelocityY(speed); if (!moving) sprite.anims.play(downKey, true); moving = true; }

    if (!moving) {
      sprite.anims.stop();
      const baseTex = sprite === this.player2 ? 'player2_front' : 'player_front';
      sprite.setTexture(baseTex);
    }
  }

  // 방향 계산 헬퍼 (idle 처리 추가)
  _getDirection(keys, fallback) {
    // idle → 항상 아래
    if (!keys.left.isDown && !keys.right.isDown && !keys.up.isDown && !keys.down.isDown) {
      return { x: 0, y: 0.5 };
    }
    if (keys.left.isDown && !keys.up.isDown && !keys.down.isDown) return { x: -1, y: 0 };
    if (keys.right.isDown && !keys.up.isDown && !keys.down.isDown) return { x: 1, y: 0 };
    if (keys.up.isDown && !keys.left.isDown && !keys.right.isDown) return { x: 0, y: -1 };
    if (keys.down.isDown && !keys.left.isDown && !keys.right.isDown) return { x: 0, y: 1 };
    return fallback;
  }

  // 슛 충전 & 발사 헬퍼
  _chargeAndShoot(keyName, bar, powerName, chargeFlag, dir, delta) {
    const sk = this[keyName];
    if (sk.isDown) {
      if (!this[chargeFlag]) {
        this[chargeFlag] = true;
        this[powerName] = this.minPower;
      }
      this[powerName] = Phaser.Math.Clamp(
        this[powerName] + this.chargeRate * (delta / 1000),
        this.minPower, this.maxPower
      );
      bar.clear();
      const pct = (this[powerName] - this.minPower) / (this.maxPower - this.minPower);
      const bx = this.ball.x - 30;
      const by = this.ball.y - (this.ball.displayHeight / 2) - 20;
      bar.fillStyle(0x000000, 0.5).fillRect(bx, by, 60, 8);
      bar.fillStyle(0xffffff, 1).fillRect(bx, by, 60 * pct, 8);
    }
    if (Phaser.Input.Keyboard.JustUp(sk)) {
      this.ball.owner = null;
      this.ball.body.moves = true;
      this.ball.lastDir = dir;
      this.ball.shouldAccel = true;
      this.ball.shouldRotate = true;
      this.ball.body.setVelocity(dir.x * this[powerName], dir.y * this[powerName]);
      this.ball.body.setAcceleration(dir.x * this.ball.accelRate, dir.y * this.ball.accelRate);
      this[chargeFlag] = false;
      this[powerName] = this.minPower;
      bar.clear();
    }
  }
}



// =========================
// 4. Phaser 설정 및 실행
// =========================
const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: window.innerWidth,
  height: window.innerHeight,
  scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH },
  physics: { default: 'arcade', arcade: { gravity: { y: 0 }, debug: false } },
  scene: [StartScene, TutorialScene, LoadingScene, GameScene]
};

new Phaser.Game(config);
