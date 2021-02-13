const defaultCode = "\
// you can use custom javascript code here, it will be bound to the\n\
// scope of the current op, which is available as `op`.\n\
// \n\
// have a look at the documentation at:\n\
// https://docs.cables.gl/dev_hello_op/dev_hello_op.html\n\
\n\
";

const inJS = op.inStringEditor("JavaScript");
inJS.setUiAttribs({ "editorSyntax": "js" });
inJS.set(defaultCode);
op.setUiError("error", null);

const getEvalFunction = () =>
{
    op.setUiError("error", null);
    let errorEl = document.getElementById("error-" + op.id);
    if (errorEl)
    {
        errorEl.remove();
    }
    try
    {
        return new Function("op", inJS.get());
    }
    catch (err)
    {
        op.setUiError("error", err);
        if (op.patch.isEditorMode())
        {
            errorEl = document.createElement("script");
            errorEl.id = "error-" + op.id;
            errorEl.type = "text/javascript";
            errorEl.src = "data:text/javascript;charset=utf-8," + escape(inJS.get());
            document.body.appendChild(errorEl);
        }
        else
        {
            op.log("error creating javascript function", err);
        }
        return null;
    }
};

inJS.onChange = () =>
{
    execute();
};

const removeInPort = (port) =>
{
    port.removeLinks();
    for (let ipi = 0; ipi < op.portsIn.length; ipi++)
    {
        if (op.portsIn[ipi] == port)
        {
            op.portsIn.splice(ipi, 1);
            return;
        }
    }
};

const removeOutPort = (port) =>
{
    port.removeLinks();
    for (let ipi = 0; ipi < op.portsOut.length; ipi++)
    {
        if (op.portsOut[ipi] == port)
        {
            op.portsOut.splice(ipi, 1);
            return;
        }
    }
};

const execute = () =>
{
    const evalFunction = getEvalFunction();
    if (evalFunction)
    {
        try
        {
            const oldLinksIn = {};
            const oldValuesIn = {};
            const oldLinksOut = {};
            const removeInPorts = [];
            const removeOutPorts = [];
            op.portsIn.forEach((port) =>
            {
                if (port.id !== inJS.id)
                {
                    oldLinksIn[port.name] = [];
                    oldValuesIn[port.name] = port.get();
                    port.links.forEach((link) =>
                    {
                        const linkInfo = {
                            "op": link.portOut.parent,
                            "portName": link.portOut.name
                        };
                        oldLinksIn[port.name].push(linkInfo);
                    });
                    removeInPorts.push(port);
                }
            });
            op.portsOut.forEach((port) =>
            {
                oldLinksOut[port.name] = [];
                port.links.forEach((link) =>
                {
                    const linkInfo = {
                        "op": link.portIn.parent,
                        "portName": link.portIn.name
                    };
                    oldLinksOut[port.name].push(linkInfo);
                });
                removeOutPorts.push(port);
            });
            removeInPorts.forEach((port) =>
            {
                removeInPort(port);
            });
            removeOutPorts.forEach((port) =>
            {
                removeOutPort(port);
            });
            if (removeOutPorts.length > 0 || removeInPorts.length > 0)
            {
                this.fireEvent("onUiAttribsChange", {});
                this.fireEvent("onPortRemoved", {});
            }
            evalFunction(this);
            op.portsIn.forEach((port) =>
            {
                if (port.id !== inJS.id)
                {
                    if (oldLinksIn[port.name])
                    {
                        oldLinksIn[port.name].forEach((link) =>
                        {
                            op.patch.link(op, port.name, link.op, link.portName);
                        });
                    }

                    if (oldValuesIn[port.name])
                    {
                        port.set(oldValuesIn[port.name]);
                    }
                }
            });
            op.portsOut.forEach((port) =>
            {
                if (oldLinksOut[port.name])
                {
                    oldLinksOut[port.name].forEach((link) =>
                    {
                        op.patch.link(op, port.name, link.op, link.portName);
                    });
                }
            });
        }
        catch (e)
        {
            if (op.patch.isEditorMode())
            {
                let js = "op = " + JSON.stringify(op.getSerialized()) + ";\n";
                js += inJS.get();
                op.setUiError("error", e);
                const errorEl = document.createElement("script");
                errorEl.id = "error-" + op.id;
                errorEl.type = "text/javascript";
                errorEl.src = "data:text/javascript;charset=utf-8," + escape(js);
                document.body.appendChild(errorEl);
            }
            else
            {
                op.log("error executing javascript code", e);
            }
        }
    }
};
