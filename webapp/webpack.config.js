module.exports = options => {
  return {
    entry: './index.js',
    output: {
      filename: './bundle.js'
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
			test: /\.(jpe?g|png|gif|svg|ico)$/i,
			loader: 'file-loader'
		}
      ]
    }
  }
}