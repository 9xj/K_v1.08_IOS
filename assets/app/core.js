var g_loginkey = 'vtku',
	g_loginlevel = 0,
	g_apiupdaterequired = false,
	g_appupdaterequired = false,
	g_newerrors = [],
	g_loadingmutex = 0,
	g_selecteddate = new Date(),
	g_selectedyear = 2013,
	g_selectedperiod = 0,
	g_selectedcalendarday = undefined,
	g_loggedinteacher = undefined,
	g_loggedinstudent = undefined,
	g_mutexlocks = new Object(),
	g_apisettings = undefined,
	g_globals = undefined,
	g_calendar = undefined,
	g_selectedstudent = undefined,
	g_studenttimetable = undefined,
	g_studentattendance = undefined,
	g_studentattendancestats = undefined,
	g_studentresults = undefined,
	g_studentnceasummary = undefined,
	g_studentqualifications = undefined,
	g_studentgroups = undefined,
	g_studentawards = undefined,
	g_studentpastoral = undefined,
	g_selectedteacher = undefined,
	g_teachertimetable = undefined,
	g_teacherattendancechecklist = undefined,
	g_studentsearchtext = undefined,
	g_staffsearchtext = undefined,
	g_studentsearchresults = [],
	g_staffsearchtext = [],
	g_events = new Object(),
	g_meeting_notices = new Object(),
	g_general_notices = new Object(),
	g_newattendanceentries = new Object(),
	g_newattendancereasons = new Object();
	
function login() {	
	var validlogin = true,
		username = $('#username').val(),
		password = $('#password').val();
		
	if (username == "" || username == undefined)
	{
		g_newerrors.push('Username cannot be blank');
		validlogin = false;
	}
	if (password == "" || password == undefined)
	{
		g_newerrors.push('Password cannot be blank');
		validlogin = false;
	}
		
	if (validlogin)
	{
		attemptInterfaceLogin(username, password);
	}
}

function attemptInterfaceLogin(username, password) {
	try
	{
		g_loadingmutex++;
		setTimeout(function() {
			checkLoadingMutex();
		}, 250);
		$(document).one('loginsuccessful', function(event, success){
			g_loadingmutex--;
			checkLoadingMutex();
			if (success)
			{
				$.mobile.changePage(basepath + 'menu.' + s_fileextension + '', {
					transition: 'slide'
				});
			}
		});
		attemptLogin(username, password);
	}
	catch(err)
	{
		g_loadingmutex--;
		checkLoadingMutex();
		g_errors.push(err.message());
	}
}

document.addEventListener("deviceready", function() {
	// fix for Android back button
	document.addEventListener("backbutton", function(event) {
	    if($.mobile.activePage.attr("id") == 'home' || $.mobile.activePage.attr("id") == 'menu'){
	        event.preventDefault();
	        navigator.app.exitApp();
	    }
	    else {
	        navigator.app.backHistory()
	    }
	}, false);
	
	s_db = window.openDatabase('kamarapp', '1.0', 'KAMAR App', 1000000);
	s_db.transaction(populateDB, errorCB, loadSettings);
});

$(document).ready(function() {
	$(document).ajaxError(function(event, request, settings, exception) {
		alert('Error requesting data ' + settings.url + ' : ' + exception);
	});
	
	// display errors as they are added to the gloabl
	setInterval(printerrors, 500);
});