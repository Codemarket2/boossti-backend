module.exports = {
  mongodbMemoryServerOptions: {
    instance: {
      dbName: 'vijaa-test',
    },
    binary: {
      version: '4.0.2', // Version of MongoDB
      skipMD5: true,
    },
    autoStart: false,
  },
};
