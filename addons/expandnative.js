var clone = function (o) {
	function c(o) {
		for (var i in o) {
			this[i] = o[i];
		}
	}
	return new c(o);
}

var request = function(path){
    var request =  new XMLHttpRequest();
    request.open("GET", path, false);
    try{request.send(null);}
    catch(e){return null;}
    if ( request.status == 404 || request.status == 2 ||(request.status == 0 && request.responseText == '') ) return null;
    return request.responseText;
};
var runIfSlideExist = function(slides,func){
    if(!(slides instanceof Array)){
        slides = [slides];
    }
    slides.some(function(slide){
         return app.slideshow.content.indexOf(slide)!=-1 || ( app.collection && app.collection.content.some(function(slideshow){
             return app.slideshows[slideshow].content.indexOf(slide)!=-1;
         }));
    }) && func();
}
/************ Array **************/
Array.prototype.getFirstIndexOf = function(fun /*, thisp */){
    if (this === void 0 || this === null || typeof fun !== "function")
        throw new TypeError();
    var t = Object(this);
    var len = t.length >>> 0;
    var thisp = arguments[1];
    for (var i = 0; i < len; i++){
        if (i in t){
            var val = t[i]; // in case fun mutates this
            if (fun.call(thisp, val, i, t))
                return i;
        }
    }
    return -1;
};

if(!Function.prototype.bind) {
  Function.prototype.bind = function (oThis) {
    if (typeof this !== "function") // closest thing possible to the ECMAScript 5 internal IsCallable function
      throw new TypeError("Function.prototype.bind - what is trying to be fBound is not callable");

    var aArgs = Array.prototype.slice.call(arguments, 1),
        fToBind = this,
        fNOP = function () {},
        fBound = function () {
          return fToBind.apply(this instanceof fNOP ? this : oThis || window, aArgs.concat(Array.prototype.slice.call(arguments)));
        };
    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();
    return fBound;
  };
}

HTMLElement.prototype.getParent = function(tag,id,classes){
    var parent=this.parentNode;
    while(parent){
        var isFind=true;
        if(isFind &&  tag ){
            isFind=parent.tagName == tag.toUpperCase();

        }
        if(isFind && id){
            isFind=parent.id == id;
        }
        if(isFind && classes){
            for(var i=0;i<classes.length;i++){
                isFind=parent.hasClass(classes[i]);
                if(!isFind) break;
            }
        }
        if(isFind) break;
		parent = parent.parentNode;
	}
    return parent;
}

HTMLElement.prototype.appbeginChild = function(node) {
    this.firstChild ? this.insertBefore(node, this.firstChild) : this.appendChild(node);
}

HTMLElement.prototype.exchange = function(refNode) {
	var tempParentNode = refNode.parentNode;
	var tempBeforeNode = refNode.nextElementSibling;
	this.parentNode.insertBefore(refNode,this);
	if(tempBeforeNode)
		tempParentNode.insertBefore(this,tempBeforeNode);
	else
		tempParentNode.appendChild(this);
	
	return refNode;
}


/*********************** 00P *************************/
var extend = function(Child, Parent) {
    var F = function() { }
    F.prototype = Parent.prototype;
    Child.prototype = new F();
    Child.prototype.constructor = Child;
    Child.superclass = Parent.prototype;
    if(Parent.prototype.constructor==Object.prototype.constructor){
        Parent.prototype.constructor = Parent;
    }
}

var augment = function(receivingClass, givingClass) {
    /* only provide certain methods */
    if (arguments[2]) {
        for (var i=2, len=arguments.length; i<len; i++) {
            receivingClass.prototype[arguments[i]] = givingClass.prototype[arguments[i]];
        }
    }
    /* provide all methods*/
    else {
        for (methodName in givingClass.prototype) {
            /* check to make sure the receiving class doesn't
               have a method of the same name as the one currently
               being processed */
            if (!receivingClass.prototype[methodName]) {
                receivingClass.prototype[methodName] = givingClass.prototype[methodName];
            }
        }
    }
}
/**************************************************/
augment(NodeList,Array,'forEach','filter','indexOf','map');

String.prototype.substrend = function(length) {
    return this.substr(0,this.length-length);
}

/*
 * This function is intended to extend the String object and provide
 * an String.format API for string formatting.
 * It has to be set up using String.prototype.format = Format.format;
 * Usage:
 * "somestring %s %d".format('hello', 5);
 * It supports %s, %d and %f, for %f it also support precisions like
 * "%.2f".format(1.526)
 */

String.prototype.format = function(){
    var str = this;
    var i = 0;
    var args = arguments;

    return str.replace(/%(?:\.([0-9]+))?(.)/g, function (str, precisionGroup, genericGroup) {
        if (precisionGroup != '' && genericGroup != 'f')
            throw new Error("Precision can only be specified for 'f'");

        switch (genericGroup) {
            case '%':
                return '%';
                break;
            case 's':
                return args[i++].toString();
                break;
            case 'd':
                return parseInt(args[i++]);
                break;
            case 'f':
                if (precisionGroup == '')
                    return parseFloat(args[i++]);
                else
                    return parseFloat(args[i++]).toFixed(parseInt(precisionGroup));
                break;
            default:
                throw new Error('Unsupported conversion character %' + genericGroup);
        }
        return ""; // Suppress warning
    });
}

HTMLElement.prototype.hasClass = function(c){
    var re = new RegExp("(^|\\s)" + c + "(\\s|$)", "g");
    return (re.test(this.className));
}

HTMLElement.prototype.addClass = function(c){
    if (this.hasClass(c)) return this;
    this.className = (this.className + " " + c).replace(/\s+/g, " ").replace(/(^ | $)/g, "");
    return this;
}
HTMLElement.prototype.removeClass = function(c){
    var re = new RegExp("(^|\\s)" + c + "(\\s|$)", "g")
    this.className = this.className.replace(re, "$1").replace(/\s+/g, " ").replace(/(^ | $)/g, "");
    return this;
}

function XmlHttpRequest() {
    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    } else if (window.ActiveXObject) {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    if (xmlhttp == null) {
        alert("Your browser does not support XMLHTTP.");
    }
    return xmlhttp;
}

