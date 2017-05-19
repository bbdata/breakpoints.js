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
    
    // Sort the breakpoints in DESC order
    this.options.breakpoints = this.options.breakpoints.sort(function(a, b) { return (b-a); });
  }
  
  // Public
  Breakpoints.getDeviceWidth = function() {
    /**
     * Some libraries functions like jQuery.width() and those in Google Publisher Tag will return 
     * a normalized document width exclulding the scrollbar for cross browser support.
     *
     * This is not desirable when working with CSS media queries where the device width is used.
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
      //handle_breakpoints(window.current_breakpoint, previous_breakpoint);
      this.previousBreakpoint = this.currentBreakpoint;
console.log(this.currentBreakpoint);
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