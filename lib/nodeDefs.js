'use strict'


module.exports = function (Tone) {

    return {
        Synth: new Synth(),
        Noise: new Noise(),
        Panner: new Panner(),
        Vibrato: new Vibrato(),
        Tremolo: new Tremolo(),
        Lowpass: new Lowpass(),
        Highpass: new Highpass(),
        Bandpass: new Bandpass(),
        Compressor: new Compressor(),
        BitCrusher: new BitCrusher(),
    }


    /*
     * 
     *      Definition classes for each applicable node (instrument or effect)
     * 
    */


    function Synth() {
        this.create = function () {
            var v = new Tone.Synth()
            v.envelope.releaseCurve = 'linear'
            return v
        }
        this.dispose = function (node) { node.dispose() }
        this.isNeeded = null
        this.apply = null
    }

    function Noise() {
        this.create = function () {
            var v = new Tone.NoiseSynth()
            v.envelope.releaseCurve = 'linear'
            return v
        }
        this.dispose = function (node) { node.dispose() }
        this.isNeeded = null
        this.apply = null
    }


    function Panner() {
        this.create = function () { return new Tone.Panner3D() }
        this.dispose = function (node) { node.dispose() }
        this.isNeeded = function (sets, defs) { return (sets.soundX || sets.soundY || sets.soundZ) }
        this.apply = function (node, sets, defs, duration) {
            var x = (isNaN(sets.soundX)) ? defs.soundX : sets.soundX
            var y = (isNaN(sets.soundY)) ? defs.soundY : sets.soundY
            var z = (isNaN(sets.soundZ)) ? defs.soundZ : sets.soundZ
            // directly access the webaudio node to control ramp times
            // https://github.com/Tonejs/Tone.js/blob/master/Tone/component/Panner3D.js#L95
            var panner = node._panner
            if (panner.positionX) {
                panner.positionX.value = x
                panner.positionY.value = y
                panner.positionZ.value = z
            } else {
                // think this is a fallback for older webaudio implementations
                panner.setPosition(x, y, z)
            }
            node.rolloffFactor = isNaN(sets.rolloff) ? defs.rolloff : sets.rolloff 
        }
    }

    function Vibrato() {
        this.node = null
        this.create = function () { return new Tone.Vibrato(5, 1) }
        this.dispose = function (node) { node.dispose() }
        this.isNeeded = function (sets, defs) { return (sets.vibrato > 0) }
        this.apply = function (node, sets, defs, duration) {
            node.depth.value = sets.vibrato || defs.vibrato
            node.frequency.value = sets.vibratoFreq || defs.vibratoFreq
        }
    }

    function Tremolo() {
        this.node = null
        this.create = function () { return new Tone.Tremolo(5, 1).start() }
        this.dispose = function (node) { node.dispose() }
        this.isNeeded = function (sets, defs) { return (sets.tremolo > 0) }
        this.apply = function (node, sets, defs, duration) {
            node.depth.value = sets.tremolo || defs.tremolo
            node.frequency.value = sets.tremoloFreq || defs.tremoloFreq
        }
    }

    function Lowpass() {
        this.node = null
        this.create = function () { return new Tone.Filter(20000, 'lowpass') }
        this.dispose = function (node) { node.dispose() }
        this.isNeeded = function (sets, defs) {
            return (sets.lowpass < defs.lowpass || sets.lowpassSweep < 0)
        }
        this.apply = function (node, sets, defs, duration) {
            var freq = sets.lowpass || defs.lowpass
            var sweep = sets.lowpassSweep || defs.lowpassSweep
            node.frequency.value = freq
            if (sweep) node.frequency.rampTo(Math.max(10, freq + sweep), duration)
        }
    }

    function Highpass() {
        this.node = null
        this.create = function () { return new Tone.Filter(0, 'highpass') }
        this.dispose = function (node) { node.dispose() }
        this.isNeeded = function (sets, defs) {
            return (sets.highpass > defs.highpass || sets.highpassSweep > 0)
        }
        this.apply = function (node, sets, defs, duration) {
            var freq = sets.highpass || defs.highpass
            var sweep = sets.highpassSweep || defs.highpassSweep
            node.frequency.value = freq
            if (sweep) node.frequency.rampTo(Math.max(10, freq + sweep), duration)
        }
    }

    function Bandpass() {
        this.node = null
        this.create = function () { return new Tone.Filter(0, 'bandpass') }
        this.dispose = function (node) { node.dispose() }
        this.isNeeded = function (sets, defs) {
            return (sets.bandpassQ > defs.bandpassQ)
        }
        this.apply = function (node, sets, defs, duration) {
            var freq = sets.bandpass || defs.bandpass
            var q = sets.bandpassQ || defs.bandpassQ
            var sweep = sets.bandpassSweep || defs.bandpassSweep
            node.frequency.value = freq
            node.Q.value = q
            if (sweep) node.frequency.rampTo(Math.max(10, freq + sweep), duration)
        }
    }

    function BitCrusher() {
        this.node = null
        this.create = function () { return new Tone.BitCrusher(8) }
        this.dispose = function (node) { node.dispose() }
        this.isNeeded = function (sets, defs) { return (sets.bitcrush > 0) }
        this.apply = function (node, sets, defs, duration) {
            node.bits = sets.bitcrush || defs.bitcrush
        }
    }

    function Compressor() {
        this.node = null
        this.create = function () { return new Tone.Compressor() }
        this.dispose = function (node) { node.dispose() }
        this.isNeeded = function (sets, defs) { return (sets.compressorThreshold < 0) }
        this.apply = function (node, sets, defs, duration) {
            // node.ratio.value = sets.compressorRatio || defs.compressorRatio
            node.threshold.value = sets.compressorThreshold || defs.compressorThreshold
            // node.release.value = sets.compressorRelease || defs.compressorRelease
            // node.attack.value = sets.compressorAttack || defs.compressorAttack
            // node.knee.value = sets.compressorKnee || defs.compressorKnee
        }
    }

}

