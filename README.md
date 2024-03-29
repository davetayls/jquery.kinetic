jQuery.kinetic
==============
Dave Taylor <http://davetayls.me>
The MIT License (MIT)

> This code has been pretty stable for a while (with it's few restrictions) and so am not actively making changes. If you want to improve it in any way feel free to submit a pull request (with tests) and we will merge in any that make sense and don't add bloat to what is a simple plugin.

Master: [![Build Status](https://secure.travis-ci.org/davetayls/jquery.kinetic.png?branch=master)](http://travis-ci.org/davetayls/jquery.kinetic)

All branches: [![Build Status](https://secure.travis-ci.org/davetayls/jquery.kinetic.png)](http://travis-ci.org/davetayls/jquery.kinetic)

jQuery.kinetic is a simple plugin which adds smooth drag scrolling with
gradual deceleration to containers.

NB. [@dzek69](https://github.com/dzek69) has created a version of this plugin without the dependency on jQuery: <https://github.com/dzek69/vanilla.kinetic>

<iframe src="https://davetayls.me/jquery.kinetic/demo.html" width="100%" height="600" scrolling="no" frameborder="0"></iframe>

## Installation

### Bower

	$ bower install jquery.kinetic --save

### npm

	$ npm install jquery.kinetic
	
### CDN

	<script src="https://cdn.jsdelivr.net/npm/jquery.kinetic/jquery.kinetic.js"></script>

### Script tag

You can add the script to the page.

	<script src="jquery.kinetic.js"></script>

## Major new release 2.0 has BREAKING CHANGES

See release history below for details.

## Compatibility

This plugin works with [jQuery](http://jquery.com) and
[Zepto](http://zeptojs.com/)

### Browsers ###

- ie: 7,8,9
- firefox: 3.6,4,5
- chrome: 13
- safari: 5
- iOS Safari: 4

## Demos
Take a look at a demo on <http://davetayls.me/jquery.kinetic>.

Filtering Clickable elements
---

If you need to allow events to be passed through the wrapper. For example to allow clicking on a link or an input then you can use `filterTarget` like so.

```javascript
$('#wrapper').kinetic({
    filterTarget: function(target, e){
        if (!/down|start/.test(e.type)){
            return !(/area|a|input/i.test(target.tagName));
        }
    }
});
```

## Options

    cursor          {string}    default: move   Specify the cursor to use on the wrapper
    slowdown        {number}    default: 0.9    This option affects the speed at which the scroll slows
    threshold       {number|function(target, e)}    default: 0   This is the number of pixels the mouse needs to move before the element starts scrolling
    x               {string}    default: true   Toggles movement along the x axis
    y               {string}    default: true   Toggles movement along the y axis
    maxvelocity     {number}    default: 40     This option puts a cap on speed at which the container
                                                can scroll
    throttleFPS     {number}    default: 60     This adds throttling to the mouse move events to boost
                                                performance when scrolling
    triggerHardware {boolean} false             This adds css to the wrapper which
                                                will trigger iOS to use hardware acceleration
    invert          {boolean}   default: false  Invert movement direction

    filterTarget    {function(target)}          Return false from this function to
                                                prevent capturing the scroll

    movingClass     {object}
        up:         {string}    default: 'kinetic-moving-up'
        down:       {string}    default: 'kinetic-moving-down'
        left:       {string}    default: 'kinetic-moving-left'
        right:      {string}    default: 'kinetic-moving-right'

    deceleratingClass {object}
        up:         {string}    default: 'kinetic-decelerating-up'
        down:       {string}    default: 'kinetic-decelerating-down'
        left:       {string}    default: 'kinetic-decelerating-left'
        right:      {string}    default: 'kinetic-decelerating-right'

    Listeners:  All listeners are called with:
                - this = the instance of the Kinetic class

    moved       {function()}           A function which is called on every move
    stopped     {function()}           A function which is called once all
                                               movement has stopped
    selectStart {function()}           A function which is called on user try to drag (select text),
                                               return false to prevent selection when dragging

    Methods:    You can call methods by running the kinetic plugin
                on an element which has already been activated.

                eg  $('#wrapper').kinetic(); // activate
                    $('#wrapper').kinetic('methodname', options);

    start       Start movement in the scroll container at a particular velocity.
                This velocity will not slow until the end method is called.

                The following line scrolls the container left.
                $('#wrapper#).kinetic('start', { velocity: -30 });

                The following line scrolls the container right.
                $('#wrapper#).kinetic('start', { velocity: 30 });

                The following line scrolls the container diagonally.
                $('#wrapper#).kinetic('start', { velocity: -30, velocityY: -10 });

    end         Begin slowdown of any scrolling velocity in the container.
                $('#wrapper#).kinetic('end');

    stop        Stop the scrolling immediately

    detach      Detach listeners and functionality from the wrapper

    attach      Re-attach listeners and functionality previously detached using
                the detach method

Add your own methods
--------------------

There are some example methods in the `extra-methods` folder. You can also add your own.

	$.Kinetic.prototype.do = function(options){
	  // this -> instance of Kinetic
	  // this.settings -> get current settings
	  // options -> options passed in from call
	};
	
	// use the method
	$('#elem').kinetic('do', { options });

Hack the core
-------------

You can now hook in to the core functionality to make changes.

    var _start = $.Kinetic.prototype.start;
    $.Kinetic.prototype.start = function(options){
   	  // -> do something
   	  _start.apply(this, arguments);
    };


Running the tests
-------

The test suite uses grunt's server and qunit functionality. The tests are being built up
but currently cover the core functionality. This runs all qUnit Html specs in the
`/test/specs` folder.

- grunt `npm install -g grunt`
- install devDependencies `npm install` from the root of the source

Then run from the root of the source

    $ grunt

### Manual tests

There are manual tests as html files within the `/test` folder.

Releasing a new version
-----------------------

Releasing a small fix or change. The following will update the patch version
number.

    $ grunt release
    
Releasing a potentially breaking feature. The following will update the minor
version number.

    $ grunt release:minor

Changes
-------
### 2.2.2
 - Added main property to package.json (@michaelsouellette) https://github.com/davetayls/jquery.kinetic/pull/105

### 2.2.1
 - Added `selectStart` option and allow selection when `_useTarget` returns false (@tsaikd) https://github.com/davetayls/jquery.kinetic/pull/84
 - Added `invert` option (@tsaikd) https://github.com/davetayls/jquery.kinetic/pull/84
 
### 2.1.0
 - Added `threshold` option (@UziTech) https://github.com/davetayls/jquery.kinetic/pull/84
 
### 2.0.6
 - Fix touch and mouse bindings so that an external pointing device can be used with a touchscreen device.

### 2.0.5
 - Fix detach scroll event for touch devices (@Jaemu)

### 2.0.4
 - Fix the useTarget call to include the event as per the example in the readme for ignoring scroll events. (@mooreOn)

### 2.0.3
 - only prevent drag and drop if element is usable target (@andrew-pause)

### 2.0.1

 - changes to allow attaching to `<body>` with `$('body').kinetic()` #61

### 2.0

After several years, this plugin has had a major refactor. Big thanks to (@skovhus) for helping with this rewrite. Here's what has happened.

- rewrite of plugin to an OO plugin
- **BREAKING CHANGES**
  - call methods are now attached to the `$.Kinetic.prototype` and have
    slightly different arguments (see docs above)
  - no more $.kinetic namespace
  - `Kinetic` constructor is attached to $.Kinetic
  - `$('#wrapper').data('kinetic-settings')` has been removed in favour of
    `instance = $('#wrapper').data('kinetic'); settings = instance.settings`
  - All events `this` context is now the instance of `Kinetic`. 
    To access the `$scroller` which was previously the context you can use `this.$el`

### 1.8.2
- fix #34, #28, now will discard any subsequent attempts to bind `.kinetic()`

### 1.8.1
- tweak to hardware trigger css (@edmelly)
- upgrade to Grunt 0.4

### 1.8
- add scroll listener to trigger move events (@dennipahmah)

### 1.7
- add cursor option to change the default `move` cursor

### 1.6.1
- bug fix release for unbinding touch events

### 1.6
- use bind for touch events to fix issues on android

### 1.5
- added ability to prevent capturing scroll depending on the target
- fix for using alongside jQuery UI draggable #14 - thanks @sidoh, @NilsHolmstrom

### 1.4
- added ability to nest containers thanks @cc-lam
- added detach/attach methods
- added triggerHardware option

### 1.3
- IE bug fixes when dragging images
- Adding extensibility for methods by attaching functions to jQuery.

        // add the method
        $.kinetic.callMethods.do = function(settings, options){
            // method functionality
        };

        // use the method
        $('#elem').kinetic('do', { ... });

- Added stop method
- Fix bug with ignored axis triggering animation frames



