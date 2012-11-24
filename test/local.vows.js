/*
  Selenium Vows testing taken from
  https://github.com/jlipps/sauce-node-demo
 */
var vows = require('vows'),
    _ = require('underscore')._,
    makeSuite = require('./makeSuite.js').makeSuite;

// define different service configurations

var conf = {
      processes: 4,
      maxTests: false,
      serviceName: 'local',
      caps: [
        // {browserName: "chrome", version: '', platform: "MAC", proxy: {proxyType: 'direct'}},
        {browserName: "firefox", version: '', platform: "MAC", proxy: {proxyType: 'direct'}}
      ]
    },
    batches = makeSuite(conf);

_.each(batches, function(batch, index) {
  vows.describe(conf.serviceName + ": Batch " + index )
    .addBatch(batch)
    .export(module);
});

