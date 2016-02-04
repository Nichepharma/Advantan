function presentationView(options){
    this.options=options;
    this.enableState='';
    this.buttons = document.querySelectorAll('#g_3 button');
    this.scrollElement = document.querySelector('#g_3 .cont_scroll ul');
    (this.scrollElement.querySelectorAll('li').length!=0) && (this.signsPresentation = this.scrollElement.querySelectorAll('li'));
    this.init();
};
presentationView.prototype.init = function(){
    var that = this;
    var pr = app.presentationsStorage.getNames();
    pr.forEach(function(label,i){
        var newLi = util.createEl("li",{"index":i});
        var title = document.createElement('name');
        title.innerText = label;
        newLi.appendChild(title);
        this.scrollElement.appendChild(newLi);
        newLi.addEventListener('click',function(){
            if(that.scrollElement.querySelector("li[marked]")) {
                if(that.scrollElement.querySelector("li[marked]")!=this){
                    that.scrollElement.querySelector("li[marked]").removeAttribute('marked');
                    this.setAttribute('marked','');
                }
                else {this.removeAttribute('marked');}
            }
     //   that.scrollElement.querySelector("li[marked]") && that.scrollElement.querySelector("li[marked]").removeAttribute('marked');
            else {this.setAttribute('marked','');}
        });
    },this);

    var Sc = new iScroll(this.scrollElement, {bounce: false,hScrollbar: false,vScrollbar:false, bounceLock: true,momentum: false,desktopCompatibility: true, vScroll:false,hScroll:false});
    Sc.refresh();
    this.buttons[1].addEventListener('tap',function(){
        if(that.scrollElement.querySelector("li[marked]")){
            var li = that.scrollElement.querySelector("li[marked]");
            that.scrollElement.removeChild(li);
            app.presentationsStorage.remove(li.getAttribute('index'));
        }
    });
    this.buttons[0].addEventListener('tap',function(){
        if(that.scrollElement.querySelector("li[marked]")){
            var li = that.scrollElement.querySelector("li[marked]");
            that.options.onEdit(li.getAttribute('index'));
        }
    });
    this.buttons[2].addEventListener('tap',function(){
        if(that.scrollElement.querySelector("li[marked]")){
            var li = that.scrollElement.querySelector("li[marked]");
            builder.build(app.presentationsStorage.get(li.getAttribute('index')));
        }
    });
}

