//https://jmonkeyengine.github.io/wiki/jme3/advanced/pbr_part3.html
//https://learnopengl.com/PBR/IBL/Diffuse-irradiance


var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var inMiplevel=op.inValueSlider("Mip Level",0.0);
var inCubemap=op.inObject("Cubemap");

var mapReflect=op.inValueBool("Reflection",true);
mapReflect.onChange=updateMapping;
inCubemap.onChange=updateMapping;



var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var cgl=op.patch.cgl;

function doRender()
{
    cgl.setShader(shader);

    cgl.gl.activeTexture(cgl.gl.TEXTURE0);

    if(inCubemap.get())
    {
        if(inCubemap.get().cubemap) cgl.gl.bindTexture(cgl.gl.TEXTURE_CUBE_MAP, inCubemap.get().cubemap);
        else cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, inCubemap.get().tex);
    }
    else
        cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, CGL.Texture.getTempTexture(cgl).tex);

    trigger.trigger();
    cgl.setPreviousShader();
}

function updateMapping()
{
    if(mapReflect.get())shader.define("DO_REFLECTION");
        else shader.removeDefine("DO_REFLECTION");


    if(inCubemap.get() && inCubemap.get().cubemap)
    {
        shader.define("TEX_FORMAT_CUBEMAP");
        shader.removeDefine("TEX_FORMAT_EQUIRECT");

    }
    else
    {
        shader.removeDefine("TEX_FORMAT_CUBEMAP");
        shader.define("TEX_FORMAT_EQUIRECT");
    }
}

var srcVert=attachments.cubemap_vert;
var srcFrag=attachments.cubemap_frag;


var shader=new CGL.Shader(cgl,'cube map material');
shader.setModules(['MODULE_VERTEX_POSITION','MODULE_COLOR','MODULE_BEGIN_FRAG']);

//op.onLoaded=shader.compile;

shader.setSource(srcVert,srcFrag);
inMiplevel.uniform=new CGL.Uniform(shader,'f','miplevel',inMiplevel);

render.onTriggered=doRender;
updateMapping();
