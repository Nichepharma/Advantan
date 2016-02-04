var thumbnels;
function Thumb()  {
    this.thumbButton = document.querySelector('.thumbButton');
    this.thumbs = document.querySelector('#thumbs');
    this.parent = document.querySelector('indicators');
    this.scroll;
    this.show_hide();
    //this.addIndicator();
    //  this.connectionScrol();
    var that = this;
    window.addEventListener('slideExit',function(){that.hide();});
    window.addEventListener('slideEnter',function(){that.activeIndicator();});
    window.addEventListener('slideshowLoad',function(){
        if(!util.hasClass(thumbButton,'th_show')){util.removeClass(thumbButton,'th_show');}
        that.removeIndicator();
        that.addIndicator();
    });
    window.addEventListener('slideshowUnload',function(){util.removeClass(thumbButton,'th_show'); });
    window.addEventListener('thumbLoad',function(){if(!util.hasClass(thumbButton,'th_show')){ util.addClass(thumbButton,'th_show')}});
};
Thumb.prototype.show_hide = function(){
    var that = this;

    this.thumbButton.addEventListener('tap',function(){
        if(!util.hasClass(that.thumbButton,'on')){
            util.addClass(that.thumbButton,'on');
            util.addClass(that.thumbs,'active');
        }
        else
        {
            that.hide();
        }
    });
}
Thumb.prototype.hide = function(){
    var that = this;
    if(util.hasClass(that.thumbButton,'on')){
        util.removeClass(that.thumbButton,'on');
        util.removeClass(that.thumbs,'active');
    }
}
Thumb.prototype.addIndicator = function(){
    for(i=0;i<app.slideshow.content.length; i++){
        var newEl = document.createElement('indicator');
        this.parent.appendChild(newEl);
    }
    this.activeIndicator();
}
Thumb.prototype.activeIndicator = function(){
    var indicator = this.parent.querySelectorAll('indicator');
    for(i=0;i<app.slideshow.content.length; i++){
        if(app.slideshow.current==app.slideshow.content[i]){util.addClass(indicator[i],'active');}
        else if(util.hasClass(indicator[i],'active')){util.removeClass(indicator[i],'active');}
    }
}
Thumb.prototype.removeIndicator = function(){
    var elem = this.parent.querySelectorAll('indicator');
    for(i=0;i<elem.length;i++){this.parent.removeChild(elem[i]);}
}
Thumb.prototype.connectionScrol = function(){
    this.scroll= new iScroll(this.thumbs.querySelector('ul'), {bounce: false,hScrollbar: false,vScrollbar:false, bounceLock: true,momentum: false,desktopCompatibility: true, vScroll:false,hScroll:false});
    this.scrollRef();
}
Thumb.prototype.scrollRef = function(){
    this.scroll.refresh();
}
var thumbButton  = document.querySelector('.thumbButton');

