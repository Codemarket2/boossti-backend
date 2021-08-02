module.exports = {
  mongodbMemoryServerOptions: {
    // instance: {
    //   dbName: 'vijaa-test',
    // },
    instance: {},
    binary: {
      version: '4.0.2', // Version of MongoDB
      skipMD5: true,
    },
    autoStart: false,
  },
};
