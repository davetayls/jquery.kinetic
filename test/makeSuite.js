var vows = require('vows'),
  _ = require('underscore')._,
  RawTests = require('./selenium.vows');

// makeSuite takes a configuration and makes a batch of tests, splitting
// up tests according to 'conf.processes'
exports.makeSuite = function(conf) {

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
    return batches;
  }
};

