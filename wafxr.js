'use strict'

var Tone = require('tone')

module.exports = new FX()


/*
 *  
 *   Defaults - these are all the options wafxr recognizes
 *  
*/

var defaults = {
    attack: 0.01,
    decay: 0.01,
    sustain: 0.4,
    release: 0.4,
    sustainLevel: 0.8,

    frequency: 440,
    sweep: 0,
    repeat: 0,
    jumpAt1: 0.33,
    jumpBy1: 0,
    jumpAt2: 0.66,
    jumpBy2: 0,

    volume: 0,
    source: "triangle",
    harmonics: 0,
    pulseWidth: 0.5,

    bitcrush: 0,
    tremolo: 0,
    tremoloFreq: 10,
    vibrato: 0,
    vibratoFreq: 10,

    lowpass: 22000,
    lowpassSweep: 0,
    highpass: 0,
    highpassSweep: 0,
}



/*
 *  
 *   Main module
 *  
*/

function FX() {

    // input chain
    var input = new Tone.Gain(1)
    var crusher = new Tone.BitCrusher(8)
    var tremolo = new Tone.Tremolo(5, 1)
    var vibrato = new Tone.Vibrato(5, 1)
    var lowpass = new Tone.Filter(22000, 'lowpass')
    var highpass = new Tone.Filter(0, 'highpass')

    crusher.wet.value = 0
    tremolo.wet.value = 0
    vibrato.wet.value = 0
    tremolo.start()
    input.chain(vibrato, tremolo, lowpass, highpass, crusher, Tone.Master)

    // instrument pool
    var synths = []
    var noises = []
    while (synths.length < 3) synths.push(new Tone.Synth())
    while (noises.length < 2) noises.push(new Tone.NoiseSynth())

    synths.concat(noises).forEach(function (v) {
        v.envelope.releaseCurve = 'linear'
        v.connect(input)
    })

    var getSynth = makeObjectPoolGetter(synths)
    var getNoise = makeObjectPoolGetter(noises)

    window.Tone = Tone
    window.synth = synths[0]
    window.noise = noises[0]


    // a timelineSignal used for calculating ramped values
    var signal = new Tone.TimelineSignal()


    /*
     *      APIs 
    */

    this.getDefaults = function () {
        var obj = {}
        for (var s in defaults) obj[s] = defaults[s]
        return obj
    }


    this.play = function (settings) {
        var s = settings || {}
        var attack = (s.attack === undefined) ? defaults.attack : s.attack
        var decay = (s.decay === undefined) ? defaults.decay : s.decay
        var sustain = (s.sustain === undefined) ? defaults.sustain : s.sustain
        var release = (s.release === undefined) ? defaults.release : s.release
        var sustainLevel = (s.sustainLevel === undefined) ? defaults.sustainLevel : s.sustainLevel
        var holdTime = sustain + attack + decay
        var duration = holdTime + release

        // input chain

        tremolo.wet.value = (s.tremolo) ? 1 : 0
        if (s.tremolo) {
            tremolo.depth.value = s.tremolo
            tremolo.frequency.value = s.tremoloFreq || 0
        }
        window.t = tremolo

        vibrato.wet.value = (s.vibrato) ? 1 : 0
        if (s.vibrato) {
            vibrato.depth.value = s.vibrato
            vibrato.frequency.value = s.vibratoFreq || 0
        }

        lowpass.frequency.value = s.lowpass || defaults.lowpass
        if (s.lowpass && s.lowpassSweep) {
            lowpass.frequency.rampTo(s.lowpass + s.lowpassSweep, duration)
        }

        highpass.frequency.value = s.highpass || defaults.highpass
        if (s.highpass && s.highpassSweep) {
            highpass.frequency.rampTo(s.highpass + s.highpassSweep, duration)
        }

        crusher.wet.value = s.bitcrush ? 1 : 0
        crusher.bits = s.bitcrush || 8

        // instruments
        if (/noise/.test(s.source)) {

            var noise = getNoise()
            noise.volume.value = s.volume || 0
            noise.noise.type = s.source.split(' ')[0]
            noise.envelope.attack = attack
            noise.envelope.decay = decay
            noise.envelope.sustain = sustainLevel
            noise.envelope.release = release

            noise.triggerAttackRelease(holdTime)

        } else {

            var synth = getSynth()
            synth.volume.value = s.volume || 0
            var type = s.source || defaults.source
            var isPulse = (type == 'pulse')
            if (!isPulse && s.harmonics > 0) type += s.harmonics
            synth.oscillator.type = type
            if (isPulse) synth.oscillator.width.value = s.pulseWidth || defaults.pulseWidth
            synth.envelope.attack = attack
            synth.envelope.decay = decay
            synth.envelope.sustain = sustainLevel
            synth.envelope.release = release

            synth.triggerAttackRelease(0, holdTime)

            // set up necessary frequency values with sweeps and jumps
            // times are scaled to t0=0, tn=1, for now
            var freqSetting = s.frequency || defaults.frequency
            var f0 = synth.toFrequency(freqSetting)
            var fn = s.sweep ? f0 * (1 + s.sweep) : f0
            var t0 = 0
            var tn = 1

            // calculate ramp/jump values
            var t1 = tn * (s.jumpAt1 || defaults.jumpAt1)
            var t2 = tn * (s.jumpAt2 || defaults.jumpAt2)
            var j1 = s.jumpBy1 || 0
            var j2 = s.jumpBy2 || 0
            if (t2 < t1) {
                var _temp = t1; t1 = t2; t2 = _temp
                _temp = j1; j1 = j2; j2 = _temp
            }

            if (j1 === 0) t1 = 0
            var f1 = fqInterpolate(t0, tn, f0, fn, t1)
            var f1b = f1 * (1 + j1)
            fn += f1b - f1

            if (j2 === 0) t2 = t1
            var f2 = fqInterpolate(t1, tn, f1b, fn, t2)
            var f2b = f2 * (1 + j2)
            fn += f2b - f2

            // period for repeating the whole sweep/jump process
            var repeat = s.repeat || 0
            if (repeat > 100) repeat = 100
            var period = repeat ? 1 / repeat : duration
            if (period > duration) period = duration

            // init state for scheduling ramps and jumps
            var fq = synth.frequency
            fq.value = f0
            var currF = f0
            var currT = Tone.now()
            var end = currT + duration

            // for some reson Edge and Firefox require this
            fq.setRampPoint()

            // scale times to the specified period
            t1 *= period
            t2 *= period
            tn = period

            // loop through scheduling one period at a time
            while (currT < end) {
                if (currF != f0) currF = doJump(fq, f0, currT + t0)
                if (currF != f1) currF = doRamp(fq, f1, currT + t1)
                if (currF != f1b) currF = doJump(fq, f1b, currT + t1)
                if (currF != f2) currF = doRamp(fq, f2, currT + t2)
                if (currF != f2b) currF = doJump(fq, f2b, currT + t2)
                if (currF != fn) currF = doRamp(fq, fn, currT + tn)
                currT += period
            }
        }
    }

}


/*
 *
 *      Miscellaneous helpers 
 * 
*/

function rampParam(param, value) {
    if (param.value != value) param.rampTo(value, 0.02)
}

function doJump(signal, value, time) {
    signal.setValueAtTime(value, time)
    return value
}

function doRamp(signal, value, time) {
    signal.exponentialRampToValueAtTime(value, time)
    return value
}

function fqInterpolate(t0, tn, f0, fn, t) {
    if (t === t0) return f0
    _signal.setValueAtTime(f0, 0)
    _signal.exponentialRampToValueBetween(fn, 0, tn - t0)
    return _signal.getValueAtTime(t - t0)
}
var _signal = new Tone.TimelineSignal()



function makeObjectPoolGetter(arr) {
    var i = 0
    var n = arr.length
    return function () { return arr[i++ % n] }
}

