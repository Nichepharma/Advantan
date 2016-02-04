/**
 * BARISTA MODULE - Basic Menu with scrolling
 * This is a very basic section menu that automatically
 * links to all your sections.
 * Uses the section ids for links: slide-name -> Slide name
 * @author - Yarovuy Vitaliy, vitaliy.yxz@gmail.com
 * @author - Dmitriy Sokolov, xcdxster@gmail.com
 */
(function() {
    window.menuLoad = document.createEvent('UIEvents');
    menuLoad.initEvent('menuLoad', true, false);
    window.MenuWithScroll = function(id, menuItems, name) {
        this.version = 'v1.0';
        this.id = id;
        this.ele = document.getElementById(id);
        this.menuItems = menuItems;
        this.name = name || null;
        this.initialized = false;
        this._init();
    };
 MenuWithScroll.prototype._init= function() {
        var self = this;
        this._onContentLoad = function() {
                if (self.initialized) {
                    self._insert();
                }
                else {
                    self.slideshow = app.slideshows[self.ssName];
                    self._build();
                    self._insert();
                    self._navigate();
                    self.initialized = true;
                    self.show();
                    self.ele.dispatchEvent(menuLoad);
                    self._scrollToCurrent(self._getCurrent());
                }

        };
       // document.addEventListener('sectionEnter',function(){})
        this._onslideEnter=function() {self._setCurrent();};
        this._sectionEnter=function() {
            self._setCurrent();
            self._scrollToCurrent(self._getCurrent());
            if(app.collection.id!= "vert-magazine")
                self.show();
            else self.hide();
        };
        this._onResize=function(){
            setTimeout(function(){
                self.refresh();
                self._scrollToCurrent(self._getCurrent());
            },1500);};
        document.addEventListener('slideEnter',this._onslideEnter);
        document.addEventListener('sectionEnter',this._sectionEnter);
        document.addEventListener('contentLoad',this._onContentLoad);
        document.addEventListener('resize',this._onResize);
    };
    MenuWithScroll.prototype._build=function(){
        var markup=document.createElement("div"),
                ul=document.createElement("ul"),
                content="";
        markup.className="basicmenu-wrap";
        ul.className="basicmenu";
        this.menuItems.forEach(function(item) {
            item.className = item.className || "";
            var menuCaption,classHome;
            if(item.title=='home'){menuCaption='';classHome=' home';}else{menuCaption=item.title;classHome='';}
            var li = '<li' + classHome + '  data-goto="' + item.goto + '" class="' + item.className +'">' + menuCaption + '</li>';
            content += li;
        },this);
        ul.innerHTML=content;
        markup.appendChild(ul);
        this.markup = markup;
        this.scroll= new iScroll(ul, {bounce: false,hScrollbar: false,vScrollbar:false, bounceLock: true,momentum: false,desktopCompatibility: true, vScroll:false,hScroll:false/*,onScrollStart:function(){this.refresh()}*/,checkDOMChanges:true});
    };
    MenuWithScroll.prototype._insert=function() {
        this.ele.appendChild(this.markup);
        this.scroll.refresh();
        this.scroll.scrollTo(-this.ele.firstChild.firstChild.firstChild.clientWidth,0,0);
    };
    MenuWithScroll.prototype._remove=function(){
        try{
            this.ele.removeChild(this.markup);
        }catch(e){}
    };
    MenuWithScroll.prototype.refresh = function() {
       this.scroll.refresh();
    };
    /*    MenuWithScroll.prototype._itemTapListener = function() {
        var ele = event.target;
        var section = ele.getAttribute('data-section');
        app.collection.scrollTo(section);
    };*/
    MenuWithScroll.prototype._navigate = function() {
        var self = this;
        document.querySelectorAll('#mainmenu .basicmenu li').forEach(function(em){
            var lt=new LongTouchHandler(em,200);
            lt.onshort=function(){
                var ele = event.target;
                var prev, attr, linkArr, name, content, subcontent;
                
                try{ attr = ele.getAttribute('data-goto');}
                catch(e){ele=ele.parentNode;attr = ele.getAttribute('data-goto');}
                
                if (attr) {
                    if (prev) { prev.setAttribute('class', ''); }
                    linkArr = attr.split('.');
                    name = linkArr[0];
                    content = linkArr[1] || '';
                    subcontent = linkArr[2] || '';
                    app.goTo(name, content, subcontent);
                    self._setCurrent();
                    self._scrollToCurrent(ele);

                }
            };
            //commented long tap on home button
            lt.onlong=function(){
                var ele = event.target;
                if(ele){
                    try{if(ele.getAttribute('data-goto')=='home')app.searchMenu.show()}
                    catch(e){}
                }
            };
        })
        console.info('+ MenuWithScroll connected');
    };
    MenuWithScroll.prototype._setCurrent= function() {
        var prev = this.ele.querySelector('.selected'),
            link = this.ele.querySelector("[data-goto=\""+app.collection.id+"."+app.collection.current+"\"]");
        if (prev) { prev.setAttribute('class', ''); }
        if(link){link.setAttribute('class', 'selected');}
        if(this.ele.children[0].children[0].lastChild.getAttribute('data-goto')==app.collection.id){this.ele.children[0].children[0].lastChild.setAttribute('class', 'selected');}
    };
    MenuWithScroll.prototype._getCurrent= function() {
        var current_li;
        document.querySelectorAll('#mainmenu .basicmenu li').forEach(function(li){
            if(li.getAttribute('class') == 'selected') current_li= li;
        })
        return(current_li)
    };
    MenuWithScroll.prototype._scrollToCurrent= function(ele) {
        if(ele){

            if(-app.menu.scroll.x>ele.offsetLeft)
                app.menu.scroll.scrollTo(-ele.offsetLeft,0,"200ms")
            if(app.collection.slideWidth<ele.offsetLeft+ele.clientWidth+(-app.menu.scroll.x) && ele.offsetLeft+app.menu.scroll.x+ele.clientWidth>app.collection.slideWidth)
                if(ele.nextSibling) { app.menu.scroll.scrollTo(app.collection.slideWidth-ele.offsetLeft-ele.clientWidth-ele.nextSibling.clientWidth,0,"200ms")}
            else app.menu.scroll.scrollTo(app.collection.slideWidth-ele.offsetLeft-ele.clientWidth,0,"200ms");
        }
    };
    MenuWithScroll.prototype.hide = function(){
        util.addClass(this.ele,'hidden');
    };
    MenuWithScroll.prototype.show = function(){
        util.hasClass(this.ele,'hidden') && util.removeClass(this.ele,'hidden');
    };
    MenuWithScroll.prototype.toggle = function(){
        util.hasClass(this.ele,'hidden') ? util.removeClass(this.ele,'hidden'):util.addClass(this.ele,'hidden');
    };
    MenuWithScroll.prototype.destroy=function() {
        this.ele.removeChild(this.markup);
        document.removeEventListener('slideshowLoad',this._onslideshowLoad );
        document.removeEventListener('slideEnter',this._onslideEnter);
        document.removeEventListener('contentLoad',this._onContentLoad);
        document.removeEventListener('resize',this._onResize);
    };
})();