/*!
    jQuery.kinetic v1a

    Options
    =======
    slowdown    {number}    default: 0.8    This option affects the speed at which the scroll slows
    maxvelocity {number}    default: 30     This option puts a cap on speed at which the container
                                            can scroll

    Listeners:  All listeners are called with:
                - this = jQuery object holding the scroll container
                - a single argument state: { }

    started     {function(state)}           A function which is called when scrolling starts
    moved       {function(state)}           A function which is called on every move
    released    {function(state)}           A function which is called on mouse up or touchend
    ended       {function(state)}           A function which is called when scrolling ends


    */
/*global */
/*jslint onevar:false */
(function($){

    var DEFAULT_SETTINGS    = { decelerate: true, slowdown: 0.8, maxvelocity: 40 },
        SETTINGS_KEY        = 'kinetic-settings';


    var isDirectionRight = function(velocity) {
        return velocity > 0;
    };
    // do the actual kinetic movement
    var move = function($scroller, settings) {
        $scroller[0].scrollLeft = scrollLeft = $scroller[0].scrollLeft + settings.velocity;
        if (Math.abs(settings.velocity) > 0) {
            // if we are decelerating
            if (settings.decelerate) {
                settings.velocity = settings.slowdown > Math.abs(settings.velocity) ? 0 // is slowdown bigger than the velocity?
                         : isDirectionRight(settings.velocity) ? settings.velocity -= settings.slowdown : settings.velocity += settings.slowdown; // reduce slowdown
            }
            
            // tick for next movement
            mouseDownTimeout = window.setTimeout(function(){
                move($scroller, settings);
            }, 13);
        }
        // trigger listener
        if (typeof settings.moved === 'function') {
            settings.moved.call($scroller, { 
                scrollLeft: scrollLeft,
                velocity: settings.velocity,
                settings: settings
            });
        }
    };
    
    // add touch checker to jQuery.support
    $.extend($.support, {
        touch: "ontouchend" in document
    });


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
        var settings = $.extend({}, DEFAULT_SETTINGS, options);


        // add to each area
        this
        .addClass('kinetic-active')
        .each(function(){
            
            var $this = $(this),
                xpos, 
                prevXPos = false,
                mouseDown = false,
                mouseDownTimeout = null,
                scrollLeft;

            settings.velocity = 0;

            // prevent selection when dragging
            if ($.browser.msie) {$this.bind("selectstart", function () { return false; });}
            // make sure we reset everything when mouse up
            var resetMouse = function() {
                xpos = false;
                mouseDown = false;
            };
            $(document).mouseup(resetMouse).click(resetMouse);

            var start = function(clientX) {
                mouseDown = true;
                settings.velocity = prevXPos = 0;
                xpos = clientX;
            };
            var end = function() {
                if (xpos && prevXPos && settings.velocity === 0) {
                    settings.velocity = prevXPos - xpos;
                    xpos = prevXPos = mouseDown = false;
                    if (settings.velocity > 0) {
                        if (settings.velocity > settings.maxvelocity) {
                            settings.velocity = settings.maxvelocity;
                        }
                    } else {
                        if (settings.velocity < (0 - settings.maxvelocity)) {
                            settings.velocity = (0 - settings.maxvelocity);
                        }
                    }
                    move($this, settings);
                }
            };
            var inputmove = function(clientX) {
                if (mouseDown && xpos) {
                    settings.velocity = 0;
                    $this[0].scrollLeft = scrollLeft = $this[0].scrollLeft - (clientX - xpos);
                    prevXPos = xpos;
                    xpos = clientX;

                    if (typeof settings.moved === 'function') {
                        settings.moved.call($this, { 
                            scrollLeft: scrollLeft,
                            velocity: settings.velocity,
                            settings: settings
                        });
                    }
                }
            };
            
            // attach listeners
            if ($.support.touch) {
                this.addEventListener('touchstart', function(e){
                    start(e.touches[0].clientX);
                }, false);
                this.addEventListener('touchend', function(e){
                    if (e.preventDefault) {e.preventDefault();}
                    end();
                }, false);
                this.addEventListener('touchmove', function(e){
                    if (e.preventDefault) {e.preventDefault();}
                    inputmove(e.touches[0].clientX);
                }, false);
            }else{
                $this
                    .mousedown(function(e){
                        start(e.clientX);
                    })
                    .mouseup(function(){
                        end();
                    })
                    .mousemove(function(e){
                        inputmove(e.clientX);
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

})(jQuery);
