import initInlineSVG from "./inline-svg.js";

document.addEventListener("DOMContentLoaded", () => {
  initInlineSVG();
  const app = new App();
  app.init();
});

class App {
  constructor() {
    this.scoreboardContent = document.querySelector(".scoreboard__content");
  }

  renderSkeletonTiles(count = 5) {
    this.scoreboardContent.innerHTML = "";
    for (let i = 0; i < count; i++) {
      const tile = document.createElement("div");
      tile.className = "scoreboard__tile";
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

  renderTable(data) {
    const tiles = this.scoreboardContent.querySelectorAll('.scoreboard__tile');
    for (const team of data.table) {
      const tile = tiles[team.intRank - 1];
      tile.innerHTML = `
        <div class="scoreboard__top">
          <div class="scoreboard__side">
              <div class="scoreboard__rank">${team.intRank}</div>
              <div class="scoreboard__badge">
                <img src="${team.strBadge}" alt="${team.strTeam} badge">
              </div>
              <div class="scoreboard__name">${team.strTeam}</div>
          </div>
          <div class="scoreboard__side right-align">
              <div class="scoreboard__bar"><span class="wins"></span> <span class="draws"></span> <span class="losses"></span></div>
              <div class="scoreboard__bar-detail"><span>W: ${team.intWin}</span> <span>D: ${team.intDraw}</span> <span>L: ${team.intLoss}</span></div>
              <div class="scoreboard__points">${team.intPoints} PTS</div>
          </div>
        </div>
        <div class="scoreboard__footer">
          <div class="scoreboard__form footer-item">
            Form: <div class="scoreboard__form-view"></div>
          </div>
          <div class="scoreboard__goals footer-item">
            Goals for: <span class="score">${team.intGoalsFor}</span>
          </div>
          <div class="scoreboard__goals footer-item">
            Goals against: <span class="score">${team.intGoalsAgainst}</span>
          </div>
          <div class="scoreboard__goals footer-item">
            Goals difference: <span class="score">${team.intGoalDifference}</span>
          </div>
        </div>

    `;
      this.showBar(team);
      this.colorForm(team);
      this.scoreboardContent.appendChild(tile);
    }
  }

  showBar(team) {
    const bar = document.querySelector('.scoreboard__bar');
    const total = team.intPlayed;
    ['wins', 'draws', 'losses'].forEach((type, i) => {
      const value = [team.intWin, team.intDraw, team.intLoss][i];
      const el = bar.querySelector(`.${type}`);
      if (el) el.style.width = `${(value / total) * 100}%`;
    });
  }

  colorForm(team) {
    const formView = document.querySelector('.scoreboard__form-view');
    const teamForm = team.strForm.split('').reverse();
    teamForm.forEach((char) => {
      const span = document.createElement('span');
      span.className = (char === 'W') ? 'wins' : (char === 'D') ? 'draws' : 'losses';
      span.textContent = char;
      formView.appendChild(span);
    });
  }

  async fetchData() {
    try {
      const response = await fetch(
        "https://www.thesportsdb.com/api/v1/json/123/lookuptable.php?l=4328&s=2024-2025"
      );
      if (!response.ok) {
        console.error("Network response was not ok");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Fetch error:", error);
      return [];
    }
  }

  init() {
    this.renderSkeletonTiles();
    const onScroll = async () => {
      const skeleton = document.querySelectorAll('.skeleton');
      
      window.removeEventListener('scroll', onScroll);
      const data = await this.fetchData();
      if (data) {
        skeleton.forEach(el => el.remove());
        this.renderTable(data);
      }
    };
    window.addEventListener('scroll', onScroll, { once: true });
  }
}
