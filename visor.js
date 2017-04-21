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

        this.firstTime = true;

        if (this.visorWindow) {
            this.setBounds(true);
        }
    }

    toggleWindow(init = false) {
        debug('toggling window');

        if (!this.visorWindow) {
            // if no visor window, create one and try toggling again after it's created
            this.createNewVisorWindow(() => this.setBounds(true));
            return;
        }

        if (this.visorWindow.isFocused()) {
            if (!this.visorWindow.isFullScreen()) {
                this.visorWindow.hide();
            }

            this.returnFocus();

            if (this.firstTime) {
                this.setBounds(true);
            }
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

    setBounds(setDefaultSize = false) {
        this.firstTime = false;

        debug(`setting position to ${this.config.position}`);

        if (this.config.position) {
            this.visorWindow.rpc.emit('add notification', {
                text: '[Visor Plugin] The `position` option has been deprecated',
                url: 'https://google.com/', // @TODO update README and put link here
                dismissable: true,
            });
        }

        const anchor = this.config.anchor || this.config.position || 'top';

        const bounds = {};

        const screen = electron.screen;
        const point = screen.getCursorScreenPoint();
        const display = screen.getDisplayNearestPoint(point);
        const { height: workAreaHeight, width: workAreaWidth, x: workAreaX, y: workAreaY } = display.workArea;
        const { height: curHeight, width: curWidth, x: curX, y: curY } = this.visorWindow.getBounds();

        const targetWidth = this.parseSize(this.config.width, workAreaWidth) || (setDefaultSize && anchor !== 'none'  ? (workAreaWidth / 2) : curWidth);
        const targetHeight = this.parseSize(this.config.height, workAreaHeight) || (setDefaultSize && anchor !== 'none'  ? (workAreaHeight / 2) : curHeight);

        bounds.width = targetWidth;
        bounds.height = targetHeight;

        switch (anchor) {
            case 'bottom':
                bounds.x = (workAreaX + workAreaWidth - targetWidth) / 2;
                bounds.y = workAreaY + workAreaHeight - targetHeight;
                if (setDefaultSize && !this.config.width) bounds.width = workAreaWidth;
                break;

            case 'top':
                bounds.x = (workAreaX + workAreaWidth - targetWidth) / 2;
                bounds.y = 0;
                if (setDefaultSize && !this.config.width) bounds.width = workAreaWidth;
                break;

            case 'right':
                bounds.x = workAreaX + workAreaWidth - targetWidth;
                bounds.y = (workAreaHeight - targetHeight) / 2;
                if (setDefaultSize && !this.config.height) bounds.height = workAreaHeight;
                break;

            case 'left':
                bounds.x = 0;
                bounds.y = (workAreaY + workAreaHeight - targetHeight) / 2;
                if (setDefaultSize && !this.config.height) bounds.height = workAreaHeight;
                break;

            case 'topleft':
                bounds.x = 0;
                bounds.y = 0;
                break;

            case 'topright':
                bounds.x = workAreaX + workAreaWidth - targetWidth;
                bounds.y = 0;
                break;

            case 'bottomleft':
                bounds.x = 0;
                bounds.y = workAreaY + workAreaHeight - targetHeight;
                break;

            case 'bottomright':
                bounds.x = workAreaX + workAreaWidth - targetWidth;
                bounds.y = workAreaY + workAreaHeight - targetHeight;
                break;

            case 'center':
                bounds.x = (workAreaX + workAreaWidth - targetWidth) / 2;
                bounds.y = (workAreaY + workAreaHeight - targetHeight) / 2;
                break;

            case 'none':
                bounds.x = curX;
                bounds.y = curY;
                break;

            default:
                this.visorWindow.rpc.emit('add notification', {
                    text: `[Visor Plugin] The \`anchor\` value "${anchor}" is not valid`,
                    url: 'https://google.com/', // @TODO update README and put link here
                    dismissable: true,
                });
                return;
        }

        // non-integers will cause issues
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

    // turn 50% into an integer value that's half the work area
    // turn 500px into 500
    parseSize(configVal, workAreaVal) {
        if (!configVal) return;

        if (('' + configVal).match(/%$/)) return parseFloat(configVal) / 100 * workAreaVal;

        return parseFloat(configVal);
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
