
# wafxr

> [Live demo](https://andyhall.github.io/wafxr/)

`wafxr` is a sound effect generator in the tradition of 
[as3fxr](http://www.superflashbros.net/as3sfxr/), 
[bfxr](http://www.bfxr.net/), 
[jfxr](http://jfxr.frozenfractal.com/), and so on. 
Whereas most such tools generate static files, 
this one plays sounds dynamically via WebAudio and the 
[wasgen](https://github.com/andyhall/wasgen) library.


Supports oscillators, FM synth, tremolo/vibrato, and various other 
filters and effects. Use this project as a convenient front-end for the
underlying `wasgen` library (which can create arbitrarily complex 
audio graphs, if write your own effect programs).


## Usage

Open the [demo](https://andyhall.github.io/wafxr/) and 
twiddle the UI until you have a sound you like. 
Then copy the `playback code` into your project, 
add [wasgen](https://github.com/andyhall/wasgen) as a dependency, 
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
but it's CPU intensive so you may hear pops or glitches.
Realistically, for mobile it's probably better to pre-render your sound 
into an audio buffer for later playback. This should be 
straightforward to do by giving `wasgen` an offline AudioContext, 
but there's no automatic API for it yet.


----

## By

Made with 🍺 by [andy](https://fenomas.com/).

License is ISC.
