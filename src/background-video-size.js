/*
 * Background Video Size
 * 
 *
 * Copyright (c) 2014 Andy McCoy
 * Licensed under the MIT license.
 */

(function ($) {

  // Collection method.
  // $.fn.awesome = function () {
  //   return this.each(function (i) {
  //     // Do something awesome to each selected element.
  //     $(this).html('awesome' + i);
  //   });
  // };

  var animationFrame = (function(){
    return  window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            function( callback ){
              window.setTimeout(callback, 1000 / 60);
            };
  })();

  var makeOverflowWrapper = function(){
    return $('<div>')
    .addClass('big-video-wrapper')
    .css({
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      'z-index': 0
    });
  };

  var makeScalableWrapper = function(){
    return $("<div>")
    .addClass('big-video-scaleable-wrapper')
    .css({
      position: 'relative',
      width: '100%',
      height: '100%'
    });
  };

  // Static method.
  $.fn.backgroundVideo = function () {
    var self = this;
    this.$iframe = this;
    this.$body = $('body');
    this.$window = $(window);
    this.resized = false;
    this.bgVideoSize = {
      width: self.$iframe.width(),
      height: self.$iframe.height(),
    };
    this.vidAR = this.bgVideoSize.width / this.bgVideoSize.height;

    var makeIntrinsicWrapper = function(){
      return $('<div>')
      .addClass('big-video-intrinsic-wrapper')
      .css({
        position: 'relative',
        height: 0,
        'padding-bottom': (parseFloat(self.bgVideoSize.height/self.bgVideoSize.width, 10) * 100)+'%'
      });
    };

    var wrapIframe = function(){
      self.$iframe
        .wrap( makeOverflowWrapper() )
        .wrap( makeScalableWrapper() )
        .wrap( makeIntrinsicWrapper() )
        .css({
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%'
        });
      self.$scaleableWrapper = $('.big-video-scaleable-wrapper');
    };

    var resizeAction = function() {
      var win = {
        height  : self.$window.height(),
        width   : self.$window.width()
      };
        
      var winAR = win.width / win.height;
        
      if (win.width < self.bgVideoSize.width && win.height < self.bgVideoSize.height) {
            
      } else if (winAR < self.vidAR) { // Tall screen
        var vidWidth = win.height * self.vidAR;
        self.$scaleableWrapper
        .height(win.height)
        .width(vidWidth)
        .css({
          top: 0,
          left: '50%',
          'margin-top' : 0,
          'margin-left' : (vidWidth/2)*(-1)
        });
        } else if (winAR > self.vidAR) { // wide screen
          var vidHeight = win.width * (self.bgVideoSize.height / self.bgVideoSize.width);
          self.$scaleableWrapper
          .height(vidHeight)
          .width(win.width)
          .css({
            top: '50%',
            left: 0,
            'margin-top' : (vidHeight/2)*(-1),
            'margin-left' : 0
          });
        }
    };

    var setResizeFlag = function(){
      self.resized = true;
    };

    var animationLoop = function(){
      animationFrame(animationLoop);
      if(self.resized){
        resizeAction();
        self.resized = false;
      }
    };

    var attachListeners = function(){
      $(window).on('resize', setResizeFlag);
    };

    var init = function(){
      wrapIframe();
      resizeAction();
      attachListeners();
      animationLoop();
    };
    
    init();
    return this;
  };

}(jQuery));