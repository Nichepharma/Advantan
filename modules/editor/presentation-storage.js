function PresentationStorage(id,presentations){
	this.id = id;
    this.version="0.1";
	this.presentations = presentations ||[];
	this.load();
}
PresentationStorage.prototype.getNames = function(){
    return this.presentations.map(function(presentation){return presentation.name});
}
PresentationStorage.prototype.get = function(index){
	return clone(this.presentations[index]);
}
PresentationStorage.prototype.set = function(index,value){
	this.presentations[index]=clone(value);
	this.save();
}
PresentationStorage.prototype.add=function(value){
    var index = this.presentations.push(clone(value))-1;
    this.save();
    return index;
}
PresentationStorage.prototype.remove = function(index){
	this.presentations.splice(index,1);
    this.save();
}
PresentationStorage.prototype.load = function(){
	try {
		var data = JSON.parse(localStorage[this.id+".presentations"]);
        if(data.version!=this.version){
            this.save();
        }
        else{
            this.presentations=data.collections;
        }
	} 
	catch(e){
		this.save();
	}
}
PresentationStorage.prototype.save = function(){
	localStorage[this.id+".presentations"] = JSON.stringify({"version":this.version, "collections":this.presentations});
}