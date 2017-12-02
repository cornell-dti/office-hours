const ExtractTextPlugin       = require("extract-text-webpack-plugin");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const webpack                 = require("webpack");

module.exports = {
    entry: "./src/index.tsx",
    output: {
        filename: "bundle.js",
        path: __dirname + "/dist"
    },

    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".ts", ".tsx", ".js", ".json"]
    },

    module: {
        rules: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
            {
                test: /\.tsx?$/,
                loader: "awesome-typescript-loader"
            },

            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            {
                enforce: "pre",
                test: /\.js$/,
                loader: "source-map-loader"
            },
            // CSS
            {
                test:   /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use:      "css-loader"
                })
            },
            // LESS
            {
                test: /\.less$/,
                use: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use:      ["css-loader", "less-loader"]
                })
            },
            // Fonts
            {
                test: /\.(woff|woff2|eot|ttf)$/,
                loader: "url-loader?limit=100000"
            },
            // Media
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                use: [
                    "file-loader?limit=100000",
                    "img-loader"
                ]
            }
        ]
    },

    // When importing a module whose path matches one of the following, just
    // assume a corresponding global variable exists and use that instead.
    // This is important because it allows us to avoid bundling all of our
    // dependencies, which allows browsers to cache those libraries between builds.
    externals: {
        "react": "React",
        "react-dom": "ReactDOM"
    },

    plugins: [
        new ExtractTextPlugin("styles.css"),
        new OptimizeCssAssetsPlugin({
            cssProcessorOptions: { discardComments: { removeAll: true } }
        }),
        new webpack.optimize.UglifyJsPlugin({
            minimize: true,
            sourceMap: true
        })
    ]
};
