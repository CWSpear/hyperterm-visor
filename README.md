# HyperTerm Visor

Open your terminal from anywhere with a global hotkey.

![HyperTerm Visor](http://i.imgur.com/dCdMdAN.gifv)

## Config

In your `~/.hyperterm.js`, you can define your hotkey (required) and the position (optional) you want your visor to be. It automatically will open on the screen where your mouse is.

```js
modules.exports = {
  config: {
    // other config...
    visor: {
      hotkey: 'CommandOrControl+Shift+Z',
      position: 'top', // or left, right, bottom
    },
  },
  // ...
};
```

You can define hotkeys as specified in the [Electron Accelerator docs](https://github.com/electron/electron/blob/master/docs/api/accelerator.md).

## Roadmap

* Better customization of where you can make the terminal appear.
* Option to always open on a specific monitor, etc.
* Double press mod keys to activate (i.e. hit Ctrl twice to activate).
* Create window if all windows have been closed.

## Caveats

* It always uses the most recently open window as your visor window.
* If all windows have been closed, it won't do anything until you manually open a new window.

This is pretty basic in its current form, and I'm labeling it as a beta. I will build out more functionality and beef up this README as we go. 
