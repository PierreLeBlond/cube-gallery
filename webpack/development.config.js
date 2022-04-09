module.exports = {
  mode: 'development',

  // A full SourceMap is emitted as a separate file.
  // It adds a reference comment to the bundle so development tools know where
  // to find it. You should configure your server to disallow access to the
  // Source Map file for normal users!
  devtool: 'source-map',
  devServer: {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers':
          'X-Requested-With, content-type, Authorization'
    },
    // Set port to make public path work
    port: '8081',
    // Externally reachable
    host: '0.0.0.0'
  },
  publicPath: 'http://localhost:8081/'
};
