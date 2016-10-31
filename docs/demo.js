'use strict'
/* globals dat */

var fx = require('..')
var presets = require('./presets')
var $ = document.querySelector.bind(document)
window.fx = fx
window.Tone = fx._tone


// settings object - directly watched by dat-gui
var baseSettings = fx.getDefaults()
var settings = {}
function resetSettings() {
    for (var s in baseSettings) {
        if (s == 'volume') continue
        settings[s] = baseSettings[s]
    }
}
settings.volume = -10
resetSettings()


// additional settings object for menus
var sourceNames = ['sine', 'square', 'triangle', 'sawtooth', 'pulse', 'white noise', 'brown noise', 'pink noise']
var others = {
    autoplay: true,
    autorepeat: 0,
    masterVol: 1,
    listenerX: 0,
    listenerY: 0,
    listenerZ: 1,
    listenerAngle: 0,
}



// play a note on any settings update, with time limiter
function go() {
    if (!others.autoplay) return
    var t = performance.now()
    if (t < nextgo) return
    nextgo = t + replayDelay
    play()
}
var replayDelay = 250
var nextgo = 0


function play() {
    fx.play(settings)
    writeSettings()
}


// play sound on spacebar
window.addEventListener('keydown', function (ev) {
    if (ev.keyCode !== 32) return
    play()
    ev.preventDefault()
})


// repeat every feature
function setRepeat(val) { }
var nextRepeat = 0
setInterval(function() {
    if (others.autorepeat < 1) return
    var now = performance.now()
    if (now > nextRepeat) {
        play()
        nextRepeat = now + others.autorepeat
    }
}, 5)


// top nav buttons
$('#reset').addEventListener('click', onBut.bind(null, 'reset'))
$('#jump').addEventListener('click', onBut.bind(null, 'jump'))
$('#coin').addEventListener('click', onBut.bind(null, 'coin'))
$('#expl').addEventListener('click', onBut.bind(null, 'expl'))
$('#laser').addEventListener('click', onBut.bind(null, 'laser'))
$('#ouch').addEventListener('click', onBut.bind(null, 'ouch'))
$('#power').addEventListener('click', onBut.bind(null, 'power'))
$('#ui').addEventListener('click', onBut.bind(null, 'ui'))

function onBut(type) {
    resetSettings()
    presets.apply(settings, type)
    play()
}


function writeSettings() {
    var tmp = {}
    for (var s in settings) {
        var v = settings[s]
        if (v != baseSettings[s]) {
            if (typeof v == 'number') v = round(v)
            tmp[s] = v
        }
    }
    $('#settings').value = JSON.stringify(tmp)
}
function round(n) {
    if (Math.abs(n) > 1000) return Math.round(n)
    if (Math.abs(n) > 100) return Math.round(n * 10) / 10
    if (Math.abs(n) > 10) return Math.round(n * 100) / 100
    if (Math.abs(n) > 1) return Math.round(n * 1000) / 1000
    return Math.round(n * 10000) / 10000
}


/*
 * 		Building the dat-gui
*/
var opts = {
    autoPlace: false,
    hideable: false,
    width: 400,
}
var gui1 = new dat.GUI(opts)
var gui2 = new dat.GUI(opts)
var gui3 = new dat.GUI(opts)
document.querySelector('#menu1').appendChild(gui1.domElement)
document.querySelector('#menu2').appendChild(gui2.domElement)
document.querySelector('#menu3').appendChild(gui3.domElement)


// main
var f

f = gui1.addFolder('Source')
f.add(settings, 'volume', -50, 50).step(1).name('volume (db)').listen().onChange(go)
f.add(settings, 'source', sourceNames).listen().onChange(go)
f.add(settings, 'harmonics', 0, 6).step(1).listen().onChange(go)
f.add(settings, 'pulseWidth', 0, 1).step(0.01).listen().onChange(go)

f = gui1.addFolder('Envelope')
f.add(settings, 'attack', 0, 1).step(0.001).listen().onChange(go)
f.add(settings, 'decay', 0, 1).step(0.001).listen().onChange(go)
f.add(settings, 'sustain', 0.01, 2).step(0.01).listen().onChange(go)
f.add(settings, 'release', 0, 1).step(0.001).listen().onChange(go)
f.add(settings, 'sustainLevel', 0, 1).step(0.1).name('sustain level').listen().onChange(go)

f = gui1.addFolder('Pitch')
f.add(settings, 'frequency', 100, 3000).step(1).listen().onChange(go)
f.add(settings, 'sweep', -2, 2).step(0.01).name('　　↑ sweep').listen().onChange(go)
f.add(settings, 'repeat', 0, 20).step(0.1).name('repeat (Hz)').listen().onChange(go)
f.add(settings, 'jumpBy1', -1, 1).step(0.01).name('jump 1 amount').listen().onChange(go)
f.add(settings, 'jumpAt1', 0, 1).step(0.01).name('　　↑ onset').listen().onChange(go)
f.add(settings, 'jumpBy2', -1, 1).step(0.01).name('jump 2 amount').listen().onChange(go)
f.add(settings, 'jumpAt2', 0, 1).step(0.01).name('　　↑ onset').listen().onChange(go)

f = gui2.addFolder('Effects')
f.add(settings, 'compressorThreshold', -100, 0).step(1).listen().onChange(go)
f.add(settings, 'bitcrush', 0, 8).step(1).name('bitcrush bits').listen().onChange(go)
f.add(settings, 'tremolo', 0, 1).step(0.01).name('tremolo depth').listen().onChange(go)
f.add(settings, 'tremoloFreq', 0, 60).step(0.5).name('tremolo frequency').listen().onChange(go)
f.add(settings, 'vibrato', 0, 1).step(0.01).name('vibrato depth').listen().onChange(go)
f.add(settings, 'vibratoFreq', 0, 60).step(0.5).name('vibrato frequency').listen().onChange(go)
var maxFq = settings.lowpass
f.add(settings, 'lowpass', 10, maxFq).step(1).name('lowpass frequency').listen().onChange(go)
f.add(settings, 'lowpassSweep', -maxFq, maxFq).step(1).name('　　　↑ sweep').listen().onChange(go)
f.add(settings, 'highpass', 10, maxFq).step(1).name('highpass frequency').listen().onChange(go)
f.add(settings, 'highpassSweep', -maxFq, maxFq).step(1).name('　　　↑ sweep').listen().onChange(go)
f.add(settings, 'bandpassQ', 0.01, 10).step(0.01).name('bandpass Q').listen().onChange(go)
f.add(settings, 'bandpass', 10, maxFq).step(1).name('　　　↑ frequency').listen().onChange(go)
f.add(settings, 'bandpassSweep', -maxFq, maxFq).step(1).name('　　　↑ sweep').listen().onChange(go)

// f = gui2.addFolder('Compression')
// f.add(settings, 'compressorRatio', 1, 20).step(0.1).listen().onChange(go)
// f.add(settings, 'compressorThreshold', -100, 0).step(1).listen().onChange(go)
// f.add(settings, 'compressorRelease', 0, 1).step(0.01).listen().onChange(go)
// f.add(settings, 'compressorAttack', 0, 0.1).step(0.001).listen().onChange(go)
// f.add(settings, 'compressorKnee', 0, 40).step(0.1).listen().onChange(go)

f = gui3.addFolder('Globals')
var maxd = 100
f.add(others, 'autoplay').name('Play on settings change')
f.add(others, 'autorepeat', 0, 500).step(20).name('Auto-repeat every (ms)').onChange(setRepeat)
f.add(others, 'masterVol', 0, 1).step(0.01).name('Master volume').onChange(function (v) { fx.setVolume(v) })
f.add(others, 'listenerX', -maxd, maxd).step(0.1).name('listener pos. X').onChange(setPos)
f.add(others, 'listenerY', -maxd, maxd).step(0.1).name('listener pos. Y').onChange(setPos)
f.add(others, 'listenerZ', -maxd, maxd).step(0.1).name('listener pos. Z').onChange(setPos)
f.add(others, 'listenerAngle', -180, 180).step(1).name('listener forward angle').onChange(setAng)

f = gui3.addFolder('Spatialization')
f.add(settings, 'soundX', -maxd, maxd).step(0.1).name('sound pos. X').listen().onChange(go)
f.add(settings, 'soundY', -maxd, maxd).step(0.1).name('sound pos. Y').listen().onChange(go)
f.add(settings, 'soundZ', -maxd, maxd).step(0.1).name('sound pos. Z').listen().onChange(go)
f.add(settings, 'rolloff', 0, 10).step(0.1).name('rolloff factor').listen().onChange(go)
f.add(settings, 'refDistance', 0, 20).step(0.5).name('rolloff start dist.').listen().onChange(go)
function setPos() {
    fx.setListenerPosition(others.listenerX, others.listenerY, others.listenerZ)
    go()
}
function setAng() {
    fx.setListenerPosition(others.listenerX, others.listenerY, others.listenerZ)
    fx.setListenerAngle(others.listenerAngle)
    fx.setListenerAngle(others.listenerAngle)
    go()
}
fx.setListenerPosition(others.listenerX, others.listenerY, others.listenerZ)
fx.setListenerAngle(others.listenerAngle)


window.gui1 = gui1
window.gui2 = gui2
window.gui3 = gui3
for (var s in gui1.__folders) gui1.__folders[s].open()
for (var s in gui2.__folders) gui2.__folders[s].open()
// for (var s in gui3.__folders) gui3.__folders[s].open()

console.clear()






