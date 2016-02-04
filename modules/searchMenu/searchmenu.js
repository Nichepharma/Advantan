/**
 * BARISTA MODULE - Basic Menu with scrolling
 * This is a very basic section menu that automatically
 * links to all your sections.
 * Uses the section ids for links: slide-name -> Slide name
 * @author - Dmitriy Sokolov, xcdxster@gmail.com
 */

(function() {

    window.SearchMenu = function(id, menuItems,slideId) {
        this.version = 'v1.0';
        this.id = id;
        this.slideId = slideId;
        this.ele = document.getElementById(id);
        this.menuItems = menuItems;
        this.initialized = false;
        this._init();
        //this.hide();
    };
    SearchMenu.prototype._init= function() {
        var self = this;
        document.addEventListener('slideshowLoad', function() {
            if (app.slideshow.id === self.ssName || !self.ssName) {
                if (self.initialized) {
                    // console.log('Inserting menu');
                    self._insert_search_menu();
                }
                else {
                    self.slideshow = app.slideshows[self.ssName];
                    self._build_search_menu();
                    self._insert_search_menu();
                    self._connect_search_menu();
                    self.hide();
                    self.initialized = true;
                }
            }
        });
    };
    SearchMenu.prototype._build_search_menu=function(){
        var markup=document.createElement("div"),
                ul=document.createElement("ul"),
                content="";
        markup.className="searchMenu-wrap";
        ul.className="basicSearchMenu";
        for(var sections in this.menuItems) {
            for(var slide_number in this.menuItems[sections].slides){
                if(parseInt(slide_number) || slide_number== 0){
                    var slide_name;
                 for(var number in this.slideId){
                    if (this.slideId[number].id==this.menuItems[sections].slides[slide_number]){slide_name=this.slideId[number].name}
                 }
                 if(slide_name){
                     var li = '<li data-goto="' + this.menuItems[sections].section +'.'+this.menuItems[sections].slides[slide_number] + '">'+'<img src="content/img/thumbs/'+ this.menuItems[sections].slides[slide_number]+'.jpg">' +'<h1>'+ slide_name+'</h1>' +'</li>';
                     content += li;
                 }
                }
            }

        }
        ul.innerHTML=content;
        markup.appendChild(ul);
        this.markup = markup;
        this.scroll= new iScroll(ul, {bounce: false,hScrollbar: false,vScrollbar:false, bounceLock: true,momentum: false,desktopCompatibility: true, vScroll:false,hScroll:false/*,onScrollStart:function(){this.refresh()}*/});
        this.markup.addEventListener('click',this._navigate);
        document.querySelector('#mainmenu .basicmenu li[data-goto="home"]').addEventListener('longTouch',function(){SearchMenu.prototype.show()})
        document.getElementById('searchmenu_close').addEventListener('click',function(){SearchMenu.prototype.hide()})
    };
    SearchMenu.prototype._insert_search_menu=function() {
        this.ele.appendChild(this.markup);
        this.scroll.refresh();
    };
    SearchMenu.prototype._remove=function(){
        try{
            this.ele.removeChild(this.markup);
        }catch(e){}
    };
    SearchMenu.prototype._connect_search_menu = function() {
      var self = this;
      this.ele.addEventListener('tap', function(event) {
        var ele = event.target;
        var section = ele.getAttribute('data-section');
        app.collection.scrollTo(section);
      }, false);
    };
    SearchMenu.prototype._setCurrent= function(){
        var prev = this.ele.querySelector('.selected'),
                slide = app.slideshowIds.indexOf(app.slideshow.id) + 1,
                link = this.ele.querySelector('li:nth-child('+slide+')');
        if (prev) { prev.setAttribute('class', ''); }
        link.setAttribute('class', 'selected');
    };
    SearchMenu.prototype.show= function() {
       document.getElementById('searchmenu').style.display = "block"
       document.getElementById('searchmenu_close').style.pointerEvents = "auto"

    };
    SearchMenu.prototype.hide= function() {
        document.getElementById('searchmenu').style.display = "none"
        document.getElementById('searchmenu_close').style.pointerEvents = "none"
    };
    SearchMenu.prototype._navigate= function() {
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
    };
    SearchMenu.prototype.destroy= function() {
        if(this._connectListener){this.ele.removeEventListener('tap',this._connectListener, false);};
        document.removeEventListener('slideshowLoad',this._onslideshowLoad);
        document.removeEventListener('slideshowUnload',this._onslideshowUnload, false);
        document.removeEventListener('slideEnter',this._onslideEnter , false);
    };
})();