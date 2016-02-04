(function(){
	window.FormPopup = function(elemWrap){
        this.elWraper=document.getElementById(elemWrap);
        this.init();
	}
	FormPopup.prototype={
        init:function(){
            this.isShow=false;
            this.element=document.createElement("div");
            this.element.id="form-popup";
            this.elWraper.appendChild(this.element);
            this.container=document.createElement("content");
            this.element.appendChild(this.container);
            this.butSubmit=document.createElement("button");
            this.butSubmit.innerHTML="Submit";
            this.butSubmit.addEventListener(touchy.events.start,this._close.bind(this));
            this.element.appendChild(this.butSubmit);
        },
        show:function(data){
            this.data=data;
            this.container.innerHTML="";
            var tittle=document.createElement("h1");
            tittle.innerHTML=data.tittle;
            this.container.appbeginChild(tittle);
            data.items.forEach(function(item,i){
                var name=document.createElement("h3");
                name.innerHTML=item.name;
                this.container.appendChild(name);
                if(item.type=="label"){
                    var label= document.createElement("label");
                    label.innerHTML=item.value;
                    this.container.appendChild(label);
                }
                else{
                    var input = util.createEl("input",{"id":item.id,"type":item.type, 'maxlength':16});
                    if(item.value) input.value=item.value;
                    this.container.appendChild(input);
                }
                this.container.appendChild(document.createElement("br"));
            },this);
            data.submit && (this.butSubmit.innerHTML=data.submit);
            util.addClass(this.elWraper,"active");
        },
        _close:function(){
            if(!this.data.items.every(function(item){
                if(item.type=="label") return true;
                item.value=this.container.querySelector("#"+item.id).value.trim();
                return !item.isImportant || !!item.value;
            },this))return ;
            util.removeClass(this.elWraper,"active");
            this.data.items.forEach(function(item){
                if(item.type!="label"){
                    var el=this.container.querySelector("#"+item.id);
                    el.blur();
                    item.value=el.value;
                    el.parentNode.removeChild(el);
                }
            },this);
            this.data.callback();
        }
	};
})();