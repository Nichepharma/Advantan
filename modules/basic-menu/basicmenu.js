/**
 * AMP MODULE - Basic Menu
 * This is a very basic slide menu that automatically
 * links to all your slides.
 * Uses the slide ids for links: slide-name -> Slide name
 * @author - Stefan Liden, stefan.liden@gmail.com
 */

(function() {

  window.BasicMenu = function(id, slideshow) {
    this.id = id;
    this.ele = document.getElementById(id);
    this.ssName = slideshow;
    this.initialized = false;
    this._init();
  };

  BasicMenu.prototype = {
    _init: function() {
      var self = this;
      document.addEventListener('slideshowLoad', function() {
        if (app.slideshow.id === self.ssName) {
          if (self.initialized) {
            console.log('Inserting menu');
            self._insert();
          }
          else {
            self.slideshow = app.slideshows[self.ssName];
            self._build();
            self._insert();
            self._connect();
            self.initialized = true;
          }
        }
      });

      document.addEventListener('slideshowUnload', function() {
        if (app.slideshow.id === self.ssName) {
          console.log('Unloading slideshow: ' + app.slideshow.id);
          self._remove();
        }
      }, false);
    },

    _build: function() {
      var self = this,
          markup = '<ul class="basicmenu">';
      this.slideshow.content.forEach(function(slide) {
        var name = self._createTitle(slide);
        markup += '<li data-slide="' + slide + '">' + name + '</li>';
      });
      markup += '</ul>';
      this.markup = markup;
    },
    
    _insert: function() {
      this.ele.innerHTML = this.markup;
    },

    _remove: function() {
      this.ele.innerHTML = '';
    },

    _connect: function() {
      var self = this;
      this.ele.addEventListener('tap', function(event) {
        var ele = event.target;
        var slide = ele.getAttribute('data-slide');
        app.slideshow.scrollTo(slide);
      }, false);
      // Listening to 'slideEnter' to set selected item
      // 'slideEnter is dispatched from slideshow._scroll
      document.addEventListener('slideEnter', function() {
      	if (app.slideshow.id === self.ssName) {
          self._setCurrent();
      	}
      }, false);
      console.info('+ BasicMenu connected');
    },

    // Called on 'slideEnter'
    _setCurrent: function() {
      var prev = this.ele.querySelector('.selected'),
          slide = this.slideshow.getIndex() + 1,
          link = this.ele.querySelector('li:nth-child('+slide+')');
      if (prev) { prev.setAttribute('class', ''); }
      link.setAttribute('class', 'selected');
    },

    _createTitle: function(slide) {
      // TODO: replace _-. with a space
      return slide[0].toUpperCase() + slide.slice(1);
    }
  };

})();
