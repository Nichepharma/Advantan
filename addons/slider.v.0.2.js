function Slider(elem,attrs,percent){
	var that = this;
    this.percent = typeof percent == 'undefined' ? false : percent;
	this.slider = this.getHTMLElement(elem);
	this.parent = this.slider.parentNode;
    
    try{
	while(this.parent.tagName.toLowerCase()!='article'){
            this.parent = this.parent.parentNode;
        }
    }
   catch(e){
        this.parent = document.getElementById("presentation");
    }
	this.handle = document.createElement('handle');
	this.handle.style.position = getComputedStyle(this.slider)['position']=='absolute' ? 'absolute' : 'relative';
	['top','left'].forEach(function(attr){ that.handle.style[attr] = '0px'; });
	this.handle.style.zIndex = '2';
	this.handle.style.webkitTransform = 'translate(0px,0px)';
	this.slider.appendChild(this.handle); 
	this.labels = [];
	['min','max','value'].forEach(function(attr){ that[attr] = parseInt(that.slider.getAttribute(attr),10)||0; });
	['width','height','top','left'].forEach(function(attr){ that[attr] = parseInt(getComputedStyle(that.slider)[attr],10); });
	['time','step','fill'].forEach(function(attr){ that[attr] = attrs[attr]||false; });
	if(this.fill){
		this.fillHandle = document.createElement('fill');
		this.fillHandle.style.display = 'block';
		this.fillHandle.style.position = getComputedStyle(this.slider)['position']=='absolute' ? 'absolute' : 'relative';	
		['top','left'].forEach(function(attr){ that.fillHandle.style[attr] = '0px'; });
		this.fillHandle.style.height = this.height+'px';
		this.fillHandle.style.background = this.fill;
		this.fillHandle.style.borderRadius = getComputedStyle(this.slider)['border-top-left-radius']||'0px';
		this.fillHandle.style.zIndex = '1';
		this.slider.appendChild(this.fillHandle);
	}
	this.axis = this.width>=this.height ? 'X' : 'Y';
	this.maxTranslate = this[this.axis=='X'?'width':'height'] - parseInt(getComputedStyle(this.handle)[this.axis=='X'?'width':'height'],10);
	this.fold = this.maxTranslate/(this.max-this.min);
	this.isTouch = ('ontouchstart' in window);
	var startEvent = this.isTouch ? 'touchstart' : 'mousedown';
	var moveEvent = this.isTouch ? 'touchmove' : 'mousemove';
	var endEvent = this.isTouch ? 'touchend' : 'mouseup';
	['slider','handle'].forEach(function(obj){ that[obj].that = that; });
	this.handle.addEventListener(startEvent,this.touchStart,false);
	this.handle.addEventListener(moveEvent,this.touchMove,false);
	this.handle.addEventListener(endEvent,this.touchEnd,false);
	[startEvent,moveEvent].forEach(function(_event){
		that.slider.addEventListener(_event,function(e){
			e.preventDefault();
			e.stopPropagation();
			var evt = that.isTouch ? e.touches[0] : e;
			that.sliderClickOffset = evt['client'+that.axis];
		},false);
	});
	this.slider.addEventListener(endEvent,this.sliderTouch,false);
	this.setValue(this.value||this.min);
	['handle','fillHandle'].forEach(function(elem){ 
		if(!that[elem]) return false;
		that[elem].style.webkitTransition = 'none'; //a little fix	
		that[elem].addEventListener('webkitTransitionEnd',function(){
			that[elem].style.webkitTransition = 'none';	
		},false);
	});
	this.isActive = true;
    document.addEventListener("resize",function(){
        that.refresh();
    });
}
Slider.prototype.refresh = function(){
    ['width','height','top','left'].forEach(function(attr){ this[attr] = parseInt(getComputedStyle(this.slider)[attr],10); },this);
    this.maxTranslate = this[this.axis=='X'?'width':'height'] - parseInt(getComputedStyle(this.handle)[this.axis=='X'?'width':'height'],10);
    this.fold = this.maxTranslate/(this.max-this.min);
    this.setValue(this.value,true);
    this.offset=null;

}
Slider.prototype.touchStart = function(e){
	e.preventDefault();
	e.stopPropagation();
	var that = this.that;
	if(!that.isActive) return false;
	var evt = that.isTouch ? e.touches[0] : e;
	if(!that.offset) that.offset = that.getOffset(that.slider,that.parent)[that.axis=='X'?'left':'top'];
	that.translate = that.getTranslate();
	that.handleX = evt['client'+that.axis] - that.offset - that.translate;
	util.addClass(this,'active');
}
Slider.prototype.touchMove = function(e){
	if(!util.hasClass(this,'active')) return false;
	e.preventDefault();
	e.stopPropagation();
	var that = this.that;
	if(!that.isActive) return false;
	var evt = that.isTouch ? e.touches[0] : e;
	that.translate = evt['client'+that.axis] - that.offset - that.handleX;
	that.translate = that.translate<0?0:that.translate>that.maxTranslate?that.maxTranslate:that.translate;
	this.style.webkitTransform = 'translate'+that.axis+'('+that.translate+'px)';
	that.value = that.calcValue();
	that.onchange && that.onchange(that.value);
	that.fill && that.toFill();
	that.setLabels();
}
Slider.prototype.touchEnd = function(e){
	e.preventDefault();
	e.stopPropagation();
	var that = this.that;
	if(!that.isActive) return false;
	var evt = that.isTouch ? e.touches[0] : e;
	util.removeClass(this,'active');
	if(that.step) that.setValue(that.toStep(that.value));	
}
Slider.prototype.sliderTouch = function(e){
	e.preventDefault();
	e.stopPropagation();
	var that = this.that;
	if(!that.isActive) return false;
	if(e.target==that.handle) return false;
	if(!that.offset) that.offset = that.getOffset(that.slider,that.parent)[that.axis=='X'?'left':'top'];
	that.translate = that.sliderClickOffset - that.offset - Math.round(parseInt(getComputedStyle(that.handle)[that.axis=='X'?'width':'height'],10)/2);
	that.translate = that.translate<0?0:that.translate>that.maxTranslate?that.maxTranslate:that.translate;
	var newValue = that.calcValue();
	if(that.step) newValue = that.toStep(newValue);
	that.setValue(newValue);
}
Slider.prototype.getValue = function(){ return this.value; }
Slider.prototype.setValue = function(newValue,isSilent){
	this.value = (newValue>=this.min ? newValue<=this.max ? newValue : this.max : this.min);
	this.translate = (this.value - this.min)*this.fold;
	if(this.time){ 
		this.handle.style.webkitTransition = 'all '+this.time+'ms ease-out';
		if(this.fill) this.fillHandle.style.webkitTransition = 'all '+this.time+'ms ease-out';
	}
	this.handle.style.webkitTransform = 'translate'+this.axis+'('+this.translate+'px)';
	!isSilent && this.onchange && this.onchange(this.value);
	this.fill && this.toFill();
	this.setLabels();
}
Slider.prototype.addLabel = function(elem,pattern){
	var label = this.getHTMLElement(elem);
	var labelPattern = pattern||'_N_';
	var func = new Function('N','return '+labelPattern.split('_')[1]);
	this.labels.push({label:label,pattern:labelPattern,func:func});
}
Slider.prototype.setLabels = function(){
	var that = this;
    if(that.percent){var percent="%";}else{percent = '';}
	if(this.labels.length==0) return false;
	var value = (this.getValue()).toString();
	this.labels.forEach(function(label){
		var pattern = label.pattern.split('_');
		var answer = Math.round(label.func(that.value));
		label.label.innerHTML = pattern[0]+answer.toString()+pattern[2]+percent;
	});
}
Slider.prototype.toFill = function(){
	var half = Math.round(parseInt(getComputedStyle(this.handle)[this.axis=='X'?'width':'height'],10)/2);
	var fillWidth = this.translate+half;
	if(fillWidth+half>=this.width) fillWidth=this.width-half;
	if(fillWidth<=half) fillWidth=half; 
	this.fillHandle.style.width = fillWidth+'px';	
}
Slider.prototype.toStep = function(value){
	var begin = value - value%this.step;
	var end = begin + this.step;
	var newValue = Math.abs(begin-value)<=Math.abs(end-value) ? begin : end;
	return newValue;
}
Slider.prototype.getHTMLElement = function(e){
	return typeof e == 'string' ? /[\*\.\#\>\+\:\s\[\]\(\)]/g.test(e) ? document.querySelector(e) : document.getElementById(e)||document.getElementsByTagName(e)[0] : e instanceof HTMLElement ? e : null;
}
Slider.prototype.getOffset = function(elem,parent){
	elem = this.getHTMLElement(elem);
    var offset = {top: 0, left: 0};
    while(elem && !isNaN(elem.offsetLeft) && !isNaN(elem.offsetTop) && elem!=parent){
        offset.left += elem.offsetLeft;
        offset.top += elem.offsetTop;
        elem = elem.parentNode;
    }
    return offset;
}
Slider.prototype.getTranslate = function(){
	var translate = 0;
	if(/^translate[X|Y]\(([\-0-9\.]+)px\)/g.test(this.handle.style.webkitTransform))
		translate = parseInt(/^translate[X|Y]\(([\-0-9\.]+)px\)/g.exec(this.handle.style.webkitTransform)[1],10);
	return translate;
}
Slider.prototype.setToSlide = function() {
    
}
Slider.prototype.calcValue = function(){ return Math.round(this.translate/this.fold + this.min); }
Slider.prototype.enable = function(){ this.isActive = true; }
Slider.prototype.disable = function(){ this.isActive = false; }

/* View code for test Slider*/
/*window.addEventListener('load',function(){
	var toSlider2 = document.querySelector('#testSlider');
	var testSlider = new Slider(toSlider2,{time:500});	
	var testSlider2 = new Slider('#testSlider2',{time:300,fill:'-webkit-gradient(linear,left top,left bottom,from(red),to(blue))',step:25});
	testSlider.addLabel('#testSliderLabel','_(N+2)*2_%');
	testSlider2.addLabel('testSliderLabel2','+_N_ чел.');
},false);*/
