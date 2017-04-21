'use strict';

const electron = require('electron');
const { BrowserWindow, Menu } = electron;

const DEBUG = process.env.NODE_ENV === 'development' || process.env.DEBUG || false;
const isMac = process.platform === 'darwin';

let log;
if (DEBUG) {
    log = require('electron-log');
    log.transports.file.level = 'silly';
}

module.exports = class Visor {
    constructor(app, visorWindow = null) {
        this.app = app;
        this.config = app.config.getConfig().visor || {};
        this.visorWindow = visorWindow;
        this.visorWindow.on('close', () => this.handleOnVisorWindowClose());
        this.previousAppFocus = null;

        if (this.config.hideDock) {
            this.app.dock.hide();
        }

        if (this.visorWindow) {
            this.setBounds();
        }
    }

    toggleWindow() {
        debug('toggling window');

        console.error('test2');
        if (!this.visorWindow) {
            // if no visor window, create one and try toggling again after it's created
            this.createNewVisorWindow(() => this.setBounds());
            return;
        }

        if (this.visorWindow.isFocused()) {
            if (!this.visorWindow.isFullScreen()) {
                this.visorWindow.hide();
            }
            this.returnFocus();
        } else {
            this.setBounds();
            if (this.visorWindow.isVisible()) {
                this.visorWindow.focus();
            } else {
                this.previousAppFocus = BrowserWindow.getFocusedWindow();
                this.visorWindow.show(() => debug('test'));
                this.visorWindow.focus();
            }
        }
    }

    setBounds() {
        debug(`setting position to ${this.config.position}`);

        if (!this.config.position) return;

        const screen = electron.screen;
        const point = screen.getCursorScreenPoint();
        const display = screen.getDisplayNearestPoint(point);
        const bounds = display.workArea;
        const { height, width } = bounds;

        switch (this.config.position) {
            case 'bottom':
                bounds.y += this.config.height || height / 2;
                bounds.width = this.config.width || width;
            // fall through
            case 'top':
                bounds.height = this.config.height || height / 2;
                bounds.width = this.config.width || width;
                break;
            case 'right':
                bounds.x += this.config.width || width / 2;
                bounds.height = this.config.height || height;
            // fall through
            case 'left':
                bounds.width = this.config.width || width / 2;
                bounds.height = this.config.height || height;
                break;
        }

        bounds.y = Math.round(bounds.y);
        bounds.width = Math.round(bounds.width);
        bounds.x = Math.round(bounds.x);
        bounds.height = Math.round(bounds.height);

        this.visorWindow.setBounds(bounds);
    }

    createNewVisorWindow(callback) {
        debug('creating new window');

        this.app.createWindow(win => {
            this.visorWindow = win;

            // creates a shell in the new window
            win.rpc.emit('termgroup add req');

            this.visorWindow.on('close', () => this.handleOnVisorWindowClose());

            if (callback) {
                callback();
            }
        });
    }

    returnFocus() {
        // this attempts to return focus to the app that previously had focus before Hyper
        if (((this.previousAppFocus || {}).sessions || {}).size) {
            this.previousAppFocus.focus();
        } else if (isMac) {
            Menu.sendActionToFirstResponder('hide:');
        }
    }

    handleOnVisorWindowClose() {
        debug('closing');

        this.visorWindow = null;
    }

    destroy() {
        this.visorWindow = null;
        this.previousAppFocus = null;

        debug('destroyed');
        // @TODO other cleanup?
    }
};

function debug(...args) {
    if (DEBUG) {
        console.error(...args);
        log.info(...args);
    }
}
