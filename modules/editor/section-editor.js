(function(){
    window.PresentationEditor=function(element,model,options){
        app.presentationEditor=this;
        this.element=element;
        this.model=model;
        options=options||{};
        options.maxSlideShows=options.maxSlideShows||10;
        options.maxSlides=options.maxSlides||8;
        this.options=options;
        this._init();
    };
    PresentationEditor.prototype={
        _init:function(){
            var that=this;
            this._addNewChapter=function(e){
                e.stopPropagation();
                e.preventDefault();
                that.addNewChapter(this,e);
            };
            this.dragSlideShows=new DragAreaListDynamic(this.element,[],{offset:new Point(0,43),initPosition:new Point(80,20)});
            this.dragSlideShows.initDragObj(this.model.slideshows.filter(function(slideshow){return !slideshow.noEditable;}).map(function(slideshow){
                var el= util.createEl("div",{"class":"drag-chapter","slideshow":slideshow.id});
                var remove = util.createEl("a",{"href":"#","class":"remove"});
                remove.addEventListener(touchy.events.start,function(e){
                    e.preventDefault();
                    e.stopPropagation();
                    that.removeChapter(slideshow.id);
                });
                el.appendChild(remove);
                var tittle =  document.createElement("span");
                tittle.innerHTML=slideshow.name;
                el.appendChild(tittle);
                return el;
            },this));
            this.dragSlideShows.addInitObjs();
            if(this.options.maxSlideShows > this.dragSlideShows.dragObjs.length ) this.addEmpty();
        },
        addEmpty:function(){
            var that=this;
            this.newSlideShow = util.createEl("div",{ "class":"drag-chapter","slideshow":"new"});
            this.newSlideShow.innerHTML="add new";
            this.newSlideShow.addEventListener(touchy.events.start,this._addNewChapter);
            this.dragSlideShows.initDragObj(this.newSlideShow);
        },
        addNewChapter:function(el,e){
            var that=this;
            app.formPopup.show({
                tittle:"Create new chapter",
                items:[{
                    id:"name_of_new_chapter",
                    type:"text",
                    name:"Name of chapter",
                    isImportant:true
                }],
                submit:"save",
                callback:function(){
                    that._addChapter(this.items[0].value);
                }
            });
            return false;
        },
        checkExistSection:function(name){
            if(this.model.slideshows.some(function(sh){ return sh.id==name}) || this.dragSlideShows.dragObjs.some(function(dObj){return dObj.el.getAttribute("slideshow")==name;}) ){
                var num=0,numIndex = name.search(/\d+$/);
                if(numIndex!=-1){
                    num=name.substr(numIndex);
                    name=name.substr(0,numIndex);
                }
                num++;
                return this.checkExistSection(name+num);
            }
            else{
                return name;
            }
        },
        _addChapter:function(name){
            var that=this;
            //to do check existing ids
            var id=this.checkExistSection(name.trim(" ").split(" ").join("_"));
            this.newSlideShow.removeEventListener(touchy.events.start,this._addNewChapter);
            this.newSlideShow.innerHTML="";
            this.newSlideShow.setAttribute("slideshow",id);
            var remove = util.createEl("a",{"href":"#","class":"remove"});
            remove.addEventListener(touchy.events.start,function(e){
                e.preventDefault();
                e.stopPropagation();
                that.removeChapter(id);
            });
            this.newSlideShow.appendChild(remove);
            var tittle =  document.createElement("span");
            tittle.innerHTML=name;
            this.newSlideShow.appendChild(tittle);
            this.dragSlideShows.addInitObjs();
            this.newSlideShow=null;
            if(this.options.maxSlideShows > this.dragSlideShows.dragObjs.length ) this.addEmpty();
            this.onAdd && this.onAdd();
        },
        removeChapter:function(id){
            this.dragSlideShows.remove(this.element.querySelector("[slideshow="+id+"]"));
            if(!this.newSlideShow)this.addEmpty();
            this.onRemove && this.onRemove ();
        },
        synchronize:function(){
            var that=this;
            this.dragSlideShows.sort();
            var slideshows=this.dragSlideShows.dragObjs.map(function(obj){
                var slideShow={"slides":[]};
                slideShow.id=obj.el.getAttribute("slideshow");
                slideShow.name=obj.el.querySelector("span").innerHTML;
                return slideShow;
            }).map(function(slideShow){
                var index=this.model.slideshows.getFirstIndexOf(function(sh){ return sh.id==slideShow.id});
                if(index!=-1){
                    return this.model.slideshows[index];
                }
                else{
                    return slideShow;
                }
            },this);
            this.model.slideshows.filter(function(slideshow){return slideshow.noEditable && slideshow.position>=0;})
                    .sort(function(a,b){return a.position>b.position;})
                    .forEach(function(slideshow){slideshows.splice(slideshow.position,0,slideshow);})

            this.model.slideshows.filter(function(slideshow){return slideshow.noEditable && slideshow.position<0;})
                    .sort(function(a,b){return a.position<b.position;})
                    .forEach(function(slideshow){
                slideshows.splice(Math.max(0,slideshows.length+parseInt(slideshow.position)+1),0,slideshow);
            })

            this.model.slideshows= slideshows;
        }
    };


})();
