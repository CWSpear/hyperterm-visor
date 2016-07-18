'use strict';

const remove = require('lodash.remove');
const electron = require('electron');
const { globalShortcut } = electron;

const DEBUG = false;

module.exports = class Visor {
    constructor(config = {}) {
        this.windowStack = [];

        this.visorWindow = null;
        this.oldBounds = null;
        this.config = config;

        // if no hotkey, don't do anything!
        this.registerGlobalHotkey();
    }

    setConfig(config = {}) {
        this.unregisterGlobalHotkey();
        this.config = config;
        this.registerGlobalHotkey();
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

        if (!this.visorWindow) return;

        if (this.visorWindow.isFocused()) {
            this.visorWindow.hide();
        } else {
            this.setBounds();
            this.visorWindow.isVisible() ? this.visorWindow.focus() : this.visorWindow.show();
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

        console.log(bounds);

        this.visorWindow.setBounds(bounds);
    }

    restoreBounds() {
        if (!this.config.position) return;

        if (this.oldBounds) {
            this.visorWindow.setBounds(this.oldBounds);
        }
    }

    registerWindow(win) {
        const onClose = () => {
            debug('closing', win.id);

            remove(this.windowStack, { id: win.id });

            if (this.visorWindow.id === win.id) {
                this.visorWindow = this.windowStack.length ? this.windowStack[this.windowStack.length - 1] : null;
            }
        };

        debug('registering new window', win.id);

        win.on('close', onClose);

        this.windowStack.push(win);
        this.visorWindow = win;
    }

    destroy() {
        this.unregisterGlobalHotkey();

        // @TODO other cleanup?
    }
};

function debug(...args) {
    if (DEBUG) {
        console.log(...args);
    }
}
