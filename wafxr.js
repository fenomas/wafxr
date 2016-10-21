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
    highpass: 0,
    highpassSweep: 0,
}




/*
 *  
 *   Main module
 *  
*/

function FX() {

    // input/effect chain - so we can not add effects until they're used
    var inputNode = new Tone.Gain(1).toMaster()
    var effects = [
        null,
        new VibratoEffect(),
        new TremoloEffect(),
        new LowpassEffect(),
        new HighpassEffect(),
        new BitCrusherEffect(),
    ]
    var nodeChain = [inputNode, null, null, null, null, null, Tone.Master]
    var effectLastUsed = [0, 0, 0, 0, 0, 0]

    // create instrument pools and getters - separate for synth/noise
    var synths = []
    var noises = []
    function setInstrumentCount(count, noisetype) {
        var arr = noisetype ? noises : synths
        var ctor = noisetype ? Tone.NoiseSynth : Tone.Synth
        while (arr.length > count) {
            var rem = arr.pop()
            rem.disconnect(inputNode)
            rem.dispose()
        }
        while (arr.length < count) {
            var inst = new ctor()
            inst.envelope.releaseCurve = 'linear'
            inst.connect(inputNode)
            arr.push(inst)
        }
    }
    setInstrumentCount(3, false)
    setInstrumentCount(2, true)

    var getSynth = makeObjectPoolGetter(synths)
    var getNoise = makeObjectPoolGetter(noises)

    // window.Tone = Tone
    // window.synth = synths[0]
    // window.noise = noises[0]
    // window.chain = nodeChain



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


    this.setInstrumentCounts = function (synthCount, noiseCount) {
        synthCount = isNaN(synthCount) ? 3 : synthCount
        noiseCount = isNaN(noiseCount) ? 2 : noiseCount
        setInstrumentCount(synthCount, false)
        setInstrumentCount(noiseCount, true)
    }


    this.play = function (settings) {
        var s = settings || {}

        var attack = isNaN(s.attack) ? defaults.attack : s.attack
        var decay = isNaN(s.decay) ? defaults.decay : s.decay
        var sustain = isNaN(s.sustain) ? defaults.sustain : s.sustain
        var release = isNaN(s.release) ? defaults.release : s.release
        var sustainLevel = isNaN(s.sustainLevel) ? defaults.sustainLevel : s.sustainLevel

        var holdTime = sustain + attack + decay
        var duration = holdTime + release
        var now = Tone.now()

        // run through effect chain, setting properties and adding/removing nodes
        for (var i = 1; i < effects.length; i++) {
            var effect = effects[i]
            var needed = effect.isNeeded(s)
            if (!effect.node) {
                if (!needed) continue
                effect.node = effect.create()
                insertEffectNode(nodeChain, effect.node, i)
            }
            if (effect.node) {
                effect.apply(effect.node, s, duration)
                if (needed) effectLastUsed[i] = now + duration
            }
            if (effect.node.wet) effect.node.wet.value = (needed) ? 1 : 0
            // remove nodes from chain if not needed lately
            if (effect.node && effectLastUsed[i] < now - 3) {
                removeEffectNode(nodeChain, i)
                effect.node = null
            }
        }

        // Trigger instruments and schedule frequency changes
        var source = s.source || defaults.source
        if (/noise/.test(source)) {

            var noise = getNoise()
            noise.volume.value = s.volume || 0
            noise.noise.type = source.split(' ')[0]
            noise.envelope.attack = attack
            noise.envelope.decay = decay
            noise.envelope.sustain = sustainLevel
            noise.envelope.release = release

            noise.triggerAttackRelease(holdTime)

        } else {

            var synth = getSynth()
            synth.volume.value = s.volume || 0
            var isPulse = (source == 'pulse')
            if (!isPulse && s.harmonics > 0) source += s.harmonics
            synth.oscillator.type = source
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
 *      Abstracted classes for each applicable effect
 * 
*/

function VibratoEffect() {
    this.node = null
    this.create = function () { return new Tone.Vibrato(5, 1) }
    this.isNeeded = function (settings) { return (settings.vibrato > 0) }
    this.apply = function (node, settings, duration) {
        node.depth.value = settings.vibrato || defaults.vibrato
        node.frequency.value = settings.vibratoFreq || defaults.vibratoFreq
    }
}

function TremoloEffect() {
    this.node = null
    this.create = function () { return new Tone.Tremolo(5, 1).start() }
    this.isNeeded = function (settings) { return (settings.tremolo > 0) }
    this.apply = function (node, settings, duration) {
        node.depth.value = settings.tremolo || defaults.tremolo
        node.frequency.value = settings.tremoloFreq || defaults.tremoloFreq
    }
}

function LowpassEffect() {
    this.node = null
    this.create = function () { return new Tone.Filter(20000, 'lowpass') }
    this.isNeeded = function (settings) {
        return (settings.lowpass < defaults.lowpass || settings.lowpassSweep < 0)
    }
    this.apply = function (node, settings, duration) {
        var freq = settings.lowpass || defaults.lowpass
        var sweep = settings.lowpassSweep || defaults.lowpassSweep
        node.frequency.value = freq
        if (sweep) node.frequency.rampTo(freq + sweep, duration)
    }
}

function HighpassEffect() {
    this.node = null
    this.create = function () { return new Tone.Filter(0, 'highpass') }
    this.isNeeded = function (settings) {
        return (settings.highpass > 0 || settings.highpassSweep > 0)
    }
    this.apply = function (node, settings, duration) {
        var freq = settings.highpass || defaults.highpass
        var sweep = settings.highpassSweep || defaults.highpassSweep
        node.frequency.value = freq
        if (sweep) node.frequency.rampTo(freq + sweep, duration)
    }
}

function BitCrusherEffect() {
    this.node = null
    this.create = function () { return new Tone.BitCrusher(8) }
    this.isNeeded = function (settings) { return (settings.bitcrush > 0) }
    this.apply = function (node, settings, duration) {
        node.bits = settings.bitcrush || defaults.bitcrush
    }
}





// helpers for handling connections in the effect chain

function insertEffectNode(chain, node, index) {
    if (chain[index]) throw 'Tried to add existing effect to chain'
    var prev = index, next = index
    while (!chain[prev]) prev--
    while (!chain[next]) next++
    chain[prev].disconnect(chain[next])
    chain[prev].chain(node, chain[next])
    chain[index] = node
}

function removeEffectNode(chain, index) {
    var node = chain[index]
    if (!node) throw 'Tried to remove nonexistent effect from chain'
    var prev = index - 1, next = index + 1
    while (!chain[prev]) prev--
    while (!chain[next]) next++
    chain[prev].disconnect(node)
    node.disconnect(chain[next])
    chain[prev].connect(chain[next])
    node.dispose()
    chain[index] = null
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

// https://github.com/Tonejs/Tone.js/blob/master/Tone/signal/TimelineSignal.js#L393
function fqInterpolate(t0, t1, v0, v1, t) {
    if (v0 < 0.001) v0 = 0.001
    return v0 * Math.pow(v1 / v0, (t - t0) / (t1 - t0))
}

function makeObjectPoolGetter(arr) {
    var i = 0
    return function () { return arr[i++ % arr.length] }
}


