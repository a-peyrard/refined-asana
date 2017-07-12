'use strict';
const path = require('path');
const webpack = require('webpack');
const { CheckerPlugin } = require('awesome-typescript-loader')

module.exports = {
	entry: {
		content: './src/content.ts',
		background: './src/background.ts',
		options: './src/options.ts'
	},
	output: {
		path: path.resolve(__dirname, 'extension'),
		filename: '[name].js',
		libraryTarget: 'umd',
		library: 'MyLib',
		umdNamedDefine: true
	},
	resolve: {
		extensions: ['.ts', '.js']
	},
	plugins: [
      	new CheckerPlugin(),
		new webpack.optimize.ModuleConcatenationPlugin()
	],
	module: {
		rules: [
			{
				test: /\.ts$/,
				exclude: /node_modules/,
				use: {
					loader: 'awesome-typescript-loader'
				}
			},
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader'
				}
			}
		]
	},
	externals: {
        "jquery": "jQuery"
    }
};
