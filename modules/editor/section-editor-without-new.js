(function(){
    window.PresentationEditor=function(element,model,options){
        this.element=element;
        this.model=model;
        options=options||{};
        options.dragOptions=options.dragOptions||{offset:new Point(0,82),initPosition:new Point(56,0)/*Point(370,104)*/};
        this.options=options;
        this._init();
    };
    PresentationEditor.prototype={
        _init:function(){
            var that=this;
            this.dragSlideShows=new DragAreaListDynamic(this.element,this.model.slideshows.filter(function(slideshow){ return !slideshow.notMove;}).map(function(slideshow){
                var el= util.createEl("div",{"class":"drag-chapter","slideshow":slideshow.id});
                var remove = util.createEl("a",{"href":"#","class":"remove "+((slideshow.active==undefined ||slideshow.active)?"active":"")});
                remove.addEventListener(touchy.events.start,function(e){
                    e.preventDefault();
                    util.toggleClass(this,"active");
                });
                el.appendChild(remove);
                var tittle =  document.createElement("span");
                tittle.innerHTML=slideshow.name;
                el.appendChild(tittle);
                return el;
            },this),this.options.dragOptions);
        },
        synchronize:function(){
            this.dragSlideShows.sort();
            var i=0;
            this.model.slideshows=this.model.slideshows.map(function(slideshow){
                if(slideshow.notMove){
                    return slideshow;
                }
                else{
                    var dragObj=this.dragSlideShows.dragObjs[i];
                    var index=this.model.slideshows.getFirstIndexOf(function(sh){ return sh.id==dragObj.el.getAttribute("slideshow")});
                    i++;
                    if(index!=-1){
                        var section = this.model.slideshows[index];
                        return section;
                    }
                    else{alert("it's never been happened");}
                }
            },this);
        }
    };
})();
