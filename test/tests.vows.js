/*
  Selenium Vows testing taken from
  https://github.com/jlipps/sauce-node-demo
 */
var vows = require('vows'),
  _ = require('underscore')._,
  RawTests = require('./selenium.vows'),
  nopt = require('nopt');

// load command line options
var args = nopt(null, null, process.argv, 2);

// define different service configurations
var allConfs = {
  'local': {
    processes: 4,
    maxTests: false,
    serviceName: 'local',
    caps: [
      // {browserName: "chrome", version: '', platform: "MAC", proxy: {proxyType: 'direct'}},
      {browserName: "firefox", version: '', platform: "MAC", proxy: {proxyType: 'direct'}}
    ]
  },
  'sauce': {
    host: "ondemand.saucelabs.com",
    port: 80,
    username: process.env.SAUCE_USERNAME,
    accessKey: process.env.SAUCE_ACCESS_KEY,
    processes: 1,
    maxTests: false,
    serviceName: 'sauce',
    caps: [
      // {browserName: "internet explorer", version: '8', platform: "XP", proxy: {proxyType: 'direct'}, 'selenium-version': '2.21.0'},
      // {browserName: "chrome", version: '', platform: "VISTA", proxy: {proxyType: 'direct'}},
      {browserName: "firefox", version: '14', platform: "Windows 2003", proxy: {proxyType: 'direct'}}
      // pre-prep mobile stuff
      // {browserName: "ipad", version: '', platform: "Mac 10.6", deviceOrientation: "landscape", proxy: {proxyType: 'direct'}}
      // {browserName: "android", version: '4', platform: "linux", deviceType: "tablet", proxy: {proxyType: 'direct'}}
    ]
  }
};

// load configurations we're using from command line option
var confs = {};
_.each(args, function(val, arg) {
  if (typeof allConfs[arg] !== 'undefined') {
    confs[arg] = allConfs[arg];
  }
});

// makeSuite takes a configuration and makes a batch of tests, splitting
// up tests according to 'conf.processes'
var makeSuite = function(conf) {

  var getCapText = function(conf, cap) {
    return " (" + cap.browserName+"_"+cap.version+"_"+cap.platform+"_"+conf.serviceName+")";
  };

  // gets a version of the testbase relativized to a particular config
  // and capability request
  var getTestsForCap = function(cap) {
    var capText = getCapText(conf, cap);
    var allTests = RawTests.allTests(conf, cap, capText);
    var capTests = {};
    // Replace the name of each test with a relativized name showing
    // which conf and caps we are using
    _.each(allTests, function(test, testName) {
      capTests[testName+capText] = test;
    });
    return capTests;
  };

  // Gather tests for all capabilities requests into one big dict
  var allTests = {};
  _.each(conf.caps, function(cap) {
    var tests = getTestsForCap(cap);
    _.each(tests, function(test, testName) {
      allTests[testName] = test;
    });
  });

  // Split tests into batches according to how parallelized we want to be
  var numTests = _.size(allTests);
  if (conf.maxTests && conf.maxTests < numTests) {
    numTests = conf.maxTests;
  }
  var numBatches = Math.ceil(numTests / conf.processes);

  if (numBatches >= 1) {
    var batches = {};
    var testsPerBatch = numBatches * conf.processes;
    var i = 0;
    var total = 0;
    _.each(allTests, function(test, testName) {
      if (!conf.maxTests || total < conf.maxTests) {
        if (typeof batches[i] === 'undefined') {
          batches[i] = {};
        }
        batches[i][testName] = test;
        if (i < numBatches - 1) {
          i++;
        } else {
          i = 0;
        }
        total++;
      }
    });
    _.each(batches, function(batch, index) {
      vows.describe(conf.serviceName + ": Batch " + index ).addBatch(batch).export(module);
    });
  }
};

// Register batches with vows for every conf we are using
_.each(confs, function(conf) {
  makeSuite(conf);
});
