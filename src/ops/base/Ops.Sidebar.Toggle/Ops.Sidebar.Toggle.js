op.name="Toggle";

var link=op.addInPort(new Port(op,"link",OP_PORT_TYPE_OBJECT));
var child=op.addOutPort(new Port(op,"childs",OP_PORT_TYPE_OBJECT));

var value=op.addOutPort(new Port(op,"Value",OP_PORT_TYPE_VALUE,{type:'bool'}));
var text=op.addInPort(new Port(op,"Text",OP_PORT_TYPE_VALUE,{type:'string'}));

value.set(false);
text.set('Sidebar toggle');

var textContent = document.createTextNode(text.get()); 
var textContentValue= document.createTextNode(text.get()); 
var element=null;
var initialized=false;

op.onDelete=remove;
child.onLinkChanged=updateSidebar;
link.onLinkChanged=updateSidebar;
link.onValueChanged=updateParams;
var elementCheckBox=null;

text.onValueChanged=function()
{
    textContent.nodeValue=text.get();
};

function updatePos(params)
{
    if(!element) return;
    element.style['margin-top']=(params.pos*params.height+params.pos)+"px";
    element.style.width=(params.width)+"px";
}

function updateText()
{
    op.name='toggle '+text.get();

    if(value.get()) elementCheckBox.style.color="#bbb";
        else elementCheckBox.style.color="#444";

    textContent.nodeValue=text.get();
    textContentValue.nodeValue='●';
}

function init(params)
{
    initialized=true;
    element = document.createElement('div');
    element.style.padding=params.padding+'px';
    element.style.position="absolute";
    element.style.overflow="hidden";
    element.style.cursor="pointer";
    element.style["z-index"]="99999";
    element.style["background-color"]="#222";
    element.style["border-bottom"]="1px solid #444";

    var size=(params.height-params.padding*2);
    elementCheckBox = document.createElement('div');
    elementCheckBox.style.float="right";
    elementCheckBox.style.width=size+"px";
    elementCheckBox.style['font-size']="25px";
    elementCheckBox.style.height=size+"px";
    elementCheckBox.style['margin-top']="-7px";

    element.appendChild(textContent);
    elementCheckBox.appendChild(textContentValue);
    element.appendChild(elementCheckBox);

    updateText();
    
    params.parent.appendChild(element);

    element.onclick=function()
    {
        value.set(!value.get());
        updateText();
    };
}

function remove()
{
    initialized=false;
    if(element) element.remove();
}

function updateSidebar()
{
    if(!link.isLinked()) remove();        
    var sidebar=op.findParent('Ops.Sidebar.Sidebar');
    if(sidebar)sidebar.childsChanged();
}

function updateParams()
{
    var params=link.get();

    if(!initialized) init(params);
    updatePos(params);

    params.pos++;    
    child.set(params);
}
