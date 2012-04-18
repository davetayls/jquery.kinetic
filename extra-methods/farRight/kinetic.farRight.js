/**
 * Kinetic method to jump to far right
 */
 (function($){

 	$.kinetic.callMethods.farRight = function(settings){
 		this.scrollLeft = this.scrollWidth;
 	};

 }(jQuery));