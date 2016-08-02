'use strict';

const electron = require('electron');
const { globalShortcut } = electron;

const DEBUG = false;

module.exports = class Visor {
    constructor(app) {
        this.app = app;
        this.config = app.config.getConfig().visor;

        this.visorWindow = null;
        this.oldBounds = null;

        // if no hotkey, don't do anything!
        this.registerGlobalHotkey();
    }

    setWindow(window) {
        debug('maintaining window...');
        this.visorWindow = window;
    }

    registerGlobalHotkey() {
        if (!this.config.hotkey) return;

        // Register a hotkey shortcut listener.
        const wasRegistered = globalShortcut.register(this.config.hotkey, () => this.toggleWindow());

        // @TODO error handling on failure?
        if (!wasRegistered) {
            debug('registration failed');
        } else {
            debug('registration worked');
        }
    }

    unregisterGlobalHotkey() {
        if (!this.config.hotkey) return;

        globalShortcut.unregister(this.config.hotkey);
    }

    toggleWindow() {
        debug('toggling window');

        if (!this.visorWindow) {
            this.app.createWindow(win => {
                const onClose = () => {
                    debug('closing', win.id);
                    this.visorWindow = null;
                };

                debug('registering new window', win.id);

                win.on('close', onClose);
                win.rpc.emit('session add req');
                win.focus();
                this.visorWindow = win;
                this.setBounds();
            });
        } else {
            if (this.visorWindow.isFocused()) {
                this.visorWindow.hide();
            } else {
                this.setBounds();
                this.visorWindow.isVisible() ? this.visorWindow.focus() : this.visorWindow.show();
            }
        }
    }

    setBounds() {
        debug(`setting position to ${this.config.position}`);

        if (!this.config.position) return;

        this.oldBounds = this.visorWindow.getBounds();

        const screen = electron.screen;
        const point = screen.getCursorScreenPoint();
        const display = screen.getDisplayNearestPoint(point);
        const bounds = display.workArea;
        const { height, width } = bounds;

        switch (this.config.position) {
            case 'bottom':
                bounds.y += height / 2;
                bounds.y = Math.round(bounds.y);
                // fall through
            case 'top':
                bounds.height /= 2;
                bounds.height = Math.round(bounds.height);
                break;
            case 'right':
                bounds.x += width / 2;
                bounds.x = Math.round(bounds.x);
                // fall through
            case 'left':
                bounds.width /= 2;
                bounds.width = Math.round(bounds.width);
                break;
        }

        this.visorWindow.setBounds(bounds);
    }

    restoreBounds() {
        if (!this.config.position) return;

        if (this.oldBounds) {
            this.visorWindow.setBounds(this.oldBounds);
        }
    }

    destroy() {
        this.unregisterGlobalHotkey();

        // @TODO other cleanup?

        return this.visorWindow;
    }
};

function debug(...args) {
    if (DEBUG) {
        console.log(...args);
    }
}
