import Phaser from "phaser";
import PlayScene from "./scenes/PlayScene";

const WIDTH = 800;
const HEIGHT = 600;
const BIRD_ORIGIN = { x: WIDTH / 10, y: HEIGHT / 2 };

const SHARED_CONFIG = {
    width: WIDTH,
    height: HEIGHT,
    startPosition: BIRD_ORIGIN,
};

const debugPhysics = true;

const config = {
    type: Phaser.AUTO, // this is WebGL (Web Graphic Library) as renderer
    ...SHARED_CONFIG,
    width: 800,
    height: 600,
    physics: {
        //physical system. Arcade is simple, and manages physical simulations
        default: "arcade",
        arcade: {
            debug: debugPhysics,
        },
    },
    scene: [new PlayScene(SHARED_CONFIG)],
};

new Phaser.Game(config);
