(function(global){
    var isTouch = 'ontouchstart' in window;
    /***************************************/
    /**********   DragAreaScroll  *******/
    /**************************************/
    var ResizableDragTarget=function(el,options){
        !options &&(options={});
        options.cellSize=options.cellSize||new Point(125,70);
        options.startCells=options.startCells||new Point(1,3);
        ResizableDragTarget.superclass.constructor.call(this,el,options);
        this.setCells(this.options.startCells);
    }
    extend(ResizableDragTarget,DragTarget);
    ResizableDragTarget.prototype.setCells=function(cells){
        this.options.cells=cells;
        this.size=(new Point((this.options.margin.x+this.options.cellSize.x)*cells.x,(this.options.margin.y+this.options.cellSize.y)*cells.y)).add(this.options.offset.mult(2)).add(this.options.margin);
        this.el.style.width=this.size.x+"px";
        this.el.style.height=this.size.y+"px";
    };
    ResizableDragTarget.prototype.getSize=function(){
        return this.size;
    };
    ResizableDragTarget.prototype.getMaxCount=function(){
        return this.options.cells.x * this.options.cells.y;
    }
    ResizableDragTarget.prototype.add=function(obj){
        ResizableDragTarget.superclass.add.call(this,obj);
        this.onAdd && this.onAdd();
    };
    /***************************************/
    /**********   DragAreaScroll  *******/
    /**************************************/
    var DragAreaScroll=function(area,dragSourceEl,dragTargetsEl,options){
        window.testDrag=this;
        var that=this;
        !options &&(options={});
        options.canRepeatSlide=options.canRepeatSlide||false;
        this.options=options;
        this.dragSources=new DragSourcesScroll(dragSourceEl,this);
        this.dragTargets=new DragAreaTargetsScroll(dragTargetsEl,this);
        this.dragTargets.scroll.onScrollEnd=this.onScrollEnd.bind(this)
        DragAreaScroll.superclass.constructor.call(this,area,[]);
        document.addEventListener("resize",function(){that.refresh();});
    };
    extend(DragAreaScroll,DragArea);
    DragAreaScroll.prototype.addDragObj=function(obj,isStartDrag,e){
        this.area.appendChild(obj.el);
        obj.el.addEventListener(touchy.events.start,this._startDrag,false);
        this.dragObjs.push(obj);
        if(isStartDrag){
            this.startDrag(obj,e)
            this.startArea(e);
        }
    };
    DragAreaScroll.prototype.removeDragObj=function(obj,isRemoveDom){
        var index=this.dragObjs.indexOf(obj);
        if(index==-1)return;
        this.dragObjs.splice(index,1);
        obj.el.removeEventListener(touchy.events.start,this._startDrag);
        isRemoveDom && this.area.removeChild(obj.el);
    };
    DragAreaScroll.prototype.getTargetsOffset=function(isReCalculate){
        if(isReCalculate || !this.targOffset){
            this.targOffset = MathPoint.getOffset(this.dragTargets.area,this.area,true);
        }
        return this.targOffset;
    };
    DragAreaScroll.prototype.checkExistingInTarget=function(checkObj){
        return this.dragTargets.dragObjs.some(function(dragObj){
            return dragObj.el.getAttribute("slide")==checkObj.el.getAttribute("slide");
        });
    }
    DragAreaScroll.prototype.endArea=function(e){
        if(!this.isDrag) return false;
        var that=this;
        e.preventDefault();
        e.stopPropagation();
        this.isDrag=false;
        var point = this.dragObjs[this.indexSelDrag].currPosition;
        var dragObj = this.dragObjs[this.indexSelDrag];
        if(MathPoint.isOnRectangle(this.dragTargets.getOutPosition(true),this.dragTargets.getOutSize(true),point) && (this.options.canRepeatSlide || !this.checkExistingInTarget(dragObj))){
            this.removeDragObj(dragObj,true);
            var position=dragObj.currPosition.sub(this.getTargetsOffset());
            dragObj.setPoint(position);
            setTimeout(function(){
                that.dragTargets.addDragObj(dragObj,true,e);
            },40);
            //this.setPoint(point);
        }
        else{
            setTimeout(function(){
                that.removeDragObj(dragObj,true);
                delete dragObj;
            },40);
        }
    };
    DragAreaScroll.prototype.refresh=function(){
        this.getSize(true);
        this.dragSources.refresh();
        this.dragTargets.refresh();
    };
    DragAreaScroll.prototype.onScrollEnd=function(){
        this.targOffset=null;
    };
    /***************************************/
    /**********   DragSourcesScroll  *******/
    /**************************************/
    var DragSourcesScroll=function(area,parentDragArea){
        this.area=area;
        this.parentDragArea=parentDragArea;
        this.init();
    };
    DragSourcesScroll.prototype.init=function(){
        this.elements=[];
        this.scroll=new iScroll(this.area,{ snap: true, momentum: false, hScrollbar: true, vScrollbar: false, bounce: false, desktopCompatibility: true});
    };
    DragSourcesScroll.prototype.addSource=function(els){
        var that=this;
        !(els instanceof Array) && (els=[els]);
        els.forEach(function(element,i){
            element.addEventListener(touchy.events.start,function(e){
                e.stopPropagation();
                that.dragStart(this,e);
            });
            this.area.appendChild(element);
        },this);
        this.elements.concat(els);
        this.refresh();
    };
    DragSourcesScroll.prototype.getOffsetScroll=function(){
        return new Point(this.scroll.x,this.scroll.y);
    };
    DragSourcesScroll.prototype.refresh=function(){
        this.scroll.refresh();
    };
    DragSourcesScroll.prototype.dragStart=function(element,e){
        var position = MathPoint.getOffset(element,this.parentDragArea.area,true);
        var clone = element.cloneNode(true);
        var dragObj=new DragObj(clone,position);
        this.parentDragArea.addDragObj(dragObj,true,e);
    };
    /***************************************/
    /**********   DragTargetsScroll  *******/
    /**************************************/
    var DragAreaTargetsScroll=function(area,parentDragArea,options){
        !options &&(options={});
        this.parentDragArea=parentDragArea;
        DragAreaTargetsScroll.superclass.constructor.call(this,area,[],[],{isExchange:true});
    }
    extend(DragAreaTargetsScroll,DragAreaTarget);
    augment(DragAreaTargetsScroll,DragAreaScroll,/*"addDragObj",*/"removeDragObj");
    DragAreaTargetsScroll.prototype.init=function(){
        DragAreaTargetsScroll.superclass.init.call(this);
        this.scroll=new iScroll(this.area.parentNode,{ snap: false, momentum: false, hScrollbar: true, vScrollbar: false, bounce: false, desktopCompatibility: true ,checkDOMChanges:false});
    };
    DragAreaTargetsScroll.prototype.refresh=function(){
        this.scroll.refresh();
    };
    DragAreaTargetsScroll.prototype.addDragObj=function(obj,isEndDragDrag,e){
        var that=this;
        var remove = util.createEl("a",{"href":"#","class":"remove"});
        remove.addEventListener(touchy.events.start,function(e){
            e.preventDefault();
            e.stopPropagation();
            delete that.removeDragObj(obj);
            that.reCalculateSize();
        });
        obj.el.appendChild(remove);
        this.area.appendChild(obj.el);
        obj.el.addEventListener(touchy.events.start,this._startDrag,false);
        obj.onBack=function(){
            //if(that.dragTargets.getIndexOfTargetsFrom(dragObj)==-1){
                delete that.removeDragObj(obj);
            //}
        }
        this.dragObjs.push(obj);
        if(isEndDragDrag){
            this.selectObj(this.dragObjs.indexOf(obj));
            this.isDrag=true;
            this.endArea(e);
        }
    };
    DragAreaTargetsScroll.prototype.removeDragObj=function(obj){
        var targetFrom = this.getIndexOfTargetsFrom(obj);
        if(targetFrom!=-1){
            this.targets[targetFrom].remove(obj);
        }
        this.area.removeChild(obj.el);
        obj.el.removeEventListener(touchy.events.start,this._startDrag);
        var index= this.dragObjs.indexOf(obj);
        this.dragObjs.splice(index,1)
        return obj;
    };
    DragAreaTargetsScroll.prototype.addTarget=function(htmlEl,options){
        var that=this;
        this.area.appendChild(htmlEl);
        var target=new ResizableDragTarget(htmlEl,options);
        target.onAdd=function(){that.reCalculateSize();};
        this.targets.push(target);
        this.refresh();
        return target;
    };
    DragAreaTargetsScroll.prototype.getOutSize=function(isReCalculate){
        if(isReCalculate || !this.outSize){
            var width=parseInt(this.area.parentNode.parentNode.clientWidth);
            var height=parseInt(this.area.parentNode.parentNode.clientHeight);
            this.outSize = new Point(width,height);
        }
        return this.outSize;
    };
    DragAreaTargetsScroll.prototype.getOutPosition=function(isReCalculate){
        if(isReCalculate || !this.outPosition){
            this.outPosition = MathPoint.getOffset(this.area.parentNode.parentNode,this.parentDragArea.area,true);
        }
        return this.outPosition;
    };
    DragAreaTargetsScroll.prototype.reCalculateSize=function(isReCalculate){
        var maxSlideInSections= this.targets.reduce(function(max,curr){
            return Math.max(max,curr.objs.length);
        },3);
        var cells= new Point(1,maxSlideInSections+1);
        this.targets.forEach(function(targ){targ.setCells(cells);});
        var x = this.scroll.x,y=this.scroll.y;
        this.refresh();
        this.scroll.scrollTo(x,y,0);
        this.size=null;
    };

    global.DragAreaScroll = DragAreaScroll;
    global.DragSourcesScroll = DragSourcesScroll;
    global.DragAreaTargetsScroll = DragAreaTargetsScroll;
})(window);
