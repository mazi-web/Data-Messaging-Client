
const amqp = require("amqplib");
process.on('message', (msg) => {
    console.log('Message from parent:', msg);
  });
  
  //let counter = 0;
  

  

  
  setInterval(() => {
    let lat1;
    let lat2;
    let lat3;
    let long1;
    let long2;
    let long3;

    lat1 = randomize(90)
    lat2 = randomize(90)
    lat3 = randomize(90)
    long1 = randomize(180)
    long2 = randomize(180)
    long3 = randomize(180)

    msg = {
        coord1: string(lat1)+','+string(long1),
        coord2: string(lat2)+','+string(long2),
        coord3: string(lat3)+','+string(long3),

        dist1: string(getDistance(lat1, long1, lat2, long2)),
        dist2: string(getDistance(lat1, long1, lat3, long3)),
        dist3: string(getDistance(lat3, long3, lat2, long2))
    }
    //console.log(msg)
    //sendCoord(msg)
    
    process.send({ msg: msg });
  }, 1000);