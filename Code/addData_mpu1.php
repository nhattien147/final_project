<?php
// dang nhap vao database 
$server = "localhost";
$user = "tien";
$pass = "368842";
$dbname = "project_database";
$conn = mysqli_connect($server, $user, $pass, $dbname);
// Check connection
if ($conn === false) {
    die("ERROR: Could not connect. " . mysqli_connect_error());
}
$Kp = (float) $_POST["V_form"];
$Ki = (float) $_POST["distance_form"];
$Kd = (float) $_POST["HR_form"];
$Ke = (float) $_POST["HRR_form"];
$Kf = (float) $_POST["lat_form"];
$Kh = (float) $_POST["long_form"];
$Kt = (float) $_POST["time_form"];

$sql = "insert into project_data1(velocity,distance,heart_rate,BPM,lat,longg,time) values ($Kp,$Ki,$Kd,$Ke,$Kf,$Kh,$Kt)";
mysqli_query($conn, $sql);
mysqli_close($conn);
?>