var isTouch = ('ontouchstart' in window);

var Sca = function(cDiv,steps,toclear){		
	var that=this;
	this.cDiv = cDiv;
	this.cObject = document.getElementById(cDiv.replace('#',''));	
/*
	var parent = this.cObject;
	while(parent && !parent.slide){
		parent = parent.parentNode;
	}
	if(parent) this.associateWithSlide(parent.slide);
	
	*/
	this.steps = steps;
	this.current_step = 0;	
	
	if(!this.cObject){		
		return;
	}
	this.cObject.that = this;	
	if(isTouch)
		this.cObject.addEventListener('tap',this.showNextFrame,false);
	else
		this.cObject.addEventListener('click',this.showNextFrame,false);
	
	this.cObject.addEventListener('slideEnter'/*,'slideExit'*/,this.clear,false);
	document.addEventListener('slidePopupExit',this.clear,false);
	this.toclear=toclear||false;
    this.cObject.addEventListener('slideEnter',this.autoAnimation,false);
	this.cObject.addEventListener('slidePopupEnter',this.autoAnimation,false);
	this.init();
    Sca.objs.push(this);
    !Sca.manualAuto && this.noclear();
	
}
/*---------------------------changes for autoAnimation-------------------------------*/
Sca.isAutoAnimation = true;
Sca.setAuto = function(checked){
    Sca.manualAuto = !checked;
}
Sca.getAuto = function(){
    return Sca.manualAuto;
}
/*---------------------------changes for autoAnimation end-------------------------------*/
Sca.objs=[];
Sca.manualAuto = true;
Sca.getMaunalAuto=function(){return Sca.manualAuto;}
Sca.setMaunalAuto=function(manualAuto){
    if(Sca.manualAuto!=manualAuto){
        Sca.objs.forEach(function(obj){
            obj[(manualAuto?"clear":"noclear")]();
        });
        Sca.manualAuto=manualAuto;
    }
}
Sca.prototype.autoAnimation = function(){
	var that = this.that||this;		
	var substeps = that.steps[that.current_step];
	if(!substeps) return;	
	var auto = substeps[0].auto||false;	
	if(!auto) return;	
	that.showNextFrame();
}

Sca.prototype.showNextFrame = function(){
    if(!Sca.manualAuto)return;
	var handler;
	var	getAnimation = function(substeps,substep){		
		if(substeps[substep]&&substeps[substep].delay){
			substeps[substep].ctimer = setTimeout(function(){getAnimation(substeps,substep+1);},substeps[substep].delay);
			return "delay"
		}
		if(substeps[substep-1]&&substeps[substep-1].selector){
			Sca.getElements(substeps[substep-1].selector)[0].removeEventListener('webkitTransitionEnd',handler,false);
		}		
		if(substeps[substep]){
			var elements = Sca.getElements(substeps[substep].selector);			
			time = substeps[substep].time||400;					
			Sca.setOptions(elements,substeps[substep].finish,time,substeps[substep].timefunc);	
			elements[0].addEventListener('webkitTransitionEnd',handler=function(){
				substeps[substep].callback && substeps[substep].callback();
				getAnimation(substeps,substep+1);
			},false);
			elements[0].handler = handler;// to unbind from other places
		}
		else return '';
	}
	var that = this.that||this;	
	var substeps = that.steps[that.current_step];
	if(!substeps || (substeps[0].condition && !substeps[0].condition())) return;
	getAnimation(substeps,0);
	
	that.current_step++;	
	that.autoAnimation();
}

Sca.setOptions = function(elements,options,time,func){
		var func = func||"linear"
		for(var i=0;i<elements.length;i++){
			elements[i].style.webkitTransition = func+" " +time +"ms";	
			var transform = "";		
			for(var prop in options) if(options.hasOwnProperty(prop)){
				if(prop=="translate3d"){
					var point = options[prop];
					var x = options[prop].x||"0px";
					var y = options[prop].y||"0px";
					var z = options[prop].z||"0px";
					transform = "translate3d("+x+","+y+","+z+")";
				} else if(prop=="zoom" || prop=="scale") {
					if(transform) transform += " ";
					transform += "scale("+options[prop]+")";				
				} else if(prop=="rotate") {					
					if(transform) transform += " ";
					transform += "rotate("+options[prop]+")";				
				} else {
                    elements[i].style[prop] = options[prop];
                }
			}
			if(transform) elements[i].style.webkitTransform = transform;			
		}
	}
	
Sca.getElements = function(selector){
	if(!selector) return [];
	if(selector.constructor.toString().indexOf("Array") != -1){
		var elements = selector;
	}else if(typeof selector=="object") {
		var elements = [selector];
	} else {
		var elements = document.body.querySelectorAll(selector);
	}		
	return elements;
}	
	
Sca.prototype.clear = function(){	
	var that = this.that||this;
    if(!Sca.manualAuto) return;
	that.current_step = 0;		
	for(var step in that.steps) if(that.steps.hasOwnProperty(step)) {
		var substeps = that.steps[step];
		for(var substep in substeps) if(substeps.hasOwnProperty(substep)) {
			var point = substeps[substep];
			var elements = Sca.getElements(point.selector);
			elements[0]&&elements[0].removeEventListener('webkitTransitionEnd',elements[0].handler,false);				
			if(point.delay)
				clearTimeout(point.ctimer);
			
			Sca.setOptions(elements,point.start,0);
		}
	}
}

Sca.prototype.noclear = function(){
	var that = this.that||this;
   //if (!Sca.manualAuto){alert('aa');return}
	that.current_step = 0;
	for(var step in that.steps) if(that.steps.hasOwnProperty(step)) {
		var substeps = that.steps[step];
		for(var substep in substeps) if(substeps.hasOwnProperty(substep)) {
			var point = substeps[substep];
			var elements = Sca.getElements(point.selector);
			elements[0]&&elements[0].removeEventListener('webkitTransitionEnd',elements[0].handler,false);
			if(point.delay)
				clearTimeout(point.ctimer);

			Sca.setOptions(elements,point.finish,0);
		}
	}
	////
	////clearDefaults();
}

Sca.prototype.init = function(){
	var that = this.that||this;	
	var point;
	var step;
	var substeps;
	var substep;
	that.current_step = 0;
	for(step in that.steps) if(that.steps.hasOwnProperty(step)) {
		substeps = that.steps[step];
		for(substep in substeps) if(substeps.hasOwnProperty(substep)){			
			point = substeps[substep];
			if(!point.start) point.start={};
			if(!point.finish) point.finish={};					
			if(point.object) point.selector = point.object;
			
			// ...,template:Sca.FADEIN,...
			if(point.template)
				for(var key in point.template)
					point[key] = clone(point.template[key]);	
					
			// ...,opacity:[0,1],...
			for(var prop in Sca.OPTIONS){
				var option = Sca.OPTIONS[prop];
				if(point[option]){
					point.start[option] = point[option][0];
					point.finish[option] = point[option][1];
				}
			}
			var elements = Sca.getElements(point.selector);						
			
			Sca.setOptions(elements,point.start,0);
		}
	}
}

// inSlideObjects interface
/*Sca.prototype.enter =  function(){
    if(Sca.manualAuto){
        this.clear();
        Sca.prototype.autoAnimation.call(this);
    }
    else{
        this.noclear();
   }
}
Sca.prototype.leave = function(){
    if(Sca.manualAuto)
        this.clear();
    else{
        this.noclear();
    }
}
Sca.prototype.associateWithSlide = function(slide){
	slide.addInSlideObjects(this);		
}*/

Sca.FADEIN ={ start: 	{webkitOpacity:"0",pointerEvents:"none"},
			  finish:	{webkitOpacity:"1",pointerEvents:"auto"}
			}
Sca.HFADEIN ={ start: 	{webkitOpacity:"0.5"},
			  finish:	{webkitOpacity:"1"}
			}			
Sca.FADEOUT = {	start:	{webkitOpacity:"1",pointerEvents:"auto"},
				finish:	{webkitOpacity:"0",pointerEvents:"none"}
			}
Sca.HFADEOUT = {	start:	{webkitOpacity:"1"},
				finish:	{webkitOpacity:"0.5"}
			}			
Sca.GROW = function(par,fin){
	var start = {};
	var finish = {};
	start[par] = "0px";
	finish[par] = fin+"px";
	return {start:start,finish:finish};
}

Sca.WIDTH = function(fin){
	return Sca.GROW("width",fin);
}

Sca.HEIGHT = function(fin){
	return Sca.GROW("height",fin);
}

Sca.MOVEFROM = function(x,y){
    var start = {translate3d:{x:'0px',y:'0px'}};
    var finish = {translate3d:{x:'0px',y:'0px'}};
    x && (start.translate3d.x=x+"px");
    y && (start.translate3d.y=y+"px");
    return {start:start,finish:finish};
}

Sca.OPTIONS = ["opacity","width","height","translate3d",'scale','zoom','rotate','webkitOpacity'];
