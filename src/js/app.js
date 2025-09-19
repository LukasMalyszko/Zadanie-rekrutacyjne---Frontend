import initInlineSVG from "./inline-svg.js";

document.addEventListener("DOMContentLoaded", () => {
  initInlineSVG();
  const app = new App();
  app.init();
});

class App {
  constructor() {
    this.scoreboardContent = document.querySelector(".scoreboard");
    this.searchInput = document.querySelector(".header__search-input");
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

  renderTable(teams) {
    this.scoreboardContent.innerHTML = "";

    if (!teams) {
      this.renderErrorMessage();
      return;
    } else if (!teams.length) {
      this.renderNoResultsMessage();
      return;
    }

    teams.forEach(team => {
      const tile = document.createElement("div");
      tile.className = "scoreboard__tile";
      tile.innerHTML = `
        <div class="scoreboard__top">
          <div class="scoreboard__side">
              <div class="scoreboard__rank">${team.intRank}</div>
              <div class="scoreboard__badge">
                <img src="${team.strBadge}" alt="${team.strTeam} badge">
              </div>
              <div class="scoreboard__name ellipsis">${team.strTeam}</div>
          </div>
          <div class="scoreboard__side right-align">
              <div class="scoreboard__bar"><span class="wins"></span> <span class="draws"></span> <span class="losses"></span></div>
              <div class="scoreboard__bar-detail"><span>W: ${team.intWin}</span> <span>D: ${team.intDraw}</span> <span>L: ${team.intLoss}</span></div>
              <div class="scoreboard__points">${team.intPoints} PTS</div>
          </div>
        </div>
        <div class="scoreboard__footer">
          <div class="scoreboard__form footer-item">
            <span class="label ellipsis">Form:</span> <div class="scoreboard__form-view"></div>
          </div>
          <div class="scoreboard__goals footer-item">
            <span class="label ellipsis">Goals for:</span> <span class="score">${team.intGoalsFor}</span>
          </div>
          <div class="scoreboard__goals footer-item">
            <span class="label ellipsis">Goals against:</span> <span class="score">${team.intGoalsAgainst}</span>
          </div>
          <div class="scoreboard__goals footer-item">
            <span class="label ellipsis">Goals difference:</span> <span class="score">${team.intGoalDifference}</span>
          </div>
        </div>
      `;
      this.showBar(team, tile);
      this.colorForm(team, tile);
      this.scoreboardContent.appendChild(tile);
    });
  }

  showBar(team, tile) {
    const bar = tile.querySelector('.scoreboard__bar');
    const total = team.intPlayed;
    ['wins', 'draws', 'losses'].forEach((type, i) => {
      const value = [team.intWin, team.intDraw, team.intLoss][i];
      const el = bar.querySelector(`.${type}`);
      if (el) el.style.width = `${(value / total) * 100}%`;
    });
  }

  colorForm(team, tile) {
    const formView = tile.querySelector('.scoreboard__form-view');
    const teamForm = team.strForm.split('').reverse();
    teamForm.forEach((char) => {
      const span = document.createElement('span');
      span.className = (char === 'W') ? 'wins' : (char === 'D') ? 'draws' : 'losses';
      span.textContent = char;
      formView.appendChild(span);
    });
  }

  iconState() {
    const icon = document.querySelector('.header__search-icon');
    if (this.searchInput.value) {
      icon.innerHTML = '&times;';
      icon.classList.add('header__close-icon');
      icon.onclick = () => {
        this.searchInput.value = '';
        icon.innerHTML = "<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'>\
                            <path d='M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0'/>\
                          </svg>";
        window.location.reload(); // Reload to simulate resetting the table just for simplicity
      };
    }
  }

  async searchTeam() {
    const data = await this.fetchData();
    this.searchInput.addEventListener('input', (e) => {
      this.iconState();
      this.renderSkeletonTiles();
      const searchTerm = e.target.value.toLowerCase();
      const filteredData = data.table.filter(team => team.strTeam.toLowerCase().includes(searchTerm));
      setTimeout(() => {
        this.renderTable(filteredData);
      }, 500);
    });
  }

  renderNoResultsMessage() {
    const msg = document.createElement("div");
    msg.className = "scoreboard__tile no-results";
    msg.innerHTML = `<div class="no-results__image"><img src="assets/svg/soccer-icon.svg" alt="No results"></div>
      <div class="no-results__message">No teams found matching "${this.searchInput.value}"</div>`;
    this.scoreboardContent.appendChild(msg);
  }

  renderErrorMessage() {
    const msg = document.createElement("div");
    msg.className = "scoreboard__tile no-results";
    msg.innerHTML = `<div class="no-results__image"><img src="assets/svg/error-icon.svg" alt="Error"></div>
      <div class="no-results__message">There was a problem. Please try again later.</div>`;
    this.scoreboardContent.appendChild(msg);
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
      
      const data = await this.fetchData();
      if (data) {
        skeleton.forEach(el => el.remove());
        this.renderTable(data.table);
      }
    };
    window.addEventListener('scroll', onScroll, { once: true });
    this.searchTeam();
  }
}
