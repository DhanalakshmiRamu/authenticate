var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development';

var config = {
  development: {
    root: rootPath,
    app: {
      name: 'ZendynamixAuthentication'
    },
    port: 3110,
    db: 'mongodb://localhost/ZendynamixAuthentication-development',
    type:'development',

  }

};

module.exports = config[env];
