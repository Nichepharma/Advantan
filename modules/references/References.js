/* Barista Simple Reference Module
 * TODO: Build reference module using JSON and arrays to
 * dynamically build the reference list.
 * */
(function() {
  window.References = function(id) {
    this.id = id;
    this.ele = app.elements.references = document.getElementById(id);
    this.current = '';
    this.previous = '';
    this.markup = '';
    this.init();
  };

  References.prototype = {
    init: function() {
      var self = this;
      document.addEventListener('slideEnter', function() {self.set(app.slideshow.current)});
      this.ele.addEventListener('tap', function(e) {
        self.clickHandler(e.target);
      });
    },
    clickHandler: function(ele) {
      // TODO: add a check to make sure it is a reference linked we have clicked
      var file = ele.getAttribute('data-reference');
      if (!file) {
        file = ele.parent.getAttribute('data-reference');
      }
      this.open(file);
    },
    get: function() {
      var self = this,
          current = this.current;

      if (current) {
        app.getHtml(current, 'content/references/', function(data) {
          self.markup = data;
        });
      }
    },
    open: function(file) {
      console.log('Opening file: ' + file);
      if (typeof openPDF !== 'undefined') {
        openPDF('pdfs/' + file);
      }
    },
    reset: function() {
      this.current = '';
      this.ele.innerHTML = '';
    },
    set: function(name) {
      var name = name || app.slideshow.current;
      this.previous = this.current;
      this.current = name;
    },
    unset: function() {
      if (this.previous) {
        this.current = this.previous;
      }
    },
    insert: function() {
      this.get();
      this.ele.innerHTML = this.markup;
    },
    update: function() {
    }
  };
})();
