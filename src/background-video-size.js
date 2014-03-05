/*
 * Background Video Size
 * 
 *
 * Copyright (c) 2014 Andy McCoy
 * Licensed under the MIT license.
 */

(function ($) {

  // Register Collection method with jquery
  $.fn.backgroundVideo = function (iframe) {
    return this.each(function () {
      return new BackgroundVideo($(this), iframe);
    });
  };

  // requestAnimationFrame shim thanks to Paul Irish
  var animationFrame = (function(){
    return  window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            function( callback ){
              window.setTimeout(callback, 1000 / 60);
            };
  })();

  // Wrapper to contain out work. It prevents
  // the background video from creating scrolls
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

  // This is the element that whose size is actually
  // adjusted. See makeIntrinsicWrapper to understand
  // why this container is necessary.
  var makeScalableWrapper = function(){
    return $("<div>")
    .addClass('big-video-scaleable-wrapper')
    .css({
      position: 'relative',
      width: '100%',
      height: '100%'
    });
  };

  // This container directly wraps the iframe. 
  // It maintains a constant aspect ratio and inherits
  // the width of its parent element.
  var makeIntrinsicWrapper = function(dimensions){
    return $('<div>')
    .addClass('big-video-intrinsic-wrapper')
    .css({
      position: 'relative',
      height: 0,
      'padding-bottom': (parseFloat(dimensions.height/dimensions.width, 10) * 100)+'%'
    });
  };

  // converts provided string into iframe
  var generateIframeFromString = function(url){
    var $template = $('<iframe width="420" height="315" frameborder="0" allowfullscreen></iframe>');
    var urls = {
      youtube : '//www.youtube.com/embed/'
    };

    if(url.match(/http|https|www/i)){
      $template.attr('src', url);
    }
    else{
      $template.attr('src', urls.youtube+url);
    }
    $('body').append($template);
    return $template;
  };

  // Detects if provided argument is a jQuery object
  // a DOM object, or a string (should be a URL)
  var getJqueryiframe = function(iframe){
    if(!iframe) { 
      throw 'Please provide a valid iframe, embed url or youtube video id';
    }
    if(iframe.jquery){ 
      return iframe;
    }
    else if(iframe.nodeType === 1){
      return $(iframe);
    }
    else if(typeof iframe === 'string'){
      return generateIframeFromString(iframe);
    }
    else{
      throw 'Please provide a valid iframe, embed url or youtube video id';
    }
  };

  // Constructor for background video
  var BackgroundVideo = function ($container, iframe) {
    var self = this;
    this.$iframe = getJqueryiframe(iframe);
    this.$container = $container;
    this.$window = $(window);
    this.resized = false;
    this.bgVideoSize = {
      width: self.$iframe.width(),
      height: self.$iframe.height(),
    };
    this.vidAR = this.bgVideoSize.width / this.bgVideoSize.height;

    // Adds the approriate wrapper elements to the iframe.
    // This adds the necessary style to iframe
    var wrapIframe = function(){
      self.$iframe
        .wrap( makeOverflowWrapper(self.bgVideoSize) )
        .wrap( makeScalableWrapper(self.bgVideoSize) )
        .wrap( makeIntrinsicWrapper(self.bgVideoSize) )
        .css({
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%'
        });
      self.$scaleableWrapper = $('.big-video-scaleable-wrapper');
    };

    // This is where the magis happens. It contains the 
    // logic for calculating and sizing the iframe.
    var resizeAction = function() {
      var win = {
        height  : self.$window.height(),
        width   : self.$window.width()
      };
        
      var winAR = win.width / win.height;
        
      //if (win.width < self.bgVideoSize.width && win.height < self.bgVideoSize.height) {
        
      if (winAR < self.vidAR) { // Tall screen
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

    // a setter method of my resize flag. 
    var setResizeFlag = function(flag){
      self.resized = flag;
    };

    // animation loop that checks if a resize event occured
    var animationLoop = function(){
      animationFrame(animationLoop);
      if(self.resized){
        resizeAction();
        setResizeFlag(false);
      }
    };

    // attaches the resize event listener.
    // maybe others to come.
    var attachListeners = function(){
      $(window).on('resize', function(){
        setResizeFlag(true);
      });
    };

    // Initialize function called at instantiation
    (function(){ 
      wrapIframe();
      resizeAction();
      attachListeners();
      animationLoop();
    })();
    
    // returns the constructor
    return this;
  };

}(jQuery));