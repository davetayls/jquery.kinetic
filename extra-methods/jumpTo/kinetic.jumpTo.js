/**
 * Kinetic method to jump to far right
 */
(function($){
  'use strict';

  $.Kinetic.prototype.jumpTo = function(options){
    this.stop();
    this.el.scrollLeft = options.x;
    this.el.scrollTop = options.y;
  };

}(jQuery));
