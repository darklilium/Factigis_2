var webpack = require("webpack");
var path = require('path');

module.exports = {
    entry: {
        //put ur bundle files here.
        login: './static/js/bundles/login.js',
        factigisDashboard: './static/js/bundles/factigisDashboard.js',
        factigisFrontoffice: './static/js/bundles/factigisFrontoffice.js',
        factigisCarta: './static/js/bundles/factigisCarta.js',
        vendor: [
        // put your third party libs here
        ]
    },
    output: {
        path: path.join(path.join(__dirname, 'dist'), 'js'),
        filename: '[name].js',
        libraryTarget: "amd"
    },
    resolve: {
        extensions: ['', '.webpack.js', '.web.js', '.js', '.jsx']
    },
    module: {
        loaders: [
            // ES2015 files
            {
              test: /\.(js|jsx)$/,
              loader: 'babel',
              query: {
                presets: ['react', 'es2015', 'stage-2']
              }
            },
            // css
            {
                test: /\.css$/,
                loader: "style-loader!css-loader"
            }
        ]
    },
    externals: [
        function(context, request, callback) {
            if (/^dojo/.test(request) ||
                /^dojox/.test(request) ||
                /^dijit/.test(request) ||
                /^esri/.test(request)
            ) {
                return callback(null, "amd " + request);
            }
            callback();
        }
    ],
    devServer: {
      inline: true,
      port: 443,
      host: "127.0.0.1"
    },
    devtool: 'source-map'
};
