const path = require('path');
const webpack = require('webpack');

module.exports = env => {
    return {
        entry: {
            qrgenerator: ['core-js/stable', 'regenerator-runtime/runtime', './assets/js/qrgeneratorIndex.js'],
            uploadpage: ['core-js/stable', 'regenerator-runtime/runtime', "./assets/js/uploadpageIndex.js"]
        },
        output: {
            filename: '[name].min.js',
            path: path.resolve(__dirname, 'assets', 'js', 'dist')
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    include: [/materialize/, /assets/],
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ["@babel/preset-env"]
                        }
                    }
                }
            ]
        },
        plugins: [
            new webpack.ProvidePlugin({
                Component: 'exports-loader?Component!materialize-css/js/component.js'
            }),
            new webpack.DefinePlugin({
                BASE_URL: JSON.stringify(env.BASE_URL),
                PUBLIC_KEY: JSON.stringify(env.PUBLIC_KEY),
                UPLOAD_URL: JSON.stringify(env.UPLOAD_URL),
            }),
        ],
        // optimization: {
        //     splitChunks: {
        //         cacheGroups: {
        //             qrgenerator: {
        //                 test: /[\\/]node_modules[\\/]/,
        //                 name: 'qrgeneratorVendor',
        //                 chunks: 'all'
        //             }
        //         }
        //     }
        // },
        resolve: {
          fallback: {
            path: require.resolve("path-browserify"),
            crypto: require.resolve("crypto-browserify"),
            stream: require.resolve("stream-browserify")
          },
        }
    }
}