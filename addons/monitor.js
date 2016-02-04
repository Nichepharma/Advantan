/* Support functions */





function monitorInclude(file)


{


  var script  = document.createElement('script');


  script.src  = file;


  script.type = 'text/javascript';


  script.defer = true;


  document.getElementsByTagName('head').item(0).appendChild(script);


}





/* include any js files here */


monitorInclude('../viewer/js/json2.js');






var monitorSavedSlideId = null;

var monitorSavedSlideName = null;

var monitorSavedSlideIndex = null;

var monitorSavedParentSlideName = null;

var monitorSavedParentOfParentSlideName = null;




var monitorPreviousSlideId = null;


var monitorPreviousSlideName = null;


var monitorPreviousSlideIndex = null;


var monitorPreviousParentSlideName = null;


var monitorPreviousParentOfParentSlideName = null;





function isMonitoringEnabled()


{


    return (typeof(monitoringEnabled) == 'boolean' && monitoringEnabled);


}





function now()


{


    return Math.floor(new Date().getTime()/1000);


}





function monitorSayHello()


{


    alert("Monitoring module says hello! Monitoring enabled " + isMonitoringEnabled());


}





function monitorSubmitEvent(monitorEvent)


{


    if (isMonitoringEnabled()) {


        // alert(monitorEvent.category);


        var invokeString = "objc://iplanner/monitoringEvent?" + encodeURIComponent(JSON.stringify(monitorEvent));


        // window.location = invokeString;





        iFrame = document.createElement("IFRAME");


        iFrame.setAttribute("src", invokeString);


        document.body.appendChild(iFrame);


        iFrame.parentNode.removeChild(iFrame);


        iFrame = null;


    }


}





/* Agnitio monitorings support functions */






function submitSlideReEnter()

{

    if (monitorSavedSlideId) {

        submitSlideEnter(

            monitorSavedSlideId,

            monitorSavedSlideName,

            monitorSavedSlideIndex,

            monitorSavedParentSlideName,

            monitorSavedParentOfParentSlideName

        );

    }



}




function submitSlideEnter(slideId, slideName, slideIndex, parentSlideName, parentOfParentSlideName)


{

    if (monitorPreviousSlideId) {


        submitSlideExit();


    }



}