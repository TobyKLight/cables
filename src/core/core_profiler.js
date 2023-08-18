import { now } from "./timer";

const Profiler = function (patch)
{
    this.startFrame = patch.getFrameNum();

    let items = {};
    let currentId = null;
    let currentStart = 0;

    this.getItems = function ()
    {
        return items;
    };

    this.clear = function ()
    {
        items = {};
    };

    this.togglePause=()=>
    {
        this.paused=!this.paused;
        if(!this.paused)currentStart=performance.now();
    }

    this.add = function (type, object)
    {
        if(this.paused)return;

        if (currentId !== null)
        {
            if (!object || object.id != currentId)
            {
                if (items[currentId])
                {
                    items[currentId].timeUsed += performance.now() - currentStart;

                    if (!items[currentId].peakTime || now() - items[currentId].peakTime > 5000)
                    {
                        items[currentId].peak = 0;
                        items[currentId].peakTime = now();
                    }
                    items[currentId].peak = Math.max(items[currentId].peak, performance.now() - currentStart);
                }
            }
        }

        if (object !== null)
        {
            if (!items[object.id])
            {
                items[object.id] = {
                    "numTriggers": 0,
                    "timeUsed": 0,
                };
            }

            // this.startFrame = patch.getFrameNum();
            if (items[object.id].lastFrame != patch.getFrameNum()) items[object.id].numTriggers = 0;

            items[object.id].lastFrame = patch.getFrameNum();
            items[object.id].numTriggers++;
            items[object.id].opid = object.op.id;
            items[object.id].title = object.op.name + "." + object.name;
            items[object.id].subPatch = object.op.uiAttribs.subPatch;

            currentId = object.id;
            currentStart = performance.now();
        }
        else
        {
            currentId = null;
        }
    };

    this.print = function ()
    {
        console.log("--------");
        for (const i in items)
        {
            console.log(items[i].title + ": " + items[i].numTriggers + " / " + items[i].timeUsed);
        }
    };
};

export { Profiler };
