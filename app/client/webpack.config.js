const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: "./src/App.tsx",
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "/dist"),
        publicPath: '/',
    },
    devtool: "source-map",
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".json"]
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader"
            },
            {
                test: /\.js$/,
                enforce: "pre",
                loader: "source-map-loader"
            },
            {
                test: /\.scss$/,
                use: [{
                    loader: "style-loader"
                }, {
                    loader: "css-loader"
                }, {
                    loader: "sass-loader",
                }]
            }]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, 'public/index.html'),
        }),
    ],
    devServer: {
        historyApiFallback: true,
        publicPath: '/',
        watchContentBase: true,
        headers: {
            'Access-Control-Allow-Origin': '*'
        }
    }
};
