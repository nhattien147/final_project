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
client.connect({
  onSuccess: onConnect,
});
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
//-----------------------------MAP--------------------------------//
const map = L.map("map");
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 25,
}).addTo(map);
const map2 = L.map("id_hm");
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 25,
}).addTo(map2);
//-----------------------------Variables-------------------------//
let marker,
  zoomed,
  lat,
  lng,
  vel,
  dis = 0,
  marker1,
  count = 0;
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
let average = 0,
  result = 0;
var time = 0;
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
  if (convert.heart_rate > 30) {
    document.getElementById("Kd").value = convert.heart_rate; // hien thi
    document.getElementById("HRR_id").value = convert.heart_rate; // hien thi
  }
  document.getElementById("HR_id").value = convert.heart_draw; // ve
  document.getElementById("lat_id").value = convert.lat;
  document.getElementById("long_id").value = convert.lon;
  time++;
  if (time == 3) {
    document.getElementById("time_id").value = count++;
    time = 0;
  }
  lat = lat_af;
  lng = lng_af;
  lat_af = document.getElementById("lat_id").value;
  lng_af = document.getElementById("long_id").value;
  vel = convert.v;
  console.log("vel:" + vel);
  if (vel > 4.5 && vel < 30) {
    document.getElementById("Ki").value = vel; // hien thi
    document.getElementById("V_id").value = vel; // ve
  }
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
    // distance
    if (vel > 3 && vel < 20) {
      dis = dis + d;
      console.log(dis);
      document.getElementById("Kp").value = Math.round(dis);
      document.getElementById("distance_id").value = Math.round(dis);
    }
  }
  $(document).ready(function () {
    $.post("addData_mpu2.php", $("#form_data").serialize(), function () {});
  });
  // vẽ point trên map
  var latlngs = [
    [lat_af, lng_af],
    [lat_af, lng_af],
  ];
  addressPoints = latlngs.map(function (p) {
    return [p[0], p[1], 1.0];
  });
  //var polyline = L.polyline(latlngs, { color: "red" }).addTo(map);
  var polyline2 = L.polyline(latlngs, {
    color: "red",
  }).addTo(map2);
  if (marker) {
    map.removeLayer(marker);
    map2.removeLayer(marker1);
  }
  //marker = L.marker([lat_af, lng_af]).addTo(map);
  map.setView([lat_af, lng_af], 19);
  //marker1 = L.marker([lat_af, lng_af]).addTo(map2);
  map2.setView([lat_af, lng_af], 19);
  //heat map
  ("use strict");
  L.HeatLayer = (L.Layer ? L.Layer : L.Class).extend({
    // options: {
    //     minOpacity: 0.05,
    //     maxZoom: 18,
    //     radius: 25,
    //     blur: 15,
    //     max: 1.0
    // },
    initialize: function (latlngs, options) {
      this._latlngs = latlngs;
      L.setOptions(this, options);
    },
    setLatLngs: function (latlngs) {
      this._latlngs = latlngs;
      return this.redraw();
    },
    addLatLng: function (latlng) {
      this._latlngs.push(latlng);
      return this.redraw();
    },
    setOptions: function (options) {
      L.setOptions(this, options);
      if (this._heat) {
        this._updateOptions();
      }
      return this.redraw();
    },
    redraw: function () {
      if (this._heat && !this._frame && this._map && !this._map._animating) {
        this._frame = L.Util.requestAnimFrame(this._redraw, this);
      }
      return this;
    },
    onAdd: function (map) {
      this._map = map;
      if (!this._canvas) {
        this._initCanvas();
      }
      if (this.options.pane) {
        this.getPane().appendChild(this._canvas);
      } else {
        map._panes.overlayPane.appendChild(this._canvas);
      }
      map.on("moveend", this._reset, this);
      if (map.options.zoomAnimation && L.Browser.any3d) {
        map.on("zoomanim", this._animateZoom, this);
      }
      this._reset();
    },
    onRemove: function (map) {
      if (this.options.pane) {
        this.getPane().removeChild(this._canvas);
      } else {
        map.getPanes().overlayPane.removeChild(this._canvas);
      }
      map.off("moveend", this._reset, this);
      if (map.options.zoomAnimation) {
        map.off("zoomanim", this._animateZoom, this);
      }
    },
    addTo: function (map) {
      map.addLayer(this);
      return this;
    },
    _initCanvas: function () {
      var canvas = (this._canvas = L.DomUtil.create(
        "canvas",
        "leaflet-heatmap-layer leaflet-layer"
      ));
      var originProp = L.DomUtil.testProp([
        "transformOrigin",
        "WebkitTransformOrigin",
        "msTransformOrigin",
      ]);
      canvas.style[originProp] = "50% 50%";
      var size = this._map.getSize();
      canvas.width = size.x;
      canvas.height = size.y;
      var animated = this._map.options.zoomAnimation && L.Browser.any3d;
      L.DomUtil.addClass(
        canvas,
        "leaflet-zoom-" + (animated ? "animated" : "hide")
      );
      this._heat = simpleheat(canvas);
      this._updateOptions();
    },
    _updateOptions: function () {
      this._heat.radius(
        this.options.radius || this._heat.defaultRadius,
        this.options.blur
      );
      if (this.options.gradient) {
        this._heat.gradient(this.options.gradient);
      }
      if (this.options.max) {
        this._heat.max(this.options.max);
      }
    },
    _reset: function () {
      var topLeft = this._map.containerPointToLayerPoint([0, 0]);
      L.DomUtil.setPosition(this._canvas, topLeft);
      var size = this._map.getSize();
      if (this._heat._width !== size.x) {
        this._canvas.width = this._heat._width = size.x;
      }
      if (this._heat._height !== size.y) {
        this._canvas.height = this._heat._height = size.y;
      }
      this._redraw();
    },
    _redraw: function () {
      if (!this._map) {
        return;
      }
      var data = [],
        r = this._heat._r,
        size = this._map.getSize(),
        bounds = new L.Bounds(L.point([-r, -r]), size.add([r, r])),
        max = this.options.max === undefined ? 1 : this.options.max,
        maxZoom =
          this.options.maxZoom === undefined
            ? this._map.getMaxZoom()
            : this.options.maxZoom,
        v =
          1 /
          Math.pow(2, Math.max(0, Math.min(maxZoom - this._map.getZoom(), 12))),
        cellSize = r / 2,
        grid = [],
        panePos = this._map._getMapPanePos(),
        offsetX = panePos.x % cellSize,
        offsetY = panePos.y % cellSize,
        i,
        len,
        p,
        cell,
        x,
        y,
        j,
        len2,
        k;
      // console.time('process');
      for (i = 0, len = this._latlngs.length; i < len; i++) {
        p = this._map.latLngToContainerPoint(this._latlngs[i]);
        if (bounds.contains(p)) {
          x = Math.floor((p.x - offsetX) / cellSize) + 2;
          y = Math.floor((p.y - offsetY) / cellSize) + 2;
          var alt =
            this._latlngs[i].alt !== undefined
              ? this._latlngs[i].alt
              : this._latlngs[i][2] !== undefined
              ? +this._latlngs[i][2]
              : 1;
          k = alt * v;
          grid[y] = grid[y] || [];
          cell = grid[y][x];
          if (!cell) {
            grid[y][x] = [p.x, p.y, k];
          } else {
            cell[0] = (cell[0] * cell[2] + p.x * k) / (cell[2] + k); // x
            cell[1] = (cell[1] * cell[2] + p.y * k) / (cell[2] + k); // y
            cell[2] += k; // cumulated intensity value
          }
        }
      }
      for (i = 0, len = grid.length; i < len; i++) {
        if (grid[i]) {
          for (j = 0, len2 = grid[i].length; j < len2; j++) {
            cell = grid[i][j];
            if (cell) {
              data.push([
                Math.round(cell[0]),
                Math.round(cell[1]),
                Math.min(cell[2], max),
              ]);
            }
          }
        }
      }
      // console.timeEnd('process');
      // console.time('draw ' + data.length);
      this._heat.data(data).draw(this.options.minOpacity);
      // console.timeEnd('draw ' + data.length);
      this._frame = null;
    },
    _animateZoom: function (e) {
      var scale = this._map.getZoomScale(e.zoom),
        offset = this._map
          ._getCenterOffset(e.center)
          ._multiplyBy(-scale)
          .subtract(this._map._getMapPanePos());
      if (L.DomUtil.setTransform) {
        L.DomUtil.setTransform(this._canvas, offset, scale);
      } else {
        this._canvas.style[L.DomUtil.TRANSFORM] =
          L.DomUtil.getTranslateString(offset) + " scale(" + scale + ")";
      }
    },
  });
  L.heatLayer = function (latlngs, options) {
    return new L.HeatLayer(latlngs, options);
  };
  //////////////////////////////////////////////////////////////////////////////////////
  var heat = L.heatLayer(addressPoints, {
    radius: 7,
    gradient: {
      0: "blue",
      0: "lime",
      0.5: "red",
    },
    minOpacity: 0.9,
    blur: 8,
  }).addTo(map);
}
