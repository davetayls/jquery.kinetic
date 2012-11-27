/*global module,test,ok,equal,dragOver,hasEventAttached */
var $fixture = $('#qunit-fixture'),
    html = $('#tmpl').text();

module('simple image', {
    setup: function(){
        $fixture.append(html);
    }
});
test('we can initialise kinetic', function(){
    var $wrapper = $('#wrapper').kinetic();
    ok($wrapper.hasClass('kinetic-active'), 'has active class');
});
test('drag the contents and see velocity', function(){
    var $wrapper = $('#wrapper').kinetic(),
        img = $wrapper.find('img')[0];
    dragOver($wrapper, img, [100,100], [10,10]);
    ok($wrapper.data('kinetic-settings').velocity, 'there is velocity');
});
test('we can detach kinetic', function(){
    var $wrapper = $('#wrapper').kinetic();
    var settings = $wrapper.data('kinetic-settings');
    $wrapper.kinetic('detach');
    equal($wrapper.hasClass('kinetic-active'), false, 'no active class');
    equal(hasEventAttached($wrapper, settings.events.inputDown), false, 'inputDown not attached');
    equal(hasEventAttached($wrapper, settings.events.inputEnd), false, 'inputEnd not attached');
    equal(hasEventAttached($wrapper, settings.events.inputMove), false, 'inputMove not attached');
    equal(hasEventAttached($wrapper, settings.events.inputClick), false, 'inputClick not attached');
    equal(hasEventAttached($wrapper, settings.events.dragStart), false, 'dragStart not attached');
    equal(hasEventAttached($wrapper, settings.events.touchStart), false, 'touchStart not attached');
    equal(hasEventAttached($wrapper, settings.events.touchMove), false, 'touchMove not attached');
});
test('we can trigger hardware acceleration', function(){
    var $wrapper = $('#wrapper').kinetic({
            triggerHardware: true
        }),
        img = $wrapper.find('img')[0];

    ok($wrapper.css('-webkit-transform'), 'includes transform');
    dragOver($wrapper, img, [100,100], [10,10]);
    ok($wrapper.data('kinetic-settings').velocity, 'there is velocity');
});
test('we can prevent drag with filterTarget', function(){
    var $wrapper = $('#wrapper').kinetic({
            filterTarget: function(){ return false; }
        }),
        img = $wrapper.find('img')[0];

    dragOver($wrapper, img, [100,100], [10,10]);
    equal($wrapper.data('kinetic-settings').velocity, 0, 'there should be no velocity');
});
test('we can listen for events', function(){
    var $wrapper = $('#wrapper').kinetic({
            moved: function(){ moved = true; },
            stopped: function(){ stopped = true; }
        }),
        img = $wrapper.find('img')[0],
        moved, stopped;

    dragOver($wrapper, img, [100,100], [10,10]);
    $wrapper.kinetic('stop');
    ok(moved, 'moved event has fired');
    ok(stopped, 'stopped event has fired');
});


