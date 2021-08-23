let visible = op.inValueBool("visible", true);


visible.onChange = function ()
{
    if (visible.get()) logger.style.display = "block";
    else logger.style.display = "none";
};

var logger = document.createElement("div");
logger.style.padding = "0px";
logger.style.position = "absolute";
logger.style.overflow = "scroll";
if (CABLES.UI)
{
    logger.style.width = "100%";
    logger.style.height = "50%";
}
else
{
    logger.style.width = "100vw";
    logger.style.height = "50vh";
}
logger.style["background-color"] = "rgba(0,0,0,0.74)";
logger.style["box-sizing"] = "border-box";
logger.style.padding = "5px";
// logger.style['border-left']="1px solid grey";
// logger.style['border-top']="1px solid grey";
logger.style["z-index"] = "9999";
logger.style.color = "#fff";


let canvas = op.patch.cgl.canvas.parentElement;
canvas.appendChild(logger);


let oldLog = console.log;
let oldLogError = console.error;
let oldLogWarn = console.warn;
// var logger = document.getElementById('log');
console.log = thelog;
console.error = thelog;
console.warn = thelog;

function thelog()
{
    oldLog(arguments);
    let html = "<code style=\"display:block;overflow:hidden;margin-top:3px;border-bottom:1px solid #000;padding:3px;\">";
    for (let i = 0; i < arguments.length; i++)
    {
        if (typeof arguments[i] == "object") html += (JSON && JSON.stringify ? JSON.stringify(arguments[i], undefined, 2) : arguments[i]) + "";
        else html += arguments[i];
    }
    logger.innerHTML += html + "</code>";
    logger.scrollTop = logger.scrollHeight;
}

op.onDelete = function ()
{
    logger.remove();
    console.log = oldLog;
    console.error = oldLogError;
    console.warn = oldLogWarn;
};
