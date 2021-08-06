import BaseScene from "./BaseScene";

const PIPES_TO_RENDER = 4;

class PlayScene extends BaseScene {
    constructor(config) {
        super("PlayScene", config);

        this.bird = null;
        this.pipes = null;

        this.pipeVerticalDistanceRange = [150, 250];
        this.pipeHorizontalDistanceRange = [400, 500];

        this.flapStrength = -250;

        this.score = 0;
        this.scoreText = "";
    }

    create() {
        super.create();
        this.createBird();
        this.createPipes();
        this.createColliders();
        this.createScore();
        this.createPauseButton();
        this.handleInputs();
    }

    update() {
        this.checkGameStatus();
        this.recyclePipes();
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
            .setOrigin(0);
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
        this.physics.pause();
        this.scene.pause();
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
        const rightMostX = this.getRightMostPipe();

        const pipeVerticalDistance = Phaser.Math.Between(
            ...this.pipeVerticalDistanceRange
        );

        const pipeVerticalPosition = Phaser.Math.Between(
            20,
            this.config.height - 20 - pipeVerticalDistance
        );

        const pipeHorizontalDistance = Phaser.Math.Between(
            ...this.pipeHorizontalDistanceRange
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
                        this.saveHighscore())
                      : null)
                : null;
        });
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
        this.bird.body.velocity.y = this.flapStrength;
    }

    increaseScore() {
        this.score++;
        this.scoreText.setText(`Score: ${this.score}`);
    }
}

export default PlayScene;
