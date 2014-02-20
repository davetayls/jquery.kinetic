/**
 jQuery.kinetic v1.8.2
 Dave Taylor http://davetayls.me

 @license The MIT License (MIT)
 @preserve Copyright (c) 2012 Dave Taylor http://davetayls.me
 */
(function ($){
  'use strict';

  var ACTIVE_CLASS = 'kinetic-active';

  /**
   * Provides requestAnimationFrame in a cross browser way.
   * http://paulirish.com/2011/requestanimationframe-for-smart-animating/
   */
  if (!window.requestAnimationFrame){

    window.requestAnimationFrame = ( function (){

      return window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (/* function FrameRequestCallback */ callback, /* DOMElement Element */ element){
          window.setTimeout(callback, 1000 / 60);
        };

    }());

  }

  // add touch checker to jQuery.support
  $.support = $.support || {};
  $.extend($.support, {
    touch: 'ontouchend' in document
  });
  var selectStart = function (){
    return false;
  };


  // KINETIC CLASS DEFINITION
  // ======================

  var Kinetic = function (element, settings) {
    this.settings = settings;
    this.$el      = $(element);

    this._initElements();

    return this;
  };

  Kinetic.DATA_KEY = 'kinetic';
  Kinetic.DEFAULTS = {
    cursor: 'move',
    decelerate: true,
    triggerHardware: false,
    y: true,
    x: true,
    slowdown: 0.9,
    maxvelocity: 40,
    throttleFPS: 60,
    movingClass: {
      up: 'kinetic-moving-up',
      down: 'kinetic-moving-down',
      left: 'kinetic-moving-left',
      right: 'kinetic-moving-right'
    },
    deceleratingClass: {
      up: 'kinetic-decelerating-up',
      down: 'kinetic-decelerating-down',
      left: 'kinetic-decelerating-left',
      right: 'kinetic-decelerating-right'
    }
  };


  // Public functions

  Kinetic.prototype.start = function (options){
    this.settings = $.extend(this.settings, options);
    this.settings.decelerate = false;
    this._move();
  };

  Kinetic.prototype.end = function (){
    this.settings.decelerate = true;
  };

  Kinetic.prototype.stop = function ($scroller){
    this.settings.velocity = 0;
    this.settings.velocityY = 0;
    this.settings.decelerate = true;
    if ($.isFunction(this.settings.stopped)){
      this.settings.stopped.call($scroller);
    }
  };

  Kinetic.prototype.detach = function (){
    this._detachListeners();
    this.$el
      .removeClass(ACTIVE_CLASS)
      .css('cursor', '');
  };

  Kinetic.prototype.attach = function (){
    if (this.$el.hasClass(ACTIVE_CLASS)) {
      return;
    }
    this._attachListeners(this.$el);
    this.$el
      .addClass(ACTIVE_CLASS)
      .css('cursor', this.settings.cursor);
  };


  // Internal functions

  Kinetic.prototype._initElements = function (){
    this.$el.addClass(ACTIVE_CLASS);

    $.extend(this, {
      xpos: null,
      prevXPos: false,
      ypos: null,
      prevYPos: false,
      mouseDown: false,
      throttleTimeout: 1000 / this.settings.throttleFPS,
      lastMove: null,
      elementFocused: null
    });

    this.settings.velocity = 0;
    this.settings.velocityY = 0;

    // make sure we reset everything when mouse up
    $(document)
      .mouseup($.proxy(this._resetMouse, this))
      .click($.proxy(this._resetMouse, this));

    this._initEvents();

    this.$el.css('cursor', this.settings.cursor);

    if (this.settings.triggerHardware){
      this.$el.css({
        '-webkit-transform': 'translate3d(0,0,0)',
        '-webkit-perspective': '1000',
        '-webkit-backface-visibility': 'hidden'
      });
    }
  };

  Kinetic.prototype._initEvents = function(){
    var self = this;
    this.settings.events = {
      touchStart: function (e){
        var touch;
        if (self._useTarget(e.target)){
          touch = e.originalEvent.touches[0];
          self._start(touch.clientX, touch.clientY);
          e.stopPropagation();
        }
      },
      touchMove: function (e){
        var touch;
        if (self.mouseDown){
          touch = e.originalEvent.touches[0];
          self._inputmove(touch.clientX, touch.clientY);
          if (e.preventDefault){
            e.preventDefault();
          }
        }
      },
      inputDown: function (e){
        if (self._useTarget(e.target)){
          self._start(e.clientX, e.clientY);
          self.elementFocused = e.target;
          if (e.target.nodeName === 'IMG'){
            e.preventDefault();
          }
          e.stopPropagation();
        }
      },
      inputEnd: function (e){
        if (self._useTarget(e.target)){
          self._end();
          self.elementFocused = null;
          if (e.preventDefault){
            e.preventDefault();
          }
        }
      },
      inputMove: function (e){
        if (self.mouseDown){
          self._inputmove(e.clientX, e.clientY);
          if (e.preventDefault){
            e.preventDefault();
          }
        }
      },
      scroll: function (e){
        if ($.isFunction(self.settings.moved)){
          self.settings.moved.call(self.$el, self.settings);
        }
        if (e.preventDefault){
          e.preventDefault();
        }
      },
      inputClick: function (e){
        if (Math.abs(self.settings.velocity) > 0){
          e.preventDefault();
          return false;
        }
      },
      // prevent drag and drop images in ie
      dragStart: function (e){
        if (self.elementFocused){
          return false;
        }
      }
    };

    this._attachListeners(this.$el, this.settings);

  };

  Kinetic.prototype._inputmove = function (clientX, clientY){
    var $this = this.$el;

    if (!this.lastMove || new Date() > new Date(this.lastMove.getTime() + this.throttleTimeout)){
      this.lastMove = new Date();

      if (this.mouseDown && (this.xpos || this.ypos)){
        if (this.elementFocused){
          $(this.elementFocused).blur();
          this.elementFocused = null;
          $this.focus();
        }

        this.settings.decelerate = false;
        this.settings.velocity = this.settings.velocityY = 0;
        $this[0].scrollLeft = this.settings.scrollLeft = this.settings.x ? $this[0].scrollLeft - (clientX - this.xpos) : $this[0].scrollLeft;
        $this[0].scrollTop = this.settings.scrollTop = this.settings.y ? $this[0].scrollTop - (clientY - this.ypos) : $this[0].scrollTop;
        this.prevXPos = this.xpos;
        this.prevYPos = this.ypos;
        this.xpos = clientX;
        this.ypos = clientY;

        this._calculateVelocities();
        this._setMoveClasses(this.settings.movingClass);

        if ($.isFunction(this.settings.moved)){
          this.settings.moved.call($this, this.settings);
        }
      }
    }
  };

  Kinetic.prototype._calculateVelocities = function (){
    this.settings.velocity = this._capVelocity(this.prevXPos - this.xpos, this.settings.maxvelocity);
    this.settings.velocityY = this._capVelocity(this.prevYPos - this.ypos, this.settings.maxvelocity);
  };

  Kinetic.prototype._end = function (){
    if (this.xpos && this.prevXPos && this.settings.decelerate === false){
      this.settings.decelerate = true;
      this._calculateVelocities();
      this.xpos = this.prevXPos = this.mouseDown = false;
      this._move();
    }
  };

  Kinetic.prototype._useTarget = function (target){
    if ($.isFunction(this.settings.filterTarget)){
      return this.settings.filterTarget.call(this, target) !== false;
    }
    return true;
  };

  Kinetic.prototype._start = function (clientX, clientY){
    this.mouseDown = true;
    this.settings.velocity = this.prevXPos = 0;
    this.settings.velocityY = this.prevYPos = 0;
    this.xpos = clientX;
    this.ypos = clientY;
  };

  Kinetic.prototype._resetMouse = function (){
    this.xpos = false;
    this.ypos = false;
    this.mouseDown = false;
  };

  Kinetic.prototype._decelerateVelocity = function (velocity, slowdown){
    return Math.floor(Math.abs(velocity)) === 0 ? 0 // is velocity less than 1?
      : velocity * slowdown; // reduce slowdown
  };

  Kinetic.prototype._capVelocity = function (velocity, max){
    var newVelocity = velocity;
    if (velocity > 0){
      if (velocity > max){
        newVelocity = max;
      }
    } else {
      if (velocity < (0 - max)){
        newVelocity = (0 - max);
      }
    }
    return newVelocity;
  };

  Kinetic.prototype._setMoveClasses = function (classes){
    // FIXME: consider if we want to apply PL #44, this should not remove
    // classes we have not defined on the element!
    var settings = this.settings;
    var $this = this.$el;

    $this.removeClass(settings.movingClass.up)
      .removeClass(settings.movingClass.down)
      .removeClass(settings.movingClass.left)
      .removeClass(settings.movingClass.right)
      .removeClass(settings.deceleratingClass.up)
      .removeClass(settings.deceleratingClass.down)
      .removeClass(settings.deceleratingClass.left)
      .removeClass(settings.deceleratingClass.right);

    if (settings.velocity > 0){
      $this.addClass(classes.right);
    }
    if (settings.velocity < 0){
      $this.addClass(classes.left);
    }
    if (settings.velocityY > 0){
      $this.addClass(classes.down);
    }
    if (settings.velocityY < 0){
      $this.addClass(classes.up);
    }

  };


  Kinetic.prototype._move = function (){
    // do the actual kinetic movement
    var $scroller = this.$el;
    var scroller = $scroller[0];
    var self = this;
    var settings = self.settings;

    // set scrollLeft
    if (settings.x && scroller.scrollWidth > 0){
      scroller.scrollLeft = settings.scrollLeft = scroller.scrollLeft + settings.velocity;
      if (Math.abs(settings.velocity) > 0){
        settings.velocity = settings.decelerate ?
          self._decelerateVelocity(settings.velocity, settings.slowdown) : settings.velocity;
      }
    } else {
      settings.velocity = 0;
    }

    // set scrollTop
    if (settings.y && scroller.scrollHeight > 0){
      scroller.scrollTop = settings.scrollTop = scroller.scrollTop + settings.velocityY;
      if (Math.abs(settings.velocityY) > 0){
        settings.velocityY = settings.decelerate ?
          self._decelerateVelocity(settings.velocityY, settings.slowdown) : settings.velocityY;
      }
    } else {
      settings.velocityY = 0;
    }

    self._setMoveClasses(settings.deceleratingClass);

    if ($.isFunction(settings.moved)){
      settings.moved.call($scroller, settings);
    }

    if (Math.abs(settings.velocity) > 0 || Math.abs(settings.velocityY) > 0){
      // tick for next movement
      window.requestAnimationFrame(function (){
        self._move();
      });
    } else {
      self._stop();
    }
  };

  Kinetic.prototype._attachListeners = function (){
    var $this = this.$el;
    var settings = this.settings;

    if ($.support.touch){
      $this
        .bind('touchstart', settings.events.touchStart)
        .bind('touchend', settings.events.inputEnd)
        .bind('touchmove', settings.events.touchMove);
    } else {
      $this
        .mousedown(settings.events.inputDown)
        .mouseup(settings.events.inputEnd)
        .mousemove(settings.events.inputMove);
    }
    $this
      .click(settings.events.inputClick)
      .scroll(settings.events.scroll)
      .bind('selectstart', selectStart) // prevent selection when dragging
      .bind('dragstart', settings.events.dragStart);
  };

  Kinetic.prototype._detachListeners = function (){
    var $this = this.$el;
    var settings = this.settings;

    var element = $this[0];
    if ($.support.touch){
      $this
        .unbind('touchstart', settings.events.touchStart)
        .unbind('touchend', settings.events.inputEnd)
        .unbind('touchmove', settings.events.touchMove);
    } else {
      $this
        .unbind('mousedown', settings.events.inputDown)
        .unbind('mouseup', settings.events.inputEnd)
        .unbind('mousemove', settings.events.inputMove)
        .unbind('scroll', settings.events.scroll);
    }
    $this
      .unbind('click', settings.events.inputClick)
      .unbind('selectstart', selectStart) // prevent selection when dragging
      .unbind('dragstart', settings.events.dragStart);
  };


  // EXPOSE KINETIC CONSTRUCTOR
  // ==========================
  $.Kinetic = Kinetic;

  // KINETIC PLUGIN DEFINITION
  // =======================

  $.fn.kinetic = function (option, callOptions) {
    return this.each(function () {
      var $this    = $(this);
      var instance = $this.data(Kinetic.DATA_KEY);
      var options  = $.extend({}, Kinetic.DEFAULTS, $this.data(), typeof option === 'object' && option);

      if (!instance) {
        $this.data(Kinetic.DATA_KEY, (instance = new Kinetic(this, options)));
      }

      if (typeof option === 'string') {
        instance[option](callOptions);
      }

    });
  };

}(window.jQuery || window.Zepto));

