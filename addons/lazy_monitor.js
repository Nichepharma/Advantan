
var aldiv = false;
var div;
var time;
var oldAlert=alert;
monitoringEnabled = true;
var alert = function(toa){		
	createDiv = function(toa){	
		aldiv = true;		
		div = document.createElement('div');
		div.style.position = "absolute";
		div.style.background = "#eee";
		div.style.border = "1px dashed green";
		div.style.padding = "20px";
		div.style.width = "300px";
		div.style.left ="20px";
		div.style.top ="20px";
		div.style.zIndex ="10000";
		div.innerHTML = toa.toString() + "<br />";		
		document.body.appendChild(div);		
		//time = setTimeout(close,10000);	
		div.addEventListener("click",close,false)
		return div;
	}

	addToDiv = function(toa){
		aldiv = true;
		clearTimeout(time);
		div.innerHTML += toa.toString() + "<br />";	
		//time = setTimeout(close,10000);	
	}

	close = function(){
		clearTimeout(time);
		aldiv = false;
		document.body.removeChild(div);
	}	
	
	if(aldiv)
		addToDiv(toa);
	else
		createDiv(toa);	
}

 if(!submitSlideEnter) var submitSlideEnter = function(){throw new Error("Не найден submitSlideEnter")}
 if(!submitCustomEvent) var submitCustomEvent = function(){throw new Error("Не найден submitCustomEvent")}
 if(!submitSlideExit) var submitSlideExit = function(){throw new Error("Не найден submitSlideEnd")}
 if(!openPDF) var openPDF = function(){throw new Error("Не найден openPDF")}
        
var submitSlideEnter = (function(submit){
	var wasSubmit = false;
	var tempsubmit = submit;	
	var decor = function(){		
		var args = [].slice.call(arguments);
		try {wasSubmit && submitSlideExit && submitSlideExit();} catch(e){};
		try {			
			tempsubmit.apply(this,arguments);
			//alert(args);
		} catch(e) {
			//alert("Error:"+args+"<br>");
		}
		wasSubmit = true;		
	}	
	return decor;
})(submitSlideEnter);

/*
var submitCustomEvent = (function(submit){
	var tempsubmit = submit;
	var lazysubmit = {};
	var decor = function(){
		var args = [].slice.call(arguments);
		// Remember all data wich we must submit in future
		// If data for this group and label come to us in second time, we replace value to new.
		if(!lazysubmit[args[0]])
			lazysubmit[args[0]]={};
		lazysubmit[args[0]][args[1]] = args[2].toString();
	};
	decor.realSubmit = function(){
		for(var group in lazysubmit){
			var lazysubmitgroup = lazysubmit[group];
			for(var prop in lazysubmitgroup){
				var value = lazysubmitgroup[prop];
				try {
					tempsubmit(group,prop,value);
					alert([group,prop,value]);
				} catch(e) {
					alert("Error:"+[group,prop,value]);
				}
			}
		}
		lazysubmit={}
	}
	return decor;
})(submitCustomEvent);*/

 var submitCustomEvent = (function(submit){
     var tempsubmit = submit;
     var decor = function(group,prop,value){
         try {
             tempsubmit(group,prop,value);
             //alert([group,prop,value]);
         } catch(e) {
             //alert("Error:"+[group,prop,value]);
         }
     }
     return decor;
 })(submitCustomEvent);
if(!submitUniqueCustomEvent) var submitUniqueCustomEvent = submitCustomEvent;

openPDF = (function(func){
    var pdfItemsClicks = {};
	var decorator = function(addr, name){
        if(!request(addr)){
            //oldAlert(addr+" not found");
            //return;
            addr="pdf/test.pdf";
        }
		try {
            if(name != undefined){
                if(pdfItemsClicks[addr] == undefined){
                    pdfItemsClicks[addr] = 0 ;
                }
                window.submitUniqueCustomEvent("References",name,++pdfItemsClicks[addr]);
            }
			submitReferenceOpen(addr.replace(/\W/g,""),addr);
			func.call(this,addr);
		} catch(e) {
			//alert("Error:"+[addr.replace(/\W/g,""),addr]);
		}
	}
    decorator.createCount=function(addr, name){
        if(!pdfItemsClicks.hasOwnProperty(addr)){
            pdfItemsClicks[addr]=0;
            window.submitUniqueCustomEvent("References",name,pdfItemsClicks[addr]);
        }
    }
	return decorator;
	
}(openPDF));





