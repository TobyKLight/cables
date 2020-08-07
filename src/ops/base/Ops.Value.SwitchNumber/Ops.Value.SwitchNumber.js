var idx=op.inValueInt("Index");
var valuePorts=[];
var result=op.outValue("Result");

idx.onChange=update;

for(var i=0;i<16;i++)
{
    var p=op.inValue("Value "+i);
    valuePorts.push( p );
    p.onChange=update;
}

function update()
{
    if(idx.get()>=0 && valuePorts[idx.get()])
    {
        result.set( valuePorts[idx.get()].get() );
    }
}