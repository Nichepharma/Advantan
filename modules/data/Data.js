/**
 * AGNITIO FRAMEWORK MODULE - Data
 * This module will automatically log slide data to the Agnitio Analyzer.
 * It will look for the slide name in three places (not looking further when found):
 * - a global JavaScript object named monitormap,
 * - a data-monitor attribute on the slide (on the article tag)
 * - the actual slide id.
 * NOTE: this module will not fit all specifications for saving slide data
 * @author - Stefan Liden, sli@agnitio.com
 */
(function() {

  window.Data = function(monitoringEnabled) {
    var self = this;
    this.version = 'v1.0';
    this.monitoringEnabled = monitoringEnabled || true;
    window.monitoringEnabled = this.monitoringEnabled;
    if (this.monitoringEnabled && window.submitSlideEnter) {
      document.addEventListener('contentLoad', function(e) {
        this.removeEventListener('contentLoad', arguments.callee);
        if (!window.monitormap) { self._setSaveMethod(); }
        self.logSlides();
      });
    }
    else {
      console.log('Slide monitoring is turned off');
    }
  };

  Data.prototype = {
    // If a monitormap object is not available, then use either data-monitor attribute or slide id
    _setSaveMethod: function() {
      var firstSlide = document.querySelector('article'),
          attr = firstSlide.getAttribute('data-monitor');
      if (attr) {
        this.saveSlide = this._saveFromAttr;
      }
      else {
        this.saveSlide = this._saveFromId;
      }
    },
    // Saving from data-monitor attribute
    _saveFromAttr: function(slide) {
      var monitorStr = slide.getAttribute('data-monitor'),
          parentName = app.slideshow.id,
          grandparentName = 'Presentation';

      if (!monitorStr) { monitorStr = slide.id; }

      console.log('Saving: ' + monitorStr);
      window.submitSlideEnter(monitorStr, monitorStr, 1, parentName, grandparentName);
    },
    // Saving from slide id
    _saveFromId: function(slide) {
      var monitorStr = slide.id,
          parentName = app.slideshow.id,
          grandparentName = 'Presentation';

      console.log('Saving: ' + monitorStr);
      window.submitSlideEnter(monitorStr, monitorStr, 1, parentName, grandparentName);
    },
    // Default save, saving from monitormap object
    saveSlide: function(slide) {
      var monitorStr = window.monitormap.slides[slide.id] || slide.id,
          parentName = window.monitormap.slideshows[app.slideshow.id] || app.slideshow.id,
          grandparentName = window.monitormap.presentation || 'Presentation';

      console.log('Saving: ' + monitorStr);
      window.submitSlideEnter(monitorStr, monitorStr, 1, parentName, grandparentName);
    },
    // Log slides to analyzer when entering slides
    logSlides: function() {
      var save = this.saveSlide;
      document.addEventListener('slideEnter', function(e) {
         if(app.firstCollectionEnter) return
         save(e.target);   
      });
      document.addEventListener('inlineSlideEnter', function(e) {
        save(e.target);
      });
    }
  };

  /* DATA HELPER
   * Create timers for custom monitoring of i.e. popups
   * It is possible to start and stop individual timers repeatidly
   * @author Stefan Liden - sli@agnitio.com
   */
  Data.Timer = function() {
    this.time = 0;
    this.startTime = 0;
    this.endTime = 0;
    this.isActive = false;
  };

  Data.Timer.prototype = {
    start: function() {
      this.isActive = true;
      this.startTime = new Date().getTime();
    },
    stop: function() {
      this.endTime = new Date().getTime();
      // Make sure the timer is active before updating
      if (this.isActive) {
        this.isActive = false;
        var timediff = this.endTime - this.startTime;
        // Add current time-slot to previously recorded time
        this.time = this.time + timediff;
      }
    },
    reset: function() {
      this.isActive = false;
      this.time = 0;
    },
    // Return the timers time as hh:mm:ss
    toString: function() {
      return this.msToHours(this.time);
    },
    /************************************************************************
      Convert fra milliseconds to hh:mm:ss 
      By Mette Schmidt - Agnitio
     ************************************************************************/
    msToHours: function(ms) {

      ms = parseInt(ms, 10);
      
      var hh = Math.floor(ms / 3600000);
      var mm = Math.floor((ms - (hh * 3600000)) / 60000);
      var ss = parseInt(((ms - (hh * 3600000) - (mm * 60000)) / 1000), 10);

      hh = (hh < 10) ? "0" + hh : hh;
      mm = (mm < 10) ? "0" + mm : mm;
      ss = (ss < 10) ? "0" + ss : ss;
      
      return hh + ":" + mm + ":" + ss;
    }
  };

})();
