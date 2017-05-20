(function() {
'use strict';
  
  // Constructor
  function Breakpoints(options) {
    this.options = Breakpoints.extend({}, Breakpoints.defaults, options);
    this.debug = {
      calls: 0, // Keep track of the number of times handleResize() is called for debugging.
    }
    
    this.currentBreakpoint = null;
    this.previousBreakpoint = null;
    this.handlers = {};
    
    // Sort the breakpoints in DESC order
    this.options.breakpoints = this.options.breakpoints.sort(function(a, b) {
      return (b-a);
    });
    
    // Create a name for each breakpoint handler.
    for (var i in this.options.breakpoints) {
      var breakpoint = this.options.breakpoints[i],
          eventName = 'breakpoint' + breakpoint;
          
      this.handlers['breakpoint' + breakpoint] = [];
    }
  }
  
  // Public
  Breakpoints.getDeviceWidth = function() {
    /**
     * Some libraries like jQuery and Google Publisher Tag uses a normalized document 
     * width excluding the scrollbar for cross browser support.
     *
     * This is not desirable when working with CSS media queries where the device width
     * is used.
     *
     * What we need to do is measure the viewport width instead.
     * .innerWidth - Used for more standards compliant browsers like FireFox and Chrome.
     * .clientWidth - Used for older versions of IE.
     *
     * If we drop support for IE9 and lower, we can use window.matchMedia() to be fully
     * consistent with CSS media queries.
     * https://developer.mozilla.org/en-US/docs/Web/API/Window.matchMedia
     */
    return window.innerWidth || (document.documentElement || document.body).clientWidth;
  };

  // Callback for window resize event.
  Breakpoints.prototype.handleResize = function() {
    this.debug.calls += 1;
    
    var width = Breakpoints.getDeviceWidth(),
        breakpoints = this.options.breakpoints;
    
    // Loop through and find out which breakpoint we're in.
    for (var i in breakpoints) {
      if (width >= breakpoints[i]) {
        this.currentBreakpoint = breakpoints[i];
        break;
      }
    }
    
    // Fire off the functions for this breakpoint.
    if (this.currentBreakpoint != this.previousBreakpoint) {
      this.previousBreakpoint = this.currentBreakpoint;
      this.fireBreakpoint('breakpoint' + this.currentBreakpoint);
    }
  };
  
  // Private
  Breakpoints.extend = function() {
    var args = Array.prototype.slice.call(arguments);
  
    function merge(target, obj) {
      if (typeof target === 'object' && typeof obj === 'object') {
        for (var key in obj) {
          if (obj.hasOwnProperty(key)) {
            target[key] = obj[key];
          }
        }
      }
  
      return target;
    }
  
    for (var i = 1, end = args.length; i < end; i++) {
      merge(args[0], args[i]);
    }
    return args[0];
  };
  
  // Public
  Breakpoints.prototype.addBreakpointHandler = 
  Breakpoints.prototype.addEventListener = function(event, fn) {
    this.handlers[event].push(fn);
  };
  
  Breakpoints.prototype.fireBreakpoint = function(event){
    var args = [].slice.call(arguments, 1), 
        callbacks = this.handlers[event];
  
    if (callbacks) {
      callbacks = callbacks.slice(0);
      for (var i = 0, len = callbacks.length; i < len; ++i) {
        callbacks[i].apply(this, args);
      }
    }
  };

  Breakpoints.defaults = {
    breakpoints: [0, 768, 992, 1200],
    timeout: false, // Store timeout id.
    delay: 50, // Time to wait before the resize event is stopped.
  };

  window.Breakpoints = Breakpoints;

})();

// Initilize Breakpoints object.
var bp = new Breakpoints();

// Attach resize listener to window
window.addEventListener('resize', function() {
  // Clear the timeout.
  clearTimeout(bp.options.timeout);
  
  // Start timeout to wait for resize event to stop.
  bp.options.timeout = setTimeout(function(){
    bp.handleResize();
  }, bp.options.delay);
});

bp.addBreakpointHandler('breakpoint0', function(){
  console.log('mobile');
});

bp.addBreakpointHandler('breakpoint768', function(){
  console.log('wide mobile, small tablet');
});

bp.addBreakpointHandler('breakpoint992', function(){
  console.log('wide tablet');
});

bp.addBreakpointHandler('breakpoint1200', function(){
  console.log('desktop');
});