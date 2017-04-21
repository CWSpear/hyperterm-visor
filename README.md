# HyperTerm Visor

[![Join the chat at https://gitter.im/CWSpear/hyperterm-visor](https://badges.gitter.im/CWSpear/hyperterm-visor.svg)](https://gitter.im/CWSpear/hyperterm-visor?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Open your [Hyper terminal](https://hyper.is/) from anywhere with a global hotkey.

![HyperTerm Visor](https://cloud.githubusercontent.com/assets/495855/16907220/809ea6d0-4c76-11e6-956c-3329a0afc475.gif)

## Installation

In your `~/.hyper.js`, add `hyperterm-visor` to the list of `plugins`.

**Note:** I know I need to change the name, but I can't well and call it `hyper-visor`...

## Config

In your `~/.hyper.js`, you can define your hotkey (required) and the position (optional) you want your visor to be. It automatically will open on the screen where your mouse is.

```js
modules.exports = {
  config: {
    // other config is here...
    
    // example visor config
    visor: {
      hotkey: 'CommandOrControl+Shift+Z', // required
      anchor: 'bottom', // (default: 'top')
      width: '100%', // optional
      height: 500, // optional
    },
  },
  // ...
};
```

### Hotkey

*required*

You can define hotkeys as specified in the [Electron Accelerator docs](https://github.com/electron/electron/blob/master/docs/api/accelerator.md).

### Anchor

*default: `top`*

You can define an anchor point that the window will jump to when you use the hotkey to activate it. The `height` and `width` will remain the same unless you specify a specific value in the config (see next subsection).

**Accepted values:** `bottom`, `top`, `right`, `left`, `topleft`, `topright`, `bottomleft`, `bottomright`, `center` 

>**Note:** Prior to 1.0, there was a similar option called `position` this did slightly different things. This was replaced by `anchor` as the new direction was deemed more flexible and `anchor` was a more appropriate term for the new functionality.

### Width & Height

*optional*

You can optionally define a specific `height` or `width` (or both). When you use the hotkey to activate the window, it will set it to the `height` and/or `width` you specify. If you leave these values empty, it will leave the window size alone.

If you want, you can just set a width _or_ height. For example, if I set the `width` to `100%` and didn't define a `height`, then if my window got resized to something else, the next time I activate via the hotkey, the height will be what it was before, but the width will be 100%.

**Accepted values:** any number or string that can parse to a float (i.e. all units are ignored (except `%`)). If the string ends in `%`, it will set the `height`/`width` of the window to the specified percentage of the work area. i.e. `50%` is half the work area.

>If you want your window to take up the full work area, the anchor doesn't really matter, just set both the width and height to 100%.

## Roadmap

* Better customization of where you can make the terminal appear.
* Option to always open on a specific monitor, etc.
* Double press mod keys to activate (i.e. hit Ctrl twice to activate).
* Create window if all windows have been closed.

## Caveats

* It always uses the most recently open window as your visor window.
* If all windows have been closed, it won't do anything until you manually open a new window.

This is pretty basic in its current form, and I'm labeling it as a beta as I use it and patch up edge cases, etc. I will build out more functionality and beef up this README as we go. 

## Changelog

Starting with version `0.3.0`, I have been documenting changes via GitHub's [release tab](https://github.com/CWSpear/hyperterm-visor/releases).
