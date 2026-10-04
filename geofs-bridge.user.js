// ==UserScript==
// @name         AIR UTOPIA IFE - GeoFS Bridge
// @namespace    https://air-utopia.example/
// @version      1.0.0
// @description  Send GeoFS flight telemetry to AIR UTOPIA IFE
// @match        https://www.geo-fs.com/*
// @match        https://geo-fs.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(() => {

    "use strict";


    const IFE_URL =
        "https://YOUR-GITHUB-USERNAME.github.io/air-utopia-ife/";


    const SEND_INTERVAL =
        1000;


    let ifeWindow = null;


    /* =========================
       OPEN IFE
    ========================= */

    function openIFE() {

        if (
            !ifeWindow ||
            ifeWindow.closed
        ) {

            ifeWindow =
                window.open(
                    IFE_URL,
                    "AIR_UTOPIA_IFE"
                );

        }

    }


    /* =========================
       WAIT FOR GEOFS
    ========================= */

    function waitForGeoFS() {

        if (
            window.geofs &&
            window.geofs.aircraft &&
            window.geofs.aircraft.instance
        ) {

            console.log(
                "[AIR UTOPIA] GeoFS detected."
            );

            startBridge();

            return;

        }


        setTimeout(
            waitForGeoFS,
            1000
        );

    }


    /* =========================
       GET AIRCRAFT
    ========================= */

    function getAircraft() {

        const aircraft =
            window.geofs
                ?.aircraft
                ?.instance;

        if (!aircraft) {

            return null;

        }


        return aircraft;

    }


    /* =========================
       TELEMETRY
    ========================= */

    function collectTelemetry() {

        const aircraft =
            getAircraft();

        if (!aircraft) {

            return null;

        }


        /*
         * GeoFS versions/addons can expose
         * values differently.
         *
         * Therefore this bridge checks
         * several common properties.
         */

        const telemetry = {

            altitude:
                aircraft
                    ?.llaLocation
                    ?.altitude ??
                aircraft
                    ?.altitude ??
                aircraft
                    ?.alt,

            speed:
                aircraft
                    ?.speedKias ??
                aircraft
                    ?.kias ??
                aircraft
                    ?.speed,

            heading:
                aircraft
                    ?.heading360 ??
                aircraft
                    ?.heading ??
                aircraft
                    ?.hdg,

            latitude:
                aircraft
                    ?.llaLocation
                    ?.lat,

            longitude:
                aircraft
                    ?.llaLocation
                    ?.lon,

            aircraft:
                aircraft
                    ?.name ??
                aircraft
                    ?.aircraftName ??
                "GeoFS Aircraft"

        };


        return telemetry;

    }


    /* =========================
       SEND DATA
    ========================= */

    function sendTelemetry() {

        if (
            !ifeWindow ||
            ifeWindow.closed
        ) {

            return;

        }


        const data =
            collectTelemetry();

        if (!data) {

            return;

        }


        try {

            ifeWindow.postMessage(

                {

                    type:
                        "AIR_UTOPIA_GEOFS_TELEMETRY",

                    payload:
                        data

                },

                IFE_URL

            );

        } catch (error) {

            console.warn(
                "[AIR UTOPIA] Telemetry error:",
                error
            );

        }

    }


    /* =========================
       BRIDGE
    ========================= */

    function startBridge() {

        console.log(
            "[AIR UTOPIA] IFE bridge started."
        );


        openIFE();


        setInterval(
            sendTelemetry,
            SEND_INTERVAL
        );

    }


    waitForGeoFS();


    /* =========================
       KEYBOARD SHORTCUT
    ========================= */

    window.addEventListener(
        "keydown",
        event => {

            if (
                event.key.toLowerCase() ===
                "i"
            ) {

                openIFE();

            }

        }
    );


})();
