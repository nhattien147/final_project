const map2 = L.map2("map2");
// Initializes map2
map2.setView([51.505, -0.09], 13);
// Sets initial coordinates and zoom  level
L.tileLayer("https://tile.openstreetmap2.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '© <a href="http://www.openstreetmap2.org/copyright">OpenStreetmap2</a>',
}).addTo(map2);
// Sets map2 data source and associates with map2
let marker, circle, zoomed;
navigator.geolocation.watchPosition(success, error);
function success(pos) {
  const lat = document.getElementById("lat_id").value;
  const lng = document.getElementById("long_id").value;
  const accuracy = pos.coords.accuracy;
  console.log(lat);
  console.log(lng);

  if (marker) {
    map2.removeLayer(marker);
    map2.removeLayer(circle);
  }
  // Removes any existing marker and circule (new ones about to be set)
  marker = L.marker([lat, lng]).addTo(map2);
  circle = L.circle([lat, lng], { radius: accuracy }).addTo(map2);
  // Adds marker to the map2 and a circle for accuracy
  if (!zoomed) {
    zoomed = map2.fitBounds(circle.getBounds());
  }
  // Set zoom to boundaries of accuracy circle
  map2.setView([lat, lng]);
  // Set map2 focus to current user position
}
function error(err) {
  if (err.code === 1) {
    alert("Please allow geolocation access");
  } else {
    alert("Cannot get current location");
  }
}
//-----------------------------MQTT connection-------------------------//
var host = "broker.emqx.io";
var port = 8083;
var topic1 = "data2222222222222222";
// Khoi tao ket noi Paho client
var client = new Paho.MQTT.Client(host, Number(port), "TTP"); // sua lai host; port
client.qos = 0;
client.retained = 1;
client.destinationName = topic1;
// Cac function nay se duoc goi khi co gi do xay ra(mat ket noi, nhan duoc du lieu)
client.onConnectionLost = onConnectionLost;
client.onMessageArrived = onMessageArrived;
// tien hanh ket noi voi client
client.connect({ onSuccess: onConnect });
// called when the client connects
function onConnect() {
  // Once a connection has been made, make a subscription and send a message.
  console.log("onConnect to " + topic1);
  client.subscribe(topic1);
}
// goi ham nay toi khi client duoc ket noi
function Connect() {
  message = new Paho.MQTT.Message("Hello"); // gui tin nhan da ket noi duoc toi publisher
  message.destinationName = topic1;
  message.qos = 1;
  console.log(message);
  client.send(message);
}
// ham duoc goi khi tin nhan gui duoc nhan
function onMessageArrived(message) {
  console.log("onMessageArrived topic1:" + message.payloadString);
}

// goi ham nay khi mat ket noi voi client
function onConnectionLost(responseObject) {
  if (responseObject.errorCode !== 0) {
    console.log("onConnectionLost:" + responseObject.errorMessage);
  }
}

//-----------------------------map2--------------------------------//
const map2 = L.map2("map2");
L.tileLayer("https://tile.openstreetmap2.org/{z}/{x}/{y}.png", {
  maxZoom: 20,
  attribution: "© OpenStreetmap2",
}).addTo(map2);

//-----------------------------Variables-------------------------//
let marker,
  zoomed,
  lat,
  lng,
  vel,
  dis = 0;
let lat_af = 0,
  lng_af = 0,
  temp1,
  temp2;
let p1 = 0,
  p2 = 0,
  d = 0;
let hour_af = 0,
  minute_af = 0,
  second_af = 0;
var EarthRadiusKm = 6371.0;
var MeterPerKm = 1000.0;
var degreesToRadians = function (degrees) {
  return degrees * (Math.PI / 180);
};
//-----------------------------Message-------------------------//
function onMessageArrived(message) {
  var data = message.payloadString;
  console.log(data);
  const convert = JSON.parse(data);
  document.getElementById("Ki").value = convert.v; // hien thi
  document.getElementById("V_id").value = convert.v; // ve
  document.getElementById("Kd").value = convert.heart_rate; // hien thi
  document.getElementById("HR_id").value = convert.heart_draw; // ve
  document.getElementById("lat_id").value = convert.lat;
  document.getElementById("long_id").value = convert.lon;
  lat = lat_af;
  lng = lng_af;
  lat_af = document.getElementById("lat_id").value;
  lng_af = document.getElementById("long_id").value;
  vel = document.getElementById("Ki").value;
  //-----------------------------Distance calculate-------------------------//
  if (lat != 0) {
    var dLat = degreesToRadians(lat_af - lat);
    var dLon = degreesToRadians(lng_af - lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(degreesToRadians(lat)) *
        Math.cos(degreesToRadians(lat_af)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = EarthRadiusKm * c * MeterPerKm;

    console.log(Math.round(dis));
    if (vel > 2) {
      dis = dis + d;
      document.getElementById("Kp").value = Math.round(dis);
      document.getElementById("distance_id").value = Math.round(dis);
    }
  }
  $(document).ready(function () {
    $.post("addData_mpu.php", $("#form_data").serialize(), function () {});
  });
  // vẽ point trên map2
  var latlngs = [
    [lat_af, lng_af],
    [lat_af, lng_af],
  ];

  var polyline = L.polyline(latlngs, { color: "red" }).addTo(map2);
  if (marker) {
    map2.removeLayer(marker);
  }
  marker = L.marker([lat_af, lng_af]).addTo(map2);
  map2.setView([lat_af, lng_af], 18);
}
