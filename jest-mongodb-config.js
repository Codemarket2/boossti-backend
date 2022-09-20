module.exports = {
  mongodbMemoryServerOptions: {
    instance: {},
    binary: {
      version: 'latest', // Version of MongoDB
      skipMD5: true,
    },
    autoStart: false,
    replSet: {
      count: 3,
      storageEngine: 'wiredTiger',
    },
  },
};
