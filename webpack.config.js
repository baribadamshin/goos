'use strict';

const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const NODE_ENV = process.env.NODE_ENV || 'development';

module.exports = {
    entry: './src/js/goos',
    output: {
        path: __dirname + '/dist',
        filename: 'goos.min.js',
        library: 'goos'
    },

    watch: NODE_ENV === 'development',

    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query: {
                    presets: ['es2015'],
                    plugins: ['transform-object-assign']
                }
            }, {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        'css-loader',
                        'postcss-loader',
                    ],
                })
            }
        ]
    },

    plugins: [
        new ExtractTextPlugin('goos.min.css')
    ]
};

if (NODE_ENV === 'production') {
    module.exports.plugins.push(
        new webpack.optimize.UglifyJsPlugin({
            compress: {}
        })
    )
}
