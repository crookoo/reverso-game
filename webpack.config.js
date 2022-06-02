const path = require("path")
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const WebpackPwaManifest = require('webpack-pwa-manifest')

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
        publicPath: "",
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
        new WebpackPwaManifest({
            name: 'Reverso Game',
            short_name: 'Reverso',
            description: 'A strategic game inspired by the famous board game.',
            background_color: '#FFFFFF',
            theme_color: '#cc2000',
            lang: 'en',
            filename: './icons/manifest.json',
            icons: [
              {
                src: path.resolve(__dirname, 'src/favicon.png'),
                sizes: [96, 128, 192, 256, 384, 512], // multiple sizes
                destination: 'icons',
              }
            ],
          })
    ]
}
