const
    inExec = op.inTrigger("Exec"),
    inFunc = op.inObject("Fragment", null, "sg_func"),
    next = op.outTrigger("Next"),
    outshader = op.outObject("Shader"),
    outSrcFrag = op.outString("Source Fragment");

const cgl = op.patch.cgl;
const sg = new CGL.ShaderGraph(this, inFunc);
const shader = new CGL.Shader(cgl, op.name);
let needsUpdate = true;

shader.setModules(["MODULE_VERTEX_POSITION", "MODULE_COLOR", "MODULE_BEGIN_FRAG"]);
outshader.set(shader);

sg.on("compiled", () =>
{
    outSrcFrag.set(sg.getSrcFrag());
    needsUpdate = true;
});

inExec.onTriggered = () =>
{
    if (needsUpdate)
    {
        shader.removeAllUniforms();
        shader.setSource(CGL.Shader.getDefaultVertexShader(), sg.getSrcFrag());

        for (let i = 0; i < sg.uniforms.length; i++)
        {
            const su = sg.uniforms[i];
            shader.removeUniform(su.name);
            if (su.ports) shader.addUniformFrag(su.type, su.name, su.ports[0], su.ports[1], su.ports[2], su.ports[3]);
            else console.log("uni has no ports", su.ports);
        }
    }

    // console.log(sg.uniforms);
    cgl.pushShader(shader);

    next.trigger();

    cgl.popShader();
};
