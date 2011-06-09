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
    /* start and end pixel coords to calculate from 
     * eg: [x,y],[x2,y2]
     * */
    var getDistance = $.kinetic.getDistance = function(start, end) {
        // 10,10 - 20,20
        var xlen = start[0] > end[0] ? start[0] - end[0] : end[0] - start[0], // adj
            ylen = start[1] > end[1] ? start[1] - end[1] : end[1] - start[1], // opp
            h    = Math.sqrt(Math.pow(xlen, 2) + Math.pow(ylen, 2));
        return Math.floor(h);
    };

    $.fn.kinetic = function(options) {

        var settings = $.extend({}, DEFAULT_SETTINGS, options);

        // add to each area
        this.each(function(){
            
            var $this = $(this),
                drag, 
                oldDrag = false,
                mouseDown = false,
                mouseDownTimeout = null,
                velocity = 0;

            if ($.browser.msie) {
                $this.bind("selectstart", function () { return false; });
            }
            var moveRight = function ($container) {
                $this[0].scrollLeft = $this[0].scrollLeft + velocity;
                if (mouseDown) {
                    mouseDownTimeout = window.setTimeout(moveRight, 10);
                } else if (velocity > 0) {
                    velocity -= settings.slowdown;
                    mouseDownTimeout = window.setTimeout(moveRight, 10);
                } else {
                    // updateNavigatorHighlight();
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

            var mousedown = function(e) {
                velocity = oldDrag = 0;
                drag = e.clientX;
            };
            var mouseup = function(e) {
                if (drag && oldDrag && velocity === 0) {
                    velocity = oldDrag - drag;
                    drag = oldDrag = mouseDown = false;
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
            var mousemove = function(e) {
                if (drag) {
                    velocity = 0;
                    $this[0].scrollLeft = $this[0].scrollLeft - (e.clientX - drag);
                    oldDrag = drag;
                    drag = e.clientX;
                }
            };

            $this
                .mousedown(mousedown)
                .mouseup(mouseup)
                .mousemove(mousemove)
                .css("cursor", "move");
            
            $(document).mouseup(function () {
                drag = false;
            });
	
        });
    };

})(jQuery);
