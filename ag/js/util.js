(function() {
  window.util = {
    bind: function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    addClass: function(ele, classname) {
      if (!this.hasClass(ele, classname)) {
        ele.className += ' ' + classname;
      }
    },
    hasClass: function(ele, classname) {
      if (ele.className) {
        return ele.className.match(new RegExp('(\\s|^)' + classname + '(\\s|$)'));
      } else {
        return false;
      }
    },
    removeClass: function(ele, classname) {
      var cleaned = new RegExp(new RegExp('(\\s|^)' + classname + '(\\s|$)'));
      ele.className = ele.className.replace(cleaned, ' ');
			// added a space to workaround bug where: className 'a b c', remove 'b' => 'ac'
    },
    swapClass: function(ele, classname1, classname2) {
      var cleaned = new RegExp(new RegExp('(\\s|^)' + classname1 + '(\\s|$)'));
      
      if (this.hasClass(ele, classname1)) {
        ele.className = ele.className.replace(cleaned, ' ');
        ele.className += ' ' + classname2;
      }
    },
    toggleClass: function(ele, classname) {
      if (this.hasClass(ele, classname)) {
        this.removeClass(ele, classname);
      }
      else {
        this.addClass(ele, classname);
      }
    },
    createEl:function(type,attrs){
        var t=document.createElement(type);
        if(attrs){
            for(key in attrs){
                if(attrs.hasOwnProperty(key)){
                    if(key=="value"){
                        t.value=attrs[key];
                    }else if(key=="id"){
                        t.id=attrs[key];
                    }else{
                        t .setAttribute(key,attrs[key]);
                    }
                }
            }
        }
        return t;
    },
    // Wrapper to the iPlanner openPDF function that will monitor clicks
    openPDF: function(doc) {
      var path = 'content/pdf/' + doc;
      openPDF(path);
      cart.addPdf(doc);
      submitDocumentOpen(path, doc);
    },
    
    pauseMe : function(mills) {
      var date  = new Date();
      var cDate = null;
      
      do { 
        cDate = new Date(); 
      } while(cDate-date < mills);
    },
    // PPK script for getting position of element
    // http://www.quirksmode.org/js/findpos.html
    getPosition: function(ele) {
      var curleft = 0;
      var curtop = 0;
      if (ele.offsetParent) {
        do {
          curleft += ele.offsetLeft;
          curtop += ele.offsetTop;
        } while (ele = ele.offsetParent);
      }
      return [curleft,curtop];
    }
  };
})();

