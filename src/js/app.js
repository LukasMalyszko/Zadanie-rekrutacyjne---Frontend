import initInlineSVG from './inline-svg.js';

document.addEventListener("DOMContentLoaded", () => {
    initInlineSVG();
    const app = new App();
    app.init();
});

class App {
    constructor() {
        this.scoreboardContent = document.querySelector('.scoreboard__content');
    }

    renderSkeletonTiles(count = 5) {
        this.scoreboardContent.innerHTML = '';
        for (let i = 0; i < count; i++) {
            const tile = document.createElement('div');
            tile.className = 'scoreboard__tile';
            tile.innerHTML = `
                <div class="skeleton">
                    <div class="skeleton__side">
                        <div class="skeleton__rank skeleton__element"></div>
                        <div class="skeleton__badge skeleton__element"></div>
                        <div class="skeleton__name skeleton__element"></div>
                    </div>
                    <div class="skeleton__side">
                        <div class="skeleton__bar skeleton__element"></div>
                        <div class="skeleton__matches skeleton__element"></div>
                        <div class="skeleton__points skeleton__element"></div>
                    </div>
                </div>
            `;
            this.scoreboardContent.appendChild(tile);
        }
    }

    init() {
        this.renderSkeletonTiles();
    }
}
