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

    window.tone = Tone
    window.synth = synths[0]
    window.noise = noises[0]



    // set up timelineSignals to drive synth frequencies
    var freqs = []
    while (freqs.length < synths.length) {
        var synth = synths[freqs.length]
        freqs.push(new Tone.TimelineSignal().connect(synth.frequency))
    }
    var getFreq = (function () {
        var i = 0, n = freqs.length
        return function () { return freqs[i++ % n] }
    })()



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

            // set up necessary events related to sweeps and jumps
            var f = getFreq()
            var f0 = s.frequency
            var sweep = f0 * s.sweepBy
            var fn = s.frequency + sweep
            var t0 = Tone.now()
            var tn = t0 + duration

            // base value and overall sweep
            f.setValueAtTime(s.frequency, t0)
            if (sweep) f.exponentialRampToValueBetween(fn, t0, tn)
            console.log(sweep)            

            // intermediate jumps to other values
            checkJumpOrders(s)
            var fprev = f0
            if (s.jumpBy1) {
                var t1 = t0 + duration * s.jumpAt1
                var f1 = f.getValueAtTime(t1)
                sweep -= (f1 - fprev)
                f.setRampPoint(t1)
                var fjump1 = f1 * (1 + s.jumpBy1)
                f.setValueAtTime(fjump1, t1)
                if (sweep) f.exponentialRampToValueBetween(fjump1 + sweep, t1, tn)
                fprev = fjump1
            }

            if (s.jumpBy2) {
                var t2 = t0 + duration * s.jumpAt2
                var f2 = f.getValueAtTime(t2)
                sweep -= (f2 - fprev)
                f.setRampPoint(t2)
                var fjump2 = f2 * (1 + s.jumpBy2)
                f.setValueAtTime(fjump2, t2)
                if (sweep) f.exponentialRampToValueBetween(fjump2 + sweep, t2, tn)
            }

        }
    }

}



function rampParam(param, value) {
    if (param.value != value) param.rampTo(value, 0.02)
}


function checkJumpOrders(settings) {
    if (settings.jumpBy1 && settings.jumpBy2) {
        if (settings.jumpAt2 < settings.jumpAt1) {
            var t1 = settings.jumpBy1
            var t2 = settings.jumpAt1
            settings.jumpBy1 = settings.jumpBy2
            settings.jumpAt1 = settings.jumpAt2
            settings.jumpBy2 = t1 
            settings.jumpAt2 = t2 
        }
    }
}


