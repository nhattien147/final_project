var product = [
  {
    id: 0,
    time: "",
    title: "",
    price: "", //distance
    description: "",
    brand: "", // sprint speed
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/1665px-No-Image-Placeholder.svg.png",
  },
  {
    id: 1,
    title: "Nguyễn Nhật Tiến",
    brand: "123",
    image: "images/tien.jpg",
  },
  {
    id: 2,
    title: "Võ Công Thức",
    brand: "",
    image: "images/thuc.jpg",
  },
  {
    id: 3,
    title: "Hồ Bảo Trân",
    brand: "",
    image: "images/tran.jpg",
  },
];

$.post("readdataa.php", function (data) {
  var uniqueDistances = [];
  var totalDistance = 0;
  var maxDistance = 0;
  var shouldAdd = false;
  var maxSpeed = 0;
  var averageHR = 0;
  var totalHR = 0;
  var time = 0;
  var latLongArray = [];
  var heartRateValues = []; // Mảng lưu trữ 10 giá trị nhịp tim gần nhất
  var sprintDistance = 0; // Thêm biến sprintDistance và gán giá trị ban đầu là 0
  for (var i = data.length - 1; i >= 0; i--) {
    var currentDistance = parseInt(data[i].distance);
    var currentSpeed = parseFloat(data[i].velocity);
    var currentHR = parseInt(data[i].BPM);
    var currentTime = parseInt(data[i].time);
    var currentLat = parseFloat(data[i].lat);
    var currentLong = parseFloat(data[i].longg);
    if (shouldAdd && currentDistance === 0) {
      totalDistance += maxDistance;
      maxDistance = 0;
    }
    if (currentDistance > maxDistance) {
      maxDistance = currentDistance;
    }
    if (currentDistance === 0) {
      shouldAdd = true;
    } else {
      shouldAdd = false;
    }
    if (currentSpeed > maxSpeed) {
      maxSpeed = currentSpeed;
    }
    totalHR += currentHR;
    time += currentTime;
    var latLong = [currentLat, currentLong, 1];
    latLongArray.push(latLong);
    // Thêm giá trị nhịp tim vào mảng tạm thời
    heartRateValues.push(currentHR);
    if (heartRateValues.length > 10) {
      heartRateValues.shift(); // Loại bỏ giá trị nhịp tim cũ nhất nếu mảng vượt quá 10 phần tử
    }
    if (currentDistance !== 0 && currentSpeed > 15) {
      // Thêm điều kiện để tính toán sprint distance
      sprintDistance += currentDistance;
    }
  }
  var count = Object.keys(data).length;
  if (count > 10) {
    averageHR =
      heartRateValues.reduce((a, b) => a + b, 0) / heartRateValues.length;
  }
  console.log("Tổng distance: " + totalDistance);
  console.log("Vận tốc lớn nhất: " + maxSpeed);
  console.log("Nhịp tim trung bình: " + averageHR);
  console.log("time: " + time);
  console.log("Sprint distance: " + sprintDistance); // In ra giá trị sprint distance
  console.log(latLongArray);
  product[1].price = totalDistance / 1000;
  product[1].description = maxSpeed;
  product[1].brand = sprintDistance / 1000;
  product[1].time = (time / 300000).toFixed(3);

  console.log(product);
});

$.post("readdataa1.php", function (data) {
  var uniqueDistances = [];
  var totalDistance = 0;
  var maxDistance = 0;
  var shouldAdd = false;
  var maxSpeed = 0;
  var averageHR = 0;
  var totalHR = 0;
  var time = 0;
  var latLongArray = [];
  var heartRateValues = []; // Mảng lưu trữ 10 giá trị nhịp tim gần nhất
  var sprintDistance = 0; // Thêm biến sprintDistance và gán giá trị ban đầu là 0
  for (var i = data.length - 1; i >= 0; i--) {
    var currentDistance = parseInt(data[i].distance);
    var currentSpeed = parseFloat(data[i].velocity);
    var currentHR = parseInt(data[i].BPM);
    var currentTime = parseInt(data[i].time);
    var currentLat = parseFloat(data[i].lat);
    var currentLong = parseFloat(data[i].longg);
    if (shouldAdd && currentDistance === 0) {
      totalDistance += maxDistance;
      maxDistance = 0;
    }
    if (currentDistance > maxDistance) {
      maxDistance = currentDistance;
    }
    if (currentDistance === 0) {
      shouldAdd = true;
    } else {
      shouldAdd = false;
    }
    if (currentSpeed > maxSpeed) {
      maxSpeed = currentSpeed;
    }
    totalHR += currentHR;
    time += currentTime;
    var latLong = [currentLat, currentLong, 1];
    latLongArray.push(latLong);
    // Thêm giá trị nhịp tim vào mảng tạm thời
    heartRateValues.push(currentHR);
    if (heartRateValues.length > 10) {
      heartRateValues.shift(); // Loại bỏ giá trị nhịp tim cũ nhất nếu mảng vượt quá 10 phần tử
    }
    if (currentDistance !== 0 && currentSpeed > 15) {
      // Thêm điều kiện để tính toán sprint distance
      sprintDistance += currentDistance;
    }
  }
  var count = Object.keys(data).length;
  if (count > 10) {
    averageHR =
      heartRateValues.reduce((a, b) => a + b, 0) / heartRateValues.length;
  }
  console.log("Tổng distance: " + totalDistance);
  console.log("Vận tốc lớn nhất: " + maxSpeed);
  console.log("Nhịp tim trung bình: " + averageHR);
  console.log("time: " + time);
  console.log("Sprint distance: " + sprintDistance); // In ra giá trị sprint distance
  console.log(latLongArray);
  product[2].price = totalDistance / 1000;
  product[2].description = maxSpeed;
  product[2].brand = sprintDistance / 1000;
  product[2].time = (time / 300000).toFixed(3);

  console.log(product);
});

$.post("readdataa2.php", function (data) {
  var uniqueDistances = [];
  var totalDistance = 0;
  var maxDistance = 0;
  var shouldAdd = false;
  var maxSpeed = 0;
  var averageHR = 0;
  var totalHR = 0;
  var time = 0;
  var latLongArray = [];
  var heartRateValues = []; // Mảng lưu trữ 10 giá trị nhịp tim gần nhất
  var sprintDistance = 0; // Thêm biến sprintDistance và gán giá trị ban đầu là 0
  for (var i = data.length - 1; i >= 0; i--) {
    var currentDistance = parseInt(data[i].distance);
    var currentSpeed = parseFloat(data[i].velocity);
    var currentHR = parseInt(data[i].BPM);
    var currentTime = parseInt(data[i].time);
    var currentLat = parseFloat(data[i].lat);
    var currentLong = parseFloat(data[i].longg);
    if (shouldAdd && currentDistance === 0) {
      totalDistance += maxDistance;
      maxDistance = 0;
    }
    if (currentDistance > maxDistance) {
      maxDistance = currentDistance;
    }
    if (currentDistance === 0) {
      shouldAdd = true;
    } else {
      shouldAdd = false;
    }
    if (currentSpeed > maxSpeed) {
      maxSpeed = currentSpeed;
    }
    totalHR += currentHR;
    time += currentTime;
    var latLong = [currentLat, currentLong, 1];
    latLongArray.push(latLong);
    // Thêm giá trị nhịp tim vào mảng tạm thời
    heartRateValues.push(currentHR);
    if (heartRateValues.length > 10) {
      heartRateValues.shift(); // Loại bỏ giá trị nhịp tim cũ nhất nếu mảng vượt quá 10 phần tử
    }
    if (currentDistance !== 0 && currentSpeed > 15) {
      // Thêm điều kiện để tính toán sprint distance
      sprintDistance += currentDistance;
    }
  }
  var count = Object.keys(data).length;
  if (count > 10) {
    averageHR =
      heartRateValues.reduce((a, b) => a + b, 0) / heartRateValues.length;
  }
  console.log("Tổng distance: " + totalDistance);
  console.log("Vận tốc lớn nhất: " + maxSpeed);
  console.log("Nhịp tim trung bình: " + averageHR);
  console.log("time: " + time);
  console.log("Sprint distance: " + sprintDistance); // In ra giá trị sprint distance
  console.log(latLongArray);
  product[3].price = totalDistance / 1000;
  product[3].description = maxSpeed;
  product[3].brand = sprintDistance / 1000;
  product[3].time = (time / 300000).toFixed(3);

  console.log(product);
});
