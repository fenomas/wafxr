'use strict'

var Tone = require('tone')

module.exports = new FX()


function FX() {

    // var settings = {
    //     duration: 0.5,
    //     frequency: 440,
    //     sweepMult: 0.1,
    //     source: "sine",
    //     harmonics: 0,
    //     envelope: {
    //         attack: 0.005,
    //         decay: 0.1,
    //         sustain: 0.9,
    //         release: 1,
    //     },
    // }

    // input chain
    var input = new Tone.Gain(1)
    var crusher = new Tone.BitCrusher(8)
    crusher.wet.value = 0

    var tremolo = new Tone.Tremolo(5, 1).toMaster().start()
    tremolo.wet.value = 0

    input.chain(tremolo, crusher, Tone.Master)


    // instruments
    var defaults = {
        envelope: {
            releaseCurve: 'linear',
        }
    }
    var synth = new Tone.Synth(defaults).connect(tremolo)
    var noise = new Tone.NoiseSynth(defaults).connect(tremolo)

    window.tone = Tone
    window.t = tremolo



    this.play = function (settings) {
        var env = settings.envelope
        var time = getADSTime(settings.duration, env)

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
            noise.noise.type = settings.source.split(' ')[0]
            noise.envelope.attack = env.attack
            noise.envelope.decay = env.decay
            noise.envelope.sustain = env.sustain
            noise.envelope.release = env.release

            noise.triggerAttackRelease(time)
        } else {
            var type = settings.source
            if (settings.harmonics > 0) type += settings.harmonics
            synth.oscillator.type = type
            synth.envelope.attack = env.attack
            synth.envelope.decay = env.decay
            synth.envelope.sustain = env.sustain
            synth.envelope.release = env.release

            synth.triggerAttackRelease(settings.frequency, time)
            if (settings.freqSweepMult !== 1) {
                var dur = time + settings.envelope.release
                synth.frequency.rampTo(settings.frequency * settings.freqSweepMult, dur)
            }
        }
    }

}


function getADSTime(duration, envelope) {
    return duration + envelope.attack + envelope.decay
}

function rampParam(param, value) {
    if (param.value != value) param.rampTo(value, 0.02)
}


