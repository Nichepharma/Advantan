(function(global){

    var Point = function(x,y){
        this.x=parseInt(x);
        this.y=parseInt(y);
    }
    Point.prototype={
        toString:function(){
            return '{x='+this.x+',y='+this.y+'}';
        },
        add:function(p){
            return new Point(this.x+p.x,this.y+p.y);
        },
        sub:function(p){
            return new Point(this.x-p.x,this.y-p.y);
        },
        mult:function(k){
            return new Point(this.x*k,this.y*k);
        },
        negative:function(){
            return new Point(-this.x,-this.y);
        }
    }

    var MathPoint={
        getPointFromEvent:function(e){
            var isTouch = 'ontouchstart' in window;
            return new Point(isTouch?e.changedTouches[0].pageX : e.pageX,isTouch?e.changedTouches[0].pageY : e.pageY);
        },
        getNearIndex:function(arr,val){
            var delta=Math.abs(arr[0]-val);
            var index=0;
            for(var i=0;i<arr.length;i++){
                var temp=Math.abs(arr[i]-val);
                if(temp<delta){
                    delta=temp;
                    index=i;
                }
            }
            return index;
        },
        getNearIndexWithCaptureRadiusPoint:function(arr,radius,val,options){
            if(arr.length==0) return -1;
            var getLength=null;
            if(!options || (options.x && options.y && !options.IsTransformationSpace)){
                getLength=function(p1,p2){return Math.getLength(p1,p2);};
            }else if(options.x && options.y && options.IsTransformationSpace){
                getLength=function(p1,p2){return Math.sqrt(Math.pow(options.x*Math.abs(p1.x-p2.x),2)+Math.pow(options.y*Math.abs(p1.y-p2.y),2)); };
            }else if(options.x){
                getLength=function(p1,p2){return Math.abs(p1.x-p2.x);};
            }else if(options.y){
                getLength=function(p1,p2){return Math.abs(p1.y-p2.y);};
            }

            var delta=getLength(arr[0],val);
            var index=0;
            for(var i=0;i<arr.length;i++){
                var temp=getLength(arr[i],val);
                if(temp<delta){
                    delta=temp;
                    index=i;
                }
            }
            if(delta>radius){
                return -1;
            }
            return index;
        },
        bound:function(min,max,val){
            return Math.max(min,Math.min(max,val));
        },
        boundPoint:function(min,max,val){
            var x=Math.max(min.x,Math.min(max.x,val.x));
            var y=Math.max(min.y,Math.min(max.y,val.y));
            return new Point(x,y);
        },
        getLength:function(p1,p2){
            var dx=p1.x-p2.x;
            var dy=p1.y-p2.y;
            return Math.sqrt(dx*dx+dy*dy);
        },
        isOnRectangle:function(rect,size,p){
            if(rect.x>p.x) return false;
            if(rect.x+size.x<p.x) return false;
            if(rect.y>p.y) return false;
            if(rect.y+size.y<p.y) return false;
            return true
        },
        directCrossing:function(L1P1,L1P2,L2P1,L2P2){
            if(L2P1.x==L2P2.x){
                var temp=L2P1;
                L2P1=L1P1;
                L1P1=temp;
                var temp=L2P2;
                L2P2=L1P2;
                L1P2=temp;
            }
            if(L1P1.x==L1P2.x){
                var k2=(L2P2.y-L2P1.y)/(L2P2.x-L2P1.x);
                var b2=(L2P2.x*L2P1.y-L2P1.x*L2P2.y)/(L2P2.x-L2P1.x);
                var x=L1P1.x;
                var y =x*k2+b2;
                return new Point(x,y);
            }else{
                var k1=(L1P2.y-L1P1.y)/(L1P2.x-L1P1.x);
                var b1=(L1P2.x*L1P1.y-L1P1.x*L1P2.y)/(L1P2.x-L1P1.x);
                var k2=(L2P2.y-L2P1.y)/(L2P2.x-L2P1.x);
                var b2=(L2P2.x*L2P1.y-L2P1.x*L2P2.y)/(L2P2.x-L2P1.x);
                var x=(b1-b2)/(k2-k1);
                var y =x*k1+b1;
                return new Point(x,y);
            }
        },
        boundOnLine:function(LP1,LP2,P){
            var x= MathPoint.bound(Math.min(LP1.x,LP2.x),Math.max(LP1.x,LP2.x),P.x);
            if(x!=P.x){
                var y=(x==LP1.x)?LP1.y:LP2.y;
                P=new Point(x,y);
            }
            var y= MathPoint.bound(Math.min(LP1.y,LP2.y),Math.max(LP1.y,LP2.y),P.y);
            if(y!=P.y){
                var x=(y==LP1.y)?LP1.x:LP2.x;
                P=new Point(x,y);
            }
            return P;
        },
        getPointInLine:function(LP1, LP2,percent){
            var dx = LP2.x - LP1.x;
            var dy = LP2.y - LP1.y;
            return new Point(LP1.x + percent * dx , LP1.y + percent * dy );
        },
        getOffset:function(element,parentToStop,isConsiderTranslate){
            var style = window.getComputedStyle(element);
            var x = parseInt(style.marginLeft);
            if(x=="NaN"){x=0;}
            var y = parseInt(style.marginTop);
            if(y=="NaN"){y=0;}
            var offset=new Point(-x,-y);
            while(!!element && element!==parentToStop){
                (element.offsetLeft||element.offsetTop) && (offset=offset.add(new Point(element.offsetLeft,element.offsetTop)));
                if(isConsiderTranslate){
                    var transform,style=window.getComputedStyle(element);
                    if(style && (transform = style["-webkit-transform"])){
                        var x=0,y=0,arrVAlMatrix;
                        if(/matrix3d/.test(transform)){
                            arrVAlMatrix=transform.match(/[-]?\d+/g);
                            x=parseInt(arrVAlMatrix[13]);
                            y=parseInt(arrVAlMatrix[14]);
                        }else if(/matrix/.test(transform)){
                            arrVAlMatrix=transform.match(/[-]?\d+/g);
                            x=parseInt(arrVAlMatrix[4]);
                            y=parseInt(arrVAlMatrix[5]);
                        }
                    }
                    ( x || y ) && (offset=offset.add(new Point(x,y)));
                }
                element = element.parentNode;
            }
            return offset;
        }
    };
    
    global.Point = Point;
    global.MathPoint = MathPoint;
})(window);