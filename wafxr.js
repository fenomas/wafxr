'use strict'


var Tone = require('tone')
var nodeDefs = require('./lib/nodeDefs')(Tone)
var NodePool = require('./lib/nodePool')

module.exports = new FX()



/*
 *  
 *      Defaults - these are all the options wafxr recognizes
 *  
*/

var defaults = {
    attack: 0.01,
    decay: 0.01,
    sustain: 0.1,
    release: 0.2,
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

    lowpass: 10000,
    lowpassSweep: 0,
    highpass: 10,
    highpassSweep: 0,
    bandpass: 500,
    bandpassQ: 0.01,
    bandpassSweep: 0,

    compressorThreshold: 0,
    // compressorRatio: 12,
    // compressorRelease: 0.25,     // I could be crazy but the rest 
    // compressorAttack: 0.003,     // of these don't seem to be worth including
    // compressorKnee: 30,

    soundX: 0,
    soundY: 0,
    soundZ: 0,
    rolloff: 1,
}




/*
 *  
 *   Main module
 *  
*/

function FX() {
    this._tone = Tone

    // big bunch of Tone node pools
    var synthPool = new NodePool(nodeDefs.Synth)
    var noisePool = new NodePool(nodeDefs.Noise)

    // effect node definitions, and pools for same
    var effectDefs = [
        nodeDefs.Panner,
        nodeDefs.Vibrato,
        nodeDefs.Tremolo,
        nodeDefs.Lowpass,
        nodeDefs.Highpass,
        nodeDefs.Bandpass,
        nodeDefs.BitCrusher,
        nodeDefs.Compressor,
    ]
    var effectPools = effectDefs.map(function (def) {
        return new NodePool(def)
    })

    // single output for master volume control
    var outputNode = new Tone.Gain(1).toMaster()



    /*
     * 
     *      APIs 
     * 
    */

    this.getDefaults = function () {
        var obj = {}
        for (var s in defaults) obj[s] = defaults[s]
        return obj
    }

    this.setVolume = function (v) {
        v = (v < 0) ? 0 : (v > 1) ? 1 : v
        outputNode.gain.value = v
    }

    this.setListenerPosition = function (x, y, z) {
        Tone.Listener.setPosition(x, y, z)
    }

    this.setListenerAngle = function (angle) {
        var theta = angle * Math.PI / 180
        Tone.Listener.forwardX = Math.sin(theta)
        Tone.Listener.forwardZ = -Math.cos(theta)
    }

    // this._report = function () {
    //     console.log(effectPools.map(n => n._getSize()))
    // }

    this.play = function (settings) {
        var sets = settings || {}
        var defs = defaults

        var attack = isNaN(sets.attack) ? defs.attack : sets.attack
        var decay = isNaN(sets.decay) ? defs.decay : sets.decay
        var sustain = isNaN(sets.sustain) ? defs.sustain : sets.sustain
        var release = isNaN(sets.release) ? defs.release : sets.release
        var sustainLevel = isNaN(sets.sustainLevel) ? defs.sustainLevel : sets.sustainLevel

        var holdTime = sustain + attack + decay
        var duration = holdTime + release
        var now = Tone.now()


        // determine instrument and set up envelope, basic settings
        var source = sets.source || defs.source
        var isNoise = /noise/.test(source)
        var inst = (isNoise) ?
            noisePool.getFor(duration) :
            synthPool.getFor(duration)
        setVolume(inst.volume, sets.volume || 0, now, duration)
        setSoundEnvelope(inst, attack, decay, sustainLevel, release)


        if (isNoise) {
            // noise-specific settings

            inst.noise.type = source.split(' ')[0]
            inst.triggerAttackRelease(holdTime)

        } else {
            // synth-specific settings - frequencies, sweeps, jumps, etc.

            var isPulse = (source == 'pulse')
            if (!isPulse && sets.harmonics > 0) source += sets.harmonics
            inst.oscillator.type = source
            if (isPulse) inst.oscillator.width.value = sets.pulseWidth || defs.pulseWidth

            var freqSetting = sets.frequency || defs.frequency
            var f0 = inst.toFrequency(freqSetting)

            // set up necessary frequency values with sweeps and jumps
            // times are scaled to t0=0, tn=1, for now
            var fn = sets.sweep ? f0 * (1 + sets.sweep) : f0
            var t0 = 0
            var tn = 1

            // calculate ramp/jump values
            var t1 = tn * (sets.jumpAt1 || defs.jumpAt1)
            var t2 = tn * (sets.jumpAt2 || defs.jumpAt2)
            var j1 = sets.jumpBy1 || 0
            var j2 = sets.jumpBy2 || 0
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
            var repeat = sets.repeat || 0
            if (repeat > 100) repeat = 100
            var period = repeat ? 1 / repeat : duration
            if (period > duration) period = duration

            // init state for scheduling ramps and jumps
            var fq = inst.frequency
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

            // actual sound trigger
            inst.triggerAttackRelease(f0, holdTime)

        }


        // run through effect chain, getting and connecting necessary nodes
        // then set a timeout to disconnect them afterwards
        var chain = [inst]
        for (var i = 0; i < effectDefs.length; i++) {
            var effect = effectDefs[i]
            if (effect.isNeeded(sets, defs)) {
                var node = effectPools[i].getFor(duration)
                effect.apply(node, sets, defs, duration)
                chain[chain.length - 1].connect(node)
                chain.push(node)
            }
            effectPools[i].free()
        }
        chain[chain.length - 1].connect(outputNode)
        chain.push(outputNode)
        setTimeout(disconnectAudioChain, (duration + 0.2) * 1000, chain)
    }

}



/*
 *
 *      Miscellaneous helpers 
 * 
*/

function disconnectAudioChain(chain) {
    for (var j = 0; j < chain.length - 1; j++) {
        chain[j].disconnect(chain[j + 1])
    }
    chain.length = 0
}

function setVolume(volume, value, now, duration) {
    volume.value = value // seems to be sufficient now that we pool audio nodes
    // volume.cancelScheduledValues()
    // volume.value = -100
    // volume.rampTo(value, 0.001)
    // volume.setValueAtTime(value, now + duration)
    // volume.exponentialRampToValueAtTime(-100, now + duration + 0.1)
}

function setSoundEnvelope(instrument, a, d, s, r) {
    instrument.envelope.attack = a
    instrument.envelope.decay = d
    instrument.envelope.sustain = s
    instrument.envelope.release = r
}

function doJump(signal, value, time) {
    signal.setValueAtTime(value, time)
    return value
}

function doRamp(signal, value, time) {
    signal.exponentialRampToValueAtTime(value, time)
    return value
}

// https://github.com/Tonejs/Tone.js/blob/master/Tone/signal/TimelineSignal.js#L393
function fqInterpolate(t0, t1, v0, v1, t) {
    if (v0 < 0.001) v0 = 0.001
    return v0 * Math.pow(v1 / v0, (t - t0) / (t1 - t0))
}



