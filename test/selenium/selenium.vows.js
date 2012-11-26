/*jshint evil:true */
var assert = require('assert'),
		wd = require('wd');

var exports = module.exports = function RawTests() {};

exports.allTests = function(conf, cap, capText) {

	var site = 'http://localhost:9999',
		jquery = '/test/jquery.html';

	var setUp = function(url, cb, name) {
		var driver = wd.remote(conf.host, conf.port, conf.username, conf.accessKey);
		if (typeof name !== 'undefined') {
			name = name.replace(capText, '');
			cap.name = name;
		}
		driver.init(cap, function() {
			driver.setImplicitWaitTimeout(30, function() {
				driver.get(site + url, function() {
					cb(driver);
				});
			});
		});
	};

	function isActive(driver, elementId, cb){
		driver.hasElementByCssSelector('#'+ elementId + '.kinetic-active', function(err){
			cb(driver, err);
		});
	}

	function dragOverElement(driver, elementId, cb){
		driver.elementByIdOrNull(elementId, function(err, element){
			driver.moveTo(element, 300, 300, function(err){
				driver.buttonDown(function(){
					driver.moveTo(element, 10, 10, function(err){
						driver.buttonUp(function(err){

							driver.eval('$("#'+ elementId +'").data("kinetic-settings").velocity', function(err, velocity){
								cb(driver, err, velocity);
							});
							// driver.waitForConditionInBrowser('$("#wrapper").data("kinetic-settings").velocity === 0', 10000, function(err, stopped){
							//     console.log(arguments);
							// });
						});
					});
				});
			});
		});
	}

	var allTests = {

		'page has correct title': {
			topic: function() {
				var _this = this;
				setUp(jquery, function(driver) {
					driver.title(function(err, title) {
						driver.quit(function() {
							_this.callback(err, title);
						});
					});
				}, this.context.name);
			},
			'': function(err, title) {
				assert.equal(title, "jQuery.kinetic demos");
			}
		},

		'drag over image': {
			topic: function(){
				var _topic = this;
				setUp(jquery, function(driver){
					isActive(driver, 'wrapper', function(driver){
						dragOverElement(driver, 'wrapper', function(driver, err, velocity){
							driver.quit(function(err){
								_topic.callback(err, velocity);
							});
						});
					});
				});
			},
			'shows a velocity':function(velocity){
				assert.ok(velocity > 0);
			}
		},

		'drag over hardware accel image': {
			topic: function(){
				var _topic = this;
				setUp(jquery, function(driver){
					isActive(driver, 'wrapperHW', function(driver){
						dragOverElement(driver, 'wrapperHW', function(driver, err, velocity){
							driver.quit(function(err){
								_topic.callback(err, velocity);
							});
						});
					});
				});
			},
			'shows velocity':function(velocity){
				assert.notEqual(velocity, 0);
			}
		}





	};

	return allTests;
};
