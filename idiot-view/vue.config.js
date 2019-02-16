module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? '/idiot/_design/idiot-view/'
    : '/',
  devServer: {
    proxy: "http://localhost:5984"
  }
};
