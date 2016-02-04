/**
 * BARISTA MODULE - Basic Menu
 * This is a very basic section menu that automatically
 * links to all your sections.
 * Uses the section ids for links: slide-name -> Slide name
 * @author - Stefan Liden, stefan.liden@gmail.com
 */

(function() {

  window.BasicCollectionMenu = function(id, collection) {
    this.id = id;
    this.ele = document.getElementById(id);
    this.collectionId = collection;
    this.initialized = false;
    this._init();
  };

  BasicCollectionMenu.prototype = {
    _init: function() {
      var self = this;
      document.addEventListener('collectionLoad', function() {
        if (app.collection.id === self.collectionId) {
          if (self.initialized) {
            console.log('Inserting menu');
            self._insert();
          }
          else {
            self.collection = app.collections[self.collectionId];
            self._build();
            self._insert();
            self._connect();
            self.initialized = true;
          }
        }
      });

      document.addEventListener('collectionUnload', function() {
        if (app.collection.id === self.collectionId) {
          console.log('Unloading collection: ' + self.collectionId);
          self._remove();
          self.initialized = false;
        }
      }, false);
    },

    _build: function() {
      var self = this,
          markup = '<ul class="basicmenu">';
      this.collection.content.forEach(function(section) {
        var name = self._createTitle(section);
        markup += '<li data-section="' + section + '">' + name + '</li>';
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
        var section = ele.getAttribute('data-section');
        app.collection.scrollTo(section);
      }, false);
      // Listening to 'slideEnter' to set selected item
      // 'slideEnter is dispatched from slideshow._scroll
      document.addEventListener('sectionEnter', function() {
      	if (app.collection.id === self.collectionId) {
          self._setCurrent();
      	}
      }, false);
      console.info('+ BasicCollectionMenu connected');
    },

    // Called on 'slideEnter'
    _setCurrent: function() {
      var prev = this.ele.querySelector('.selected'),
          section = this.collection.getIndex() + 1,
          link = this.ele.querySelector('li:nth-child('+section+')');
      if (prev) { prev.setAttribute('class', ''); }
      link.setAttribute('class', 'selected');
    },

    _createTitle: function(section) {
      // TODO: replace _-. with a space
      return section[0].toUpperCase() + section.slice(1);
    }
  };

})();
