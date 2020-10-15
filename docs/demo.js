

var $ = document.querySelector.bind(document)
var Tweakpane = require('tweakpane')
import './presets'


export var pane1 = new Tweakpane({ container: $('.settings1') })
export var pane2 = new Tweakpane({ container: $('.settings2') })
export var params = {}

export var demo = {
    beginEditingParams,
    finishEditingParams,
}


/*
 * 
 *      constants
 * 
*/

var types = {
    sine: 'sine',
    triangle: 'triangle',
    square: 'square',
    sawtooth: 'sawtooth',
    'pulse (10%)': 'p10',
    'pulse (25%)': 'p25',
    'pulse (40%)': 'p40',
    'harmonics(1, 0, 1)': 'w909',
    'harmonics(1, 1, 1)': 'w999',
    'harmonics(1, 0.6, 0.3)': 'w963',
    'white noise': 'n0',
    'pink noise': 'np',
    'brown noise': 'nb',
    'metallic noise': 'n1',
}

var effectTypes = {
    lowpass: 'lowpass',
    highpass: 'highpass',
    bandpass: 'bandpass',
    notch: 'notch',
}





/*
 * 
 * 
 * 
 *          UI setup
 * 
 * 
 * 
*/


var f
var o

o = params.main = {}
f = o.folder = pane1.addFolder({ title: 'MAIN' })
addNumeric(f, o, 'velocity', 1, 0, 1)
addNumeric(f, o, 'frequency', 440, 100, 8000, true, 1)


o = params.carrier = {}
f = o.folder = pane1.addFolder({ title: 'CARRIER SIGNAL' })
addPulldown(f, o, 'type', types, 'triangle')
addNumeric(f, o, 'attack', 0.1, 0, 5, true)
addNumeric(f, o, 'hold', 0, 0, 5, true)
addNumeric(f, o, 'sustain', 0.8, 0, 1, false)
addNumeric(f, o, 'decay', 0.1, 0, 5, true)
addNumeric(f, o, 'duration', 0.1, 0, 5, true)
addNumeric(f, o, 'release', 0.1, 0, 5, true)


o = params.distort1 = {}
f = o.folder = pane1.addFolder({ title: 'carrier distortion' })
addPulldown(f, o, 'type', {
    bitcrush: 'crush',
    clip: 'shape-clip',
    boost: 'shape-boost',
    fold: 'shape-fold',
    thin: 'shape-thin',
    fat: 'shape-fat',
})
addNumeric(f, o, 'argument', 5, 1, 20, false, 1)
o.folder.expanded = false



o = params.mods1 = {}
f = o.folder = pane1.addFolder({ title: 'freq mods 1' })
addNumeric(f, o, 'delay', 0.1, 0.01, 2, true, 0.01)
addNumeric(f, o, 'jump mult', 1, 0.5, 2, true, 0.05)
addNumeric(f, o, 'jump add', 0, -200, 200, false, 10)
addNumeric(f, o, 'sweep', 1, 0.1, 10, true, 0.05)
addNumeric(f, o, 'sweep time', 0.25, 0.01, 2, true, 0.01)
addNumeric(f, o, 'repeat', 1, 1, 20, false, 1)
o.folder.expanded = false



o = params.mods2 = {}
f = o.folder = pane1.addFolder({ title: 'freq mods 2' })
addNumeric(f, o, 'delay', 0.1, 0.01, 2, true, 0.01)
addNumeric(f, o, 'jump mult', 1, 0.5, 2, true, 0.05)
addNumeric(f, o, 'jump add', 0, -200, 200, false, 10)
addNumeric(f, o, 'sweep', 1, 0.1, 10, true, 0.05)
addNumeric(f, o, 'sweep time', 0.25, 0.01, 2, true, 0.01)
addNumeric(f, o, 'repeat', 1, 1, 20, false, 1)
o.folder.expanded = false






o = params.FM = {}
f = o.folder = pane2.addFolder({ title: 'FM signal' })
addNumeric(f, o, 'freq mult', 1, 0.1, 10, true)
addNumeric(f, o, 'freq add', 0, -10, 10, false, 0.1)
addPulldown(f, o, 'type', types)
addNumeric(f, o, 'gain mult', 1, 0.1, 10, true)
addNumeric(f, o, 'attack', 0.1, 0, 5, true)
addNumeric(f, o, 'decay', 0.1, 0, 5, true)
addNumeric(f, o, 'sustain', 0.8, 0, 1)
addNumeric(f, o, 'release', 0.1, 0, 5, true)
o.folder.expanded = false



o = params.tremolo = {}
f = o.folder = pane2.addFolder({ title: 'tremolo' })
addPulldown(f, o, 'type', types)
addNumeric(f, o, 'depth', 0.05, 0.01, 2, true)
addNumeric(f, o, 'frequency', 10, 0.1, 100, true)
o.folder.expanded = false



o = params.vibrato = {}
f = o.folder = pane2.addFolder({ title: 'vibrato' })
addPulldown(f, o, 'type', types)
addNumeric(f, o, 'depth', 0.2, 0.01, 2, true)
addNumeric(f, o, 'frequency', 10, 0.1, 100, true)
o.folder.expanded = false





o = params.effect1 = {}
f = o.folder = pane2.addFolder({ title: 'effect 1' })
addPulldown(f, o, 'type', effectTypes)
addNumeric(f, o, 'freq mult', 1, 0.1, 10, true)
addNumeric(f, o, 'sweep', 1, 0.1, 10, true)
addNumeric(f, o, 'sweep time', 0.2, 0.01, 2, true)
addNumeric(f, o, 'Q', 1, 0.2, 10, true, 0.1)
o.folder.expanded = false


o = params.effect2 = {}
f = o.folder = pane2.addFolder({ title: 'effect 2' })
addPulldown(f, o, 'type', effectTypes)
addNumeric(f, o, 'freq mult', 1, 0.1, 10, true)
addNumeric(f, o, 'sweep', 1, 0.1, 10, true)
addNumeric(f, o, 'sweep time', 0.2, 0.01, 2, true)
addNumeric(f, o, 'Q', 1, 0.2, 10, true, 0.1)
o.folder.expanded = false




o = params.distort2 = {}
f = o.folder = pane2.addFolder({ title: 'post distortion' })
addPulldown(f, o, 'type', {
    bitcrush: 'crush',
    clip: 'shape-clip',
    boost: 'shape-boost',
    fold: 'shape-fold',
    thin: 'shape-thin',
    fat: 'shape-fat',
})
addNumeric(f, o, 'argument', 5, 1, 20, false, 1)
o.folder.expanded = false
























/*
 * 
 *      helpers to simplify adding params
 * 
*/

function setKeyPrefix(obj) {
    if (obj.keyPrefix) return
    for (var s in params) if (params[s] === obj) obj.keyPrefix = s
}

function addPulldown(folder, obj, name, options, value) {
    setKeyPrefix(obj)
    var label = name
    name = name.replace(/\s+/g, '').toLowerCase()
    var presetKey = obj.keyPrefix + '_' + name
    obj[name] = value || options[Object.keys(options)[0]]
    folder.addInput(obj, name, { options, label, presetKey })
}

function addNumeric(folder, obj, name, val, min, max, logScale, step) {
    setKeyPrefix(obj)
    var label = name
    name = name.replace(/\s+/g, '').toLowerCase()
    var presetKey = obj.keyPrefix + '_' + name

    if (logScale) {
        var absmin = 0.001
        if (val < absmin) val = absmin
        if (min < absmin) min = absmin
        step = step || min
    } else {
        step = step || min || 0.01
    }
    obj[name] = val

    // cache-bust so it updates later
    if (logScale) obj[name] = min

    var input = folder.addInput(obj, name, { min, max, step, label, presetKey })

    if (logScale) {
        // deeply deeply hackish
        // log-ify the slider view
        var controller = input.controller.controller
        controller.view_.sliderInputView_.update = function () {
            var v = Math.log(this.value.rawValue)
            var min = Math.log(this.minValue_)
            var max = Math.log(this.maxValue_)
            var p = 100 * (v - min) / (max - min)
            this.innerElem_.style.width = p + '%'
        }
        // log-ify the slider inputs
        controller.sliderIc_.ptHandler_.computePosition_ = function (x, y) {
            var rect = this.element.getBoundingClientRect()
            var f = x / rect.width
            var val = Math.pow(max, f) * Math.pow(min, 1 - f)
            var px = (val - min) / (max - min)
            var py = y / rect.height
            return { px, py }
        }
        // rework the number formatting
        controller.view_.textInputView_.formatter_.format = function (val) {
            return fmt(val)
        }
        // undo cache-bust
        obj[name] = val
    }
}

// update all display-only log scale parameters
function refreshPanes() {
    pane1.refresh()
    pane2.refresh()
}

// params are all set up now, so refresh the log values
refreshPanes(true)








/*
 * 
 *          this bit is hairy, due to how much
 *          chrome hates pages that use webaudio
 * 
*/

var ignoreParamEvents = false

function beginEditingParams() {
    ignoreParamEvents = true
}

function finishEditingParams() {
    refreshPanes(true)
    playSound()
    ignoreParamEvents = false
}


// general event for all param changes
function onParamChange() {
    if (ignoreParamEvents) return
    refreshPanes(false)
    playSound(params)
}
pane1.on('change', onParamChange)
pane2.on('change', onParamChange)


// also play sound on keypresses
window.onkeydown = (ev) => {
    if (ev.metaKey) return
    if (ev.key === 'Tab') return
    if (ev.key === 'Shift') return
    var focused = document.activeElement
    if (focused && /text/.test(focused.type)) return

    var freq = params.main.frequency
    if (ev.key === ' ') {
        // don't scroll on space
        ev.preventDefault()
    } else {
        var chars = 'zxcvbnmasdfghjklqwertyuiop'
        var i = chars.indexOf(ev.key.toLowerCase())
        if (i < 0) return
        var scale = [0, 2, 4, 5, 7, 9, 11]
        var note = 55
        while (i >= scale.length) {
            note += 12
            i -= scale.length
        }
        note += scale[i]
        freq = 440 * Math.pow(2, (note - 69) / 12)
    }

    // the following implicitly triggers a sound
    beginEditingParams()
    params.main.frequency = freq
    finishEditingParams()
}














/*
 * 
 * 
 * 
 *          Program creation and sound playback
 * 
 * 
 * 
*/


// import Generator from '../../wasgen'
import Generator from 'wasgen'

var nextSoundCutoff = -1000
var gen, ctx

function playSound() {
    $('.hint').style.display = 'none'

    if (!gen) {
        ctx = new (window.AudioContext || window.webkitAudioContext)()
        var dest = ctx.createGain()
        dest.connect(ctx.destination)
        gen = new Generator(ctx, dest)
        window.gen = gen // so that playback code will run in console
        window.ctx = ctx
    }

    // overall play duration
    var duration = params.carrier.attack
        + params.carrier.hold
        + params.carrier.decay
        + params.carrier.duration

    // debounce
    var t = performance.now()
    if (t < nextSoundCutoff) return
    var wait = Math.min(Math.max(0.25, duration / 2), 1.5)
    nextSoundCutoff = t + wait * 1000

    // play the sound
    if (ctx.state !== 'running') ctx.resume()

    var program = [{
        type: params.carrier.type,
        freq: [],
        gain: [{
            a: params.carrier.attack,
            h: params.carrier.hold,
            d: params.carrier.decay,
            s: params.carrier.sustain,
            r: params.carrier.release,
        }],
    }]


    if (params.distort1.folder.expanded) {
        var d1 = params.distort1.type
        var d1a = params.distort1.argument
        program[0].effect = `${d1}-${d1a}`
    }


    if (params.mods1.folder.expanded) {
        program[0].freq.push({
            w: params.mods1.delay,
            t: params.mods1.jumpmult,
            f: params.mods1.jumpadd,
            a: 0,
            p: params.mods1.sweep,
            q: params.mods1.sweeptime,
            x: params.mods1.repeat,
        })
    }


    if (params.mods2.folder.expanded) {
        program[0].freq.push({
            w: params.mods2.delay,
            t: params.mods2.jumpmult,
            f: params.mods2.jumpadd,
            a: 0,
            p: params.mods2.sweep,
            q: params.mods2.sweeptime,
            x: params.mods2.repeat,
        })
    }



    if (params.tremolo.folder.expanded) {
        program[0].freq.push({
            type: params.tremolo.type,
            freq: params.tremolo.frequency,
            gain: { t: params.tremolo.depth },
        })
    }

    if (params.vibrato.folder.expanded) {
        program[0].gain.push({
            type: params.vibrato.type,
            freq: params.vibrato.frequency,
            gain: {
                t: params.vibrato.depth,
                r: params.carrier.release,
                z: 0,
            },
        })
    }

    if (params.FM.folder.expanded) {
        program[0].freq.push({
            type: params.FM.type,
            freq: {
                t: params.FM.freqmult,
                f: params.FM.freqadd,
            },
            gain: {
                t: params.FM.gainmult,
                a: params.FM.attack,
                d: params.FM.decay,
                s: params.FM.sustain,
                r: params.FM.release,
            },
        })
    }

    if (params.distort2.folder.expanded) {
        var d2 = params.distort2.type
        var d2a = params.distort2.argument
        program.push(`${d2}-${d2a}`)
    }

    if (params.effect1.folder.expanded) {
        program.push({
            type: params.effect1.type,
            freq: {
                t: params.effect1.freqmult,
                p: params.effect1.sweep,
                q: params.effect1.sweeptime,
            },
            Q: params.effect1.q,
        })
    }
    if (params.effect2.folder.expanded) {
        program.push({
            type: params.effect2.type,
            freq: {
                t: params.effect2.freqmult,
                p: params.effect2.sweep,
                q: params.effect2.sweeptime,
            },
            Q: params.effect2.q,
        })
    }

    program.forEach(prog => formatProgramObject(prog))

    var freq = fmt(params.main.frequency)
    var vel = fmt(params.main.velocity)
    var dur = fmt(duration)
    var now = gen.now() + 0.15

    gen.play(program, freq, vel, now, now + dur)
    writeCode(program, freq, vel, dur)
}


function fmt(num) {
    var sign = (num < 0) ? -1 : 1
    num = Math.abs(num)
    if (num < 0.002) return 0
    if (num > 10) return sign * Math.round(num)
    if (num > 1) return sign * Math.round(num * 10) / 10
    if (num > 0.1) return sign * Math.round(num * 100) / 100
    return sign * Math.round(num * 1000) / 1000
}

function formatProgramObject(obj) {
    Object.keys(obj).forEach(s => {
        if (Array.isArray(obj[s])) {
            if (obj[s].length === 1) obj[s] = obj[s][0]
        }
        if (typeof obj[s] === 'number') {
            obj[s] = fmt(obj[s])
        }
        if (typeof obj[s] === 'object') {
            if (Object.keys(obj[s]).length === 0) {
                delete obj[s]
            } else {
                formatProgramObject(obj[s])
            }
        }
    })
}








/*
 * 
 * 
 * 
 *          writing out playback code
 * 
 * 
 * 
*/

var textfield = $('.code')

function writeCode(program, freq, vel, dur) {
    var progstrs = program.map(o => stringify(o))

    textfield.value = ``
    textfield.value += `// import Gen from 'wasgen'\n`
    textfield.value += `// var gen = new Gen()\n`
    textfield.value += `gen.play([\n`
    progstrs.forEach(str => { textfield.value += `  ${str},\n` })
    textfield.value += `], ${freq}, ${vel}, gen.now(), gen.now() + ${dur})\n`
}

function stringify(obj) {
    roundNums(obj)
    var s = JSON.stringify(obj)
    s = s.replace(/"([^"]*)":/g, '$1:')
    s = s.replace(/,gain/g, ', gain')
    s = s.replace(/,freq/g, ', freq')
    return s
}

function roundNums(obj) {
    for (var key in obj) {
        if (typeof obj[key] === 'object') roundNums(obj[key])
        if (typeof obj[key] === 'number') obj[key] = Math.round(obj[key] * 1000) / 1000
    }
}



