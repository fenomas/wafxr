
## wafxr

[wafxr](https://github.com/andyhall/wafxr) is a sound effect generator in the tradition of 
[as3fxr](http://www.superflashbros.net/as3sfxr/), 
[bfxr](http://www.bfxr.net/), 
[jfxr](http://jfxr.frozenfractal.com/), 
and so forth. It differs in that instead of generating sound files, it plays sounds 
dynamically via WebAudio and [Tone.js](https://github.com/Tonejs/Tone.js/).

 * [Live demo](https://andyhall.github.io/wafxr/)

### Installation

```shell
npm install wafxr
```

### Usage

```js
var fx = require('wafxr')

fx.play({
    frequency: 440,
    sweep: 200,
    // ...
})
```

To figure out what settings to pass in, 
open the [demo](https://andyhall.github.io/wafxr/) page and play around.

You can also call `fx.getDefaults()` to get an object with properties
for every setting `wafxr` understands.

### Notes

WIP. Seems to work in sane browsers. Not ready for mobile yet, needs tuning.



