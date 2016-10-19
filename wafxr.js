'use strict'

var Tone = require('tone')

module.exports = new FX()


function FX() {

    // input chain
    var input = new Tone.Gain(1)
    var crusher = new Tone.BitCrusher(8)
    crusher.wet.value = 0

    var tremolo = new Tone.Tremolo(5, 1).toMaster().start()
    tremolo.wet.value = 0

    input.chain(tremolo, crusher, Tone.Master)


    // instruments
    var synths = []
    var noises = []
    while (synths.length < 3) synths.push(new Tone.Synth())
    while (noises.length < 2) noises.push(new Tone.NoiseSynth())

    synths.concat(noises).forEach(v => {
        v.envelope.releaseCurve = 'linear'
        v.connect(input)
    })

    var getSynth = (function () {
        var i = 0, n = synths.length
        return function () { return synths[i++ % n] }
    })()
    var getNoise = (function () {
        var i = 0, n = noises.length
        return function () { return noises[i++ % n] }
    })()

    window.Tone = Tone
    window.synth = synths[0]
    window.noise = noises[0]


    // a timelineSignal used for calculating ramped values
    var signal = new Tone.TimelineSignal()



    this.play = function (settings) {
        var s = settings
        var env = s.envelope
        var holdTime = s.duration + env.attack + env.decay
        var duration = holdTime + env.release

        // input chain
        rampParam(Tone.Master.volume, s.volume)

        // rampParam(tremolo.depth, s.tremolo)
        // rampParam(tremolo.frequency, s.tremoloFreq)
        tremolo.depth.value = s.tremolo
        tremolo.frequency.value = s.tremoloFreq
        tremolo.wet.value = (s.tremolo) ? 1 : 0


        var bc = s.bitcrush || 0
        crusher.bits = bc || 8
        crusher.wet.value = bc ? 1 : 0

        // instruments
        if (/noise/.test(s.source)) {

            var noise = getNoise()
            noise.noise.type = s.source.split(' ')[0]
            noise.envelope.attack = env.attack
            noise.envelope.decay = env.decay
            noise.envelope.sustain = env.sustain
            noise.envelope.release = env.release

            noise.triggerAttackRelease(holdTime)

        } else {

            var synth = getSynth()
            var type = s.source
            if (s.harmonics > 0) type += s.harmonics
            synth.oscillator.type = type
            synth.envelope.attack = env.attack
            synth.envelope.decay = env.decay
            synth.envelope.sustain = env.sustain
            synth.envelope.release = env.release

            synth.triggerAttackRelease(0, holdTime)

            // set up necessary frequency values with sweeps and jumps
            var f0 = s.frequency
            var fn = s.sweepBy ? f0 * (1 + s.sweepBy) : f0
            var t0 = 0
            var tn = duration

            // calculate ramp/jump values
            var t1 = tn * s.jumpAt1
            var t2 = tn * s.jumpAt2
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

            // schedule the actual ramps and jumps
            var f = synth.frequency
            var curr = f0
            var now = Tone.now()

            f.value = curr
            if (curr != f1) curr = doRamp(f, f1, now + t1)
            if (curr != f1b) curr = doJump(f, f1b, now + t1)
            if (curr != f2) curr = doRamp(f, f2, now + t2)
            if (curr != f2b) curr = doJump(f, f2b, now + t2)
            if (curr != fn) curr = doRamp(f, fn, now + tn)

        }
    }

}



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


