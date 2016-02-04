(function(global){
    var id="ExamplePresentation.v2";

	var DynamicPresentationBuilder = function(slides_name,addingPart){
        window.builder=this;
        this.slides_name = slides_name;
        //this.addingPart=addingPart;
        this.init();
	}
    DynamicPresentationBuilder.prototype={
        init:function(){
        },
        reset:function(){
            app.unLoad();
            delete app.slides;
            delete app.sections;
            delete app.slideshowIds;
            delete app.collectionIds;
            delete app.slideshows;
            delete app.collections;

            app.slides={};
            app.sections={};
            app.slideshowIds=[];
            app.collectionIds=[];
            app.slideshows={};
            app.collections={};

            app.thumbs.forEach(function(thumb){thumb.destroy();});
            delete app.thumbs;
            app.thumbs=[];
            
            app.menu.destroy();
            delete app.menu;
        },
        build:function(data,alternativeData){
            this.data=data;
            this.alternativeData=alternativeData;
            //data.slideshows=this.addingPart.slideshows.concat(data.slideshows);
            if(window.app){
                this.reset();
            }
            else{
                var app=new Presentation({
                    type: 'dynamic',
                    orientation: /*'landscape'*/'portrait',
                    dimensions:"[768,1024]"
                });
                app.presentationsStorage= new PresentationStorage(id);
                app.scroller = new Slidescroller();
                app.data = new Data();
                app.slidePopup = new SlidePopup('slidePopup','popupBackButton');
                app.formPopup = new FormPopup('formpopup-wrapper');
                //app.thumbnels=new Thumb();
                app.thumbs=[];
                app.memoryManager = new MemoryManager("placebo",'enable');
            }
            var app=window.app;
            
            data.slideshows.filter(function(slideshow){return slideshow.active==undefined ||slideshow.active;}).forEach(function(slideShow){
                app.add(slideShow.id,slideShow.slides,"slideshow");
                if(slideShow.hasOwnProperty("thumbs")) { app.slideshows[slideShow.id].thumbs=slideShow.thumbs; } else {app.slideshows[slideShow.id].thumbs=true}
            },this);
            app.add(data.id,data.slideshows.filter(function(slideshow){return slideshow.active==undefined ||slideshow.active;}).map(function(section){return section.id}),"collection");
            if(alternativeData){
                alternativeData.slideshows.filter(function(slideshow){return slideshow.active==undefined ||slideshow.active;}).forEach(function(slideShow){
                    app.add(slideShow.id,slideShow.slides,"slideshow");
                },this);
                app.add(alternativeData.id,alternativeData.slideshows.filter(function(slideshow){return slideshow.active==undefined ||slideshow.active;}).map(function(section){return section.id}),"collection");
            }
            var menuList=data.slideshows.map(function(slideShow){
                return { title:slideShow.name,goto:(data.id+"."+slideShow.id)};
            });
            if(alternativeData){
                menuList.push({ title:alternativeData.name,goto:alternativeData.id})
            }
            app.menu = new MenuWithScroll('mainmenu',menuList);
            app.load(data.id,"collection");
            app.goTo(data.id, data.currentslideshow);
        }
    };

	global.DynamicPresentationBuilder = DynamicPresentationBuilder;
})(window);