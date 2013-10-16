/**
 * Kinetic method to jump to far right
 */
 (function($){

 	$.kinetic.callMethods.jumpTo = function(settings, options){
        $(this).kinetic('stop');
 		this.scrollLeft = options.x;
        this.scrollTop = options.y;
 	};

 }(jQuery));