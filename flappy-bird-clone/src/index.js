import Phaser from "phaser";
import PlayScene from "./scenes/PlayScene";
import MenuScene from "./scenes/MenuScene";
import ScoreScene from "./scenes/ScoreScene";
import PreloadScene from "./scenes/PreloadScene";

const WIDTH = 800;
const HEIGHT = 600;
const BIRD_ORIGIN = { x: WIDTH / 10, y: HEIGHT / 2 };

const SHARED_CONFIG = {
    width: WIDTH,
    height: HEIGHT,
    startPosition: BIRD_ORIGIN,
};

const Scenes = [PreloadScene, MenuScene, PlayScene, ScoreScene];
const createScene = (Scene) => new Scene(SHARED_CONFIG);
const initScenes = () => Scenes.map(createScene);

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
    scene: initScenes(),
};

new Phaser.Game(config);
