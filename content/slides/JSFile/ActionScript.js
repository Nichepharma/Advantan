/**
 * Created by yahia on 04/02/2016.
 */


myFunction(0);
function myFunction(x) {
// Return the text of the selected option
    var opacity = x.options[x.selectedIndex].text;
    alert(x);
    var el = document.getElementById("p0_img_logo");
    if (el.style.opacity !== undefined) {
        el.style.opacity = opacity;
        alert("BooooooM");
    } else {
        alert("Your browser doesn't support this example!");
    }
}
