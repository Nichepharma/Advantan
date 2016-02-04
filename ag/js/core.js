(function() {
    var Collection,
    InlineSlideshow,
    MemoryManager,
    Presentation,
    Slidescroller,
    Slideshow,
    d;
    var __bind = function(fn, me) {
        return function() {
            return fn.apply(me, arguments)
            }
    },
    __indexOf = Array.prototype.indexOf || function(item) {
        for (var i = 0, l = this.length; i < l; i++) {
            if (this[i] === item) {
                return i
            }
        }
        return - 1
    },
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) {
        for (var key in parent) {
            if (__hasProp.call(parent, key)) {
                child[key] = parent[key]
                }
        }
        function ctor() {
            this.constructor = child
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor;
        child.__super__ = parent.prototype;
        return child
    };
    d = document;
    window.presentationInit = d.createEvent("UIEvents");
    window.slideshowLoad = d.createEvent("UIEvents");
    window.slideshowUnload = d.createEvent("UIEvents");
    window.collectionLoad = d.createEvent("UIEvents");
    window.collectionUnload = d.createEvent("UIEvents");
    window.inlineSlideshowLoad = d.createEvent("UIEvents");
    window.inlineSlideshowUnload = d.createEvent("UIEvents");
    window.contentLoad = d.createEvent("UIEvents");
    window.contentUnload = d.createEvent("UIEvents");
    window.slideEnter = d.createEvent("UIEvents");
    window.slideExit = d.createEvent("UIEvents");
    window.sectionEnter = d.createEvent("UIEvents");
    window.sectionExit = d.createEvent("UIEvents");
    window.inlineSlideEnter = d.createEvent("UIEvents");
    window.inlineSlideExit = d.createEvent("UIEvents");
    presentationInit.initEvent("presentationInit", false, false);
    slideshowLoad.initEvent("slideshowLoad", true, false);
    slideshowUnload.initEvent("slideshowUnload", true, false);
    collectionLoad.initEvent("collectionLoad", true, false);
    collectionUnload.initEvent("collectionUnload", true, false);
    inlineSlideshowLoad.initEvent("inlineSlideshowLoad", true, false);
    inlineSlideshowUnload.initEvent("inlineSlideshowUnload", true, false);
    contentLoad.initEvent("contentLoad", true, false);
    contentUnload.initEvent("contentUnload", true, false);
    slideEnter.initEvent("slideEnter", true, false);
    slideExit.initEvent("slideExit", true, false);
    sectionEnter.initEvent("sectionEnter", true, false);
    sectionExit.initEvent("sectionExit", true, false);
    inlineSlideEnter.initEvent("inlineSlideEnter", true, false);
    inlineSlideExit.initEvent("inlineSlideExit", true, false);
    window.Presentation = Presentation = (function() {
        function Presentation(config) {
            var collection,
            slideshow,
            _i,
            _j,
            _len,
            _len2,
            _ref,
            _ref2;
            window.app = this;
            this.type = config.type || "dynamic";
            this.orientation = config.orientation || "landscape";
            this.country = config.country || "en";
            this.version = config.version || "0.1";
            this.slides = config.slideshows || {};
            this.sections = config.collections || {};
            this.slideshowIds = Object.keys(this.slides);
            this.collectionIds = Object.keys(this.sections);
            this.loaded = null;
            this.slideshows = {};
            this.collections = {};
            if (this.type === "json") {
                this.getData()
                }
            this.getElements();
            this.getAllSlides();
            _ref = this.slideshowIds;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                slideshow = _ref[_i];
                this.register(slideshow, this.slides[slideshow])
                }
            _ref2 = this.collectionIds;
            for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
                collection = _ref2[_j];
                this.register(collection, this.sections[collection], "collection")
                }
            document.dispatchEvent(presentationInit);
            return
        }
        Presentation.prototype.add = function(name, content, type) {
            var _i;
            type = type || "slideshow";
            if (type === "slideshow") {
                this.slideshowIds.push(name);
                //add
                this.slides[name]=content;
                for(_i=0;_i<content.length;_i++){
                    if(!(content[_i] in this.slide)){
                        this.slide[content[_i]]={};
                        ["onLoad", "onUnload", "onEnter", "onExit"].forEach(function(metod){
                             this.slide[content[_i]][metod]=function(){};
                        },this);
                    }
                }
            } else {
                this.collectionIds.push(name);
                //add
                this.sections[name]=content;
            }
            this.register(name, content, type)
        };
        Presentation.prototype.register = function(name, content, type) {
            type = type || "slideshow";
            if (type === "slideshow") {
                this.slideshows[name] = new Slideshow(name, content)
                } else {
                this.collections[name] = new Collection(name, content)
                }
        };
        Presentation.prototype.load = function(name, type) {
            var evt;
            evt = slideshowLoad;
            type = type || "slideshow";
            if (this.loaded) {
                this.unLoad()
                }
            if (type === "slideshow") {
                this.slideshow = this.loaded = this.slideshows[name];
                this.collection = null;
                this.loaded.onLoad()
                } else {
                evt = collectionLoad;
                this.collection = this.loaded = this.collections[name];
                this.slideshow = null;
                this.loaded.onLoad();
                this.setCurrent(this.collection.content[0]);
                this.insertSections(this.collection.content, this.collection.ele)
                }
            this.elements.presentation.setAttribute("class", name);
            this.insert(this.loaded);
            this.getSlides();
            this.loaded.ele.dispatchEvent(evt);
            this.loaded.ele.dispatchEvent(contentLoad);
            if (type === "collection") {
                this.slideshow.ele.dispatchEvent(sectionEnter)
                }
            this.slideshow.scrollTo(0)
            };
        Presentation.prototype.unLoad = function() {
            var evt,
            type;
            type = this.loaded.constructor.name;
            evt = type === "Slideshow" ? slideshowUnload: collectionUnload;
            this.loaded.ele.dispatchEvent(evt);
            this.loaded.ele.dispatchEvent(contentUnload);
            this.loaded.onUnload();
            this.remove(this.loaded)
            this.loaded=null;
        };
        Presentation.prototype.insert = function(slideshow, container) {
            container = container || this.elements.slideshows;
            container.appendChild(slideshow.ele)
            };
        Presentation.prototype.insertSections = function(sections, container) {
            var slideshow,
            ss,
            _i,
            _len;
            for (_i = 0, _len = sections.length; _i < _len; _i++) {
                slideshow = sections[_i];
                ss = this.slideshows[slideshow];
                ss.direction = "vertical";
                this.slideshows[slideshow].onLoad();
                this.insert(this.slideshows[slideshow], this.loaded.ele)
            }
        };
        Presentation.prototype.remove = function(slideshow, container) {
            container = container || this.elements.slideshows;
            container.removeChild(slideshow.ele)
            };
        Presentation.prototype.getData = function(path, callback) {
            var xhr;
            xhr = new XMLHttpRequest();
            xhr.open("GET", path, false);
            xhr.onreadystatechange = __bind(function() {
                if (xhr.readyState !== 4) {
                    return
                }
                if (xhr.status !== 0 && xhr.status !== 200) {
                    if (xhr.status === 400) {
                        console.log("Could not locate " + path)
                        } else {
                        console.error("app.getData " + path + " HTTP error: " + xhr.status)
                        }
                    return
                }
                return callback(JSON.parse(xhr.responseText))
                }, this);
            xhr.send();
            console.log("Getting JSON data")
            };
        Presentation.prototype.getHtml = function(name, path, callback) {
            var xhr;
            if (path == null) {
                path = "content/slides/"
            }
            path = path + name + ".html";
            xhr = new XMLHttpRequest();
            xhr.open("GET", path, false);
            xhr.onreadystatechange = __bind(function() {
                if (xhr.readyState !== 4) {
                    return
                }
                if (xhr.status !== 0 && xhr.status !== 200) {
                    if (xhr.status === 400) {
                        console.log("Could not locate " + path)
                        } else {
                        console.error("app.getHtml " + path + " HTTP error: " + xhr.status)
                        }
                    return
                }
                return callback(xhr.responseText)
                }, this);
            xhr.send()
            };
        Presentation.prototype.getAllSlides = function() {
            var addEmptyFunctions,
            arr,
            name,
            slide,
            slideMethods,
            _i,
            _len,
            _ref;
            this.allSlides = [];
            this.slide = {};
            slideMethods = ["onLoad", "onUnload", "onEnter", "onExit"];
            addEmptyFunctions = function(slide) {
                var method,
                _i,
                _len,
                _results;
                app.slide[slide] = {};
                _results = [];
                for (_i = 0, _len = slideMethods.length; _i < _len; _i++) {
                    method = slideMethods[_i];
                    _results.push(app.slide[slide][method] = function() {})
                    }
                return _results
            };
            _ref = this.slides;
            for (name in _ref) {
                arr = _ref[name];
                for (_i = 0, _len = arr.length; _i < _len; _i++) {
                    slide = arr[_i];
                    if (__indexOf.call(this.allSlides, slide) < 0) {
                        this.allSlides.push(slide);
                        addEmptyFunctions(slide)
                        }
                }
            }
        };
        Presentation.prototype.getElements = function() {
            this.elements = this.elements || {};
            this.elements.presentation = document.getElementById("presentation");
            this.elements.slideshows = document.getElementById("slideshows");
            this.elements.loader = document.getElementById("loader")
            };
        Presentation.prototype.getSlides = function() {
            var slide,
            slides,
            _i,
            _len;
            this.slideElements = {};
            slides = document.querySelectorAll(".slide");
            for (_i = 0, _len = slides.length; _i < _len; _i++) {
                slide = slides[_i];
                this.slideElements[slide.id] = slide
            }
        };
        Presentation.prototype.goTo = function(name, content, subcontent) {
            var type,
            _ref;
            type = __indexOf.call(this.slideshowIds, name) >= 0 ? "slideshow": "collection";
            if (type === "slideshow") {
                if (!this.slideshow || name !== this.slideshow.id) {
                    this.load(name)
                    }
                if (content) {
                    this.slideshow.scrollTo(content)
                    }
            } else {
                if (name !== ((_ref = this.collection) != null ? _ref.id: void 0)) {
                    this.load(name, "collection")
                    }
                if (content && content !== this.slideshow.id) {
                    this.collection.scrollTo(content)
                    }
                if (subcontent) {
                    this.slideshow.scrollTo(subcontent)
                    }
            }
        };
        Presentation.prototype.setCurrent = function(name) {
            this.slideshow = this.slideshows[name]
            };
        return Presentation
    })();
    window.Slideshow = Slideshow = (function() {
        function Slideshow(id, content, config) {
            this.id = id;
            this.content = content;
            this.config = config != null ? config: {};
            this.type = "slideshow";
            this.direction = this.config.direction || "horizontal";
            this.dimensions = this.config.dimensions || [1024, 768];
            this.current = this.content[0];
            this.currentIndex = 0;
            this.length = this.content.length;
            this.markup = ""
        }
        Slideshow.prototype._createElement = function() {
            var section;
            section = document.createElement("section");
            section.setAttribute("id", this.id);
            section.setAttribute("class", "slideshow");
            this.ele = section
        };
        Slideshow.prototype._destroyElement = function() {
            this.ele = null
        };
        Slideshow.prototype._isValid = function(name) {
            return __indexOf.call(this.content, name) >= 0
        };
        Slideshow.prototype._reset = function() {
            this.direction = "horizontal";
            this.current = this.content[0];
            this.currentIndex = 0;
            this.length = this.content.length;
            this.markup = ""
        };
        Slideshow.prototype._scroll = function(nr) {
            var previous,
            slide,
            x,
            y;
            slide = app.slideElements[this.content[nr]];
            previous = app.slideElements[this.current];
            x = 0;
            y = 0;
            if (this.direction === "horizontal") {
                x = nr * -this.slideWidth
            } else {
                y = nr * -this.slideHeight
            }
            if (slide !== previous) {
                previous.dispatchEvent(slideExit);
                app.slide[this.current].onExit(previous)
                }
            this.ele.style.cssText += "-webkit-transform:translate3d(" + x + "px, " + y + "px, 0px);";
            this._setCurrent(nr);
            slide.dispatchEvent(slideEnter);
            app.slide[this.current].onEnter(slide)
            };
        Slideshow.prototype._setCurrent = function(content) {
            var type;
            type = typeof content;
            if (type === "string") {
                this.current = content;
                this.currentIndex = this.getIndex(content)
                } else {
                if ("number") {
                    this.current = this.content[content];
                    this.currentIndex = content
                }
            }
        };
        Slideshow.prototype._setMeasurements = function() {
            this.slideWidth = this.dimensions[0];
            this.slideHeight = this.dimensions[1];
            if (this.direction === "horizontal") {
                this.width = this.slideWidth * this.length
            } else {
                this.width = this.slideWidth
            }
        };
        Slideshow.prototype.get = function(name) {
            if (name) {
                return document.getElementById(name)
                } else {
                return document.getElementById(this.current)
                }
        };
        Slideshow.prototype.getIndex = function(name) {
            if (name && this._isValid(name)) {
                return this.content.indexOf(name)
                } else {
                return this.content.indexOf(this.current)
                }
        };
        Slideshow.prototype.getSlide = function(name, path) {
            var xhr;
            if (path == null) {
                path = "content/slides/"
            }   
            path = path + name + ".html";
            xhr = new XMLHttpRequest();
            xhr.open("GET", path, false);
            xhr.onreadystatechange = __bind(function() {
                if (xhr.readyState !== 4) {
                    return
                }
                if (xhr.status !== 0 && xhr.status !== 200) {
                    if (xhr.status === 400) {
                        console.log("Could not locate " + path)
                        } else {
                        console.error("Slideshow.getSlide " + path + " HTTP error: " + xhr.status)
                        }
                    return
                }
                return this.markup += '<div class="slideWrap">' + xhr.responseText + "</div>"
            }, this);
            return xhr.send()
            };
        Slideshow.prototype.onLoad = function() {
            var slide,
            _i,
            _len,
            _ref;
            this._setMeasurements();
            this._createElement();
            _ref = this.content;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                slide = _ref[_i];
                this.getSlide(slide)
                }
            this.ele.style.cssText = /*"width:" + this.width + "px;*/"-webkit-transform:translate3d(0px, 0px, 0px);";
            return this.ele.innerHTML = this.markup
        };
        Slideshow.prototype.onUnload = function() {
            var previous;
            previous = app.slideElements[this.current];
            previous.dispatchEvent(slideExit);
            app.slide[this.current].onExit(previous);
            this._reset()
            };
        Slideshow.prototype.next = function() {
            if (this.currentIndex < this.length - 1) {
                this._scroll(this.currentIndex + 1)
                }
        };
        Slideshow.prototype.previous = function() {
            if (this.currentIndex > 0) {
                this._scroll(this.currentIndex - 1)
                }
        };
        Slideshow.prototype.scrollTo = function(content) {
            var type;
            type = typeof content;
            if (type === "string") {
                this._scroll(this.getIndex(content))
                } else {
                if ("number") {
                    this._scroll(Math.abs(content))
                    }
            }
        };
        Slideshow.prototype.scrollToEnd = function() {
            this._scroll(this.length - 1)
            };
        Slideshow.prototype.scrollToStart = function() {
            this._scroll(0)
            };
        return Slideshow
    })();
    window.Collection = Collection = (function() {
        __extends(Collection, Slideshow);
        function Collection() {
            Collection.__super__.constructor.apply(this, arguments)
            }
        Collection.prototype._resetSection = function() {
            var ss;
            ss = app.slideshow;
            return setTimeout(function() {
                ss.ele.style.cssText += "-webkit-transform:translate3d(0px, 0px, 0px);";
                return ss._setCurrent(0)
                }, 600)
            };
        Collection.prototype._scroll = function(nr) {
            var collection,
            currentSlide,
            nextSlide,
            previous,
            x,
            y;
            collection = app.slideshows[this.content[nr]];
            previous = app.slideshows[this.current];
            nextSlide = app.slideElements[collection.content[0]];
            currentSlide = app.slideElements[previous.content[0]];
            x = 0;
            y = 0;
            if (this.direction === "horizontal") {
                x = nr * -this.slideWidth
            } else {
                y = nr * -this.slideHeight
            }
            previous.ele.dispatchEvent(sectionExit);
            currentSlide.dispatchEvent(slideExit);
            app.slide[currentSlide.id].onExit(currentSlide);
            this.ele.style.cssText += "-webkit-transform:translate3d(" + x + "px, " + y + "px, 0px);";
            this._resetSection();
            this._setCurrent(nr);
            app.setCurrent(this.current);
            collection.ele.dispatchEvent(sectionEnter);
            nextSlide.dispatchEvent(slideEnter);
            return app.slide[nextSlide.id].onEnter(nextSlide)
            };
        Collection.prototype.onLoad = function() {
            this.type = "collection";
            this._setMeasurements();
            this._createElement();
            this.ele.style.cssText = "width:" + this.width + "px;-webkit-transform:translate3d(0px, 0px, 0px);";
            return this.ele.setAttribute("class", "collection")
            };
        Collection.prototype.onUnload = function() {
            var collection,
            currentSlide,
            section,
            _i,
            _len,
            _ref,
            _results;
            collection = app.slideshows[this.current];
            currentSlide = app.slideElements[collection.content[0]];
            currentSlide.dispatchEvent(slideExit);
            app.slide[currentSlide.id].onExit(currentSlide);
            collection.ele.dispatchEvent(sectionExit);
            this._reset();
            _ref = this.content;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                section = _ref[_i];
                _results.push(app.slideshows[section]._reset())
                }
            return _results
        };
        return Collection
    })();
    window.InlineSlideshow = InlineSlideshow = (function() {
        __extends(InlineSlideshow, Slideshow);
        function InlineSlideshow(id, config) {
            this.id = id;
            this.config = config != null ? config: {};
            this.type = "inline";
            this.content = app.slideshows[this.id].content;
            this.direction = this.config.direction || "horizontal";
            this.dimensions = this.config.dimensions || [1024, 768];
            this.current = this.content[0];
            this.currentIndex = 0;
            this.length = this.content.length;
            this.elements = {};
            this.markup = ""
        }
        InlineSlideshow.prototype._createElement = function() {
            var section;
            section = document.createElement("section");
            section.setAttribute("id", this.id);
            section.setAttribute("class", "inline-slideshow");
            this.ele = section
        };
        InlineSlideshow.prototype._scroll = function(nr) {
            var previous,
            slide,
            x,
            y;
            slide = app.slideElements[this.content[nr]];
            previous = app.slideElements[this.current];
            x = 0;
            y = 0;
            if (this.direction === "horizontal") {
                x = nr * -this.slideWidth
            } else {
                y = nr * -this.slideHeight
            }
            if (slide !== previous) {
                previous.dispatchEvent(inlineSlideExit);
                app.slide[this.current].onExit(previous)
                }
            this.ele.style.cssText += "-webkit-transform:translate3d(" + x + "px, " + y + "px, 0px);";
            this._setCurrent(nr);
            slide.dispatchEvent(inlineSlideEnter);
            app.slide[this.current].onEnter(slide)
            };
        InlineSlideshow.prototype.load = function(container) {
            app.inline = this;
            this.onLoad();
            app.insert(this, container);
            app.getSlides();
            this.ele.dispatchEvent(inlineSlideshowLoad);
            app.inline.scrollTo(0)
            };
        InlineSlideshow.prototype.unLoad = function() {
            this.ele.dispatchEvent(inlineSlideshowUnload);
            app.inline = null;
            this._reset()
            };
        return InlineSlideshow
    })();
    window.Slidescroller = Slidescroller = (function() {
        function Slidescroller(id) {
            this.id = id;
            this._down = __bind(this._down, this);
            this._up = __bind(this._up, this);
            this._previous = __bind(this._previous, this);
            this._next = __bind(this._next, this);
            this.ele = app.elements.presentation;
            this.type = "slideshow";
            this.actions = {
                left: this._next,
                right: this._previous,
                up: this._up,
                down: this._down
            };
            this._connect()
            }
        Slidescroller.prototype._connect = function() {
            document.addEventListener("contentLoad", __bind(function() {
                if (this.id === app.loaded.id) {
                    this.ele = document.getElementById(this.id)
                    }
                return this.type = app.loaded.type
            }, this));
            this.enableAll()
            };
        Slidescroller.prototype._next = function(event) {
            if (this.type === "slideshow") {
                this._nextSlide(event)
                } else {
                this._nextSection(event)
                }
        };
        Slidescroller.prototype._previous = function(event) {
            if (this.type === "slideshow") {
                this._previousSlide(event)
                } else {
                this._previousSection(event)
                }
        };
        Slidescroller.prototype._up = function(event) {
            if (this.type === "collection") {
                this._nextSlide(event)
                }
        };
        Slidescroller.prototype._down = function(event) {
            if (this.type === "collection") {
                this._previousSlide(event)
                }
        };
        Slidescroller.prototype._addSwipeListener = function(eventName) {
            this.ele.addEventListener(eventName, this.events[eventName])
            };
        Slidescroller.prototype._nextSection = function(e) {
            e.preventDefault();
            app.collection.next()
            };
        Slidescroller.prototype._nextSlide = function(e) {
            e.preventDefault();
            app.slideshow.next()
            };
        Slidescroller.prototype._previousSection = function(e) {
            e.preventDefault();
            app.collection.previous()
            };
        Slidescroller.prototype._previousSlide = function(e) {
            e.preventDefault();
            app.slideshow.previous()
            };
        Slidescroller.prototype.disable = function(dir) {
            this.ele.removeEventListener("swipe" + dir, this.actions[dir])
            };
        Slidescroller.prototype.disableAll = function() {
            this.ele.removeEventListener("swipeleft", this._next);
            this.ele.removeEventListener("swiperight", this._previous);
            this.ele.removeEventListener("swipeup", this._up);
            this.ele.removeEventListener("swipedown", this._down)
            };
        Slidescroller.prototype.enable = function(dir) {
            this.ele.addEventListener("swipe" + dir, this.actions[dir])
            };
        Slidescroller.prototype.enableAll = function() {
            this.ele.addEventListener("swipeleft", this._next);
            this.ele.addEventListener("swiperight", this._previous);
            this.ele.addEventListener("swipeup", this._up);
            this.ele.addEventListener("swipedown", this._down)
            };
        return Slidescroller
    })();
    window.MemoryManager = MemoryManager = (function() {
        function MemoryManager(name, config) {
            this.name = name;
            this.config = config != null ? config: {};
            this._connect()
            }
        MemoryManager.prototype._connect = function() {
            document.addEventListener("slideEnter", function(event) {
                //return setTimeout(function() {
                    return event.target.setAttribute("class", "slide active")
                //    }, 600)
                });
            return document.addEventListener("slideExit", function(event) {
                return setTimeout(function() {
                    return event.target.setAttribute("class", "slide")
                    }, 600)
                })
            };
        return MemoryManager
    })();
    window.debug = function() {
        var clearLog,
        createDebugElement,
        doc,
        ele,
        isVisible,
        log,
        logs,
        markup;
        ele = null;
        logs = null;
        isVisible = false;
        markup = "";
        document.addEventListener("presentationInit", function() {
            console.log("**** Presentation initialized");
            console.log("Registered slideshows:  " + app.slideshowIds);
            return console.log("Registered collections: " + app.collectionIds)
            });
        document.addEventListener("slideshowLoad", function() {
            return console.log("**** Slideshow loaded: " + app.slideshow.id)
            });
        document.addEventListener("slideshowUnload", function() {
            return console.log("**** Slideshow unloaded: " + app.slideshow.id)
            });
        document.addEventListener("collectionLoad", function() {
            return console.log("**** Collection loaded: " + app.collection.id)
            });
        document.addEventListener("collectionUnload", function() {
            return console.log("**** Collection unloaded: " + app.collection.id)
            });
        document.addEventListener("inlineSlideshowLoad", function() {
            return console.log("**** Inline slideshow loaded: " + app.inline.id)
            });
        document.addEventListener("inlineSlideshowUnload", function() {
            return console.log("**** Inline slideshow unloaded: " + app.inline.id)
            });
        document.addEventListener("contentLoad", function(event) {
            return console.log("**** New content loaded: " + event.target.id)
            });
        document.addEventListener("contentUnload", function(event) {
            return console.log("**** Content unloaded: " + event.target.id)
            });
        document.addEventListener("slideEnter", function() {
            return console.log("---> Slide entered: " + app.slideshow.current)
            });
        document.addEventListener("slideExit", function() {
            return console.log("<--- Slide exited: " + app.slideshow.current)
            });
        document.addEventListener("sectionEnter", function() {
            return console.log(">>>> Section entered: " + app.slideshow.id)
            });
        document.addEventListener("sectionExit", function() {
            return console.log("<<<< Section exited: " + app.slideshow.id)
            });
        document.addEventListener("inlineSlideEnter", function() {
            return console.log("---> Inline slide entered: " + app.inline.current)
            });
        document.addEventListener("inlineSlideExit", function() {
            return console.log("<--- Inline slide exited: " + app.inline.current)
            });
        createDebugElement = function() {
            var box,
            docLink,
            header,
            leftCol,
            logHeader,
            rightCol;
            ele = box = document.createElement("section");
            header = document.createElement("h3");
            docLink = document.createElement("a");
            leftCol = document.createElement("div");
            rightCol = document.createElement("div");
            logHeader = document.createElement("h4");
            logs = document.createElement("div");
            box.id = "debug";
            header.innerText = "Debug Console";
            leftCol.className = "d-col";
            rightCol.className = "d-col last-col";
            docLink.innerText = "Open API documentation";
            docLink.href = "../docs/index.html";
            logHeader.innerText = "Log output";
            leftCol.appendChild(docLink);
            rightCol.appendChild(logHeader);
            rightCol.appendChild(logs);
            box.appendChild(header);
            box.appendChild(leftCol);
            box.appendChild(rightCol);
            return document.body.appendChild(ele)
            };
        log = function(msg) {
            var logEle;
            logEle = document.createElement("p");
            logEle.innerText = msg;
            return logs.appendChild(logEle)
            };
        clearLog = function() {
            return logs.innerHTML = ""
        };
        document.addEventListener("longTouch", function() {
            if (isVisible) {
                ele.style.display = "none";
                return isVisible = false
            } else {
                ele.style.display = "block";
                return isVisible = true
            }
        });
        doc = function(name) {
            name = "?" + name || "";
            return window.location.href = "file:///Library/WebServer/Documents/Barista/docs/index.html" + name
        };
        createDebugElement();
        window.doc = doc;
        return window.log = log
    }
}).call(this);