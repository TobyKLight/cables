import { CGState } from "../cg/cg_state";

/**
 * cables gl context/state manager
 * @external CGL
 * @namespace Context
 * @class
 * @hideconstructor
 */
const Context = function (_patch)
{
    // EventTarget.apply(this);
    CGState.apply(this);

    this.getViewPort = function ()
    {
        return [0, 0, this.canvasWidth, this.canvasHeight];
    };
};

export { Context };
