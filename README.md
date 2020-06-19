
# wafxr

`wafxr` is a sound effect tool for Web Audio,
in the tradition of 
[as3fxr](http://www.superflashbros.net/as3sfxr/), 
[bfxr](http://www.bfxr.net/), 
[jfxr](http://jfxr.frozenfractal.com/), 
and so forth. Where most such tools generate sound files, this one 
creates sound dynamically via the 
[wasgen](https://github.com/andyhall/wasgen) library.

> [Demo](https://andyhall.github.io/wafxr/)

Supports oscillators, FM synth, tremolo/vibrato, and various other 
filters and effects. Think of this project as a convenient UI to the 
underlying `wasgen` module (which can create arbitrarily complex 
audio graphs, if you need something beyond what's doable with `wafxr`).


## Usage

First open the [demo page](https://andyhall.github.io/wafxr/), and 
play with the presets and UI until you have a sound you like.

Then copy the sample code from the text field into your project.
Sounds are played by [wasgen](https://github.com/andyhall/wasgen),
so you'll need that as a dependency.

```shell
npm install --save wasgen
```

Sample code from the demo UI:

```js
import Gen from 'wasgen'
var gen = new Gen()
gen.play([
  /* .. sound program here .. */
], 440, 1, gen.now(), gen.now() + 0.1)
```


## Notes

Dynamic web audio is generally supported on mobile devices, but 
even relatively simple sounds will often have artifacts due to CPU demands.
To realistically target mobile, you'll probably need to render 
your sound effects ahead of time into audio files for later playback.

Doing this with web audio should be straightforward, but 
neither this project nor `wasgen` has implemented it yet.
(PRs welcome!)


----

## By

Made with 🍺 by [andy](https://fenomas.com/).

License is ISC.
