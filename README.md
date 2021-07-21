
# wafxr

> [Live demo](https://fenomas.github.io/wafxr/)

`wafxr` is a sound effect generator in the tradition of 
[as3fxr](http://www.superflashbros.net/as3sfxr/), 
[bfxr](http://www.bfxr.net/), 
[jfxr](http://jfxr.frozenfractal.com/), and others. 
But where such tools normally generate static files, 
this one plays sounds dynamically via Web Audio.


Supports oscillators, FM synth, tremolo/vibrato, and various other 
filters and effects. If you need more complicated sounds 
(and you're comfortable building audio graphs), 
check out [`wasgen`](https://github.com/fenomas/wasgen) instead.


## Usage

Open the [demo](https://fenomas.github.io/wafxr/) and 
twiddle the UI until you have a sound you like. 
Then copy the `playback code` into your project, 
add [wasgen](https://github.com/fenomas/wasgen) as a dependency, 
and off you go.

```shell
npm install --save wasgen
```

```js
import Gen from 'wasgen'
var gen = new Gen()
gen.play([
  /* .. sound program from the demo page .. */
], 440, 1, gen.now(), gen.now() + 0.1)
```

<br>

## Note on mobile support
  
Dynamic web audio is generally well-supported on mobile, 
but it's a bit CPU intensive so with heavy sounds you may hear glitches.


----

## By

Made with 🍺 by [andy](https://fenomas.com/).

License is ISC.
