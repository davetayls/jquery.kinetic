/*
  Selenium Vows testing taken from
  https://github.com/jlipps/sauce-node-demo
 */
var vows = require('vows'),
    _ = require('underscore')._,
    makeSuite = require('./makeSuite.js').makeSuite;

var conf = {
      host: "ondemand.saucelabs.com",
      port: 80,
      username: process.env.SAUCE_USERNAME,
      accessKey: process.env.SAUCE_ACCESS_KEY,
      processes: 2,
      maxTests: false,
      serviceName: 'sauce',
      caps: [
        // pre-prep mobile stuff
        // {browserName: "ipad", version: '5.1', platform: "Mac 10.8", deviceOrientation: "landscape", proxy: {proxyType: 'direct'}},
        // {browserName: "android", version: '4', platform: "linux", deviceType: "tablet", proxy: {proxyType: 'direct'}}

        // Standard browsers
        // {browserName: "internet explorer", version: '9', platform: "Windows 2008", proxy: {proxyType: 'direct'}}
        // {browserName: "chrome", version: '', platform: "VISTA", proxy: {proxyType: 'direct'}},
        {browserName: "firefox", version: '17', platform: "Windows 2012", proxy: {proxyType: 'direct'}}
      ]
    },
    batches = makeSuite(conf);

_.each(batches, function(batch, index) {
  vows.describe(conf.serviceName + ": Batch " + index )
    .addBatch(batch)
    .export(module);
});

