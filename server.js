const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const path = require('path');

const PROTO_PATH = path.join(__dirname, 'greeter.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH);

const proto = grpc.loadPackageDefinition(packageDefinition).greeter;

// simple rpc
function sayHello(call,callback){
    const reply = {message:`hello ${call.request.name}`};
    console.log(`received ${call.request.name}`);
    callback(null, reply);
}

// server streaming
function listGreetings(call){
    const name = call.request.name;
    let arr = ["hello","hi","yo","sup"]
    arr.forEach((greet)=>{
        call.write({message:`${greet} ${name}`
    });
    })
    call.end();
}

// client streaming
function summarizeGreetings(call,callback){
    let arr = [];
    call.on('data',(data)=>{
        arr.push(data);
    })
    call.on('end',()=>{
        arr.forEach((greet)=>{
            console.log(greet.name);
        })
        console.log("stream ended.....");
        callback(null, {message:"same to you"});
    })
}

// bidirectional streaming
function meeting(call){
    call.on('data',(data)=>{
        console.log(`received ${data.name}`);
        call.write({message:`same to you for  ${(data.name)}`});
    })
    call.on('end',()=>{
        call.end();
        console.log("meeting ended.....");
    })
}

function main(){
    const server = new grpc.Server();
    server.addService(proto.Greeter.service,{
        SayHello:sayHello,
        ListGreetings:listGreetings,
        SummarizeGreetings:summarizeGreetings,
        Meeting:meeting
    });
    server.bindAsync('0.0.0.0:5050',grpc.ServerCredentials.createInsecure(),(err,port)=>{
        if(err) {
            console.log("Failed to bind service: " + err);
            return;
        }
        console.log(`server is running on port: ${port}`);
    });
}


main();