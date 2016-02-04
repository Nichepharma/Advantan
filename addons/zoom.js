var ZoomableContent = function(element){
    var that=this;
    this.element=element;
    this.mx = 0;
    this.my = 0;
    this.new_zoom = 1;
    this.current_zoom = 1;
    this.startX = 0;
    this.startY = 0;
    this.prevscale = 1;
    this.gesture = false;
    element.addEventListener('gesturestart', function(event){that.onGestureStart(event);},false);
    element.addEventListener('gestureend', function(event){that.onGestureEnd(event);});
    element.addEventListener('gesturechange', function(event){that.onGestureChange(event);});
}
ZoomableContent.prototype = {
    onGestureStart:function(event){
        event.preventDefault();
	    event.stopPropagation();
        var that=this; 
    	this.gesture = true;
//        console.log(this)

        this.element.addEventListener('touchstart',that.cancelSwipe,false);
        this.element.addEventListener('touchend',that.cancelSwipe,false);
        this.element.addEventListener('touchmove',that.cancelSwipe,false);
    	/*this.element.querySelector('.basic').addClass('webkit_linear_transition')*/
    	this.prevscale = 1;	 
    },
    onGestureChange:function(event){
        event.preventDefault();
	    event.stopPropagation(); 
    	zoom_val = Math.sqrt(event.scale/this.prevscale);
	    this.prevscale = event.scale;
    	if(zoom_val){
    		this.current_zoom *= zoom_val;
    		if(this.current_zoom<1) this.current_zoom=1;
            if(this.current_zoom>3) this.current_zoom=3;
            this.element.querySelector('.basic').style.webkitTransition = 'linear';
            this.element.querySelector('.basic').style.webkitTransform = 'translate3d('+this.mx+'px,'+this.my+'px,0px) scale('+this.current_zoom+')';
        }
    },
    onGestureEnd:function(event){
        event.preventDefault();
        this.gesture = false;   
        var that=this;  
        zoom_val = Math.sqrt(event.scale/this.prevscale);
        this.prevscale = 1;
        if(zoom_val){
    		this.current_zoom *= zoom_val;
    		if(this.current_zoom<1.2) this.current_zoom=1;	
    		if(this.current_zoom>3) this.current_zoom=3;		 
    	}	
    	if(this.current_zoom==1){

    	    this.element.removeEventListener('touchstart',that.start,false);
            var that = this;
    		setTimeout(function(){
    			that.element.removeEventListener('touchend',that.end,false);
    			that.element.removeEventListener('touchmove',that.move,false);
    		},200);		
    		this.element.querySelector('.basic').style.webkitTransition = '500ms linear';
    		this.element.querySelector('.basic').style.webkitTransform = 'translate3d(0px,0px,0px)';
    		this.prevscale = 1;
    		this.mx=0;
    		this.my=0;
    		
    	} else {			
    		this.element.addEventListener('touchstart',that.start = function(){ that.navigate() },false);
            var that = this;
    		setTimeout(function(){
    			that.element.addEventListener('touchend',that.end = function(){ that.stopindivswipe() },false);
    			that.element.addEventListener('touchmove',that.move = function(){ that.indivswipe() },false);
    		},200);		
    	}
    	
    	this.element.removeEventListener('touchstart',that.cancelSwipe,false);
    	this.element.removeEventListener('touchend',that.cancelSwipe,false);
    	this.element.removeEventListener('touchmove',that.cancelSwipe,false);	
    	event.stopPropagation();	 
    },
    cancelSwipe:function(event){
        event.stopPropagation();
    },
    stopindivswipe:function(event){
        event&&event.preventDefault();
    },
    navigate:function(){
        event.preventDefault();
        //event.stopPropagation();
        var that=this;  
    	that.startX = event.clientX||event.touches[0].clientX;
    	that.startY = event.clientY||event.touches[0].clientY;	
    },
    indivswipe:function(){               
        if(this.current_zoom<=1) return;
		event.preventDefault();  
		event.stopPropagation();			
		dx = (event.touches[0].clientX - this.startX);
		this.startX = event.touches[0].clientX;	
		dy = (event.touches[0].clientY - this.startY);
		this.startY = event.touches[0].clientY;					
		this.mx += parseInt(dx);		
		this.my += parseInt(dy);				
		this.element.querySelector('.basic').style.webkitTransition='linear';	
		this.element.querySelector('.basic').style.webkitTransform='translate3d('+this.mx+'px,'+this.my+'px,0px) scale('+this.current_zoom+')';	
    }
}

window.addEventListener('contentLoad',function(){
    //var  test = document.getElementById('presentation');
    //test = new ZoomableContent(test);
    document.querySelectorAll("article").forEach(function(e){
        if (e.querySelector('.basic'))
            e.querySelectorAll('.basic').forEach(function(basic){
                basic= new ZoomableContent(e);
            });
    })
});