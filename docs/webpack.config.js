
var path = require('path')
var entryPath = path.resolve('.', 'demo.js')
var buildPath = path.resolve('.')
var buildFilename = 'bundle.js'


module.exports = (env) => ({

	mode: (() => {
		return (env && env.production) ?
			'production' : 'development'
	})(),

	entry: entryPath,

	output: {
		path: buildPath,
		filename: buildFilename,
	},

	watchOptions: {
		aggregateTimeout: 500,
		poll: 1000,
		ignored: ["node_modules"],
	},

	devServer: {
		contentBase: buildPath,
		inline: true,
		host: "0.0.0.0",
		stats: "minimal",
	},
})
