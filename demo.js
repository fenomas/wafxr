'use strict'
/* globals dat */

var fx = require('.')
window.fx = fx
var $ = document.querySelector.bind(document)


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
    sourceNum: sourceNames.indexOf(settings.source),
}
function setSource() {
    settings.source = sourceNames[others.sourceNum]
}
function setSourceNum() {
    others.sourceNum = sourceNames.indexOf(settings.source)
}



// play a note on any settings update, with time limiter
function go() {
    var t = performance.now()
    if (t - lt < 300) return
    fx.play(settings)
    lt = t
    writeSettings()
}
var lt = 0

// play sound on spacebar
window.addEventListener('keydown', function (ev) {
    if (ev.keyCode !== 32) return
    go()
    ev.preventDefault()
})


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
    applyPreset(type) // way down below
    setSourceNum()
    go()
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
    if (Math.abs(n) > 100) return Math.round(n*10)/10
    if (Math.abs(n) > 10) return Math.round(n*100)/100
    if (Math.abs(n) > 1) return Math.round(n*1000)/1000
    return Math.round(n*10000)/10000
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
document.querySelector('#menu1').appendChild(gui1.domElement)
document.querySelector('#menu2').appendChild(gui2.domElement)


// main
var f

f = gui2.addFolder('Source')
f.add(settings, 'volume', -50, 50).step(1).name('volume (db)').listen().onChange(go)
f.add(others, 'sourceNum', 0, sourceNames.length - 1).step(1).name('source select').listen().onChange(function () { setSource(); go() })
f.add(settings, 'source').listen()
f.add(settings, 'harmonics', 0, 6).step(1).listen().onChange(function () { setSource(); go() })
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
f.add(settings, 'bitcrush', 0, 8).step(1).name('bitcrush bits').listen().onChange(go)
f.add(settings, 'tremolo', 0, 1).step(0.01).name('tremolo depth').listen().onChange(go)
f.add(settings, 'tremoloFreq', 0, 60).step(0.5).name('tremolo frequency').listen().onChange(go)
f.add(settings, 'vibrato', 0, 1).step(0.01).name('vibrato depth').listen().onChange(go)
f.add(settings, 'vibratoFreq', 0, 60).step(0.5).name('vibrato frequency').listen().onChange(go)

var maxFq = settings.lowpass
f.add(settings, 'lowpass', 0, maxFq).step(1).name('lowpass frequency').listen().onChange(go)
f.add(settings, 'lowpassSweep', -maxFq, maxFq).step(1).name('　　　↑ sweep').listen().onChange(go)
f.add(settings, 'highpass', 0, maxFq).step(1).name('highpass frequency').listen().onChange(go)
f.add(settings, 'highpassSweep', -maxFq, maxFq).step(1).name('　　　↑ sweep').listen().onChange(go)


window.gui1 = gui1
window.gui2 = gui2
for (var s in gui1.__folders) gui1.__folders[s].open()
for (var s in gui2.__folders) gui2.__folders[s].open()

console.clear()




// 
//          PRESETS
// 

function rand(a, b) { return a + (Math.random() * (b - a)) }
function rint(a, b) { return Math.floor(rand(a, b)) }
function rarr(arr) { return arr[rint(0, arr.length)] }
function rlog(a, b) { return Math.pow(2, rand(Math.log2(a), Math.log2(b))) }



// loosely based on https://github.com/ttencate/jfxr/blob/master/src/presets.js

function applyPreset(type) {

    if (type == 'jump') {
        settings.source = rarr(['sine', 'square', 'triangle'])
        settings.sustain = rand(0.05, 0.1)
        settings.release = rand(0.1, 0.4)
        settings.frequency = rlog(120, 1600)
        settings.sweep = rand(0.1, 1)
        settings.jumpAt1 = rand(0.1, 0.25)
        settings.jumpBy1 = rand(0.125, 0.5)
        if (rint(0, 2)) settings.lowpass = rand(1000, 5000)
        if (rint(0, 2)) settings.highpass = rand(100, 2000)
    }

    if (type == 'coin') {
        settings.source = rarr(['sine', 'square'])
        settings.sustain = rand(0.05, 0.1)
        settings.release = rand(0.1, 0.4)
        settings.frequency = rlog(120, 1600)
        if (rint(0, 4)) {
            settings.jumpAt1 = rand(0.1, 0.2)
            settings.jumpBy1 = rand(0.1, 0.4)
            if (rint(0, 1.4)) {
                settings.jumpAt2 = rand(0.2, 0.3)
                settings.jumpBy2 = rand(0.1, 0.5)
            }
        }
    }

    if (type == 'expl') {
        settings.source = rarr(['white noise', 'brown noise', 'pink noise'])
        settings.sustain = rand(0.05, 0.15)
        settings.release = rand(0.3, 0.5)
        if (rint(0, 2)) {
            settings.tremolo = rand(0.1, 0.7)
            settings.tremoloFreq = rlog(5, 60)
        }
        if (rint(0, 2)) {
            settings.lowpass = rlog(1000, 8000)
            settings.lowpassSweep = rand(-2000, 2000)
        }
        if (rint(0, 2)) {
            settings.highpass = rlog(100, 1500)
            settings.highpassSweep = rand(-2000, 2000)
        }
    }

    if (type == 'laser') {
        settings.source = rarr(['sine', 'square', 'triangle', 'sawtooth', 'pulse'])
        settings.sustain = rand(0.05, 0.1)
        settings.release = rand(0.05, 0.15)
        settings.frequency = rlog(500, 2000)
        settings.sweep = rand(-0.8, -0.1)
        if (rint(0, 2)) {
            settings.vibrato = rand(0.1, 0.5)
            settings.vibratoFreq = rlog(5, 60)
        }
    }

    if (type == 'ouch') {
        settings.source = rarr(['square', 'sawtooth', 'white noise', 'pink noise', 'brown noise'])
        settings.sustain = rand(0.05, 0.1)
        settings.release = rand(0.05, 0.15)
        settings.frequency = rlog(400, 1400)
        settings.sweep = rand(-0.5, -0.05)
        settings.lowpass = rand(1000, 8000)
        settings.lowpassSweep = rand(-settings.lowpass, 4000)
    }

    if (type == 'power') {
        settings.source = rarr(['sine', 'square', 'triangle', 'sawtooth', 'pulse'])
        settings.sustain = rand(0.05, 0.1)
        settings.release = rand(0.1, 0.4)
        settings.frequency = rlog(500, 2000)
        settings.sweep = rand(0, 0.7)
        if (rint(0, 2)) {
            settings.repeat = rand(2, 20)
        }
        if (rint(0, 2)) {
            settings.vibrato = rand(0.1, 0.5)
            settings.vibratoFreq = rlog(5, 60)
        }
    }

    if (type == 'ui') {
        settings.source = rarr(['sine', 'square', 'triangle', 'sawtooth', 'pulse'])
        settings.sustain = rand(0.01, 0.05)
        settings.release = rand(0.01, 0.05)
        settings.frequency = rlog(150, 3000)
        if (rint(0, 2)) {
            settings.sweep = rand(-0.4, 0.4)
        }
        if (rint(0, 2)) {
            settings.harmonics = rint(0, 6)
        }
    }

}



