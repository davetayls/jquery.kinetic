/*!
    jQuery.kinetic v1b1
    Dave Taylor http://the-taylors.org

    The MIT License (MIT)
    Copyright (c) <2011> <Dave Taylor http://the-taylors.org>
*/
/*
    Options
    =======
    slowdown    {number}    default: 0.9    This option affects the speed at which the scroll slows
    x           {string}    default: true   Toggles movement along the x axis
    y           {string}    default: true   Toggles movement along the y axis
    maxvelocity {number}    default: 40     This option puts a cap on speed at which the container
                                            can scroll

    Listeners:  All listeners are called with:
                - this = jQuery object holding the scroll container
                - a single argument state: { }

    moved       {function(state)}           A function which is called on every move

    Methods:    You can call methods by running the kinetic plugin
                on an element which has already been activated.

                eg  $('#wrapper').kinetic(); // activate
                    $('#wrapper').kinetic('methodname', arguments);

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

    */
/*jslint browser: true, vars: true, white: true, forin: true, indent: 4 */
/*global define,require */
(function($){
	'use strict';

    var DEFAULT_SETTINGS    = { 
                                  decelerate: true, 
                                  y: true,
                                  x: true,
                                  slowdown: 0.9, 
                                  maxvelocity: 40 
                              },
        SETTINGS_KEY        = 'kinetic-settings';

    /**
     * Provides requestAnimationFrame in a cross browser way.
     * http://paulirish.com/2011/requestanimationframe-for-smart-animating/
     */
    if ( !window.requestAnimationFrame ) {

        window.requestAnimationFrame = ( function() {

            return window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element ) {
                window.setTimeout( callback, 1000 / 60 );
            };

        }());

    }

    // add touch checker to jQuery.support
    $.extend($.support, {
        touch: "ontouchend" in document
    });

    var decelerateVelocity = function(velocity, slowdown) {
        return Math.floor(Math.abs(velocity)) === 0 ? 0 // is velocity less than 1?
               : velocity * slowdown; // reduce slowdown
    };
    var capVelocity = function(velocity, max) {
        var newVelocity = velocity;
        if (velocity > 0) {
            if (velocity > max) {
                newVelocity = max;
            }
        } else {
            if (velocity < (0 - max)) {
                newVelocity = (0 - max);
            }
        }
        return newVelocity;
    };
    // do the actual kinetic movement
    var move = function($scroller, settings) {
        // set scrollLeft
        if (settings.x){
            $scroller[0].scrollLeft = settings.scrollLeft = $scroller[0].scrollLeft + settings.velocity;
            if (Math.abs(settings.velocity) > 0) {
                // if we are decelerating
                settings.velocity = settings.decelerate ? decelerateVelocity(settings.velocity, settings.slowdown) : settings.velocity;
            }
        }
        // set scrollTop
        if (settings.y){
            $scroller[0].scrollTop = settings.scrollTop = $scroller[0].scrollTop + settings.velocityY;
            if (Math.abs(settings.velocityY) > 0) {
                // if we are decelerating
                settings.velocityY = settings.decelerate ? decelerateVelocity(settings.velocityY, settings.slowdown) : settings.velocityY;
            }
        }
        if (Math.abs(settings.velocity) > 0 || Math.abs(settings.velocityY) > 0) {
            // tick for next movement
            window.requestAnimationFrame(function(){
                move($scroller, settings);
            });
        }
        // trigger listener
        if (typeof settings.moved === 'function') {
            settings.moved.call($scroller, { 
                scrollLeft: settings.scrollLeft,
                scrollTop: settings.scrollTop,
                velocity: settings.velocity,
                settings: settings
            });
        }
    };
    


    var callOption = function(method, options) {
        if (method && method === 'start') {
            this.each(function(){
                var $this = $(this),
                    settings = $.extend($this.data(SETTINGS_KEY), options);
                if (settings) {
                    settings.decelerate = false;
                    move($this, settings);
                }
            });
        }
        if (method && method === 'end') {
            this.each(function(){
                var $this = $(this),
                    settings = $this.data(SETTINGS_KEY);
                if (settings) {
                    settings.decelerate = true;
                }
            });
        }
    };

    var initElements = function(options) {
        // add to each area
        this
        .addClass('kinetic-active')
        .each(function(){

            var settings = $.extend({}, DEFAULT_SETTINGS, options);
            
            var $this = $(this),
                xpos, 
                prevXPos = false,
                ypos,
                prevYPos = false,
                mouseDown = false,
                scrollLeft,
                scrollTop;

            settings.velocity = 0;
            settings.velocityY = 0;

            // prevent selection when dragging
            $this.bind("selectstart", function () { return false; });
            // make sure we reset everything when mouse up
            var resetMouse = function() {
                xpos = false;
                ypos = false;
                mouseDown = false;
            };
            $(document).mouseup(resetMouse).click(resetMouse);

            var start = function(clientX, clientY) {
                mouseDown = true;
                settings.velocity = prevXPos = 0;
                settings.velocityY = prevYPos = 0;
                xpos = clientX;
                ypos = clientY;
            };
            var end = function() {
                if (xpos && prevXPos && settings.velocity === 0) {
                    settings.velocity    = capVelocity(prevXPos - xpos, settings.maxvelocity);
                    settings.velocityY   = capVelocity(prevYPos - ypos, settings.maxvelocity);
                    xpos = prevXPos = mouseDown = false;
                    move($this, settings);
                }
            };
            var inputmove = function(clientX, clientY) {
                if (mouseDown && (xpos || ypos)) {
                    settings.velocity   = 0;
                    settings.velocityY  = 0;
                    $this[0].scrollLeft = settings.scrollLeft = settings.x ? $this[0].scrollLeft - (clientX - xpos) : $this[0].scrollLeft;
                    $this[0].scrollTop  = settings.scrollTop  = settings.y ? $this[0].scrollTop - (clientY - ypos)  : $this[0].scrollTop;
                    prevXPos = xpos;
                    prevYPos = ypos;
                    xpos = clientX;
                    ypos = clientY;

                    if (typeof settings.moved === 'function') {
                        settings.moved.call($this, { 
                            scrollLeft: settings.scrollLeft,
                            scrollTop: settings.scrollTop,
                            velocity: settings.velocity,
                            settings: settings
                        });
                    }
                }
            };
            
            // attach listeners
            if ($.support.touch) {
                this.addEventListener('touchstart', function(e){
                    start(e.touches[0].clientX, e.touches[0].clientY);
                }, false);
                this.addEventListener('touchend', function(e){
                    if (e.preventDefault) {e.preventDefault();}
                    end();
                }, false);
                this.addEventListener('touchmove', function(e){
                    if (e.preventDefault) {e.preventDefault();}
                    inputmove(e.touches[0].clientX, e.touches[0].clientY);
                }, false);
            }else{
                $this
                    .mousedown(function(e){
                        start(e.clientX, e.clientY);
                        e.preventDefault();
                    })
                    .mouseup(function(){
                        end();
                    })
                    .mousemove(function(e){
                        inputmove(e.clientX, e.clientY);
                    })
                    .css("cursor", "move");
            }
            $this.click(function(e){
                if (Math.abs(settings.velocity) > 0) {
                    e.preventDefault();
                    return false;
                }
            });
            $this.data(SETTINGS_KEY, settings);
        });
    };

    $.fn.kinetic = function(options) {
        if (typeof options === 'string') {
            callOption.apply(this, arguments);
        } else {
            initElements.call(this, options);
        }
    };

}(window.jQuery));
