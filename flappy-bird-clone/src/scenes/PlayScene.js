import BaseScene from "./BaseScene";

const PIPES_TO_RENDER = 4;

class PlayScene extends BaseScene {
    constructor(config) {
        super("PlayScene", config);

        this.bird = null;
        this.pipes = null;

        this.flapStrength = -250;

        this.score = 0;
        this.scoreText = "";

        this.isPaused = false;

        this.currentDifficulty = "easy";
        this.difficulties = {
            easy: {
                pipeHorizontalDistanceRange: [300, 350],
                pipeVerticalDistanceRange: [150, 200],
            },
            normal: {
                pipeHorizontalDistanceRange: [280, 330],
                pipeVerticalDistanceRange: [140, 190],
            },
            hard: {
                pipeHorizontalDistanceRange: [230, 310],
                pipeVerticalDistanceRange: [130, 160],
            },
        };
    }

    create() {
        super.create();
        this.currentDifficulty = "easy";
        this.createBird();
        this.createPipes();
        this.createColliders();
        this.createScore();
        this.createPauseButton();
        this.handleInputs();
        this.listenToEvents();

        this.anims.create({
            key: "fly",
            frames: this.anims.generateFrameNumbers("bird", {
                start: 8,
                end: 15,
            }),
            frameRate: 8,
            repeat: -1,
        });

        this.bird.play("fly");
    }

    update() {
        this.checkGameStatus();
        this.recyclePipes();
    }

    listenToEvents() {
        if (this.pauseEvent) return;
        this.pauseEvent = this.events.on("resume", () => {
            this.initialTime = 3;
            this.countDownText = this.add
                .text(
                    this.config.width / 2,
                    this.config.height / 2,
                    `Fly in: ${this.initialTime}`,
                    { fontSize: "32px", color: "#fff" }
                )
                .setOrigin(0.5);

            this.timedEvent = this.time.addEvent({
                delay: 1000,
                callback: this.countDownResume,
                callbackScope: this,
                loop: true,
            });
        });
    }

    createBG() {
        this.add.image(0, 0, "sky").setOrigin(0);
    }

    createBird() {
        this.bird = this.physics.add
            .sprite(
                this.config.startPosition.x,
                this.config.startPosition.y,
                "bird"
            )
            .setFlipX(true)
            .setScale(2)
            .setOrigin(0);

        this.bird.setBodySize(this.bird.width, this.bird.height - 8);
        this.bird.body.gravity.y = 400;
        this.bird.setCollideWorldBounds(true);
    }

    createPipes() {
        this.pipes = this.physics.add.group();

        for (let i = 0; i < PIPES_TO_RENDER; i++) {
            const upperPipe = this.pipes
                .create(0, 0, "pipe")
                .setImmovable(true)
                .setOrigin(0, 1);
            const lowerPipe = this.pipes
                .create(0, 0, "pipe")
                .setImmovable(true)
                .setOrigin(0);

            this.placePipe(upperPipe, lowerPipe);
        }

        this.pipes.setVelocityX(-200);
    }

    createColliders() {
        this.physics.add.collider(
            this.bird,
            this.pipes,
            this.gameOver,
            null,
            this
        );
    }

    createScore() {
        this.score = 0;
        const highscore = localStorage.getItem("highscore");
        this.scoreText = this.add.text(16, 16, `Score: ${this.score}`, {
            fontSize: "32px",
            fill: "#000",
        });
        this.add.text(16, 52, `Highscore: ${highscore || 0}`, {
            fontSize: "18px",
            fill: "#000",
        });
    }

    createPauseButton() {
        const pauseButton = this.add
            .image(this.config.width - 10, this.config.height - 10, "pause")
            .setInteractive()
            .setScale(2)
            .setOrigin(1);
        pauseButton.on("pointerdown", () => {
            this.pauseGame();
        });
    }

    pauseGame() {
        this.isPaused = true;
        this.physics.pause();
        this.scene.pause();
        this.scene.launch("PauseScene");
    }

    countDownResume() {
        this.initialTime--;
        this.countDownText.setText(`Fly in: ${this.initialTime}`);
        this.initialTime <= 0
            ? (this.countDownText.setText(""),
              this.physics.resume(),
              (this.isPaused = false),
              this.scene.resume(),
              this.timedEvent.remove())
            : null;
    }

    handleInputs() {
        this.input.on("pointerdown", this.flap, this);
        this.input.keyboard.on("keydown-SPACE", this.flap, this);
    }

    checkGameStatus() {
        this.bird.getBounds().bottom >= this.config.height || this.bird.y <= 0
            ? this.gameOver()
            : null;
    }

    placePipe(uPipe, lPipe) {
        const difficulty = this.difficulties[this.currentDifficulty];
        const rightMostX = this.getRightMostPipe();

        const pipeVerticalDistance = Phaser.Math.Between(
            ...difficulty.pipeVerticalDistanceRange
        );

        const pipeVerticalPosition = Phaser.Math.Between(
            20,
            this.config.height - 20 - pipeVerticalDistance
        );

        const pipeHorizontalDistance = Phaser.Math.Between(
            ...difficulty.pipeHorizontalDistanceRange
        );

        uPipe.x = rightMostX + pipeHorizontalDistance;
        uPipe.y = pipeVerticalPosition;

        lPipe.x = uPipe.x;
        lPipe.y = uPipe.y + pipeVerticalDistance;
    }

    recyclePipes() {
        const tempPipes = [];
        this.pipes.getChildren().forEach((pipe) => {
            pipe.getBounds().right <= 0
                ? (tempPipes.push(pipe),
                  tempPipes.length === 2
                      ? (this.placePipe(...tempPipes),
                        this.increaseScore(),
                        this.increaseDifficulty(),
                        this.saveHighscore())
                      : null)
                : null;
        });
    }

    increaseDifficulty() {
        this.score === 10
            ? (this.currentDifficulty = "normal")
            : this.score === 25
            ? (this.currentDifficulty = "hard")
            : null;
    }

    getRightMostPipe() {
        let rightMostX = 0;

        this.pipes.getChildren().forEach((pipe) => {
            rightMostX = Math.max(pipe.x, rightMostX);
        });

        return rightMostX;
    }

    saveHighscore() {
        const highscoreText = localStorage.getItem("highscore");
        const highscore = highscoreText && parseInt(highscoreText, 10);

        !highscore || this.score > highscore
            ? localStorage.setItem("highscore", this.score)
            : null;
    }

    gameOver() {
        this.physics.pause();
        this.bird.setTint(0xff0000);

        this.saveHighscore();

        this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.scene.restart();
            },
            loop: false,
        });
    }

    flap() {
        this.isPaused ? null : (this.bird.body.velocity.y = this.flapStrength);
    }

    increaseScore() {
        this.score++;
        this.scoreText.setText(`Score: ${this.score}`);
    }
}

export default PlayScene;
