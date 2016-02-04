/**
* AMP MODULE - Basic Thumbs
 * This is extended thumbnails
 * @author - Dmitriy Sokolov, xcdxster@gmail.com
 */

(function() {

    window.BasicCollectionThumbsScroll = function(id, collection) {
        BasicCollectionThumbsScroll.superclass.constructor.call(this,id, collection);
    };
    extend(BasicCollectionThumbsScroll,BasicThumbs);
    BasicCollectionThumbsScroll.prototype._build=function(){
        var markup=document.createElement("div"),
                ul=document.createElement("ul"),
                content="";
        markup.className="basicmenu-wrap";
        ul.className="basicmenu";
        this.collection.content.forEach(function(section) {
            var name = this._createTitle(section);
            content += '<li data-section="' + section + '">' + name + '</li>';
        },this);
        ul.innerHTML=content;
        markup.appendChild(ul);
        this.markup = markup;
        this.scroll= new iScroll(ul, {bounce: false,hScrollbar: false,vScrollbar:false, bounceLock: true,momentum: false,desktopCompatibility: true, vScroll:false,hScroll:false/*,onScrollStart:function(){this.refresh()}*/});
        this.markup.addEventListener('click',this._itemTapListener);
    };
    BasicCollectionThumbsScroll.prototype._insert=function() {
        this.ele.appendChild(this.markup);
        this.scroll.refresh();
    };
    BasicCollectionThumbsScroll.prototype._remove=function(){
        try{
            this.ele.removeChild(this.markup);
        }catch(e){}
    };
    BasicCollectionThumbsScroll.prototype._itemTapListener = function() {
        var ele = event.target;
        var section = ele.getAttribute('data-section');
        app.collection.scrollTo(section);
    };

})();
