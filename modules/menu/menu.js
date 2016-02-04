/**
 * AGNITIO FRAMEWORK MODULE - Menu
 * This is a slideshow/collection menu that will allow you to easily
 * link to all your slideshows, collections, and slides.
 * NOTE: There is no scrolling of menu currently included
 * @author - Stefan Liden, sli@agnitio.com
 */

(function() {

  /* CONSTRUCTOR
   * param id - string
   *   DOM id of element to append the menu to.
   * param menuItems - array
   *   An array of menu item objects. Each object contain title, goTo, and className (optional) properties.
   * param name - string
   *  Name of slideshow/collection. An optional parameter to use if menu is not global (entire presentation).
   * */
  window.Menu = function(id, menuItems, name) {
    this.version = 'v1.0';
    this.id = id;
    this.ele = document.getElementById(id);
    this.menuItems = menuItems;
    this.name = name || null;
    this.initialized = false;
    this._init();
    //this.hide();
  };

  Menu.prototype = {
    _init: function() {
      var self = this;
      // Initialize and/or insert menu when content is loaded
      document.addEventListener('contentLoad', function() {
        if (app.loaded.id === self.name || !self.name) {
          if (self.initialized) {
            //self._connect();
           // self._insert();
          }
          else {
            self.content = (app.loaded.type === 'slideshow' ? app.slideshows[self.name] : app.collections[self.name]);
            self._build();
            self._insert();
            self._connect();
            self.initialized = true;
          }
          if (app.loaded.type === 'slideshow') {
            document.addEventListener('slideEnter', function(event) {
              if (app.loaded.id === self.name || !self.name) {
                self._setCurrent();
              }
            });
          }
          else {
            document.addEventListener('sectionEnter', function(event) {
              if (app.loaded.id === self.name || !self.name) {
                self._setCurrent();
              }
            });
          }
        }
      });

      // If slideshow/collection specific menu, remove when content unloads
      document.addEventListener('contentUnload', function() {
        if (app.loaded.id === self.name) {
          self._remove();
        }
      });
    },

    // Create the HTML of the menu
    _build: function() {
      var self = this,
          markup = '<ul class="menu">';
      this.menuItems.forEach(function(item) {
        item.className = item.className || "";
        var li = '<li data-goto="' + item.goTo + '" class="' + item.className + '">' + item.title + '</li>';
        markup += li;
      });
      markup += '</ul>';
      this.markup = markup;
    },
    
    // Add markup to index page
    _insert: function() {
      this.ele.innerHTML = this.markup;
    },

    // Clean up if unloading
    _remove: function() {
      this.ele.removeEventListener(touchy.events.move, this._navigate);
      this.ele.innerHTML = '';
    },

    // Update menu item classes (remove and add .selected)
    // Break up data-goto attribute and use it to call app.goTo
    _navigate: function(event) {
      var ele = event.target;
      var prev, attr, linkArr, name, content, subcontent;
      if (ele.nodeType === 3) {
        ele = ele.parentNode;
      }
      prev = this.querySelector('.selected');
      attr = ele.getAttribute('data-goto');
      if (attr) {
        if (prev) { prev.setAttribute('class', ''); }
        linkArr = attr.split('.');
        name = linkArr[0];
        content = linkArr[1] || '';
        subcontent = linkArr[2] || '';
        ele.setAttribute('class', 'selected');
        app.goTo(name, content, subcontent);
      }
    },

    // Add internal event listeners
    _connect: function() {
      var self = this;
      //this.ele.addEventListener(touchy.events.move, this._navigate);
      /*var lt=new LongTouchHandler(this.ele,300);
                lt.onshort=function(){
                    this._navigate;
                };
                 //commented long tap on home button
               lt.onlong=function(){
                alert('aaa')
                };*/
    },

    // Called on 'slideEnter' or 'sectionEnter'
    _setCurrent: function() {
      var prev = this.ele.querySelector('.selected'),
          slide = this.content.getIndex() + 1,
          link = this.ele.querySelector('li:nth-child('+slide+')');
      if (prev) { prev.setAttribute('class', ''); }
      if (link) { link.setAttribute('class', 'selected'); }
    }/*,
    hide: function() {
        util.addClass(this.ele,'hidden');
    },
    show: function() {
        util.hasClass(this.ele,'hidden') && util.removeClass(this.ele,'hidden');

    }*/
  };

})();
