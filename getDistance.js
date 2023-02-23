function getDistance(lat1, long1, lat2, long2) {
    var radius = 6371; // Radius of the earth in km
    var distLat = toRad(lat2-lat1); 
    var distLon = toRad(long2-long1); 
    var x = Math.sin(distLat/2) * Math.sin(distLat/2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(distLon/2) * Math.sin(distLon/2); 
    var y = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1-x)); 
    var radius = 6371; // Radius of the earth in km
    var finalAns = radius * y; // Distance in km
    //var finalAns = Math.acos(Math.sin(lat1)*Math.sin(lat2)+Math.cos(lat1)*Math.cos(lat2)*Math.cos(long2-long1))*6371
    return finalAns.toFixed(2);

}
  
function toRad(deg) {
    return deg * (Math.PI/180)
}

module.exports = getDistance;

