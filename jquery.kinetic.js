/*!
    jQuery.kinetic

    */
/*global */
/*jslint onevar:false */
(function($){

    var DEFAULT_SETTINGS = {
        slowdown: 0.8,
        maxvelocity: 30
    };

    $.kinetic = {};

    // add touch checker to jQuery.support
    $.extend($.support, {
        touch: "ontouchend" in document
    });

    $.fn.kinetic = function(options) {

        var settings = $.extend({}, DEFAULT_SETTINGS, options);

        // add to each area
        this.each(function(){
            
            var $this = $(this),
                xpos, 
                prevXPos = false,
                mouseDown = false,
                mouseDownTimeout = null,
                velocity = 0;

            if ($.browser.msie) {$this.bind("selectstart", function () { return false; });}
            $(document).mouseup(function () {
                xpos = false;
                mouseDown = false;
            });

            var moveRight = function ($container) {
                $this[0].scrollLeft = $this[0].scrollLeft + velocity;
                if (mouseDown) {
                    mouseDownTimeout = window.setTimeout(moveRight, 10);
                } else if (velocity > 0) {
                    velocity -= settings.slowdown;
                    mouseDownTimeout = window.setTimeout(moveRight, 10);
                } else {
                }
            };
            var moveLeft = function () {
                $this[0].scrollLeft = $this[0].scrollLeft - velocity;
                if (mouseDown) {
                    mouseDownTimeout = window.setTimeout(moveLeft, 10);
                } else if (velocity > 0) {
                    velocity -= settings.slowdown;
                    mouseDownTimeout = window.setTimeout(moveLeft, 10);
                } else {
                    // updateNavigatorHighlight();
                }
            };
            var start = function(clientX) {
                mouseDown = true;
                velocity = prevXPos = 0;
                xpos = clientX;
            };
            var end = function() {
                if (xpos && prevXPos && velocity === 0) {
                    velocity = prevXPos - xpos;
                    xpos = prevXPos = mouseDown = false;
                    if (velocity > 0) {
                        if (velocity > settings.maxvelocity) {
                            velocity = settings.maxvelocity;
                        }
                        moveRight();
                    } else {
                        velocity = Math.abs(velocity);
                        if (velocity > settings.maxvelocity) {
                            velocity = settings.maxvelocity;
                        }
                        moveLeft();
                    }
                }
            };
            var move = function(clientX) {
                if (mouseDown && xpos) {
                    velocity = 0;
                    $this[0].scrollLeft = $this[0].scrollLeft - (clientX - xpos);
                    prevXPos = xpos;
                    xpos = clientX;
                }
            };
            
            if ($.support.touch) {
                this.addEventListener('touchstart', function(e){
                    start(e.touches[0].clientX);
                }, false);
                this.addEventListener('touchend', function(e){
                    end();
                }, false);
                this.addEventListener('touchmove', function(e){
                    move(e.touches[0].clientX);
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
                        move(e.clientX);
                    })
                    .css("cursor", "move");
            }
	
        });
    };

})(jQuery);
