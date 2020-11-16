const
    exec = op.inTrigger("Exec"),
    showFrag = op.inTriggerButton("Show Fragment"),
    showVert = op.inTriggerButton("Show Vertex"),
    showModules = op.inTriggerButton("Show Modules"),
    showUniforms = op.inTriggerButton("Show Uniforms"),
    showState = op.inTriggerButton("State Info"),
    next = op.outTrigger("Next"),
    outName = op.outString("Name"),
    outId = op.outString("Id"),
    outNumUniforms = op.outValue("Num Uniforms"),
    outNumAttributes = op.outValue("Num Attributes"),
    outAttributeNames = op.outArray("Arributes Names"),
    outDefines = op.outArray("Num Defines");

const cgl = op.patch.cgl;
let shader = null;

showFrag.onTriggered = function ()
{
    if (CABLES.UI && shader) CABLES.UI.MODAL.showCode("fragment shader", shader.finalShaderFrag, "GLSL");
};

showVert.onTriggered = function ()
{
    if (CABLES.UI && shader) CABLES.UI.MODAL.showCode("vertex shader", shader.finalShaderVert, "GLSL");
};

let doStateDump = false;
let doUniformDump = false;

showState.onTriggered = function ()
{
    if (!CABLES.UI || !shader) return;
    doStateDump = true;
};

showUniforms.onTriggered = function ()
{
    if (!CABLES.UI || !shader) return;
    doUniformDump = true;
};

exec.onTriggered = function ()
{
    if (cgl.frameStore.shadowPass) return;
    shader = cgl.getShader();
    next.trigger();

    shader.bind();

    if (!shader.getProgram()) op.setUiError("prognull", "Shader is not compiled");
    else op.setUiError("prognull", null);

    if (!shader) op.setUiError("noshader", "No Shader..");
    else op.setUiError("noshader", null);

    if (shader && shader.getProgram())
    {
        const activeUniforms = cgl.gl.getProgramParameter(shader.getProgram(), cgl.gl.ACTIVE_UNIFORMS);
        outNumUniforms.set(activeUniforms);
        outNumAttributes.set(cgl.gl.getProgramParameter(shader.getProgram(), cgl.gl.ACTIVE_ATTRIBUTES));

        let i = 0;
        const attribNames = [];
        for (i = 0; i < cgl.gl.getProgramParameter(shader.getProgram(), cgl.gl.ACTIVE_ATTRIBUTES); i++)
        {
            const name = cgl.gl.getActiveAttrib(shader.getProgram(), i).name;
            attribNames.push(name);
        }
        outAttributeNames.set(attribNames);
        outDefines.set(shader.getDefines());
        outName.set(shader.getName());
        outId.set(shader.id);

        op.setUiError("prognull", null);
    }
    else
    {
        outNumUniforms.set(0);
        outNumAttributes.set(0);
        outDefines.set(0);
        outAttributeNames.set(null);
    }

    if (doUniformDump)
    {
        const json = [];
        for (let i = 0; i < shader._uniforms.length; i++)
        {
            json.push({
                "validLoc": shader._uniforms[i]._isValidLoc(),
                "name": shader._uniforms[i]._name,
                "type": shader._uniforms[i]._type,
                "value": shader._uniforms[i]._value,
                "structName": shader._uniforms[i]._structName,
                "structUniformName": shader._uniforms[i]._structUniformName
            });
        }
        CABLES.UI.MODAL.showCode("shader uniforms", JSON.stringify(json, false, 2), "json");

        doUniformDump = false;
    }

    if (doStateDump)
    {
        doStateDump = false;
        stateDump();
    }
};

function stateDump()
{
    let txt = "";
    txt += "";

    txt += "defines (" + outDefines.get().length + ")\n\n";

    for (let i = 0; i < outDefines.get().length; i++)
    {
        txt += "- ";
        txt += outDefines.get()[i][0];
        if (outDefines.get()[i][1])
        {
            txt += ": ";
            txt += outDefines.get()[i][1];
        }
        txt += "\n";
    }

    txt += "\n\n";
    txt += "texturestack (" + shader._textureStackUni.length + ")\n\n";

    for (let i = 0; i < shader._textureStackUni.length; i++)
    {
        txt += "- ";
        txt += shader._textureStackUni[i]._name;
        txt += "(" + shader._textureStackUni[i].shaderType + ")\n";
        if (shader._textureStackTexCgl[i]) txt += JSON.stringify(shader._textureStackTexCgl[i].getInfo());
        txt += "\n";
    }

    txt += "\n\n";
    txt += "uniforms: (" + shader._uniforms.length + ")\n\n";

    for (let i = 0; i < shader._uniforms.length; i++)
    {
        txt += "- ";
        txt += shader._uniforms[i]._name;
        txt += ": ";
        txt += shader._uniforms[i].getValue();

        if (shader._uniforms[i].comment)
        {
            txt += " // ";
            txt += shader._uniforms[i].comment;
        }
        txt += "\n";
    }

    CABLES.UI.MODAL.showCode("state info", txt);
}

showModules.onTriggered = function ()
{
    if (!shader) return;
    const mods = shader.getCurrentModules();

    CABLES.UI.MODAL.showCode("vertex shader", JSON.stringify(mods, false, 4), "json");
};
