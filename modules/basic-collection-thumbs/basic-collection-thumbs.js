/**
* AMP MODULE - Basic Thumbs
 * This is a very basic slide thumb menu that automatically
 * links to all your slides.
 * If using images, place them in content/img/thumbs
 * @author - Stefan Liden, stefan.liden@gmail.com
 */

(function() {

  // TODO: remove this ugly hack and bind events properly
  var self = null;

  window.BasicCollectionThumbs = function(id, collection, hasImages) {
    self = this;
    this.id = id;
    this.ele = document.getElementById(id);
    this.hasImages = hasImages || false;
    this.coName = collection;
    this.initialized = false;
    this._init();
  };

  BasicCollectionThumbs.prototype = {
    _init: function() {
      // var self = this;
      document.addEventListener('collectionLoad', function() {
        if (app.collection.id === self.coName) {
          if (self.initialized) {
            // self._insert();
          }
          else {
            self.collection = app.collections[self.coName];
            self.slideshows = app.collection.content;
            self._build();
            // self._insert();
            self._connect();
            self.initialized = true;
          }
          document.addEventListener('sectionEnter', self._updateThumbs);
          document.addEventListener('slideEnter', self._setCurrent);
        }
      });

      document.addEventListener('collectionUnload', function() {
        if (app.collection.id === self.coName) {
          console.log('Unloading collection: ' + app.collection.id);
          self._remove();
          self.initialized = false;
          document.removeEventListener('slideEnter', self._setCurrent);
        }
      }, false);
      // Listening to 'slideEnter' to set selected item
      // 'slideEnter is dispatched from slideshow._scroll
      // document.addEventListener('slideEnter', function() {
      //   if (app.collection.id === self.coName) {
      //     setTimeout(function() {
      //       self._setCurrent();
      //     },0);
      //   }
      // }, false);
    },
    
    // Create the markup to be inserted for the thumbs
    _build: function() {
      // var self = this;
      this.slideshows.forEach(function(slideshow) {
        self[slideshow] = {};
        self[slideshow].markup = '';
        var ss = app.slideshows[slideshow];
        var ele = ss.ele;
        var markup = '<ul class="basicthumbs">';
        ss.content.forEach(function(slide) {
          var name, thumb;
          if (self.hasImages) {
            thumb = '<img src="content/img/thumbs/'+slide+'.jpg" data-slide="' + slide + '" alt="'+slide+'" />'
          }
          else {
            thumb = '<div class="thumbindicator" data-slide="' + slide + '"></div>';
          }
          markup += '<li>'+thumb+'</li>';
        });
        markup += '</ul>';
        self.markup = markup;
        self[slideshow].markup = markup;
      });
    },
    
    _insert: function(ss) {
      this.ele.innerHTML = this[ss].markup;
    },

    _remove: function() {
      this.ele.innerHTML = '';
    },    

    // Connect the thumbs to the slideshow.scrollTo method
    _connect: function(ele) {
      var self = this;
      this.ele.addEventListener('tap', function(event) {
        var target = event.target;
        var slide = target.getAttribute('data-slide');
        app.slideshow.scrollTo(slide);
      }, false);
      console.info('+ BasicCollectionThumbs connected');
    },

    // Called on 'slideEnter'
    _setCurrent: function() {
      var prev = self.ele.querySelector('.selected'),
          slide = app.slideshow.getIndex() + 1,
          link = self.ele.querySelector('li:nth-child('+slide+')');
      if (prev) { prev.setAttribute('class', ''); }
      link.setAttribute('class', 'selected');
    },

    _updateThumbs: function(e) {
      var slideshow = app.slideshow.id;
      console.log(self[slideshow]);
      self._insert(slideshow);
    },

    _createTitle: function(slide) {
      // TODO: replace _-. with a space
      return slide[0].toUpperCase() + slide.slice(1);
    }
  };

})();
