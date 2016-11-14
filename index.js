'use strict';

const Visor = require('./visor');
const log = require('electron-log');

let visor;

module.exports.onApp = function registerGlobalHotkey(app) {
    // for config changes, etc
    let visorWindow;
    if (visor) {
        visorWindow = visor.visorWindow;
        visor.destroy();
    }

    // on load, set the first window that loads as the visor
    if (!visorWindow) {
        const windows = app.getWindows();
        if (windows.size === 1) {
            visorWindow = windows.values().next().value;
        }
    }

    visor = new Visor(app, visorWindow);
};

module.exports.onUnload = function unregisterGlobalHotkey() {
    // as far as I know, onUnload can't be called before onApp, but just in case...
    if (!visor) {
        console.error('onUnload was called before a visor was created');
    } else {
        visor.destroy();
    }
};
