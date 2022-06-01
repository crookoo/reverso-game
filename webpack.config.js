const path = require("path")
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    devServer: {
        port: 5000,
    },
    entry: './src/script.js',
    module: {
        rules: [
            { test: /\.s?css$/, use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'] },
            { test: /\.(png|jpe?g|gif)$/i, type: 'asset/resource' }
        ],
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'script.js',
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Reverso Game',
            template: './src/index.html',
            inject: 'body',
            favicon: './src/favicon.png',
        }),
        new MiniCssExtractPlugin({
            filename: 'styles.css'
        }),
    ]
}
