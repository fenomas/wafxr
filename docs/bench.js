'use strict'


var fx = require('..')
var presets = require('./presets')
window.fx = fx

var base = fx.getDefaults()
var settings = {}
var types = presets.types

var every = 0
var next = 0

setInterval(function () {
	if (!every) return
	if (performance.now() < next) return
	next = performance.now() + every
	for (var s in base) settings[s] = base[s]
	var i = Math.floor(Math.random() * types.length)
	presets.apply(settings, types[i])
	if (Math.random() > 0.5) {
		settings.soundX = 2 - 4 * Math.random()
		settings.rolloff = 0.5 + Math.random()
	}
	fx.play(settings)
}, 10)


var state = 0
var states = ['Paused', 'Slow', 'Fast']
var everies = [0, 1000, 50]
var but = document.querySelector('#but')
but.onclick = function () {
	state = (state + 1) % 3
	every = everies[state]
	but.textContent = states[state]
	next = 0
}

