/* =====================================================
   DADOS
===================================================== */

const teams = JSON.parse(localStorage.getItem("teams")) || [];

const players = JSON.parse(localStorage.getItem("players")) || [];

const games = JSON.parse(localStorage.getItem("games")) || [];

const scorers = JSON.parse(localStorage.getItem("scorers")) || [];

const standings = JSON.parse(localStorage.getItem("standings")) || [];


/* =====================================================
   ELEMENTOS
===================================================== */

const navLinks = document.querySelectorAll(".nav-link");
const pages = document.querySelectorAll(".page");
const nav = document.getElementById("nav");


/* =====================================================
   NAVEGAÇÃO
===================================================== */

function showPage(pageId) {

  pages.forEach(page => {

    page.classList.toggle(
      "active",
      page.id === pageId
    );

  });


  navLinks.forEach(link => {

    link.classList.toggle(
      "active",
      link.dataset.page === pageId
    );

  });


  nav.classList.remove("open");

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


navLinks.forEach(link => {

  link.addEventListener("click", () => {

    showPage(link.dataset.page);

  });

});


document.querySelectorAll("[data-go]").forEach(button => {

  button.addEventListener("click", () => {

    showPage(button.dataset.go);

  });

});


document.getElementById("menuBtn")
  .addEventListener("click", () => {

    nav.classList.toggle("open");

  });


/* =====================================================
   FILTRO DE PALAVRÕES
===================================================== */

/*
   Esta lista é uma base.
   Podemos aumentar posteriormente.
*/

const blockedWords = [

  /* Português */
  "caralho",
  "merda",
  "puta",
  "puto",
  "foda",
  "foder",
  "fodase",
  "fudase",
  "porra",
  "cu",
  "cona",
  "paneleiro",
  "filhodaputa",

  /* Inglês */
  "fuck",
  "fucking",
  "shit",
  "bitch",
  "asshole",
  "dick",
  "pussy",
  "cunt",

  /* Espanhol */
  "puta",
  "puto",
  "mierda",
  "joder",
  "coño",
  "cabron",

  /* Francês */
  "merde",
  "putain",
  "connard",

  /* Italiano */
  "cazzo",
  "merda",
  "stronzo",

  /* Alemão */
  "scheisse",
  "arschloch",
  "fick",

  /* Outras formas comuns */
  "fuckyou",
  "motherfucker"

];


/* =====================================================
   NORMALIZAR TEXTO
===================================================== */

function normalizeText(text) {

  return text

    .toLowerCase()

    .normalize("NFD")

    .replace(/[\u0300-\u036f]/g, "")

    .replace(/[^a-z0-9]/g, "");

}


/* =====================================================
   VERIFICAR PALAVRÕES
===================================================== */

function containsBlockedWord(text) {

  const normalized = normalizeText(text);

  return blockedWords.some(word => {

    const normalizedWord = normalizeText(word);

    return normalized.includes(normalizedWord);

  });

}


/* =====================================================
   FOTO
===================================================== */

function readImage(file, callback) {

  if (!file) {

    callback("");

    return;

  }


  const reader = new FileReader();


  reader.onload = event => {

    callback(event.target.result);

  };


  reader.readAsDataURL(file);

}


/* =====================================================
   PREVIEW DA FOTO DA EQUIPA
===================================================== */

const teamPhotoInput =
  document.getElementById("teamPhoto");

const teamPhotoPreview =
  document.getElementById("teamPhotoPreview");


teamPhotoInput.addEventListener("change", () => {

  const file = teamPhotoInput.files[0];

  if (!file) {

    teamPhotoPreview.innerHTML = "";

    teamPhotoPreview.style.display = "none";

    return;

  }


  readImage(file, image => {

    teamPhotoPreview.innerHTML =
      `<img src="${image}" alt="Preview da equipa">`;

    teamPhotoPreview.style.display = "block";

  });

});


/* =====================================================
   PREVIEW DA FOTO DO JOGADOR
===================================================== */

const playerPhotoInput =
  document.getElementById("playerPhoto");

const playerPhotoPreview =
  document.getElementById("playerPhotoPreview");


playerPhotoInput.addEventListener("change", () => {

  const file = playerPhotoInput.files[0];

  if (!file) {

    playerPhotoPreview.innerHTML = "";

    playerPhotoPreview.style.display = "none";

    return;

  }


  readImage(file, image => {

    playerPhotoPreview.innerHTML =
      `<img src="${image}" alt="Preview do jogador">`;

    playerPhotoPreview.style.display = "block";

  });

});


/* =====================================================
   RENDERIZAR EQUIPAS
===================================================== */

function renderTeams() {

  const container =
    document.getElementById("teamsGrid");


  if (teams.length === 0) {

    container.innerHTML = `
      <div class="empty-state">
        Ainda não existem equipas cadastradas.
      </div>
    `;

    return;

  }


  container.innerHTML = teams.map((team, index) => {

    const photo = team.photo
      ? `
        <img
          src="${team.photo}"
          class="team-photo"
          alt="${team.name}"
        >
      `
      : `
        <div class="team-logo">
          ${team.short}
        </div>
      `;


    return `

      <article class="team-card">

        ${photo}

        <h3>
          ${team.name}
        </h3>

        <p>
          ${team.short}
        </p>

        <p>
          ${team.players.length} jogadores inscritos
        </p>

        <button
          onclick="deleteTeam(${index})"
        >
          Eliminar
        </button>

      </article>

    `;

  }).join("");

}


/* =====================================================
   CADASTRO DE EQUIPA
===================================================== */

const teamNameInput =
  document.getElementById("teamName");

const teamShortInput =
  document.getElementById("teamShort");

const addTeamBtn =
  document.getElementById("addTeamBtn");


addTeamBtn.addEventListener("click", () => {

  const name =
    teamNameInput.value.trim();

  const short =
    teamShortInput.value.trim();


  /* CAMPOS VAZIOS */

  if (name === "" || short === "") {

    alert("Preenche o nome e a sigla da equipa.");

    return;

  }


  /* PALAVRÕES */

  if (
    containsBlockedWord(name) ||
    containsBlockedWord(short)
  ) {

    alert(
      "O nome ou a sigla contém linguagem não permitida."
    );

    return;

  }


  /* DUPLICADOS */

  const alreadyExists = teams.some(team =>

    team.name.toLowerCase() === name.toLowerCase() ||

    team.short.toLowerCase() === short.toLowerCase()

  );


  if (alreadyExists) {

    alert(
      "Já existe uma equipa com esse nome ou sigla."
    );

    return;

  }


  const photoFile =
    teamPhotoInput.files[0];


  readImage(photoFile, photo => {

    teams.push({

      name: name,

      short: short,

      color: "blue",

      photo: photo,

      players: []

    });


    localStorage.setItem(
      "teams",
      JSON.stringify(teams)
    );


    renderTeams();

    updateTeamSelect();

    updateStats();


    teamNameInput.value = "";

    teamShortInput.value = "";

    teamPhotoInput.value = "";

    teamPhotoPreview.innerHTML = "";

    teamPhotoPreview.style.display = "none";


    alert("Equipa cadastrada com sucesso!");

  });

});


/* =====================================================
   ELIMINAR EQUIPA
===================================================== */

function deleteTeam(index) {

  const team = teams[index];


  if (!team) {

    return;

  }


  const confirmed = confirm(

    `Tens certeza que queres eliminar a equipa "${team.name}"?`

  );


  if (!confirmed) {

    return;

  }


  /*
    Também eliminamos os jogadores
    pertencentes à equipa.
  */

  const remainingPlayers =
    players.filter(
      player => player.team !== team.name
    );


  players.length = 0;

  players.push(...remainingPlayers);


  teams.splice(index, 1);


  localStorage.setItem(
    "teams",
    JSON.stringify(teams)
  );


  localStorage.setItem(
    "players",
    JSON.stringify(players)
  );


  renderTeams();

  renderPlayers();

  updateTeamSelect();

  updateStats();

}


/* =====================================================
   SELECT DE EQUIPAS
===================================================== */

function updateTeamSelect() {

  const select =
    document.getElementById("playerTeam");


  const currentValue =
    select.value;


  select.innerHTML = `

    <option value="">
      Selecionar equipa
    </option>

  `;


  teams.forEach(team => {

    const option =
      document.createElement("option");


    option.value = team.name;

    option.textContent =
      `${team.name} (${team.short})`;


    select.appendChild(option);

  });


  select.value = currentValue;

}


/* =====================================================
   RENDERIZAR JOGADORES
===================================================== */

function renderPlayers() {

  const container =
    document.getElementById("playersGrid");


  if (players.length === 0) {

    container.innerHTML = `
      <div class="empty-state">
        Ainda não existem jogadores cadastrados.
      </div>
    `;

    return;

  }


  container.innerHTML = players.map(
    (player, index) => {

      const photo = player.photo

        ? `
          <img
            src="${player.photo}"
            class="player-photo"
            alt="${player.name}"
          >
        `

        : `
          <div class="player-placeholder">
            👤
          </div>
        `;


      return `

        <article class="player-card">

          ${photo}

          <h3>
            ${player.name}
          </h3>

          <div class="player-team">
            ${player.team}
          </div>

          <div class="player-position">
            ${player.position}
          </div>

          <div class="player-number">
            ${player.number}
          </div>

          <br>

          <button
            onclick="deletePlayer(${index})"
          >
            Eliminar
          </button>

        </article>

      `;

    }

  ).join("");

}


/* =====================================================
   CADASTRO DE JOGADOR
===================================================== */

const playerNameInput =
  document.getElementById("playerName");

const playerNumberInput =
  document.getElementById("playerNumber");

const playerPositionInput =
  document.getElementById("playerPosition");

const playerTeamInput =
  document.getElementById("playerTeam");

const addPlayerBtn =
  document.getElementById("addPlayerBtn");


addPlayerBtn.addEventListener("click", () => {

  const name =
    playerNameInput.value.trim();

  const number =
    Number(playerNumberInput.value);

  const position =
    playerPositionInput.value;

  const team =
    playerTeamInput.value;


  /* CAMPOS */

  if (
    name === "" ||
    !number ||
    position === "" ||
    team === ""
  ) {

    alert(
      "Preenche todos os campos do jogador."
    );

    return;

  }


  /* PALAVRÕES */

  if (containsBlockedWord(name)) {

    alert(
      "O nome contém linguagem não permitida."
    );

    return;

  }


  /* JOGADOR DUPLICADO */

  const alreadyExists =
    players.some(player =>

      player.name.toLowerCase() ===
      name.toLowerCase() &&

      player.team === team

    );


  if (alreadyExists) {

    alert(
      "Este jogador já está cadastrado nessa equipa."
    );

    return;

  }


  /* NÚMERO DUPLICADO */

  const numberExists =
    players.some(player =>

      player.team === team &&
      player.number === number

    );


  if (numberExists) {

    alert(
      "Esse número de camisola já está sendo usado nessa equipa."
    );

    return;

  }


  const photoFile =
    playerPhotoInput.files[0];


  readImage(photoFile, photo => {

    const newPlayer = {

      id: Date.now(),

      name: name,

      number: number,

      position: position,

      team: team,

      photo: photo,

      goals: 0

    };


    players.push(newPlayer);


    localStorage.setItem(
      "players",
      JSON.stringify(players)
    );


    /*
      Atualizar quantidade de jogadores
      da equipa.
    */

    const selectedTeam =
      teams.find(
        teamObject =>
          teamObject.name === team
      );


    if (selectedTeam) {

      selectedTeam.players =
        players.filter(
          player =>
            player.team === team
        );

    }


    localStorage.setItem(
      "teams",
      JSON.stringify(teams)
    );


    renderPlayers();

    renderTeams();

    updateStats();


    /* LIMPAR FORMULÁRIO */

    playerNameInput.value = "";

    playerNumberInput.value = "";

    playerPositionInput.value = "";

    playerTeamInput.value = "";

    playerPhotoInput.value = "";

    playerPhotoPreview.innerHTML = "";

    playerPhotoPreview.style.display = "none";


    alert(
      "Jogador cadastrado com sucesso!"
    );

  });

});


/* =====================================================
   ELIMINAR JOGADOR
===================================================== */

function deletePlayer(index) {

  const player =
    players[index];


  if (!player) {

    return;

  }


  const confirmed = confirm(

    `Eliminar o jogador "${player.name}"?`

  );


  if (!confirmed) {

    return;

  }


  players.splice(index, 1);


  localStorage.setItem(
    "players",
    JSON.stringify(players)
  );


  /*
    Atualizar jogadores da equipa.
  */

  teams.forEach(team => {

    team.players =
      players.filter(
        playerObject =>
          playerObject.team === team.name
      );

  });


  localStorage.setItem(
    "teams",
    JSON.stringify(teams)
  );


  renderPlayers();

  renderTeams();

  updateStats();

}


/* =====================================================
   ESTATÍSTICAS DO INÍCIO
===================================================== */

function updateStats() {

  const totalTeams =
    document.getElementById("totalTeams");

  const totalPlayers =
    document.getElementById("totalPlayers");

  const totalGames =
    document.getElementById("totalGames");

  const totalGoals =
    document.getElementById("totalGoals");


  totalTeams.textContent =
    teams.length;


  totalPlayers.textContent =
    players.length;


  totalGames.textContent =
    games.length;


  const goals =
    players.reduce(
      (total, player) =>
        total + (player.goals || 0),
      0
    );


  totalGoals.textContent =
    goals;

}


/* =====================================================
   RESULTADOS RECENTES
===================================================== */

function renderRecentResults() {

  const container =
    document.getElementById("recentResults");


  const finishedGames =
    games
      .filter(
        game =>
          game.status === "Finalizado"
      )
      .slice(-3)
      .reverse();


  if (finishedGames.length === 0) {

    container.innerHTML = `
      <div class="empty-state">
        Ainda não existem resultados.
      </div>
    `;

    return;

  }


  container.innerHTML =
    finishedGames.map(game => `

      <div class="result-row">

        <div class="result-teams">

          <span>
            ${game.home}
          </span>

          <span>
            ×
          </span>

          <span>
            ${game.away}
          </span>

        </div>

        <strong>
          ${game.homeScore} -
          ${game.awayScore}
        </strong>

      </div>

    `).join("");

}


/* =====================================================
   ARTILHEIROS
===================================================== */

function renderTopScorers() {

  const container =
    document.getElementById("topScorers");


  const sortedPlayers =
    [...players]
      .sort(
        (a, b) =>
          (b.goals || 0) -
          (a.goals || 0)
      )
      .slice(0, 4);


  if (sortedPlayers.length === 0) {

    container.innerHTML = `
      <div class="empty-state">
        Ainda não existem estatísticas.
      </div>
    `;

    return;

  }


  container.innerHTML =
    sortedPlayers.map(
      (player, index) => `

      <div class="scorer-row">

        <div class="mini-player">

          <strong>
            ${index + 1}
          </strong>

          <div>

            <strong>
              ${player.name}
            </strong>

            <small>
              ${player.team}
            </small>

          </div>

        </div>

        <strong>
          ${player.goals || 0} ⚽
        </strong>

      </div>

    `
    ).join("");

}


/* =====================================================
   JOGOS
===================================================== */

function renderGames(filter = "todos") {

  const container =
    document.getElementById("gamesList");


  let filtered = games;


  if (filter === "proximo") {

    filtered =
      games.filter(
        game =>
          game.status === "Próximo"
      );

  }


  if (filter === "resultado") {

    filtered =
      games.filter(
        game =>
          game.status === "Finalizado"
      );

  }


  if (filtered.length === 0) {

    container.innerHTML = `
      <div class="empty-state">
        Nenhum jogo disponível.
      </div>
    `;

    return;

  }


  container.innerHTML =
    filtered.map(game => `

      <article class="game">

        <div class="game-date">

          <strong>
            ${game.date}
          </strong>

          <br>

          ${game.time}

        </div>


        <div class="game-teams">

          <span>
            ${game.home}
          </span>

          <span class="game-score">

            ${
              game.status === "Finalizado"

              ? `${game.homeScore} - ${game.awayScore}`

              : "VS"
            }

          </span>

          <span>
            ${game.away}
          </span>

        </div>


        <div class="game-status">

          ${game.status}

        </div>

      </article>

    `).join("");

}


/* =====================================================
   CLASSIFICAÇÃO
===================================================== */

function renderStandings() {

  const container =
    document.getElementById("standings");


  if (standings.length === 0) {

    container.innerHTML = `
      <tr>
        <td colspan="10">
          Ainda não existem dados.
        </td>
      </tr>
    `;

    return;

  }


  container.innerHTML =
    standings.map(
      (team, index) => `

      <tr>

        <td class="position">
          ${index + 1}
        </td>

        <td>
          <strong>
            ${team.team}
          </strong>
        </td>

        <td>${team.j}</td>
        <td>${team.v}</td>
        <td>${team.e}</td>
        <td>${team.d}</td>
        <td>${team.gm}</td>
        <td>${team.gs}</td>
        <td>${team.sg}</td>

        <td class="points">
          ${team.pts}
        </td>

      </tr>

    `
    ).join("");

}


/* =====================================================
   ARTILHARIA
===================================================== */

function renderScorers() {

  const container =
    document.getElementById("scorers");


  const sortedPlayers =
    [...players].sort(
      (a, b) =>
        (b.goals || 0) -
        (a.goals || 0)
    );


  if (sortedPlayers.length === 0) {

    container.innerHTML = `
      <tr>
        <td colspan="4">
          Ainda não existem jogadores.
        </td>
      </tr>
    `;

    return;

  }


  container.innerHTML =
    sortedPlayers.map(
      (player, index) => `

      <tr>

        <td class="position">
          ${index + 1}
        </td>

        <td>
          <strong>
            ${player.name}
          </strong>
        </td>

        <td>
          ${player.team}
        </td>

        <td>
          <strong>
            ${player.goals || 0}
          </strong>
          ⚽
        </td>

      </tr>

    `
    ).join("");

}


/* =====================================================
   FILTRO DOS JOGOS
===================================================== */

document
  .getElementById("gameFilter")
  .addEventListener(
    "change",
    event => {

      renderGames(
        event.target.value
      );

    }
  );


/* =====================================================
   INICIALIZAÇÃO
===================================================== */

teams.forEach(team => {

  /*
    Corrige equipas antigas que ainda
    não tenham players como array.
  */

  if (!Array.isArray(team.players)) {

    team.players =
      players.filter(
        player =>
          player.team === team.name
      );

  }

});


localStorage.setItem(
  "teams",
  JSON.stringify(teams)
);


updateTeamSelect();

renderTeams();

renderPlayers();

renderRecentResults();

renderTopScorers();

renderGames();

renderStandings();

renderScorers();

updateStats();