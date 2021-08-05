import Phaser from "phaser";
import PlayScene from "./scenes/PlayScene";

const debugPhysics = true;

const config = {
    type: Phaser.AUTO, // this is WebGL (Web Graphic Library) as renderer
    width: 800,
    height: 600,
    physics: {
        //physical system. Arcade is simple, and manages physical simulations
        default: "arcade",
        arcade: {
            debug: debugPhysics,
        },
    },
    scene: [PlayScene],
};

const FLAP_STRENGTH = -250;
const BIRD_ORIGIN = { x: config.width * 0.1, y: config.height / 2 };
const PIPES_TO_RENDER = 4;

const pipeVerticalDistanceRange = [150, 250];
const pipeHorizontalDistanceRange = [400, 500];

let bird = null;
let pipes = null;

//function to load assets, such as images, music, animations ecc.
function preload() {
    // the 'this' context here contains all of the scene object, with functions and properties to be used
    this.load.image("sky", "assets/sky.png");
    this.load.image("bird", "assets/bird.png");
    this.load.image("pipe", "assets/pipe.png");
}

//function to initialize instances of objects on screen, or in memory (setup)
function create() {
    //image takes three values: x, y, image key
    this.add.image(0, 0, "sky").setOrigin(0, 0); //origin is normalized

    pipes = this.physics.add.group();

    for (let i = 0; i < PIPES_TO_RENDER; i++) {
        const upperPipe = pipes.create(0, 0, "pipe").setOrigin(0, 1);
        const lowerPipe = pipes.create(0, 0, "pipe").setOrigin(0, 0);

        placePipe(upperPipe, lowerPipe);
    }

    pipes.setVelocityX(-200);

    bird = this.physics.add
        .sprite(BIRD_ORIGIN.x, BIRD_ORIGIN.y, "bird")
        .setOrigin(0);
    bird.body.gravity.y = 400;

    this.input.on("pointerdown", flap);

    this.input.keyboard.on("keydown-SPACE", flap);
}

//default fps is 60, update is called every frame,
function update(time, delta) {
    bird.y > config.height || bird.y < -bird.height
        ? restartBirdPosition()
        : null;

    reciclePipes();
}

function placePipe(uPipe, lPipe) {
    const rightMostX = getRightMostPipe();

    const pipeVerticalDistance = Phaser.Math.Between(
        ...pipeVerticalDistanceRange
    );

    const pipeVerticalPosition = Phaser.Math.Between(
        20,
        config.height - 20 - pipeVerticalDistance
    );

    const pipeHorizontalDistance = Phaser.Math.Between(
        ...pipeHorizontalDistanceRange
    );

    uPipe.x = rightMostX + pipeHorizontalDistance;
    uPipe.y = pipeVerticalPosition;

    lPipe.x = uPipe.x;
    lPipe.y = uPipe.y + pipeVerticalDistance;
}

function reciclePipes() {
    const tempPipes = [];
    pipes.getChildren().forEach((pipe) => {
        pipe.getBounds().right <= 0
            ? (tempPipes.push(pipe),
              tempPipes.length === 2 ? placePipe(...tempPipes) : null)
            : null;
    });
}

function getRightMostPipe() {
    let rightMostX = 0;

    pipes.getChildren().forEach((pipe) => {
        rightMostX = Math.max(pipe.x, rightMostX);
    });

    return rightMostX;
}

function restartBirdPosition() {
    bird.x = BIRD_ORIGIN.x;
    bird.y = BIRD_ORIGIN.y;
    bird.body.velocity.y = 0;
}

function flap() {
    bird.body.velocity.y = FLAP_STRENGTH;
}

new Phaser.Game(config);
