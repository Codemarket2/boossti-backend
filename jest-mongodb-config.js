module.exports = {
  mongodbMemoryServerOptions: {
    instance: {},
    binary: {
      version: '4.4.5', // Version of MongoDB
      skipMD5: true,
    },
    autoStart: false,
    // replSet: {
    //   count: 4,
    //   storageEngine: 'wiredTiger',
    // },
  },
};
