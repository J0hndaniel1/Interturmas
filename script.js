// =====================================================
// DADOS
// =====================================================

const teams =
    JSON.parse(localStorage.getItem("teams")) || [];

const players =
    JSON.parse(localStorage.getItem("players")) || [];

const games =
    JSON.parse(localStorage.getItem("games")) || [];

const championships =
    JSON.parse(localStorage.getItem("championships")) || [];


// =====================================================
// ELEMENTOS PRINCIPAIS
// =====================================================

const homePage =
    document.getElementById("homePage");

const visitorPage =
    document.getElementById("visitorPage");

const loginPage =
    document.getElementById("loginPage");

const adminPanel =
    document.getElementById("adminPanel");

const loginForm =
    document.getElementById("loginForm");

const loginMessage =
    document.getElementById("loginMessage");

const logoutBtn =
    document.getElementById("logoutBtn");


// =====================================================
// LOGIN DEMONSTRATIVO
// =====================================================

const DEMO_EMAIL = "listaM@adm.com";

const DEMO_PASSWORD = "ListaM";


// =====================================================
// NAVEGAÇÃO PRINCIPAL
// =====================================================

const visitorModeBtn =
    document.getElementById("visitorModeBtn");

const adminModeBtn =
    document.getElementById("adminModeBtn");

const backHomeFromVisitor =
    document.getElementById("backHomeFromVisitor");

const backHomeFromLogin =
    document.getElementById("backHomeFromLogin");


function hideAllMainModes() {

    if (homePage) {
        homePage.classList.add("hidden");
    }

    if (visitorPage) {
        visitorPage.classList.add("hidden");
    }

    if (loginPage) {
        loginPage.classList.add("hidden");
    }

    if (adminPanel) {
        adminPanel.classList.add("hidden");
    }

}


// =====================================================
// MODO VISITANTE
// =====================================================

if (visitorModeBtn) {

    visitorModeBtn.addEventListener(
        "click",
        function () {

            hideAllMainModes();

            visitorPage.classList.remove("hidden");

            renderVisitorAll();

        }
    );

}


// =====================================================
// MODO ADMINISTRADOR
// =====================================================

if (adminModeBtn) {

    adminModeBtn.addEventListener(
        "click",
        function () {

            hideAllMainModes();

            loginPage.classList.remove("hidden");

        }
    );

}


// =====================================================
// VOLTAR AO INÍCIO
// =====================================================

if (backHomeFromVisitor) {

    backHomeFromVisitor.addEventListener(
        "click",
        function () {

            hideAllMainModes();

            homePage.classList.remove("hidden");

        }
    );

}


if (backHomeFromLogin) {

    backHomeFromLogin.addEventListener(
        "click",
        function () {

            hideAllMainModes();

            homePage.classList.remove("hidden");

            if (loginForm) {
                loginForm.reset();
            }

            if (loginMessage) {
                loginMessage.textContent = "";
            }

        }
    );

}


// =====================================================
// LOGIN
// =====================================================

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            const emailInput =
                document.getElementById("email");

            const passwordInput =
                document.getElementById("password");

            const email =
                emailInput.value.trim();

            const password =
                passwordInput.value;

            if (
                email === DEMO_EMAIL &&
                password === DEMO_PASSWORD
            ) {

                sessionStorage.setItem(
                    "adminLoggedIn",
                    "true"
                );

                loginMessage.textContent = "";

                showAdminPanel();

            } else {

                loginMessage.textContent =
                    "E-mail ou palavra-passe incorretos.";

            }

        }
    );

}


// =====================================================
// MOSTRAR PAINEL ADMIN
// =====================================================

function showAdminPanel() {

    hideAllMainModes();

    adminPanel.classList.remove("hidden");

    renderAll();

}


// =====================================================
// LOGOUT
// =====================================================

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        function () {

            sessionStorage.removeItem(
                "adminLoggedIn"
            );

            hideAllMainModes();

            homePage.classList.remove("hidden");

            if (loginForm) {
                loginForm.reset();
            }

            if (loginMessage) {
                loginMessage.textContent = "";
            }

        }
    );

}


// =====================================================
// NAVEGAÇÃO ADMIN
// =====================================================

const navButtons =
    document.querySelectorAll(".nav-btn");

navButtons.forEach(button => {

    button.addEventListener(
        "click",
        function () {

            showPage(button.dataset.page);

        }
    );

});


function showPage(pageId) {

    document
        .querySelectorAll(".admin-page")
        .forEach(page => {

            page.classList.add("hidden");

        });


    const page =
        document.getElementById(pageId);


    if (page) {

        page.classList.remove("hidden");

    }


    navButtons.forEach(button => {

        button.classList.remove("active");

        if (
            button.dataset.page === pageId
        ) {

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


    const pageTitle =
        document.getElementById("pageTitle");


    if (pageTitle) {

        pageTitle.textContent =
            titles[pageId] || "Administração";

    }

}


// =====================================================
// ACESSO RÁPIDO ADMIN
// =====================================================

document
    .querySelectorAll("[data-open]")
    .forEach(button => {

        button.addEventListener(
            "click",
            function () {

                showPage(
                    button.dataset.open
                );

            }
        );

    });


// =====================================================
// GUARDAR DADOS
// =====================================================

function saveData() {

    localStorage.setItem(
        "teams",
        JSON.stringify(teams)
    );

    localStorage.setItem(
        "players",
        JSON.stringify(players)
    );

    localStorage.setItem(
        "games",
        JSON.stringify(games)
    );

    localStorage.setItem(
        "championships",
        JSON.stringify(championships)
    );

}


// =====================================================
// ESTATÍSTICAS ADMIN
// =====================================================

function updateStats() {

    const activeGames =
        games.filter(
            game => game.status !== "Terminado"
        );


    const totalTeams =
        document.getElementById("totalTeams");

    const totalPlayers =
        document.getElementById("totalPlayers");

    const totalGames =
        document.getElementById("totalGames");

    const totalChampionships =
        document.getElementById("totalChampionships");


    if (totalTeams) {
        totalTeams.textContent =
            teams.length;
    }

    if (totalPlayers) {
        totalPlayers.textContent =
            players.length;
    }

    if (totalGames) {
        totalGames.textContent =
            activeGames.length;
    }

    if (totalChampionships) {
        totalChampionships.textContent =
            championships.length;
    }

}


// =====================================================
// CAMPEONATOS
// =====================================================

const championshipForm =
    document.getElementById(
        "championshipForm"
    );


if (championshipForm) {

    championshipForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const name =
                document
                    .getElementById(
                        "championshipName"
                    )
                    .value
                    .trim();


            const year =
                document.getElementById(
                    "championshipYear"
                ).value;


            const format =
                document.getElementById(
                    "championshipFormat"
                ).value;


            if (
                !name ||
                !year ||
                !format
            ) {

                alert(
                    "Preenche todos os campos."
                );

                return;

            }


            const exists =
                championships.some(
                    championship =>
                        championship.name
                            .toLowerCase() ===
                        name.toLowerCase()
                );


            if (exists) {

                alert(
                    "Já existe um campeonato com esse nome."
                );

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


            alert(
                "Campeonato criado com sucesso!"
            );

        }
    );

}


// =====================================================
// MOSTRAR CAMPEONATOS
// =====================================================

function renderChampionships() {

    const container =
        document.getElementById(
            "championshipsList"
        );


    if (!container) return;


    if (championships.length === 0) {

        container.innerHTML = `
            <p class="empty-message">
                Ainda não existem campeonatos.
            </p>
        `;

        return;

    }


    container.innerHTML =
        championships
            .map(championship => `

                <div class="list-item">

                    <div>

                        <strong>
                            ${escapeHTML(
                                championship.name
                            )}
                        </strong>

                        <p>
                            ${escapeHTML(
                                String(
                                    championship.year
                                )
                            )}

                            •

                            ${
                                championship.format ===
                                "knockout"
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

            `)
            .join("");

}


// =====================================================
// ELIMINAR CAMPEONATO
// =====================================================

const championshipsList =
    document.getElementById(
        "championshipsList"
    );


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
                button.dataset
                    .deleteChampionship;


            const index =
                championships.findIndex(
                    championship =>
                        championship.id === id
                );


            if (index === -1) return;


            if (
                !confirm(
                    "Tens a certeza de que queres eliminar este campeonato?"
                )
            ) {

                return;

            }


            championships.splice(
                index,
                1
            );


            saveData();

            renderAll();

        }
    );

}


// =====================================================
// EQUIPAS
// =====================================================

const teamForm =
    document.getElementById(
        "teamForm"
    );


if (teamForm) {

    teamForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const name =
                document
                    .getElementById(
                        "teamName"
                    )
                    .value
                    .trim();


            const short =
                document
                    .getElementById(
                        "teamShort"
                    )
                    .value
                    .trim();


            if (!name || !short) {

                alert(
                    "Preenche todos os campos."
                );

                return;

            }


            const exists =
                teams.some(
                    team =>
                        team.name
                            .toLowerCase() ===
                            name.toLowerCase()
                        ||
                        team.short
                            .toLowerCase() ===
                            short.toLowerCase()
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


            alert(
                "Equipa cadastrada com sucesso!"
            );

        }
    );

}


// =====================================================
// VERIFICAR SE JOGADOR JÁ É CAPITÃO
// =====================================================

function isPlayerCaptainElsewhere(
    playerId,
    currentTeamId
) {

    return teams.some(
        team =>
            team.id !== currentTeamId &&
            team.captainId === playerId
    );

}


// =====================================================
// LIMPAR CAPITÃES INVÁLIDOS
// =====================================================

function cleanInvalidCaptains() {

    let changed = false;


    teams.forEach(team => {

        if (!team.captainId) {
            return;
        }


        const player =
            players.find(
                player =>
                    player.id ===
                        team.captainId &&
                    player.teamId ===
                        team.id
            );


        if (!player) {

            team.captainId = null;

            changed = true;

        }

    });


    // Impedir um jogador de ser capitão
    // em duas equipas.

    const usedCaptains = new Set();


    teams.forEach(team => {

        if (!team.captainId) {
            return;
        }


        if (
            usedCaptains.has(
                team.captainId
            )
        ) {

            team.captainId = null;

            changed = true;

        } else {

            usedCaptains.add(
                team.captainId
            );

        }

    });


    if (changed) {
        saveData();
    }

}


// =====================================================
// MOSTRAR EQUIPAS
// =====================================================

function renderTeams() {

    cleanInvalidCaptains();


    const container =
        document.getElementById(
            "teamsList"
        );


    if (!container) return;


    if (teams.length === 0) {

        container.innerHTML = `
            <p class="empty-message">
                Ainda não existem equipas.
            </p>
        `;

        return;

    }


    container.innerHTML =
        teams.map(team => {

            const teamPlayers =
                players.filter(
                    player =>
                        player.teamId ===
                        team.id
                );


            const captain =
                teamPlayers.find(
                    player =>
                        player.id ===
                        team.captainId
                );


            const availablePlayers =
                teamPlayers.filter(
                    player =>
                        !isPlayerCaptainElsewhere(
                            player.id,
                            team.id
                        )
                        ||
                        player.id ===
                            team.captainId
                );


            return `

                <div class="content-card">

                    <h3>
                        ${escapeHTML(
                            team.name
                        )}
                    </h3>

                    <p>
                        Sigla:
                        ${escapeHTML(
                            team.short
                        )}
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
                            ${
                                teamPlayers.length === 0
                                    ? "disabled"
                                    : ""
                            }
                        >

                            <option value="">
                                ${
                                    teamPlayers.length === 0
                                        ? "Sem jogadores disponíveis"
                                        : "Selecionar capitão"
                                }
                            </option>

                            ${availablePlayers
                                .map(player => `

                                    <option
                                        value="${player.id}"
                                        ${
                                            player.id ===
                                            team.captainId
                                                ? "selected"
                                                : ""
                                        }
                                    >

                                        ${escapeHTML(
                                            player.name
                                        )}

                                        — Nº
                                        ${player.number}

                                    </option>

                                `)
                                .join("")}

                        </select>

                        ${
                            teamPlayers.length === 0
                                ? ""
                                : availablePlayers.length === 0
                                    ? `
                                        <p class="captain-warning">
                                            Todos os jogadores desta equipa
                                            já estão associados a outra função
                                            de capitão.
                                        </p>
                                      `
                                    : ""
                        }

                    </div>

                    <p>

                        Capitão atual:

                        <strong>
                            ${
                                captain
                                    ? escapeHTML(
                                        captain.name
                                    )
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


// =====================================================
// ALTERAR CAPITÃO
// =====================================================

const teamsList =
    document.getElementById(
        "teamsList"
    );


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


            const team =
                teams.find(
                    team =>
                        team.id ===
                        teamId
                );


            if (!team) return;


            if (playerId === "") {

                team.captainId = null;

            } else {

                const player =
                    players.find(
                        player =>
                            player.id ===
                                playerId &&
                            player.teamId ===
                                teamId
                    );


                if (!player) {

                    alert(
                        "Este jogador não pertence a esta equipa."
                    );

                    renderTeams();

                    return;

                }


                if (
                    isPlayerCaptainElsewhere(
                        playerId,
                        teamId
                    )
                ) {

                    alert(
                        "Este jogador já é capitão de outra equipa."
                    );

                    renderTeams();

                    return;

                }


                team.captainId =
                    playerId;

            }


            saveData();

            renderTeams();

            renderVisitorAll();

        }
    );

}


// =====================================================
// ELIMINAR EQUIPA
// =====================================================

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
                    team =>
                        team.id === id
                );


            if (index === -1) return;


            if (
                !confirm(
                    "Eliminar esta equipa e os seus jogadores?"
                )
            ) {

                return;

            }


            teams.splice(
                index,
                1
            );


            for (
                let i = players.length - 1;
                i >= 0;
                i--
            ) {

                if (
                    players[i].teamId === id
                ) {

                    players.splice(
                        i,
                        1
                    );

                }

            }


            saveData();

            renderAll();

        }
    );

}


// =====================================================
// SELECTS DE EQUIPAS
// =====================================================

function updateTeamSelects() {

    const selects = [

        document.getElementById(
            "playerTeam"
        ),

        document.getElementById(
            "gameHome"
        ),

        document.getElementById(
            "gameAway"
        )

    ];


    selects.forEach(select => {

        if (!select) return;


        const previousValue =
            select.value;


        select.innerHTML = `
            <option value="">
                Selecionar equipa
            </option>
        `;


        teams.forEach(team => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                team.id;


            option.textContent =
                team.name;


            select.appendChild(
                option
            );

        });


        if (
            teams.some(
                team =>
                    team.id ===
                    previousValue
            )
        ) {

            select.value =
                previousValue;

        }

    });

}


// =====================================================
// JOGADORES
// =====================================================

const playerForm =
    document.getElementById(
        "playerForm"
    );


if (playerForm) {

    playerForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const name =
                document
                    .getElementById(
                        "playerName"
                    )
                    .value
                    .trim();


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

                alert(
                    "Preenche todos os campos."
                );

                return;

            }


            const team =
                teams.find(
                    team =>
                        team.id ===
                        teamId
                );


            if (!team) {

                alert(
                    "Seleciona uma equipa válida."
                );

                return;

            }


            const duplicate =
                players.some(
                    player =>
                        player.teamId ===
                            teamId &&
                        (
                            player.number ===
                                number
                            ||
                            player.name
                                .toLowerCase() ===
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


// =====================================================
// MOSTRAR JOGADORES
// =====================================================

function renderPlayers() {

    const container =
        document.getElementById(
            "playersList"
        );


    if (!container) return;


    if (players.length === 0) {

        container.innerHTML = `
            <p class="empty-message">
                Ainda não existem jogadores.
            </p>
        `;

        return;

    }


    container.innerHTML =
        players.map(player => {

            const team =
                teams.find(
                    team =>
                        team.id ===
                        player.teamId
                );


            return `

                <div class="list-item">

                    <div>

                        <strong>
                            ${escapeHTML(
                                player.name
                            )}
                        </strong>

                        <p>

                            Nº ${player.number}

                            •

                            ${escapeHTML(
                                player.position
                            )}

                            •

                            ${
                                escapeHTML(
                                    team
                                        ? team.name
                                        : "Sem equipa"
                                )
                            }

                            •

                            ${player.goals || 0} golos

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


// =====================================================
// ELIMINAR JOGADOR
// =====================================================

const playersList =
    document.getElementById(
        "playersList"
    );


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
                button.dataset
                    .deletePlayer;


            const index =
                players.findIndex(
                    player =>
                        player.id === id
                );


            if (index === -1) return;


            if (
                !confirm(
                    "Tens a certeza de que queres eliminar este jogador?"
                )
            ) {

                return;

            }


            players.splice(
                index,
                1
            );


            teams.forEach(team => {

                if (
                    team.captainId ===
                    id
                ) {

                    team.captainId =
                        null;

                }

            });


            saveData();

            renderAll();

        }
    );

}


// =====================================================
// AGENDAR JOGO
// =====================================================

const gameForm =
    document.getElementById(
        "gameForm"
    );


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
                )
                .value
                .trim();


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


            if (
                homeId === awayId
            ) {

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

                status: "Agendado",

                createdAt:
                    new Date().toISOString()

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


// =====================================================
// JOGOS ATIVOS
// =====================================================

function getActiveGames() {

    return games
        .filter(
            game =>
                game.status !==
                "Terminado"
        )
        .sort(
            (a, b) =>
                new Date(
                    `${a.date}T${a.time}`
                ) -
                new Date(
                    `${b.date}T${b.time}`
                )
        );

}


// =====================================================
// JOGOS TERMINADOS
// =====================================================

function getFinishedGames() {

    return games
        .filter(
            game =>
                game.status ===
                "Terminado"
        )
        .sort(
            (a, b) =>
                new Date(
                    `${b.date}T${b.time}`
                ) -
                new Date(
                    `${a.date}T${a.time}`
                )
        );

}


// =====================================================
// MOSTRAR JOGOS ADMIN
// =====================================================

function renderGames() {

    const container =
        document.getElementById(
            "gamesList"
        );


    if (!container) return;


    const activeGames =
        getActiveGames();


    if (activeGames.length === 0) {

        container.innerHTML = `
            <p class="empty-message">
                Não existem jogos correntes.
            </p>
        `;

        updateResultSelect();

        return;

    }


    container.innerHTML =
        activeGames.map(game => {

            const home =
                teams.find(
                    team =>
                        team.id ===
                        game.homeId
                );


            const away =
                teams.find(
                    team =>
                        team.id ===
                        game.awayId
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

                            vs

                            ${
                                escapeHTML(
                                    away
                                        ? away.name
                                        : "Equipa removida"
                                )
                            }

                        </strong>

                        <p>

                            ${formatDate(
                                game.date
                            )}

                            •

                            ${escapeHTML(
                                game.time
                            )}

                            •

                            ${escapeHTML(
                                game.field
                            )}

                        </p>

                        <p>
                            Estado:
                            ${escapeHTML(
                                game.status
                            )}
                        </p>

                    </div>

                </div>

            `;

        }).join("");


    updateResultSelect();

}


// =====================================================
// SELECT DE RESULTADOS
// =====================================================

function updateResultSelect() {

    const select =
        document.getElementById(
            "resultGame"
        );


    if (!select) return;


    select.innerHTML = `
        <option value="">
            Selecionar jogo
        </option>
    `;


    getActiveGames().forEach(game => {

        const home =
            teams.find(
                team =>
                    team.id ===
                    game.homeId
            );


        const away =
            teams.find(
                team =>
                    team.id ===
                    game.awayId
            );


        if (!home || !away) {
            return;
        }


        const option =
            document.createElement(
                "option"
            );


        option.value =
            game.id;


        option.textContent =
            `${home.name} vs ${away.name} — ${formatDate(game.date)}`;


        select.appendChild(
            option
        );

    });

}


// =====================================================
// REGISTAR RESULTADO
// =====================================================

const resultForm =
    document.getElementById(
        "resultForm"
    );


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
                    game =>
                        game.id ===
                        gameId
                );


            if (!game) {

                alert(
                    "Jogo não encontrado."
                );

                return;

            }


            if (
                game.status ===
                "Terminado"
            ) {

                alert(
                    "Este jogo já foi terminado."
                );

                return;

            }


            game.homeScore =
                homeScore;


            game.awayScore =
                awayScore;


            game.status =
                "Terminado";


            game.finishedAt =
                new Date().toISOString();


            saveData();


            resultForm.reset();


            renderAll();

            renderVisitorAll();


            alert(
                "Resultado registado com sucesso! O jogo passou para Resultados."
            );

        }
    );

}


// =====================================================
// JOGOS TERMINADOS NO ADMIN
// =====================================================

function renderFinishedGames() {

    const container =
        document.getElementById(
            "finishedGamesList"
        );


    if (!container) return;


    const finishedGames =
        getFinishedGames();


    if (
        finishedGames.length ===
        0
    ) {

        container.innerHTML = `
            <p class="empty-message">
                Ainda não existem resultados.
            </p>
        `;

        return;

    }


    container.innerHTML =
        finishedGames.map(game => {

            const home =
                teams.find(
                    team =>
                        team.id ===
                        game.homeId
                );


            const away =
                teams.find(
                    team =>
                        team.id ===
                        game.awayId
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

                            ${game.homeScore}

                            :

                            ${game.awayScore}

                            ${
                                escapeHTML(
                                    away
                                        ? away.name
                                        : "Equipa removida"
                                )
                            }

                        </strong>

                        <p>

                            ${formatDate(
                                game.date
                            )}

                            •

                            ${escapeHTML(
                                game.time
                            )}

                            •

                            ${escapeHTML(
                                game.field
                            )}

                        </p>

                        <p>
                            Terminado
                        </p>

                    </div>

                </div>

            `;

        }).join("");

}


// =====================================================
// CLASSIFICAÇÃO
// =====================================================

function calculateStandings() {

    const standings =
        teams.map(team => ({

            teamId: team.id,

            played: 0,

            wins: 0,

            draws: 0,

            losses: 0,

            goalsFor: 0,

            goalsAgainst: 0,

            points: 0

        }));


    const finishedGames =
        getFinishedGames();


    finishedGames.forEach(game => {

        const home =
            standings.find(
                item =>
                    item.teamId ===
                    game.homeId
            );


        const away =
            standings.find(
                item =>
                    item.teamId ===
                    game.awayId
            );


        if (!home || !away) {
            return;
        }


        const homeGoals =
            Number(game.homeScore);


        const awayGoals =
            Number(game.awayScore);


        home.played++;
        away.played++;


        home.goalsFor +=
            homeGoals;

        home.goalsAgainst +=
            awayGoals;


        away.goalsFor +=
            awayGoals;

        away.goalsAgainst +=
            homeGoals;


        if (
            homeGoals >
            awayGoals
        ) {

            home.wins++;

            away.losses++;

            home.points += 3;

        } else if (
            homeGoals <
            awayGoals
        ) {

            away.wins++;

            home.losses++;

            away.points += 3;

        } else {

            home.draws++;

            away.draws++;

            home.points++;

            away.points++;

        }

    });


    standings.forEach(team => {

        team.goalDifference =
            team.goalsFor -
            team.goalsAgainst;

    });


    standings.sort(
        (a, b) => {

            if (
                b.points !==
                a.points
            ) {

                return (
                    b.points -
                    a.points
                );

            }


            if (
                b.goalDifference !==
                a.goalDifference
            ) {

                return (
                    b.goalDifference -
                    a.goalDifference
                );

            }


            return (
                b.goalsFor -
                a.goalsFor
            );

        }
    );


    return standings;

}


// =====================================================
// VISITANTE - NAVEGAÇÃO
// =====================================================

const visitorNavButtons =
    document.querySelectorAll(
        ".visitor-nav"
    );


visitorNavButtons.forEach(button => {

    button.addEventListener(
        "click",
        function () {

            showVisitorPage(
                button.dataset
                    .visitorPage
            );

        }
    );

});


document
    .querySelectorAll(
        "[data-visitor-open]"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            function () {

                showVisitorPage(
                    button.dataset
                        .visitorOpen
                );

            }
        );

    });


function showVisitorPage(
    pageId
) {

    document
        .querySelectorAll(
            ".visitor-content-page"
        )
        .forEach(page => {

            page.classList.add(
                "hidden"
            );

        });


    const page =
        document.getElementById(
            pageId
        );


    if (page) {

        page.classList.remove(
            "hidden"
        );

    }


    visitorNavButtons.forEach(
        button => {

            button.classList.remove(
                "active"
            );


            if (
                button.dataset
                    .visitorPage ===
                pageId
            ) {

                button.classList.add(
                    "active"
                );

            }

        }
    );

}


// =====================================================
// VISITANTE - ESTATÍSTICAS
// =====================================================

function renderVisitorStats() {

    const activeGames =
        getActiveGames();

    const finishedGames =
        getFinishedGames();


    const totalTeams =
        document.getElementById(
            "visitorTotalTeams"
        );

    const totalPlayers =
        document.getElementById(
            "visitorTotalPlayers"
        );

    const totalGames =
        document.getElementById(
            "visitorTotalGames"
        );

    const totalResults =
        document.getElementById(
            "visitorTotalResults"
        );


    if (totalTeams) {
        totalTeams.textContent =
            teams.length;
    }

    if (totalPlayers) {
        totalPlayers.textContent =
            players.length;
    }

    if (totalGames) {
        totalGames.textContent =
            activeGames.length;
    }

    if (totalResults) {
        totalResults.textContent =
            finishedGames.length;
    }

}


// =====================================================
// VISITANTE - EQUIPAS
// =====================================================

function renderVisitorTeams() {

    const container =
        document.getElementById(
            "visitorTeamsList"
        );


    if (!container) return;


    if (teams.length === 0) {

        container.innerHTML = `
            <div class="empty-public">
                Ainda não existem equipas registadas.
            </div>
        `;

        return;

    }


    container.innerHTML =
        teams.map(team => {

            const teamPlayers =
                players.filter(
                    player =>
                        player.teamId ===
                        team.id
                );


            const captain =
                teamPlayers.find(
                    player =>
                        player.id ===
                        team.captainId
                );


            return `

                <div class="public-team-card">

                    <div class="team-short">

                        ${escapeHTML(
                            team.short
                        )}

                    </div>

                    <h3>
                        ${escapeHTML(
                            team.name
                        )}
                    </h3>

                    <p>
                        ${teamPlayers.length}
                        jogadores
                    </p>

                    <div class="captain-public">

                        🧢 Capitão:

                        <strong>
                            ${
                                captain
                                    ? escapeHTML(
                                        captain.name
                                    )
                                    : "Ainda não definido"
                            }
                        </strong>

                    </div>

                </div>

            `;

        }).join("");

}


// =====================================================
// VISITANTE - JOGADORES
// =====================================================

function renderVisitorPlayers() {

    const container =
        document.getElementById(
            "visitorPlayersList"
        );


    if (!container) return;


    if (players.length === 0) {

        container.innerHTML = `
            <div class="empty-public">
                Ainda não existem jogadores registados.
            </div>
        `;

        return;

    }


    container.innerHTML =
        players.map(player => {

            const team =
                teams.find(
                    team =>
                        team.id ===
                        player.teamId
                );


            return `

                <div class="player-public-card">

                    <div class="player-number">

                        ${player.number}

                    </div>

                    <div>

                        <h3>
                            ${escapeHTML(
                                player.name
                            )}
                        </h3>

                        <p>

                            ${escapeHTML(
                                player.position
                            )}

                            •

                            ${
                                team
                                    ? escapeHTML(
                                        team.name
                                    )
                                    : "Sem equipa"
                            }

                            •

                            ${player.goals || 0}
                            golos

                        </p>

                    </div>

                </div>

            `;

        }).join("");

}


// =====================================================
// VISITANTE - JOGOS
// =====================================================

function renderVisitorGames() {

    const container =
        document.getElementById(
            "visitorGamesList"
        );


    if (!container) return;


    const activeGames =
        getActiveGames();


    if (activeGames.length === 0) {

        container.innerHTML = `
            <div class="empty-public">
                Não existem jogos agendados ou em curso.
            </div>
        `;

        return;

    }


    container.innerHTML =
        activeGames.map(
            renderPublicGame
        ).join("");

}


// =====================================================
// VISITANTE - RESULTADOS
// =====================================================

function renderVisitorResults() {

    const container =
        document.getElementById(
            "visitorResultsList"
        );


    if (!container) return;


    const finishedGames =
        getFinishedGames();


    if (finishedGames.length === 0) {

        container.innerHTML = `
            <div class="empty-public">
                Ainda não existem resultados.
            </div>
        `;

        return;

    }


    container.innerHTML =
        finishedGames.map(
            renderPublicGame
        ).join("");

}


// =====================================================
// CARTÃO PÚBLICO DE JOGO
// =====================================================

function renderPublicGame(
    game
) {

    const home =
        teams.find(
            team =>
                team.id ===
                game.homeId
        );


    const away =
        teams.find(
            team =>
                team.id ===
                game.awayId
        );


    const finished =
        game.status ===
        "Terminado";


    return `

        <div class="public-game-card">

            <div class="game-date-box">

                <strong>
                    ${formatShortDate(
                        game.date
                    )}
                </strong>

                <span>
                    ${escapeHTML(
                        game.time
                    )}
                </span>

            </div>


            <div class="game-teams">

                <div class="game-team">

                    ${
                        escapeHTML(
                            home
                                ? home.name
                                : "Equipa removida"
                        )
                    }

                </div>


                <div class="game-vs">

                    ${
                        finished
                            ? `
                                <span class="game-score">
                                    ${game.homeScore}
                                    :
                                    ${game.awayScore}
                                </span>
                              `
                            : "VS"
                    }

                </div>


                <div class="game-team away">

                    ${
                        escapeHTML(
                            away
                                ? away.name
                                : "Equipa removida"
                        )
                    }

                </div>

            </div>


            <div class="game-meta">

                📍
                ${escapeHTML(
                    game.field
                )}

                <br>

                <span
                    class="game-status ${
                        finished
                            ? "finished"
                            : ""
                    }"
                >

                    ${
                        finished
                            ? "Terminado"
                            : escapeHTML(
                                game.status
                            )
                    }

                </span>

            </div>

        </div>

    `;

}


// =====================================================
// VISITANTE - PRÓXIMOS JOGOS
// =====================================================

function renderVisitorUpcomingGames() {

    const container =
        document.getElementById(
            "visitorUpcomingGames"
        );


    if (!container) return;


    const activeGames =
        getActiveGames()
            .slice(0, 3);


    if (
        activeGames.length ===
        0
    ) {

        container.innerHTML = `
            <div class="empty-public">
                Não existem próximos jogos.
            </div>
        `;

        return;

    }


    container.innerHTML =
        activeGames
            .map(
                renderPublicGame
            )
            .join("");

}


// =====================================================
// VISITANTE - ÚLTIMOS RESULTADOS
// =====================================================

function renderVisitorLatestResults() {

    const container =
        document.getElementById(
            "visitorLatestResults"
        );


    if (!container) return;


    const finishedGames =
        getFinishedGames()
            .slice(0, 3);


    if (
        finishedGames.length ===
        0
    ) {

        container.innerHTML = `
            <div class="empty-public">
                Ainda não existem resultados.
            </div>
        `;

        return;

    }


    container.innerHTML =
        finishedGames
            .map(
                renderPublicGame
            )
            .join("");

}


// =====================================================
// VISITANTE - CLASSIFICAÇÃO
// =====================================================

function renderVisitorStandings() {

    const body =
        document.getElementById(
            "standingsBody"
        );


    if (!body) return;


    const standings =
        calculateStandings();


    if (standings.length === 0) {

        body.innerHTML = `
            <tr>
                <td colspan="10">
                    Ainda não existem equipas.
                </td>
            </tr>
        `;

        return;

    }


    body.innerHTML =
        standings.map(
            (teamData, index) => {

                const team =
                    teams.find(
                        team =>
                            team.id ===
                            teamData.teamId
                    );


                return `

                    <tr>

                        <td>
                            ${index + 1}
                        </td>

                        <td>
                            ${
                                team
                                    ? escapeHTML(
                                        team.name
                                    )
                                    : "Equipa removida"
                            }
                        </td>

                        <td>
                            ${teamData.played}
                        </td>

                        <td>
                            ${teamData.wins}
                        </td>

                        <td>
                            ${teamData.draws}
                        </td>

                        <td>
                            ${teamData.losses}
                        </td>

                        <td>
                            ${teamData.goalsFor}
                        </td>

                        <td>
                            ${teamData.goalsAgainst}
                        </td>

                        <td>
                            ${teamData.goalDifference}
                        </td>

                        <td>
                            <strong>
                                ${teamData.points}
                            </strong>
                        </td>

                    </tr>

                `;

            }
        ).join("");

}


// =====================================================
// VISITANTE - MARCADORES
// =====================================================

function renderVisitorScorers() {

    const container =
        document.getElementById(
            "visitorScorersList"
        );


    if (!container) return;


    const sortedPlayers =
        [...players]
            .sort(
                (a, b) =>
                    (b.goals || 0) -
                    (a.goals || 0)
            );


    if (
        sortedPlayers.length ===
        0
    ) {

        container.innerHTML = `
            <div class="empty-public">
                Ainda não existem jogadores.
            </div>
        `;

        return;

    }


    container.innerHTML =
        sortedPlayers.map(
            (player, index) => {

                const team =
                    teams.find(
                        team =>
                            team.id ===
                            player.teamId
                    );


                return `

                    <div class="scorer-card">

                        <div class="scorer-position">
                            #${index + 1}
                        </div>

                        <div>

                            <strong>
                                ${escapeHTML(
                                    player.name
                                )}
                            </strong>

                            <small>
                                ${
                                    team
                                        ? escapeHTML(
                                            team.name
                                        )
                                        : "Sem equipa"
                                }
                            </small>

                        </div>

                        <div class="scorer-goals">

                            ${player.goals || 0}

                        </div>

                    </div>

                `;

            }
        ).join("");

}


// =====================================================
// RENDER VISITANTE
// =====================================================

function renderVisitorAll() {

    renderVisitorStats();

    renderVisitorTeams();

    renderVisitorPlayers();

    renderVisitorGames();

    renderVisitorResults();

    renderVisitorStandings();

    renderVisitorScorers();

    renderVisitorUpcomingGames();

    renderVisitorLatestResults();

}


// =====================================================
// FORMATAR DATA
// =====================================================

function formatDate(date) {

    if (!date) return "";

    const parts =
        date.split("-");


    if (parts.length !== 3) {
        return date;
    }


    return `${parts[2]}/${parts[1]}/${parts[0]}`;

}


function formatShortDate(date) {

    if (!date) return "";

    const parts =
        date.split("-");


    if (parts.length !== 3) {
        return date;
    }


    return `${parts[2]}/${parts[1]}`;

}


// =====================================================
// PROTEGER HTML
// =====================================================

function escapeHTML(value) {

    return String(value)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}


// =====================================================
// ATUALIZAR TUDO ADMIN
// =====================================================

function renderAll() {

    cleanInvalidCaptains();

    updateTeamSelects();

    updateStats();

    renderChampionships();

    renderTeams();

    renderPlayers();

    renderGames();

    renderFinishedGames();

}


// =====================================================
// INICIALIZAÇÃO
// =====================================================

// Corrigir dados antigos caso existam
// capitães inválidos no localStorage.

cleanInvalidCaptains();


// Se já estiver logado como administrador,
// abrir diretamente o painel.

if (
    sessionStorage.getItem(
        "adminLoggedIn"
    ) === "true"
) {

    showAdminPanel();

} else {

    hideAllMainModes();

    homePage.classList.remove(
        "hidden"
    );

}


// =====================================================
// ATUALIZAÇÃO AUTOMÁTICA DA ÁREA PÚBLICA
// =====================================================

window.addEventListener(
    "storage",
    function () {

        renderVisitorAll();

        renderAll();

    }
);
