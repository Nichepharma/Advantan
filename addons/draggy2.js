(function() {
  var d = document,
      isTouch = 'ontouchstart' in window,
      mouseEvents = {
        start: 'mousedown',
        move: 'mousemove',
        end: 'mouseup'        
      }
      touchEvents = {
        start: 'touchstart',
        move: 'touchmove',
        end: 'touchend'
      },
      events = isTouch ? touchEvents : mouseEvents;

  window.onDrag = document.createEvent('UIEvents');
  window.onDrop = document.createEvent('UIEvents');
  onDrag.initEvent('onDrag', true, true);
  onDrop.initEvent('onDrop', true, true);


  window.Draggy2 = function(id, onChange, config) {
    this.id = id;
    this.onChange = onChange || function() {};
    this.config = config || {};
    this.position = [0,0];
    this.init();
  };

  Draggy2.prototype = {
    init: function() {
      this.ele = (typeof this.id === 'string' ? d.getElementById(this.id) : this.id);
      this.ele.draggy = this;
      this.ele.onChange = this.onChange;
      this.ele.position = this.position || [0, 0];
      this.ele.restrictX = this.config.restrictX || false;
      this.ele.restrictY = this.config.restrictY || false;
      this.ele.limitsX = this.config.limitsX || [-9999, 9999];
      this.ele.limitsY = this.config.limitsY || [-9999, 9999];
      this.enable();
    },
    reInit: function() {
      this.ele = (typeof this.id === 'string' ? d.getElementById(this.id) : this.id);
      this.ele.draggy = this;
      this.ele.onChange = this.onChange;
      this.ele.position = this.position || [0, 0];
      this.ele.restrictX = this.config.restrictX || false;
      this.ele.restrictY = this.config.restrictY || false;
      this.ele.limitsX = this.config.limitsX || [-9999, 9999];
      this.ele.limitsY = this.config.limitsY || [-9999, 9999];
      this.enable();
      this.moveTo(this.ele.position[0], this.ele.position[1]);
    },
    disable: function() {
      this.ele.removeEventListener(events.start, this.dragStart);
    },
    enable: function() {
      this.ele.addEventListener(events.start, this.dragStart);
    },
    dragStart: function(e) {
      var restrictX = this.restrictX;
      var restrictY = this.restrictY;
      var limitsX = this.limitsX;
      var limitsY = this.limitsY;
      var relativeX = this.position[0];
      var relativeY = this.position[1];
      var posX = isTouch ? e.touches[0].pageX : e.clientX;
      var posY = isTouch ? e.touches[0].pageY : e.clientY;
      var newX, newY;
      var self = this; // The DOM element

      util.addClass(this, 'activeDrag');
      d.body.style.webkitUserSelect = 'none';

      d.addEventListener(events.move, dragMove);
      d.addEventListener(events.end, dragEnd);

      function dragMove (e) {
        e.preventDefault();
        var movedX, movedY, relX, relY;
        var clientX = isTouch ? e.touches[0].pageX : e.clientX;
        var clientY = isTouch ? e.touches[0].pageY : e.clientY;
        if (!restrictX) {
          // Mouse movement (x axis) in px
          movedX = clientX - posX;
          // New pixel value (x axis) of element
          newX = relativeX + movedX;
          if (newX >= limitsX[0] && newX <= limitsX[1]) {
            posX = clientX;
            relativeX = newX;
          }
        }
        if (!restrictY) {
          movedY = clientY - posY;
          newY = relativeY + movedY;
          if (newY >= limitsY[0] && newY <= limitsY[1]) {
            posY = clientY;
            relativeY = newY;
          }
        }
        self.position = [relativeX, relativeY];
        self.style.cssText = '-webkit-transform:translate3d(' + relativeX + 'px,' + relativeY + 'px, 0);';
        self.onChange(relativeX, relativeY);
        self.dispatchEvent(onDrag);
      }

      function dragEnd (e) {
        self.pointerPosition = [posX, posY];
        self.draggy.position = self.position;
        util.removeClass(self.draggy.ele, 'activeDrag');
        d.body.style.webkitUserSelect = '';
        self.dispatchEvent(onDrop);
        d.removeEventListener(events.move, dragMove);
        d.removeEventListener(events.end, dragEnd);
      }

    },

    moveTo: function(x,y) {
      this.ele.style.cssText = '-webkit-transform:translate3d(' + x + 'px,' + y + 'px, 0);';
      this.ele.position = this.position = [x,y];
    },

    reset: function() {
      this.ele.style.cssText = '-webkit-transform:translate3d(0, 0, 0);';
      this.ele.position = [0,0];
    }
  };

  window.DropZones = function(dropIds) {
    this.dropIds = dropIds;
    this.storage = [];
    this.init();
  };

  DropZones.prototype = {
    init: function() {
      var self = this; 
      this.dropObjects = [];
      this.zoneLimits = [];
      this.dropIds.forEach(function(id) {
        var zone = {};
        var ele = document.getElementById(id);
        var width = ele.offsetWidth;
        var height = ele.offsetHeight;
        zone.dragObject = null;
        zone.ele = ele;
        zone.position = util.getPosition(ele);
        zone.limit = [zone.position[0], zone.position[0] + width, zone.position[1], zone.position[1] + height];
        self.dropObjects.push(zone);
        self.zoneLimits.push(zone.limit);
      });
    },
    attach: function(dragObject, dropZone) {
      var obj = this.dropObjects[dropZone];
      var label = dragObject.ele.innerText;
      var slideshow = dragObject.ele.getAttribute('data-slideshow');
      // Check if the zone already has an object attached
      if (obj.dragObject) {
        obj.dragObject.reset();
        util.removeClass(obj.dragObject.ele, 'invisible');
      }
      // Attach the dragObject to the dropZone
      obj.dragObject = dragObject;
      this.storage[dropZone] = dragObject;
      util.addClass(dragObject.ele, 'invisible');
      obj.ele.innerHTML = label;
      obj.ele.setAttribute('data-slideshow', slideshow);
    },
    // Update from storage
    update: function() {
      var self = this;
      this.storage.forEach(function(obj, index) {
        if (obj) {
          self.attach(obj, index);
        }
      });
    },
    isInZone: function(x, y) {
      var zone = -1;
      this.zoneLimits.forEach(function(limit, index) {
        if (x > limit[0] && x < limit[1]) {
          if (y > limit[2] && y < limit[3]) {
            zone = index;
          }
        }
      });
      return zone;
    }
  };


})();
