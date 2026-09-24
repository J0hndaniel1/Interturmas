// ========================================
// DADOS
// ========================================

const teams = JSON.parse(localStorage.getItem("teams")) || [];
const players = JSON.parse(localStorage.getItem("players")) || [];
const games = JSON.parse(localStorage.getItem("games")) || [];
const championships = JSON.parse(localStorage.getItem("championships")) || [];


// ========================================
// ELEMENTOS
// ========================================

const loginPage = document.getElementById("loginPage");
const adminPanel = document.getElementById("adminPanel");

const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

const logoutBtn = document.getElementById("logoutBtn");


// ========================================
// LOGIN DEMONSTRATIVO
// ========================================

// Credenciais atuais do protótipo:
//
// E-mail: listaM@adm.com
// Palavra-passe: ListaM
//
// IMPORTANTE:
// Este login ainda é apenas para o protótipo.
// Mais tarde vamos substituir pelo Supabase Auth.

const DEMO_EMAIL = "listaM@adm.com";
const DEMO_PASSWORD = "ListaM";


// ========================================
// INICIAR SESSÃO
// ========================================

if (loginForm) {

    loginForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const emailInput = document.getElementById("email");
        const passwordInput = document.getElementById("password");

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {

            sessionStorage.setItem("adminLoggedIn", "true");

            loginMessage.textContent = "";

            showAdminPanel();

        } else {

            loginMessage.textContent =
                "E-mail ou palavra-passe incorretos.";

        }

    });

}


// ========================================
// MOSTRAR PAINEL
// ========================================

function showAdminPanel() {

    if (!loginPage || !adminPanel) return;

    loginPage.classList.add("hidden");
    adminPanel.classList.remove("hidden");

    renderAll();

}


// ========================================
// TERMINAR SESSÃO
// ========================================

if (logoutBtn) {

    logoutBtn.addEventListener("click", function () {

        sessionStorage.removeItem("adminLoggedIn");

        adminPanel.classList.add("hidden");
        loginPage.classList.remove("hidden");

        loginForm.reset();

        loginMessage.textContent = "";

    });

}


// ========================================
// VERIFICAR SESSÃO
// ========================================

if (sessionStorage.getItem("adminLoggedIn") === "true") {

    showAdminPanel();

}


// ========================================
// NAVEGAÇÃO
// ========================================

const navButtons = document.querySelectorAll(".nav-btn");

navButtons.forEach(button => {

    button.addEventListener("click", function () {

        showPage(button.dataset.page);

    });

});


function showPage(pageId) {

    document.querySelectorAll(".admin-page").forEach(page => {

        page.classList.add("hidden");

    });

    const page = document.getElementById(pageId);

    if (page) {

        page.classList.remove("hidden");

    }

    navButtons.forEach(button => {

        button.classList.remove("active");

        if (button.dataset.page === pageId) {

            button.classList.add("active");

        }

    });

    const titles = {

        dashboard: "Dashboard",
        campeonatos: "Campeonatos",
        equipas: "Equipas",
        jogadores: "Jogadores",
        jogos: "Jogos",
        resultados: "Resultados"

    };

    const pageTitle = document.getElementById("pageTitle");

    if (pageTitle) {

        pageTitle.textContent =
            titles[pageId] || "Administração";

    }

}


// ========================================
// ACESSO RÁPIDO
// ========================================

document.querySelectorAll("[data-open]").forEach(button => {

    button.addEventListener("click", function () {

        showPage(button.dataset.open);

    });

});


// ========================================
// GUARDAR DADOS
// ========================================

function saveData() {

    localStorage.setItem("teams", JSON.stringify(teams));
    localStorage.setItem("players", JSON.stringify(players));
    localStorage.setItem("games", JSON.stringify(games));
    localStorage.setItem("championships", JSON.stringify(championships));

}


// ========================================
// ATUALIZAR ESTATÍSTICAS
// ========================================

function updateStats() {

    document.getElementById("totalTeams").textContent = teams.length;

    document.getElementById("totalPlayers").textContent = players.length;

    document.getElementById("totalGames").textContent = games.length;

    document.getElementById("totalChampionships").textContent =
        championships.length;

}


// ========================================
// CRIAR CAMPEONATO
// ========================================

const championshipForm =
    document.getElementById("championshipForm");

if (championshipForm) {

    championshipForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const name =
            document.getElementById("championshipName").value.trim();

        const year =
            document.getElementById("championshipYear").value;

        const format =
            document.getElementById("championshipFormat").value;

        if (!name || !year || !format) {

            alert("Preenche todos os campos.");

            return;

        }

        const exists = championships.some(championship =>
            championship.name.toLowerCase() === name.toLowerCase()
        );

        if (exists) {

            alert("Já existe um campeonato com esse nome.");

            return;

        }

        championships.push({

            id: crypto.randomUUID(),

            name,
            year,
            format,

            status: "ativo"

        });

        saveData();

        championshipForm.reset();

        renderAll();

        alert("Campeonato criado com sucesso!");

    });

}


// ========================================
// MOSTRAR CAMPEONATOS
// ========================================

function renderChampionships() {

    const container =
        document.getElementById("championshipsList");

    if (!container) return;

    if (championships.length === 0) {

        container.innerHTML = `
            <p class="empty-message">
                Ainda não existem campeonatos.
            </p>
        `;

        return;

    }

    container.innerHTML = championships.map(championship => `

        <div class="list-item">

            <div>

                <strong>
                    ${escapeHTML(championship.name)}
                </strong>

                <p>
                    ${escapeHTML(String(championship.year))}
                    •
                    ${
                        championship.format === "knockout"
                        ? "Mata-mata"
                        : "Grupos + Mata-mata"
                    }
                </p>

            </div>

            <button
                class="delete-btn"
                data-delete-championship="${championship.id}"
            >
                Eliminar
            </button>

        </div>

    `).join("");

}


// ========================================
// ELIMINAR CAMPEONATO
// ========================================

const championshipsList =
    document.getElementById("championshipsList");

if (championshipsList) {

    championshipsList.addEventListener(
        "click",
        function (event) {

            const button =
                event.target.closest(
                    "[data-delete-championship]"
                );

            if (!button) return;

            const id =
                button.dataset.deleteChampionship;

            const index =
                championships.findIndex(
                    championship =>
                        championship.id === id
                );

            if (index === -1) return;

            if (!confirm(
                "Tens a certeza de que queres eliminar este campeonato?"
            )) {

                return;

            }

            championships.splice(index, 1);

            saveData();

            renderAll();

        }
    );

}


// ========================================
// CADASTRAR EQUIPA
// ========================================

const teamForm =
    document.getElementById("teamForm");

if (teamForm) {

    teamForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const name =
            document.getElementById("teamName").value.trim();

        const short =
            document.getElementById("teamShort").value.trim();

        if (!name || !short) {

            alert("Preenche todos os campos.");

            return;

        }

        const exists = teams.some(team =>
            team.name.toLowerCase() === name.toLowerCase() ||
            team.short.toLowerCase() === short.toLowerCase()
        );

        if (exists) {

            alert(
                "Já existe uma equipa com esse nome ou sigla."
            );

            return;

        }

        teams.push({

            id: crypto.randomUUID(),

            name,
            short,

            captainId: null

        });

        saveData();

        teamForm.reset();

        renderAll();

        alert("Equipa cadastrada com sucesso!");

    });

}


// ========================================
// MOSTRAR EQUIPAS
// ========================================

function renderTeams() {

    const container =
        document.getElementById("teamsList");

    if (!container) return;

    if (teams.length === 0) {

        container.innerHTML = `
            <p class="empty-message">
                Ainda não existem equipas.
            </p>
        `;

        return;

    }

    container.innerHTML = teams.map(team => {

        const teamPlayers = players.filter(
            player => player.teamId === team.id
        );

        const captain = teamPlayers.find(
            player => player.id === team.captainId
        );

        return `

            <div class="content-card">

                <h3>
                    ${escapeHTML(team.name)}
                </h3>

                <p>
                    Sigla:
                    ${escapeHTML(team.short)}
                </p>

                <p>
                    Jogadores inscritos:
                    ${teamPlayers.length}
                </p>

                <div class="form-group">

                    <label>
                        Capitão da equipa
                    </label>

                    <select
                        class="captain-select"
                        data-team-id="${team.id}"
                    >

                        <option value="">
                            Selecionar capitão
                        </option>

                        ${teamPlayers.map(player => `

                            <option
                                value="${player.id}"
                                ${
                                    player.id === team.captainId
                                    ? "selected"
                                    : ""
                                }
                            >

                                ${escapeHTML(player.name)}
                                — Nº ${player.number}

                            </option>

                        `).join("")}

                    </select>

                </div>

                <p>

                    Capitão atual:

                    <strong>
                        ${
                            captain
                            ? escapeHTML(captain.name)
                            : "Nenhum"
                        }
                    </strong>

                </p>

                <button
                    class="delete-btn"
                    data-delete-team="${team.id}"
                >
                    Eliminar equipa
                </button>

            </div>

        `;

    }).join("");

}


// ========================================
// ALTERAR CAPITÃO
// ========================================

const teamsList =
    document.getElementById("teamsList");

if (teamsList) {

    teamsList.addEventListener(
        "change",
        function (event) {

            if (
                !event.target.classList.contains(
                    "captain-select"
                )
            ) {

                return;

            }

            const teamId =
                event.target.dataset.teamId;

            const playerId =
                event.target.value;

            const team = teams.find(
                team => team.id === teamId
            );

            if (!team) return;

            if (playerId === "") {

                team.captainId = null;

            } else {

                const player = players.find(
                    player =>
                        player.id === playerId &&
                        player.teamId === teamId
                );

                if (!player) {

                    alert(
                        "Este jogador não pertence a esta equipa."
                    );

                    return;

                }

                team.captainId = playerId;

            }

            saveData();

            renderTeams();

        }
    );

}


// ========================================
// ELIMINAR EQUIPA
// ========================================

if (teamsList) {

    teamsList.addEventListener(
        "click",
        function (event) {

            const button =
                event.target.closest(
                    "[data-delete-team]"
                );

            if (!button) return;

            const id =
                button.dataset.deleteTeam;

            const index =
                teams.findIndex(
                    team => team.id === id
                );

            if (index === -1) return;

            if (!confirm(
                "Eliminar esta equipa e os seus jogadores?"
            )) {

                return;

            }

            teams.splice(index, 1);

            for (
                let i = players.length - 1;
                i >= 0;
                i--
            ) {

                if (players[i].teamId === id) {

                    players.splice(i, 1);

                }

            }

            saveData();

            renderAll();

        }
    );

}


// ========================================
// ATUALIZAR SELECTS DE EQUIPAS
// ========================================

function updateTeamSelects() {

    const selects = [

        document.getElementById("playerTeam"),
        document.getElementById("gameHome"),
        document.getElementById("gameAway")

    ];

    selects.forEach(select => {

        if (!select) return;

        const previousValue = select.value;

        select.innerHTML = `
            <option value="">
                Selecionar equipa
            </option>
        `;

        teams.forEach(team => {

            const option =
                document.createElement("option");

            option.value = team.id;

            option.textContent = team.name;

            select.appendChild(option);

        });

        if (
            teams.some(
                team => team.id === previousValue
            )
        ) {

            select.value = previousValue;

        }

    });

}


// ========================================
// CADASTRAR JOGADOR
// ========================================

const playerForm =
    document.getElementById("playerForm");

if (playerForm) {

    playerForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            const name =
                document.getElementById("playerName")
                .value.trim();

            const number =
                Number(
                    document.getElementById(
                        "playerNumber"
                    ).value
                );

            const position =
                document.getElementById(
                    "playerPosition"
                ).value;

            const teamId =
                document.getElementById(
                    "playerTeam"
                ).value;

            if (
                !name ||
                !number ||
                !position ||
                !teamId
            ) {

                alert("Preenche todos os campos.");

                return;

            }

            const team = teams.find(
                team => team.id === teamId
            );

            if (!team) {

                alert(
                    "Seleciona uma equipa válida."
                );

                return;

            }

            const duplicate = players.some(player =>
                player.teamId === teamId &&
                (
                    player.number === number ||
                    player.name.toLowerCase() ===
                    name.toLowerCase()
                )
            );

            if (duplicate) {

                alert(
                    "Este jogador ou número já está registado nessa equipa."
                );

                return;

            }

            players.push({

                id: crypto.randomUUID(),

                name,
                number,
                position,
                teamId,

                goals: 0

            });

            saveData();

            playerForm.reset();

            renderAll();

            alert(
                "Jogador cadastrado com sucesso!"
            );

        }
    );

}


// ========================================
// MOSTRAR JOGADORES
// ========================================

function renderPlayers() {

    const container =
        document.getElementById("playersList");

    if (!container) return;

    if (players.length === 0) {

        container.innerHTML = `
            <p class="empty-message">
                Ainda não existem jogadores.
            </p>
        `;

        return;

    }

    container.innerHTML = players.map(player => {

        const team = teams.find(
            team => team.id === player.teamId
        );

        return `

            <div class="list-item">

                <div>

                    <strong>
                        ${escapeHTML(player.name)}
                    </strong>

                    <p>
                        Nº ${player.number}
                        •
                        ${escapeHTML(player.position)}
                        •
                        ${
                            escapeHTML(
                                team
                                ? team.name
                                : "Sem equipa"
                            )
                        }
                    </p>

                </div>

                <button
                    class="delete-btn"
                    data-delete-player="${player.id}"
                >
                    Eliminar
                </button>

            </div>

        `;

    }).join("");

}


// ========================================
// ELIMINAR JOGADOR
// ========================================

const playersList =
    document.getElementById("playersList");

if (playersList) {

    playersList.addEventListener(
        "click",
        function (event) {

            const button =
                event.target.closest(
                    "[data-delete-player]"
                );

            if (!button) return;

            const id =
                button.dataset.deletePlayer;

            const index =
                players.findIndex(
                    player => player.id === id
                );

            if (index === -1) return;

            if (!confirm(
                "Tens a certeza de que queres eliminar este jogador?"
            )) {

                return;

            }

            players.splice(index, 1);

            teams.forEach(team => {

                if (team.captainId === id) {

                    team.captainId = null;

                }

            });

            saveData();

            renderAll();

        }
    );

}


// ========================================
// AGENDAR JOGO
// ========================================

const gameForm =
    document.getElementById("gameForm");

if (gameForm) {

    gameForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            const homeId =
                document.getElementById(
                    "gameHome"
                ).value;

            const awayId =
                document.getElementById(
                    "gameAway"
                ).value;

            const date =
                document.getElementById(
                    "gameDate"
                ).value;

            const time =
                document.getElementById(
                    "gameTime"
                ).value;

            const field =
                document.getElementById(
                    "gameField"
                ).value.trim();

            if (
                !homeId ||
                !awayId ||
                !date ||
                !time ||
                !field
            ) {

                alert(
                    "Preenche todos os campos."
                );

                return;

            }

            if (homeId === awayId) {

                alert(
                    "Uma equipa não pode jogar contra si própria."
                );

                return;

            }

            games.push({

                id: crypto.randomUUID(),

                homeId,
                awayId,

                date,
                time,
                field,

                homeScore: null,
                awayScore: null,

                status: "Agendado"

            });

            saveData();

            gameForm.reset();

            renderAll();

            alert(
                "Jogo agendado com sucesso!"
            );

        }
    );

}


// ========================================
// MOSTRAR JOGOS
// ========================================

function renderGames() {

    const container =
        document.getElementById("gamesList");

    if (!container) return;

    if (games.length === 0) {

        container.innerHTML = `
            <p class="empty-message">
                Ainda não existem jogos agendados.
            </p>
        `;

        updateResultSelect();

        return;

    }

    const sortedGames =
        [...games].sort((a, b) => {

            return new Date(
                `${a.date}T${a.time}`
            ) -
            new Date(
                `${b.date}T${b.time}`
            );

        });

    container.innerHTML =
        sortedGames.map(game => {

            const home = teams.find(
                team => team.id === game.homeId
            );

            const away = teams.find(
                team => team.id === game.awayId
            );

            return `

                <div class="list-item">

                    <div>

                        <strong>

                            ${
                                escapeHTML(
                                    home
                                    ? home.name
                                    : "Equipa removida"
                                )
                            }

                            ${
                                game.homeScore !== null
                                ? game.homeScore
                                : "-"
                            }

                            :

                            ${
                                game.awayScore !== null
                                ? game.awayScore
                                : "-"
                            }

                            ${
                                escapeHTML(
                                    away
                                    ? away.name
                                    : "Equipa removida"
                                )
                            }

                        </strong>

                        <p>

                            ${formatDate(game.date)}
                            •
                            ${escapeHTML(game.time)}
                            •
                            ${escapeHTML(game.field)}

                        </p>

                        <p>
                            ${escapeHTML(game.status)}
                        </p>

                    </div>

                </div>

            `;

        }).join("");

    updateResultSelect();

}


// ========================================
// ATUALIZAR SELECT DE RESULTADOS
// ========================================

function updateResultSelect() {

    const select =
        document.getElementById("resultGame");

    if (!select) return;

    select.innerHTML = `
        <option value="">
            Selecionar jogo
        </option>
    `;

    games.forEach(game => {

        const home = teams.find(
            team => team.id === game.homeId
        );

        const away = teams.find(
            team => team.id === game.awayId
        );

        if (!home || !away) return;

        const option =
            document.createElement("option");

        option.value = game.id;

        option.textContent =
            `${home.name} vs ${away.name} — ${formatDate(game.date)}`;

        select.appendChild(option);

    });

}


// ========================================
// REGISTAR RESULTADO
// ========================================

const resultForm =
    document.getElementById("resultForm");

if (resultForm) {

    resultForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            const gameId =
                document.getElementById(
                    "resultGame"
                ).value;

            const homeScore =
                Number(
                    document.getElementById(
                        "homeScore"
                    ).value
                );

            const awayScore =
                Number(
                    document.getElementById(
                        "awayScore"
                    ).value
                );

            if (
                !gameId ||
                homeScore < 0 ||
                awayScore < 0
            ) {

                alert(
                    "Introduz um resultado válido."
                );

                return;

            }

            const game =
                games.find(
                    game => game.id === gameId
                );

            if (!game) {

                alert(
                    "Jogo não encontrado."
                );

                return;

            }

            game.homeScore = homeScore;

            game.awayScore = awayScore;

            game.status = "Terminado";

            saveData();

            resultForm.reset();

            renderAll();

            alert(
                "Resultado registado com sucesso!"
            );

        }
    );

}


// ========================================
// FORMATAR DATA
// ========================================

function formatDate(date) {

    if (!date) return "";

    const parts = date.split("-");

    return `${parts[2]}/${parts[1]}/${parts[0]}`;

}


// ========================================
// PROTEGER TEXTO INSERIDO
// ========================================

function escapeHTML(value) {

    return String(value)

        .replaceAll("&", "&amp;")

        .replaceAll("<", "&lt;")

        .replaceAll(">", "&gt;")

        .replaceAll('"', "&quot;")

        .replaceAll("'", "&#039;");

}


// ========================================
// ATUALIZAR TUDO
// ========================================

function renderAll() {

    updateStats();

    renderChampionships();

    renderTeams();

    renderPlayers();

    renderGames();

    updateTeamSelects();

}
