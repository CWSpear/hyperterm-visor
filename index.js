'use strict';

const Visor = require('./visor');

let visor = new Visor();

// set the visor window to the most recently opened
module.exports.onWindow = function handleNewVisorWindow(win) {
    visor.registerWindow(win);
};

module.exports.onApp = function registerGlobalHotkey(app) {
    visor.setConfig(app.config.getConfig().visor || {});
};

module.exports.onUnload = function unregisterGlobalHotkey() {
    visor.destroy();
};
