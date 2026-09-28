// ========================================
// DADOS
// ========================================

const teams = JSON.parse(localStorage.getItem("teams")) || [];
const players = JSON.parse(localStorage.getItem("players")) || [];
const games = JSON.parse(localStorage.getItem("games")) || [];
const championships = JSON.parse(localStorage.getItem("championships")) || [];
const MONTHS_PT = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

function getActiveChampionship() {
    const activeChampionships = championships.filter(championship => championship.status === "ativo");
    activeChampionships.slice(1).forEach(championship => { championship.status = "terminado"; });
    if (activeChampionships.length > 1) localStorage.setItem("championships", JSON.stringify(championships));
    return activeChampionships[0];
}

function ensureActiveChampionship() {
    const active = getActiveChampionship();
    if (active) return active;
    if (championships.length) return null;

    const year = new Date().getFullYear();
    const championship = {
        id: crypto.randomUUID(),
        name: `Interturmas ${year}`,
        year,
        format: "groups_knockout",
        qualificationPoints: 9,
        winPoints: 3,
        status: "ativo"
    };
    championships.push(championship);
    localStorage.setItem("championships", JSON.stringify(championships));
    return championship;
}

function startNextSeason() {
    if (getActiveChampionship()) return alert("Já existe uma época ativa.");
    const latestYear = championships.reduce((year, item) => Math.max(year, Number(item.year) || 0), 0);
    const year = Math.max(new Date().getFullYear(), latestYear + 1);
    championships.push({
        id: crypto.randomUUID(),
        name: `Interturmas ${year}`,
        year,
        format: "groups_knockout",
        qualificationPoints: 9,
        winPoints: 3,
        status: "ativo"
    });
    saveData();
    renderAll();
}


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

function teamClassIdentity(team) {
    const normalizedName = normalizeTeamName(team?.name || "");
    const normalizedShort = normalizeTeamName(team?.short || "");
    const classMatch = `${normalizedName} ${normalizedShort}`.match(/(\d{1,2})([a-z])/);
    return classMatch ? `${classMatch[1]}${classMatch[2]}` : normalizedName;
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
        resultados: "Resultados",
        classificacaoAdmin: "Classificação"

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
        games.filter(game => game.status !== "Terminado" && game.status !== "Cancelado").length;

    document.getElementById("totalChampionships").textContent =
        championships.length;

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
                    • ${championship.status === "ativo" ? "Época ativa" : "Época terminada"}
                </p>

            </div>

            ${championship.status === "ativo" ? `
                <button type="button" class="btn-secondary" data-end-season="${escapeHTML(championship.id)}">
                    Terminar e arquivar
                </button>
            ` : ""}

            ${championship.archive ? `<button type="button" class="btn-secondary" data-toggle-history="${escapeHTML(championship.id)}">Consultar arquivo</button>` : ""}

            <button
                class="delete-btn"
                data-delete-championship="${championship.id}"
            >
                Eliminar
            </button>

            ${championship.archive ? `<div class="season-history hidden" id="history-${escapeHTML(championship.id)}">${renderSeasonArchive(championship.archive)}</div>` : ""}

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

            const endButton = event.target.closest("[data-end-season]");
            if (endButton) {
                const championship = championships.find(item => item.id === endButton.dataset.endSeason);
                finishSeason(championship);
                return;
            }

            const historyButton = event.target.closest("[data-toggle-history]");
            if (historyButton) {
                document.getElementById(`history-${historyButton.dataset.toggleHistory}`)?.classList.toggle("hidden");
                return;
            }

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

document.getElementById("startSeasonBtn")?.addEventListener("click", startNextSeason);
document.getElementById("endSeasonBtn")?.addEventListener("click", () => finishSeason(getActiveChampionship()));

function finishSeason(championship, automatic = false) {
    if (!championship || championship.status !== "ativo") return;
    if (!automatic && !confirm("Terminar esta época? Equipas e jogadores atuais serão removidos; o histórico completo ficará guardado para consulta.")) return;

    games.forEach(game => {
        if (!game.championshipId) game.championshipId = championship.id;
    });
    const seasonGames = games.filter(game => game.championshipId === championship.id);
    championship.archive = {
        teams: JSON.parse(JSON.stringify(teams)),
        players: JSON.parse(JSON.stringify(players)),
        games: JSON.parse(JSON.stringify(seasonGames)),
        standings: getChampionshipStandings(championship).map(row => ({
            ...row,
            team: JSON.parse(JSON.stringify(teams.find(team => team.id === row.teamId) || { name: "Equipa removida" }))
        }))
    };
    championship.status = "terminado";
    championship.endedAt = new Date().toISOString();
    seasonGames.forEach(game => {
        if (game.status !== "Terminado" && game.status !== "Cancelado") {
            game.status = "Cancelado";
            game.cancelledAt = championship.endedAt;
        }
    });
    championship.archive.games = JSON.parse(JSON.stringify(seasonGames));
    teams.length = 0;
    players.length = 0;
    games.length = 0;
    saveData();
    renderAll();
}

function renderSeasonArchive(archive) {
    const standings = (archive.standings || []).map((row, index) => `<tr><td>${index + 1}</td><td>${escapeHTML(row.team?.name || "Equipa")}</td><td>${row.played}</td><td>${row.points}</td></tr>`).join("");
    const rosters = (archive.teams || []).map(team => {
        const roster = (archive.players || []).filter(player => player.teamId === team.id).map(player => escapeHTML(player.name)).join(", ");
        return `<p><strong>${escapeHTML(team.name)}</strong>: ${roster || "Sem jogadores registados"}</p>`;
    }).join("");
    const results = (archive.games || []).filter(game => game.status === "Terminado").map(game => {
        const home = archive.teams.find(team => team.id === game.homeId)?.name || "Equipa";
        const away = archive.teams.find(team => team.id === game.awayId)?.name || "Equipa";
        return `<p>${escapeHTML(home)} ${escapeHTML(String(game.homeScore))} : ${escapeHTML(String(game.awayScore))} ${escapeHTML(away)}</p>`;
    }).join("");
    return `<h3>Equipas e plantéis</h3>${rosters || '<p>Sem equipas arquivadas.</p>'}<h3>Classificação final</h3><div class="table-wrapper"><table><thead><tr><th>#</th><th>Equipa</th><th>J</th><th>Pts</th></tr></thead><tbody>${standings || '<tr><td colspan="4">Sem classificação registada.</td></tr>'}</tbody></table></div><h3>Resultados arquivados</h3>${results || '<p>Sem resultados registados.</p>'}`;
}


// ========================================
// CADASTRAR EQUIPA
// ========================================

const teamForm =
    document.getElementById("teamForm");

if (teamForm) {

    teamForm.addEventListener("submit", function (event) {

        event.preventDefault();
        if (!getActiveChampionship()) return alert("O administrador deve iniciar uma época antes de cadastrar equipas.");

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

                <button
                    type="button"
                    class="text-button"
                    data-toggle-players="${team.id}"
                >
                    Jogadores inscritos: ${teamPlayers.length} ${teamPlayers.length ? "— ver lista ▾" : ""}
                </button>

                <div
                    id="team-players-${team.id}"
                    class="team-players-panel hidden"
                >
                    ${
                        teamPlayers.length
                        ? teamPlayers.map(player => `
                            <div class="list-item">
                                <div>
                                    <strong>${escapeHTML(player.name)}</strong>
                                    <p>Nº ${player.number} • ${escapeHTML(player.position)}</p>
                                </div>
                            </div>
                        `).join("")
                        : '<p class="empty-message">Sem jogadores nesta equipa.</p>'
                    }
                </div>

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

            const toggleButton =
                event.target.closest(
                    "[data-toggle-players]"
                );

            if (toggleButton) {
                const panel = document.getElementById(
                    `team-players-${toggleButton.dataset.togglePlayers}`
                );
                panel?.classList.toggle("hidden");
                return;
            }

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
            if (!getActiveChampionship()) return alert("O administrador deve iniciar uma época antes de cadastrar jogadores.");

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
            const championship = getActiveChampionship();
            if (!championship) return alert("O administrador deve iniciar uma época antes de agendar jogos.");

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
                championshipId: championship.id,

                homeId,
                awayId,

                date,
                time,
                field,

                homeScore: null,
                awayScore: null,

                status: "Agendado",
                scorers: []

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

    const currentGames = games.filter(game => game.status !== "Terminado" && game.status !== "Cancelado");

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

                    <div class="button-row">
                        <button type="button" class="btn-secondary" data-cancel-game="${game.id}">Cancelar</button>
                        <button type="button" class="delete-btn" data-delete-game="${game.id}">Eliminar</button>
                    </div>

                </div>

            `;

        }).join("");

    updateResultSelect();
    renderFinishedGames();

}


// ========================================
// ELIMINAR JOGO (AGENDADO OU TERMINADO)
// ========================================

function deleteGame(id) {
    const index = games.findIndex(game => game.id === id);
    if (index === -1) return;
    if (!confirm("Tens a certeza de que queres eliminar este jogo? Esta ação não pode ser desfeita.")) return;
    games.splice(index, 1);
    saveData();
    renderAll();
}

function cancelGame(id) {
    const game = games.find(item => item.id === id);
    if (!game || game.status === "Terminado" || game.status === "Cancelado") return;
    if (!confirm("Cancelar este jogo? O registo ficará no histórico, sem contar para a classificação.")) return;
    game.status = "Cancelado";
    game.cancelledAt = new Date().toISOString();
    advanceChampionship(game);
    saveData();
    renderAll();
}

document.getElementById("gamesList")?.addEventListener("click", (event) => {
    const cancelButton = event.target.closest("[data-cancel-game]");
    if (cancelButton) {
        cancelGame(cancelButton.dataset.cancelGame);
        return;
    }
    const button = event.target.closest("[data-delete-game]");
    if (!button) return;
    deleteGame(button.dataset.deleteGame);
});

document.getElementById("finishedGamesList")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-delete-game]");
    if (!button) return;
    deleteGame(button.dataset.deleteGame);
});


// ========================================
// JOGOS TERMINADOS (HISTÓRICO)
// ========================================

function renderFinishedGames() {
    const container = document.getElementById("finishedGamesList");
    if (!container) return;

    const finishedGames = games
        .filter(game => game.status === "Terminado" || game.status === "Cancelado")
        .sort((a, b) =>
            new Date(b.finishedAt || b.cancelledAt || `${b.date}T${b.time}`) -
            new Date(a.finishedAt || a.cancelledAt || `${a.date}T${a.time}`)
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
            <div class="list-item${isRecentGame(game) ? " recent-item" : ""}">
                <div>
                    <strong>
                        ${escapeHTML(home ? home.name : "Equipa removida")}
                        ${game.status === "Terminado" ? `${game.homeScore} : ${game.awayScore}` : "vs"}
                        ${escapeHTML(away ? away.name : "Equipa removida")}
                    </strong>
                    <p>
                        ${formatDate(game.date)} •
                        ${escapeHTML(game.time)} •
                        ${escapeHTML(game.field)}
                    </p>
                    ${game.homePenaltyScore !== undefined ? `<p>Penáltis ${game.homePenaltyScore} : ${game.awayPenaltyScore}</p>` : ""}
                    <p>${escapeHTML(game.status)}${isRecentGame(game) ? ' <span class="recent-badge">Recente</span>' : ""}</p>
                </div>
                <button
                    class="delete-btn"
                    data-delete-game="${game.id}"
                >
                    Eliminar
                </button>
            </div>
        `;
    }).join("");
}


// ========================================
// JOGO TERMINADO RECENTEMENTE (ÚLTIMAS 48H)
// ========================================

function isRecentGame(game) {
    if (game.status !== "Terminado") return false;
    const played = game.finishedAt ? new Date(game.finishedAt) : new Date(`${game.date}T${game.time || "00:00"}`);
    if (Number.isNaN(played.getTime())) return false;
    const diffHours = (Date.now() - played.getTime()) / (1000 * 60 * 60);
    return diffHours >= 0 && diffHours <= 48;
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

    games.filter(game => game.status !== "Terminado" && game.status !== "Cancelado").forEach(game => {

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

    updateKnockoutPenaltyVisibility();

}

function updateKnockoutPenaltyVisibility() {
    const game = games.find(item => item.id === document.getElementById("resultGame")?.value);
    const penaltyInputs = document.getElementById("knockoutPenaltyInputs");
    penaltyInputs?.classList.toggle("hidden", !game?.phase || game.phase === "Grupos");
}

document.getElementById("resultGame")?.addEventListener("change", updateKnockoutPenaltyVisibility);


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

            const knockoutGame = Boolean(game.phase && game.phase !== "Grupos");
            const homePenaltyInput = document.getElementById("homePenaltyScore");
            const awayPenaltyInput = document.getElementById("awayPenaltyScore");
            if (knockoutGame && homeScore === awayScore) {
                const homePenalties = Number(homePenaltyInput.value);
                const awayPenalties = Number(awayPenaltyInput.value);
                if (homePenaltyInput.value === "" || awayPenaltyInput.value === "" || !Number.isInteger(homePenalties) || !Number.isInteger(awayPenalties) || homePenalties < 0 || awayPenalties < 0 || homePenalties === awayPenalties) {
                    alert("Num empate no mata-mata, introduz os penáltis e indica um vencedor.");
                    return;
                }
                game.homePenaltyScore = homePenalties;
                game.awayPenaltyScore = awayPenalties;
            } else {
                delete game.homePenaltyScore;
                delete game.awayPenaltyScore;
            }

            game.homeScore = homeScore;
            game.awayScore = awayScore;
            game.scorers = [...homeScorers, ...awayScorers];
            game.status = "Terminado";
            game.finishedAt = new Date().toISOString();

            advanceChampionship(game);

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
// FASE DE GRUPOS E MATA-MATA AUTOMÁTICOS
// ========================================
function groupCountForTeamCount(count) {
    return count ? 1 : 0;
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
    return championships.find(c => c.id === id && c.status === "ativo");
}

function renderDrawChampionships() {
    const select = document.getElementById("drawChampionship");
    if (!select) return;
    const active = getActiveChampionship();
    select.innerHTML = active
        ? `<option value="${escapeHTML(active.id)}">${escapeHTML(active.name)}</option>`
        : '<option value="">Inicia uma época para continuar</option>';
    select.disabled = !active;
    const qualificationInput = document.getElementById("qualificationPoints");
    const winPointsInput = document.getElementById("winPoints");
    if (active) {
        if (qualificationInput) qualificationInput.value = active.qualificationPoints || 9;
        if (winPointsInput) winPointsInput.value = active.winPoints || 3;
    }
    document.getElementById("startGroupStageBtn").disabled = !active;
    document.getElementById("startKnockoutBtn").disabled = !active;
    renderGroupsPreview();
}

function renderGroupsPreview() {
    const box = document.getElementById("groupsPreview");
    const champ = selectedDrawChampionship();
    if (!box) return;
    if (!champ) { box.innerHTML = '<p class="empty-message">Inicia uma época para configurar a competição.</p>'; return; }
    if (!champ.groups?.length) { box.innerHTML = '<p class="empty-message">Ainda não foram gerados os jogos da liga.</p>'; return; }
    const qualifiedIds = getChampionshipStandings(champ).filter(row => row.points >= Number(champ.qualificationPoints || 9)).map(row => row.teamId);
    const teamsInLeague = champ.groups.flatMap(group => group.teamIds);
    box.innerHTML = `<div class="list-item"><div><strong>Liga única</strong><p>${teamsInLeague.map(id => { const team = teams.find(item => item.id === id); return `${escapeHTML(team?.name || "Equipa removida")}${qualifiedIds.includes(id) ? " • Classificada" : ""}`; }).join(" • ")}</p></div></div>`;
}

function createGroupFixtures(championship) {
    const today = new Date().toISOString().slice(0, 10);
    let created = 0;
    championship.groups.forEach(group => {
        for (let i = 0; i < group.teamIds.length; i++) {
            for (let j = i + 1; j < group.teamIds.length; j++) {
                games.push({id: crypto.randomUUID(), championshipId: championship.id, group: group.name, phase: "Grupos", homeId: group.teamIds[i], awayId: group.teamIds[j], date: today, time: "08:00", field: "A definir", homeScore: null, awayScore: null, status: "Agendado", scorers: []});
                created++;
            }
        }
    });
    return created;
}

function groupTable(championship, group) {
    const teamIds = championship.teamIds || championship.groups?.flatMap(item => item.teamIds) || group?.teamIds || teams.map(team => team.id);
    const rows = [...new Set(teamIds)].map(teamId => ({teamId, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, points: 0}));
    const byTeam = new Map(rows.map(row => [row.teamId, row]));
    games.filter(game => (game.championshipId === championship.id || !game.championshipId) && (!game.phase || game.phase === "Grupos") && game.status === "Terminado").forEach(game => {
        const home = byTeam.get(game.homeId);
        const away = byTeam.get(game.awayId);
        if (!home || !away) return;
        home.played++; away.played++;
        home.goalsFor += Number(game.homeScore) || 0;
        home.goalsAgainst += Number(game.awayScore) || 0;
        away.goalsFor += Number(game.awayScore) || 0;
        away.goalsAgainst += Number(game.homeScore) || 0;
        if (game.homeScore > game.awayScore) { home.wins++; home.points += Number(championship.winPoints) || 3; away.losses++; }
        else if (game.homeScore < game.awayScore) { away.wins++; away.points += Number(championship.winPoints) || 3; home.losses++; }
        else { home.draws++; away.draws++; home.points++; away.points++; }
    });
    return rows.sort((a, b) => b.points - a.points || (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst) || b.goalsFor - a.goalsFor);
}

function getChampionshipStandings(championship) {
    const group = championship.groups?.[0];
    return groupTable(championship, group);
}

function findClassSafePairings(entries) {
    if (!entries.length) return [];
    const classCounts = new Map();
    entries.forEach(entry => {
        const team = teams.find(item => item.id === entry.teamId);
        const identity = teamClassIdentity(team);
        classCounts.set(identity, (classCounts.get(identity) || 0) + 1);
    });
    if (Math.max(...classCounts.values()) > entries.length / 2) return null;
    const [first, ...remaining] = entries;
    for (let index = 0; index < remaining.length; index++) {
        const opponent = remaining[index];
        const firstTeam = teams.find(team => team.id === first.teamId);
        const opponentTeam = teams.find(team => team.id === opponent.teamId);
        if (firstTeam && opponentTeam && teamClassIdentity(firstTeam) === teamClassIdentity(opponentTeam)) continue;
        const rest = remaining.filter((_, itemIndex) => itemIndex !== index);
        const pairings = findClassSafePairings(rest);
        if (pairings) return [[first, opponent], ...pairings];
    }
    return null;
}

function findSafeRoundDraw(entries, byeCount) {
    function chooseByes(start, selected) {
        if (selected.length === byeCount) {
            const byeIds = new Set(selected.map(entry => entry.teamId));
            const remaining = entries.filter(entry => !byeIds.has(entry.teamId));
            const pairings = findClassSafePairings(remaining);
            return pairings ? {byes: selected, pairings} : null;
        }
        for (let index = start; index <= entries.length - (byeCount - selected.length); index++) {
            const result = chooseByes(index + 1, [...selected, entries[index]]);
            if (result) return result;
        }
        return null;
    }
    return chooseByes(0, []);
}

function startKnockoutRound(championship, advancingTeams) {
    if (advancingTeams.length < 2) return false;
    const powerOfTwo = 2 ** Math.ceil(Math.log2(advancingTeams.length));
    const byeCount = powerOfTwo - advancingTeams.length;
    const draw = findSafeRoundDraw(advancingTeams, byeCount);
    if (!draw) return false;
    const roundSize = powerOfTwo;
    const phase = roundSize === 2 ? "Final" : roundSize === 4 ? "Meias-finais" : roundSize === 8 ? "Quartos de final" : roundSize === 16 ? "Oitavos de final" : `Ronda de ${roundSize}`;
    championship.knockoutByes = draw.byes.map(row => row.teamId);
    championship.knockoutPhase = phase;
    for (const [home, away] of draw.pairings) {
        games.push({id: crypto.randomUUID(), championshipId: championship.id, phase, homeId: home.teamId, awayId: away.teamId, date: new Date().toISOString().slice(0, 10), time: "08:00", field: "A definir", homeScore: null, awayScore: null, status: "Agendado", scorers: []});
    }
    return true;
}

function advanceChampionship(game) {
    const championship = championships.find(item => item.id === game.championshipId && item.status === "ativo");
    if (!championship) return;

    if (!game.phase || game.phase === "Grupos" || game.phase !== championship.knockoutPhase) return;
    const roundGames = games.filter(item => item.championshipId === championship.id && item.phase === championship.knockoutPhase);
    if (!roundGames.length || roundGames.some(item => item.status !== "Terminado")) return;

    const winners = roundGames.map(item => {
        const homeWon = Number(item.homeScore) > Number(item.awayScore) || (Number(item.homeScore) === Number(item.awayScore) && Number(item.homePenaltyScore) > Number(item.awayPenaltyScore));
        return homeWon ? item.homeId : item.awayId;
    });
    const order = championship.knockoutSeedOrder || [];
    const advancingIds = [...(championship.knockoutByes || []), ...winners].sort((a, b) => order.indexOf(a) - order.indexOf(b));
    if (championship.knockoutPhase === "Final") return;

    championship.knockoutByes = [];
    if (!startKnockoutRound(championship, advancingIds.map(teamId => ({teamId})))) {
        alert("Não foi possível criar esta ronda sem confrontos entre equipas da mesma turma.");
    }
}

const startGroupStageBtn = document.getElementById("startGroupStageBtn");
if (startGroupStageBtn) startGroupStageBtn.addEventListener("click", () => {
    const champ = selectedDrawChampionship();
    if (!champ) return alert("Inicia uma época antes de gerar os jogos.");
    if (teams.length < 2) return alert("Regista pelo menos duas equipas antes do sorteio.");
    if (games.some(g => g.championshipId === champ.id)) return alert("A fase desta época já foi gerada.");
    const qualificationPoints = Number(document.getElementById("qualificationPoints").value);
    const winPoints = Number(document.getElementById("winPoints").value);
    if (!Number.isInteger(qualificationPoints) || qualificationPoints < 1 || !Number.isInteger(winPoints) || winPoints < 1) return alert("Define valores de pontos válidos.");
    champ.qualificationPoints = qualificationPoints;
    champ.winPoints = winPoints;
    champ.teamIds = teams.map(team => team.id);
    champ.groups = [{name: "Liga", teamIds: teams.map(team => team.id)}];
    const created = createGroupFixtures(champ);
    saveData(); renderAll(); alert(`${created} jogo(s) gerado(s) automaticamente. Datas, horas e campo podem ser ajustados depois.`);
});

document.getElementById("startKnockoutBtn")?.addEventListener("click", () => {
    const championship = selectedDrawChampionship();
    if (!championship) return alert("Inicia uma época antes de gerar o mata-mata.");
    if (championship.knockoutStarted) return alert("O mata-mata desta época já foi iniciado.");
    const threshold = Number(championship.qualificationPoints || 9);
    const qualifiers = getChampionshipStandings(championship).filter(row => row.points >= threshold);
    if (qualifiers.length < 2) return alert(`São necessárias pelo menos duas equipas com ${threshold} pontos para gerar o mata-mata.`);
    championship.knockoutSeedOrder = qualifiers.map(row => row.teamId);
    if (!startKnockoutRound(championship, qualifiers)) {
        return alert("Não existe um sorteio possível sem colocar equipas da mesma turma frente a frente.");
    }
    championship.knockoutStarted = true;
    saveData();
    renderAll();
});

const drawChampionshipSelect = document.getElementById("drawChampionship");
if (drawChampionshipSelect) drawChampionshipSelect.addEventListener("change", renderGroupsPreview);

function saveSeasonPoints() {
    const championship = selectedDrawChampionship();
    if (!championship) return;
    const qualificationPoints = Number(document.getElementById("qualificationPoints").value);
    const winPoints = Number(document.getElementById("winPoints").value);
    if (Number.isInteger(qualificationPoints) && qualificationPoints > 0) championship.qualificationPoints = qualificationPoints;
    if (Number.isInteger(winPoints) && winPoints > 0) championship.winPoints = winPoints;
    saveData();
    renderAll();
}
document.getElementById("qualificationPoints")?.addEventListener("change", saveSeasonPoints);
document.getElementById("winPoints")?.addEventListener("change", saveSeasonPoints);

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

document.getElementById("visitorTeamsList")?.addEventListener("click", (event) => {
    const card = event.target.closest("[data-team-toggle]");
    if (!card) return;
    document.getElementById(`team-public-players-${card.dataset.teamToggle}`)?.classList.toggle("hidden");
});
document.getElementById("visitorTeamsList")?.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const card = event.target.closest("[data-team-toggle]");
    if (!card) return;
    event.preventDefault();
    document.getElementById(`team-public-players-${card.dataset.teamToggle}`)?.classList.toggle("hidden");
});

function visitorGameCard(game) {
    const home = teams.find(t => t.id === game.homeId);
    const away = teams.find(t => t.id === game.awayId);
    const finished = game.status === "Terminado";

    const dateParts = String(game.date || "").split("-");
    const day = dateParts[2] || "--";
    const month = dateParts[1] ? MONTHS_PT[Number(dateParts[1]) - 1] : "";

    const middle = finished
        ? `<div class="game-score">${escapeHTML(String(game.homeScore))} : ${escapeHTML(String(game.awayScore))}</div>`
        : `<div class="game-vs">vs</div>`;

    const recent = finished && isRecentGame(game);

    return `
        <div class="public-game-card${recent ? " recent-item" : ""}">
            <div class="game-date-box">
                <strong>${escapeHTML(day)}</strong>
                <span>${escapeHTML(month)}</span>
            </div>
            <div class="game-teams">
                <div class="game-team home">${escapeHTML(home?.name || "Equipa removida")}</div>
                ${middle}
                <div class="game-team away">${escapeHTML(away?.name || "Equipa removida")}</div>
            </div>
            <div class="game-meta">
                ${escapeHTML(game.time || "")} • ${escapeHTML(game.field || "A definir")}
                <br>
                <span class="game-status${finished ? " finished" : ""}">
                    ${escapeHTML(game.status || "Agendado")}${game.group ? ` • Grupo ${escapeHTML(game.group)}` : ""}
                </span>
                ${game.homePenaltyScore !== undefined ? `<br><span>Penáltis ${game.homePenaltyScore} : ${game.awayPenaltyScore}</span>` : ""}
                ${recent ? '<br><span class="recent-badge">Recente</span>' : ""}
            </div>
        </div>
    `;
}

function visitorTeamCard(team) {
    const captain = players.find(p => p.id === team.captainId);
    const teamPlayers = players.filter(p => p.teamId === team.id);
    return `
        <div class="public-team-card" data-team-toggle="${team.id}" role="button" tabindex="0">
            <div class="team-short">${escapeHTML(team.short || "")}</div>
            <h3>${escapeHTML(team.name)}</h3>
            <p>${teamPlayers.length} jogador(es) inscrito(s) — clica para ver o plantel</p>
            <div class="captain-public">
                Capitão: ${captain ? escapeHTML(captain.name) : "Nenhum"}
            </div>
            <div id="team-public-players-${team.id}" class="team-players-panel hidden">
                ${
                    teamPlayers.length
                    ? teamPlayers.map(visitorPlayerCard).join("")
                    : '<p class="empty-message">Sem jogadores nesta equipa.</p>'
                }
            </div>
        </div>
    `;
}

function visitorPlayerCard(player) {
    const team = teams.find(t => t.id === player.teamId);
    return `
        <div class="player-public-card">
            <div class="player-number">${escapeHTML(String(player.number))}</div>
            <div>
                <h3>${escapeHTML(player.name)}</h3>
                <p>${escapeHTML(player.position || "")} • ${escapeHTML(team?.name || "Sem equipa")}</p>
            </div>
        </div>
    `;
}

function visitorScorerCard(entry, index) {
    const teamName = teams.find(t => t.id === entry.player.teamId)?.name || "";
    return `
        <div class="scorer-card">
            <div class="scorer-position">${index + 1}º</div>
            <div>
                <strong>${escapeHTML(entry.player.name)}</strong>
                <small>${escapeHTML(teamName)}</small>
            </div>
            <div class="scorer-goals">${entry.goals}</div>
        </div>
    `;
}

function renderVisitor() {
    const set = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };
    const activeChampionship = getActiveChampionship();
    const currentGames = games.filter(game => activeChampionship && (game.championshipId === activeChampionship.id || !game.championshipId));
    const upcoming = currentGames.filter(g => g.status !== "Terminado" && g.status !== "Cancelado").sort((a,b) => new Date(`${a.date}T${a.time}`)-new Date(`${b.date}T${b.time}`));
    const finished = currentGames.filter(g => g.status === "Terminado").sort((a,b) => new Date(b.finishedAt || `${b.date}T${b.time}`)-new Date(a.finishedAt || `${a.date}T${a.time}`));
    const empty = '<div class="empty-public">Ainda não existem dados.</div>';
    const putText = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };

    putText("visitorTotalTeams", teams.length);
    putText("visitorTotalPlayers", players.length);
    putText("visitorTotalGames", upcoming.length);
    putText("visitorTotalResults", finished.length);

    set("visitorTeamsList", teams.length ? teams.map(visitorTeamCard).join("") : empty);
    set("visitorPlayersList", players.length ? players.map(visitorPlayerCard).join("") : empty);
    set("visitorGamesList", upcoming.length ? upcoming.map(visitorGameCard).join("") : empty);
    set("visitorUpcomingGames", upcoming.slice(0,5).map(visitorGameCard).join("") || empty);
    set("visitorResultsList", finished.length ? finished.map(visitorGameCard).join("") : empty);
    set("visitorLatestResults", finished.slice(0,5).map(visitorGameCard).join("") || empty);

    const totals = getPlayerGoalsFromFinishedGames();
    const scorerRows = [...totals.entries()]
        .map(([playerId, goals]) => ({ player: players.find(p => p.id === playerId), goals }))
        .filter(x => x.player)
        .sort((a,b) => b.goals - a.goals);
    set("visitorScorersList", scorerRows.length ? scorerRows.map(visitorScorerCard).join("") : empty);

    const standings = activeChampionship ? getChampionshipStandings(activeChampionship) : [];
    const threshold = Number(activeChampionship?.qualificationPoints || 9);
    set("standingsBody", standings.map((row, index) => {
        const team = teams.find(item => item.id === row.teamId);
        const qualified = row.points >= threshold;
        return `<tr><td>${index + 1}</td><td>${escapeHTML(team?.name || "Equipa")}</td><td>${row.played}</td><td>${row.wins}</td><td>${row.draws}</td><td>${row.losses}</td><td>${row.goalsFor}</td><td>${row.goalsAgainst}</td><td>${row.goalsFor - row.goalsAgainst}</td><td>${row.points}</td><td>${qualified ? "Classificada" : "Em disputa"}</td></tr>`;
    }).join("") || '<tr><td colspan="11">Sem classificação disponível.</td></tr>');
    set("visitorBracket", renderVisitorBracket(activeChampionship, currentGames) || empty);
    const pointsNote = activeChampionship
        ? `Qualificação automática aos ${threshold} pontos. A vitória vale ${Number(activeChampionship.winPoints) || 3} pontos e o empate vale 1.`
        : "Não existe uma época ativa neste momento.";
    const qualificationNote = document.getElementById("adminQualificationNote");
    if (qualificationNote) qualificationNote.textContent = pointsNote;
}

function renderAdminStandings() {
    const body = document.getElementById("adminStandingsBody");
    if (!body) return;
    const championship = getActiveChampionship();
    const standings = championship ? getChampionshipStandings(championship) : [];
    const target = Number(championship?.qualificationPoints || 9);
    body.innerHTML = standings.map((row, index) => {
        const team = teams.find(item => item.id === row.teamId);
        return `<tr><td>${index + 1}</td><td>${escapeHTML(team?.name || "Equipa")}</td><td>${row.played}</td><td>${row.wins}</td><td>${row.draws}</td><td>${row.losses}</td><td>${row.goalsFor}</td><td>${row.goalsAgainst}</td><td>${row.goalsFor - row.goalsAgainst}</td><td>${row.points}</td><td>${row.points >= target ? "Classificada" : "Em disputa"}</td></tr>`;
    }).join("") || '<tr><td colspan="11">Sem classificação disponível.</td></tr>';
}

function renderVisitorBracket(championship, seasonGames) {
    if (!championship) return "";
    const knockoutGames = seasonGames.filter(game => game.phase && game.phase !== "Grupos");
    if (!knockoutGames.length) return "<p class=\"empty-message\">A chave será apresentada quando o administrador gerar o mata-mata.</p>";
    const rounds = [...new Set(knockoutGames.map(game => game.phase))];
    return rounds.map(phase => {
        const matches = knockoutGames.filter(game => game.phase === phase);
        const cards = matches.map(game => {
            const home = teams.find(team => team.id === game.homeId)?.name || "Equipa";
            const away = teams.find(team => team.id === game.awayId)?.name || "Equipa";
            const score = game.status === "Terminado" ? `${game.homeScore} : ${game.awayScore}` : "vs";
            return `<div class="bracket-match"><div>${escapeHTML(home)}</div><strong>${escapeHTML(score)}</strong><div>${escapeHTML(away)}</div></div>`;
        }).join("");
        return `<div class="bracket-round"><h3>${escapeHTML(phase)}</h3>${cards}</div>`;
    }).join("");
}

// ========================================
// ATUALIZAR TUDO
// ========================================

function renderAll() {

    const activeChampionship = ensureActiveChampionship();

    const startSeasonButton = document.getElementById("startSeasonBtn");
    const endSeasonButton = document.getElementById("endSeasonBtn");
    const seasonStatusNote = document.getElementById("seasonStatusNote");
    if (startSeasonButton) startSeasonButton.classList.toggle("hidden", Boolean(activeChampionship));
    if (endSeasonButton) endSeasonButton.classList.toggle("hidden", !activeChampionship);
    if (seasonStatusNote) seasonStatusNote.textContent = activeChampionship
        ? `${activeChampionship.name} está ativa. Ao terminar, os dados atuais serão limpos e o arquivo ficará disponível para consulta.`
        : "Não existe época ativa. Inicia uma época para voltar a cadastrar equipas, jogadores e jogos.";

    updateStats();

    renderChampionships();

    renderTeams();

    renderPlayers();

    renderGames();

    updateTeamSelects();
    renderDrawChampionships();
    renderVisitor();
    renderAdminStandings();

}
