/*!
    jQuery.kineticScrollbar v0.1
    Dave Taylor http://the-taylors.org/jquery.kinetic

    This plugin depends on two other plugins
    ---------------------------------------- 
    jQuery UI Slider
    https://github.com/davetayls/jquery.kinetic
    https://github.com/brandonaaron/jquery-mousewheel

    @license The MIT License (MIT)
    @preserve Copyright (c) <2011> <Dave Taylor http://the-taylors.org>
*/
/*jslint browser: true, vars: true, white: true, forin: true */
/*global define,require */
(function($){
    'use strict';

    var /** @const */ DEFAULT_SETTINGS    = {
          speed: 30
        , barCss: {
            position: 'absolute'
          }
        , handleCss: {
            position: 'absolute'
          }
        }
    ;

    /** add scrollTo method to jquery.kinetic */
    $.kinetic.callMethods.scrollTo = function(settings, options){

        this.scrollLeft = settings.scrollLeft = options.left;
        this.scrollTop  = settings.scrollTop  = options.top;

        if (typeof settings.moved === 'function') {
            settings.moved.call($(this), settings);
        }

    };

    var getProperties = function($wrapper) {
        var wrapper       = $wrapper[0]
        ,   height        = $wrapper.height()
        ,   width         = $wrapper.width()
        ,   left          = wrapper.scrollLeft + width
        ,   top           = wrapper.scrollTop
        ,   step          = (wrapper.scrollHeight - height) / 100
        ,   barStep       = height / 100 
        ,   handleHeight  = height / (wrapper.scrollHeight / height)
        ,   stepTop       = 100 - Math.ceil(wrapper.scrollTop/step)
        ,   handleTop     = stepTop * barStep
        ;
        return {
            step: step
        ,   barStep: barStep
        ,   stepTop: stepTop
        ,   height: height
        ,   width: width
        ,   left:  left
        ,   top: top
        ,   handleHeight: handleHeight
        ,   handleTop: handleTop
        };

    };

    var setBar = function($bar, height, left, top) {
        $bar.height(height - 30)
            .css('top', (top + 15) + 'px')
            .css('left', left + 'px');
    };

    $.fn.kineticScrollbar = function(options) {
        var settings = $.extend({}, DEFAULT_SETTINGS, options);
        return this.each(function(){
            var $wrapper = $(this)
            ,   wrapper    = this
            ,   ksettings  = $wrapper.data($.kinetic.settingsKey)
            ,   oldMoved   = ksettings.moved
            ,   $outer     = $('<div class="kinetic-scrollOuter" />')
            ,   $bar       = $('<div class="kinetic-scrollbar" />').css(settings.barCss)
            ,   $handle    = $('<div class="ui-slider-handle kinetic-scrollhandle" />').css(settings.handleCss).appendTo($bar)
            ,   isHandle   = false
            ,   properties = getProperties($wrapper)
            ;
            $wrapper
                .wrap($outer)
                .after($bar);
            // setBar($bar, properties.height, properties.left, properties.top);

            var moved = function(settings) {
                properties = getProperties($wrapper);
                
                if (!isHandle) {
                    $bar.slider('value', properties.stepTop);
                }
                // setBar($bar
                // ,      properties.height
                // ,      properties.left
                // ,      properties.top);

                if (oldMoved) {
                    oldMoved.apply(this, arguments);
                }
            };
            ksettings.moved = moved;

            //set up the slider 
            var sliderMove = function(event, ui) {
                isHandle = true;
                properties = getProperties($wrapper);

                $wrapper.kinetic('scrollTo', {
                    left: wrapper.scrollLeft
                    ,   top:  (100 - ui.value) * properties.step
                });

                isHandle = false;
            };
            $bar.slider({
                orientation: 'vertical',
                min: 0,
                max: 100,
                value: 100,
                slide: sliderMove,
                change: sliderMove
            });

            $wrapper.mousewheel(function(event, delta, deltaX, deltaY) {
                var xShift   = ksettings.x ? deltaX * settings.speed : 0
                ,   yShift     = ksettings.y ? -(deltaY * settings.speed) : 0
                ,   scrollLeft = wrapper.scrollLeft
                ,   scrollTop  = wrapper.scrollTop
                ,   isScrolling = true
                ;

                if (!ksettings.y) {
                    isScrolling = Math.abs(deltaX) > 0.02;
                }
                if (!ksettings.x) {
                    isScrolling = isScrolling && Math.abs(deltaY) > 0.02;
                }

                if (isScrolling) {
                    $wrapper.kinetic('scrollTo', {
                          left: scrollLeft+xShift
                        , top:  scrollTop+yShift
                    });
                    event.preventDefault(); //stop any default behaviour
                }

            });

        });
            
    };

}(window.jQuery));
