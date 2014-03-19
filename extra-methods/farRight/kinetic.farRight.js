/**
 * Kinetic method to jump to far right
 */
 (function($){

  $.Kinetic.prototype.farRight = function(options){
    this.scrollLeft = this.scrollWidth;
  };

 }(jQuery));
