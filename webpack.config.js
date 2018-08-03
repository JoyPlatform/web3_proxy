const path = require('path');
const webpack = require('webpack');

const plugins = [
    new webpack.NormalModuleReplacementPlugin(/^any-promise$/, 'bluebird'),
    new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('development')
    })
];

module.exports = {
    entry: [
        "babel-polyfill",
        './src/index.js'
    ],
    target: 'node',
    plugins:plugins,
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.js',
        publicPath: 'dist/'
    },
    module: {
        // noParse: [/node_modules\/websocket/, /node_modules\/ws/],
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'eslint-loader',
                        options: {
                            failOnWarning: true,
                            failOnError: true
                        }
                    }
                ],
                enforce: "pre"
            },
            {
                use: 'babel-loader',
                exclude: /node_modules/,
                test: /\.js$/
            }
        ]
    },
    resolve: {
        modules: [
            path.join(__dirname, "src"),
            "node_modules"
        ],
        alias: {
            'scrypt.js': path.resolve(__dirname, './node_modules/scrypt.js/js.js'),
            core: path.resolve(__dirname, 'src/core'),
            common: path.resolve(__dirname, 'src/common'),
            configs: path.resolve(__dirname, 'src/configs'),
            messagesHandlers: path.resolve(__dirname, 'src/messagesHandlers'),
            components: path.resolve(__dirname, 'src/components'),
            communicationServices: path.resolve(__dirname, 'src/communicationServices'),
            constants: path.resolve(__dirname, 'src/constants')
            // 'fs': path.resolve(__dirname, './fs-fake.js'),
            // 'utf-8-validate': path.resolve(__dirname, './node_modules/ws/lib/Validation.js'),
            // 'bufferutil': path.resolve(__dirname, './node_modules/ws/lib/BufferUtil.js'),
            // '../build/default/bufferutil': path.resolve(__dirname, './node_modules/ws/lib/BufferUtil.js'),
            // '../build/Release/bufferutil': path.resolve(__dirname, './node_modules/ws/lib/BufferUtil.js'),
            // '../build/default/validation': path.resolve(__dirname, './node_modules/websocket/lib/Validation.js'),
            // '../build/Release/validation': path.resolve(__dirname, './node_modules/websocket/lib/Validation.js'),
        },
        extensions: ['.js', '.jsx', '.json'],
        enforceExtension: false,
        enforceModuleExtension: false
    }
}