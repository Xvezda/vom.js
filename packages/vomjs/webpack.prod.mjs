import { merge } from 'webpack-merge';
import webpack from 'webpack';
import common from './webpack.common.mjs';


export default merge(common, {
  mode: 'production',
  devtool: 'source-map',
  plugins: [
    new webpack.EnvironmentPlugin({
      'NODE_ENV': 'production',
    }),
  ],
});
