/*global $,module,test,asyncTest,start,ok,equal,dragOver,hasEventAttached */
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
    ok($wrapper.data().kinetic.velocity, 'there is velocity');
});
test('we can detach kinetic', function(){
    var $wrapper = $('#wrapper').kinetic();
    var settings = $wrapper.data().kinetic.settings;

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
    ok($wrapper.data().kinetic.velocity, 'there is velocity');
});
test('we can prevent drag with filterTarget', function(){
    var $wrapper = $('#wrapper').kinetic({
            filterTarget: function(){ return false; }
        }),
        img = $wrapper.find('img')[0];

    dragOver($wrapper, img, [100,100], [10,10]);
    equal($wrapper.data().kinetic.velocity, 0, 'there should be no velocity');
});
test('we can listen for events', function(){
    var $wrapper = $('#wrapper').kinetic({
            moved: function(){ moved++; },
            stopped: function(){ stopped++; }
        }),
        img = $wrapper.find('img')[0],
        moved = 0,
        stopped = 0;

    dragOver($wrapper, img, [100,100], [10,10]);
    $wrapper.kinetic('stop');
    equal(moved, 2, 'moved event has fired');
    equal(stopped, 1, 'stopped event has fired');
});
test('scroll event triggered on scroll', function(){
    var $wrapper = $('#wrapper').scroll(function(){
            moved++;
        }),
        moved = 0,
        stopped = 0,
        scrollEvent = $.Event('scroll');

    $wrapper.trigger(scrollEvent);
    ok(moved, 'scroll triggered move event');

});
test('moved triggered on scroll (touch)', function(){
    var $wrapper = $('#wrapper').kinetic({
            moved: function(){
                moved++;
            },
            stopped: function(){ stopped++; }
        }),
        moved = 0,
        stopped = 0,
        scrollEvent = $.Event('scroll');

    $wrapper.trigger(scrollEvent);
    ok(moved, 'scroll triggered move event');

});
test('we can customise the mouse cursor', function(){
    var $wrapper = $('#wrapper').kinetic({
            cursor: 'pointer'
        });

    equal($wrapper.css('cursor'), 'pointer');

});
test('we can limit the velocity with maxvelocity', function(){
    var $wrapper = $('#wrapper').kinetic({
          maxvelocity: 10,
          moved: function(){
            maxVelocity = this.velocity > maxVelocity ? this.velocity : maxVelocity;
          }
        }),
        img = $wrapper.find('img')[0],
        maxVelocity = 0;
    dragOver($wrapper, img, [200,200], [10,10]);
    equal(maxVelocity < 10, true);
});
test('we can bind kinetic twice to the same element', function(){
    var $wrapper = $('#wrapper').kinetic({
            moved: function(settings){
                count+=1;
            }
        }),
        img = $wrapper.find('img')[0],
        count = 0;

    // bind again should be ignored
    $wrapper.kinetic({
        moved: function(){
            count+=1;
        }
    });
    dragOver($wrapper, img, [200,200], [10,10]);
    equal(count, 2);
});
test('we can use our own call method', 3, function(){

  $.Kinetic.prototype.do = function(options){
    equal(this instanceof $.Kinetic, true);
    equal(this.velocity, 0);
    equal(options.what, 'something');
  };
  var $wrapper = $('#wrapper').kinetic();
  $wrapper.kinetic('do', { what: 'something' });

});


