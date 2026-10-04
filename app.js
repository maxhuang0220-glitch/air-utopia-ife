(() => {

    "use strict";


    const CONFIG =
        window.AIR_UTOPIA_CONFIG;


    /* =========================
       STATE
    ========================= */

    const state = {

        user: null,

        role: "passenger",

        language: "zh-TW",

        connected: false,

        flight: {
            ...CONFIG.defaultFlight
        },

        telemetry: {

            altitude: null,

            speed: null,

            heading: null,

            latitude: null,

            longitude: null,

            aircraft: null

        }

    };


    /* =========================
       DOM
    ========================= */

    const $ = selector =>
        document.querySelector(selector);

    const $$ = selector =>
        document.querySelectorAll(selector);


    /* =========================
       LOGIN TABS
    ========================= */

    $$(".login-tab").forEach(button => {

        button.addEventListener(
            "click",
            () => {

                $$(".login-tab")
                    .forEach(x =>
                        x.classList.remove("active")
                    );

                button.classList.add("active");

                const type =
                    button.dataset.login;

                if (type === "employee") {

                    $("#passenger-login")
                        .classList.add("hidden");

                    $("#employee-login")
                        .classList.remove("hidden");

                } else {

                    $("#employee-login")
                        .classList.add("hidden");

                    $("#passenger-login")
                        .classList.remove("hidden");

                }

            }
        );

    });


    /* =========================
       PASSENGER LOGIN
    ========================= */

    $("#passenger-login-btn")
        .addEventListener(
            "click",
            () => {

                const name =
                    $("#passenger-name")
                        .value.trim();

                const flight =
                    $("#passenger-flight")
                        .value.trim()
                        .toUpperCase();

                if (!name) {

                    showLoginMessage(
                        "Please enter your name."
                    );

                    return;

                }

                state.user = name;

                state.role = "passenger";

                if (flight) {

                    state.flight.number =
                        flight;

                }

                enterIFE();

            }
        );


    /* =========================
       EMPLOYEE LOGIN
    ========================= */

    $("#employee-login-btn")
        .addEventListener(
            "click",
            () => {

                const id =
                    $("#employee-id")
                        .value.trim();

                const password =
                    $("#employee-password")
                        .value;

                /*
                 * DEMO ONLY
                 *
                 * Real production authentication
                 * should be performed by a backend.
                 */

                if (
                    id === CONFIG.demoEmployee.id &&
                    password === CONFIG.demoEmployee.password
                ) {

                    state.user = id;

                    state.role =
                        CONFIG.demoEmployee.role;

                    enterIFE();

                } else {

                    showLoginMessage(
                        "Invalid employee credentials."
                    );

                }

            }
        );


    function showLoginMessage(message) {

        $("#login-message")
            .textContent = message;

    }


    /* =========================
       ENTER IFE
    ========================= */

    function enterIFE() {

        $("#login-screen")
            .classList.add("hidden");

        $("#ife-screen")
            .classList.remove("hidden");

        $("#flight-number")
            .textContent =
            state.flight.number;

        updateEmployeePanel();

        showPage("home");

    }


    /* =========================
       LOGOUT
    ========================= */

    $("#logout-btn")
        .addEventListener(
            "click",
            () => {

                state.user = null;

                $("#ife-screen")
                    .classList.add("hidden");

                $("#login-screen")
                    .classList.remove("hidden");

            }
        );


    /* =========================
       PAGE NAVIGATION
    ========================= */

    $$(".service-card")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    showPage(
                        button.dataset.page
                    );

                }
            );

        });


    $$(".back-button")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    showPage("home");

                }
            );

        });


    function showPage(name) {

        $$(".page")
            .forEach(page =>
                page.classList.add("hidden")
            );

        const page =
            $(`#${name}-page`);

        if (page) {

            page.classList.remove("hidden");

        }

    }


    /* =========================
       GEOFS TELEMETRY
    ========================= */

    window.addEventListener(
        "message",
        event => {

            /*
             * Do not blindly trust arbitrary
             * postMessage senders.
             */

            if (
                CONFIG.geoFS.allowedOrigin &&
                event.origin !==
                CONFIG.geoFS.allowedOrigin
            ) {

                return;

            }

            const data = event.data;

            if (
                !data ||
                data.type !==
                "AIR_UTOPIA_GEOFS_TELEMETRY"
            ) {

                return;

            }

            updateTelemetry(data.payload);

        }
    );


    function updateTelemetry(data) {

        if (!data) return;


        state.connected = true;


        state.telemetry.altitude =
            numberOrNull(data.altitude);

        state.telemetry.speed =
            numberOrNull(data.speed);

        state.telemetry.heading =
            numberOrNull(data.heading);

        state.telemetry.latitude =
            numberOrNull(data.latitude);

        state.telemetry.longitude =
            numberOrNull(data.longitude);

        state.telemetry.aircraft =
            data.aircraft ||
            "AIRCRAFT";


        renderTelemetry();

    }


    function numberOrNull(value) {

        const number =
            Number(value);

        return Number.isFinite(number)
            ? number
            : null;

    }


    /* =========================
       TELEMETRY UI
    ========================= */

    function renderTelemetry() {

        const t =
            state.telemetry;


        $("#altitude")
            .textContent =
            format(t.altitude);

        $("#speed")
            .textContent =
            format(t.speed);

        $("#heading")
            .textContent =
            format(t.heading);


        $("#flight-altitude")
            .textContent =
            format(t.altitude);

        $("#flight-speed")
            .textContent =
            format(t.speed);

        $("#flight-heading")
            .textContent =
            format(t.heading);

        $("#flight-lat")
            .textContent =
            formatCoordinate(t.latitude);

        $("#flight-lon")
            .textContent =
            formatCoordinate(t.longitude);

        $("#flight-aircraft")
            .textContent =
            t.aircraft || "AIRCRAFT";


        $("#map-position")
            .textContent =
            `POSITION: ${
                formatCoordinate(t.latitude)
            }, ${
                formatCoordinate(t.longitude)
            }`;

        $("#map-heading")
            .textContent =
            `HEADING: ${
                format(t.heading)
            }°`;


        $("#connection-status")
            .textContent =
            "● GEOFS LIVE";

        $("#connection-status")
            .style.color =
            "#62e6a8";

    }


    function format(value) {

        if (
            value === null ||
            value === undefined
        ) {

            return "—";

        }

        return Math.round(value)
            .toLocaleString();

    }


    function formatCoordinate(value) {

        if (
            value === null ||
            value === undefined
        ) {

            return "—";

        }

        return Number(value)
            .toFixed(4);

    }


    /* =========================
       EMPLOYEE PANEL
    ========================= */

    function updateEmployeePanel() {

        $("#employee-user")
            .textContent =
            state.user || "—";

        $("#employee-role")
            .textContent =
            state.role || "—";

    }


    /* =========================
       GAMES
    ========================= */

    $$(".game-card")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const game =
                        button.dataset.game;

                    startGame(game);

                }
            );

        });


    function startGame(game) {

        const area =
            $("#game-area");


        if (game === "guess") {

            const answer =
                Math.floor(
                    Math.random() * 900
                ) + 100;


            area.innerHTML = `

                <div class="game-box">

                    <h3>
                        Flight Number Challenge
                    </h3>

                    <p>
                        Guess a 3-digit flight number.
                    </p>

                    <input
                        id="guess-input"
                        type="number"
                        min="100"
                        max="999"
                    >

                    <button
                        id="guess-submit"
                    >
                        Guess
                    </button>

                    <p id="guess-result"></p>

                </div>

            `;


            $("#guess-submit")
                .addEventListener(
                    "click",
                    () => {

                        const guess =
                            Number(
                                $("#guess-input")
                                    .value
                            );

                        if (
                            guess === answer
                        ) {

                            $("#guess-result")
                                .textContent =
                                "Correct! ✈️";

                        } else if (
                            guess < answer
                        ) {

                            $("#guess-result")
                                .textContent =
                                "Higher!";

                        } else {

                            $("#guess-result")
                                .textContent =
                                "Lower!";

                        }

                    }
                );

        }


        if (game === "reaction") {

            area.innerHTML = `

                <div class="game-box">

                    <h3>
                        Reaction Test
                    </h3>

                    <button
                        id="reaction-btn"
                    >
                        WAIT...
                    </button>

                    <p id="reaction-result"></p>

                </div>

            `;


            const button =
                $("#reaction-btn");

            const start =
                Date.now();

            let ready = false;


            setTimeout(
                () => {

                    ready = true;

                    button.textContent =
                        "CLICK NOW!";

                },
                1500 +
                Math.random() * 2500
            );


            button.addEventListener(
                "click",
                () => {

                    if (!ready) {

                        $("#reaction-result")
                            .textContent =
                            "Too early!";

                        return;

                    }

                    const time =
                        Date.now() - start;

                    $("#reaction-result")
                        .textContent =
                        `${time} ms`;

                }
            );

        }


        if (game === "quiz") {

            const questions = [

                {
                    q:
                        "What does VOR stand for?",

                    a:
                        "Very High Frequency Omnidirectional Range"
                },

                {
                    q:
                        "What does ILS provide?",

                    a:
                        "Instrument Landing Guidance"
                },

                {
                    q:
                        "What does QNH represent?",

                    a:
                        "Altimeter setting for elevation above mean sea level"
                }

            ];


            const question =
                questions[
                    Math.floor(
                        Math.random() *
                        questions.length
                    )
                ];


            area.innerHTML = `

                <div class="game-box">

                    <h3>
                        Aviation Quiz
                    </h3>

                    <p>
                        ${question.q}
                    </p>

                    <button
                        id="quiz-answer"
                    >
                        Show Answer
                    </button>

                    <p
                        id="quiz-result"
                    ></p>

                </div>

            `;


            $("#quiz-answer")
                .addEventListener(
                    "click",
                    () => {

                        $("#quiz-result")
                            .textContent =
                            question.a;

                    }
                );

        }

    }


    /* =========================
       LANGUAGE
    ========================= */

    const translations = {

        "zh-TW": {

            welcome:
                "歡迎搭乘 AIR UTOPIA",

            movies:
                "電影",

            music:
                "音樂",

            games:
                "遊戲"

        },

        en: {

            welcome:
                "WELCOME ABOARD AIR UTOPIA",

            movies:
                "Movies",

            music:
                "Music",

            games:
                "Games"

        },

        ja: {

            welcome:
                "AIR UTOPIAへようこそ",

            movies:
                "映画",

            music:
                "音楽",

            games:
                "ゲーム"

        }

    };


    $$(".language-select button")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const lang =
                        button.dataset.lang;

                    if (
                        !translations[lang]
                    ) return;

                    state.language =
                        lang;

                    applyLanguage();

                }
            );

        });


    function applyLanguage() {

        const t =
            translations[
                state.language
            ];

        /*
         * Main welcome text
         */

        const welcome =
            document.querySelector(
                ".welcome h1"
            );

        if (welcome) {

            welcome.textContent =
                "AIR UTOPIA";

        }

    }


    /* =========================
       CONNECTION WATCHDOG
    ========================= */

    setInterval(
        () => {

            /*
             * If no telemetry has arrived
             * for several seconds, display
             * offline state.
             */

            if (!state.connected) {

                $("#connection-status")
                    .textContent =
                    "● OFFLINE";

                return;

            }

        },
        3000
    );


    console.log(
        "%cAIR UTOPIA IFE v1.0",
        "font-size:20px;font-weight:bold"
    );

})();
