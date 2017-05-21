(function() {
'use strict';
  
  // Constructor
  function Breakpoints(config, queued) {
    var variableName = config.variableName;

    if (typeof variableName !== 'string' && !variableName.length) {
      throw new Error('Missing variableName.');
    }
    
    this.config = Breakpoints.extend({}, Breakpoints.defaults, config);
    this.currentBreakpoint = null;
    this.previousBreakpoint = null;
    this.handlers = {};
    
    // Backup the existing queue of functions.
    this.q = queued;
    
    this.debug = {
      calls: 0, // Keep track of the number of times handleBreakpoint() is called for debugging.
    }
    
    // Sort the breakpoints in DESC order.
    this.config.breakpoints = this.config.breakpoints.sort(function(a, b) {
      return (b-a);
    });
    
    // Create name for each breakpoint handler.
    for (var i in this.config.breakpoints) {
      var breakpoint = this.config.breakpoints[i],
          handlerName = variableName + breakpoint;
      
      this.handlers[handlerName] = [];
    }
  }
  
  // Initialization
  Breakpoints.prototype.init = function() {
    // Backup the existing queue of functions.
    var queued = this.q;

    // Replace the push function with one that executes the function passed to it.
    this.q.push = function () {
      for (var i = 0; i < arguments.length; i++) {
        try {
          if (typeof arguments[i] === "function") {
            arguments[i]();
          }
          else {
            // What to do when given something not a function.
          }
        }
        catch (e) {
          // Error handling.
        }
      }
    }
    
    // Execute all the queued functions.
    // apply() turns the array into individual arguments.
    this.q.push.apply(this.q, queued);

    var variableName = this.config.variableName;
    
    // Attach resize listener to window.
    window.addEventListener('resize', function() {
      // Clear the timeout.
      clearTimeout(window[variableName].config.timeout);
      
      // Start timeout to wait for resize event to stop.
      window[variableName].config.timeout = setTimeout(function(){
        window[variableName].handleBreakpoint();
      }, window[variableName].config.delay);
    });
  }

  // Callback for window resize event.
  Breakpoints.prototype.handleBreakpoint = function() {
    this.debug.calls += 1;

    var width = Breakpoints.getDeviceWidth(),
        breakpoints = this.config.breakpoints;

    // Find which breakpoint we're in.
    for (var i in breakpoints) {
      if (width >= breakpoints[i]) {
        this.currentBreakpoint = breakpoints[i];
        break;
      }
    }

    // Fire off the handler for this breakpoint.
    if (this.currentBreakpoint != this.previousBreakpoint) {
      this.fireBreakpoint(this.config.variableName + this.currentBreakpoint);
      this.previousBreakpoint = this.currentBreakpoint;
    }
  };
  
  // Method to add breakpoint handlers.
  Breakpoints.prototype.addBreakpointHandler = 
  Breakpoints.prototype.addEventListener = function(event, fn) {
    this.handlers[event].push(fn);
  };
  
  // Method to fire breakpoint handlers.
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

  // Default config
  Breakpoints.defaults = {
    breakpoints: [0, 768, 992, 1200],
    // Strng name of the variable that will store Breakpoints. This is used
    // during initialization so windows.onResize can find where Breakpoints
    // is without having to hardcode it into the object. Responsibility
    // goes to where Breakpoints is implemented.
    variableName: null,
    // Store timeout id.
    timeout: false,
    // Time to wait before the resize event is stopped.
    delay: 50,
  };
  
  // Private
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

  window.Breakpoints = Breakpoints;
})();