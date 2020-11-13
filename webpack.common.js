const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: './assets/js/index.js',
    output: {
        filename: '[name].min.js',
        path: path.resolve(__dirname, 'assets', 'js', 'dist')
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                include: [/materialize/, /assets/],
                use: 'babel-loader'
            }
        ]
    },
    plugins: [
        new webpack.ProvidePlugin({
            Component: 'exports-loader?Component!materialize-css/js/component.js'
        })
    ],
    optimization: {
        splitChunks: {
            cacheGroups: {
                commons: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    chunks: 'all'
                }
            }
        }
    }
}