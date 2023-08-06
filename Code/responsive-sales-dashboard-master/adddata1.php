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
$sql = "insert into project_data(velocity,distance,heart_rate) values ($Kp,$Ki,$Kd)";
mysqli_query($conn, $sql);
mysqli_close($conn);
?>