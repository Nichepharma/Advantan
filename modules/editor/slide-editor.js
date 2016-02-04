(function(){
    var slides=['s_1','s_1_0','s_2_0','s_3_4','s_3_2','s_4_1','s_12','s_6_0','s_6_2','EF_subanalysis'];
    /***********/
    window.SlideshowEditor =function(element,slideHolder,slideShowsHolder,model){
        app.slideshowEditor=this;
        this.element=element;
        this.slideHolder=slideHolder;
        this.slideShowsHolder=slideShowsHolder;
        this.model=model;
        this._init();
    };

    SlideshowEditor.prototype={
        _init:function(){
            var that=this;
            this.dragSlides = new DragAreaScroll(this.element,this.slideHolder,this.slideShowsHolder,{offset:new Point(0,70),initPosition:new Point(430,100)});
            this.dragSlides.dragSources.addSource(slides.map(function(slideId,i){
                return this.generateSlide(slideId);
            },this));
            this.model.slideshows.filter(function(slideshow){return !slideshow.noEditable;}).forEach(function(slideshow){
                var targetEl= util.createEl("div",{"class":"slideshow-target","slideshow":slideshow.id});
                var name= util.createEl("span",{"class":"tittle"});
                name.innerHTML=slideshow.name+"&nbsp;";
                targetEl.appendChild(name);
                var nameBottom= util.createEl("span",{"class":"tittle bottom"});
                nameBottom.innerHTML=slideshow.name+"&nbsp;";
                targetEl.appendChild(nameBottom);
                var target = this.dragSlides.dragTargets.addTarget(targetEl,{"margin":new Point(0,20),offset:new Point(20,50),comparator:function(a,b){return a.el.getAttribute("slide")==b.el.getAttribute("slide");}});
                var drags=slideshow.slides.map(function(slide){
                    var dragObj = new DragObj(this.generateSlide(slide),new Point(500,1100));
                    this.dragSlides.dragTargets.addDragObj(dragObj);
                    return dragObj;
                },this);
                target.adds(drags);
            },this);
            this.dragSlides.dragTargets.reCalculateSize();
        },
        generateSlide:function(slideId){
            var obj= util.createEl("div",{"class":"drag-slide","slide":slideId});
            var img = document.createElement("img");
            img.src="content/img/thumbs/"+slideId+".jpg";
            obj.appendChild(img);
            return obj;
        },
        refresh:function(){
            this.dragSlides.refresh();
        },
        synchronize:function(){
            this.model.slideshows.filter(function(slideshow){return !slideshow.noEditable;}).forEach(function(slideshow){
                var target= this.dragSlides.dragTargets.targets.filter(function(targ){return targ.el.getAttribute('slideshow')==slideshow.id;})[0];
                slideshow.slides=target.objs.map(function(obj){ return obj.el.getAttribute("slide")});
            },this);
        }
    };
    /*************************************/

})();
