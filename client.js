const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const path = require('path');

const PROTO_PATH = path.join(__dirname, 'greeter.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH);

const proto = grpc.loadPackageDefinition(packageDefinition).greeter;


//  simple rpc
function simpleRPC(client){
    client.SayHello({name:"pranav"},(err,res) => {
        if(err) console.error(err);
        else console.log(res.message);
    })
}

// server streaming
function serverStreaming(client){
    let call = client.ListGreetings({name:"pranav"});
    call.on("data", (res)=>{
        console.log(`Received ${res.message}`);
    });
    call.on("end", ()=>{
        console.log("stream ended.....");
    });
    call.on("error", (err)=>{
        console.error("Error: ", err);
    })
}

// client streaming
function clientStreaming(client){
    const call = client.SummarizeGreetings((err,res)=>{
        if(err) return console.error(err);
        console.log(res.message);
    });

    let arr = ["hello","hi","yo","sup"]
    arr.forEach((greet)=>{
        call.write({name:`${greet} pranav`});
    })
    call.end();
}

// bidirectional streaming
function bidirectionalStreaming(client){
    const call = client.Meeting();

    // console.log("start meeting.....")
    call.on("data", (res)=>{
        console.log(`Received ${res.message}`);
    })
    call.on("end", ()=>{
        console.log("meeting ended.....")
    })
    for(let i = 1; i < 5; i++){
        call.write({name:`hi pranav${i}`});
    }
    call.end();
}

function main() {
    const client = new proto.Greeter('localhost:5050',grpc.credentials.createInsecure());
    bidirectionalStreaming(client);
}

main();