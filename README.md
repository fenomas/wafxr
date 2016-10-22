
# wafxr

[wafxr](https://github.com/andyhall/wafxr) is a sound effect generator in the tradition of 
[as3fxr](http://www.superflashbros.net/as3sfxr/), 
[bfxr](http://www.bfxr.net/), 
[jfxr](http://jfxr.frozenfractal.com/), 
and so forth. It differs in that instead of generating sound files, it plays sounds 
dynamically via WebAudio and [Tone.js](https://github.com/Tonejs/Tone.js/).

> [Demo](https://andyhall.github.io/wafxr/)

Supports various effects, filters, 3D panning, etc.
Internally it pools and reuses webaudio resources reasonably intelligently, 
so it's probably about as light and performant as it can be. [(benchmark)](https://andyhall.github.io/wafxr/bench.html)


## Installation

```shell
npm install wafxr
```

## Usage

```js
var fx = require('wafxr')

fx.play({
    frequency: 440,
    sweep: 1.25,
    // ...
})
```

To figure out what settings to pass in, 
open the [demo](https://andyhall.github.io/wafxr/) page and play around. 
Settings will appear at the bottom for copy/pasting.

## API

```js
fx.play(settings)     // where the magic is

fx.getDefaults()      // object with all supported settings
fx.setVolume(0.5)     // master volume, 0..1   
fx._tone              // Tone.js reference if you need it   

fx.setListenerPosition(x, y, z)   // 3d sound stuff - these only
fx.setListenerAngle(degrees)      // matter when soundX/Y/Z are set
```

## Notes

WIP. Not massively tested but seems to work in sane browsers. 

Mobile support: Works On My Device™.
Might skip when more effects are used, of course.

----

## License

(c) 2016 Andy Hall. MIT License
