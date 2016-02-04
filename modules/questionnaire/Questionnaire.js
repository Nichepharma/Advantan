////////////////////
// Question Model //
////////////////////

function QuestionModel(){
    this.page = [];
}

QuestionModel.prototype = {
    parseFromFile : function(file){
        var that = this;
        var xmlObj = XmlHttpRequest();
        xmlObj.onreadystatechange = function(){
            if(xmlObj.readyState == 4){  // CHECK READY STANCE
                if (xmlObj.responseXML || xmlObj.responseText) {
                    that.page = that.parseXMLtoObj(xmlObj.responseText); // PARSE
                } else {
                    console.log('Error 404 file: ' + file + ' not found');
                }
            }
        }
        xmlObj.open('GET', file, false);
        xmlObj.send('');
    },

    parseXMLtoObj : function(XMLdocObj){ //Parse XML to Object
        var that = this;

        // CUSTOM TAGS CHECK
        var e = document.createElement('div');
        e.innerHTML = XMLdocObj;

        var _body = e.getElementsByTagName('survey')[0], // get first survey tag
        _pages = _body.getElementsByTagName('page');
        //****************FUNCTIONS ***********************
        var getPageData = function(HTMLElements,optionsArr){ //optionsArr - set of options(tags names) for searching
            var Obj = {};
            for (var j in optionsArr) {
                var ElArr = HTMLElements.getElementsByTagName(optionsArr[j]);
                ElArr.forEach(function(el,i){
                    if (ElArr.length > 1) {
                        if (i == 0) {
                            Obj[optionsArr[j]] = []
                            }
                        Obj[optionsArr[j]][i] = el.innerHTML || el.textContent; // Count start from 0 value
                    } else {
                        Obj[optionsArr[j]] = el.innerHTML || el.textContent;
                    }
                })
            }
            return Obj;
        }
        var getPages = function(HTMLElementsArray){ 
            var Obj = [],
            OPTIONS = ['intro_text', 'question', 'input_type', 'answer', 'outro_text', 'picture', 'slider','noLine']; // SET ALL available tags in 'PAGE' TAG
            HTMLElementsArray.forEach(function(el, i){
                Obj[i] = getPageData(el, OPTIONS);  // Adding Pages, Count start from 0 value
            })
            return Obj;
        }
        //*************** END FUNCTIONS *****************

        return getPages(_pages);
    }
}


////////////////////////////////
//   Questionnaire Widgets    //
////////////////////////////////

function Widgets(){
}

Widgets.prototype = {
    attachObject : function(el, gname, attr){
        var getRND = function(){
            var d = new Date(),
                s = d.getDate().toString() +
                    d.getDay().toString() +
                    d.getHours().toString() +
                    d.getMinutes().toString() +
                    d.getSeconds().toString() +
                    d.getMilliseconds().toString();
            return s;
        }
        var ans = (typeof el.answer == 'object' ? el.answer : [el.answer]),
            uid = gname + getRND(),
            html = new EJS({url: 'code/template/widgets.ejs'}).render({type: el.input_type, answer: ans, name: gname, id: uid, attr: attr}),
            e = document.createElement('div');
        e.innerHTML = html;
        return e;
    }
}



////////////////////////////////
// Questionnaire Constructor  //
////////////////////////////////

function Questionnaire(HTMLElementContainer, questionModel, additionalParams){
    var that = this;
    this.page = questionModel.page; // contain questionModel.page's
    if (questionModel.page.length == 0) {console.log('>>no pages'); return}

    this.pageCount = 0; // count of pages, used in this.createPageContainer()
    
    this.container = (typeof HTMLElementContainer == 'object' ? HTMLElementContainer : document.querySelector(HTMLElementContainer)); // Contain Main pageContainer need to hide overflowed pages
    this.container.Questionnaire = this;
    this.pageContainer = {}; // Contain pages
    this.name = this.container.getAttribute('name') || 'Questionnaire';

    this.currentPage = 0; // Information about current page
    this.previousPage = 0; // Information about previous page

    Questionnaire._currentPage = -1; // Private Variable;
    Questionnaire._previousPage = -1; // Private Variable;

    // MONITORING OPTIONS
    this.monitoring = false || additionalParams.monitoring;
    this.consoleLog = false || additionalParams.consoleLog;
    this.alert = false || additionalParams.alert;

    /****** CUSTOM OPTIONS ********/
    this.canBackToFirstPage = false; // THAT ALLOW back to First page when goToPage() index more than pages.length
    this.blockWhenPageChange = true; //Block all action when pages changing

    this.createPageContainer(this.container);
    this.createPages();
    
    this.onPageChangeInit(); // Create Events when page Index Change 
    this.endCreation(); 
    
    Questionnaire._pagesChange = false; // Boolean
    this.goToPage(0);

    
    //Questionnaire._currentPage = -1; // Private Variable;
    //Questionnaire._previousPage = -1; // Private Variable;
    //this.goToPage(0);
    window.addEventListener("resize",function(){that.resizeFunc();});
    
}

Questionnaire.prototype = {
    resizeFunc:function(){

        var w = this.getCS(this.container,'width','i'),
        h = this.getCS(this.container,'height','i');
        if (w && h) {/*All GOOD*/} else {
            // DEFAULT STYLE
            var st = 'position: absolute; left: 0px;  top: 0px; width: 1024px; height: 768px; z-index: 9999; overflow: hidden;';
            this.container.style.cssText = st;
        }
        this.width = w; // width of page
        this.height = h; // height of page
        w = w * this.pageCount;
        
        this.pageContainer.element.style.width =  w + 'px';
        this.pageContainer.element.style.height =  h + 'px';
        this.setStylePosition(- this.width * Questionnaire._currentPage, 0,'0ms');
        
    },
    /************* CREATE PAGE CONTAINER ****************/
    getCS : function(el, styleStr, option){ // Short form to getting element style
        var res; // result
        res = window.getComputedStyle(el)[styleStr];
        switch(option) {
            case 'i' :res = parseInt(res); //integer
                       break;
            case 'f' :res = parseFloat(res); //float
                       break;
        }
        return res;
    },
    createPageContainer : function (ContainerElement) {
        var that = this;

        // Check for width, height values
        var w = this.getCS(ContainerElement,'width','i'),
            h = this.getCS(ContainerElement,'height','i');

        if (w && h) {/*All GOOD*/} else {
            // DEFAULT STYLE
            var st = 'position: absolute; left: 0px;  top: 0px; width: 1024px; height: 768px; z-index: 9999; overflow: hidden;'
            ContainerElement.style.cssText = st;
        }

        var div = document.createElement('div');
        div.addClass('page-wrapper');
        //Generate new width
        this.pageCount = this.page.length; // saving count fo pages

        this.width = w; // width of page
        this.height = h; // height of page

        w = w * this.pageCount;

        div.style.cssText = 'width : ' + w + 'px; height: ' + h + 'px' ;
        ContainerElement.appendChild(div);
        
        this.pageContainer.element = div;

        this.pageContainer.width = that.getCS(div,'width','i'); //pageContainer width
        this.pageContainer.height = that.getCS(div,'height','i'); //pageContainer height

        this.initPageContainerStylePos();
    },
    initPageContainerStylePos : function(){
        var that = this;
        this.pageContainer.element.style.webkitTransition = 'all linear 400ms';       
        this.pageContainer.element.addEventListener('webkitTransitionEnd',function(){
            if (Questionnaire._pagesChange) {
                that.callCustomEvent('questPageChangeEnd',that.container);
                Questionnaire._pagesChange = false;
            }            
        },false);
        this.setStylePosition(0, 0);
    },
    setStylePosition : function(x, y,time){
        time=time||"400ms"
        var x = parseInt(x),
            y = parseInt(y),     
            s1, s2;
        s1 = this.pageContainer.element.style.webkitTransform;
        this.pageContainer.element.style.webkitTransitionDuration=time;
        this.pageContainer.element.style.webkitTransform = 'translate3d(' + x + 'px, ' + y + 'px, 0px)';
        s2 = this.pageContainer.element.style.webkitTransform;
        if (s1 == s2) { // CALL 'questPageChangeEnd' event when no changes
            this.callCustomEvent('questPageChangeEnd',this.container);
            Questionnaire._pagesChange = false;
        }
    },
    callCustomEvent : function(EventName, dst){
        var evObj = document.createEvent('Event');
        evObj.initEvent(EventName, false, false );
        evObj.obj = this;
        if (typeof dst == 'object') {
            dst.dispatchEvent(evObj);
        } else {
            document.dispatchEvent(evObj);
        }
    },
    /****************** CREATE PAGES ******************/
    createPages : function(){
        var that = this;
        // LOAD DATA FROM TEMPLATE
        //WIDGETS
        this.widgets = new Widgets();
        this.page.forEach(function(el,i){
            var name = 'qpage-' + i,
                attr = {};

            if (that.page[i].picture) {
                that.page[i].picture = typeof el.picture == 'object' ? el.picture : [el.picture];
            }

            if (el.input_type == 'slider') {
                var e = document.createElement('div');
                e.innerHTML = el.slider;
                attr.from = parseInt(e.querySelector('from').innerHTML);
                attr.to = parseInt(e.querySelector('to').innerHTML);
            };
            that.page[i].widgetHTML =  that.widgets.attachObject(el, name, attr).innerHTML;
        })

        this.container.querySelector('.page-wrapper').innerHTML = new EJS({url: 'code/template/question.ejs'}).render(that);

        // END LOAD
        this.container.page = this.container.querySelectorAll('.questionnaire-page');
        this.container.insetpage = this.container.querySelectorAll('.questionnaire-page-html');

        //Makes labels clickable for IPAD
        var mkLCl = function(){
            that.container.page.forEach(function(el){
                var tmp = el.querySelectorAll('input'),
                    inp = [];

                tmp.forEach(function(el,i){inp[i] = el;}) // CONVERT FUNCTION TYPE TO OBJECT TYPE

                var clearCheckGrp = function (inp, b){
                    inp.forEach(function(elem){
                        if (b) {
                            elem.value = 'on';
                            elem.checked = 'checked';
                        } else {
                            if (elem.hasAttribute('value')) {elem.removeAttribute('value')}
                            if (elem.hasAttribute('checked')) {elem.removeAttribute('checked')}
                            elem.value = null;
                            elem.checked = null;
                        }
                    })
                };

                inp.forEach(function(element, i){
                    var id = element.getAttribute('id'),
                        label = element.parentNode.querySelector('[for=' + id + ']'), // label
                        type = element.getAttribute('type');

                    var addEvent = function(){
                        if (type == 'radio') {
                            var x1 = function(e){
                                e.stopPropagation();
                                e.preventDefault();
                                clearCheckGrp(inp);
                                element.value = 'on';
                                element.checked = 'checked';
                            }
                            //element.addEventListener(START_EVENT, x1, false);
                            //label.addEventListener(START_EVENT, x1, false);
                            element.parentNode.addEventListener(touchy.events.start, x1, false); // FOR <LI> TAG
                            
                        } else
                        if (type == 'checkbox') {
                            var x1 = function(e){
                                e.stopPropagation();
                                e.preventDefault();
                                if (element.value && element.checked) {
                                    clearCheckGrp([element]);
                                } else {
                                    clearCheckGrp([element], true);
                                }
                            }
                            //element.addEventListener(START_EVENT, x1, false);
                            //label.addEventListener(START_EVENT, x1, false);
                            element.parentNode.addEventListener(touchy.events.start, x1, false); // FOR <LI> TAG
                        }
                    }

                    addEvent();

                });
               
            })
        }

        if ('ontouchstart' in window) {
            that.container.addEventListener(touchy.events.start, function(e){
                e.preventDefault(); // Prevent All EVENTS to DEFAULT -> its disable input on text areas in Chrome but works on Ipad
            }, true);

            mkLCl(); // If Ipad THEN ACTIVATE LABELS FOR CLICK ELSE IN BROWSERS LIKE CHROME THAT PROCEDURE NOT NEEDED
        }

    },
    onPageChangeInit : function(){
        if (this.blockWhenPageChange) {
            var st = this.pageContainer.element.style;
            this.container.addEventListener('questPageChangeStart', function(){
                st.pointerEvents = 'none'; //block user action when page changing
            }, false);
            this.container.addEventListener('questPageChangeEnd', function(){
                st.pointerEvents = 'auto'; //block user action when page changing
            }, false);
        }
    },
    goToPage : function(index) { // Count from 0 || if index more that pages.length than ist rounded as divide by module
        var that = this;
        if (this.canBackToFirstPage) {
            index = (index < 0 ? Math.abs(index) : index);
            index = (index > (this.pageCount - 1) ? index % this.pageCount : index);
        } else {
            index = (index < 0 ? 0 : index);
            index = (index > (this.pageCount - 1) ? (this.pageCount - 1)  : index);
        }
        if (Questionnaire._currentPage != index) {
            this.previousPage = this.currentPage;
            this.currentPage = index;
            if (Questionnaire._currentPage < 0) {
                Questionnaire._previousPage = 0;
            } else {
                Questionnaire._previousPage = Questionnaire._currentPage;
            }            
            Questionnaire._currentPage = index;
            // Init Start Event that changing page
            this.callCustomEvent('questPageChangeStart',this.container);
            // Changing page Container position
            Questionnaire._pagesChange = true;

            this.setStylePosition(- this.width * index, 0);
            this.hideSiblingPages();
        }

    },
    nextPage : function(){
        var i = Questionnaire._currentPage;
        i++;
        this.goToPage(i);
    },
    prevPage : function(){
        var i = Questionnaire._currentPage;
        i--;
        this.goToPage(i);
    },
    hideSiblingPages : function(){
        var that = this,
        d = 1, // Depth of hiding pages near current {Example d = 2 -> [show] [show] [Curent] [show] [show] [hide] [hide]}
        c = Questionnaire._currentPage; // Current page
        this.container.insetpage.forEach(function(el, i){
            var l = c - d, // left pages
            r = c + d, // right pages
            m = that.pageCount- 1; // max count
            l = (l < 0 ? 0 : l);
            r = (r > m ? m : r);

            if (i == c) {
                    el.setAttribute('active','')
                }
            else {
                if (el.hasAttribute('active')){
                        el.removeAttribute('active')
                    }
                }
                    if (i >= l && i <= r){
                            el.style.display = 'block';
                    }	else {
                            el.style.display = 'none';
            }
        });
    },    
    monitorActions : function(){
        var that = this,
            header, pp, type, quest, cp, values = [];
         
        pp = Questionnaire._previousPage; 
        if (this.container.page[pp]) {cp = this.container.page[pp]} else {console.log('>>monitoring Error, bad page index'); return}
        
        if (this.name) {header = this.name}
        if (this.page[pp].input_type) {type = this.page[pp].input_type}
        if (this.page[pp].question) {quest = this.page[pp].question}   

        var i = pp;
            quest = i + ') ' + quest;

        if (type && quest) {
            var getLabel = function(el){
                var id = el.getAttribute('id'),
                    l = el.parentNode.querySelector('[for='+id+']');
                return l;
            }
            if (type == 'slider') {
                var e = cp.querySelectorAll('td div');
                e.forEach(function(el){
                    if (el.hasClass('active')){values[0] = el.innerHTML}
                });
            } else
            if (type == 'radio') {
                var e = cp.querySelectorAll('input');
                e.forEach(function(el, i){
                    if (el.value && el.checked) {
                        values[0] = getLabel(el).innerHTML;
                    }
                });
            } else
            if (type == 'checkbox') {
                var e = cp.querySelectorAll('input');
                e.forEach(function(el, i){
                    if (el.value && el.checked) {
                        values.push(getLabel(el).innerHTML);
                    }
                });
            } else
            if (type == 'text') {
                var v = cp.querySelector('textarea').value;
                if (v) {values[0] = v;}
            }

            if (!values[0]) {values[0] = '>> no actions from user'}


            if (this.consoleLog) {
                var value = '';
                values.forEach(function(el){
                    value += el + '\n\r';
                })
                console.log(header + '\n\r' + quest + '\n\r' + value + '\n\r');
            }


            // START CUSTOM ALERT
            var customAlert = function(str){
                if (!document.body.alertCreated) {
                    var div = document.createElement('div');
                    div.style.cssText = 'word-wrap: break-word; padding: 5px 5px 5px 5px; position: absolute; left: 5px; top: 5px; opacity: 0.5; width: 300px; font: 14px "Arial"; text-align: left; color: white; background: gray; -webkit-border-radius: 5px; border: 1px solid black; z-index: 9999;';
                    div.setAttribute('alert','')
                    document.body.appendChild(div);
                    document.body.alertCreated = true;
                }
                var div = document.body.querySelector('[alert]');
                div.innerHTML = str;
                div.style.display = 'block';
                div.addEventListener(touchy.events.start, function(){
                   div.style.display = 'none';
                },false)
            };
            //END CUSTOM ALERT

            if (this.alert){
                var value = '';
                values.forEach(function(el){
                    value += el + '<br />';
                })
                customAlert(header + '<br />' + quest + '<br />' + value);
            }

            // CUSTOM EVENT FUNCTION
            if (this.monitoring) {
                values.forEach(function(el){
                    try{

                       var str = '' + el;
                       submitCustomEvent(header,  quest, str);
                       submitCustomEvent.realSubmit();

                    } catch(e) {
                        console.log(e);
                    }
                })
            }
        }
    },
    endCreation : function(){
        var that = this;


        // ADD CLICK EVENT FOR ARROWS
        that.pageContainer.element.querySelectorAll('.next-page').forEach(function(el){
            el.addEventListener(touchy.events.start, function(e){
                e.preventDefault();
                e.stopPropagation();
                that.nextPage();
            }, false);
        });
        that.pageContainer.element.querySelectorAll('.prev-page').forEach(function(el){
            el.addEventListener(touchy.events.start, function(e){
                e.preventDefault();
                e.stopPropagation();
                that.prevPage();
            }, false);
        });

        //ADD SLIDER WIDGET FOR PAGES WITH THAT TYPE
        var a = this.container.querySelectorAll('.questionnaire-page [slider-container] [slider-range]');
        a.forEach(function(el){
            el.sl = new Slider(el, {time:1, step: 1});
            var s = el.parentNode.querySelectorAll('table td div');
            s.forEach(function(e,i){
                e.addEventListener(touchy.events.start, function(){
                    el.sl.setValue(i + 1);
                }, true);
            });

            var x1 = function(val){
                var s = el.parentNode.querySelectorAll('table td div'); // Changed NUM color when changed slider value
                s.forEach(function(e,i){
                    if (i == (val - 1)) {
                        e.className = 'active';
                    } else {
                        e.className = '';
                    }
                })
            }

            el.sl.onchange = function(val){
                x1(val);
            };
            //el.addEventListener('sliderTouchEnd', ,false)
        })

        //CHANGE STYLE OF ARROWS ON THE FIRST AND LAST PAGE
        this.container.addEventListener('questPageChangeStart', function(e){
            var chngClass = function(selector, onoff) {
                var a = e.obj.container.page[e.obj.currentPage].querySelector(selector);
                if (onoff) { // on
                    if (a.hasClass('off')) {a.removeClass('off');}
                    a.addClass('on');
                } else { //off
                    if (a.hasClass('on')) {a.removeClass('on');}
                    a.addClass('off');
                }
            }
            var cp = e.obj.currentPage, // currentPage
                    max = e.obj.pageCount - 1, // maxIndex
                    min = 0; //minIndex

            if (cp == max && cp != min) {chngClass('.prev-page', true);chngClass('.next-page')} else
            if (cp == min && cp != max) {chngClass('.prev-page');chngClass('.next-page', true)} else
            if (cp > min && cp < max) {chngClass('.prev-page', true);chngClass('.next-page', true)} else 
            {
                chngClass('.prev-page', false);chngClass('.next-page', false);
            }
            //console.log('start change')
        }, false);


        /** HISTORY **/
        this.isIntroInPages = 0; // Variable for saving info about intro page
        this.page.forEach(function(el){ // Check Intro_text in result of parsed XML
            if (el.intro_text) {
                that.isIntroInPages++;
            }
        });

        this.container.addEventListener('questPageChangeEnd', function(e){
            //console.log('questPageChangeEnd');                      
        }, false);

        //MONITOR USER ACTIONS
        if (this.monitoring || this.consoleLog || this.alert) {
            this.container.addEventListener('questPageChangeStart', function(){
                //console.log('questPageChangeStart');
                var uniqname = 'DSSQP' + Questionnaire._currentPage;
                if (that.isIntroInPages) {
                    if ((Questionnaire._currentPage + 1) > that.isIntroInPages) {
                        that.monitorActions();
                        submitSlideEnter(uniqname, that.getCurrentPageName(), Questionnaire._currentPage);
                    }
                } else {                    
                    if (Questionnaire._currentPage != Questionnaire._previousPage) {that.monitorActions()};
                    submitSlideEnter(uniqname, that.getCurrentPageName(), Questionnaire._currentPage);
                }
            }, false);
        }

        this.callCustomEvent('questionnaireCreated',this.container);
    },
    getCurrentPageName : function(){
        var pageName = this.page[Questionnaire._currentPage].question ||
                       this.page[Questionnaire._currentPage].intro_text ||
                       this.page[Questionnaire._currentPage].outro_text ||
                       'Empty page header';
        return pageName;
    }
}

////////////////////////////////
// Questionnaire Indicator    //
////////////////////////////////

function QuestionnaireIndicator(HTMLElementContainer, HTMLElementText, QuestionnaireObj){
    this.container = (typeof HTMLElementContainer == 'object' ? HTMLElementContainer : document.querySelector(HTMLElementContainer));
    this.outText = (typeof HTMLElementText == 'object' ? HTMLElementText : document.querySelector(HTMLElementText));

    if (!QuestionnaireObj) {console.log('QuestionnaireObj missed')}
    
    this.questionnaire = QuestionnaireObj;
    if (this.questionnaire.page.length == 0) {console.log('>>no pages for indicator'); return}
    
    this.questionnaire.indicator = this;

    this.createElement();
    this.initIndicator();
    this.connectToEvents();
    this.addQuestPreview();
}

QuestionnaireIndicator.prototype = {
    createElement : function(){
        var that = this,
            table = document.createElement('table'),
            tr = document.createElement('tr');
        
        table.appendChild(tr);
        table.addClass('Steps_Background');

        this.isIntroInPages = 0; // Variable for saving info about intro page
        this.questionnaire.page.forEach(function(el){ // Check Intro_text in result of parsed XML
            if (el.intro_text) {
                that.isIntroInPages++;
            }
        });

        for (var i = 0; i < this.questionnaire.page.length;i++) { // Ignore Intro_Page and create indicators for other pages
             var td = document.createElement('td');
             td.className = 'unactive';
             td.addClass('Steps_Progress_Background');
             if (i < that.isIntroInPages) {
                 td.style.cssText += 'display: none;'; // Hide Cell for Intro page
             }
             tr.appendChild(td);
        }

        this.container.appendChild(table);
    },
    initIndicator: function(){
        var that = this;
        var trs = this.container.querySelectorAll('td');
        this.questionnaire.page.forEach(function(el,i){
            if (i <= that.questionnaire.currentPage && trs[i].hasClass('unactive')) { // SET ACTIVE CELL
                trs[i].removeClass('unactive');
                trs[i].addClass('active');
            } else if (i > that.questionnaire.currentPage && trs[i].hasClass('active')) { // SET UNACTIVE CELL
                trs[i].removeClass('active');
                trs[i].addClass('unactive');
            }
        });
        var f = this.questionnaire.currentPage + 1 - this.isIntroInPages, // Current page for indicator
            cp = (f <= 0 ? 0 : f),
            pl = this.questionnaire.page.length - this.isIntroInPages, // max pages for indicator
            s = cp + '/' + pl; // SET OUTPUT TEXT VALUE
        this.outText.innerHTML = s;

        return;
        if (cp == pl || cp == 0) { // HIDE TEXT ON LAST AND FIRST PAGE
            this.outText.style.opacity = '0';
        } else if (this.outText.style.opacity == '0'){
            this.outText.style.opacity = '';
        }
    },
    connectToEvents: function(){
        var that = this;
        this.questionnaire.container.addEventListener('questPageChangeStart', function(e){
            that.initIndicator();
            that.container.querySelector('.QuestionPopup').pop.hide();
        } ,false);
    },
    addQuestPreview: function(){
        var that = this,
            trs = this.container.querySelectorAll('td');
        

        function Quest_popup(){
            var tis = this;
            var div = document.createElement('div');
            div.addClass('QuestionPopup');
            div.style.webkitTransition = 'all linear 300ms';
            div.style.opacity = 0;
            div.style.pointerEvents = 'none';
            div.pop = this;
            
            this.elem = div;

            div.addEventListener(touchy.events.start, function(){
                that.container.querySelector('.QuestionPopup').pop.hide();
            }, true);

            var tc = document.createElement('div');
                tc.addClass('aligner');
            var textstr = document.createElement('div');
            textstr.addClass('text-container');

            tc.appendChild(textstr);
            div.appendChild(tc);

            this.corner = document.createElement('div');
            this.corner.addClass('popup-corner');

            div.appbeginChild(this.corner);

            that.container.appendChild(div);

            this.width = parseInt(window.getComputedStyle(that.questionnaire.container.querySelector('.questionnaire-indicator'))['width']);
            this.height = parseInt(window.getComputedStyle(that.questionnaire.container.querySelector('.questionnaire-indicator'))['height']);
            
            this.cornerwidth = parseInt(window.getComputedStyle(this.elem.querySelector('.popup-corner'))['width']);
            this.cornerheight = parseInt(window.getComputedStyle(this.elem.querySelector('.popup-corner'))['height']);
            this.cornerhalf = Math.round(this.cornerwidth / 2);
            
            this.steps = parseInt(this.width / (that.questionnaire.pageCount - that.isIntroInPages)) ;
            this.half = Math.round(this.steps / 2);
            this.popwidth = parseInt(window.getComputedStyle(this.elem)['width']);
            this.popheight = parseInt(window.getComputedStyle(this.elem)['height']);
            
            
            this.translateY = this.height + this.cornerheight + this.popheight;
            
            this.elem.style.webkitTransform = 'translate3d(0, ' + -this.translateY + 'px, 0)';            

            this.hide = function(){
                tis.elem.style.opacity = 0;
                tis.elem.style.pointerEvents = 'none';
            };
            this.show = function(e, i){
                var y = Math.round(tis.steps * (i - that.isIntroInPages));
                if (y > (tis.width - tis.popwidth)) {
                    var x = (tis.width - tis.popwidth),
                        r = tis.popwidth - tis.steps * (that.questionnaire.pageCount - i),
                        z = r + (tis.half - tis.cornerhalf);   
                    tis.elem.style.webkitTransform = 'translate3d(' + x + 'px , -' + tis.translateY + 'px, 0)';
                    tis.corner.style.webkitTransform = 'translate3d(' + z + 'px , 0px, 0px)';  
                } else {
                    var b = (tis.steps > tis.popwidth) ? true : false;
                        tp = tis.half - tis.cornerhalf,
                        z = (b) ? Math.round(tis.popwidth / 2 - tis.cornerhalf) : tp,
                        te = y + Math.round(i / 2),
                        x = (b) ? Math.round(tis.steps / 2 - tis.popwidth / 2) : te;
                    tis.elem.style.webkitTransform = 'translate3d(' + x + 'px , -' + tis.translateY + 'px, 0px)';
                    tis.corner.style.webkitTransform = 'translate3d(' + z + 'px , 0px, 0px)';
                }

                tis.elem.style.opacity = 1;
                tis.elem.style.pointerEvents = 'auto';
            }
        }

        new Quest_popup();

        trs.forEach(function(el, i){

            el.addEventListener(touchy.events.start, function(e){
                var str = that.questionnaire.page[i].question || '';
                if (str) {
                    if (str.length > 100) {str = str.substr(0, 95) + '...';}
                    var tmpel = that.container.querySelector('.QuestionPopup');
                    tmpel.querySelector('.text-container').innerHTML = str;
                    tmpel.pop.show(e, i);
                }
            }, true);
        })
    }
}

