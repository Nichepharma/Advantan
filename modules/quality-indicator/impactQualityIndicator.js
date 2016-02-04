function IndicatorRatings()  {
    this.bottom = document.getElementById('question_button');
    this.question = document.getElementById('question');
    this.CreateIndicators();
    this.hideShow();
    this.assessment = {}
    this.qaslider.setValue(0);
    document.querySelector('#question_button span').innerText = '?';

};
IndicatorRatings.prototype.CreateIndicators = function(){
    this.qaslider = new Slider('#qa-slider',{time:300});
  //  window.qaslider=this.qaslider;
    this.qaslider.addLabel(document.querySelectorAll("#question_button span")[0]);
}

IndicatorRatings.prototype.PositionIndicator = function(){
    /*document.getElementById(app.slideshow.current).setAttribute('value',this.qaslider.calcValue());*/
    if(this.qaslider.calcValue()>=0 && document.querySelector('#question_button span').innerText != '?' && document.querySelector('#question_button span').innerText){
        this.assessment[app.slideshow.current]=this.qaslider.calcValue();
        window.submitUniqueCustomEvent &&
        window.submitUniqueCustomEvent("Slide rating",document.getElementById(app.slideshow.current).getAttribute("data-monitor"),this.assessment[app.slideshow.current]);
    }
}

IndicatorRatings.prototype.hideShow = function() {
    var that = this;
    this.bottom.addEventListener('click',function(){
        if(!util.hasClass(that.question,'active')){ util.addClass(that.question,'active'); }
        else
        { util.removeClass(that.question,'active'); }
    });
}
IndicatorRatings.prototype.SlideEnter = function (){
    if(app.slideshow.current in  this.assessment){
        this.qaslider.setValue(this.assessment[app.slideshow.current]);
    }
    else {
        document.querySelector('#question_button span').innerText = '?';
    }
    var id=app.slideshow.id;
    if('references1'==id||'references2'==id||'references3'==id||'references4'==id||'home'==id||'builder'==id){this.bottom.style.display = 'none';} else{this.bottom.style.display = 'block';}
}
IndicatorRatings.prototype.reset = function(n) {
    this.qaslider.setValue(n);
    this.hide();
}
IndicatorRatings.prototype.hide = function() {
    if(util.hasClass(this.question,'active')){util.removeClass(this.question,'active');}
}
var ind;
window.addEventListener("load",function(){
    ind =  new IndicatorRatings();
    window.addEventListener("slideEnter",function(){
        ind.SlideEnter();
    });
    document.addEventListener("slidePopupEnter",function(){ind.hide();})
    window.addEventListener("slideExit",function(){
        ind.PositionIndicator();
        ind.reset(0);
    });
});
