const path = require("path");
const webpack = require("webpack");
const bundlePath = path.resolve(__dirname, "public/");

console.log("__dirname:   "+__dirname)

module.exports = options => {
  return {
    entry: './src/index.js',
    output: {
      publicPath: bundlePath+"/",
      path: bundlePath+"/",
      filename: 'bundle.js'
    },
    module: {
      rules: [
      {
  			test: /\.jsx?$/,
  			loader: 'babel-loader',
  			exclude: /node_modules/,
        },
    		{
    	    test: /\.css$/,
    			loader:[ 'style-loader', 'css-loader' ]
        },
    		{
    			test: /\.(svg|png|jpg|gif)$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                useRelativePath:true
              }
            }
          ]
    		}
      ]
    },
    resolve: { 
      extensions: ['*', '.js', '.jsx'] 
    },
    devServer: {
      contentBase: path.join(__dirname,'public'),
      port: 4000,
      publicPath: "http://localhost:4000/dist/"
    },
  }
}