/* globals process */


var config = {
	entry: {
		index: './demo.js'
	},
	output: {
        path: __dirname + "/docs",
		filename: 'bundle.js',
	},
	devServer: {
		contentBase: 'docs/', // make sure static assets aren't found unless copied over
		inline: true,
	},
}

module.exports = config


