// ========================================
// DADOS
// ========================================

const teams = JSON.parse(localStorage.getItem("teams")) || [];
const players = JSON.parse(localStorage.getItem("players")) || [];
const games = JSON.parse(localStorage.getItem("games")) || [];
const championships = JSON.parse(localStorage.getItem("championships")) || [];


// Normaliza nomes de turmas para impedir duplicados como "9D",
// "9.º D" e "9.ª Classe D", mantendo turmas diferentes separadas.
function normalizeTeamName(value) {
    return String(value || "")
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/\b(classe|class|turma)\b/g, "")
        .replace(/\b(\d+)\s*(?:[ºª°o]?\s*)/g, "$1")
        .replace(/[^a-z0-9]/g, "")
        .trim();
}

function getPlayerGoalsFromFinishedGames() {
    const totals = new Map();
    games.filter(g => g.status === "Terminado").forEach(game => {
        (game.scorers || []).forEach(item => {
            if (!item.playerId || !Number(item.goals)) return;
            totals.set(item.playerId, (totals.get(item.playerId) || 0) + Number(item.goals));
        });
    });
    return totals;
}

function parseScorers(text, teamId) {
    if (!text.trim()) return [];
    const result = [];
    for (const part of text.split(",")) {
        const [rawName, rawGoals] = part.split("=").map(x => x.trim());
        const goals = Number(rawGoals);
        const player = players.find(p => p.teamId === teamId && p.name.toLowerCase() === (rawName || "").toLowerCase());
        if (!player || !Number.isInteger(goals) || goals < 1) throw new Error(`Artilheiro inválido: ${rawName}. Usa Nome=Golos e seleciona um jogador dessa equipa.`);
        const existing = result.find(x => x.playerId === player.id);
        if (existing) existing.goals += goals;
        else result.push({ playerId: player.id, goals });
    }
    return result;
}


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

    document.getElementById("totalGames").textContent =
        games.filter(game => game.status !== "Terminado").length;

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

        const normalizedName = normalizeTeamName(name);
        const exists = teams.some(team =>
            normalizeTeamName(team.name) === normalizedName ||
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

        // Só é capitão válido quem pertence à própria equipa.
        const captain = teamPlayers.find(
            player => player.id === team.captainId
        );

        const availableCaptainPlayers = teamPlayers.filter(player => {
            const captainOfAnotherTeam = teams.some(otherTeam =>
                otherTeam.id !== team.id &&
                otherTeam.captainId === player.id
            );
            return !captainOfAnotherTeam || player.id === team.captainId;
        });

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
                        ${teamPlayers.length === 0 ? "disabled" : ""}
                    >

                        <option value="">
                            Selecionar capitão
                        </option>

                        ${availableCaptainPlayers.map(player => `

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

                const alreadyCaptain = teams.some(otherTeam =>
                    otherTeam.id !== teamId &&
                    otherTeam.captainId === playerId
                );

                if (alreadyCaptain) {
                    alert("Este jogador já é capitão de outra equipa.");
                    renderTeams();
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

    const currentGames = games.filter(
        game => game.status !== "Terminado"
    );

    if (currentGames.length === 0) {

        container.innerHTML = `
            <p class="empty-message">
                Não existem jogos correntes ou agendados.
            </p>
        `;

        updateResultSelect();
        renderFinishedGames();
        return;

    }

    const sortedGames =
        [...currentGames].sort((a, b) => {

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
    renderFinishedGames();

}


// ========================================
// JOGOS TERMINADOS (HISTÓRICO)
// ========================================

function renderFinishedGames() {
    const container = document.getElementById("finishedGamesList");
    if (!container) return;

    const finishedGames = games
        .filter(game => game.status === "Terminado")
        .sort((a, b) =>
            new Date(`${b.date}T${b.time}`) -
            new Date(`${a.date}T${a.time}`)
        );

    if (finishedGames.length === 0) {
        container.innerHTML = `
            <p class="empty-message">Ainda não existem jogos terminados.</p>
        `;
        return;
    }

    container.innerHTML = finishedGames.map(game => {
        const home = teams.find(team => team.id === game.homeId);
        const away = teams.find(team => team.id === game.awayId);

        return `
            <div class="list-item">
                <div>
                    <strong>
                        ${escapeHTML(home ? home.name : "Equipa removida")}
                        ${game.homeScore} : ${game.awayScore}
                        ${escapeHTML(away ? away.name : "Equipa removida")}
                    </strong>
                    <p>
                        ${formatDate(game.date)} •
                        ${escapeHTML(game.time)} •
                        ${escapeHTML(game.field)}
                    </p>
                    <p>Terminado</p>
                </div>
            </div>
        `;
    }).join("");
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

    games.filter(game => game.status !== "Terminado").forEach(game => {

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

            let homeScorers = [];
            let awayScorers = [];
            try {
                homeScorers = parseScorers(document.getElementById("homeScorers")?.value || "", game.homeId);
                awayScorers = parseScorers(document.getElementById("awayScorers")?.value || "", game.awayId);
            } catch (error) {
                alert(error.message);
                return;
            }
            const homeGoalsRecorded = homeScorers.reduce((sum, x) => sum + x.goals, 0);
            const awayGoalsRecorded = awayScorers.reduce((sum, x) => sum + x.goals, 0);
            if (homeGoalsRecorded !== homeScore || awayGoalsRecorded !== awayScore) {
                alert("A soma dos golos dos marcadores deve ser igual ao resultado. Para jogos sem golos, deixa o campo vazio.");
                return;
            }

            game.homeScore = homeScore;
            game.awayScore = awayScore;
            game.scorers = [...homeScorers, ...awayScorers];
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
// SORTEIO DE GRUPOS E GERAÇÃO AUTOMÁTICA DE JOGOS
// ========================================
function groupCountForTeamCount(count) {
    if (count < 3) return 1;
    return Math.max(1, Math.ceil(count / 4)); // grupos de cerca de 3–4 equipas
}

function shuffle(items) {
    const arr = [...items];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function selectedDrawChampionship() {
    const id = document.getElementById("drawChampionship")?.value;
    return championships.find(c => c.id === id);
}

function renderDrawChampionships() {
    const select = document.getElementById("drawChampionship");
    if (!select) return;
    const previous = select.value;
    select.innerHTML = '<option value="">Selecionar campeonato</option>' + championships.map(c => `<option value="${escapeHTML(c.id)}">${escapeHTML(c.name)}</option>`).join("");
    if (championships.some(c => c.id === previous)) select.value = previous;
    renderGroupsPreview();
}

function renderGroupsPreview() {
    const box = document.getElementById("groupsPreview");
    const champ = selectedDrawChampionship();
    if (!box) return;
    if (!champ || !champ.groups?.length) { box.innerHTML = '<p class="empty-message">Ainda não foram sorteados grupos.</p>'; return; }
    box.innerHTML = champ.groups.map(g => `<div class="list-item"><div><strong>Grupo ${escapeHTML(g.name)}</strong><p>${g.teamIds.map(id => teams.find(t => t.id === id)?.name || "Equipa removida").map(escapeHTML).join(" • ")}</p></div></div>`).join("");
}

const drawGroupsBtn = document.getElementById("drawGroupsBtn");
if (drawGroupsBtn) drawGroupsBtn.addEventListener("click", () => {
    const champ = selectedDrawChampionship();
    if (!champ) return alert("Seleciona um campeonato.");
    if (teams.length < 2) return alert("Regista pelo menos duas equipas antes do sorteio.");
    if (games.some(g => g.championshipId === champ.id && g.status === "Terminado")) return alert("Este campeonato já tem jogos terminados. Não é possível refazer o sorteio.");
    const count = groupCountForTeamCount(teams.length);
    const shuffled = shuffle(teams);
    const groups = Array.from({length: count}, (_, i) => ({name: String.fromCharCode(65 + i), teamIds: []}));
    shuffled.forEach((team, i) => groups[i % count].teamIds.push(team.id));
    champ.groups = groups;
    games.splice(0, games.length, ...games.filter(g => g.championshipId !== champ.id));
    saveData(); renderGroupsPreview(); renderAll();
    alert(`Sorteio concluído: ${count} grupo(s).`);
});

const generateGamesBtn = document.getElementById("generateGamesBtn");
if (generateGamesBtn) generateGamesBtn.addEventListener("click", () => {
    const champ = selectedDrawChampionship();
    if (!champ || !champ.groups?.length) return alert("Primeiro sorteia os grupos.");
    if (games.some(g => g.championshipId === champ.id)) return alert("Os jogos deste campeonato já foram gerados. Para evitar alterações, não serão duplicados.");
    const today = new Date().toISOString().slice(0, 10);
    let created = 0;
    champ.groups.forEach(group => {
        for (let i = 0; i < group.teamIds.length; i++) {
            for (let j = i + 1; j < group.teamIds.length; j++) {
                games.push({id: crypto.randomUUID(), championshipId: champ.id, group: group.name, phase: "Grupos", homeId: group.teamIds[i], awayId: group.teamIds[j], date: today, time: "08:00", field: "A definir", homeScore: null, awayScore: null, status: "Agendado", scorers: []});
                created++;
            }
        }
    });
    saveData(); renderAll(); alert(`${created} jogo(s) gerado(s) automaticamente. Datas, horas e campo podem ser ajustados depois.`);
});

const drawChampionshipSelect = document.getElementById("drawChampionship");
if (drawChampionshipSelect) drawChampionshipSelect.addEventListener("change", renderGroupsPreview);

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
// MODO VISITANTE (CONSULTA)
// ========================================
const homePage = document.getElementById("homePage");
const visitorPage = document.getElementById("visitorPage");
const visitorModeBtn = document.getElementById("visitorModeBtn");
const adminModeBtn = document.getElementById("adminModeBtn");
const backHomeFromVisitor = document.getElementById("backHomeFromVisitor");
const backHomeFromLogin = document.getElementById("backHomeFromLogin");

function openVisitorMode() {
    homePage?.classList.add("hidden");
    loginPage?.classList.add("hidden");
    adminPanel?.classList.add("hidden");
    visitorPage?.classList.remove("hidden");
    renderVisitor();
}
function returnHome() {
    visitorPage?.classList.add("hidden");
    loginPage?.classList.add("hidden");
    adminPanel?.classList.add("hidden");
    homePage?.classList.remove("hidden");
}
visitorModeBtn?.addEventListener("click", openVisitorMode);
adminModeBtn?.addEventListener("click", () => { homePage?.classList.add("hidden"); loginPage?.classList.remove("hidden"); });
backHomeFromVisitor?.addEventListener("click", returnHome);
backHomeFromLogin?.addEventListener("click", returnHome);

document.querySelectorAll("[data-visitor-page]").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".visitor-content-page").forEach(p => p.classList.add("hidden"));
        document.getElementById(button.dataset.visitorPage)?.classList.remove("hidden");
        document.querySelectorAll("[data-visitor-page]").forEach(b => b.classList.toggle("active", b === button));
    });
});
document.querySelectorAll("[data-visitor-open]").forEach(button => button.addEventListener("click", () => {
    document.querySelector(`[data-visitor-page="${button.dataset.visitorOpen}"]`)?.click();
}));

function visitorGameCard(game) {
    const home = teams.find(t => t.id === game.homeId); const away = teams.find(t => t.id === game.awayId);
    const score = game.status === "Terminado" ? `${game.homeScore} : ${game.awayScore}` : "- : -";
    return `<div class="list-item"><div><strong>${escapeHTML(home?.name || "Equipa removida")} ${score} ${escapeHTML(away?.name || "Equipa removida")}</strong><p>${formatDate(game.date)} • ${escapeHTML(game.time || "")} • ${escapeHTML(game.field || "A definir")}</p><p>${escapeHTML(game.status || "Agendado")}${game.group ? ` • Grupo ${escapeHTML(game.group)}` : ""}</p></div></div>`;
}
function renderVisitor() {
    const set = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };
    const upcoming = games.filter(g => g.status !== "Terminado").sort((a,b) => new Date(`${a.date}T${a.time}`)-new Date(`${b.date}T${b.time}`));
    const finished = games.filter(g => g.status === "Terminado").sort((a,b) => new Date(`${b.date}T${b.time}`)-new Date(`${a.date}T${a.time}`));
    const empty = '<p class="empty-message">Ainda não existem dados.</p>';
    const putText = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };
    putText("visitorTotalTeams", teams.length); putText("visitorTotalPlayers", players.length); putText("visitorTotalGames", upcoming.length); putText("visitorTotalResults", finished.length);
    set("visitorTeamsList", teams.length ? teams.map(t => `<div class="list-item"><div><strong>${escapeHTML(t.name)}</strong><p>${escapeHTML(t.short || "")}${t.captainId ? ` • Capitão: ${escapeHTML(players.find(p=>p.id===t.captainId)?.name || "")}` : ""}</p></div></div>`).join("") : empty);
    set("visitorPlayersList", players.length ? players.map(p => `<div class="list-item"><div><strong>${escapeHTML(p.name)}</strong><p>N.º ${escapeHTML(String(p.number))} • ${escapeHTML(p.position || "")} • ${escapeHTML(teams.find(t=>t.id===p.teamId)?.name || "Equipa removida")}</p></div></div>`).join("") : empty);
    set("visitorGamesList", upcoming.length ? upcoming.map(visitorGameCard).join("") : empty);
    set("visitorUpcomingGames", upcoming.slice(0,5).map(visitorGameCard).join("") || empty);
    set("visitorResultsList", finished.length ? finished.map(visitorGameCard).join("") : empty);
    set("visitorLatestResults", finished.slice(0,5).map(visitorGameCard).join("") || empty);
    const totals = getPlayerGoalsFromFinishedGames();
    const scorerRows = [...totals.entries()].map(([playerId, goals]) => ({player:players.find(p=>p.id===playerId), goals})).filter(x=>x.player).sort((a,b)=>b.goals-a.goals);
    set("visitorScorersList", scorerRows.length ? scorerRows.map((x,i)=>`<div class="list-item"><div><strong>${i+1}. ${escapeHTML(x.player.name)}</strong><p>${escapeHTML(teams.find(t=>t.id===x.player.teamId)?.name || "")} • ${x.goals} golo(s)</p></div></div>`).join("") : empty);
    const table = new Map(teams.map(t=>[t.id,{team:t,played:0,w:0,d:0,l:0,gm:0,gs:0,pts:0}]));
    finished.forEach(g=>{ const h=table.get(g.homeId), a=table.get(g.awayId); if(!h||!a) return; h.played++; a.played++; h.gm+=Number(g.homeScore)||0; h.gs+=Number(g.awayScore)||0; a.gm+=Number(g.awayScore)||0; a.gs+=Number(g.homeScore)||0; if(g.homeScore>g.awayScore){h.w++;h.pts+=3;a.l++;} else if(g.homeScore<g.awayScore){a.w++;a.pts+=3;h.l++;} else {h.d++;a.d++;h.pts++;a.pts++;}});
    const standings=[...table.values()].sort((a,b)=>b.pts-a.pts||(b.gm-b.gs)-(a.gm-a.gs)||b.gm-a.gm);
    set("standingsBody", standings.map((x,i)=>`<tr><td>${i+1}</td><td>${escapeHTML(x.team.name)}</td><td>${x.played}</td><td>${x.w}</td><td>${x.d}</td><td>${x.l}</td><td>${x.gm}</td><td>${x.gs}</td><td>${x.gm-x.gs}</td><td>${x.pts}</td></tr>`).join("") || '<tr><td colspan="10">Sem classificação disponível.</td></tr>');
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
    renderDrawChampionships();
    renderVisitor();

}
