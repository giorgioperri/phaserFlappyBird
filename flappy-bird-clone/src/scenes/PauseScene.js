import BaseScene from "./BaseScene";

class PauseScene extends BaseScene {
    constructor(config) {
        super("PauseScene", config);
        this.menu = [
            { scene: "PlayScene", text: "Resume" },
            { scene: "MenuScene", text: "Back to Menu" },
        ];
    }

    create() {
        super.create();
        this.createMenu(this.menu, this.setupMenuEvents.bind(this));
    }

    setupMenuEvents(menuItem) {
        const textGO = menuItem.textGO;
        textGO.setInteractive();

        textGO.on("pointerover", () => {
            textGO.setStyle({ fill: "#ff0" });
        });
        textGO.on("pointerout", () => {
            textGO.setStyle({ fill: "#fff" });
        });
        textGO.on("pointerup", () => {
            menuItem.scene && menuItem.text === "Resume"
                ? (this.scene.stop(), this.scene.resume(menuItem.scene))
                : (this.scene.stop("PlayScene"),
                  this.scene.start(menuItem.scene));
        });
    }
}

export default PauseScene;
