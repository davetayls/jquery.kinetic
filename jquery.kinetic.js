/**
 jQuery.kinetic v1.8.2
 Dave Taylor http://davetayls.me

 @license The MIT License (MIT)
 @preserve Copyright (c) 2012 Dave Taylor http://davetayls.me
 */
(function ($){
  'use strict';

  var SETTINGS_KEY = 'kinetic-settings',
    ACTIVE_CLASS = 'kinetic-active'
  ;
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

  $.kinetic = {
    settingsKey: SETTINGS_KEY,
    callMethods: {
      start: function (settings, options){
        var $this = $(this);
        settings = $.extend(settings, options);
        if (settings){
          settings.decelerate = false;
          $.kinetic.Kinetic.prototype.move($this, settings);
        }
      },
      end: function (settings, options){
        var $this = $(this);
        if (settings){
          settings.decelerate = true;
        }
      },
      stop: function (settings, options){
        var $this = $(this);
        $.kinetic.Kinetic.prototype.stop($this, settings);
      },
      detach: function (settings, options){
        var $this = $(this);
        $.kinetic.Kinetic.prototype.detachListeners($this, settings);
        $this
          .removeClass(ACTIVE_CLASS)
          .css('cursor', '');
      },
      attach: function (settings, options){
        var $this = $(this);
        if ($this.hasClass(ACTIVE_CLASS)) {
          return;
        }
        $.kinetic.Kinetic.prototype.attachListeners($this, settings);
        $this
          .addClass(ACTIVE_CLASS)
          .css('cursor', settings.cursor);
      }
    }
  };

  $.kinetic.Kinetic = function (el, options){
    if (el || options){
      this.init(el, options);
    }
  };
  $.kinetic.Kinetic.prototype = {
    defaults: {
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
    },
    init: function (el, options){
      var self = this;
      this.$el = $(el);
      this.settings = $.extend({}, this.defaults, options);

      this.$el.data('kinetic', this);

      this._initElements();

      return this;
    },
    callOption: function (method, options){
      var methodFn = $.kinetic.callMethods[method];
      var args = Array.prototype.slice.call(arguments);
      if (methodFn){
        this.each(function (){
          var opts = args.slice(1);
          var settings = $(this).data(SETTINGS_KEY);
          opts.unshift(settings);
          methodFn.apply(this, opts);
        });
      }
    },
    _initElements: function (){
      this.$el.addClass(ACTIVE_CLASS);

      var self = this, $this = this.$el;

      // prevent from initializing the plugin
      // more than once
      if ($this.data(SETTINGS_KEY)){
        return;
      }

      var xpos,
        prevXPos = false,
        ypos,
        prevYPos = false,
        mouseDown = false,
        scrollLeft,
        scrollTop,
        throttleTimeout = 1000 / self.settings.throttleFPS,
        lastMove,
        elementFocused
        ;

      self.settings.velocity = 0;
      self.settings.velocityY = 0;

      // make sure we reset everything when mouse up
      $(document)
        .mouseup($.proxy(self.resetMouse, this))
        .click($.proxy(self.resetMouse, this));

      var calculateVelocities = function (){
        self.settings.velocity = self.capVelocity(prevXPos - xpos, self.settings.maxvelocity);
        self.settings.velocityY = self.capVelocity(prevYPos - ypos, self.settings.maxvelocity);
      };
      var useTarget = function (target){
        if ($.isFunction(self.settings.filterTarget)){
          return self.settings.filterTarget.call(self, target) !== false;
        }
        return true;
      };
      var start = function (clientX, clientY){
        mouseDown = true;
        self.settings.velocity = prevXPos = 0;
        self.settings.velocityY = prevYPos = 0;
        xpos = clientX;
        ypos = clientY;
      };
      var end = function (){
        if (xpos && prevXPos && self.settings.decelerate === false){
          self.settings.decelerate = true;
          calculateVelocities();
          xpos = prevXPos = mouseDown = false;
          self.move($this, self.settings);
        }
      };
      var inputmove = function (clientX, clientY){
        if (!lastMove || new Date() > new Date(lastMove.getTime() + throttleTimeout)){
          lastMove = new Date();

          if (mouseDown && (xpos || ypos)){
            if (elementFocused){
              $(elementFocused).blur();
              elementFocused = null;
              $this.focus();
            }
            self.settings.decelerate = false;
            self.settings.velocity = self.settings.velocityY = 0;
            $this[0].scrollLeft = self.settings.scrollLeft = self.settings.x ? $this[0].scrollLeft - (clientX - xpos) : $this[0].scrollLeft;
            $this[0].scrollTop = self.settings.scrollTop = self.settings.y ? $this[0].scrollTop - (clientY - ypos) : $this[0].scrollTop;
            prevXPos = xpos;
            prevYPos = ypos;
            xpos = clientX;
            ypos = clientY;

            calculateVelocities();
            self.setMoveClasses.call($this, self.settings, self.settings.movingClass);

            if ($.isFunction(self.settings.moved)){
              self.settings.moved.call($this, self.settings);
            }
          }
        }
      };

      // Events
      self.settings.events = {
        touchStart: function (e){
          var touch;
          if (useTarget(e.target)){
            touch = e.originalEvent.touches[0];
            start(touch.clientX, touch.clientY);
            e.stopPropagation();
          }
        },
        touchMove: function (e){
          var touch;
          if (mouseDown){
            touch = e.originalEvent.touches[0];
            inputmove(touch.clientX, touch.clientY);
            if (e.preventDefault){
              e.preventDefault();
            }
          }
        },
        inputDown: function (e){
          if (useTarget(e.target)){
            start(e.clientX, e.clientY);
            elementFocused = e.target;
            if (e.target.nodeName === 'IMG'){
              e.preventDefault();
            }
            e.stopPropagation();
          }
        },
        inputEnd: function (e){
          if (useTarget(e.target)){
            end();
            elementFocused = null;
            if (e.preventDefault){
              e.preventDefault();
            }
          }
        },
        inputMove: function (e){
          if (mouseDown){
            inputmove(e.clientX, e.clientY);
            if (e.preventDefault){
              e.preventDefault();
            }
          }
        },
        scroll: function (e){
          if ($.isFunction(self.settings.moved)){
            self.settings.moved.call($this, self.settings);
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
          if (elementFocused){
            return false;
          }
        }
      };

      self.attachListeners($this, self.settings);
      $this.data(SETTINGS_KEY, self.settings)
        .css('cursor', self.settings.cursor);

      if (self.settings.triggerHardware){
        $this.css({
          '-webkit-transform': 'translate3d(0,0,0)',
          '-webkit-perspective': '1000',
          '-webkit-backface-visibility': 'hidden'
        });
      }
    },
    resetMouse: function (){
      this.xpos = false;
      this.ypos = false;
      this.mouseDown = false;
    },
    decelerateVelocity: function (velocity, slowdown){
      return Math.floor(Math.abs(velocity)) === 0 ? 0 // is velocity less than 1?
        : velocity * slowdown; // reduce slowdown
    },
    capVelocity: function (velocity, max){
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
    },
    setMoveClasses: function (settings, classes){
      // FIXME: consider if we want to apply PL #44, this should not remove
      // classes we have not defined on the element!
      this.removeClass(settings.movingClass.up)
        .removeClass(settings.movingClass.down)
        .removeClass(settings.movingClass.left)
        .removeClass(settings.movingClass.right)
        .removeClass(settings.deceleratingClass.up)
        .removeClass(settings.deceleratingClass.down)
        .removeClass(settings.deceleratingClass.left)
        .removeClass(settings.deceleratingClass.right);

      if (settings.velocity > 0){
        this.addClass(classes.right);
      }
      if (settings.velocity < 0){
        this.addClass(classes.left);
      }
      if (settings.velocityY > 0){
        this.addClass(classes.down);
      }
      if (settings.velocityY < 0){
        this.addClass(classes.up);
      }

    },
    stop: function ($scroller, settings){
      settings.velocity = 0;
      settings.velocityY = 0;
      settings.decelerate = true;
      if ($.isFunction(settings.stopped)){
        settings.stopped.call($scroller, settings);
      }
    },

    /** do the actual kinetic movement */
    move: function ($scroller, settings){
      var scroller = $scroller[0];
      var self = this;

      // set scrollLeft
      if (settings.x && scroller.scrollWidth > 0){
        scroller.scrollLeft = settings.scrollLeft = scroller.scrollLeft + settings.velocity;
        if (Math.abs(settings.velocity) > 0){
          settings.velocity = settings.decelerate ?
            self.decelerateVelocity(settings.velocity, settings.slowdown) : settings.velocity;
        }
      } else {
        settings.velocity = 0;
      }

      // set scrollTop
      if (settings.y && scroller.scrollHeight > 0){
        scroller.scrollTop = settings.scrollTop = scroller.scrollTop + settings.velocityY;
        if (Math.abs(settings.velocityY) > 0){
          settings.velocityY = settings.decelerate ?
            self.decelerateVelocity(settings.velocityY, settings.slowdown) : settings.velocityY;
        }
      } else {
        settings.velocityY = 0;
      }

      self.setMoveClasses.call($scroller, settings, settings.deceleratingClass);

      if ($.isFunction(settings.moved)){
        settings.moved.call($scroller, settings);
      }

      if (Math.abs(settings.velocity) > 0 || Math.abs(settings.velocityY) > 0){
        // tick for next movement
        window.requestAnimationFrame(function (){
          self.move($scroller, settings);
        });
      } else {
        self.stop($scroller, settings);
      }
    },
    attachListeners: function ($this, settings){
      var element = $this[0];
      if ($.support.touch){
        $this.bind('touchstart', settings.events.touchStart)
          .bind('touchend', settings.events.inputEnd)
          .bind('touchmove', settings.events.touchMove)
        ;
      } else {
        $this
          .mousedown(settings.events.inputDown)
          .mouseup(settings.events.inputEnd)
          .mousemove(settings.events.inputMove)
        ;
      }
      $this
        .click(settings.events.inputClick)
        .scroll(settings.events.scroll)
        .bind('selectstart', selectStart) // prevent selection when dragging
        .bind('dragstart', settings.events.dragStart);
    },
    detachListeners: function ($this, settings){
      var element = $this[0];
      if ($.support.touch){
        $this.unbind('touchstart', settings.events.touchStart)
          .unbind('touchend', settings.events.inputEnd)
          .unbind('touchmove', settings.events.touchMove);
      } else {
        $this
          .unbind('mousedown', settings.events.inputDown)
          .unbind('mouseup', settings.events.inputEnd)
          .unbind('mousemove', settings.events.inputMove)
          .unbind('scroll', settings.events.scroll);
      }
      $this.unbind('click', settings.events.inputClick)
        .unbind('selectstart', selectStart); // prevent selection when dragging
      $this.unbind('dragstart', settings.events.dragStart);
    }

  };

  $.fn.kinetic = function (options){
    if (typeof options === 'string'){
      $.kinetic.Kinetic.prototype.callOption.apply(this, arguments);
    } else {
      return this.each(function (){
        new $.kinetic.Kinetic(this, options);
      });
    }
  };

}(window.jQuery || window.Zepto));

