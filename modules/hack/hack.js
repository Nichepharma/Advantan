window.addEventListener("load",function(){
    var hackBlock=document.createElement("div");
    hackBlock.style.position="absolute";
    hackBlock.style.top="0px";
    hackBlock.style.left="1025px";
    hackBlock.style.border="1px solid red";
    hackBlock.style.padding="5px";
    hackBlock.innerHTML = "<input id='hack-fix-scroll' type='checkbox' name='fix-scroll'/><label for='hack-fix-scroll'>fix scroll</label><br>";
    document.body.appendChild(hackBlock);
    hackBlock.querySelector("#hack-fix-scroll").addEventListener('change',function(){
        app.scroller[this.checked?"disableAll":"enableAll"]();
    });
})