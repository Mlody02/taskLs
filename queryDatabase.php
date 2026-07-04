<?php
require_once 'session.php';
$mysqli = mysqli_connect($databaseHost, $databaseUsername, $databasePassword, $databaseName); 

$queryOutput = '';

function safeQueryConcat(String $inputString)
{
	$output = '';
	if (!empty($inputString)) {
		if ('TRUE' == strtoupper($inputString) ||'FALSE' == strtoupper($inputString)) {
			$output = strtoupper($inputString);
		} else {
			// $output = '"' . implode('\\', explode('.', $inputString)) . '"';
			$output = '"' . addslashes($inputString) . '"';
		}
	}
	return ($output);
}

if (isset($_GET['query'])) {
	switch ($_GET['query']) {
		case 'taskList':
			$query = mysqli_query($mysqli, "SELECT * FROM toDos JOIN categories ON toDos.category_id = categories.categoryId");
			break;

		case 'categories':
			$query = mysqli_query($mysqli, "SELECT * FROM categories");
			break;

		case 'insertTask':
			$deadline = explode('T', $_GET['deadline'])[0] . ' ' . explode('T', $_GET['deadline'])[1] . ':00';
			$tempQuery = "INSERT INTO toDos (" . ((empty($_GET['id'])) ? '' : 'id, ') . "name, category_id, description, done, deadline) VALUES (" . ((empty($_GET['id'])) ? '' : "{$_GET['id']}, ");
			$name = safeQueryConcat($_GET['name']);
			$category = safeQueryConcat($_GET['category']);
			$description = safeQueryConcat($_GET['description']);
			$done = safeQueryConcat($_GET['done']);
			$deadline = safeQueryConcat($deadline);
			$tempQuery .= "$name, $category, $description, $done, $deadline) ON DUPLICATE KEY UPDATE name=$name, category_id=$category, description=$description, done=$done, deadline=$deadline";
			$query = mysqli_query($mysqli, $tempQuery);
			break;
		
		case 'taskDelete':
			$query = mysqli_query($mysqli, 'DELETE FROM toDos WHERE toDos.id = ' . $_GET['id']);
			break;

		case 'taskDone':
			$query = mysqli_query($mysqli, 'UPDATE toDos SET toDos.done = '.$_GET['done'].' WHERE toDos.id = '.$_GET['id']);
			break;

		default:
			$defaultFlag = true;
			break;
	}
};

if (!isset($defaultFlag)) {
	$queryOutput = '';
	while ($row = mysqli_fetch_row($query)) {
		if ($queryOutput != '') {
			$queryOutput .= '&rowEnd&';
		};
		foreach ($row as $column) {
			if (substr($queryOutput, -8) != '&rowEnd&' && $queryOutput != '') {
				$queryOutput .= '&colEnd&';
			};
			$queryOutput .= $column;
		};
	};
};
echo $queryOutput;