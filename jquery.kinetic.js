/*!
    jQuery.kinetic v1.3
    Dave Taylor http://the-taylors.org/jquery.kinetic

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
    throttleFPS {number}    default: 60     This adds throttling to the mouse move events to boost
                                            performance when scrolling
    movingClass {object} 
        up:     {string}    default: 'kinetic-moving-up'
        down:   {string}    default: 'kinetic-moving-down'
        left:   {string}    default: 'kinetic-moving-left'
        right:  {string}    default: 'kinetic-moving-right'
    
    deceleratingClass {object} 
        up:     {string}    default: 'kinetic-decelerating-up'
        down:   {string}    default: 'kinetic-decelerating-down'
        left:   {string}    default: 'kinetic-decelerating-left'
        right:  {string}    default: 'kinetic-decelerating-right'
    

    Listeners:  All listeners are called with:
                - this = jQuery object holding the scroll container
                - a single settings argument which are all the options and  
                  { scrollLeft, scrollTop, velocity, velocityY }

    moved       {function(settings)}           A function which is called on every move
    stopped     {function(settings)}           A function which is called once all 
                                               movement has stopped

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

    Add your own method:
                // add the method
                $.kinetic.callMethods.do = function(settings, options){
                    // method functionality
                };

                // use the method
                $('#elem').kinetic('do', { ... });

    */
/*jslint browser: true, vars: true, white: true, forin: true, indent: 4 */
/*global define,require */
(function($){
	'use strict';

    var DEFAULT_SETTINGS    = { decelerate: true
                              , y: true
                              , x: true
                              , slowdown: 0.9
                              , maxvelocity: 40 
                              , throttleFPS: 60
                              , movingClass: {
                                  up:    'kinetic-moving-up'
                                , down:  'kinetic-moving-down'
                                , left:  'kinetic-moving-left'
                                , right: 'kinetic-moving-right'
                                }
                              , deceleratingClass: {
                                  up:    'kinetic-decelerating-up'
                                , down:  'kinetic-decelerating-down'
                                , left:  'kinetic-decelerating-left'
                                , right: 'kinetic-decelerating-right'
                                }
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
    $.support = $.support || {};
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
    var setMoveClasses = function(settings, classes) {
        this.removeClass(settings.movingClass.up)
            .removeClass(settings.movingClass.down)
            .removeClass(settings.movingClass.left)
            .removeClass(settings.movingClass.right)
            .removeClass(settings.deceleratingClass.up)
            .removeClass(settings.deceleratingClass.down)
            .removeClass(settings.deceleratingClass.left)
            .removeClass(settings.deceleratingClass.right);

        if (settings.velocity > 0) {
            this.addClass(classes.right);
        }
        if (settings.velocity < 0) {
            this.addClass(classes.left);
        }
        if (settings.velocityY > 0) {
            this.addClass(classes.down);
        }
        if (settings.velocityY < 0) {
            this.addClass(classes.up);
        }
        
    };
    var stop = function($scroller, settings) {
        if (typeof settings.stopped === 'function') {
            settings.stopped.call($scroller, settings);
        }
    };
    /** do the actual kinetic movement */
    var move = function($scroller, settings) {
        var scroller = $scroller[0];

        // set scrollLeft
        if (settings.x && scroller.scrollWidth > 0){
            scroller.scrollLeft = settings.scrollLeft = scroller.scrollLeft + settings.velocity;
            if (Math.abs(settings.velocity) > 0) {
                settings.velocity = settings.decelerate ? 
                    decelerateVelocity(settings.velocity, settings.slowdown) : settings.velocity;
            }
        } else {
            settings.velocity = 0;
        }

        // set scrollTop
        if (settings.y && scroller.scrollHeight > 0){
            scroller.scrollTop = settings.scrollTop = scroller.scrollTop + settings.velocityY;
            if (Math.abs(settings.velocityY) > 0) {
                settings.velocityY = settings.decelerate ? 
                    decelerateVelocity(settings.velocityY, settings.slowdown) : settings.velocityY;
            }
        } else {
            settings.velocityY = 0;
        }

        setMoveClasses.call($scroller, settings, settings.deceleratingClass);
        
        if (typeof settings.moved === 'function') {
            settings.moved.call($scroller, settings);
        }

        if (Math.abs(settings.velocity) > 0 || Math.abs(settings.velocityY) > 0) {
            // tick for next movement
            window.requestAnimationFrame(function(){ move($scroller, settings); });
        } else {
            stop($scroller, settings);
        }
    };
    


    var callOption = function(method, options) {
        var methodFn = $.kinetic.callMethods[method]
        , args = Array.prototype.slice.call(arguments)
        ;
        if (methodFn) {
            this.each(function(){
                var opts = args.slice(1), settings = $(this).data(SETTINGS_KEY);
                opts.unshift(settings);
                methodFn.apply(this, opts);
            });
        }
    };

    var initElements = function(options) {
        // add to each area
        this
        .addClass('kinetic-active')
        .attr('tabindex', '0')       // enable the window to receive focus
        .each(function(){

            var settings = $.extend({}, DEFAULT_SETTINGS, options);
            
            var $this = $(this)
            ,   xpos
            ,   prevXPos = false
            ,   ypos
            ,   prevYPos = false
            ,   mouseDown = false
            ,   scrollLeft
            ,   scrollTop
            ,   throttleTimeout = 1000 / settings.throttleFPS
            ,   lastMove
            ,   elementFocused
            ;

            settings.velocity = 0;
            settings.velocityY = 0;

            // prevent selection when dragging
            $this.bind("selectstart", function () { return false; });
            // prevent drag and drop images in ie
            $(document).bind('dragstart', function(e) {
                return !!elementFocused;
            });
            // make sure we reset everything when mouse up
            var resetMouse = function() {
                xpos = false;
                ypos = false;
                mouseDown = false;
            };
            $(document).mouseup(resetMouse).click(resetMouse);

            var calculateVelocities = function() {
                settings.velocity    = capVelocity(prevXPos - xpos, settings.maxvelocity);
                settings.velocityY   = capVelocity(prevYPos - ypos, settings.maxvelocity);
            };
            var start = function(clientX, clientY) {
                mouseDown = true;
                settings.velocity = prevXPos = 0;
                settings.velocityY = prevYPos = 0;
                xpos = clientX;
                ypos = clientY;
            };
            var end = function() {
                if (xpos && prevXPos && settings.decelerate === false) {
                    settings.decelerate = true;
                    calculateVelocities();
                    xpos = prevXPos = mouseDown = false;
                    move($this, settings);
                }
            };
            var inputmove = function(clientX, clientY) {
                if (!lastMove || new Date() > new Date(lastMove.getTime() + throttleTimeout)) {
                    lastMove = new Date();

                    if (mouseDown && (xpos || ypos)) {
                        if (elementFocused) {
                            $(elementFocused).blur();
                            elementFocused = null;
                            $this.focus();
                        }
                        settings.decelerate = false;
                        settings.velocity   = settings.velocityY  = 0;
                        $this[0].scrollLeft = settings.scrollLeft = settings.x ? $this[0].scrollLeft - (clientX - xpos) : $this[0].scrollLeft;
                        $this[0].scrollTop  = settings.scrollTop  = settings.y ? $this[0].scrollTop - (clientY - ypos)  : $this[0].scrollTop;
                        prevXPos = xpos;
                        prevYPos = ypos;
                        xpos = clientX;
                        ypos = clientY;

                        calculateVelocities();
                        setMoveClasses.call($this, settings, settings.movingClass);

                        if (typeof settings.moved === 'function') {
                            settings.moved.call($this, settings);
                        }
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
                        elementFocused = e.target;
                        if (e.target.nodeName === 'IMG'){
                            e.preventDefault();
                        }
                    })
                    .mouseup(function(){
                        end();
                        elementFocused = null;
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

    $.kinetic = {
        settingsKey: SETTINGS_KEY,
        callMethods: {
            start: function(settings, options){
                var $this = $(this);
                    settings = $.extend(settings, options);
                if (settings) {
                    settings.decelerate = false;
                    move($this, settings);
                }
            },
            end: function(settings, options){
                var $this = $(this);
                if (settings) {
                    settings.decelerate = true;
                }
            },
            stop: function(settings, options){
                settings.velocity = 0;
                settings.velocityY = 0;
                settings.decelerate = true;
            }            
        }
    };
    $.fn.kinetic = function(options) {
        if (typeof options === 'string') {
            callOption.apply(this, arguments);
        } else {
            initElements.call(this, options);
        }
        return this;
    };

}(window.jQuery || window.Zepto));
