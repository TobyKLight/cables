const
    doRequest = op.inTriggerButton("Request Fullscreen"),
    doExit = op.inTriggerButton("Exit Fullscreen"),
    inEle = op.inSwitch("Element", ["Canvas", "Document"], "Canvas"),
    isFullscreen = op.outValueBool("Is Fullscreen");

doExit.onTriggered = exitFs;
doRequest.onTriggered = startFs;


let countStarts = 0;

function setState()
{
    const isFull = (!window.screenTop && !window.screenY);
    isFullscreen.set(isFull);
}

function startFs()
{
    countStarts++;
    if (countStarts > 30)
    {
        doRequest.onTriggered = null;
        op.setUiAttrib({ "error": "Fullscreen Request shound not triggered that often: op disabled" });
        exitFs();
    }

    let elem = null;
    if (inEle == "Canvas") elem = op.patch.cgl.canvas.parentElement;
    else elem = document.documentElement;

    if (elem.requestFullScreen) elem.requestFullScreen();
    else if (elem.mozRequestFullScreen) elem.mozRequestFullScreen();
    else if (elem.webkitRequestFullScreen)elem.webkitRequestFullScreen();
    else if (elem.msRequestFullScreen)elem.msRequestFullScreen();

    setTimeout(setState, 100);
    setTimeout(setState, 500);
    setTimeout(setState, 1000);
}


function exitFs()
{
    countStarts--;
    if (document.exitFullscreen) document.exitFullscreen();
    else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    else if (document.msExitFullscreen)document.msExitFullscreen();

    setTimeout(setState, 100);
    setTimeout(setState, 500);
    setTimeout(setState, 1000);
}
