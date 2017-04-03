'use strict';

const Visor = require('./visor');

let visor;

module.exports.onApp = function registerGlobalHotkey(app) {
    let window;

    if (visor) {
        window = visor.destroy();
    }

    visor = new Visor(app);

    if (window) {
        visor.setWindow(window);
    }
};

module.exports.onUnload = function unregisterGlobalHotkey() {
    if (visor) {
        visor.destroy();
        visor = undefined;
    }
};
