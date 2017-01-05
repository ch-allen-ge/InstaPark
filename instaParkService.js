var Service = require('node-windows').Service;

// Create a new service object
var svc = new Service({
  name: 'InstaPark',
  description: 'Use this web app to change parking spot statuses',
  script: 'C:/node-projects/InstaPark/server.js'
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install',function(){
  svc.start();
});

svc.install();