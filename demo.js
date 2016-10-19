'use strict'
/* globals dat */

var fx = require('.')



// settings object
var settings = {
    duration: 0.4,
    sustain: 0.9,
    attack: 0.01,
    decay: 0.01,
    release: 0.4,

    frequency: 500,
    sweep: 1,
    repeat: 0,
    jumpAt1: 0.33,
    jumpBy1: 0,
    jumpAt2: 0.66,
    jumpBy2: 0,

    volume: -10,
    source: "triangle",
    harmonics: 0,

    tremolo: 0,
    tremoloFreq: 10,
    bitcrush: 0,
}



var sourceNames = ['sine', 'square', 'triangle', 'sawtooth', 'white noise', 'brown noise', 'pink noise']
var others = {
    sourceNum: sourceNames.indexOf(settings.source),
}

function setWave() {
    settings.source = sourceNames[others.sourceNum]
}




function go() {
    var t = performance.now()
    if (t - lt < 300) return
    fx.play(settings)
    lt = t
}
var lt = 0
window.addEventListener('keydown', function (ev) {
    if (ev.keyCode === 32) go()
})


/*
 * 		Building the dat-gui
*/
var opts = {
    autoPlace: false,
    hideable: false,
    width: 450,
}
var gui1 = new dat.GUI(opts)
var gui2 = new dat.GUI(opts)
document.querySelector('#menu1').appendChild(gui1.domElement)
document.querySelector('#menu2').appendChild(gui2.domElement)


// main
var f

f = gui2.addFolder('Wave')
f.add(settings, 'volume', -50, 50).step(1).name('volume (db)').onChange(go)
f.add(others, 'sourceNum', 0, sourceNames.length - 1).step(1).onChange(function () { setWave(); go() })
f.add(settings, 'source').name('source name').listen()
f.add(settings, 'harmonics', 0, 6).step(1).onChange(function () { setWave(); go() })

f = gui1.addFolder('Envelope')
f.add(settings, 'duration', 0.01, 1).step(0.01).onChange(go)
f.add(settings, 'sustain', 0, 1).step(0.1).name('sustain level').onChange(go)
f.add(settings, 'attack', 0, 1).step(0.001).onChange(go)
f.add(settings, 'decay', 0, 1).step(0.001).onChange(go)
f.add(settings, 'release', 0, 1).step(0.001).onChange(go)

f = gui1.addFolder('Pitch')
f.add(settings, 'frequency', 100, 2000).step(1).onChange(go)
f.add(settings, 'sweep', -2, 2).step(0.1).name('frequency sweep').onChange(go)
f.add(settings, 'repeat', 0, 20).step(0.1).name('repeat (Hz)').onChange(go)
f.add(settings, 'jumpAt1', 0, 1).step(0.01).name('jump 1 time').onChange(go)
f.add(settings, 'jumpBy1', -1, 1).step(0.01).name('jump 2 amount').onChange(go)
f.add(settings, 'jumpAt2', 0, 1).step(0.01).name('jump 1 time').onChange(go)
f.add(settings, 'jumpBy2', -1, 1).step(0.01).name('jump 2 amount').onChange(go)

f = gui2.addFolder('Effects')
f.add(settings, 'tremolo', 0, 1).step(0.01).name('tremolo depth').onChange(go)
f.add(settings, 'tremoloFreq', 0, 20).step(0.5).name('tremolo frequency').onChange(go)
f.add(settings, 'bitcrush', 0, 8).step(1).name('bitcrush bits').onChange(go)



window.gui1 = gui1
window.gui2 = gui2
for (var s in gui1.__folders) gui1.__folders[s].open()
for (var s in gui2.__folders) gui2.__folders[s].open()

console.clear()


