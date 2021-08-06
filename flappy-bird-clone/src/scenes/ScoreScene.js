import BaseScene from "./BaseScene";

class ScoreScene extends BaseScene {
    constructor(config) {
        super("ScoreScene", { ...config, canGoBack: true });
        this.highscore = parseInt(localStorage.getItem("highscore"));
    }

    create() {
        super.create();
        this.add
            .text(
                this.config.width / 2,
                this.config.height / 2,
                `Highscore is: ${this.highscore || 0}`,
                { fontSize: "32px" }
            )
            .setOrigin(0.5, 1);
    }
}

export default ScoreScene;
