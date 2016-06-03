op.name="Effects";
var effectsIn=op.addInPort(new Port(op,"Effects",OP_PORT_TYPE_ARRAY));
var array=op.addInPort(new Port(op,"Points Array",OP_PORT_TYPE_ARRAY));
var outArray=op.addOutPort(new Port(op,"Points",OP_PORT_TYPE_ARRAY));

var bangIn=op.addInPort(new Port(op,"Beat Bang",OP_PORT_TYPE_VALUE));

var count=0;
var slowCount=0;
var startTime=Date.now();

setInterval(function()
{
    count++;    
},50);


setInterval(function()
{
    slowCount++;    
},200);


array.onValueChanged=function()
{
    
    
    var effects=effectsIn.get();
    
    effects=[];
    effects[0]=11;
    var bang=bangIn.get();
    var rnd1=Math.random()-0.5;
    var rnd2=Math.random()-0.5;

    


    if(array.get() )
    {
        var arr = array.get().slice(0);    
        if(count>arr.length/6)count=0;

        var minX=9999999;
        var maxX=-9999999;
        var minY=9999999;
        var maxY=-9999999;
        for(var i=0;i<arr.length;i+=6)
        {
            minX=Math.min(minX,arr[i+0]);
            maxX=Math.max(maxX,arr[i+0]);
    
            minY=Math.min(minY,arr[i+1]);
            maxY=Math.max(maxY,arr[i+1]);
        }

        if(effects)
        {
            for(var e=0;e<effects.length;e++)
            {
                for(var i=0;i<arr.length;i+=6)
                {



    
    // ALL WHITE
    if(effects[e]===0)
    {
        if(arr[i+3]>0 || arr[i+4]>0 || arr[i+5]>0)
        {
            arr[i+3]=255;
            arr[i+4]=255;
            arr[i+5]=255;
        }
    }

    // random colors everywhere
    if(effects[e]===1)
    {
        if(arr[i+3]>0 || arr[i+4]>0 || arr[i+5]>0)
        {
            
            
            arr[i+3]=(i*23478*slowCount+3)%255;//parseInt(Math.random()*115);
            arr[i+4]=(i*23423*slowCount+4234)%255;
            arr[i+5]=(i*34344*slowCount+5567)%255;
            // arr[i+4]=parseInt(Math.random()*115);
            // arr[i+5]=parseInt(Math.random()*125);
        }
    }

    // white line in mesh
    if(effects[e]===2)
    {
        if(i/6>count && i/6<count+10)
        {
            if(arr[i+3]>0 || arr[i+4]>0 || arr[i+5]>0)
            {
                arr[i+3]=255;
                arr[i+4]=255;
                arr[i+5]=255;
            }
        }
        else
        {
            arr[i+3]*=0.35;
            arr[i+4]*=0.35;
            arr[i+5]*=0.35;
        }
    }
    
    // white line / mesh removed
    if(effects[e]===3)
    {
        if(i/6>count && i/6<count+20)
        {
            if(arr[i+3]>0 || arr[i+4]>0 || arr[i+5]>0)
            {
                var mul=((i/6)-count)/20;
                
                arr[i+3]=255*mul;
                arr[i+4]=255*mul;
                arr[i+5]=255*mul;
            }
        }
        else
        {
            arr[i+3]*=0;
            arr[i+4]*=0;
            arr[i+5]*=0;
        }
    }

    // beat flash white
    if(effects[e]===4)
    {
        if(arr[i+3]>0 || arr[i+4]>0 || arr[i+5]>0)
        {
            arr[i+3]*=bang;
            arr[i+4]*=bang;
            arr[i+5]*=bang;
        }
    }

    // shake every point
    if(effects[e]===5)
    {
        var r1=Math.random()*800-400;
        var r2=Math.random()*800-400;
        arr[i+0]=arr[i+0]+r1;
        arr[i+1]=arr[i+1]+r2;
    }

    // shake alltogether
    if(effects[e]===6)
    {
        var r=rnd1*800;
        var r2=rnd2*800;
        arr[i+0]=arr[i+0]+r;
        arr[i+1]=arr[i+1]+r2;
    }

    // waber waber    
    if(effects[e]===7)
    {
        arr[i+0]+=Math.sin(arr[i+0]*0.01)*arr[i+1]*0.1;
        arr[i+1]+=Math.sin(arr[i+1]*0.01)*arr[i+0]*0.1;
    }

    // scale axis...
    if(effects[e]===8)
    {
        arr[i+0]*=bang;
    }
    if(effects[e]===9)
    {
        arr[i+1]*=bang;
    }
    
    
    
    // wandernde loecher
    if(effects[e]===10)
    {
        for(var j=0;j<10;j++)
        {
            if(i/6+j*13>count && i/6+j*13<count+10)
            {
                if(arr[i+3]>0 || arr[i+4]>0 || arr[i+5]>0)
                {
                    arr[i+0]=0;
                    arr[i+1]=0;
                }
            }
        }
    }




    // random loecher
    if(effects[e]===11)
    {
        if((i+count)%40>20)
        {
            if(arr[i+3]>0 || arr[i+4]>0 || arr[i+5]>0)
            {
                arr[i+0]=0;
                arr[i+1]=0;

                arr[i+3]=0;
                arr[i+4]=0;
                arr[i+5]=0;
            }
        }
    }


    // smooth hue 
    if(effects[e]===12)
    {
        var rgb=changeHue(arr[i+3],arr[i+4],arr[i+5],((Date.now()-startTime)/1000*15)%360);
        arr[i+3]=rgb[0];
        arr[i+4]=rgb[1];
        arr[i+5]=rgb[2];
    }

    // smooth verlauf 
    if(effects[e]===13)
    {
        var rgb=changeHue(arr[i+3],arr[i+4],arr[i+5],(count*10+i)%360);
        arr[i+3]=rgb[0];
        arr[i+4]=rgb[1];
        arr[i+5]=rgb[2];
    }








                }
                
            }

        }
    
        
        outArray.set(null);
        outArray.set(arr);
        
    }
    
    
};



function changeHue(r,g,b, degree)
{
    var hsl = rgbToHSL(r/255,g/255,b/255);
    hsl.h += degree;
    if (hsl.h > 360) {
        hsl.h -= 360;
    }
    else if (hsl.h < 0) {
        hsl.h += 360;
    }
    return hslToRGB(hsl);
}

// exepcts a string and returns an object
function rgbToHSL(r,g,b)
{

    var cMax = Math.max(r, g, b),
        cMin = Math.min(r, g, b),
        delta = cMax - cMin,
        l = (cMax + cMin) / 2,
        h = 0,
        s = 0;

    if (delta == 0) {
        h = 0;
    }
    else if (cMax == r) {
        h = 60 * (((g - b) / delta) % 6);
    }
    else if (cMax == g) {
        h = 60 * (((b - r) / delta) + 2);
    }
    else {
        h = 60 * (((r - g) / delta) + 4);
    }

    if (delta == 0) {
        s = 0;
    }
    else {
        s = (delta/(1-Math.abs(2*l - 1)))
    }

    return {
        h: h,
        s: s,
        l: l
    }
}

// expects an object and returns a string
function hslToRGB(hsl)
{
    var h = hsl.h,
        s = hsl.s,
        l = hsl.l,
        c = (1 - Math.abs(2*l - 1)) * s,
        x = c * ( 1 - Math.abs((h / 60 ) % 2 - 1 )),
        m = l - c/ 2,
        r, g, b;

    if (h < 60) {
        r = c;
        g = x;
        b = 0;
    }
    else if (h < 120) {
        r = x;
        g = c;
        b = 0;
    }
    else if (h < 180) {
        r = 0;
        g = c;
        b = x;
    }
    else if (h < 240) {
        r = 0;
        g = x;
        b = c;
    }
    else if (h < 300) {
        r = x;
        g = 0;
        b = c;
    }
    else {
        r = c;
        g = 0;
        b = x;
    }

    r = normalize_rgb_value(r, m);
    g = normalize_rgb_value(g, m);
    b = normalize_rgb_value(b, m);

    return [r,g,b];
}

function normalize_rgb_value(color, m) {
    color = Math.floor((color + m) * 255);
    if (color < 0) {
        color = 0;
    }
    return color;
}



