window.resize = document.createEvent("UIEvents");
resize.initEvent("resize", false, false);
window.onresize=function(){
    document.dispatchEvent(resize);
};
document.addEventListener("resize",function(){
    app.slideshow.slideWidth = parseInt( window.getComputedStyle(document.querySelector('.slideWrap')).width);
    app.collection.slideWidth = parseInt( window.getComputedStyle(document.querySelector('.slideWrap')).width);
    app.slideshow.slideHeight = parseInt( window.getComputedStyle(document.querySelector('.slideWrap')).height);
    app.collection.slideHeight = parseInt( window.getComputedStyle(document.querySelector('.slideWrap')).height);
    var y= app.slideshow.currentIndex * (-app.slideshow.slideHeight),x = app.collection.currentIndex * (-app.collection.slideWidth);
    app.collection.ele.style.cssText += "-webkit-transform:translate3d(" + x + "px, 0px, 0px);-webkit-transition: 0s;";
    app.slideshow.ele.style.cssText += "-webkit-transform:translate3d(0px, " + y + "px, 0px);-webkit-transition: 0s;";
    document.dispatchEvent(slidePopupEnter);
});
document.addEventListener("resize",function(){
    var isPortrait = window.innerWidth<=786;
    if(!isPortrait && app.collection.id=="vert-magazine"){
        app.goTo("basic",builder.data.currentslideshow);
    } 
});

window.addEventListener("slideExit",function(){
    app.collection.ele.style.webkitTransition = "0.6s"
    app.slideshow.ele.style.webkitTransition = "0.6s"
})
window.addEventListener("sectionEnter",function(){
    if(app.collection.id!= "vert-magazine"){
        app.slideshow.slideWidth = parseInt( window.getComputedStyle(document.querySelector('#presentation')).width);
        app.collection.slideWidth = parseInt( window.getComputedStyle(document.querySelector('#presentation')).width);
        app.collection.slideHeight = parseInt( window.getComputedStyle(document.querySelector('#presentation')).height);
        app.slideshow.slideHeight = parseInt( window.getComputedStyle(document.querySelector('#presentation')).height);
    }
    else{
        app.slideshow.slideWidth = 768;
        app.collection.slideWidth = 768;
    }
})













/*var inFullscreen = function(){
alert('aa')
}
var inExFullscreen = function(){
    app.goTo("basic",builder.data.currentslideshow);
}

document.addEventListener("collectionLoad",function(){
    runIfSlideExist("s_9_2", function(){
        document.getElementsByTagName("video")[0].addEventListener("fullscreen",inFullscreen,true);
       document.getElementsByTagName("video")[0].addEventListener("exitfullscreen",inExFullscreen,true);
    } )
});

document.addEventListener("resize",function(){
    var isPortrait = window.innerWidth<=786;
    if(!isPortrait && app.collection.id=="vert-magazine"){
      document.getElementsByTagName("video")[0].addEventListener("fullscreen",inFullscreen,true)
    }
    else{
       app.goTo("basic",builder.data.currentslideshow);
    }
});

document.addEventListener("resize",function(){
    var isPortrait = window.innerWidth<=786;
    if(!isPortrait && app.collection.id=="vert-magazine"){
       document.getElementById("video_mag").addEventListener("exitfullscreen",inExFullscreen,false)
        app.goTo("basic",builder.data.currentslideshow);
    }
});*/




