'use strict'


module.exports = {
    types: ['jump', 'coin', 'expl', 'laser', 'ouch', 'power', 'ui'],
    apply: applyPreset
}


/*
 *
 *          PRESETS 
 * 
 */ 

function rand(a, b) { return a + (Math.random() * (b - a)) }
function rint(a, b) { return Math.floor(rand(a, b)) }
function rarr(arr) { return arr[rint(0, arr.length)] }
function rlog(a, b) { return Math.pow(2, rand(Math.log2(a), Math.log2(b))) }


// loosely based on https://github.com/ttencate/jfxr/blob/master/src/presets.js

function applyPreset(settings, type) {

    if (type == 'jump') {
        settings.source = rarr(['sine', 'square', 'triangle'])
        settings.sustain = rand(0.05, 0.1)
        settings.release = rand(0.1, 0.4)
        settings.frequency = rlog(120, 1600)
        settings.sweep = rand(0.1, 1)
        settings.jumpAt1 = rand(0.1, 0.25)
        settings.jumpBy1 = rand(0.125, 0.5)
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
        settings.sustain = rand(0.05, 0.3)
        settings.release = rand(0.3, 0.5)
        settings.bandpass = rlog(200, 4000)
        settings.bandpassSweep = rand(-500, -settings.bandpass)
        settings.bandpassQ = rand(0.2, 2)
        settings.compressorThreshold = rand(-40, -30)
        if (rint(0, 2)) {
            settings.tremolo = rand(0.1, 0.7)
            settings.tremoloFreq = rlog(5, 60)
        }
        if (rint(0, 2)) {
            settings.bitcrush = rint(3,8)
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
        settings.compressorThreshold = rand(-40, -30)
        if (/noise/.test(settings.source)) {
            settings.bandpass = rlog(500, 1000)
            settings.bandpassSweep = rand(-settings.bandpass, -settings.bandpass / 8)
            settings.bandpassQ = rand(0.5, 4)
        } else {
            settings.frequency = rlog(400, 1400)
            settings.sweep = rand(-0.5, -0.05)
        }
        if (rint(0, 2)) {
            settings.lowpass = rand(1000, 8000)
            settings.lowpassSweep = rand(-settings.lowpass, 4000)
        }
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



