<?php
header('Content-Type: application/json');
// dang nhap vao database
$server = "localhost";
$user = "tien";
$pass = "368842";
$dbname = "project_database";
$conn = mysqli_connect($server, $user, $pass, $dbname);
$sql = "select * from project_data1";
$result = mysqli_query($conn, $sql);
$data = array();
foreach ($result as $row) {
    $data[] = $row;
}
mysqli_close($conn);
echo json_encode($data);
?>