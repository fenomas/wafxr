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

    var getSynth = (function() {
        var i = 0, n = synths.length
        return function() { return synths[i++ % n] }
    })()
    var getNoise = (function() {
        var i = 0, n = synths.length
        return function() { return synths[i++ % n] }
    })()

    window.tone = Tone



    this.play = function (settings) {
        var env = settings.envelope
        var noteTime = settings.duration + env.attack + env.decay
        var totalTime = noteTime + env.release

        // input chain
        rampParam(Tone.Master.volume, settings.volume)

        // rampParam(tremolo.depth, settings.tremolo)
        // rampParam(tremolo.frequency, settings.tremoloFreq)
        tremolo.depth.value = settings.tremolo
        tremolo.frequency.value = settings.tremoloFreq
        tremolo.wet.value = (settings.tremolo) ? 1 : 0


        var bc = settings.bitcrush || 0
        crusher.bits = bc || 8
        crusher.wet.value = bc ? 1 : 0

        // instruments
        if (/noise/.test(settings.source)) {
            
            var noise = getNoise()
            noise.noise.type = settings.source.split(' ')[0]
            noise.envelope.attack = env.attack
            noise.envelope.decay = env.decay
            noise.envelope.sustain = env.sustain
            noise.envelope.release = env.release

            noise.triggerAttackRelease(noteTime)

        } else {

            var synth = getSynth()
            var type = settings.source
            if (settings.harmonics > 0) type += settings.harmonics
            synth.oscillator.type = type
            synth.envelope.attack = env.attack
            synth.envelope.decay = env.decay
            synth.envelope.sustain = env.sustain
            synth.envelope.release = env.release

            synth.triggerAttackRelease(settings.frequency, noteTime)
            if (settings.freqSweepMult !== 1) {
                var f = settings.frequency * settings.freqSweepMult
                synth.frequency.rampTo(f, totalTime)
            }
        }
    }

}



function rampParam(param, value) {
    if (param.value != value) param.rampTo(value, 0.02)
}


