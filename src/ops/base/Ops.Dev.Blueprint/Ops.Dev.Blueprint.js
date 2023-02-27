const patchIdIn = op.inString("externalPatchId", "");
const subPatchIdIn = op.inString("subPatchId", "");
const activeIn = op.inBool("active", false);
const gotoIn = op.inTriggerButton("Open patch");
const convertIn = op.inTriggerButton("Convert to SubPatch");
const portsData = op.inString("portsData", "{}");

const loadingOut = op.outBool("loading", false);
let loadingId = null;
patchIdIn.setUiAttribs({
    "hidePort": true,
    "greyout": false
});
subPatchIdIn.setUiAttribs({
    "hidePort": true,
    "greyout": true
});
portsData.setUiAttribs({ "hidePort": true });
portsData.setUiAttribs({ "hideParam": true });

gotoIn.setUiAttribs({ "greyout": true });
gotoIn.setUiAttribs({ "hidePort": true });

convertIn.setUiAttribs({ "greyout": true });
convertIn.setUiAttribs({ "hidePort": true });

let parentSubPatchId = null;

activeIn.setUiAttribs({ "order": 200 });

subPatchIdIn.onChange = () =>
{
    if (!activeIn.get())
    {
        op.setUiError("fetchOps", null);
    }
    if (!loadingOut.get() && activeIn.get() && patchIdIn.get() && subPatchIdIn.get())
    {
        update();
    }
};

if (op.patch.isEditorMode())
{
    gotoIn.onTriggered = function ()
    {
        if (CABLES && CABLES.sandbox && CABLES.sandbox.getCablesUrl())
        {
            window.open(CABLES.sandbox.getCablesUrl() + "/edit/" + patchIdIn.get(), "_blank");
        }
    };

    convertIn.onTriggered = () =>
    {
        if (CABLES && CABLES.CMD && CABLES.CMD.PATCH)
            CABLES.CMD.PATCH.convertBlueprintToSubpatch(this);
    };

    patchIdIn.onChange = function ()
    {
        if (patchIdIn.get())
        {
            gotoIn.setUiAttribs({ "greyout": false });
            if (!activeIn.get())
            {
                op.setUiError("fetchOps", null);
            }
            if (!loadingOut.get() && activeIn.get() && subPatchIdIn.get())
            {
                update();
            }
        }
        else
        {
            gotoIn.setUiAttribs({ "greyout": true });
        }
    };
}

const protectedPorts = [patchIdIn.id, subPatchIdIn.id, activeIn.id, portsData.id, loadingOut.id, gotoIn.id, convertIn.id];

if (!activeIn.get())
{
    op.setUiError("inactive", "blueprint is inactive", 0);
}

activeIn.onChange = () =>
{
    if (!loadingOut.get())
    {
        if (activeIn.get())
        {
            op.setUiError("inactive", null);
            if (!patchLoadListener)
            {
                update();
            }
        }
        else
        {
            op.setUiError("fetchOps", null);
            op.setUiError("inactive", "blueprint is inactive", 0);
            removeImportedOps();
        }
    }
};

op.onLoadedValueSet = () =>
{
    cleanupPorts();
    if (!loadingOut.get() && op.uiAttribs.pasted)
    {
        let currentSubpatchId = 0;
        if (op.patch.isEditorMode()) currentSubpatchId = gui.patchView.getCurrentSubPatch();
        setupPorts(currentSubpatchId);
        update();
    }
};

op.on("onDelete", removeImportedOps);

op.createBlueprint = (externalPatchId, subPatchId, active = true) =>
{
    patchIdIn.set(externalPatchId);
    subPatchIdIn.set(subPatchId);
    activeIn.set(active);
    cleanupPorts();
    if (!loadingOut.get())
    {
        update();
        setupPorts(gui.patchView.getCurrentSubPatch());
    }
};

function update()
{
    const patchId = patchIdIn.get();
    const subPatchId = subPatchIdIn.get();
    const blueprintId = patchId + "-" + subPatchId;

    op.patch.off(patchLoadListener);
    patchLoadListener = null;

    if (!patchId || !subPatchId) return;

    loadingOut.set(true);

    loadingId = op.patch.loading.start("blueprint", op.id);

    const doneCb = (err, serializedOps) =>
    {
        if (!err)
        {
            serializedOps.forEach((serializedOp) =>
            {
                addBlueprintInfoToOp(serializedOp);
            });

            removeImportedOps();
            const blueprintData = {};
            blueprintData.ops = serializedOps;
            deSerializeBlueprint(blueprintData);
        }
        else
        {
            if (err.code === 403)
            {
                op.setUiError("fetchOps", "You do not have permission to use this Blueprint");
            }
            else if (err.code === 404)
            {
                op.setUiError("fetchOps", "Save the patch and reload before using this Blueprint");
            }
            else
            {
                op.setUiError("fetchOps", "Error fetching Blueprint, code: " + err.code + " (" + err.msg + ")");
            }
        }
        loadingOut.set(false);
        op.patch.loading.finished(loadingId);
    };

    if (op.patch.isEditorMode())
    {
        const isLocalSubpatch = ((patchId === gui.patchId) || (patchId === gui.project().shortId));
        if (isLocalSubpatch)
        {
            let subPatchOps = op.patch.getSubPatchOps(subPatchId, true);
            subPatchOps = subPatchOps.filter((subPatchOp) => { return !(subPatchOp.uiAttribs && subPatchOp.uiAttribs.blueprintOpId); });
            const localParent = getLocalParentSubPatchOp(subPatchId);
            if (localParent) subPatchOps.push(localParent);
            const serializedOps = [];
            subPatchOps.forEach((subPatchOp) =>
            {
                serializedOps.push(subPatchOp.getSerialized());
            });

            doneCb(null, serializedOps);
        }
        else
        {
            const options = {
                "blueprintId": blueprintId
            };

            CABLES.sandbox.getBlueprintOps(options, (err, response) =>
            {
                op.setUiError("fetchOps", null);
                let subPatchOps = err ? [] : response.data.ops;
                subPatchOps = subPatchOps.filter((subPatchOp) => { return !(subPatchOp.uiAttribs && subPatchOp.uiAttribs.blueprintOpId); });
                const localSubpatch = getLocalParentSubPatchOp(subPatchId);
                if (localSubpatch) subPatchOps.push(localSubpatch);
                doneCb(null, subPatchOps);
            });
        }
    }
    else
    {
        let exportId = blueprintId;
        if (CABLES.blueprints && CABLES.blueprints.hasOwnProperty(exportId))
        {
            const blueprintData = CABLES.blueprints[exportId];
            blueprintData.settings = op.patch.settings;
            // for some reason we have to do this in a 0ms timeout to make
            // sure nested blueprints are not loaded before this one created all the ops...
            setTimeout(() =>
            {
                deSerializeBlueprint(blueprintData);
                loadingOut.set(false);
                op.patch.loading.finished(loadingId);
            }, 0);
        }
        else
        {
            const blueprintUrl = op.patch.config.prefixJsPath + op.patch.getJsPath() + exportId + ".json";
            CABLES.ajax(
                blueprintUrl,
                function (err, data)
                {
                    if (!err)
                    {
                        const blueprintData = JSON.parse(data);
                        deSerializeBlueprint(blueprintData);
                    }
                    else
                    {
                        op.logError("failed to load blueprint from", blueprintUrl, err);
                    }
                    loadingOut.set(false);
                    op.patch.loading.finished(loadingId);
                }
            );
        }
    }
}

function addBlueprintInfoToOp(serializedOp)
{
    const patchId = patchIdIn.get();
    const subPatchId = subPatchIdIn.get();

    if (!serializedOp.storage) serializedOp.storage = {};
    if (!serializedOp.storage.blueprint) serializedOp.storage.blueprint = {};

    serializedOp.storage.blueprint.patchId = patchId;

    if (CABLES.Op.isSubPatchOpName(serializedOp.objName))
    {
        const subPatchPort = serializedOp.portsIn.find((port) => { return port.name === "patchId" && port.value === subPatchId; });
        if (subPatchPort)
        {
            serializedOp.storage.blueprint.isParentSubPatch = true;
            // serializedOp.uiAttribs.hidden = true;
            if (!serializedOp.uiAttribs.translate) serializedOp.uiAttribs.translate = {};
            serializedOp.uiAttribs.translate.x = -100;
            serializedOp.uiAttribs.translate.y = -200;
        }
    }
}

function deSerializeBlueprint(data)
{
    const editorMode = op.patch.isEditorMode();
    convertIn.setUiAttribs({ "greyout": true });

    const doneCb = (patchData) =>
    {
        patchData.ops.forEach((replacedOp) =>
        {
            if (!replacedOp.uiAttribs) replacedOp.uiAttribs = {};
            replacedOp.uiAttribs.blueprintOpId = op.id;
            if (CABLES.Op.isBlueprintOp(replacedOp.objName))
            {
                replacedOp.uiAttribs.pasted = true;
            }
        });
        const parentSubPatch = patchData.ops.find((op) =>
        {
            let isParent = false;
            if (op.storage && op.storage.blueprint && op.storage.blueprint.isParentSubPatch) isParent = true;
            return isParent;
        });
        let blueprintSubpatch = null;
        if (parentSubPatch)
        {
            parentSubPatchId = parentSubPatch.id;
            const patchIdPort = parentSubPatch.portsIn.find((port) => { return port.name === "patchId"; });
            if (patchIdPort) blueprintSubpatch = patchIdPort.value;
            op.uiAttribs.blueprintSubpatch = blueprintSubpatch;
            op.patch.deSerialize(patchData, false);
        }
    };

    if (Array.isArray(data.ops) && data.ops.length > 0)
    {
        let originalSaveState = null;
        data = CABLES.Patch.replaceOpIds(data, op.uiAttribs.subPatch, op.id);
        if (editorMode)
        {
            originalSaveState = gui.getSavedState();
            CABLES.UI.undo.pause();

            gui.serverOps.loadProjectDependencies(data, () =>
            {
                doneCb(data);
                const originalSubPatchId = gui.patchView.getCurrentSubPatch();
                gui.patchView.setCurrentSubPatch(originalSubPatchId);

                const pSubPatch = op.patch.getOpById(parentSubPatchId);
                if (pSubPatch)
                {
                    op.setUiAttrib({ "extendTitle": pSubPatch.uiAttribs.title });
                    setupPorts(parentSubPatchId);
                }
                CABLES.UI.undo.resume();
                if (originalSaveState === true)
                {
                    gui.setStateSaved();
                }
                convertIn.setUiAttribs({ "greyout": false });
            });
        }
        else
        {
            const parentSubPatchData = data.ops.find((op) =>
            {
                let isParent = false;
                if (op.storage && op.storage.blueprint && op.storage.blueprint.isParentSubPatch) isParent = true;
                return isParent;
            });
            let blueprintSubpatch = null;
            if (parentSubPatchData)
            {
                parentSubPatchId = parentSubPatchData.id;
                const patchIdPort = parentSubPatchData.portsIn.find((port) => { return port.name === "patchId"; });
                if (patchIdPort) blueprintSubpatch = patchIdPort.value;
            }
            doneCb(data);
            setupPorts(parentSubPatchData.id);
        }
    }
}

function removeImportedOps()
{
    if (op.patch.isEditorMode()) CABLES.UI.undo.pause();
    op.patch.ops.forEach((theOp) =>
    {
        if (theOp.uiAttribs && theOp.uiAttribs.blueprintOpId === op.id)
        {
            op.patch.deleteOp(theOp.id);
        }
    });
    if (op.patch.isEditorMode()) CABLES.UI.undo.resume();
}

const getOldPorts = () =>
{
    const oldPorts = JSON.parse(portsData.get());
    let oldPortsOut = {};
    if (oldPorts.portsOut)
    {
        oldPortsOut = oldPorts.portsOut;
    }
    let oldPortsIn = {};
    if (oldPorts.portsIn)
    {
        oldPortsIn = oldPorts.portsIn;
    }
    return {
        "portsIn": oldPortsIn,
        "portsOut": oldPortsOut
    };
};

const cleanupPorts = () =>
{
    const removeInPorts = [];
    const removeOutPorts = [];

    op.portsIn.forEach((port) =>
    {
        if (!protectedPorts.includes(port.id))
        {
            removeInPorts.push(port);
        }
    });
    op.portsOut.forEach((port) =>
    {
        if (!protectedPorts.includes(port.id))
        {
            removeOutPorts.push(port);
        }
    });

    removeInPorts.forEach((port) =>
    {
        removeInPort(port);
        op.emitEvent("onPortRemoved", {});
    });

    removeOutPorts.forEach((port) =>
    {
        removeOutPort(port);
        op.emitEvent("onPortRemoved", {});
    });

    if (removeOutPorts.length > 0 || removeInPorts.length > 0)
    {
        op.emitEvent("onUiAttribsChange", {});
    }
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

function setupPorts(subPatchId)
{
    if (!subPatchId) return;
    const subPatch = op.patch.getOpById(subPatchId);
    if (!subPatch) return;
    const subPatchDataPort = subPatch.portsIn.find((port) => { return port.name === "dataStr"; });
    if (!subPatchDataPort) return;
    if (!subPatchDataPort.get()) return;

    const oldPorts = getOldPorts();
    cleanupPorts();

    const subPatchData = JSON.parse(subPatchDataPort.get());
    const subPatchPortsIn = subPatchData.ports || [];
    const subPatchPortsOut = subPatchData.portsOut || [];
    let i = 0;

    if (op.patch.isEditorMode()) CABLES.UI.undo.pause();

    const newPorts = [];
    for (i = 0; i < subPatchPortsIn.length; i++)
    {
        if (!op.getPortByName(subPatchPortsIn[i].name))
        {
            const subPatchPort = subPatch.portsIn.find((port) => { return port.name == subPatchPortsIn[i].name; });
            const newPort = op.addInPort(new CABLES.Port(op, subPatchPort.name, subPatchPort.type));

            if (subPatchPort)
            {
                switch (subPatchPort.type)
                {
                case CABLES.OP_PORT_TYPE_FUNCTION:
                    newPort.onTriggered = () =>
                    {
                        subPatchPort.onTriggered();
                    };
                    break;
                default:
                    newPort.onChange = () =>
                    {
                        subPatchPort.set(newPort.get());
                        if (!newPort.isLinked())
                        {
                            savePortData();
                        }
                    };
                }
            }

            if (oldPorts.portsIn.hasOwnProperty(newPort.name))
            {
                if (Array.isArray(oldPorts.portsIn[newPort.name].links))
                {
                    oldPorts.portsIn[newPort.name].links.forEach((link) =>
                    {
                        const bpId = op.uiAttribs.blueprintOpId || op.id;
                        let opId = CABLES.seededUUID(bpId + link.objOut);
                        let parent = op.patch.getOpById(opId) || op.patch.getOpById(link.objOut);
                        if (parent && parent.getPortByName(link.portOut))
                        {
                            const newLink = op.patch.link(parent, link.portOut, op, newPort.name);
                            if (newLink) newLink.ignoreInSerialize = true;
                        }
                    });
                }
                if (!newPort.isLinked())
                {
                    newPort.set(oldPorts.portsIn[newPort.name].value);
                }
            }
            newPort.onLinkChanged = savePortData;

            if (subPatchPort.title)
            {
                newPort.setUiAttribs({ "title": subPatchPortsIn[i].title });
            }
            else if (subPatchPort.uiAttribs && subPatchPort.uiAttribs.title)
            {
                newPort.setUiAttribs({ "title": subPatchPort.uiAttribs.title });
            }
            if (subPatchPort.uiAttribs && subPatchPort.uiAttribs.objType)
            {
                newPort.setUiAttribs({ "objType": subPatchPort.uiAttribs.objType });
            }
            newPorts.push(newPort);
        }
    }
    op.setPortGroup("Blueprint Ports", newPorts);


    for (i = 0; i < subPatchPortsOut.length; i++)
    {
        if (!op.getPortByName(subPatchPortsOut[i].name))
        {
            const patchPortIn = subPatch.portsIn.find((port) => { return port.name === "patchId"; });
            const patchOutputOP = op.patch.getSubPatchOp(patchPortIn.value, "Ops.Ui.PatchOutput");
            if (patchOutputOP.portsIn)
            {
                const subPatchPort = patchOutputOP.portsIn.find((port) => { return port.name == subPatchPortsOut[i].name; });
                const newPort = op.addOutPort(new CABLES.Port(op, subPatchPort.name, subPatchPort.type));
                newPort.ignoreValueSerialize = true;

                if (subPatchPort)
                {
                    switch (subPatchPort.type)
                    {
                    case CABLES.OP_PORT_TYPE_FUNCTION:
                        subPatchPort.onTriggered = () =>
                        {
                            newPort.trigger();
                        };
                        break;
                    default:
                        subPatchPort.onChange = () =>
                        {
                            newPort.set(subPatchPort.get());
                        };
                    }
                    newPort.set(subPatchPort.get());
                }

                if (oldPorts.portsOut.hasOwnProperty(newPort.name))
                {
                    if (Array.isArray(oldPorts.portsOut[newPort.name].links))
                    {
                        oldPorts.portsOut[newPort.name].links.forEach((link) =>
                        {
                            const bpId = op.uiAttribs.blueprintOpId || op.id;
                            let opId = CABLES.seededUUID(bpId + link.objIn);
                            let parent = op.patch.getOpById(opId) || op.patch.getOpById(link.objIn);
                            if (parent && parent.getPortByName(link.portIn))
                            {
                                const newLink = op.patch.link(op, newPort.name, parent, link.portIn);
                                if (newLink) newLink.ignoreInSerialize = true;
                            }
                        });
                    }
                }
                newPort.onLinkChanged = savePortData;

                if (subPatchPort.title)
                {
                    newPort.setUiAttribs({ "title": subPatchPortsOut[i].title });
                }
                else if (subPatchPort.uiAttribs && subPatchPort.uiAttribs.title)
                {
                    newPort.setUiAttribs({ "title": subPatchPort.uiAttribs.title });
                }

                if (subPatchPort.uiAttribs && subPatchPort.uiAttribs.objType)
                {
                    newPort.setUiAttribs({ "objType": subPatchPort.uiAttribs.objType });
                }
            }
        }
    }
    savePortData();
    if (op.patch.isEditorMode()) CABLES.UI.undo.resume();
}

function savePortData()
{
    const newPortsData = {
        "portsIn": {},
        "portsOut": {}
    };
    op.portsIn.forEach((port) =>
    {
        if (!protectedPorts.includes(port.id))
        {
            const portData = {
                "name": port.name,
                "title": port.title,
                "type": port.type,
                "links": []
            };
            if (!port.links || port.links.length === 0) portData.value = port.get();
            port.links.forEach((link) =>
            {
                link.ignoreInSerialize = true;
                const linkData = {
                    "objOut": link.portOut.parent.id,
                    "portOut": link.portOut.name
                };
                portData.links.push(linkData);
            });
            newPortsData.portsIn[port.name] = portData;
        }
    });

    op.portsOut.forEach((port) =>
    {
        if (!protectedPorts.includes(port.id))
        {
            const portData = {
                "name": port.name,
                "title": port.title,
                "type": port.type,
                "links": []
            };
            if (!port.links || port.links.length === 0)
            {
                let portValue = port.get();
                try
                {
                    JSON.stringify(portValue);
                }
                catch (e)
                {
                    portValue = null;
                }
                portData.value = portValue;
            }
            port.links.forEach((link) =>
            {
                link.ignoreInSerialize = true;
                const linkData = {
                    "objIn": link.portIn.parent.id,
                    "portIn": link.portIn.name
                };
                portData.links.push(linkData);
            });
            newPortsData.portsOut[port.name] = portData;
        }
    });

    const serializedPortsData = JSON.stringify(newPortsData);
    portsData.set(serializedPortsData);
}

function getLocalParentSubPatchOp(subPatchId)
{
    if (!subPatchId) return null;
    return op.patch.ops.find((op) =>
    {
        if (CABLES.Op.isSubPatchOpName(op.objName))
        {
            const subPatchPort = op.portsIn.find((port) => { return port.name === "patchId" && port.value === subPatchId; });
            if (subPatchPort) return true;
        }
    });
}

let patchLoadListener = op.patch.on("patchLoadEnd", (newOps, obj, genIds) =>
{
    op.patch.off(patchLoadListener);
    const isRelevant = newOps.some((newOp) => { return newOp.id === op.id || (newOp.uiAttribs && newOp.uiAttribs.subPatch === subPatchIdIn.get()); });
    if (isRelevant && !loadingOut.get())
    {
        update();
    }
});
