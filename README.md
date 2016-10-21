
# wafxr

[wafxr](https://github.com/andyhall/wafxr) is a sound effect generator in the tradition of 
[as3fxr](http://www.superflashbros.net/as3sfxr/), 
[bfxr](http://www.bfxr.net/), 
[jfxr](http://jfxr.frozenfractal.com/), 
and so forth. It differs in that instead of generating sound files, it plays sounds 
dynamically via WebAudio and [Tone.js](https://github.com/Tonejs/Tone.js/).

 * [Demo](https://andyhall.github.io/wafxr/)

## Installation

```shell
npm install wafxr
```

## Usage

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

## Other methods

```js
// returns an object with all valid settings and their default values
fx.getDefaults()

// effectively this sets how many soudns can be playing at once   
fx.setInstrumentCounts(synthCount, noiseCount)  
```

## Notes

WIP. Seems to work in sane browsers. 
Should work on mobile, better or worse depending on which effects you use. 

----

## License

(c) 2016 Andy Hall. MIT License
