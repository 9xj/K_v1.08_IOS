if ( typeof(console) === "undefined" ) {
  console = {};
  console.log = function() {};
}

var s_fileextension = 'html',
	s_appversion = '1.07',
	s_expectedsettingsversion = '1.01',
	s_db = undefined,
	s_url = '',
	s_apiurl = s_url + '/api/api.php',
	s_imgurl = s_url + '/api/img.php',
	s_saved_password_allowed = true,
	s_username = '',
	s_password = '';

var s_navigationitems = {
	'General - Student Notices':'notices',
	'General - Events Planner':'events',
	'Student Details - Details':'studentdetails',
	'Student Details - Timetable':'studenttimetable',
	'Student Details - Attendance':'studentattendance',
	'Student Details - Results':'studentresults',
	'Student Details - Groups':'studentgroups',
	'Student Details - Awards':'studentawards',
	'Student Details - Pastoral':'studentpastoral',
	'Teacher Details - Details':'teacherdetails',
	'Teacher Details - Timetable':'teachertimetable',
	'Teacher Details - Attendance':'attendancemarking'
};