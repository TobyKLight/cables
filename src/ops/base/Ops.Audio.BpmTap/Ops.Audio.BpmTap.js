const exe = this.addInPort(new CABLES.Port(this, "exe", CABLES.OP_PORT_TYPE_FUNCTION));
const tap = this.addInPort(new CABLES.Port(this, "tap", CABLES.OP_PORT_TYPE_FUNCTION, { "display": "button" }));
const sync = this.addInPort(new CABLES.Port(this, "sync", CABLES.OP_PORT_TYPE_FUNCTION, { "display": "button" }));
const nudgeLeft = this.addInPort(new CABLES.Port(this, "nudgeLeft", CABLES.OP_PORT_TYPE_FUNCTION, { "display": "button" }));
const nudgeRight = this.addInPort(new CABLES.Port(this, "nudgeRight", CABLES.OP_PORT_TYPE_FUNCTION, { "display": "button" }));

const beat = this.addOutPort(new CABLES.Port(this, "beat", CABLES.OP_PORT_TYPE_FUNCTION));
// const bpm = this.addOutPort(new CABLES.Port(this, "Bpm", CABLES.OP_PORT_TYPE_VALUE, { "display": "editor" }),0);
const bpm = op.outNumber("Bpm", 0);
const outStates = this.addOutPort(new CABLES.Port(this, "States", CABLES.OP_PORT_TYPE_ARRAY));

const beatNum = this.addOutPort(new CABLES.Port(this, "Beat Index", CABLES.OP_PORT_TYPE_VALUE));

const DEFAULT_BPM = 127;
const DEFAULT_MILLIS = bpmToMillis(DEFAULT_BPM);
const NUDGE_VALUE = 0.5; // to add / substract from avg bpm

let lastFlash = -1;
let lastTap = -1;

const taps = [];

let avgBpm = DEFAULT_BPM;
let avgMillis = getAvgMillis();

let beatCounter = 1; // [1, 2, 3, 4]
const states = [1, 0, 0, 0];

exe.onTriggered = function ()
{
    if (op.patch.freeTimer.get() * 1000 < lastFlash)
    {
        lastFlash = op.patch.freeTimer.get() * 1000;
    }

    if (op.patch.freeTimer.get() * 1000 > lastFlash + avgMillis)
    {
        beat.trigger();
        incrementState();
        outStates.set(null);
        outStates.set(states);

        bpm.set(millisToBpm(avgMillis));
        lastFlash = op.patch.freeTimer.get() * 1000;
    }
};

function incrementState()
{
    beatCounter++;
    if (beatCounter > 4)
    {
        beatCounter = 1;
    }
    for (let i = 0; i < 4; i++)
    {
        states[i] = 0;
    }
    states[beatCounter - 1] = 1;

    beatNum.set(beatCounter - 1);
}

function tapPressed()
{
    // start new tap session
    if (op.patch.freeTimer.get() * 1000 - lastTap > 1000)
    {
        taps.length = 0;
        beatCounter = 0;
    }
    else
    {
        taps.push(op.patch.freeTimer.get() * 1000 - lastTap);
    }
    lastTap = op.patch.freeTimer.get() * 1000;
    avgMillis = getAvgMillis();
}

function millisToBpm(millis)
{
    return Number(60 * 1000 / millis).toFixed(2);
}

function bpmToMillis(bpm)
{
    return 60 * 1000 / bpm;
}

function getAvgMillis()
{
    if (taps.length >= 1)
    {
        let sum = 0.0;
        for (let i = 0; i < taps.length; i++)
        {
            sum += taps[i];
        }
        return sum / taps.length;
    }
    else
    {
        return DEFAULT_MILLIS;
    }
}

function syncPressed()
{
    // on next execute everything will be reset to first beat
    lastFlash = -1;
    beatCounter = 0;
}

function nudgeLeftPressed()
{
    avgBpm += NUDGE_VALUE;
    avgMillis = bpmToMillis(avgBpm);
}

function nudgeRightPressed()
{
    avgBpm -= NUDGE_VALUE;
    avgMillis = bpmToMillis(avgBpm);
}

tap.onTriggered = tapPressed;
sync.onTriggered = syncPressed;
nudgeLeft.onTriggered = nudgeLeftPressed;
nudgeRight.onTriggered = nudgeRightPressed;
