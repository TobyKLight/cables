op.name='SmootherStep';

var result=op.addOutPort(new Port(op,"result"));
var val=op.addInPort(new Port(op,"val"));
var min=op.addInPort(new Port(op,"min"));
var max=op.addInPort(new Port(op,"max"));

min.set(0);
max.set(1);
val.set(0);

val.onValueChanged=exec;
max.onValueChanged=exec;
min.onValueChanged=exec;

exec();

function exec()
{
    var x = Math.max(0, Math.min(1, (val.get()-min.get())/(max.get()-min.get())));
    result.set( x*x*x*(x*(x*6 - 15) + 10)); // smootherstep
}


