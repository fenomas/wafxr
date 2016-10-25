/* globals process */


var config = {
	entry: {
		bundle: './docs/demo.js',
		bench_bundle: './docs/bench.js'
	},
	output: {
        path: __dirname + "/docs",
		filename: "[name].js"
	},
	devServer: {
		contentBase: 'docs/', // make sure static assets aren't found unless copied over
		inline: true,
	},
}

module.exports = config


