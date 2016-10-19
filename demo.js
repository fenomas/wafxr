'use strict'
/* globals dat */

var fx = require('.')



// settings object
var settings = {
    duration: 0.4,
    volume: 0,
    frequency: 500,
    sweepBy: 1,
    jumpBy1: 0,
    jumpAt1: 0.5,
    jumpBy2: 0,
    jumpAt2: 0.66,

    source: "triangle",
    harmonics: 0,
    bitcrush: 0,
    envelope: {
        sustain: 0.9,
        attack: 0.01,
        decay: 0.01,
        release: 0.4,
    },
    tremolo: 0,
    tremoloFreq: 10,
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
f.add(settings, 'volume', -50, 50).step(1).onChange(go)
f.add(others, 'sourceNum', 0, sourceNames.length - 1).step(1).onChange(function () { setWave(); go() })
f.add(settings, 'source').listen()
f.add(settings, 'harmonics', 0, 6).step(1).onChange(function () { setWave(); go() })

f = gui1.addFolder('Shape')
f.add(settings, 'duration', 0.01, 1).step(0.01).onChange(go)
f.add(settings.envelope, 'sustain', 0, 1).step(0.1).onChange(go)
f.add(settings.envelope, 'attack', 0, 1).step(0.001).onChange(go)
f.add(settings.envelope, 'decay', 0, 1).step(0.001).onChange(go)
f.add(settings.envelope, 'release', 0, 1).step(0.001).onChange(go)

f = gui1.addFolder('Pitch')
f.add(settings, 'frequency', 100, 2000).step(1).onChange(go)
f.add(settings, 'sweepBy', -2, 2).step(0.1).onChange(go)
f.add(settings, 'jumpBy1', -1, 1).step(0.01).onChange(go)
f.add(settings, 'jumpAt1', 0, 1).step(0.01).onChange(go)
f.add(settings, 'jumpBy2', -1, 1).step(0.01).onChange(go)
f.add(settings, 'jumpAt2', 0, 1).step(0.01).onChange(go)

f = gui2.addFolder('Effects')
f.add(settings, 'tremolo', 0, 1).step(0.01).onChange(go)
f.add(settings, 'tremoloFreq', 0, 20).step(0.5).onChange(go)
f.add(settings, 'bitcrush', 0, 8).step(1).onChange(go)



window.gui1 = gui1
window.gui2 = gui2
for (var s in gui1.__folders) gui1.__folders[s].open()
for (var s in gui2.__folders) gui2.__folders[s].open()

console.clear()


