(function(global){
    var isTouch = 'ontouchstart' in window;

    /**********************************/
    /*******    DragObj    ************/
    /**********************************/
    var DragObj=function(el,position){
        this.el=el;
        if(position){this.initPosition=position;}
        this.init();
    }

    DragObj.prototype = {
        init:function(){
            var that=this;
            this.el.style.webkitTransitionProperty = '-webkit-transform';
            this.el.style.position = 'absolute';
            this.el.style.webkitTransitionTimingFunction = 'cubic-bezier(0,0,0.25,1)';
            this.el.style.webkitTransitionDuration="0";
            this.el.that=this;
            if(!this.initPosition){
                var x= window.getComputedStyle(this.el)['left'];
                var y= window.getComputedStyle(this.el)['top'];
                if(x=="auto")x=0;
                if(y=="auto")y=0;
                this.initPosition=new Point(parseInt(x),parseInt(y));
            }
            //this.getSize();

            this._saveState=function(){that.saveState();}
            this.setPoint(this.initPosition,true);
            this.el.addEventListener('webkitTransitionEnd',this._saveState,false);
            this.unselect();
        },
        getSize:function(isReCalculate){
            if(isReCalculate || !this.size){
                var width=parseInt(window.getComputedStyle(this.el)['width']);
                var height=parseInt(window.getComputedStyle(this.el)['height']);
                this.size = new Point(width,height);
            }
            return this.size;
        },
        _setTranslate:function(x,y){
            var webkitTransform = this.el.style.webkitTransform;
            if(!/translate3d\([^)]+\)/.test(webkitTransform)){
                webkitTransform += ' translate3d('+x+'px,'+y+'px,0px)';
            }
            else{
                webkitTransform=webkitTransform.replace(/translate3d\([^)]+\)/,'translate3d('+x+'px,'+y+'px,0px)');
            }
            this.el.style.webkitTransform=webkitTransform;
        },
        setPosition:function(point,isSave,time){
            var that=this;
            time = time || 0;
            isSave = isSave || false;
            if(time!=0)this.el.style.pointerEvents="none";
            this.el.style.webkitTransitionDuration=time+'ms';
            var x=point.x-this.fixPosition.x;
            var y=point.y-this.fixPosition.y;
            this.isSave=isSave;
            if(isSave){
                this.point=point;
            }
            this._setTranslate(x,y);
            if(isSave && this.currPosition.toString()==point.toString()){
                this.saveState();
            }
            this.currPosition=point;
        },
        back:function(time){
			this.setPosition(this.initPosition,true,time||0);
            this.onBack && this.onBack();
		},
        saveState:function(){
            if(this.isSave){
                this.setPoint(this.point);
                this.isSave=false;
                this.onSave && this.onSave();
            }
        },
        setPoint:function(point){
            var that=this;
            this.fixPosition=point;
            this.currPosition=point;
            this.el.style.webkitTransitionDuration="0";
            this.el.style.pointerEvents="auto";
            this.el.style.top=point.y+'px';
            this.el.style.left=point.x+'px';
            //if(!isTouch){
                setTimeout(function(){that._setTranslate(0,0);},1);
            //}
            //else{
            //    this._setTranslate(0,0);
            //}

        },
        reset:function(){
            this.setPoint(this.initPosition);
            this.onLeaveTarget && this.onLeaveTarget();
        },
        setInitPosition:function(position,time){
            this.initPosition=position;
            this.setPosition(position,true,time);
        },
        refresh:function(){
            this.setPoint(this.fixPosition);
        },
        select:function(){
            this.el.style.zIndex="50";
            //this.el.addClass('actived');
        },
        unselect:function(){
            this.el.style.zIndex="";
            //this.el.removeClass('actived');
        },
        toString: function()
        {
            return this.el;
        }
    }

    /**********************************/
    /*******    DragTarget    ************/
    /**********************************/
    var DragTarget=function(el,options){
        this.el=el;
        this.init();
        !options &&(options={});
        options.margin=options.margin||new Point(15,5);
        options.offset=options.offset||new Point(5,5);
        options.timeAdd=options.timeAdd||500;
        options.timeRemove=options.timeRemove||1500;
        options.comparator=options.comparator||function(a,b){return a.initPosition.toString() == b.initPosition.toString()};
        this.options=options;
    }

    DragTarget.prototype = {
        init:function(){
            var that=this;
            this.objs=[];
        },
        getSize:function(isReCalculate){
            if(isReCalculate || !this.size){
                var width=parseInt(window.getComputedStyle(this.el)['width']);
                var height=parseInt(window.getComputedStyle(this.el)['height']);
                this.size = new Point(width,height);
                //this.visualDebug();
            }
            return this.size;
        },
        getPosition:function(isReCalculate){
             if(isReCalculate || !this.position){
                this.position = MathPoint.getOffset(this.el,this.el.parentNode,true);
            }
            return this.position;
        },
        calculateDestinyPositions:function(){
            var destinyArr=[];
            var lineHeight=0;
            var start=this.getPosition().add(this.options.offset);
            var destiny=new Point(0,0);
            //destinyArr.push(start);
            var size=this.getSize().add(this.options.offset.mult(-2));
            for(var i=0;i<this.objs.length;i++){
                if(size.x<(destiny.x+this.objs[i].getSize().x) && lineHeight!=0){
                    destiny=new Point(0,destiny.y+lineHeight+this.options.margin.y);
                    lineHeight=0;
                }
                lineHeight=Math.max(lineHeight,this.objs[i].getSize().y);
                destinyArr.push(start.add(destiny));
                destiny=new Point(destiny.x+this.objs[i].getSize().x+this.options.margin.x,destiny.y);
            }
            this.destinyPositions=destinyArr;
            return destinyArr;
        },
        getLastDestinyPositions:function(){
            if(!this.destinyPositions)
                this.calculateDestinyPositions();
            return this.destinyPositions;
        },
        setPositions:function(arr,time){
            for(var i=0;i<Math.min(this.objs.length,arr.length);i++){
                this.objs[i].setPosition(arr[i],true,time);
            }
        },
        checkAppropriate:function(obj){
            for (var i = 0; i < this.objs.length; i++){
                if (this.options.comparator(this.objs[i],obj)){
                    return false;
                }
            }
            return true;
        },
        add:function(obj){
            this.objs.push(obj);
            this.setPositions(this.calculateDestinyPositions(),this.options.timeAdd);
        },
        adds:function(objs){
            this.objs=this.objs.concat(objs);
            this.setPositions(this.calculateDestinyPositions(),1);
        },
        remove:function(obj){
            var index=this.objs.indexOf(obj);
            if(index!=-1){
                this.objs.splice(index,1);
                this.setPositions(this.calculateDestinyPositions(),this.options.timeRemove);
            }
        },
        insert:function(obj,index){
            var newArr=[];
            for(var i=0;i<this.objs.length;i++){
                if(i==index) newArr.push(obj);
                newArr.push(this.objs[i]);
            }
            this.objs=newArr;
            this.setPositions(this.calculateDestinyPositions(),this.options.timeAdd);
        },
        exchange:function(obj,index){
			var index = index||0;
			this.objs[index].back(this.options.timeRemove);
			this.objs[index] = obj;
			this.setPositions(this.calculateDestinyPositions(),this.options.timeRemove);
		},
        reset:function(){
            var obj;
            while(obj=this.objs.pop()){
                obj.reset();
            }
        },
        visualDebug:function(){
            this.el.innerHTML="position="+this.getPosition().toString()+"size="+this.getSize().toString();
        }
    }

    /**********************************/
    /*******    DragArea   ************/
    /**********************************/

    var DragArea=function(area,dragObjs){
        this.area=area;
        this.dragObjs=dragObjs;
        this.init();
    }
    DragArea.prototype={
        isDrag:null,
        startPoint: null,
        init:function(){
            var that=this;
            this._startDrag=function(e){ that.startDrag(this.that,e);};
            for(var i=0;i<this.dragObjs.length;i++){
                this.dragObjs[i].el.addEventListener(touchy.events.start,this._startDrag,false);
            }
            this._startArea=function(e){that.startArea(e);};
            this.area.addEventListener(touchy.events.start,this._startArea,false);

            this._moveArea=function(e){that.moveArea(e);};
            this.area.addEventListener(touchy.events.move,this._moveArea,false);

            this._endArea=function(e){that.endArea(e);};
            this.area.addEventListener(touchy.events.end,this._endArea,false);
            this.isDrag=false;
            this.startPoint=null;
            document.addEventListener("resize",function(e){
                if(that.isDrag){
                    that.endArea(e);
                }
            })
        },
        startDrag:function(dragObj,e){
            if(this.isDrag) return;
            this.selectObj(this.dragObjs.indexOf(dragObj));
            this.isDrag=true;
        },
        selectObj:function(index){
            this.dragObjs[this.indexSelDrag] && this.dragObjs[this.indexSelDrag].unselect();
            this.indexSelDrag=index;
            this.dragObjs[this.indexSelDrag] && this.dragObjs[this.indexSelDrag].select();
        },
        startArea:function(e){
            if(!this.isDrag) return false;
            e.preventDefault();
            e.stopPropagation();
            var eX = isTouch?e.changedTouches[0].pageX : e.pageX;
            var eY = isTouch?e.changedTouches[0].pageY : e.pageY;
            this.startPoint=new Point(eX,eY);
            return true;
        },
        moveArea:function(e){
            if(!this.isDrag) return false;
            e.preventDefault();
            e.stopPropagation();
            var eX = isTouch?e.changedTouches[0].pageX : e.pageX;
            var eY = isTouch?e.changedTouches[0].pageY : e.pageY;
            var pointCurr = this.dragObjs[this.indexSelDrag].fixPosition;
            var point= new Point(pointCurr.x+eX-this.startPoint.x,pointCurr.y+eY-this.startPoint.y);
            point=this.bound(point);
            this.dragObjs[this.indexSelDrag].setPosition(point);
            //this.visualDebug();
        },
        endArea:function(e){
            if(!this.isDrag) return false;
            e.preventDefault();
            e.stopPropagation();
            var point = this.dragObjs[this.indexSelDrag].currPosition;
            point=this.bound(point);
            this.setPoint(point);
            this.isDrag=false;
        },
        getSize:function(isReCalculate){
            if(isReCalculate || !this.size){
                var width=parseInt(this.area.clientWidth);
                var height=parseInt(this.area.clientHeight);
                this.size = new Point(width,height);
            }
            return this.size;
        },
        getPosition:function(isReCalculate){
             if(isReCalculate || !this.position){
                this.position = MathPoint.getOffset(this.area,null,true);
            }
            return this.position;
        },
        bound:function(point){
            var x=MathPoint.bound(0,this.getSize().x-this.dragObjs[this.indexSelDrag].el.clientWidth,point.x);
            var y=MathPoint.bound(0,this.getSize().y-this.dragObjs[this.indexSelDrag].el.clientHeight,point.y);
            return new Point(x,y);
        },
        setPoint:function(point){
            this.dragObjs[this.indexSelDrag].setPosition(point,true);
        },
        visualDebug:function(){
            for(var i=0;i<this.dragObjs.length;i++){
                //console.log('I='+i+"Y="+this.dragObjs[i].poinIndex.y);
                this.dragObjs[i].el.innerHTML="";//"i="+i;
                this.dragObjs[i].el.innerHTML+='<br/>this.dragObjs[i].currPoint'+this.dragObjs[i].currPosition.toString();
            }
        },
        reset:function(){
            for(var i=0;i<this.dragObjs.length;i++){
                this.dragObjs[i].reset();
            }
        }

    }

    /**********************************/
    /*****   DragAreaCombined  ********/
    /**********************************/

    var DragAreaCombined=function(area,dragObjs,options){
        //конструктор
        !options &&(options={});
        options.dragOfset=options.dragOfset||new Point(100,100);
        options.radius=options.radius||100;
        this.options=options;
        DragAreaCombined.superclass.constructor.call(this,area,dragObjs);
    }
    extend(DragAreaCombined,DragArea);

    DragAreaCombined.prototype.init=function(){
        DragAreaCombined.superclass.init.call(this);
        var that=this;
        this.isCombined=false;
        for(var i=0;i<this.dragObjs.length;i++){
            this.dragObjs[i].onSave=function(){
                if(that.isCombined){
                    that.dragObjs[that.indexSelDrag] && that.dragObjs[that.indexSelDrag].unselect();
                    that.onCombine && that.onCombine();
                }
            };
        }
    };
    DragAreaCombined.prototype.setPoint=function(point){
        var isFirstSelect = this.indexSelDrag==0;
        var destPoint=this.dragObjs[isFirstSelect?1:0].fixPosition;
        destPoint=Math.PointAdd(destPoint,isFirstSelect?Math.PointNegative(this.options.dragOfset):this.options.dragOfset);
        if(Math.getNearIndexWithCaptureRadiusPoint([destPoint],this.options.radius,point)!=-1){
            this.isCombined=true;
            this.dragObjs[this.indexSelDrag].setPosition(destPoint,true,10+Math.getLength(destPoint,point));
        }
        else{
            this.dragObjs[this.indexSelDrag].setPosition(point,true);
        }
    };
    DragAreaCombined.prototype.startArea=function(e){
        if(DragAreaCombined.superclass.startArea.call(this,e)){
            if(this.isCombined){
                this.onDeCombine && this.onDeCombine();
            }
            this.isCombined=false;
        }
    };
    DragAreaCombined.prototype.reset=function(){
        DragAreaCombined.superclass.reset.call(this);
        if(this.isCombined){
            this.onDeCombine && this.onDeCombine();
            this.isCombined=false;
        }
    };

    /**********************************/
    /*****   DragAreaList  ********/
    /**********************************/


    var DragAreaList=function(area,dragObjs,options){
        //конструктор
        !options &&(options={});
        options.radius=options.radius||100;
        options.time=options.time||100;
        options.position=options.position||{y:true};
        this.options=options;
        DragAreaList.superclass.constructor.call(this,area,dragObjs);
    }
    extend(DragAreaList,DragArea);
    DragAreaList.prototype.init=function(){
        DragAreaList.superclass.init.call(this);
        var that=this;
    };
    DragAreaList.prototype.setPoint=function(point){
        var arr=this.dragObjs.map(function(el){return el.fixPosition;});
        var indexExcange=MathPoint.getNearIndexWithCaptureRadiusPoint(arr,this.options.radius,point,this.options.position);
        if(indexExcange!=-1){
            this.dragObjs[indexExcange].setPosition(this.dragObjs[this.indexSelDrag].fixPosition,true,this.options.time);
            this.dragObjs[this.indexSelDrag].setPosition(this.dragObjs[indexExcange].fixPosition,true,this.options.time);
        }
        else{
            this.dragObjs[this.indexSelDrag].setPosition(this.dragObjs[this.indexSelDrag].fixPosition,true,this.options.time);
        }
    };
    DragAreaList.prototype.getDragObjOnPlace=function(dragObjsOnPlace){
        dragObjsOnPlace=dragObjsOnPlace||this.dragObjs;
        var retArr=[];
        var arr=dragObjsOnPlace.map(function(el){return el.initPosition;});
        this.dragObjs.forEach(function(el){
            var indexExcange=MathPoint.getNearIndexWithCaptureRadiusPoint(arr,2,el.fixPosition,this.options.position);
            if(indexExcange!=-1){
                retArr[indexExcange]=el;
            }
        },this);
        return retArr;
    }

    /**********************************/
    /*****   DragAreaListDynamic  ********/
    /**********************************/


    var DragAreaListDynamic=function(area,elements,options){
        //конструктор
        !options &&(options={});
        options.initPosition=options.initPosition||new Point(200,100);
        options.offset=options.offset||new Point(0,100);
        DragAreaListDynamic.superclass.constructor.call(this,area,[],options);
        this.initObj=[];
        this.initDragObj(elements);
        this.addInitObjs();
    }
    extend(DragAreaListDynamic,DragAreaList);

    DragAreaListDynamic.prototype.initDragObj=function(elements){
        !(elements instanceof Array) && (elements=[elements]);
        var dragArr = elements.map(function(element,i){
            this.area.appendChild(element);
            return new DragObj(element,this.options.initPosition.add(this.options.offset.mult(this.dragObjs.length+this.initObj.length+i)));
        },this);
        this.initObj=this.initObj.concat(dragArr);
    }

    DragAreaListDynamic.prototype.addInitObjs=function(){
        this.initObj.forEach(function(dragObj){
             dragObj.el.addEventListener(touchy.events.start,this._startDrag,false);
        },this);
        this.dragObjs=this.dragObjs.concat(this.initObj);
        this.initObj=[];
    };

    DragAreaListDynamic.prototype.getComparator=function(){
        if(this.options.position.x && this.options.position.y){
            return function(a,b){
                if(a.currPosition.x==b.currPosition.x){
                    return a.currPosition.y - b.currPosition.y;
                }
                return a.currPosition.x - b.currPosition.x;
            }
        }
        if(this.options.position.x){
            return function(a,b){
                return a.currPosition.x - b.currPosition.x;
            }
        }
        if(this.options.position.y){
            return function(a,b){
                return a.currPosition.y - b.currPosition.y;
            }
        }
    }

    DragAreaListDynamic.prototype.sort=function(){
        this.dragObjs=this.dragObjs.sort(this.getComparator());
        this.initObj=this.initObj.sort(this.getComparator());
    };

    DragAreaListDynamic.prototype.remove=function(element){
        this.isDrag=false;
        this.selectObj(0);
        this.sort();
        var index = this.dragObjs.getFirstIndexOf(function(obj){return obj.el==element});
        if(index==-1) return;
        this.area.removeChild(element);
        element.removeEventListener(touchy.events.start,this._startDrag);
        this.dragObjs.splice(index,1);
        this.clearPosition();
    };
    DragAreaListDynamic.prototype.removeAll=function(){
        this.dragObjs.forEach(function(obj){
            this.area.removeChild(obj.el);
            obj.el.removeEventListener(touchy.events.start,this._startDrag);
        },this);
        delete this.dragObjs;
        this.dragObjs=[];
        this.initObj.forEach(function(obj){
            this.area.removeChild(obj.el);
        },this);
        delete this.initObj;
        this.initObj=[];
    };
    DragAreaListDynamic.prototype.clearPosition=function(){
        this.dragObjs.forEach(function(dragObj,i){
            dragObj.setInitPosition(this.options.initPosition.add(this.options.offset.mult(i)),500);
        },this);
        this.initObj.forEach(function(dragObj,i){
            dragObj.setInitPosition(this.options.initPosition.add(this.options.offset.mult(i+this.dragObjs.length)),500);
        },this);
    };

    /**********************************/
    /*****   DragAreaTarget  ********/
    /**********************************/

    var DragAreaTarget=function(area,dragObjs,targets,options){
        //конструктор
        !options &&(options={});
        this.options={};
        //this.options.radius=options.radius||100;
        this.options.time=options.time||500;
        this.options.radius=options.radius||40;
        this.options.isExcange=options.isExchange||false;
        this.targets=targets;
        DragAreaTarget.superclass.constructor.call(this,area,dragObjs);
    }
    extend(DragAreaTarget,DragArea);
    DragAreaTarget.prototype.init=function(){
        DragAreaTarget.superclass.init.call(this);
    };
    DragAreaTarget.prototype.getIndexOfTargetsTo=function(p){
        for(var i=0;i<this.targets.length;i++){
            if(MathPoint.isOnRectangle(this.targets[i].getPosition(),this.targets[i].getSize(),p))
                return i;
        }
        return -1;
    };
    DragAreaTarget.prototype.startArea=function(e){
        if(DragAreaTarget.superclass.startArea.call(this,e)){
            this.selectIndexTargetFrom=this.getIndexOfTargetsFrom(this.dragObjs[this.indexSelDrag]);
            if(this.selectIndexTargetFrom!=-1){
                this.targets[this.selectIndexTargetFrom].remove(this.dragObjs[this.indexSelDrag]);
            }
            return true;
        }
        return false
    };
    DragAreaTarget.prototype.getIndexOfTargetsFrom=function(obj){
        for(var i=0;i<this.targets.length;i++){
            if(this.targets[i].objs.indexOf(obj)!=-1)
                return i;
        }
        return -1;
    };
    DragAreaTarget.prototype.setPoint=function(point){
        var indexTargetTo=this.getIndexOfTargetsTo(point.add(this.dragObjs[this.indexSelDrag].getSize().mult(0.5)));
        if(indexTargetTo==-1 || !this.targets[indexTargetTo].checkAppropriate(this.dragObjs[this.indexSelDrag])){
            this.dragObjs[this.indexSelDrag].onLeaveTarget && this.dragObjs[this.indexSelDrag].onLeaveTarget();
            this.dragObjs[this.indexSelDrag].back(this.options.time);
        }
        else{
            var arr= this.targets[indexTargetTo].getLastDestinyPositions();
            var insertIndex=MathPoint.getNearIndexWithCaptureRadiusPoint(arr,this.options.radius,point,{IsTransformationSpace:true,x:1,y:3});
            if(insertIndex!=-1){
                var operation = (!this.options.isExchange && (indexTargetTo==this.selectIndexTargetFrom))?"insert":"exchange";
                this.targets[indexTargetTo][operation](this.dragObjs[this.indexSelDrag],insertIndex);
            }
            else{
                this.targets[indexTargetTo].add(this.dragObjs[this.indexSelDrag]);
            }
        }
    };
    DragAreaTarget.prototype.reset=function(){
        for(var i=0;i<this.targets.length;i++){
            this.targets[i].reset();
        }
    };

    global.DragObj = DragObj;
    global.DragTarget = DragTarget;
    global.DragArea = DragArea;
    global.DragAreaCombined = DragAreaCombined;
    global.DragAreaList = DragAreaList;
    global.DragAreaListDynamic = DragAreaListDynamic;
    global.DragAreaTarget = DragAreaTarget;
})(window);
