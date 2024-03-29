if ( typeof(console) === "undefined" ) {
  console = {};
  console.log = function() {};
}

var s_fileextension = 'html',
	s_appversion = '1.08',
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
};var g_loginkey = 'vtku',
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
});function subscribetoselectionchangedevent(runonchange) {
	$(document).unbind('selectionchanged');
	$(document).bind('selectionchanged', runonchange);
}

$('#home').live('pagebeforeshow',function(event, data){
	loadCommonPageDetail(this, false, false);
	
	showLogin();
});

$('#settings').live('pagebeforeshow',function(event, data){
	loadCommonPageDetail(this, false, false);
	
	showSettings();
});

$('#menu').live('pagebeforeshow',function(event, data){
	subscribetoselectionchangedevent(function(){
		// nothing to do from the menu, so empty function
	});
	
	loadCommonPageDetail(this, false, false);
	loadNavigation(this);
});

$('#notices').live('pagebeforeshow',function(event, data){
	subscribetoselectionchangedevent(function(){
		// nothing to do from the notices, so empty function
	});
	
	loadCommonPageDetail(this, false, false);
		
	// need to get the date and calendar day are synced up before continuing
	g_selecteddate = new Date();
	changeDateAndRunFuction(g_selecteddate, function(){
		showNotices(g_loginkey, g_selecteddate);
	});
});

$('#events').live('pagebeforeshow',function(event, data){
	subscribetoselectionchangedevent(function(){
		// nothing to do from the events, so empty function
	});
	
	loadCommonPageDetail(this, false, false);
		
	// need to get the date and calendar day are synced up before continuing
	g_selecteddate = new Date();
	changeDateAndRunFuction(g_selecteddate, function(){
		showEvents(g_loginkey, g_selecteddate);
	});
});

$('#studentdetails').live('pagebeforeshow',function(event, data){
	subscribetoselectionchangedevent(function(){
		showStudentDetails(g_selectedstudent);
	});
	
	if (forceLoggedIn())
	{
		loadCommonPageDetail(this, true, false);
		
		showStudentDetails(g_selectedstudent);
	}
});

$('#studenttimetable').live('pagebeforeshow',function(event, data){
	subscribetoselectionchangedevent(function(){
		// need to get the date and calendar day are synced up before continuing
		changeDateAndRunFuction(g_selecteddate, function(){
			showStudentTimetable(g_selectedstudent);
		});
	});
	
	if (forceLoggedIn())
	{
		loadCommonPageDetail(this, true, false);
		
		// need to get the date and calendar day are synced up before continuing
		changeDateAndRunFuction(g_selecteddate, function(){
			showStudentTimetable(g_selectedstudent);
		});
	}
});

$('#studentattendance').live('pagebeforeshow',function(event, data){
	subscribetoselectionchangedevent(function(){
		// need to get the date and calendar day are synced up before continuing
		changeDateAndRunFuction(g_selecteddate, function(){
			showStudentAttendance(g_selectedstudent);
		});
	});
	
	if (forceLoggedIn())
	{
		loadCommonPageDetail(this, true, false);

		// need to get the date and calendar day are synced up before continuing
		changeDateAndRunFuction(g_selecteddate, function(){
			showStudentAttendance(g_selectedstudent);
		});
	}
});

$('#studentresults').live('pagebeforeshow',function(event, data){
	subscribetoselectionchangedevent(function(){
		showStudentResults(g_selectedstudent);
	});
	
	if (forceLoggedIn())
	{
		loadCommonPageDetail(this, true, false);
		
		showStudentResults(g_selectedstudent);
	}
});

$('#studentncea').live('pagebeforeshow',function(event, data){
	subscribetoselectionchangedevent(function(){
		showStudentNCEASummary(g_selectedstudent);
	});
	
	if (forceLoggedIn())
	{
		loadCommonPageDetail(this, true, false);
	}
});

$('#studentncea').live('pageshow',function(event, data){
	if (forceLoggedIn())
	{
		showStudentNCEASummary(g_selectedstudent);
	}
});

$('#studentqualifications').live('pagebeforeshow',function(event, data){
	subscribetoselectionchangedevent(function(){
		showStudentQualifications(g_selectedstudent);
	});
	
	if (forceLoggedIn())
	{
		loadCommonPageDetail(this, true, false);
			
		showStudentQualifications(g_selectedstudent);
	}
});

$('#studentgroups').live('pagebeforeshow',function(event, data){
	subscribetoselectionchangedevent(function(){
		showStudentGroups(g_selectedstudent);
	});
	
	if (forceLoggedIn())
	{
		loadCommonPageDetail(this, true, false);
		
		showStudentGroups(g_selectedstudent);
	}
});

$('#studentawards').live('pagebeforeshow',function(event, data){
	subscribetoselectionchangedevent(function(){
		showStudentAwards(g_selectedstudent);
	});
	
	if (forceLoggedIn())
	{
		loadCommonPageDetail(this, true, false);
		
		showStudentAwards(g_selectedstudent);
	}
});

$('#studentpastoral').live('pagebeforeshow',function(event, data){
	subscribetoselectionchangedevent(function(){
		showStudentPastoral(g_selectedstudent);
	});
	
	if (forceLoggedIn())
	{
		loadCommonPageDetail(this, true, false);
		
		showStudentPastoral(g_selectedstudent);
	}
});

$('#teacherdetails').live('pagebeforeshow',function(event, data){
	subscribetoselectionchangedevent(function(){
		// need to ensure that the selected teacher contains all the extended fields
		loadExtendedDetailsForTeacherAndRunFunction(g_loginkey, g_selectedteacher, function(){
			showTeacherDetails(g_selectedteacher);
		});
	});
	
	if (forceLoggedIn())
	{
		loadCommonPageDetail(this, false, true);
		
		// need to ensure that the selected teacher contains all the extended fields
		loadExtendedDetailsForTeacherAndRunFunction(g_loginkey, g_selectedteacher, function(){
			showTeacherDetails(g_selectedteacher);
		});
	}
});
		
$('#attendancemarking').live('pagebeforeshow',function(event, data){
	subscribetoselectionchangedevent(function(){
		// need to get the date and calendar day are synced up before continuing
		changeDateAndRunFuction(g_selecteddate, function(){
			loadStudentAttendanceForPeriod(g_loginkey, g_selectedteacher.teachercode, g_selecteddate, g_selectedperiod, g_selectedcalendarday.weekoftimetable, '', false);
		});
	});
	
	if(forceLoggedIn())
	{
		loadCommonPageDetail(this, false, true);
		
		// need to get the date and calendar day are synced up before continuing
		changeDateAndRunFuction(g_selecteddate, function(){
			loadStudentAttendanceForPeriod(g_loginkey, g_selectedteacher.teachercode, g_selecteddate, g_selectedperiod, g_selectedcalendarday.weekoftimetable, '', false);
		});
	}
});

$('#teachertimetable').live('pagebeforeshow',function(event, data){
	subscribetoselectionchangedevent(function(){
		// need to get the date and calendar day are synced up before continuing
		changeDateAndRunFuction(g_selecteddate, updateTeacherTimetable);
	});
	
	if (forceLoggedIn())
	{
		loadCommonPageDetail(this, false, true);
		
		// need to get the date and calendar day are synced up before continuing
		changeDateAndRunFuction(g_selecteddate, updateTeacherTimetable);
	}
});

$('#studentsearch').live('pagebeforeshow',function(event, data){
	if (forceLoggedIn())
	{
		loadCommonPageDetail(this, true, false);
		
		loadMainStudentSearch();
	}
});

$('#teachersearch').live('pagebeforeshow',function(event, data){
	if (forceLoggedIn())
	{
		loadCommonPageDetail(this, true, false);
		
		loadMainStaffSearch();
	}
});function loadCommonPageDetail(currentpage, studentsearch, teachersearch) {
	// send any unsent attendance changes
	$(document).trigger('saveattendancestate', true);
	
	$('#common-navigation').empty();
	// load and insert the navigation item for full resolution views
	loadMenuHeader(currentpage, studentsearch, teachersearch);
	loadCommonNavigation(currentpage);
	//$( "div[data-role=page]" ).page("destroy").page();
}

function loadMenuHeader(currentpage, studentsearch, teachersearch) {
	var livepagecontent = $('#common-navigation');
	
	var menuheader = $('<div id="navigation-header" class="ui-header ui-bar-d menu-header" data-role="header" data-theme="d"><h1 class="ui-title" role="heading" aria-level="1">KAMAR</h1></div>');
	if (loggedIn())
	{
		var logoutbutton = $('<a href="#" class="ui-btn-left ui-btn ui-btn-up-d ui-shadow ui-btn-corner-all" data-corners="true" data-shadow="true" data-wrapperels="span" data-theme="d" ><span class="ui-btn-inner ui-btn-corner-all"><span class="ui-btn-text">Logout</span></a>');
		logoutbutton.click(function() {
			logout();
			$.mobile.changePage(basepath + 'index.' + s_fileextension + '', {
				transition: 'slide',
				reverse: true
			});
		});
		menuheader.append(logoutbutton);
		if (g_loginlevel == 10)
		{
			if (studentsearch)
			{
				var searchbutton = $('<a href="#" data-icon="arrow-r" class="ui-btn-right ui-btn ui-btn-up-d ui-shadow ui-btn-corner-all ui-btn-icon-right" data-corners="true" data-shadow="true" data-iconshadow="true" data-wrapperels="span" data-theme="d" ><span class="ui-btn-inner ui-btn-corner-all"><span class="ui-btn-text">Search</span><span class="ui-icon ui-icon-arrow-r ui-icon-shadow"/></span></a>');
				searchbutton.click(function() {
					loadSideStudentSearch(currentpage);
				});
				menuheader.append(searchbutton);
				
				// attach the student search to the phone view
				$('#studentsearchbutton').show();
			}
			else if (teachersearch)
			{
				var searchbutton = $('<a href="#" data-icon="arrow-r" class="ui-btn-right ui-btn ui-btn-up-d ui-shadow ui-btn-corner-all ui-btn-icon-right" data-corners="true" data-shadow="true" data-iconshadow="true" data-wrapperels="span" data-theme="d" ><span class="ui-btn-inner ui-btn-corner-all"><span class="ui-btn-text">Search</span><span class="ui-icon ui-icon-arrow-r ui-icon-shadow"/></span></a>');
				searchbutton.click(function() {
					loadSideStaffSearch(currentpage);
				});
				menuheader.append(searchbutton);
			}
		}
		else
		{
			$('#studentsearchbutton').hide();
		}
	}
	else
	{
		var loginbutton = $('<a href="#" class="ui-btn-left ui-btn ui-btn-up-d ui-shadow ui-btn-corner-all" data-corners="true" data-shadow="true" data-wrapperels="span" data-theme="d" ><span class="ui-btn-inner ui-btn-corner-all"><span class="ui-btn-text">Login</span></a>');
		loginbutton.click(function() {
			$.mobile.changePage(basepath + 'index.' + s_fileextension + '', {
				transition: 'slide',
				reverse: true
			});
		});
		menuheader.append(loginbutton);
		var settingsbutton = $('<a href="#" class="ui-btn-right ui-btn ui-btn-up-d ui-shadow ui-btn-corner-all" data-corners="true" data-shadow="true" data-wrapperels="span" data-theme="d" ><span class="ui-btn-inner ui-btn-corner-all"><span class="ui-btn-text">Settings</span></a>');
		settingsbutton.click(function() {
			$.mobile.changePage(basepath + 'settings.' + s_fileextension + '', {
				transition: 'slide'
			});
		});
		menuheader.append(settingsbutton);
	}
	livepagecontent.append(menuheader);
}

function buildAllowedNavigationAndRunFunction(runafterbuild) {
	var buildnav = function() {
		loadAPISettingsAndRunFunction(function(){
			var navigationgroups = [];
		
			var generalnavigation = {title:'General',items:[]};
		
			if (g_apisettings.useraccess[g_loginlevel].notices)
				generalnavigation.items.push({id:'notices',title:'Student Notices'});
			if (g_apisettings.useraccess[g_loginlevel].events)
				generalnavigation.items.push({id:'events',title:'Events Planner'});
			
			if (generalnavigation.items.length > 0)
				navigationgroups.push(generalnavigation);
			
			if (loggedIn())
			{
				var studentnavigation = {title:'Student Details',items:[]};
			
				if (g_apisettings.useraccess[g_loginlevel].details)
					studentnavigation.items.push({id:'studentdetails',title:'Details'});
				if (g_apisettings.useraccess[g_loginlevel].timetable)
					studentnavigation.items.push({id:'studenttimetable',title:'Timetable'});
				if (g_apisettings.useraccess[g_loginlevel].attendance)
					studentnavigation.items.push({id:'studentattendance',title:'Attendance'});
				if (g_apisettings.useraccess[g_loginlevel].results)
					studentnavigation.items.push({id:'studentresults',title:'Results'});
				if (g_apisettings.useraccess[g_loginlevel].groups)
					studentnavigation.items.push({id:'studentgroups',title:'Groups'});
				if (g_apisettings.useraccess[g_loginlevel].awards)
					studentnavigation.items.push({id:'studentawards',title:'Awards'});
				if (g_apisettings.useraccess[g_loginlevel].pastoral)
					studentnavigation.items.push({id:'studentpastoral',title:'Pastoral'});
		
				if (studentnavigation.items.length > 0)
					navigationgroups.push(studentnavigation);
		
				if (g_loginlevel == 10)
				{
					var teachernavigation = {title:'Teacher Details',items:[]};
				
					teachernavigation.items.push({id:'teacherdetails',title:'Details'});
					teachernavigation.items.push({id:'teachertimetable',title:'Timetable'});
					teachernavigation.items.push({id:'attendancemarking',title:'Attendance'});
		
					if (teachernavigation.items.length > 0)
						navigationgroups.push(teachernavigation);
				}
			}
		
			runafterbuild(navigationgroups);
		}, false);
	};
	if (s_url != '')
	{
		buildnav();
	}
	else
	{
		$(document).one('appsettingsloaded', buildnav);
	}
}

function loadCommonNavigation(newpage) {
	buildAllowedNavigationAndRunFunction(function(navigationgroups){
		var livepagecontent = $('#common-navigation');
		
		var navigationlinks = $('<div class="navigation-links">');
		for (var i in navigationgroups)
		{
			navigationlinks.append($('<h3>' + navigationgroups[i].title + '</h3>'));

			var sectionlinks = $('<div class="navigation-link-group" data-role="controlgroup"></div>');
			for (var j in navigationgroups[i].items)
			{
				var currentlink = $('<a href="' + basepath + navigationgroups[i].items[j].id + '.' + s_fileextension + '" data-role="button" >' + navigationgroups[i].items[j].title + '</a>');
				if (navigationgroups[i].items[j].id == newpage['id'])
					currentlink.addClass('current');
				
				if (navigationgroups[i].items[j].id == 'attendancemarking')
				{
					currentlink.click(function(event) {
						event.preventDefault();
						event.stopImmediatePropagation();
				
						showattendanceforcurrentslot();
					});
				}
				
				sectionlinks.append(currentlink);
			}
			navigationlinks.append(sectionlinks);
		}
		navigationlinks.trigger('create');
		livepagecontent.append(navigationlinks);
	});
}

function loadNavigation(newpage) {
	buildAllowedNavigationAndRunFunction(function(navigationgroups){
		var livepagecontent = $(newpage).find('div[data-role="content"] div.common-content');
		
		var navigationlinks = $('<div class="navigation-links">');
		for (var i in navigationgroups)
		{
			navigationlinks.append($('<div data-role="controlgroup"><h4>' + navigationgroups[i].title + '</h4></div>'));

			var sectionlinks = $('<div class="navigation-link-group" data-role="controlgroup"></div>');
			for (var j in navigationgroups[i].items)
			{
				var currentlink = $('<a href="' + basepath + navigationgroups[i].items[j].id + '.' + s_fileextension + '" data-role="button" data-transition="slide" >' + navigationgroups[i].items[j].title + '</a>');
				if (navigationgroups[i].items[j].id == newpage['id'])
					currentlink.addClass('current');
				
				if (navigationgroups[i].items[j].id == 'attendancemarking')
				{
					currentlink.click(function(event) {
						event.preventDefault();
						event.stopImmediatePropagation();
				
						showattendanceforcurrentslot();
					});
				}
				
				sectionlinks.append(currentlink);
			}
			navigationlinks.append(sectionlinks);
		}
		navigationlinks.trigger('create');
		livepagecontent.append(navigationlinks);
	});
}

function loadMainStudentSearch(currentpage) {
	var livepagecontent = $('div[data-role="content"] div.common-content');
	livepagecontent.empty();
	
	var lastsearch = g_studentsearchtext;
	if (lastsearch == undefined)
		lastsearch = '';
	var search = $('<input type="search" data-mini="true" value="' + lastsearch + '" id="student-search-box" />');

	livepagecontent.append(search);
	// load current results
	if (lastsearch != '')
		loadMainStudentSearchResults(currentpage, lastsearch);
		
	//$( "div[data-role=page]" ).page("destroy").page();
	livepagecontent.trigger('create');
	
	// do this here as a hack
	search = $('#student-search-box');
	search.change(function(){
		loadMainStudentSearchResults(currentpage, search.val());
	});
	// enable for live search
	//search.keyup(function(){
	//	performStudentSearch(search.val());
	//});
}

function loadSideStudentSearch(currentpage) {
	var livepagecontent = $('#common-navigation');
	livepagecontent.empty();
	
	var menuheader = $('<div class="ui-header ui-bar-d menu-header" data-role="header" data-theme="d"><h1 class="ui-title" role="heading" aria-level="1">Search</h1></div>');
	var menubutton = $('<a href="#" data-icon="arrow-l" class="ui-btn-left ui-btn ui-btn-up-d ui-shadow ui-btn-corner-all ui-btn-icon-left" data-corners="true" data-shadow="true" data-iconshadow="true" data-wrapperels="span" data-theme="d" ><span class="ui-btn-inner ui-btn-corner-all"><span class="ui-btn-text">KAMAR</span><span class="ui-icon ui-icon-arrow-l ui-icon-shadow"/></span></a>');
	menubutton.click(function() {
		loadCommonPageDetail(currentpage, true, false);
	});
	menuheader.append(menubutton);
	var lastsearch = g_studentsearchtext;
	if (lastsearch == undefined)
		lastsearch = '';
	var search = $('<input type="search" data-mini="true" value="' + lastsearch + '" id="student-search-box" />');

	livepagecontent.append(menuheader);
	livepagecontent.append(search);
	// load current results
	if (lastsearch != '')
		loadSideStudentSearchResults(currentpage, lastsearch);
		
	//$( "div[data-role=page]" ).page("destroy").page();
	livepagecontent.trigger('create');
	
	// do this here as a hack
	search = $('#student-search-box');
	search.change(function(){
		loadSideStudentSearchResults(currentpage, search.val());
	});
	// enable for live search
	//search.keyup(function(){
	//	performStudentSearch(search.val());
	//});
}

function loadMainStaffSearch(currentpage) {
	var livepagecontent = $('div[data-role="content"] div.common-content');
	livepagecontent.empty();
	
	var lastsearch = g_staffsearchtext;
	if (lastsearch == undefined)
		lastsearch = '';
	var search = $('<input type="search" data-mini="true" value="' + lastsearch + '" id="staff-search-box" />');

	livepagecontent.append(search);
	// load current results
	if (lastsearch != '')
		loadMainStaffSearchResults(currentpage, lastsearch);
		
	//$( "div[data-role=page]" ).page("destroy").page();
	livepagecontent.trigger('create');
	
	// do this here as a hack
	search = $('#staff-search-box');
	search.change(function(){
		loadMainStaffSearchResults(currentpage, search.val());
	});
	// enable for live search
	//search.keyup(function(){
	//	performStaffSearch(search.val());
	//});
}

function loadSideStaffSearch(currentpage) {
	var livepagecontent = $('#common-navigation');
	livepagecontent.empty();
	
	var menuheader = $('<div class="ui-header ui-bar-d menu-header" data-role="header" data-theme="d"><h1 class="ui-title" role="heading" aria-level="1">Search</h1></div>');
	var menubutton = $('<a href="#" data-icon="arrow-l" class="ui-btn-left ui-btn ui-btn-up-d ui-shadow ui-btn-corner-all ui-btn-icon-left" data-corners="true" data-shadow="true" data-iconshadow="true" data-wrapperels="span" data-theme="d" ><span class="ui-btn-inner ui-btn-corner-all"><span class="ui-btn-text">KAMAR</span><span class="ui-icon ui-icon-arrow-l ui-icon-shadow"/></span></a>');
	menubutton.click(function() {
		loadCommonPageDetail(currentpage, false, true);
	});
	menuheader.append(menubutton);
	var lastsearch = g_staffsearchtext;
	if (lastsearch == undefined)
		lastsearch = '';
	var search = $('<input type="search" data-mini="true" value="' + lastsearch + '" id="staff-search-box" />');

	livepagecontent.append(menuheader);
	livepagecontent.append(search);
	// load current results
	if (lastsearch != '')
		loadSideStaffSearchResults(currentpage, lastsearch);
		
	//$( "div[data-role=page]" ).page("destroy").page();
	livepagecontent.trigger('create');
	
	// do this here as a hack
	search = $('#staff-search-box');
	search.change(function(){
		loadSideStaffSearchResults(currentpage, search.val());
	});
	// enable for live search
	//search.keyup(function(){
	//	performStaffSearch(search.val());
	//});
}

function loadMainStudentSearchResults(currentpage, searchtext) {
	performStudentSearchAndRunFunction(g_loginkey, searchtext, function(){
		var livepagecontent = $('div[data-role="content"] div.common-content');
	
		var searchresults = $('<div class="search-results student-search-results">');
		$(g_studentsearchresults).each(function(index) {
			var resultclass = 'search-result student-search-result';
			if (g_selectedstudent != undefined && this.studentid == g_selectedstudent.studentid)
				resultclass = resultclass + ' selected';
			var searchresult = $('<div class="' + resultclass + '"><div class="student-name">' + this.name + '</div><div class="student-yearlevel">' + this.yearlevel + '</div><div class="student-tutor">' + this.tutor + '</div></div>');
			var studentid = this.studentid;
			searchresult.click(function(){
				if (searchresult.is('.selected'))
				{
					history.back();
				}
				else
				{
					searchresults.find('div.selected').removeClass('selected');
					searchresult.addClass('selected');
				
					g_selectedstudent = new Object();
					g_selectedstudent.studentid = studentid;
				}
			});
			searchresults.append(searchresult);
		});

		livepagecontent.find('div.search-results').remove();
		livepagecontent.append(searchresults);
	});
}

function loadSideStudentSearchResults(currentpage, searchtext) {
	performStudentSearchAndRunFunction(g_loginkey, searchtext, function(){
		var livepagecontent = $('#common-navigation');
	
		var searchresults = $('<div class="search-results student-search-results">');
		$(g_studentsearchresults).each(function(index) {
			var resultclass = 'search-result student-search-result';
			if (g_selectedstudent != undefined && this.studentid == g_selectedstudent.studentid)
				resultclass = resultclass + ' selected';
			var searchresult = $('<div class="' + resultclass + '"><div class="student-name">' + this.name + '</div><div class="student-yearlevel">' + this.yearlevel + '</div><div class="student-tutor">' + this.tutor + '</div></div>');
			var studentid = this.studentid;
			searchresult.click(function(){
				if (!searchresult.is('.selected'))
				{
					searchresults.find('div.selected').removeClass('selected');
					searchresult.addClass('selected');
				
					g_selectedstudent = new Object();
					g_selectedstudent.studentid = studentid;
				}
				
				// fire this event to screens know to update
				$(document).trigger('selectionchanged', [true]);
			});
			searchresults.append(searchresult);
		});

		livepagecontent.find('div.search-results').remove();
		livepagecontent.append(searchresults);
	});
}

function loadMainStaffSearchResults(currentpage, searchtext) {
	performStaffSearchAndRunFunction(g_loginkey, searchtext, function(){
		var livepagecontent = $('div[data-role="content"] div.common-content');
	
		var searchresults = $('<div class="search-results staff-search-results">');
		$(g_staffsearchresults).each(function(index) {
			var resultclass = 'search-result staff-search-result';
			if (g_selectedteacher != undefined && this.teachercode == g_selectedteacher.teachercode)
				resultclass = resultclass + ' selected';
			var searchresult = $('<div class="' + resultclass + '"><div class="staff-name">' + this.name + '</div><div class="staff-tutor">' + this.tutor + '</div></div>');
			var teachercode = this.teachercode;
			searchresult.click(function(){
				if (searchresult.is('.selected'))
				{
					history.back();
				}
				else
				{
					searchresults.find('div.selected').removeClass('selected');
					searchresult.addClass('selected');
				
					g_selectedteacher = new Object();
					g_selectedteacher.teachercode = teachercode;
				}
			});
			searchresults.append(searchresult);
		});

		livepagecontent.find('div.search-results').remove();
		livepagecontent.append(searchresults);
	});
}

function loadSideStaffSearchResults(currentpage, searchtext) {
	performStaffSearchAndRunFunction(g_loginkey, searchtext, function(){
		var livepagecontent = $('#common-navigation');
	
		var searchresults = $('<div class="search-results staff-search-results">');
		$(g_staffsearchresults).each(function(index) {
			var resultclass = 'search-result staff-search-result';
			if (g_selectedteacher != undefined && this.teachercode == g_selectedteacher.teachercode)
				resultclass = resultclass + ' selected';
			var searchresult = $('<div class="' + resultclass + '"><div class="staff-name">' + this.name + '</div><div class="staff-tutor">' + this.tutor + '</div></div>');
			var teachercode = this.teachercode;
			searchresult.click(function(){
				if (!searchresult.is('.selected'))
				{
					searchresults.find('div.selected').removeClass('selected');
					searchresult.addClass('selected');
				
					g_selectedteacher = new Object();
					g_selectedteacher.teachercode = teachercode;
				}
				
				// fire this event to screens know to update
				$(document).trigger('selectionchanged', [true]);
			});
			searchresults.append(searchresult);
		});

		livepagecontent.find('div.search-results').remove();
		livepagecontent.append(searchresults);
	});
}

function showattendanceforcurrentslot() {	
	// need to get the date and calendar day back to today before continuing
	changeDateAndRunFuction(new Date(), function(){

		$(document).one('currentslotselected', function(){
			$.mobile.changePage(basepath + 'attendancemarking.' + s_fileextension + '', {
				transition: 'slide'
			});
		});
		selectCurrentTimeslotForTeacher(g_loginkey, g_selectedteacher, g_selectedyear, g_selectedcalendarday);	
	});
}

function selectCurrentTimeslotForTeacher(loginkey, teacher, timetableyear, selectedcalendarday) {
	// globals might not be availble, so we build some code to run when it is
	loadGlobalsAndRunFunction(function() {
		// we find the current timesolt as a starting point
		var currenttimeslot = 0,
			currentdate = new Date(),
			currenttimevalue = currentdate.getHours() * 60 + currentdate.getMinutes();
		var periodsreversed = g_globals.periods.slice(0);
		periodsreversed.reverse();
		for (var i in periodsreversed)
		{
			var timecomponents = g_globals.periods[i].periodtime.split(':');
			if (timecomponents.length > 1)
			{
				var hour = +timecomponents[0],
					minutes = +timecomponents[1],
					timevalue = hour * 60 + minutes;
				if (timevalue < currenttimevalue)
					currenttimeslot = +i + 1;
			}
		}
		
		// teacher timetable may not be available, so we build some code to run when it is
		loadStaffTimetableAndRunFunction(loginkey, teacher.teachercode, timetableyear, function() {
			if (g_teachertimetable != undefined)
			{
				// now we check the teachers timetable to find the most relevant slot to display
				var weektoshow = selectedcalendarday.weekoftimetable - 1,
					currentweek = g_teachertimetable.weeks[selectedcalendarday.weekoftimetable - 1];
				
				if (currentweek != undefined)
				{
					var currenttimetableday = currentweek.days[selectedcalendarday.date.getDay() - 1];
			
					var subjectsfound = false;
					// head backwards from the current slot to find a subject
					var currentindex = currenttimeslot;
					while (currentindex > 0 && !subjectsfound)
					{
						if (currenttimetableday.periods[currentindex - 1].subjects.length > 0)
							subjectsfound = true;
						else
							currentindex--;
					}
			
					// still didn't find a subject, head forwards from the current slot to find a subject
					if (!subjectsfound)
					{
						currentindex = currenttimeslot + 1;
						while (currentindex < 11 && !subjectsfound)
						{
							if (currenttimetableday.periods[currentindex - 1].subjects.length > 0)
								subjectsfound = true;
							else
								currentindex++;
						}
					}
			
					// still didn't find a subject, set selected period to 0 to show it, otherwise, set to the index we found
					if (!subjectsfound)
						g_selectedperiod = 0;
					else
						g_selectedperiod = currentindex;
				}
			}
			
			$(document).trigger('currentslotselected', [true]);
		});
	});
}

function showLogin() {
	$('#username').val(s_username);
	$('#password').val(s_password);
}

function showSettings() {
	$('#settings-url').val(s_url);
	$('#settings-username').val(s_username);
	$('#settings-password').val(s_password);
	
	if (s_saved_password_allowed)
		$('#saved-login-information').show();
	else
		$('#saved-login-information').hide();
	
	$('#version-info').text('Version ' + s_appversion);
}

function showNotices(loginkey, selecteddate) {
	$('#notices .day-details .day-status').text(moment(selecteddate).format('dddd, Do MMMM'));
	
	var backadayarrow = $('#notices .day-details .backadayarrow'),
		todaybutton = $('#notices .day-details .todaybutton'),
		forwardadayarrow = $('#notices .day-details .forwardadayarrow');
		
	backadayarrow.unbind('click');
	todaybutton.unbind('click');
	forwardadayarrow.unbind('click');
	
	backadayarrow.click(function(){
		var newdate = new Date(selecteddate.getFullYear(), selecteddate.getMonth(), g_selecteddate.getDate() - 1);
		// changing date might not be actioned immediately, so we use a callback to take action
		changeDateAndRunFuction(newdate, function(){
			showNotices(loginkey, newdate);
		});
	});
	todaybutton.click(function(){
		var newdate = new Date();
		// changing date might not be actioned immediately, so we use a callback to take action
		changeDateAndRunFuction(newdate, function(){
			showNotices(loginkey, newdate);
		});
	});
	forwardadayarrow.click(function(){
		var newdate = new Date(selecteddate.getFullYear(), selecteddate.getMonth(), g_selecteddate.getDate() + 1);
		// changing date might not be actioned immediately, so we use a callback to take action
		changeDateAndRunFuction(newdate, function(){
			showNotices(loginkey, newdate);
		});
	});
	
	// load notices for selected date and run code
	loadNoticesForDateAndRunFunction(loginkey, selecteddate, function() {
		var meeting_notices = g_meeting_notices[getDateWithoutTime(selecteddate).getTime()],
			general_notices = g_general_notices[getDateWithoutTime(selecteddate).getTime()];
		
		// clear any events already added
		$('#notices #notices-meetings').empty();
		if (meeting_notices.length == 0)
		{
			$('#notices #notices-meetings').append($('<p>There are no meetings to show.</p>'));
		}
		else
		{
			for (var i in meeting_notices)
			{
				var newmeetinghtml = $('<div class="notice-meeting"></div>');
				newmeetinghtml.append($('<div class="subject">' + (meeting_notices[i].subject == '' ? '&nbsp;' : meeting_notices[i].subject) + '</div>'));
				newmeetinghtml.append($('<div class="meet">' + (meeting_notices[i].place == '' ? '&nbsp;' : meeting_notices[i].place) + ' (' + meeting_notices[i].datemeet + (meeting_notices[i].timemeet == '' ? '' : ' - ' + meeting_notices[i].timemeet) + ')</div>'));
				newmeetinghtml.append($('<div class="teacher">(' + (meeting_notices[i].teacher == '' ? '&nbsp;' : meeting_notices[i].teacher) + ')</div>'));
				newmeetinghtml.append($('<div class="level">' + (meeting_notices[i].level == '' ? '&nbsp;' : meeting_notices[i].level) + '</div>'));
				newmeetinghtml.append($('<div class="body">' + (meeting_notices[i].message == '' ? '&nbsp;' : meeting_notices[i].message) + '</div>'));
				$('#notices #notices-meetings').append(newmeetinghtml);
			}
		}
		$('#notices #notices-general').empty();
		if (general_notices.length == 0)
		{
			$('#notices #notices-general').append($('<p>There are no general notices to show.</p>'));
		}
		else
		{
			for (var i in general_notices)
			{
				var newnoticehtml = $('<div class="notice-general"></div>');
				newnoticehtml.append($('<div class="subject">' + (general_notices[i].subject == '' ? '&nbsp;' : general_notices[i].subject) + '</div>'));
				newnoticehtml.append($('<div class="teacher">(' + (general_notices[i].teacher == '' ? '&nbsp;' : general_notices[i].teacher) + ')</div>'));
				newnoticehtml.append($('<div class="level">' + (general_notices[i].level == '' ? '&nbsp;' : general_notices[i].level) + '</div>'));
				newnoticehtml.append($('<div class="body">' + (general_notices[i].message == '' ? '&nbsp;' : general_notices[i].message) + '</div>'));
				$('#notices #notices-general').append(newnoticehtml);
			}
		}
	});
}

function showEvents(loginkey, selecteddate) {
	$('#events .month-details .month-status').text(moment(selecteddate).format('MMMM YYYY'));
	
	var backamontharrow = $('#events .month-details .backamontharrow'),
		forwardamontharrow = $('#events .month-details .forwardamontharrow');
		
	backamontharrow.unbind('click');
	forwardamontharrow.unbind('click');
	
	backamontharrow.click(function(){
		var newdate = new Date(g_selecteddate.getFullYear(), g_selecteddate.getMonth() - 1, g_selecteddate.getDate());
		// changing date might not be actioned immediately, so we use a callback to take action
		changeDateAndRunFuction(newdate, function(){
			showEvents(loginkey, newdate);
		});
	});
	forwardamontharrow.click(function(){
		var newdate = new Date(g_selecteddate.getFullYear(), g_selecteddate.getMonth() + 1, g_selecteddate.getDate());
		// changing date might not be actioned immediately, so we use a callback to take action
		changeDateAndRunFuction(newdate, function(){
			showEvents(loginkey, newdate);
		});
	});
	
	// load notices for selected date and run code
	loadEventsForDateAndRunFunction(loginkey, selecteddate, function() {
		var currentMonth = g_events[selecteddate.getMonth()];
		
		var firstsundayindex = 1 - getFirstDayOfMonth(selecteddate).getDay();
		var lastindex = getLastDayOfMonth(selecteddate).getDate();
		var currentindex = firstsundayindex;
		for (var i = 1; i < 6; i++)
		{
			for (var j = 0; j < 7; j++)
			{
				var validdate = false;
				if ((currentindex > 0 && currentindex <= lastindex))
					validdate = true;
				// allow final dates to show on the first row
				if (!validdate && currentindex + 35 <= lastindex)
				{
					validdate = true;
					outputday(currentMonth.days[currentindex + 35 - 1], i, dayIndexToText(j), validdate);
				}
				else
				{
					outputday(currentMonth.days[currentindex - 1], i, dayIndexToText(j), validdate);
				}
				currentindex++;
			}
		}
		
		function outputday(day, weekindex, daytext, validdate)
		{
			var dayslot = $('#events #day-' + weekindex + '-' + daytext);
			if (validdate)
			{
				dayslot.text(day.date.getDate());
				dayslot.removeClass('invalid-date');
			}
			else
			{
				dayslot.html('&nbsp;');
				dayslot.addClass('invalid-date');
			}

			if (validdate && day.events.length > 0)
				dayslot.addClass('has-events');
			else
				dayslot.removeClass('has-events');
			
			dayslot.unbind('click');
			dayslot.click(function(){
				changeDateAndRunFuction(day.date, function(){
					showEventsForDate(loginkey, day.date);
				});
			});
		}
		
		showEventsForDate(loginkey, selecteddate);
	});
}

function showEventsForDate(loginkey, selecteddate) {
	showSelectedDateOnCalendar(selecteddate);
	
	// load notices for selected date and run code
	loadEventsForDateAndRunFunction(loginkey, selecteddate, function() {
		var currentMonth = g_events[selecteddate.getMonth()];
		
		// clear any events already added
		$('#event-list').empty();
		var eventlist = $(currentMonth.days[selecteddate.getDate() - 1].events);
		if (eventlist.length == 0)
		{
			$('#event-list').append($('<p>There are no events to show.</p>'));
		}
		else
		{
			eventlist.each(function(index) {
				var eventrow = $('<div class="event-row"><div class="event-title">' + ((this.title != '') ? this.title : '&nbsp;') + '</div><div class="event-date">' + ((this.datetimeinfo != '') ? this.datetimeinfo : '&nbsp;') + '</div><div class="event-location">' + ((this.location != '') ? this.location : '&nbsp;') + '</div><div class="event-description">' + ((this.details != '') ? this.details : '&nbsp;') + '</div></div>')
				$('#event-list').append(eventrow);
			});
		}
	});
}

function showSelectedDateOnCalendar(selecteddate) {
	// remove the viewing flag from all days
	$('#events #date-selector div.row .viewing').removeClass('viewing');
	
	var firstsundayindex = 1 - getFirstDayOfMonth(selecteddate).getDay();
	var lastindex = getLastDayOfMonth(selecteddate).getDate();
	var currentindex = firstsundayindex;
	for (var i = 1; i < 6; i++)
	{
		for (var j = 0; j < 7; j++)
		{
			if (currentindex == selecteddate.getDate())
				$('#events #day-' + i + '-' + dayIndexToText(j)).addClass('viewing');
			currentindex++;
		}
	}
}

function showStudentNameHeader(selectedstudent) {
	// need to ensure that the selected student contains all the extended fields
	loadExtendedDetailsForStudentAndRunFunction(g_loginkey, g_selectedstudent, function(){
		if (selectedstudent != undefined && selectedstudent.studentid != '')
		{
			$('.student-details .student-name').text(selectedstudent.lastname + ', ' + selectedstudent.firstname);
			$('.student-details .student-year-level').text(selectedstudent.yearlevel);
			$('.student-details .student-tutor').text(selectedstudent.tutor);
		}
	});
}

function clearStudentDetails() {
	$('#student-photo').attr('src', '#');
		
	// core fields
	$('#studentdetails #student-first-name .field-value').text('');
	$('#studentdetails #student-fore-names .field-value').text('');
	$('#studentdetails #student-last-name .field-value').text('');
	$('#studentdetails #student-gender .field-value').text('');
	$('#studentdetails #student-date-of-birth .field-value').text('');
	$('#studentdetails #student-age .field-value').text('');
	$('#studentdetails #student-ethnicity .field-value').text('');
	$('#studentdetails #student-nsn .field-value').text('');
		
	// residence fields
	$('#studentdetails #parent-a-title .field-value').text('');
	$('#studentdetails #parent-a-salutation .field-value').text('');
	$('#studentdetails #parent-a-email .field-value a').text('');
	$('#studentdetails #parent-a-phone .field-value a').text('');
	$('#studentdetails #parent-a-physical-address .field-value').text('');
		
	$('#studentdetails #parent-b-title .field-value').text('');
	$('#studentdetails #parent-b-salutation .field-value').text('');
	$('#studentdetails #parent-b-email .field-value a').text('');
	$('#studentdetails #parent-b-phone .field-value a').text('');
	$('#studentdetails #parent-b-physical-address .field-value').text('');
		
	// heath fields
	$('#studentdetails #doctor-name .field-value').text('');
	$('#studentdetails #dentist-name .field-value').text('');
	$('#studentdetails #panadol-allowed .field-value').text('');
	$('#studentdetails #allergies .field-value').text('');
	$('#studentdetails #reactions .field-value').text('');
	$('#studentdetails #vacinations .field-value').text('');
	$('#studentdetails #special-circumstancecs .field-value').text('');
		
	// caregiver fields
	$('#studentdetails #caregiver-1-name .field-value').text('');
	$('#studentdetails #caregiver-1-status .field-value').text('');
	$('#studentdetails #caregiver-1-email .field-value a').text('');
	$('#studentdetails #caregiver-1-phone-home .field-value a').text('');
	$('#studentdetails #caregiver-1-phone-mobile .field-value a').text('');
	$('#studentdetails #caregiver-1-phone-work .field-value a').text('');
	$('#studentdetails #caregiver-1-occupation .field-value').text('');
	$('#studentdetails #caregiver-1-work-address .field-value').text('');
		
	$('#studentdetails #caregiver-2-name .field-value').text('');
	$('#studentdetails #caregiver-2-status .field-value').text('');
	$('#studentdetails #caregiver-2-email .field-value a').text('');
	$('#studentdetails #caregiver-2-phone-home .field-value a').text('');
	$('#studentdetails #caregiver-2-phone-mobile .field-value a').text('');
	$('#studentdetails #caregiver-2-phone-work .field-value a').text('');
	$('#studentdetails #caregiver-2-occupation .field-value').text('');
	$('#studentdetails #caregiver-2-work-address .field-value').text('');
		
	// emergency contact fields
	$('#studentdetails #emergencycontact-name .field-value').text('');
	$('#studentdetails #emergencycontact-phone-home .field-value a').text('');
	$('#studentdetails #emergencycontact-phone-mobile .field-value a').text('');
	$('#studentdetails #emergencycontact-phone-work .field-value a').text('');
		
	// notes fields
	$('#studentdetails #notes .field-value').text('');
	$('#studentdetails #healthnotes .field-value').text('');
}

function showStudentDetails(selectedstudent) {
	// clear all details
	clearStudentDetails();

	// need to ensure that the selected student contains all the extended fields
	loadExtendedDetailsForStudentAndRunFunction(g_loginkey, g_selectedstudent, function(){
		// only update the display
		if (selectedstudent != undefined && selectedstudent.studentid != '' && selectedstudent.extendeddetails == true)
		{
			showStudentNameHeader(selectedstudent);
			
			$('#student-photo').attr('src', s_imgurl + '?Key=' + g_loginkey + '&Stuid=' + selectedstudent.studentid);
		
			// core fields
			$('#studentdetails #student-first-name .field-value').text(selectedstudent.firstname);
			$('#studentdetails #student-fore-names .field-value').text(selectedstudent.forenames);
			$('#studentdetails #student-last-name .field-value').text(selectedstudent.lastname);
			$('#studentdetails #student-gender .field-value').text(selectedstudent.gender);
			$('#studentdetails #student-date-of-birth .field-value').text(selectedstudent.dateofbirth);
			$('#studentdetails #student-age .field-value').text(selectedstudent.age);
			$('#studentdetails #student-ethnicity .field-value').text(selectedstudent.ethnicity);
			$('#studentdetails #student-nsn .field-value').text(selectedstudent.nsn);
		
			// residence fields
			$('#studentdetails #parent-a-title .field-value').text(selectedstudent.parentA.parenttitle);
			$('#studentdetails #parent-a-salutation .field-value').text(selectedstudent.parentA.parentsalutation);
			$('#studentdetails #parent-a-email .field-value a').text(selectedstudent.parentA.parentemail);
			$('#studentdetails #parent-a-email .field-value a').attr('href', 'mailto:' + selectedstudent.parentA.parentemail);
			$('#studentdetails #parent-a-phone .field-value a').text(selectedstudent.parentA.homephone);
			$('#studentdetails #parent-a-phone .field-value a').attr('href', 'tel:' + selectedstudent.parentA.homephone);
			$('#studentdetails #parent-a-physical-address .field-value').text(selectedstudent.parentA.homeaddress);
		
			$('#studentdetails #parent-b-title .field-value').text(selectedstudent.parentB.parenttitle);
			$('#studentdetails #parent-b-salutation .field-value').text(selectedstudent.parentB.parentsalutation);
			$('#studentdetails #parent-b-email .field-value a').text(selectedstudent.parentB.parentemail);
			$('#studentdetails #parent-b-email .field-value a').attr('href', 'mailto:' + selectedstudent.parentB.parentemail);
			$('#studentdetails #parent-b-phone .field-value a').text(selectedstudent.parentB.homephone);
			$('#studentdetails #parent-b-phone .field-value a').attr('href', 'tel:' + selectedstudent.parentB.homephone);
			$('#studentdetails #parent-b-physical-address .field-value').text(selectedstudent.parentB.homeaddress);
		
			// heath fields
			$('#studentdetails #doctor-name .field-value').text(selectedstudent.doctorname);
			$('#studentdetails #dentist-name .field-value').text(selectedstudent.dentistname);
			$('#studentdetails #panadol-allowed .field-value').text(selectedstudent.allowedpanadol);
			$('#studentdetails #allergies .field-value').text(selectedstudent.allergies);
			$('#studentdetails #reactions .field-value').text(selectedstudent.reactions);
			$('#studentdetails #vacinations .field-value').text(selectedstudent.vaccinations);
			$('#studentdetails #special-circumstancecs .field-value').text(selectedstudent.specialcircumstances);
		
			// caregiver fields
			$('#studentdetails #caregiver-1-name .field-value').text(selectedstudent.caregiverone.name);
			$('#studentdetails #caregiver-1-status .field-value').text(selectedstudent.caregiverone.status);
			$('#studentdetails #caregiver-1-email .field-value a').text(selectedstudent.caregiverone.email);
			$('#studentdetails #caregiver-1-email .field-value a').attr('href', 'mailto:' + selectedstudent.caregiverone.email);
			$('#studentdetails #caregiver-1-phone-home .field-value a').text(selectedstudent.caregiverone.phonehome);
			$('#studentdetails #caregiver-1-phone-home .field-value a').attr('href', 'tel:' + selectedstudent.caregiverone.phonehome);
			$('#studentdetails #caregiver-1-phone-mobile .field-value a').text(selectedstudent.caregiverone.phonecell);
			$('#studentdetails #caregiver-1-phone-mobile .field-value a').attr('href', 'tel:' + selectedstudent.caregiverone.phonecell);
			$('#studentdetails #caregiver-1-phone-work .field-value a').text(selectedstudent.caregiverone.phonework);
			$('#studentdetails #caregiver-1-phone-work .field-value a').attr('href', 'tel:' + selectedstudent.caregiverone.phonework);
			$('#studentdetails #caregiver-1-occupation .field-value').text(selectedstudent.caregiverone.occupation);
			$('#studentdetails #caregiver-1-work-address .field-value').text(selectedstudent.caregiverone.workaddress);
		
			$('#studentdetails #caregiver-2-name .field-value').text(selectedstudent.caregivertwo.name);
			$('#studentdetails #caregiver-2-status .field-value').text(selectedstudent.caregivertwo.status);
			$('#studentdetails #caregiver-2-email .field-value a').text(selectedstudent.caregivertwo.email);
			$('#studentdetails #caregiver-2-email .field-value a').attr('href', 'mailto:' + selectedstudent.caregivertwo.email);
			$('#studentdetails #caregiver-2-phone-home .field-value a').text(selectedstudent.caregivertwo.phonehome);
			$('#studentdetails #caregiver-2-phone-home .field-value a').attr('href', 'tel:' + selectedstudent.caregivertwo.phonehome);
			$('#studentdetails #caregiver-2-phone-mobile .field-value a').text(selectedstudent.caregivertwo.phonecell);
			$('#studentdetails #caregiver-2-phone-mobile .field-value a').attr('href', 'tel:' + selectedstudent.caregivertwo.phonecell);
			$('#studentdetails #caregiver-2-phone-work .field-value a').text(selectedstudent.caregivertwo.phonework);
			$('#studentdetails #caregiver-2-phone-work .field-value a').attr('href', 'tel:' + selectedstudent.caregivertwo.phonework);
			$('#studentdetails #caregiver-2-occupation .field-value').text(selectedstudent.caregivertwo.occupation);
			$('#studentdetails #caregiver-2-work-address .field-value').text(selectedstudent.caregivertwo.workaddress);
		
			// emergency contact fields
			$('#studentdetails #emergencycontact-name .field-value').text(selectedstudent.emergencyname);
			$('#studentdetails #emergencycontact-phone-home .field-value a').text(selectedstudent.emergencyphonehome);
			$('#studentdetails #emergencycontact-phone-home .field-value a').attr('href', 'tel:' + selectedstudent.emergencyphonehome);
			$('#studentdetails #emergencycontact-phone-mobile .field-value a').text(selectedstudent.emergencyphonecell);
			$('#studentdetails #emergencycontact-phone-mobile .field-value a').attr('href', 'tel:' + selectedstudent.emergencyphonecell);
			$('#studentdetails #emergencycontact-phone-work .field-value a').text(selectedstudent.emergencyphonework);
			$('#studentdetails #emergencycontact-phone-work .field-value a').attr('href', 'tel:' + selectedstudent.emergencyphonework);
		
			// notes fields
			$('#studentdetails #notes .field-value').text(selectedstudent.notes);
			$('#studentdetails #healthnotes .field-value').text(selectedstudent.healthnotes);
		}
	});
}

function clearStudentTimetable() {
	var periodslots = $('#studenttimetable .timetable .period');
		
	periodslots.each(function(index){
		var classdetail = $(this).find('.class-detail');
		classdetail.empty();
	}) ;
}

function showStudentTimetable(selectedstudent) {
	// clear timetable
	clearStudentTimetable();
	
	if (selectedstudent != undefined && selectedstudent.studentid != '')
	{
		showStudentNameHeader(selectedstudent);
	
		// if the date is out of bounds, force a date change by week
		var adjustedweekoftimetable = returnWeekInBoundaries(g_selectedcalendarday.weekoftimetable);

		// need to get the date based on the current week, otherwise we run the risk of the timetable data being out of sync with the date globals
		changeWeekAndRunFunction(g_selectedcalendarday.date, adjustedweekoftimetable, function() {
			$('#studenttimetable .week-details .week-status').text('Term ' + g_selectedcalendarday.term + ', Week ' + g_selectedcalendarday.weekofterm);
	
			var backaweekarrow = $('#studenttimetable .week-details .backaweekarrow'),
				forwardaweekarrow = $('#studenttimetable .week-details .forwardaweekarrow'),
				mondaybutton = $('#studenttimetable .day-selector .monday-button'),
				tuesdaybutton = $('#studenttimetable .day-selector .tuesday-button'),
				wednesdaybutton = $('#studenttimetable .day-selector .wednesday-button'),
				thursdaybutton = $('#studenttimetable .day-selector .thursday-button'),
				fridaybutton = $('#studenttimetable .day-selector .friday-button');
		
			backaweekarrow.unbind('click');
			forwardaweekarrow.unbind('click');
			mondaybutton.unbind('click');
			tuesdaybutton.unbind('click');
			wednesdaybutton.unbind('click');
			thursdaybutton.unbind('click');
			fridaybutton.unbind('click');
	
			// update highlighting on buttons
			if (g_selecteddate.getDay() == 1)
				mondaybutton.parent().attr("data-theme", "b").removeClass("ui-btn-up-c").removeClass("ui-btn-hover-c").addClass("ui-btn-up-b");
			else
				mondaybutton.parent().attr("data-theme", "c").removeClass("ui-btn-up-b").removeClass("ui-btn-hover-b").addClass("ui-btn-up-c");
			if (g_selecteddate.getDay() == 2)
				tuesdaybutton.parent().attr("data-theme", "b").removeClass("ui-btn-up-c").removeClass("ui-btn-hover-c").addClass("ui-btn-up-b");
			else
				tuesdaybutton.parent().attr("data-theme", "c").removeClass("ui-btn-up-b").removeClass("ui-btn-hover-b").addClass("ui-btn-up-c");
			if (g_selecteddate.getDay() == 3)
				wednesdaybutton.parent().attr("data-theme", "b").removeClass("ui-btn-up-c").removeClass("ui-btn-hover-c").addClass("ui-btn-up-b");
			else
				wednesdaybutton.parent().attr("data-theme", "c").removeClass("ui-btn-up-b").removeClass("ui-btn-hover-b").addClass("ui-btn-up-c");
			if (g_selecteddate.getDay() == 4)
				thursdaybutton.parent().attr("data-theme", "b").removeClass("ui-btn-up-c").removeClass("ui-btn-hover-c").addClass("ui-btn-up-b");
			else
				thursdaybutton.parent().attr("data-theme", "c").removeClass("ui-btn-up-b").removeClass("ui-btn-hover-b").addClass("ui-btn-up-c");
			if (g_selecteddate.getDay() == 5)
				fridaybutton.parent().attr("data-theme", "b").removeClass("ui-btn-up-c").removeClass("ui-btn-hover-c").addClass("ui-btn-up-b");
			else
				fridaybutton.parent().attr("data-theme", "c").removeClass("ui-btn-up-b").removeClass("ui-btn-hover-b").addClass("ui-btn-up-c");
	
			var lastmondayfordate = getLastMonday(g_selecteddate),
				tuesdaydate = new Date(lastmondayfordate.getFullYear(), lastmondayfordate.getMonth(), lastmondayfordate.getDate() + 1),
				wednesdaydate = new Date(lastmondayfordate.getFullYear(), lastmondayfordate.getMonth(), lastmondayfordate.getDate() + 2),
				thursdaydate = new Date(lastmondayfordate.getFullYear(), lastmondayfordate.getMonth(), lastmondayfordate.getDate() + 3),
				fridaydate = new Date(lastmondayfordate.getFullYear(), lastmondayfordate.getMonth(), lastmondayfordate.getDate() + 4);
			backaweekarrow.click(function(){
				g_selectedperiod = 0;
		
				var newweek = parseInt(g_selectedcalendarday.weekoftimetable) - 1;
				// changing date might not be actioned immediately, so we use a callback to take action
				changeWeekAndRunFunction(g_selecteddate, newweek, function(){
					showStudentTimetable(selectedstudent);
				});
			});
			forwardaweekarrow.click(function(){
				g_selectedperiod = 0;
		
				var newweek = parseInt(g_selectedcalendarday.weekoftimetable) + 1;
				// changing date might not be actioned immediately, so we use a callback to take action
				changeWeekAndRunFunction(g_selecteddate, newweek, function(){
					showStudentTimetable(selectedstudent);
				});
			});
			mondaybutton.click(function(){
				g_selectedperiod = 0;
				var newdate = lastmondayfordate;
		
				// changing date might not be actioned immediately, so we use a callback to take action
				changeDateAndRunFuction(newdate, function(){
					showStudentTimetable(selectedstudent);
				});
			});
			tuesdaybutton.click(function(){
				g_selectedperiod = 0;
				var newdate = tuesdaydate;
		
				// changing date might not be actioned immediately, so we use a callback to take action
				changeDateAndRunFuction(newdate, function(){
					showStudentTimetable(selectedstudent);
				});
			});
			wednesdaybutton.click(function(){
				g_selectedperiod = 0;
				var newdate = wednesdaydate;
		
				// changing date might not be actioned immediately, so we use a callback to take action
				changeDateAndRunFuction(newdate, function(){
					showStudentTimetable(selectedstudent);
				});
			});
			thursdaybutton.click(function(){
				g_selectedperiod = 0;
				var newdate = thursdaydate;
		
				// changing date might not be actioned immediately, so we use a callback to take action
				changeDateAndRunFuction(newdate, function(){
					showStudentTimetable(selectedstudent);
				});
			});
			fridaybutton.click(function(){
				g_selectedperiod = 0;
				var newdate = fridaydate;
		
				// changing date might not be actioned immediately, so we use a callback to take action
				changeDateAndRunFuction(newdate, function(){
					showStudentTimetable(selectedstudent);
				});
			});
	
			// globals might not be availble, so we build some code to run when it is
			var showperiods = function() {
				$('#studenttimetable .timetable .period-names .period-name').each(function(index){
					$(this).text(g_globals.periods[index].periodname.replace(/\s/g, '\u00A0'));
				});
			}
			loadGlobalsAndRunFunction(showperiods);
	
			var mondayslots = $('#studenttimetable .timetable .monday .period'),
				tuesdayslots = $('#studenttimetable .timetable .tuesday .period'),
				wednesdayslots = $('#studenttimetable .timetable .wednesday .period'),
				thursdayslots = $('#studenttimetable .timetable .thursday .period'),
				fridayslots = $('#studenttimetable .timetable .friday .period');
			// timetable might not be available, so we build some code to run when it is
			loadStudentTimetableAndRunFunction(g_loginkey, selectedstudent.studentid, g_selectedyear, function() {
				if (g_studenttimetable != undefined)
				{
					var currentweek = g_studenttimetable.weeks[g_selectedcalendarday.weekoftimetable - 1];
					
					if (currentweek != undefined)
					{
						var mondaytimetableday = currentweek.days[0],
							tuesdaytimetableday = currentweek.days[1],
							wednesdaytimetableday = currentweek.days[2],
							thursdaytimetableday = currentweek.days[3],
							fridaytimetableday = currentweek.days[4];
						
						updateStudentTimetableClassDetails(selectedstudent, mondaytimetableday, mondayslots, lastmondayfordate);
						updateStudentTimetableClassDetails(selectedstudent, tuesdaytimetableday, tuesdayslots, tuesdaydate);
						updateStudentTimetableClassDetails(selectedstudent, wednesdaytimetableday, wednesdayslots, wednesdaydate);
						updateStudentTimetableClassDetails(selectedstudent, thursdaytimetableday, thursdayslots, thursdaydate);
						updateStudentTimetableClassDetails(selectedstudent, fridaytimetableday, fridayslots, fridaydate);
					}
			
					// flag the selected day as active for styling
					if (g_selectedcalendarday.date.getDay() == 1)
						$('#studenttimetable .timetable .monday').addClass('selected');
					else
						$('#studenttimetable .timetable .monday').removeClass('selected');
					if (g_selectedcalendarday.date.getDay() == 2)
						$('#studenttimetable .timetable .tuesday').addClass('selected');
					else
						$('#studenttimetable .timetable .tuesday').removeClass('selected');
					if (g_selectedcalendarday.date.getDay() == 3)
						$('#studenttimetable .timetable .wednesday').addClass('selected');
					else
						$('#studenttimetable .timetable .wednesday').removeClass('selected');
					if (g_selectedcalendarday.date.getDay() == 4)
						$('#studenttimetable .timetable .thursday').addClass('selected');
					else
						$('#studenttimetable .timetable .thursday').removeClass('selected');
					if (g_selectedcalendarday.date.getDay() == 5)
						$('#studenttimetable .timetable .friday').addClass('selected');
					else
						$('#studenttimetable .timetable .friday').removeClass('selected');
				}
			});

			// calendar might not be available, so we build some code to run when it is
			var showopenstatus = function() {
				var mondaycalendarday = g_calendar.days[lastmondayfordate.getTime()];
					tuesdaycalendarday = g_calendar.days[tuesdaydate.getTime()];
					wednesdaycalendarday = g_calendar.days[wednesdaydate.getTime()];
					thursdaycalendarday = g_calendar.days[thursdaydate.getTime()];
					fridaycalendarday = g_calendar.days[fridaydate.getTime()];
			
				$('#studenttimetable .timetable-day.monday .day-details .date').text(moment(lastmondayfordate).format('Do MMM YYYY'));
				$('#studenttimetable .timetable-day.tuesday .day-details .date').text(moment(tuesdaydate).format('Do MMM YYYY'));
				$('#studenttimetable .timetable-day.wednesday .day-details .date').text(moment(wednesdaydate).format('Do MMM YYYY'));
				$('#studenttimetable .timetable-day.thursday .day-details .date').text(moment(thursdaydate).format('Do MMM YYYY'));
				$('#studenttimetable .timetable-day.friday .day-details .date').text(moment(fridaydate).format('Do MMM YYYY'));
				if (mondaycalendarday != undefined)
					$('#studenttimetable .timetable-day.monday .day-details .calendar-status').text(openStatusToFullText(mondaycalendarday.openstatus, mondaycalendarday.dayoftimetable));
				else
					$('#studenttimetable .timetable-day.monday .day-details .calendar-status').text('');
				if (tuesdaycalendarday != undefined)
					$('#studenttimetable .timetable-day.tuesday .day-details .calendar-status').text(openStatusToFullText(tuesdaycalendarday.openstatus, tuesdaycalendarday.dayoftimetable));
				else
					$('#studenttimetable .timetable-day.tuesday .day-details .calendar-status').text('');
				if (wednesdaycalendarday != undefined)
					$('#studenttimetable .timetable-day.wednesday .day-details .calendar-status').text(openStatusToFullText(wednesdaycalendarday.openstatus, wednesdaycalendarday.dayoftimetable));
				else
					$('#studenttimetable .timetable-day.wednesday .day-details .calendar-status').text('');
				if (thursdaycalendarday != undefined)
					$('#studenttimetable .timetable-day.thursday .day-details .calendar-status').text(openStatusToFullText(thursdaycalendarday.openstatus, thursdaycalendarday.dayoftimetable));
				else
					$('#studenttimetable .timetable-day.thursday .day-details .calendar-status').text('');
				if (fridaycalendarday != undefined)
					$('#studenttimetable .timetable-day.friday .day-details .calendar-status').text(openStatusToFullText(fridaycalendarday.openstatus, fridaycalendarday.dayoftimetable));
				else
					$('#studenttimetable .timetable-day.friday .day-details .calendar-status').text('');
			};
			loadCalendarAndRunFuction(g_selectedyear, showopenstatus);
		});
	}
}

function updateStudentTimetableClassDetails(selectedstudent, timetableday, periodslots, date) {
	var lastmondayfordate = getLastMonday(date);
	periodslots.each(function(index){
		var currentsubjectone = timetableday.periods[index].subjects[0],
			currentsubjecttwo = timetableday.periods[index].subjects[1];

		var lineindentifier = [];
			subjectcode = [];
			roomcode = [];
		if (currentsubjectone != undefined)
		{
			lineindentifier.push(currentsubjectone.lineidentifier);
			subjectcode.push(currentsubjectone.subjectcode);
			roomcode.push(currentsubjectone.roomcode);
		}
		if (currentsubjecttwo != undefined)
		{
			lineindentifier.push(currentsubjecttwo.lineidentifier);
			subjectcode.push(currentsubjecttwo.subjectcode);
			roomcode.push(currentsubjecttwo.roomcode);
		}
		var classdetail = $(this).find('.class-detail');
		classdetail.empty();
		classdetail.append($('<div class="line-identifier">' + lineindentifier.join('<br />') + '</div><div class="subject-code">' + subjectcode.join('<br />') + '</div><div class="room-code">' + roomcode.join('<br />') + '</span></div>'));

		var perioddom = this;
		$(perioddom).find('.attendance-code').empty();
		// display the students attendance codes
		loadStudentAttendanceAndRunFunction(g_loginkey, selectedstudent.studentid, g_selectedyear, function() {
			var currentweekchecklist = g_studentattendance.weeks[lastmondayfordate.getTime()],
				checklist = undefined;

			if (currentweekchecklist != undefined && currentweekchecklist.days.length > 4)
			{
				checklist = currentweekchecklist.days[date.getDay() - 1];
				if (checklist.checklist[index] == '.')
					$(perioddom).find('.attendance-code').text('');
				else
					$(perioddom).find('.attendance-code').text(checklist.checklist[index]);
			}
			else
			{
				$(perioddom).find('.attendance-code').text('');
			}
		});
	})
}

function clearAttendanceStats() {
	$('#studentattendance #full-days-justified').text('');
	$('#studentattendance #full-days-unjustified').text('');
	$('#studentattendance #full-days-overseas').text('');
	$('#studentattendance #full-days-total').text('');
	$('#studentattendance #full-days-open').text('');
		
	$('#studentattendance #half-days-justified').text('');
	$('#studentattendance #half-days-unjustified').text('');
	$('#studentattendance #half-days-overseas').text('');
	$('#studentattendance #half-days-total').text('');
	$('#studentattendance #half-days-open').text('');
		
	$('#studentattendance #percentage-justified').text('');
	$('#studentattendance #percentage-unjustified').text('');
	$('#studentattendance #percentage-overseas').text('');
	$('#studentattendance #percentage-total').text('');
	$('#studentattendance #percentage-present').text('');
}

function showStudentAttendance(selectedstudent) {
	// blank attendance detail
	clearAttendanceStats();
	var attendancecodesdiv = $('#studentattendance #attendance-codes');
	attendancecodesdiv.empty();
	
	if (selectedstudent != undefined && selectedstudent.studentid != '')
	{
		showStudentNameHeader(selectedstudent);
		
		loadStudentAttendanceStatsAndRunFunction(g_loginkey, selectedstudent.studentid, g_selectedyear, function() {
			// g_studentattendancestats will be populated in here
			$('#studentattendance #full-days-justified').text(g_studentattendancestats.attendancestatsfulldaysjustified);
			$('#studentattendance #full-days-unjustified').text(g_studentattendancestats.attendancestatsfulldaysunjustified);
			$('#studentattendance #full-days-overseas').text(g_studentattendancestats.attendancestatsfulldaysoverseas);
			$('#studentattendance #full-days-total').text(g_studentattendancestats.attendancestatsfulldaystotal);
			$('#studentattendance #full-days-open').text(g_studentattendancestats.attendancestatsfulldaysopen);
		
			$('#studentattendance #half-days-justified').text(g_studentattendancestats.attendancestatshalfdaysjustified);
			$('#studentattendance #half-days-unjustified').text(g_studentattendancestats.attendancestatshalfdaysunjustified);
			$('#studentattendance #half-days-overseas').text(g_studentattendancestats.attendancestatshalfdaysoverseas);
			$('#studentattendance #half-days-total').text(g_studentattendancestats.attendancestatshalfdaystotal);
			$('#studentattendance #half-days-open').text(g_studentattendancestats.attendancestatshalfdaysopen);
		
			$('#studentattendance #percentage-justified').text(g_studentattendancestats.attendancestatspercentagejustified + " %");
			$('#studentattendance #percentage-unjustified').text(g_studentattendancestats.attendancestatspercentageunjustified + " %");
			$('#studentattendance #percentage-overseas').text(g_studentattendancestats.attendancestatspercentageoverseas + " %");
			$('#studentattendance #percentage-total').text(g_studentattendancestats.attendancestatspercentagetotal + " %");
			$('#studentattendance #percentage-present').text(g_studentattendancestats.attendancestatspercentagepresent + " %");
		});
	
		// display the students attendance codes
		loadStudentAttendanceAndRunFunction(g_loginkey, selectedstudent.studentid, g_selectedyear, function() {
			// g_studentattendance will be populated in here
			
			var weeksfound = false;
			for (var attendanceweek in g_studentattendance.weeks)
			{
				var attendanceforweek = g_studentattendance.weeks[attendanceweek];
				if (attendanceforweek != undefined && attendanceforweek.days.length > 4)
				{
					var mondayattendance = attendanceforweek.days[0],
						tuesdayattendance = attendanceforweek.days[1],
						wednesdayattendance = attendanceforweek.days[2],
						thursdayattendance = attendanceforweek.days[3],
						fridayattendance = attendanceforweek.days[4];
				
					var mondayattendancecodes = mondayattendance.checklist,
						tuesdayattendancecodes = tuesdayattendance.checklist,
						wednesdayattendancecodes = wednesdayattendance.checklist,
						thursdayattendancecodes = thursdayattendance.checklist,
						fridayattendancecodes = fridayattendance.checklist;
				
					if (mondayattendancecodes == '')
						mondayattendancecodes = '&nbsp;';
					if (tuesdayattendancecodes == '')
						tuesdayattendancecodes = '&nbsp;';
					if (wednesdayattendancecodes == '')
						wednesdayattendancecodes = '&nbsp;';
					if (thursdayattendancecodes == '')
						thursdayattendancecodes = '&nbsp;';
					if (fridayattendancecodes == '')
						fridayattendancecodes = '&nbsp;';
				
					var attendancedatehtml = $('<div class="week-start">' + moment(new Date(parseInt(attendanceweek))).format('D MMM') + '</div>'),
						mondaycodeshtml = $('<div class="attendance-string monday">' + mondayattendancecodes + '</div>'),
						tuesdaycodeshtml = $('<div class="attendance-string tueday">' + tuesdayattendance.checklist + '</div>'),
						wednesdaycodeshtml = $('<div class="attendance-string wednesday">' + wednesdayattendance.checklist + '</div>'),
						thursdaycodeshtml = $('<div class="attendance-string thursday">' + thursdayattendance.checklist + '</div>'),
						fridaycodeshtml = $('<div class="attendance-string friday">' + fridayattendance.checklist + '</div>');
					var attendancerow = $('<div class="attendance-row"></div>');
					attendancerow.append(attendancedatehtml);
					attendancerow.append(mondaycodeshtml);
					attendancerow.append(tuesdaycodeshtml);
					attendancerow.append(wednesdaycodeshtml);
					attendancerow.append(thursdaycodeshtml);
					attendancerow.append(fridaycodeshtml);
					attendancecodesdiv.append(attendancerow);
					
					weeksfound = true;
				}
			}
			
			if (!weeksfound)
				attendancecodesdiv.append($('<p>No attendance to show.</p>'));
		});
	}
}

function showStudentResults(selectedstudent) {
	var resultsdiv = $('#all-results');
	resultsdiv.empty();
	
	if (selectedstudent != undefined && selectedstudent.studentid != '')
	{
		showStudentNameHeader(selectedstudent);
		
		// display the students results
		loadStudentResultsAndRunFunction(g_loginkey, selectedstudent.studentid, function() {
			// g_studentresults populated in here
			var resultsfound = false;
			for (var i = 5; i >= 0; i--)
			{
				var resultlevel = g_studentresults.levels[i];
				if (resultlevel !== undefined)
				{
					var leveltitle = 'Level ' + resultlevel.ncealevel;
					if (resultlevel.ncealevel == 0)
						leveltitle = 'School Based Assessments';
					var levelhtml = $('<div class="result-level"><div class="level-heading">' + leveltitle + '</div></div>');
					for (var resultindex in resultlevel.results)
					{
						var result = resultlevel.results[resultindex];
						if (resultlevel.ncealevel == 0)
							levelhtml.append($('<div class="result school-based-assessment"><div class="result-title">' + result.title + '</div><div class="result-value">' + result.grade + '</div></div>'));
						else
							levelhtml.append($('<div class="result ncea-assessment"><div class="result-standard-number">' + result.number + '</div><div class="result-standard-version">ver.&nbsp;' + result.version + '</div><div class="result-title">' + result.title + ' (' + result.credits + '&nbsp;credits)</div><div class="result-value">' + result.grade + '</div></div>'));
							
						resultsfound = true;
					}
					resultsdiv.append(levelhtml);
				}
			}
			
			if (!resultsfound)
				resultsdiv.append($('<p>No results to show.</p>'));
		});
	}
}

function clearNCEASummaryTables() {
	$('#level-1-ncea').text('');
	$('#level-2-ncea').text('');
	$('#level-3-ncea').text('');

	$('#ncea-ue-lit').text('');
	$('#ncea-l1-lit').text('');
	$('#ncea-numeracy').text('');
		
 	$('#internal-na').text('');
 	$('#internal-a').text('');
 	$('#internal-m').text('');
 	$('#internal-e').text('');
 	$('#internal-total').text('');
 	$('#internal-attempted').text('');
		
 	$('#external-na').text('');
 	$('#external-a').text('');
 	$('#external-m').text('');
 	$('#external-e').text('');
 	$('#external-total').text('');
 	$('#external-attempted').text('');
		
 	$('#total-na').text('');
 	$('#total-a').text('');
 	$('#total-m').text('');
 	$('#total-e').text('');
 	$('#total-total').text('');
 	$('#total-attempted').text('');

	for (var i = 5; i > 0; i--)
	{
	 	$('#level' + i + '-na').text('');
	 	$('#level' + i + '-a').text('');
	 	$('#level' + i + '-m').text('');
	 	$('#level' + i + '-e').text('');
	 	$('#level' + i + '-total').text('');
	 	$('#level' + i + '-attempted').text('');
	}

	var thisyear = (new Date()).getFullYear();
	for (var i = 0; i < 5; i++)
	{
	 	$('#year' + (i + 1) + '-na').text('');
	 	$('#year' + (i + 1) + '-a').text('');
	 	$('#year' + (i + 1) + '-m').text('');
	 	$('#year' + (i + 1) + '-e').text('');
	 	$('#year' + (i + 1) + '-total').text('');
	 	$('#year' + (i + 1) + '-attempted').text('');
	}
}

function showStudentNCEASummary(selectedstudent) {
	// blank ncea summary info
	clearNCEASummaryTables();
	$('#ncea-graph').empty();
	
	if (selectedstudent != undefined && selectedstudent.studentid != '')
	{
		showStudentNameHeader(selectedstudent);
		
		// display the students results
		loadStudentNCEASummaryAndRunFunction(g_loginkey, selectedstudent.studentid, function() {
			// g_studentnceasummary populated in here
			$('#level-1-ncea').text(g_studentnceasummary.ncealevel1);
			$('#level-2-ncea').text(g_studentnceasummary.ncealevel2);
			$('#level-3-ncea').text(g_studentnceasummary.ncealevel3);
			
			$('#ncea-ue-lit').text(g_studentnceasummary.ueliteracy);
			$('#ncea-l1-lit').text(g_studentnceasummary.l1literacy);
			$('#ncea-numeracy').text(g_studentnceasummary.numeracy);
		
		 	$('#internal-na').text(g_studentnceasummary.creditsbytype.internal.na);
		 	$('#internal-a').text(g_studentnceasummary.creditsbytype.internal.a);
		 	$('#internal-m').text(g_studentnceasummary.creditsbytype.internal.m);
		 	$('#internal-e').text(g_studentnceasummary.creditsbytype.internal.e);
		 	$('#internal-total').text(g_studentnceasummary.creditsbytype.internal.total);
		 	$('#internal-attempted').text(g_studentnceasummary.creditsbytype.internal.attempted);
		
		 	$('#external-na').text(g_studentnceasummary.creditsbytype.external.na);
		 	$('#external-a').text(g_studentnceasummary.creditsbytype.external.a);
		 	$('#external-m').text(g_studentnceasummary.creditsbytype.external.m);
		 	$('#external-e').text(g_studentnceasummary.creditsbytype.external.e);
		 	$('#external-total').text(g_studentnceasummary.creditsbytype.external.total);
		 	$('#external-attempted').text(g_studentnceasummary.creditsbytype.external.attempted);
		
		 	$('#total-na').text(g_studentnceasummary.creditsbytype.total.na);
		 	$('#total-a').text(g_studentnceasummary.creditsbytype.total.a);
		 	$('#total-m').text(g_studentnceasummary.creditsbytype.total.m);
		 	$('#total-e').text(g_studentnceasummary.creditsbytype.total.e);
		 	$('#total-total').text(g_studentnceasummary.creditsbytype.total.total);
		 	$('#total-attempted').text(g_studentnceasummary.creditsbytype.total.attempted);

			for (var i = 5; i > 0; i--)
			{
				var currentlevel = g_studentnceasummary.creditsbylevel[i];
				if (currentlevel != undefined)
				{
				 	$('#level' + i + '-na').text(currentlevel.na);
				 	$('#level' + i + '-a').text(currentlevel.a);
				 	$('#level' + i + '-m').text(currentlevel.m);
				 	$('#level' + i + '-e').text(currentlevel.e);
				 	$('#level' + i + '-total').text(currentlevel.total);
				 	$('#level' + i + '-attempted').text(currentlevel.attempted);
				}
				else
				{
				 	$('#level' + i + '-na').text('');
				 	$('#level' + i + '-a').text('');
				 	$('#level' + i + '-m').text('');
				 	$('#level' + i + '-e').text('');
				 	$('#level' + i + '-total').text('');
				 	$('#level' + i + '-attempted').text('');
				}
			}

			var thisyear = (new Date()).getFullYear();
			for (var i = 0; i < 5; i++)
			{
			 	$('#year' + (i + 1) + '-year').text(thisyear - i);
				var currentyear = g_studentnceasummary.creditsbyyear[thisyear - i];
				if (currentyear != undefined)
				{
				 	$('#year' + (i + 1) + '-na').text(currentyear.na);
				 	$('#year' + (i + 1) + '-a').text(currentyear.a);
				 	$('#year' + (i + 1) + '-m').text(currentyear.m);
				 	$('#year' + (i + 1) + '-e').text(currentyear.e);
				 	$('#year' + (i + 1) + '-total').text(currentyear.total);
				 	$('#year' + (i + 1) + '-attempted').text(currentyear.attempted);
				}
				else
				{
				 	$('#year' + (i + 1) + '-na').text('');
				 	$('#year' + (i + 1) + '-a').text('');
				 	$('#year' + (i + 1) + '-m').text('');
				 	$('#year' + (i + 1) + '-e').text('');
				 	$('#year' + (i + 1) + '-total').text('');
				 	$('#year' + (i + 1) + '-attempted').text('');
				}
			}
			
			var notachieved = parseInt(g_studentnceasummary.creditsbytype.total.na) || 0,
				achieved = parseInt(g_studentnceasummary.creditsbytype.total.a) || 0,
				merit = parseInt(g_studentnceasummary.creditsbytype.total.m) || 0,
				excellence = parseInt(g_studentnceasummary.creditsbytype.total.e) || 0;
			
			var data = [
				['Not Achieved', notachieved],
				['Achieved', achieved],
				['Merit', merit],
				['Excellence', excellence]
			];
			var plot1 = jQuery.jqplot ('ncea-graph', [data], {
				seriesColors: [ "#FF3333", "#0000DD", "#FFFF00", "#C18A00"],
				seriesDefaults: {
					// Make this a pie chart.
					renderer: jQuery.jqplot.PieRenderer, 
					rendererOptions: {
						// Put data labels on the pie slices.
						// By default, labels show the percentage of the slice.
						showDataLabels: true,
						dataLabels: 'label',
						dataLabelPositionFactor: 1,
						dataLabelNudge: 30
					}
				},
				grid: {
					borderWidth: 0,
					shadow: false,
					background: 'transparent'
				},
				/*
				legend: {
					show: true,
					location: 's',     // compass direction, nw, n, ne, e, se, s, sw, w.
					rendererOptions: {
						numberRows: 1
					}
				}
				*/
			});
		});
	}
}

function showStudentQualifications(selectedstudent) {
	var qualificationsdiv = $('#qualifications');
	qualificationsdiv.empty();
	
	if (selectedstudent != undefined && selectedstudent.studentid != '')
	{
		showStudentNameHeader(selectedstudent);
		
		// display the students results
		loadStudentQualificationsAndRunFunction(g_loginkey, selectedstudent.studentid, function() {
			// g_studentqualifications populated in here

			var qualificationsfound = false;
			for (var typeindex in g_studentqualifications.types)
			{
				var type = g_studentqualifications.types[typeindex];
				var typehtml = $('<div class="qualification-type"><div class="qualification-heading">' + qualificationCodeToText(type.typecode) + '</div></div>');
				for (var qualificationindex in type.qualifications)
				{
					var qualification = type.qualifications[qualificationindex];
					typehtml.append($('<div class="qualification"><div class="qualification-year">' + qualification.year + '</div><div class="qualification-endorsement">' + qualification.endorse + '</div><div class="qualification-title">' + qualification.title + '</div></div>'));

					qualificationsfound = true;
				}
				qualificationsdiv.append(typehtml);
			}
			
			if (!qualificationsfound)
				qualificationsdiv.append($('<p>No qualifications to show.</p>'));
		});
	}
}

function showStudentGroups(selectedstudent) {
	var groupsdiv = $('#groups');
	groupsdiv.empty();
	
	if (selectedstudent != undefined && selectedstudent.studentid != '')
	{
		showStudentNameHeader(selectedstudent);
		
		// display the students groups
		loadStudentGroupsAndRunFunction(g_loginkey, selectedstudent.studentid, function() {
			// g_studentgroups populated in here

			var groupsfound = false;
			for (var yearindex in g_studentgroups.groupsbyyear)
			{
				var year = g_studentgroups.groupsbyyear[yearindex];
				var yearhtml = $('<div class="group-year"><div class="group-heading">' + yearindex + '</div></div>');
				for (var groupindex in year.groups)
				{
					var group = year.groups[groupindex];
					var comment = group.comment;
					if (comment == '')
						comment = '&nbsp;';
					yearhtml.append($('<div class="group"><div class="group-name">' + group.name + '</div><div class="group-teacher">' + group.teacher + '</div><div class="group-comment">' + comment + '</div></div>'));
					
					groupsfound = true;
				}
				groupsdiv.append(yearhtml);
			}
			
			if (!groupsfound)
				groupsdiv.append($('<p>No groups to show.</p>'));
		});
	}
}

function showStudentAwards(selectedstudent) {
	var awardsdiv = $('#awards');
	awardsdiv.empty();
	
	if (selectedstudent != undefined && selectedstudent.studentid != '')
	{
		showStudentNameHeader(selectedstudent);
		
		// display the students awards
		loadStudentAwardsAndRunFunction(g_loginkey, selectedstudent.studentid, function() {
			// g_studentawards populated in here

			var awardsfound = false;
			for (var yearindex in g_studentawards.awardsbyyear)
			{
				var year = g_studentawards.awardsbyyear[yearindex];
				var yearhtml = $('<div class="award-year"><div class="award-heading">' + yearindex + '</div></div>');
				for (var awardindex in year.awards)
				{
					var award = year.awards[awardindex];
					var details = award.details;
					if (details == '')
						details = '&nbsp;';
					yearhtml.append($('<div class="award"><div class="award-title">' + award.title + '</div><div class="award-teacher">' + award.teacher + '</div><div class="award-details">' + details + '</div></div>'));
					
					awardsfound = true;
				}
				awardsdiv.append(yearhtml);
			}
			
			if (!awardsfound)
				awardsdiv.append($('<p>No awards to show.</p>'));
		});
	}
}

function showStudentPastoral(selectedstudent) {
	var pastoraldiv = $('#pastoral');
	pastoraldiv.empty();
	
	if (selectedstudent != undefined && selectedstudent.studentid != '')
	{
		showStudentNameHeader(selectedstudent);
		
		// display the students pastoral records
		loadStudentPastoralAndRunFunction(g_loginkey, selectedstudent.studentid, function() {
			// g_studentpastoral populated in here

			var pastoralfound = false;
			for (var incidentindex in g_studentpastoral.incidents)
			{
				var incident = g_studentpastoral.incidents[incidentindex];
				var reason = incident.reason;
				if (reason == '')
					reason = '&nbsp;';
				var incidentactionscombined = incident.actions.join(', ');
				if (incidentactionscombined == '')
					incidentactionscombined = '&nbsp;';
				var incidenthtml = $('<div class="incident"><div class="incident-type">' + incident.typecode + '</div><div class="incident-reason">' + reason + '</div><div class="incident-date">' + moment(incident.date).format('D MMM YYYY') + '</div><div class="incident-teacher">' + incident.teacher + '</div><div class="incident-points">' + incident.points + '</div><div class="incident-actions">' + incidentactionscombined + '</div></div>');
				pastoraldiv.append(incidenthtml);
				
				pastoralfound = true;
			}
			
			if (!pastoralfound)
				pastoraldiv.append($('<p>No pastoral events to show.</p>'));
		});
	}
}

function showTeacherNameHeader(selectedteacher) {
	// need to ensure that the selected teacher contains all the extended fields
	loadExtendedDetailsForTeacherAndRunFunction(g_loginkey, g_selectedteacher, function(){
		if (selectedteacher != undefined && selectedteacher.teachercode != '')
		{
			$('.teacher-details .teacher-name').text(selectedteacher.lastname + ', ' + selectedteacher.firstname);
			$('.teacher-details .teacher-tutor').text(selectedteacher.tutor);
		}
	});
}

function clearTeacherDetails() {
	$('#teacher-photo').attr('src', '#');
	
	// core fields
	$('#teacherdetails #teacher-title .field-value').text('');
	$('#teacherdetails #teacher-first-name .field-value').text('');
	$('#teacherdetails #teacher-last-name .field-value').text('');
	$('#teacherdetails #teacher-school-email .field-value a').text('');
	$('#teacherdetails #teacher-personal-email .field-value a').text('');
	
	$('#teacherdetails #teacher-departments .field-value').text('');
	$('#teacherdetails #teacher-classroom .field-value').text('');
	$('#teacherdetails #teacher-house .field-value').text('');
	$('#teacherdetails #teacher-extension .field-value').text('');
	
	$('#teacherdetails #teacher-phone-home .field-value a').text('');
	$('#teacherdetails #teacher-phone-cell .field-value a').text('');
	$('#teacherdetails #teacher-address .field-value').html('');
	$('#teacherdetails #teacher-partner .field-value').text('');
	
	$('#teacherdetails #teacher-car-park .field-value').text('');
	$('#teacherdetails #teacher-car-registration .field-value').html('');
	$('#teacherdetails #teacher-car-model .field-value').html('');
	$('#teacherdetails #teacher-car-colour .field-value').html('');

	$('#teacherdetails #teacher-nextofkin-name .field-value').text('');
	$('#teacherdetails #teacher-nextofkin-relationship .field-value').text('');
	$('#teacherdetails #teacher-nextofkin-phone-home .field-value a').text('');
	$('#teacherdetails #teacher-nextofkin-phone-cell .field-value a').text('');
	$('#teacherdetails #teacher-nextofkin-phone-work .field-value a').text('');
	$('#teacherdetails #teacher-nextofkin-address .field-value').html('');
		
	$('#teacherdetails #teacher-altcontact-name .field-value').text('');
	$('#teacherdetails #teacher-altcontact-relationship .field-value').text('');
	$('#teacherdetails #teacher-altcontact-phone-home .field-value a').text('');
	$('#teacherdetails #teacher-altcontact-phone-cell .field-value a').text('');
	$('#teacherdetails #teacher-altcontact-phone-work .field-value a').text('');
	$('#teacherdetails #teacher-altcontact-address .field-value').html('');
		
	$('#teacherdetails #teacher-responsibilities .field-value').html('');
	$('#teacherdetails #teacher-committees .field-value').html('');
}

function showTeacherDetails(selectedteacher) {
	// clear all details fields
	clearTeacherDetails();
	
	if (selectedteacher != undefined && selectedteacher.teachercode != '' && selectedteacher.extendeddetails == true)
	{
		showTeacherNameHeader(selectedteacher);
			
		$('#teacher-photo').attr('src', s_imgurl + '?Key=' + g_loginkey + '&Code=' + selectedteacher.teachercode + '&Stuid=');
	
		// core fields
		$('#teacherdetails #teacher-title .field-value').text(selectedteacher.title);
		$('#teacherdetails #teacher-first-name .field-value').text(selectedteacher.firstname);
		$('#teacherdetails #teacher-last-name .field-value').text(selectedteacher.lastname);
		$('#teacherdetails #teacher-school-email .field-value a').text(selectedteacher.schoolemail);
		$('#teacherdetails #teacher-school-email .field-value a').attr('href', 'mailto:' + selectedteacher.schoolemail);
		$('#teacherdetails #teacher-personal-email .field-value a').text(selectedteacher.personalemail);
		$('#teacherdetails #teacher-personal-email .field-value a').attr('href', 'mailto:' + selectedteacher.personalemail);
	
		$('#teacherdetails #teacher-departments .field-value').text(selectedteacher.departments);
		$('#teacherdetails #teacher-classroom .field-value').text(selectedteacher.room);
		$('#teacherdetails #teacher-house .field-value').text(selectedteacher.house);
		$('#teacherdetails #teacher-extension .field-value').text(selectedteacher.extension);
	
		$('#teacherdetails #teacher-phone-home .field-value a').text(selectedteacher.phone);
		$('#teacherdetails #teacher-phone-home .field-value a').attr('href', 'tel:' + selectedteacher.phone);
		$('#teacherdetails #teacher-phone-cell .field-value a').text(selectedteacher.mobile);
		$('#teacherdetails #teacher-phone-cell .field-value a').attr('href', 'tel:' + selectedteacher.mobile);
		$('#teacherdetails #teacher-address .field-value').html(selectedteacher.address.replace('\n', '<br />'));
		$('#teacherdetails #teacher-partner .field-value').text(selectedteacher.partner);
	
		$('#teacherdetails #teacher-car-park .field-value').text(selectedteacher.carpark);
		var vehiclecolours = [];
		var vehiclemodels = [];
		var vehicleregistrations = [];
		$(selectedteacher.vehicles).each(function(index){
			vehiclecolours.push(this.colour);
			vehiclemodels.push(this.model);
			vehicleregistrations.push(this.registration);
		});
		$('#teacherdetails #teacher-car-registration .field-value').html(vehicleregistrations.join('<br />'));
		$('#teacherdetails #teacher-car-model .field-value').html(vehiclemodels.join('<br />'));
		$('#teacherdetails #teacher-car-colour .field-value').html(vehiclecolours.join('<br />'));

		if (selectedteacher.additonalcontacts.length > 0)
		{
			$('#teacherdetails #teacher-nextofkin-name .field-value').text(selectedteacher.additonalcontacts[0].name);
			$('#teacherdetails #teacher-nextofkin-relationship .field-value').text(selectedteacher.additonalcontacts[0].relationship);
			$('#teacherdetails #teacher-nextofkin-phone-home .field-value a').text(selectedteacher.additonalcontacts[0].phone);
			$('#teacherdetails #teacher-nextofkin-phone-home .field-value a').attr('href', 'tel:' + selectedteacher.additonalcontacts[0].phone);
			$('#teacherdetails #teacher-nextofkin-phone-cell .field-value a').text(selectedteacher.additonalcontacts[0].mobile);
			$('#teacherdetails #teacher-nextofkin-phone-cell .field-value a').attr('href', 'tel:' + selectedteacher.additonalcontacts[0].mobile);
			$('#teacherdetails #teacher-nextofkin-phone-work .field-value a').text(selectedteacher.additonalcontacts[0].workphone);
			$('#teacherdetails #teacher-nextofkin-phone-work .field-value a').attr('href', 'tel:' + selectedteacher.additonalcontacts[0].workphone);
			$('#teacherdetails #teacher-nextofkin-address .field-value').html(selectedteacher.additonalcontacts[0].address.replace('\n', '<br />'));
		}
		else
		{
			$('#teacherdetails #teacher-nextofkin-name .field-value').text('');
			$('#teacherdetails #teacher-nextofkin-relationship .field-value').text('');
			$('#teacherdetails #teacher-nextofkin-phone-home .field-value a').text('');
			$('#teacherdetails #teacher-nextofkin-phone-cell .field-value a').text('');
			$('#teacherdetails #teacher-nextofkin-phone-work .field-value a').text('');
			$('#teacherdetails #teacher-nextofkin-address .field-value').html('');
		}
		if (selectedteacher.additonalcontacts.length > 1)
		{
			$('#teacherdetails #teacher-altcontact-name .field-value').text(selectedteacher.additonalcontacts[1].name);
			$('#teacherdetails #teacher-altcontact-relationship .field-value').text(selectedteacher.additonalcontacts[1].relationship);
			$('#teacherdetails #teacher-altcontact-phone-home .field-value a').text(selectedteacher.additonalcontacts[1].phone);
			$('#teacherdetails #teacher-altcontact-phone-home .field-value a').attr('href', 'tel:' + selectedteacher.additonalcontacts[1].phone);
			$('#teacherdetails #teacher-altcontact-phone-cell .field-value a').text(selectedteacher.additonalcontacts[1].mobile);
			$('#teacherdetails #teacher-altcontact-phone-cell .field-value a').attr('href', 'tel:' + selectedteacher.additonalcontacts[1].mobile);
			$('#teacherdetails #teacher-altcontact-phone-work .field-value a').text(selectedteacher.additonalcontacts[1].workphone);
			$('#teacherdetails #teacher-altcontact-phone-work .field-value a').attr('href', 'tel:' + selectedteacher.additonalcontacts[1].workphone);
			$('#teacherdetails #teacher-altcontact-address .field-value').html(selectedteacher.additonalcontacts[1].address.replace('\n', '<br />'));
		}
		else
		{
			$('#teacherdetails #teacher-altcontact-name .field-value').text('');
			$('#teacherdetails #teacher-altcontact-relationship .field-value').text('');
			$('#teacherdetails #teacher-altcontact-phone-home .field-value a').text('');
			$('#teacherdetails #teacher-altcontact-phone-cell .field-value a').text('');
			$('#teacherdetails #teacher-altcontact-phone-work .field-value a').text('');
			$('#teacherdetails #teacher-altcontact-address .field-value').html('');
		}
	
		$('#teacherdetails #teacher-responsibilities .field-value').html(selectedteacher.responsibilities.replace('\n', '<br />'));
		$('#teacherdetails #teacher-committees .field-value').html(selectedteacher.committees.replace('\n', '<br />'));
	}
}

function clearTeacherTimetable() {
	var periodslots = $('#teachertimetable .timetable .period');
		
	periodslots.each(function(index){
		var classdetail = $(this).find('.class-detail');
		classdetail.empty();
		
		var checklistdetail = $(this).find('.attendance-checklist');
		checklistdetail.empty();
	}) ;
}

function updateTeacherTimetable() {
	// clear timetable
	clearTeacherTimetable();
	
	showTeacherNameHeader(g_selectedteacher);
	
	// if the date is out of bounds, force a date change by week
	var adjustedweekoftimetable = returnWeekInBoundaries(g_selectedcalendarday.weekoftimetable);

	// need to get the date based on the current week, otherwise we run the risk of the timetable data being out of sync with the date globals
	changeWeekAndRunFunction(g_selectedcalendarday.date, adjustedweekoftimetable, function() {
		$('#teachertimetable .week-details .week-status').text('Term ' + g_selectedcalendarday.term + ', Week ' + g_selectedcalendarday.weekofterm);
	
		var backaweekarrow = $('#teachertimetable .week-details .backaweekarrow'),
			forwardaweekarrow = $('#teachertimetable .week-details .forwardaweekarrow'),
			mondaybutton = $('#teachertimetable .day-selector .monday-button'),
			tuesdaybutton = $('#teachertimetable .day-selector .tuesday-button'),
			wednesdaybutton = $('#teachertimetable .day-selector .wednesday-button'),
			thursdaybutton = $('#teachertimetable .day-selector .thursday-button'),
			fridaybutton = $('#teachertimetable .day-selector .friday-button');
		
		backaweekarrow.unbind('click');
		forwardaweekarrow.unbind('click');
		mondaybutton.unbind('click');
		tuesdaybutton.unbind('click');
		wednesdaybutton.unbind('click');
		thursdaybutton.unbind('click');
		fridaybutton.unbind('click');
	
		// update highlighting on buttons
		if (g_selecteddate.getDay() == 1)
			mondaybutton.parent().attr("data-theme", "b").removeClass("ui-btn-up-c").removeClass("ui-btn-hover-c").addClass("ui-btn-up-b");
		else
			mondaybutton.parent().attr("data-theme", "c").removeClass("ui-btn-up-b").removeClass("ui-btn-hover-b").addClass("ui-btn-up-c");
		if (g_selecteddate.getDay() == 2)
			tuesdaybutton.parent().attr("data-theme", "b").removeClass("ui-btn-up-c").removeClass("ui-btn-hover-c").addClass("ui-btn-up-b");
		else
			tuesdaybutton.parent().attr("data-theme", "c").removeClass("ui-btn-up-b").removeClass("ui-btn-hover-b").addClass("ui-btn-up-c");
		if (g_selecteddate.getDay() == 3)
			wednesdaybutton.parent().attr("data-theme", "b").removeClass("ui-btn-up-c").removeClass("ui-btn-hover-c").addClass("ui-btn-up-b");
		else
			wednesdaybutton.parent().attr("data-theme", "c").removeClass("ui-btn-up-b").removeClass("ui-btn-hover-b").addClass("ui-btn-up-c");
		if (g_selecteddate.getDay() == 4)
			thursdaybutton.parent().attr("data-theme", "b").removeClass("ui-btn-up-c").removeClass("ui-btn-hover-c").addClass("ui-btn-up-b");
		else
			thursdaybutton.parent().attr("data-theme", "c").removeClass("ui-btn-up-b").removeClass("ui-btn-hover-b").addClass("ui-btn-up-c");
		if (g_selecteddate.getDay() == 5)
			fridaybutton.parent().attr("data-theme", "b").removeClass("ui-btn-up-c").removeClass("ui-btn-hover-c").addClass("ui-btn-up-b");
		else
			fridaybutton.parent().attr("data-theme", "c").removeClass("ui-btn-up-b").removeClass("ui-btn-hover-b").addClass("ui-btn-up-c");
	
		var lastmondayfordate = getLastMonday(g_selecteddate),
			tuesdaydate = new Date(lastmondayfordate.getFullYear(), lastmondayfordate.getMonth(), lastmondayfordate.getDate() + 1),
			wednesdaydate = new Date(lastmondayfordate.getFullYear(), lastmondayfordate.getMonth(), lastmondayfordate.getDate() + 2),
			thursdaydate = new Date(lastmondayfordate.getFullYear(), lastmondayfordate.getMonth(), lastmondayfordate.getDate() + 3),
			fridaydate = new Date(lastmondayfordate.getFullYear(), lastmondayfordate.getMonth(), lastmondayfordate.getDate() + 4);
		backaweekarrow.click(function(){
			g_selectedperiod = 0;
		
			var newweek = parseInt(g_selectedcalendarday.weekoftimetable) - 1;
			// changing date might not be actioned immediately, so we use a callback to take action
			changeWeekAndRunFunction(g_selecteddate, newweek, updateTeacherTimetable);
		});
		forwardaweekarrow.click(function(){
			g_selectedperiod = 0;
		
			var newweek = parseInt(g_selectedcalendarday.weekoftimetable) + 1;
			// changing date might not be actioned immediately, so we use a callback to take action
			changeWeekAndRunFunction(g_selecteddate, newweek, updateTeacherTimetable);
		});
		mondaybutton.click(function(){
			g_selectedperiod = 0;
			var newdate = lastmondayfordate;
		
			// changing date might not be actioned immediately, so we use a callback to take action
			changeDateAndRunFuction(newdate, updateTeacherTimetable);
		});
		tuesdaybutton.click(function(){
			g_selectedperiod = 0;
			var newdate = tuesdaydate;
		
			// changing date might not be actioned immediately, so we use a callback to take action
			changeDateAndRunFuction(newdate, updateTeacherTimetable);
		});
		wednesdaybutton.click(function(){
			g_selectedperiod = 0;
			var newdate = wednesdaydate;
		
			// changing date might not be actioned immediately, so we use a callback to take action
			changeDateAndRunFuction(newdate, updateTeacherTimetable);
		});
		thursdaybutton.click(function(){
			g_selectedperiod = 0;
			var newdate = thursdaydate;
		
			// changing date might not be actioned immediately, so we use a callback to take action
			changeDateAndRunFuction(newdate, updateTeacherTimetable);
		});
		fridaybutton.click(function(){
			g_selectedperiod = 0;
			var newdate = fridaydate;
		
			// changing date might not be actioned immediately, so we use a callback to take action
			changeDateAndRunFuction(newdate, updateTeacherTimetable);
		});
	
		// globals might not be availble, so we build some code to run when it is
		var showperiods = function() {
			$('#teachertimetable .timetable .period-names .period-name').each(function(index){
				$(this).text(g_globals.periods[index].periodname.replace(/\s/g, '\u00A0'));
			});
		}
		loadGlobalsAndRunFunction(showperiods);
	
		var mondayslots = $('#teachertimetable .timetable .monday .period'),
			tuesdayslots = $('#teachertimetable .timetable .tuesday .period'),
			wednesdayslots = $('#teachertimetable .timetable .wednesday .period'),
			thursdayslots = $('#teachertimetable .timetable .thursday .period'),
			fridayslots = $('#teachertimetable .timetable .friday .period');
		// timetable might not be available, so we build some code to run when it is
		loadStaffTimetableAndRunFunction(g_loginkey, g_selectedteacher.teachercode, g_selectedyear, function() {
			if (g_teachertimetable != undefined)
			{
				var currentweek = g_teachertimetable.weeks[g_selectedcalendarday.weekoftimetable - 1];
				
				if (currentweek != undefined)
				{
					var mondaytimetableday = currentweek.days[0],
						tuesdaytimetableday = currentweek.days[1],
						wednesdaytimetableday = currentweek.days[2],
						thursdaytimetableday = currentweek.days[3],
						fridaytimetableday = currentweek.days[4];
				
					updateTeacherTimetableClassDetails(mondaytimetableday, mondayslots, lastmondayfordate);
					updateTeacherTimetableClassDetails(tuesdaytimetableday, tuesdayslots, tuesdaydate);
					updateTeacherTimetableClassDetails(wednesdaytimetableday, wednesdayslots, wednesdaydate);
					updateTeacherTimetableClassDetails(thursdaytimetableday, thursdayslots, thursdaydate);
					updateTeacherTimetableClassDetails(fridaytimetableday, fridayslots, fridaydate);
			
					// flag the selected day as active for styling
					if (g_selectedcalendarday.date.getDay() == 1)
						$('#teachertimetable .timetable .monday').addClass('selected');
					else
						$('#teachertimetable .timetable .monday').removeClass('selected');
					if (g_selectedcalendarday.date.getDay() == 2)
						$('#teachertimetable .timetable .tuesday').addClass('selected');
					else
						$('#teachertimetable .timetable .tuesday').removeClass('selected');
					if (g_selectedcalendarday.date.getDay() == 3)
						$('#teachertimetable .timetable .wednesday').addClass('selected');
					else
						$('#teachertimetable .timetable .wednesday').removeClass('selected');
					if (g_selectedcalendarday.date.getDay() == 4)
						$('#teachertimetable .timetable .thursday').addClass('selected');
					else
						$('#teachertimetable .timetable .thursday').removeClass('selected');
					if (g_selectedcalendarday.date.getDay() == 5)
						$('#teachertimetable .timetable .friday').addClass('selected');
					else
						$('#teachertimetable .timetable .friday').removeClass('selected');
				}
			}
		});

		// calendar might not be available, so we build some code to run when it is
		var showopenstatus = function() {
			var mondaycalendarday = g_calendar.days[lastmondayfordate.getTime()];
				tuesdaycalendarday = g_calendar.days[tuesdaydate.getTime()];
				wednesdaycalendarday = g_calendar.days[wednesdaydate.getTime()];
				thursdaycalendarday = g_calendar.days[thursdaydate.getTime()];
				fridaycalendarday = g_calendar.days[fridaydate.getTime()];
			
			$('#teachertimetable .timetable-day.monday .day-details .date').text(moment(lastmondayfordate).format('Do MMM YYYY'));
			$('#teachertimetable .timetable-day.tuesday .day-details .date').text(moment(tuesdaydate).format('Do MMM YYYY'));
			$('#teachertimetable .timetable-day.wednesday .day-details .date').text(moment(wednesdaydate).format('Do MMM YYYY'));
			$('#teachertimetable .timetable-day.thursday .day-details .date').text(moment(thursdaydate).format('Do MMM YYYY'));
			$('#teachertimetable .timetable-day.friday .day-details .date').text(moment(fridaydate).format('Do MMM YYYY'));
			if (mondaycalendarday != undefined)
				$('#teachertimetable .timetable-day.monday .day-details .calendar-status').text(openStatusToFullText(mondaycalendarday.openstatus, mondaycalendarday.dayoftimetable));
			else
				$('#teachertimetable .timetable-day.monday .day-details .calendar-status').text('');
			if (tuesdaycalendarday != undefined)
				$('#teachertimetable .timetable-day.tuesday .day-details .calendar-status').text(openStatusToFullText(tuesdaycalendarday.openstatus, tuesdaycalendarday.dayoftimetable));
			else
				$('#teachertimetable .timetable-day.tuesday .day-details .calendar-status').text('');
			if (wednesdaycalendarday != undefined)
				$('#teachertimetable .timetable-day.wednesday .day-details .calendar-status').text(openStatusToFullText(wednesdaycalendarday.openstatus, wednesdaycalendarday.dayoftimetable));
			else
				$('#teachertimetable .timetable-day.wednesday .day-details .calendar-status').text('');
			if (thursdaycalendarday != undefined)
				$('#teachertimetable .timetable-day.thursday .day-details .calendar-status').text(openStatusToFullText(thursdaycalendarday.openstatus, thursdaycalendarday.dayoftimetable));
			else
				$('#teachertimetable .timetable-day.thursday .day-details .calendar-status').text('');
			if (fridaycalendarday != undefined)
				$('#teachertimetable .timetable-day.friday .day-details .calendar-status').text(openStatusToFullText(fridaycalendarday.openstatus, fridaycalendarday.dayoftimetable));
			else
				$('#teachertimetable .timetable-day.friday .day-details .calendar-status').text('');
		};
		loadCalendarAndRunFuction(g_selectedyear, showopenstatus);
	});
}

function updateTeacherTimetableClassDetails(timetableday, periodslots, date) {
	var lastmondayfordate = getLastMonday(date);
	periodslots.each(function(index){
		var currentsubjectone = timetableday.periods[index].subjects[0],
			currentsubjecttwo = timetableday.periods[index].subjects[1];

		var lineindentifier = [];
			subjectcode = [];
			roomcode = [];
		if (currentsubjectone != undefined)
		{
			lineindentifier.push(currentsubjectone.lineidentifier);
			subjectcode.push(currentsubjectone.subjectcode);
			roomcode.push(currentsubjectone.roomcode);
		}
		if (currentsubjecttwo != undefined)
		{
			lineindentifier.push(currentsubjecttwo.lineidentifier);
			subjectcode.push(currentsubjecttwo.subjectcode);
			roomcode.push(currentsubjecttwo.roomcode);
		}
		var classdetail = $(this).find('.class-detail');
		classdetail.empty();
		classdetail.append($('<div class="line-identifier">' + lineindentifier.join('<br />') + '</div><div class="subject-code">' + subjectcode.join('<br />') + '</div><div class="room-code">' + roomcode.join('<br />') + '</span></div>'));

		var perioddom = this;
		$(perioddom).find('.attendance-checklist').empty();
		// add in attendance checklist if there is a valid subject
		if (subjectcode.length > 0)
		{
			// attendance checklist might not be available, so we build some code to run when it is
			loadAttendanceChecklistAndRunFunction(g_loginkey, g_selectedteacher.teachercode, g_selectedyear, function() {
				var currentweekchecklist = g_teacherattendancechecklist.weeks[lastmondayfordate.getTime()],
					checklist = undefined;
			
				if (currentweekchecklist != undefined && currentweekchecklist.days.length > 4)
				{
					checklist = currentweekchecklist.days[date.getDay() - 1];
				
					if (checklist.checklist[index] == 'Y')
						updateTeacherTimetableAttendanceChecklist(index + 1, true, perioddom, date);
					else
						updateTeacherTimetableAttendanceChecklist(index + 1, false, perioddom, date);
				}
				else
				{
					updateTeacherTimetableAttendanceChecklist(index + 1, false, perioddom, date);
				}
			});
		}
	});
}

function updateTeacherTimetableAttendanceChecklist(peroidindex, alreadymarked, period, date) {
	var	checklistdisplay = $(period).find('.attendance-checklist');
	checklistdisplay.unbind('click');
	checklistdisplay.click(function(event, data) {
		g_selectedperiod = peroidindex;
		g_selecteddate = date;
		$.mobile.changePage(basepath + 'attendancemarking.' + s_fileextension + '', {
			transition: 'fade'
		});
	});
	if (alreadymarked)
		checklistdisplay.html($('<img src="' + assetspath + 'images/tick.png" alt="Attendance marked">'));
	else
		checklistdisplay.html($('<img src="' + assetspath + 'images/cross.png" alt="Attendance unmarked">'));
}

function saveAttendanceOnLeave() {
	$(document).bind('saveattendancestate', function() {
		saveAttendanceValues(false);
	});
}

function unbindSaveAttendanceOnLeave() {
	$(document).unbind('saveattendancestate');
}

$('#loginbutton').live('click',function(event, data){
	login();
});
$('#logoutbutton').live('click', function(event, data){
	logout();
	$.mobile.changePage(basepath + 'index.' + s_fileextension + '', {
		transition: 'slide',
		reverse: true
	});
});
$('#savesettingsbutton').live('click',function(event, data){
	saveSettings();
});
$('#attendancefinishbutton').live('click',function(event, data){
	if (!$('#attendancemarking .attendancesavebuttons').hasClass('attendance-finished'))
		saveAttendanceValues(true);
});function attemptLogin(username, password) {
	loadAPISettingsAndRunFunction(function(){
		if (g_apiupdaterequired)
		{
			g_newerrors.push('The server you are connecting to is running an old version of their web software, please ask the school to update');
			$(document).trigger('loginsuccessful', [false]);
		}
		else if (g_appupdaterequired)
		{
			g_newerrors.push('You must update your Android app to connect to this school. [' + s_appversion + '] -> [' + g_apisettings.minandroidversion + ']');
			$(document).trigger('loginsuccessful', [false]);
		}
		else
		{
			$.post(s_apiurl, {Key: "vtku", Command: "Logon", Username: username, Password: password}, function(data) {
				var errortext = $(data).find('LogonResults').find('Error').text();
				if (errortext != "")
				{
					g_newerrors.push('Logon : ' + errortext);
					$(document).trigger('loginsuccessful', [false]);
				}
				else
				{
					var loginkey = $(data).find('LogonResults').find('Key').text();
					if (loginkey != "")
					{
						g_loginkey = loginkey;
						g_loginlevel = $(data).find('LogonResults').find('LogonLevel').text();
						if (g_loginlevel == 10)
						{
							g_loggedinteacher = new Object;
							g_loggedinteacher.username = username;
							g_loggedinteacher.firstname = $(data).find('LogonResults').find('FirstName').text();
							g_loggedinteacher.lastname = $(data).find('LogonResults').find('LastName').text();
							g_loggedinteacher.tutor = $(data).find('LogonResults').find('Tutor').text();
							g_loggedinteacher.teachercode = $(data).find('LogonResults').find('CurrentTeacher').text();
							g_loggedinteacher.extendeddetails = false;
					
							g_selectedteacher = g_loggedinteacher;
						
							if (g_apisettings.staffsavedpasswords)
								allowsavedpassword(true);
							else
								allowsavedpassword(false);
						}
						else
						{
							g_loggedinstudent = new Object;
							g_loggedinstudent.username = username;
							g_loggedinstudent.studentid = $(data).find('LogonResults').find('CurrentStudent').text();
							g_loggedinstudent.extendeddetails = false;
					
							g_selectedstudent = g_loggedinstudent;
						
							if (g_apisettings.studentsavedpasswords)
								allowsavedpassword(true);
							else
								allowsavedpassword(false);
							
						}
						$(document).trigger('loginsuccessful', [true]);
					}
					else
					{
						g_newerrors.push('Logon : Unexpected output received from server');
						$(document).trigger('loginsuccessful', [false]);
					}
				}
			});
		}
	}, true);
}

function loadAPISettingsAndRunFunction(runafterload, forceupdate) {
	loadWithExclusivity('apisettingsloaded', function() {
		loadAPISettings(forceupdate);
	}, runafterload);
}

function loadGlobalsAndRunFunction(runafterload) {
	loadWithExclusivity('globalsloaded', function() {
		loadGlobalSettings();
	}, runafterload);
}

function loadCalendarAndRunFuction(calendaryear, runafterload) {
	loadWithExclusivity('calendarloaded', function() {
		loadCalendar(calendaryear);
	}, runafterload);
}

function loadNoticesForDateAndRunFunction(loginkey, selecteddate, runafterload) {
	loadWithExclusivity('noticesloaded', function() {
		loadNoticesForDate(loginkey, selecteddate);
	}, runafterload);
}

function loadEventsForDateAndRunFunction(loginkey, date, runafterload) {
	loadWithExclusivity('eventsloaded', function() {
		loadEventsForDate(loginkey, date);
	}, runafterload);
}

function loadExtendedDetailsForStudentAndRunFunction(loginkey, selectedstudent, runafterload) {
	loadWithExclusivity('extendedstudentdetailsloaded', function() {
		loadExtendedDetailsForStudent(loginkey, selectedstudent);
	}, runafterload);
}

function loadStudentTimetableAndRunFunction(loginkey, studentid, timetableyear, runafterload) {
	loadWithExclusivity('studenttimetableloaded', function() {
		loadStudentTimetable(loginkey, studentid, timetableyear);
	}, runafterload);
}

function loadStudentAttendanceStatsAndRunFunction(loginkey, studentid, timetableyear, runafterload) {
	loadWithExclusivity('studentattendancestatsloaded', function() {
		loadStudentAttendanceStats(loginkey, studentid, timetableyear);
	}, runafterload);
}

function loadStudentAttendanceAndRunFunction(loginkey, studentid, timetableyear, runafterload) {
	loadWithExclusivity('studentattendanceloaded', function() {
		loadStudentAttendance(loginkey, studentid, timetableyear);	
	}, runafterload);
}

function loadStudentResultsAndRunFunction(loginkey, studentid, runafterload) {
	loadWithExclusivity('studentresultsloaded', function() {
		loadStudentResults(loginkey, studentid);
	}, runafterload);
}

function loadStudentNCEASummaryAndRunFunction(loginkey, studentid, runafterload) {
	loadWithExclusivity('studentncealoaded',function() {
		loadStudentNCEASummary(loginkey, studentid);
	}, runafterload);
}

function loadStudentQualificationsAndRunFunction(loginkey, studentid, runafterload) {
	loadWithExclusivity('studentqualificationsloaded', function() {
		loadStudentQualifications(loginkey, studentid);
	}, runafterload);
}

function loadStudentGroupsAndRunFunction(loginkey, studentid, runafterload) {
	loadWithExclusivity('studentgroupsloaded', function() {
		loadStudentGroups(loginkey, studentid);
	}, runafterload);
}

function loadStudentAwardsAndRunFunction(loginkey, studentid, runafterload) {
	loadWithExclusivity('studentawardsloaded', function() {
		loadStudentAwards(loginkey, studentid);
	}, runafterload);
}


function loadStudentPastoralAndRunFunction(loginkey, studentid, runafterload) {
	loadWithExclusivity('studentpastoralloaded', function() {
		loadStudentPastoral(loginkey, studentid);
	}, runafterload);
}


function loadExtendedDetailsForTeacherAndRunFunction(loginkey, selectedteacher, runafterload) {
	loadWithExclusivity('extendeddetailsloaded', function() {
		loadExtendedDetailsForTeacher(loginkey, selectedteacher);
	}, runafterload);
}

function loadStaffTimetableAndRunFunction(loginkey, teachercode, timetableyear, runafterload) {
	loadWithExclusivity('teachertimetableloaded', function() {
		loadStaffTimetable(loginkey, teachercode, timetableyear);
	}, runafterload);
}

function loadAttendanceChecklistAndRunFunction(loginkey, teachercode, timetableyear, runafterload) {
	loadWithExclusivity('teacherattendancechecklistloaded', function() {
		loadAttendanceChecklist(loginkey, teachercode, timetableyear);
	}, runafterload);
}

function performStudentSearchAndRunFunction(loginkey, searchtext, runaftersearch) {
	loadWithExclusivity('studentsearchperformed', function() {
		performStudentSearch(loginkey, searchtext);
	}, runaftersearch);
}

function performStaffSearchAndRunFunction(loginkey, searchtext, runaftersearch) {
	loadWithExclusivity('staffsearchperformed', function() {
		performStaffSearch(loginkey, searchtext);
	}, runaftersearch);
}

function changeDateAndRunFuction(date, runafterchange) {
	loadWithExclusivity('selecteddatechanged', function() {
		changeDate(date);
	}, runafterchange);
}

function changeWeekAndRunFunction(date, week, runafterchange) {
	loadWithExclusivity('selectedweekchanged', function() {
		changeWeek(date, week);
	}, runafterchange);
}

function loadAPISettings(forceupdate) {
	if (g_apisettings == undefined || (forceupdate != undefined && forceupdate))
	{
		// settings object not loaded, load it
		$.post(s_apiurl, {Key: 'vtku', Command: "GetSettings"}, function(data) {
			var errortext = $(data).find('SettingsResults').find('Error').text();
			if (errortext != "")
			{
				g_newerrors.push('GetSettings : ' + errortext);
				$(document).trigger('globalsloaded', [false]);
			}
			else
			{
				var settingsresults = $(data).find('SettingsResults'),
					settingsversion = settingsresults.find('SettingsVersion'),
					minandroidversion = settingsresults.find('MinAndroidVersion');
				if (settingsresults.length == 1 && settingsversion.length == 1)
				{
					// good to go, start building settings object
					var newapisettings = new Object();
					
					newapisettings.settingsversion = settingsversion.text();
					newapisettings.minandroidversion = minandroidversion.text();

					if (settingsresults.find('StudentsAllowed').text() == 1)
						newapisettings.studentsallowed = true;
					else
						newapisettings.studentsallowed = false;
					if (settingsresults.find('StaffAllowed').text() == 1)
						newapisettings.staffallowed = true;
					else
						newapisettings.staffallowed = false;
					if (settingsresults.find('StudentsSavedPasswords').text() == 1)
						newapisettings.studentsavedpasswords = true;
					else
						newapisettings.studentsavedpasswords = false;
					if (settingsresults.find('StaffSavedPasswords').text() == 1)
						newapisettings.staffsavedpasswords = true;
					else
						newapisettings.staffsavedpasswords = false;
					
					// security settings
					newapisettings.useraccess = new Object();
					var useraccessdefinitions = settingsresults.find('UserAccess').find('User');
					$(useraccessdefinitions).each(function(index) {
						var accesslevel = $(this).attr('index'),
							access = new Object();

						if ($(this).find('Notices').text() == 1)
							access.notices = true;
						else
							access.notices = false;
						if ($(this).find('Events').text() == 1)
							access.events = true;
						else
							access.events = false;
						if (accesslevel > 0)
						{
							if ($(this).find('Details').text() == 1)
								access.details = true;
							else
								access.details = false;
							if ($(this).find('Timetable').text() == 1)
								access.timetable = true;
							else
								access.timetable = false;
							if ($(this).find('Attendance').text() == 1)
								access.attendance = true;
							else
								access.attendance = false;
							if ($(this).find('NCEA').text() == 1)
								access.ncea = true;
							else
								access.ncea = false;
							if ($(this).find('Results').text() == 1)
								access.results = true;
							else
								access.results = false;
							if ($(this).find('Groups').text() == 1)
								access.groups = true;
							else
								access.groups = false;
							if ($(this).find('Awards').text() == 1)
								access.awards = true;
							else
								access.awards = false;
							if ($(this).find('Pastoral').text() == 1)
								access.pastoral = true;
							else
								access.pastoral = false;
						}

						newapisettings.useraccess[accesslevel] = access;
					});
					
					g_apisettings = newapisettings;
					
					if (g_apisettings.settingsversion < s_expectedsettingsversion)
						g_apiupdaterequired = true;
					if (g_apisettings.minandroidversion != '' && g_apisettings.minandroidversion > s_appversion)
						g_appupdaterequired = true;
			
					$(document).trigger('apisettingsloaded', true);
				}
				else
				{
					g_newerrors.push('GetSettings : Unexpected output received from server');
					$(document).trigger('apisettingsloaded', false);
				}
			}
		});
	}
	else
	{
		$(document).trigger('apisettingsloaded', true);
	}
}

function loadGlobalSettings() {
	if (g_globals == undefined)
	{
		// globals object not loaded, load it :D
		$.post(s_apiurl, {Key: 'vtku', Command: "GetGlobals"}, function(data) {
			var errortext = $(data).find('GlobalsResults').find('Error').text();
			if (errortext != "")
			{
				g_newerrors.push('GetGlobals : ' + errortext);
				$(document).trigger('globalsloaded', [false]);
			}
			else
			{
				var perioddefinitions = $(data).find('GlobalsResults').find('PeriodDefinitions').find('PeriodDefinition');
				if (perioddefinitions.length == 10)
				{
					// good to go, start building globals object
					var newglobals = new Object();
					
					var periods = [];
					$(perioddefinitions).each(function(index) {
						var period = new Object();
						period.periodname = $(this).find('PeriodName').text();
						period.periodtime = $(this).find('PeriodTime').text();
						periods.push(period);
					});
					newglobals.periods = periods;
					
					g_globals = newglobals;
			
					$(document).trigger('globalsloaded', [true]);
				}
				else
				{
					g_newerrors.push('GetGlobals : Unexpected output received from server');
					$(document).trigger('globalsloaded', [false]);
				}
			}
		});
	}
	else
	{
		$(document).trigger('globalsloaded', [true]);
	}
}

function loadCalendar(calendaryear) {
	if(g_calendar == undefined || g_calendar.calendaryear != calendaryear)
	{
		// load the calendar for year
		$.post(s_apiurl, {Key: 'vtku', Command: "GetCalendar", Year: calendaryear}, function(data) {
			var errortext = $(data).find('CalendarResults').find('Error').text();
			if (errortext != "")
			{
				g_newerrors.push('GetCalendar : ' + errortext);
				$(document).trigger('calendarloaded', [false]);
			}
			else
			{
				var numberofrecords = $(data).find('CalendarResults').find('NumberRecords').text();
				if (numberofrecords == 365 || numberofrecords == 366)
				{
					// good to go, start building timetable object
					var newcalendar = new Object();
					
					newcalendar.calendaryear = calendaryear;

					var days = new Object();
					var weekstarts = new Object();
					$(data).find('CalendarResults').find('Days').find('Day').each(function(index){
						var newday = new Object();
						newday.date = ISO8601DateStringToDate($(this).find('Date').text()),
						newday.openstatus = $(this).find('Status').text(),
						newday.dayoftimetable = $(this).find('DayTT').text(),
						newday.weekoftimetable = $(this).find('WeekYear').text();
						if (newday.weekoftimetable == '')
							newday.weekoftimetable = 0;
						newday.term = $(this).find('TermA').text();
						if (newday.weekofterm == '')
							newday.weekofterm = 0;
						newday.weekofterm = $(this).find('WeekA').text();
						if (newday.weekofterm == '')
							newday.weekofterm = 0;
						days[newday.date.getTime()] = newday;
						// check for mondays
						if (newday.date.getDay() == 1)
						{
							if (weekstarts[newday.weekoftimetable] == undefined || newday.date < weekstarts[newday.weekoftimetable].date)
							{
								weekstarts[newday.weekoftimetable] = newday;
							}
						}
					});
					
					newcalendar.days = days;
					newcalendar.weekstarts = weekstarts;
					
					g_calendar = newcalendar;

					$(document).trigger('calendarloaded', [true]);
				}
				else
				{
					g_newerrors.push('GetCalendar : Unexpected output received from server');
					$(document).trigger('calendarloaded', [false]);
				}
			}
		});
	}
	else
	{
		$(document).trigger('calendarloaded', [true]);
	}
}

function loadNoticesForDate(loginkey, selecteddate) {
	if (g_meeting_notices[getDateWithoutTime(selecteddate).getTime()] == undefined || g_general_notices[getDateWithoutTime(selecteddate).getTime()] == undefined)
	{
		// load the timetable for teacher/year combination
		$.post(s_apiurl, {Key: loginkey, Command: "GetNotices", Date: dateToNZDateString(selecteddate)}, function(data) {
			var errortext = $(data).find('NoticesResults').find('Error').text();
			if (errortext != "")
			{
				g_newerrors.push('GetNotices :' + errortext);
				$(document).trigger('noticesloaded', [false]);
			}
			else
			{
				var noticedate = $(data).find('NoticesResults').find('NoticeDate').text();
				if (noticedate != undefined && noticedate != "")
				{
					var meetings = [];
					$(data).find('MeetingNotices').find('Meeting').each(function(meetingindex){
						var newmeeting = new Object();
						newmeeting.level = $(this).find('Level').text();
						newmeeting.subject = $(this).find('Subject').text();
						newmeeting.message = $(this).find('Body').text();
						newmeeting.teacher = $(this).find('Teacher').text();
						newmeeting.place = $(this).find('PlaceMeet').text();
						newmeeting.date = $(this).find('Date').text();
						newmeeting.datemeet = $(this).find('DateMeet').text();
						newmeeting.timemeet = $(this).find('TimeMeet').text();
						meetings.push(newmeeting);
					});
					var generalnotices = [];
					$(data).find('GeneralNotices').find('General').each(function(noticeindex){
						var newnotice = new Object();
						newnotice.level = $(this).find('Level').text();
						newnotice.subject = $(this).find('Subject').text();
						newnotice.message = $(this).find('Body').text();
						newnotice.teacher = $(this).find('Teacher').text();
						generalnotices.push(newnotice);
					});

					g_meeting_notices[getDateWithoutTime(selecteddate).getTime()] = meetings;
					g_general_notices[getDateWithoutTime(selecteddate).getTime()] = generalnotices;
					
					$(document).trigger('noticesloaded', [true]);
				}
				else
				{
					g_newerrors.push('GetNotices : Unexpected output received from server');
					$(document).trigger('noticesloaded', [false]);
				}
			}
		});
	}
	else
	{
		$(document).trigger('noticesloaded', [true]);
	}
}

function loadEventsForDate(loginkey, date) {
	var startdate = getFirstDayOfMonth(date),
		enddate = getLastDayOfMonth(date);
	if (g_events[date.getMonth()] == undefined)
	{
		// load the timetable for teacher/year combination
		$.post(s_apiurl, {Key: loginkey, Command: "GetEvents", DateStart: dateToNZDateString(startdate), DateFinish: dateToNZDateString(enddate)}, function(data) {
			var errortext = $(data).find('EventsResults').find('Error').text();
			if (errortext != "")
			{
				g_newerrors.push('GetEvents :' + errortext);
				$(document).trigger('eventsloaded', [false]);
			}
			else
			{
				var days = [];
				for (var i = 0; i < enddate.getDate(); i++)
				{
					var newday = new Object();
					newday.date = new Date(enddate.getFullYear(), enddate.getMonth(), i + 1);
					newday.events = [];
					days[i] = newday;
				}
				$(data).find('Events').find('Event').each(function(eventindex){
					var newevent = new Object();
					newevent.title = $(this).find('Title').text();
					newevent.location = $(this).find('Location').text();
					newevent.details = $(this).find('Details').text();
					newevent.priority = $(this).find('Priority').text();
					newevent.colour = $(this).find('Colour').text();
					newevent.datetimeinfo = $(this).find('DateTimeInfo').text();
					newevent.startdate = ISO8601DateStringToDate($(this).find('Start').text());
					newevent.finishdate = ISO8601DateStringToDate($(this).find('Finish').text());

					// double check the end is in sight before beginning loop
					if (newevent.startdate <= newevent.finishdate)
					{
						var startday = 1;
						var endday = 31;
						if (newevent.startdate.getMonth() == date.getMonth() && newevent.startdate.getYear() == date.getYear())
							startday = newevent.startdate.getDate();
						if (newevent.finishdate.getMonth() == date.getMonth() && newevent.finishdate.getYear() == date.getYear())
							endday = newevent.finishdate.getDate();
						for (var i = startday; i <= endday && i <= days.length; i++)
						{
							days[i - 1].events.push(newevent);
						}
					}
				});
				var month = new Object();
				month.days = days;
				g_events[date.getMonth()] = month;
					
				$(document).trigger('eventsloaded', [true]);
			}
		});
	}
	else
	{
		$(document).trigger('eventsloaded', [true]);
	}
}

function loadStudentTimetable(loginkey, studentid, timetableyear) {
	if (g_studenttimetable == undefined || g_studenttimetable.studentid != studentid || g_studenttimetable.timetableyear != timetableyear + 'TT')
	{
		// load the timetable for student/year combination
		$.post(s_apiurl, {Key: loginkey, Command: "GetStudentTimetable", StudentID: studentid, Grid: timetableyear + 'TT'}, function(data) {
			var errortext = $(data).find('StudentTimetableResults').find('Error').text();
			if (errortext != "")
			{
				g_newerrors.push('GetStudentTimetable :' + errortext);
				$(document).trigger('studenttimetableloaded', [false]);
			}
			else
			{
				var student = $(data).find('StudentTimetableResults').find('Students').find('Student'),
					timetableyear = $(data).find('StudentTimetableResults').find('TTGrid').text();
				if (timetableyear != undefined && timetableyear != "")
				{
					if (student.length == 1)
					{
						// good to go, start building timetable object
						var newtimetable = new Object();
					
						newtimetable.timetableyear = timetableyear;
						newtimetable.studentid = student.find('IDNumber').text();
						newtimetable.yearlevel = student.find('Level').text();
						newtimetable.tutor = student.find('Tutor').text();
					
						var weeks = [];
						student.find('TimetableData').children().each(function(weekindex){
							var days = [];
							$(this).children().each(function(dayindex){
								var daycomponents = $(this).text().split('|');
								var periods = [];
								$(daycomponents.slice(1, -1)).each(function(periodindex){
									// each period
									var periodcomponents = this.split('~');
									var subjects = [];
									$(periodcomponents).each(function(subjectindex){
										var subjectcomponents = this.split('-');
										if (subjectcomponents[2] != undefined)
										{
											var newsubject = new Object();
											newsubject.gridtype = subjectcomponents[0];
											newsubject.lineidentifier = subjectcomponents[1];
											newsubject.subjectcode = subjectcomponents[2];
											newsubject.teachercode = subjectcomponents[3];
											newsubject.roomcode = subjectcomponents[4];
									
											subjects[subjectindex] = newsubject;
										}
									});
									var newperiod = new Object();
									newperiod.subjects = subjects;
								
									periods[periodindex] = newperiod;
								});
								var newday = new Object();
								newday.periods = periods;

								var calendarcomponents = daycomponents[0].split('-');
								newday.term = calendarcomponents[0];
								newday.openstatus = calendarcomponents[1];
								newday.cycleday = calendarcomponents[2];
							
								days[dayindex] = newday;
							});
							var newweek = new Object();
							newweek.days = days;
							
							weeks[weekindex] = newweek;
						});
						newtimetable.weeks = weeks;
					
						g_studenttimetable = newtimetable;
					}

					$(document).trigger('studenttimetableloaded', [true]);
				}
				else
				{
					g_newerrors.push('GetStudentTimetable : Unexpected output received from server');
					$(document).trigger('studenttimetableloaded', [false]);
				}
			}
		});
	}
	else
	{
		$(document).trigger('studenttimetableloaded', [true]);
	}
}

function loadStudentAttendance(loginkey, studentid, timetableyear) {
	if (g_studentattendance == undefined || g_studentattendance.studentid != studentid || g_studentattendance.timetableyear != timetableyear + 'TT')
	{
		// load the attendance data for student
		$.post(s_apiurl, {Key: loginkey, Command: "GetStudentAttendance", StudentID: studentid, Grid: timetableyear + 'TT'}, function(data) {
			var errortext = $(data).find('StudentAttendanceResults').find('Error').text();
			if (errortext != "")
			{
				g_newerrors.push('GetStudentAttendance :' + errortext);
				$(document).trigger('studentattendanceloaded', [false]);
			}
			else
			{
				// good to go, start building attendance object
				var newattendance = new Object();
					
				newattendance.timetableyear = timetableyear + 'TT';
				newattendance.studentid = studentid;

				var weeks = new Object();
				$(data).find('StudentAttendanceResults').find('Weeks').find('Week').each(function(index){
					var weekstart = ISO8601DateStringToDate($(this).find('WeekStart').text());
					var days = [];
					$(this).find('Days').find('Day').each(function(dayindex){
						var newday = new Object();
						newday.checklist = $(this).text();
							
						days[dayindex] = newday;
					});
					var newweek = new Object();
					newweek.days = days;
					newweek.weekstart = weekstart;
							
					weeks[newweek.weekstart.getTime()] = newweek;
				});
				newattendance.weeks = weeks;
				
				g_studentattendance = newattendance;

				$(document).trigger('studentattendanceloaded', [true]);
			}
		});
	}
	else
	{
		$(document).trigger('studentattendanceloaded', [true]);
	}
}

function loadStudentAttendanceStats(loginkey, studentid, timetableyear) {
	if (g_studentattendancestats == undefined || g_studentattendancestats.studentid != studentid || g_studentattendancestats.timetableyear != timetableyear + 'TT')
	{
		// load the attendance data for student
		$.post(s_apiurl, {Key: loginkey, Command: "GetStudentAbsenceStats", StudentID: studentid, Grid: timetableyear + 'TT'}, function(data) {
			var errortext = $(data).find('StudentAbsenceStatsResults').find('Error').text();
			if (errortext != "")
			{
				g_newerrors.push('GetStudentAbsenceStats :' + errortext);
				$(document).trigger('studentattendancestatsloaded', [false]);
			}
			else
			{
				var student = $(data).find('StudentAbsenceStatsResults').find('Students').find('Student');
				
				if (student.length == 1)
				{
					// good to go, start building attendance object
					var newattendancestats = new Object();
					
					newattendancestats.timetableyear = timetableyear + 'TT';
					newattendancestats.studentid = studentid;
					newattendancestats.attendancestatshalfdaysjustified = student.find('HalfDaysJ').text(),
					newattendancestats.attendancestatshalfdaysunjustified = student.find('HalfDaysU').text(),
					newattendancestats.attendancestatshalfdaysoverseas = student.find('HalfDaysO').text(),
					newattendancestats.attendancestatshalfdaystotal = student.find('HalfDaysT').text(),
					newattendancestats.attendancestatshalfdaysopen = student.find('HalfDaysOpen').text(),
					newattendancestats.attendancestatsfulldaysjustified = student.find('FullDaysJ').text(),
					newattendancestats.attendancestatsfulldaysunjustified = student.find('FullDaysU').text(),
					newattendancestats.attendancestatsfulldaysoverseas = student.find('FullDaysO').text(),
					newattendancestats.attendancestatsfulldaystotal = student.find('FullDaysT').text(),
					newattendancestats.attendancestatsfulldaysopen = student.find('FullDaysOpen').text(),
					newattendancestats.attendancestatspercentagejustified = student.find('PctgeJ').text(),
					newattendancestats.attendancestatspercentageunjustified = student.find('PctgeU').text(),
					newattendancestats.attendancestatspercentageoverseas = student.find('PctgeO').text(),
					newattendancestats.attendancestatspercentagetotal = student.find('PctgeT').text(),
					newattendancestats.attendancestatspercentagepresent = student.find('PctgeP').text();
				
					g_studentattendancestats = newattendancestats;

					$(document).trigger('studentattendancestatsloaded', [true]);
				}
				else
				{
					$(document).trigger('studentattendancestatsloaded', [false]);
				}
			}
		});
	}
	else
	{
		$(document).trigger('studentattendancestatsloaded', [true]);
	}
}

function loadStudentResults(loginkey, studentid) {
	if (g_studentresults == undefined || g_studentresults.studentid != studentid)
	{
		// load the results for the student
		$.post(s_apiurl, {Key: loginkey, Command: "GetStudentResults", StudentID: studentid}, function(data) {
			var errortext = $(data).find('StudentResultsResults').find('Error').text();
			if (errortext != "")
			{
				g_newerrors.push('GetStudentResults :' + errortext);
				$(document).trigger('studentresultsloaded', [false]);
			}
			else
			{
				// good to go, start building results object
				var newresults = new Object();

				newresults.studentid = studentid;

				var levels = new Object();
				$(data).find('StudentResultsResults').find('ResultLevels').find('ResultLevel').each(function(index){
					var ncealevel = $(this).find('NCEALevel').text();
					var results = [];
					$(this).find('Results').find('Result').each(function(resultindex){
						var newresult = new Object();
						newresult.number = $(this).find('Number').text();
						newresult.version = $(this).find('Version').text();
						newresult.grade = $(this).find('Grade').text();
						newresult.title = $(this).find('Title').text();
						newresult.subfield = $(this).find('SubField').text();
						newresult.credits = $(this).find('Credits').text();
						newresult.creditspassed = $(this).find('CreditsPassed').text();
						newresult.resultpublished = $(this).find('ResultPublished').text();
						
						results[resultindex] = newresult;
					});
					var newlevel = new Object();
					newlevel.ncealevel = ncealevel;
					newlevel.results = results;
					
					levels[ncealevel] = newlevel;
				});
				newresults.levels = levels;
				
				g_studentresults = newresults;

				$(document).trigger('studentresultsloaded', [true]);
			}
		});
	}
	else
	{
		$(document).trigger('studentresultsloaded', [true]);
	}
}

function loadStudentNCEASummary(loginkey, studentid) {
	if (g_studentnceasummary == undefined || g_studentnceasummary.studentid != studentid)
	{
		// load the results for the student
		$.post(s_apiurl, {Key: loginkey, Command: "GetStudentNCEASummary", StudentID: studentid}, function(data) {
			var errortext = $(data).find('StudentNCEASummaryResults').find('Error').text();
			if (errortext != "")
			{
				g_newerrors.push('GetStudentNCEASummary :' + errortext);
				$(document).trigger('studentncealoaded', [false]);
			}
			else
			{
				// good to go, start building ncea summary object
				var newnceasummary = new Object();

				newnceasummary.studentid = studentid;

				var student = $(data).find('StudentNCEASummaryResults').find('Students').find('Student');
				if (student.length == 1)
				{
					newnceasummary.ncealevel1 = student.find('NCEA').find('L1NCEA').text();
					newnceasummary.ncealevel2 = student.find('NCEA').find('L2NCEA').text();
					newnceasummary.ncealevel3 = student.find('NCEA').find('L3NCEA').text();
					newnceasummary.level1literacy = student.find('NCEA').find('L1Literacy').text();

					newnceasummary.ueliteracy = student.find('NCEA').find('NCEAUELIT').text();
					newnceasummary.l1literacy = student.find('NCEA').find('NCEAL1LIT').text();
					newnceasummary.numeracy = student.find('NCEA').find('NCEANUM').text();
					
					newnceasummary.creditsbytype = new Object();
					
					newnceasummary.creditsbytype.internal = new Object();
					newnceasummary.creditsbytype.internal.na = student.find('CreditsInternal').find('NotAchieved').text();
					newnceasummary.creditsbytype.internal.a = student.find('CreditsInternal').find('Achieved').text();
					newnceasummary.creditsbytype.internal.m = student.find('CreditsInternal').find('Merit').text();
					newnceasummary.creditsbytype.internal.e = student.find('CreditsInternal').find('Excellence').text();
					newnceasummary.creditsbytype.internal.total = student.find('CreditsInternal').find('Total').text();
					newnceasummary.creditsbytype.internal.attempted = student.find('CreditsInternal').find('Attempted').text();
					
					newnceasummary.creditsbytype.external = new Object();
					newnceasummary.creditsbytype.external.na = student.find('CreditsExternal').find('NotAchieved').text();
					newnceasummary.creditsbytype.external.a = student.find('CreditsExternal').find('Achieved').text();
					newnceasummary.creditsbytype.external.m = student.find('CreditsExternal').find('Merit').text();
					newnceasummary.creditsbytype.external.e = student.find('CreditsExternal').find('Excellence').text();
					newnceasummary.creditsbytype.external.total = student.find('CreditsExternal').find('Total').text();
					newnceasummary.creditsbytype.external.attempted = student.find('CreditsExternal').find('Attempted').text();
					
					newnceasummary.creditsbytype.total = new Object();
					newnceasummary.creditsbytype.total.na = student.find('CreditsTotal').find('NotAchieved').text();
					newnceasummary.creditsbytype.total.a = student.find('CreditsTotal').find('Achieved').text();
					newnceasummary.creditsbytype.total.m = student.find('CreditsTotal').find('Merit').text();
					newnceasummary.creditsbytype.total.e = student.find('CreditsTotal').find('Excellence').text();
					newnceasummary.creditsbytype.total.total = student.find('CreditsTotal').find('Total').text();
					newnceasummary.creditsbytype.total.attempted = student.find('CreditsTotal').find('Attempted').text();
					
					newnceasummary.creditsbylevel = new Object();
					student.find('LevelTotals').find('LevelTotal').each(function(){
						var level = $(this).find('Level').text();
						if (level != '')
						{
							newnceasummary.creditsbylevel[level] = new Object();
							newnceasummary.creditsbylevel[level].na = $(this).find('NotAchieved').text();
							newnceasummary.creditsbylevel[level].a = $(this).find('Achieved').text();
							newnceasummary.creditsbylevel[level].m = $(this).find('Merit').text();
							newnceasummary.creditsbylevel[level].e = $(this).find('Excellence').text();
							newnceasummary.creditsbylevel[level].total = $(this).find('Total').text();
							newnceasummary.creditsbylevel[level].attempted = $(this).find('Attempted').text();
						}
					});
					
					newnceasummary.creditsbyyear = new Object();
					student.find('YearTotals').find('YearTotal').each(function(){
						var year = $(this).find('Year').text();
						if (year != '')
						{
							newnceasummary.creditsbyyear[year] = new Object();
							newnceasummary.creditsbyyear[year].na = $(this).find('NotAchieved').text();
							newnceasummary.creditsbyyear[year].a = $(this).find('Achieved').text();
							newnceasummary.creditsbyyear[year].m = $(this).find('Merit').text();
							newnceasummary.creditsbyyear[year].e = $(this).find('Excellence').text();
							newnceasummary.creditsbyyear[year].total = $(this).find('Total').text();
							newnceasummary.creditsbyyear[year].attempted = $(this).find('Attempted').text();
						}
					});
				}
				
				g_studentnceasummary = newnceasummary;

				$(document).trigger('studentncealoaded', [true]);
			}
		});
	}
	else
	{
		$(document).trigger('studentncealoaded', [true]);
	}
}

function loadStudentQualifications(loginkey, studentid) {
	if (g_studentqualifications == undefined || g_studentqualifications.studentid != studentid)
	{
		// load the results for the student
		$.post(s_apiurl, {Key: loginkey, Command: "GetStudentOfficialResults", StudentID: studentid}, function(data) {
			var errortext = $(data).find('StudentOfficialResultsResults').find('Error').text();
			if (errortext != "")
			{
				g_newerrors.push('GetStudentOfficialResults :' + errortext);
				$(document).trigger('studentqualificationsloaded', [false]);
			}
			else
			{
				// good to go, start building qualifications object
				var newqualifications = new Object();

				newqualifications.studentid = studentid;

				var types = new Object();
				$(data).find('StudentOfficialResultsResults').find('Types').find('Type').each(function(index){
					var typecode = $(this).find('TypeCode').text();
					var qualifications = [];
					$(this).find('Qualifications').find('Qualification').each(function(qualificationindex){
						var newqualification = new Object();
						newqualification.year = $(this).find('Year').text();
						newqualification.reference = $(this).find('Ref').text();
						newqualification.endorse = $(this).find('Endorse').text();
						newqualification.level = $(this).find('Level').text();
						newqualification.title = $(this).find('Title').text();
						
						qualifications[qualificationindex] = newqualification;
					});
					var newtype = new Object();
					newtype.typecode = typecode;
					newtype.qualifications = qualifications;
					
					types[typecode] = newtype;
				});
				newqualifications.types = types;
				
				g_studentqualifications = newqualifications;

				$(document).trigger('studentqualificationsloaded', [true]);
			}
		});
	}
	else
	{
		$(document).trigger('studentqualificationsloaded', [true]);
	}
}

function loadStudentGroups(loginkey, studentid) {
	if (g_studentgroups == undefined || g_studentgroups.studentid != studentid)
	{
		// load the groups for the student
		$.post(s_apiurl, {Key: loginkey, Command: "GetStudentGroups", StudentID: studentid}, function(data) {
			var errortext = $(data).find('StudentGroupsResults').find('Error').text();
			if (errortext != "")
			{
				g_newerrors.push('GetStudentGroups :' + errortext);
				$(document).trigger('studentgroupsloaded', [false]);
			}
			else
			{
				// good to go, start building groups object
				var newgroups = new Object();

				newgroups.studentid = studentid;

				var groupsbyyear = new Object();
				$(data).find('StudentGroupsResults').find('Years').find('Year').each(function(index){
					var grid = $(this).find('Grid').text();
					var groups = [];
					$(this).find('Groups').find('Group').each(function(groupindex){
						var newgroup = new Object();
						newgroup.name = $(this).find('Name').text();
						newgroup.teacher = $(this).find('Teacher').text();
						newgroup.comment = $(this).find('Comment').text();
						newgroup.groupcomment = $(this).find('GroupComment').text();
						
						groups[groupindex] = newgroup;
					});
					var newyear = new Object();
					newyear.grid = grid;
					newyear.groups = groups;
					
					groupsbyyear[parseInt(grid)] = newyear;
				});
				newgroups.groupsbyyear = groupsbyyear;
				
				g_studentgroups = newgroups;

				$(document).trigger('studentgroupsloaded', [true]);
			}
		});
	}
	else
	{
		$(document).trigger('studentgroupsloaded', [true]);
	}
}

function loadStudentAwards(loginkey, studentid) {
	if (g_studentawards == undefined || g_studentawards.studentid != studentid)
	{
		// load the awards for the student
		$.post(s_apiurl, {Key: loginkey, Command: "GetStudentAwards", StudentID: studentid}, function(data) {
			var errortext = $(data).find('StudentAwardsResults').find('Error').text();
			if (errortext != "")
			{
				g_newerrors.push('GetStudentAwards :' + errortext);
				$(document).trigger('studentawardsloaded', [false]);
			}
			else
			{
				// good to go, start building awards object
				var newawards = new Object();

				newawards.studentid = studentid;

				var awardsbyyear = new Object();
				$(data).find('StudentAwardsResults').find('Years').find('Year').each(function(index){
					var grid = $(this).find('Grid').text();
					var awards = [];
					$(this).find('Awards').find('Award').each(function(awardindex){
						var newaward = new Object();
						newaward.title = $(this).find('Title').text();
						newaward.teacher = $(this).find('Teacher').text();
						newaward.details = $(this).find('Details').text();
						
						awards[awardindex] = newaward;
					});
					var newyear = new Object();
					newyear.grid = grid;
					newyear.awards = awards;
					
					awardsbyyear[parseInt(grid)] = newyear;
				});
				newawards.awardsbyyear = awardsbyyear;
				
				g_studentawards = newawards;

				$(document).trigger('studentawardsloaded', [true]);
			}
		});
	}
	else
	{
		$(document).trigger('studentawardsloaded', [true]);
	}
}

function loadStudentPastoral(loginkey, studentid) {
	if (g_studentpastoral == undefined || g_studentpastoral.studentid != studentid)
	{
		// load the pastoral for the student
		$.post(s_apiurl, {Key: loginkey, Command: "GetStudentPastoral", StudentID: studentid}, function(data) {
			var errortext = $(data).find('StudentPastoralResults').find('Error').text();
			if (errortext != "")
			{
				g_newerrors.push('GetStudentPastoral :' + errortext);
				$(document).trigger('studentpastoralloaded', [false]);
			}
			else
			{
				// good to go, start building pastoral object
				var newpastoral = new Object();

				newpastoral.studentid = studentid;

				var incidents = [];
				$(data).find('StudentPastoralResults').find('Incidents').find('Incident').each(function(incidentindex){
					var newincident = new Object();
					newincident.typecode = $(this).find('Type').text();
					newincident.number = $(this).find('Number').text();
					newincident.date = $(this).find('Date').text();
					newincident.teacher = $(this).find('Teacher').text();
					newincident.reason = $(this).find('Reason').text();
					newincident.action1 = $(this).find('Action1').text();
					newincident.action2 = $(this).find('Action2').text();
					newincident.action3 = $(this).find('Action3').text();
					newincident.action4 = $(this).find('Action4').text();
					newincident.points = $(this).find('Points').text();
					var actions = [];
					if (newincident.action1 != '')
						actions.push(newincident.action1);
					if (newincident.action2 != '')
						actions.push(newincident.action2);
					if (newincident.action3 != '')
						actions.push(newincident.action3);
					if (newincident.action4 != '')
						actions.push(newincident.action4);
					newincident.actions = actions;
						
					incidents[incidentindex] = newincident;
				});
				newpastoral.incidents = incidents;
				
				g_studentpastoral = newpastoral;

				$(document).trigger('studentpastoralloaded', [true]);
			}
		});
	}
	else
	{
		$(document).trigger('studentpastoralloaded', [true]);
	}
}

function loadStaffTimetable(loginkey, teachercode, timetableyear) {
	if (g_teachertimetable == undefined || g_teachertimetable.teachercode != teachercode || g_teachertimetable.timetableyear != timetableyear + 'TT')
	{
		// load the timetable for teacher/year combination
		$.post(s_apiurl, {Key: loginkey, Command: "GetTeacherTimetable", Tchr: teachercode, Grid: timetableyear + 'TT'}, function(data) {
			var errortext = $(data).find('TeacherTimetableResults').find('Error').text();
			if (errortext != "")
			{
				g_newerrors.push('GetTeacherTimetable :' + errortext);
				$(document).trigger('teachertimetableloaded', [false]);
			}
			else
			{
				var teacher = $(data).find('TeacherTimetableResults').find('Teachers').find('Teacher'),
					timetableyear = $(data).find('TeacherTimetableResults').find('TTGrid').text();
				if (timetableyear != undefined && timetableyear != "" && teacher.length == 1)
				{
					// good to go, start building timetable object
					var newtimetable = new Object();
					
					newtimetable.timetableyear = timetableyear;
					newtimetable.teachercode = teacher.find('Tchr').text();
					newtimetable.teachertutor = teacher.find('Tutor').text();
					
					var weeks = [];
					teacher.find('TimetableData').children().each(function(weekindex){
						var days = [];
						$(this).children().each(function(dayindex){
							var daycomponents = $(this).text().split('|');
							var periods = [];
							$(daycomponents.slice(1, -1)).each(function(periodindex){
								// each period
								var periodcomponents = this.split('~');
								var subjects = [];
								$(periodcomponents).each(function(subjectindex){
									var subjectcomponents = this.split('-');
									if (subjectcomponents[2] != undefined)
									{
										var newsubject = new Object();
										newsubject.gridtype = subjectcomponents[0];
										newsubject.lineidentifier = subjectcomponents[1];
										newsubject.subjectcode = subjectcomponents[2];
										newsubject.teachercode = subjectcomponents[3];
										newsubject.roomcode = subjectcomponents[4];
									
										subjects[subjectindex] = newsubject;
									}
								});
								var newperiod = new Object();
								newperiod.subjects = subjects;
								
								periods[periodindex] = newperiod;
							});
							var newday = new Object();
							newday.periods = periods;

							var calendarcomponents = daycomponents[0].split('-');
							newday.term = calendarcomponents[0];
							newday.openstatus = calendarcomponents[1];
							newday.cycleday = calendarcomponents[2];
							
							days[dayindex] = newday;
						});
						var newweek = new Object();
						newweek.days = days;
							
						weeks[weekindex] = newweek;
					});
					newtimetable.weeks = weeks;
					
					g_teachertimetable = newtimetable;

					$(document).trigger('teachertimetableloaded', [true]);
				}
				else if (timetableyear != undefined && timetableyear != "" && teacher.length == 0)
				{
					// fallback to blank timetable
					var newtimetable = new Object();
					newtimetable.timetableyear = timetableyear;
					g_teachertimetable = newtimetable;

					$(document).trigger('teachertimetableloaded', [true]);
				}
				else
				{
					g_newerrors.push('GetTeacherTimetable : Unexpected output received from server');
					$(document).trigger('teachertimetableloaded', [false]);
				}
			}
		});
	}
	else
	{
		$(document).trigger('teachertimetableloaded', [true]);
	}
}

function loadAttendanceChecklist(loginkey, teachercode, timetableyear) {
	if (g_teacherattendancechecklist == undefined || !g_teacherattendancechecklist.valid || g_teacherattendancechecklist.teachercode != teachercode || g_teacherattendancechecklist.timetableyear != timetableyear + 'TT')
	{
		// load the timetable for teacher/year combination
		$.post(s_apiurl, {Key: loginkey, Command: "GetTeacherAbsLog", Tchr: teachercode, Grid: timetableyear + 'TT'}, function(data) {
			var errortext = $(data).find('TeacherAbsLogResults').find('Error').text();
			if (errortext != "")
			{
				g_newerrors.push('GetTeacherAbsLog :' + errortext);
				$(document).trigger('teacherattendancechecklistloaded',[false]);
			}
			else
			{
				var teachercode = $(data).find('TeacherAbsLogResults').find('Tchr').text(),
					timetableyear = $(data).find('TeacherAbsLogResults').find('TTGrid').text();
				if (timetableyear != undefined && timetableyear != "" && teachercode != undefined && teachercode != "" )
				{
					// good to go, start building checklist object
					var newattendancechecklist = new Object();

					newattendancechecklist.valid = true;
					newattendancechecklist.timetableyear = timetableyear;
					newattendancechecklist.teachercode = teachercode;
					
					var weeks = new Object();
					$(data).find('TeacherAbsLogResults').find('Weeks').find('Week').each(function(weekindex){
						var weekstart = ISO8601DateStringToDate($(this).find('WeekStart').text());
						var days = [];
						$(this).find('Days').find('Day').each(function(dayindex){
							var newday = new Object();
							newday.checklist = $(this).text();
							
							days[dayindex] = newday;
						});
						var newweek = new Object();
						newweek.days = days;
						newweek.weekstart = weekstart;
							
						weeks[newweek.weekstart.getTime()] = newweek;
					});
					newattendancechecklist.weeks = weeks;
					
					g_teacherattendancechecklist = newattendancechecklist;

					$(document).trigger('teacherattendancechecklistloaded',[true]);
				}
				else
				{
					g_newerrors.push('GetTeacherAbsLog : Unexpected output received from server');
					$(document).trigger('teacherattendancechecklistloaded',[false]);
				}
			}
		});
	}
	else
	{
		$(document).trigger('teacherattendancechecklistloaded',[true]);
	}
}

function performStudentSearch(loginkey, searchtext) {
	// check if the current results are already what we are after
	if (searchtext != '' && searchtext != g_studentsearchtext)
	{
		$.post(s_apiurl, {Key: loginkey, Command: "SearchStudents", Criteria: searchtext}, function(data) {
			var errortext = $(data).find('SearchStudentsResults').find('Error').text();
			if (errortext != "")
			{
				g_newerrors.push('SearchStudents : ' + errortext);
				$(document).trigger('studentsearchperformed', [false]);
			}
			else
			{
				g_studentsearchresults = [];
				$(data).find('SearchStudentsResults').find('Students').find('Student').each(function(index){
					var resultcomponents = $(this).text();
					resultcomponents = resultcomponents.split('|');
					if (resultcomponents.length == 4)
					{
						var newstudentresult = new Object();
						newstudentresult.studentid = resultcomponents[0];
						newstudentresult.name = resultcomponents[1];
						newstudentresult.yearlevel = resultcomponents[2];
						newstudentresult.tutor = resultcomponents[3];
						newstudentresult.extendeddetails = false;
						
						g_studentsearchresults.push(newstudentresult);
					}
				});
				
				g_studentsearchtext = searchtext;
			}
	
			$(document).trigger('studentsearchperformed', [true]);
		});
	}
	else
	{
		$(document).trigger('studentsearchperformed', [true]);
	}
}

function performStaffSearch(loginkey, searchtext) {
	// check if the current results are already what we are after
	if (searchtext != '' && searchtext != g_staffsearchtext)
	{
		$.post(s_apiurl, {Key: loginkey, Command: "SearchUsers", Criteria: searchtext}, function(data) {
			var errortext = $(data).find('SearchUsersResults').find('Error').text();
			if (errortext != "")
			{
				g_newerrors.push('SearchUsers : ' + errortext);
				$(document).trigger('staffsearchperformed', [false]);
			}
			else
			{
				g_staffsearchresults = [];
				$(data).find('SearchUsersResults').find('StaffUsers').find('User').each(function(index){
					var resultcomponents = $(this).text();
					resultcomponents = resultcomponents.split('|');
					if (resultcomponents.length == 3)
					{
						var newstaffresult = new Object();
						newstaffresult.teachercode = resultcomponents[0];
						newstaffresult.name = resultcomponents[1];
						newstaffresult.tutor = resultcomponents[2];
						newstaffresult.extendeddetails = false;
						
						g_staffsearchresults.push(newstaffresult);
					}
				});
				
				g_staffsearchtext = searchtext;
			}
	
			$(document).trigger('staffsearchperformed', [true]);
		});
	}
	else
	{
		$(document).trigger('staffsearchperformed', [true]);
	}
}

function loadExtendedDetailsForStudent(loginkey, selectedstudent) {
	if (selectedstudent != undefined && selectedstudent.studentid != '' && (selectedstudent.extendeddetails == undefined || selectedstudent.extendeddetails == false))
	{
		$.post(s_apiurl, {Key: loginkey, Command: "GetStudentDetails", StudentID: selectedstudent.studentid}, function(data) {
			var errortext = $(data).find('StudentDetailsResults').find('Error').text();
			if (errortext != "")
			{
				g_newerrors.push('GetStudentDetails : ' + errortext);
				$(document).trigger('extendedstudentdetailsloaded', [false]);
			}
			else
			{
				var studentuser = $(data).find('StudentDetailsResults').find('Student');
				if (studentuser.length == 1)
				{
					if (studentuser.find('StudentID').length)
						selectedstudent.studentid = studentuser.find('StudentID').text();
					else
						selectedstudent.studentid = '';
					if (studentuser.find('FirstName').length)
						selectedstudent.firstname = studentuser.find('FirstName').text();
					else
						selectedstudent.firstname = '';
					if (studentuser.find('ForeNames').length)
						selectedstudent.forenames = studentuser.find('ForeNames').text();
					else
						selectedstudent.forenames = '';
					if (studentuser.find('LastName').length)
						selectedstudent.lastname = studentuser.find('LastName').text();
					else
						selectedstudent.lastname = '';
					if (studentuser.find('FirstNameLegal').length)
						selectedstudent.legalfirstname = studentuser.find('FirstNameLegal').text();
					else
						selectedstudent.legalfirstname = '';
					if (studentuser.find('ForeNamesLegal').length)
						selectedstudent.legalforenames = studentuser.find('ForeNamesLegal').text();
					else
						selectedstudent.legalforenames = '';
					if (studentuser.find('LastNameLegal').length)
						selectedstudent.legallastname = studentuser.find('LastNameLegal').text();
					else
						selectedstudent.legallastname = '';
					if (studentuser.find('Gender').length)
						selectedstudent.gender = studentuser.find('Gender').text();
					else
						selectedstudent.gender = '';
					if (studentuser.find('Ethnicity').length)
						selectedstudent.ethnicity = studentuser.find('Ethnicity').text();
					else
						selectedstudent.ethnicity = '';
					if (studentuser.find('DateBirth').length)
						selectedstudent.dateofbirth = studentuser.find('DateBirth').text();
					else
						selectedstudent.dateofbirth = '';
					if (studentuser.find('Age').length)
						selectedstudent.age = studentuser.find('Age').text();
					else
						selectedstudent.age = '';
					if (studentuser.find('LevelStored').length)
						selectedstudent.yearlevel = studentuser.find('LevelStored').text();
					else
						selectedstudent.yearlevel = '';
					if (studentuser.find('TutorStored').length)
						selectedstudent.tutor = studentuser.find('TutorStored').text();
					else
						selectedstudent.tutor = '';
					if (studentuser.find('NSN').length)
						selectedstudent.nsn = studentuser.find('NSN').text();
					else
						selectedstudent.nsn = '';
						
					/* Residence Fields */
					var parentA = new Object();
					if (studentuser.find('HomePhone').length)
						parentA.homephone = studentuser.find('HomePhone').text();
					else
						parentA.homephone = '';
					if (studentuser.find('HomeAddress').length)
						parentA.homeaddress = studentuser.find('HomeAddress').text();
					else
						parentA.homeaddress = '';
					if (studentuser.find('ParentTitle').length)
						parentA.parenttitle = studentuser.find('ParentTitle').text();
					else
						parentA.parenttitle = '';
					if (studentuser.find('ParentSalutation').length)
						parentA.parentsalutation = studentuser.find('ParentSalutation').text();
					else
						parentA.parentsalutation = '';
					if (studentuser.find('ParentEmail').length)
						parentA.parentemail = studentuser.find('ParentEmail').text();
					else
						parentA.parentemail = '';
					selectedstudent.parentA = parentA;
					
					var parentB = new Object();
					if (studentuser.find('HomePhoneB').length)
						parentB.homephone = studentuser.find('HomePhoneB').text();
					else
						parentB.homephone = '';
					if (studentuser.find('HomeAddressB').length)
						parentB.homeaddress = studentuser.find('HomeAddressB').text();
					else
						parentB.homeaddress = '';
					if (studentuser.find('ParentTitleB').length)
						parentB.parenttitle = studentuser.find('ParentTitleB').text();
					else
						parentB.parenttitle = '';
					if (studentuser.find('ParentSalutationB').length)
						parentB.parentsalutation = studentuser.find('ParentSalutationB').text();
					else
						parentB.parentsalutation = '';
					if (studentuser.find('ParentEmailB').length)
						parentB.parentemail = studentuser.find('ParentEmailB').text();
					else
						parentB.parentemail = '';
					selectedstudent.parentB = parentB;
					
					/* Health Fields */
					if (studentuser.find('DoctorName').length)
						selectedstudent.doctorname = studentuser.find('DoctorName').text();
					else
						selectedstudent.doctorname = '';
					if (studentuser.find('DoctorPhone').length)
						selectedstudent.doctorphone = studentuser.find('DoctorPhone').text();
					else
						selectedstudent.doctorphone = '';
					if (studentuser.find('DoctorAddress').length)
						selectedstudent.doctoraddress = studentuser.find('DoctorAddress').text();
					else
						selectedstudent.doctoraddress = '';
					if (studentuser.find('DentistName').length)
						selectedstudent.dentistname = studentuser.find('DentistName').text();
					else
						selectedstudent.dentistname = '';
					if (studentuser.find('DentistPhone').length)
						selectedstudent.dentistphone = studentuser.find('DentistPhone').text();
					else
						selectedstudent.dentistphone = '';
					if (studentuser.find('DentistAddress').length)
						selectedstudent.dentistaddress = studentuser.find('DentistAddress').text();
					else
						selectedstudent.dentistaddress = '';
					if (studentuser.find('AllowedPanadol').length)
						selectedstudent.allowedpanadol = studentuser.find('AllowedPanadol').text();
					else
						selectedstudent.allowedpanadol = '';
					if (studentuser.find('HealthFlag').length)
						selectedstudent.healthflag = studentuser.find('HealthFlag').text();
					else
						selectedstudent.healthflag = '';
					if (studentuser.find('Allergies').length)
						selectedstudent.allergies = studentuser.find('Allergies').text();
					else
						selectedstudent.allergies = '';
					if (studentuser.find('Reactions').length)
						selectedstudent.reactions = studentuser.find('Reactions').text();
					else
						selectedstudent.reactions = '';
					if (studentuser.find('Vaccinations').length)
						selectedstudent.vaccinations = studentuser.find('Vaccinations').text();
					else
						selectedstudent.vaccinations = '';
					if (studentuser.find('SpecialCircumstances').length)
						selectedstudent.specialcircumstances = studentuser.find('SpecialCircumstances').text();
					else
						selectedstudent.specialcircumstances = '';
					
					/* Health Fields */
					if (studentuser.find('GeneralNotes').length)
						selectedstudent.notes = studentuser.find('GeneralNotes').text();
					else
						selectedstudent.notes = '';
					if (studentuser.find('HealthNotes').length)
						selectedstudent.healthnotes = studentuser.find('HealthNotes').text();
					else
						selectedstudent.healthnotes = '';
					
					/* Caregiver Fields */
					var caregiverone = new Object();
					if (studentuser.find('MotherRelation').length)
						caregiverone.relationship = studentuser.find('MotherRelation').text();
					else
						caregiverone.relationship = '';
					if (studentuser.find('MotherName').length)
						caregiverone.name = studentuser.find('MotherName').text();
					else
						caregiverone.name = '';
					if (studentuser.find('MotherStatus').length)
						caregiverone.status = studentuser.find('MotherStatus').text();
					else
						caregiverone.status = '';
					if (studentuser.find('MotherEmail').length)
						caregiverone.email = studentuser.find('MotherEmail').text();
					else
						caregiverone.email = '';
					if (studentuser.find('MotherPhoneHome').length)
						caregiverone.phonehome = studentuser.find('MotherPhoneHome').text();
					else
						caregiverone.phonehome = '';
					if (studentuser.find('MotherPhoneCell').length)
						caregiverone.phonecell = studentuser.find('MotherPhoneCell').text();
					else
						caregiverone.phonecell = '';
					if (studentuser.find('MotherPhoneWork').length)
						caregiverone.phonework = studentuser.find('MotherPhoneWork').text();
					else
						caregiverone.phonework = '';
					if (studentuser.find('MotherPhoneExtn').length)
						caregiverone.phoneextension = studentuser.find('MotherPhoneExtn').text();
					else
						caregiverone.phoneextension = '';
					if (studentuser.find('MotherOccupation').length)
						caregiverone.occupation = studentuser.find('MotherOccupation').text();
					else
						caregiverone.occupation = '';
					if (studentuser.find('MotherWorkAddress').length)
						caregiverone.workaddress = studentuser.find('MotherWorkAddress').text();
					else
						caregiverone.workaddress = '';
					if (studentuser.find('MotherNotes').length)
						caregiverone.notes = studentuser.find('MotherNotes').text();
					else
						caregiverone.notes = '';
					selectedstudent.caregiverone = caregiverone;
					
					var caregivertwo = new Object();
					if (studentuser.find('FatherRelation').length)
						caregivertwo.relationship = studentuser.find('FatherRelation').text();
					else
						caregivertwo.relationship = '';
					if (studentuser.find('FatherName').length)
						caregivertwo.name = studentuser.find('FatherName').text();
					else
						caregivertwo.name = '';
					if (studentuser.find('FatherStatus').length)
						caregivertwo.status = studentuser.find('FatherStatus').text();
					else
						caregivertwo.status = '';
					if (studentuser.find('FatherEmail').length)
						caregivertwo.email = studentuser.find('FatherEmail').text();
					else
						caregivertwo.email = '';
					if (studentuser.find('FatherPhoneHome').length)
						caregivertwo.phonehome = studentuser.find('FatherPhoneHome').text();
					else
						caregivertwo.phonehome = '';
					if (studentuser.find('FatherPhoneCell').length)
						caregivertwo.phonecell = studentuser.find('FatherPhoneCell').text();
					else
						caregivertwo.phonecell = '';
					if (studentuser.find('FatherPhoneWork').length)
						caregivertwo.phonework = studentuser.find('FatherPhoneWork').text();
					else
						caregivertwo.phonework = '';
					if (studentuser.find('FatherPhoneExtn').length)
						caregivertwo.phoneextension = studentuser.find('FatherPhoneExtn').text();
					else
						caregivertwo.phoneextension = '';
					if (studentuser.find('FatherOccupation').length)
						caregivertwo.occupation = studentuser.find('FatherOccupation').text();
					else
						caregivertwo.occupation = '';
					if (studentuser.find('FatherWorkAddress').length)
						caregivertwo.workaddress = studentuser.find('FatherWorkAddress').text();
					else
						caregivertwo.workaddress = '';
					if (studentuser.find('FatherNotes').length)
						caregivertwo.notes = studentuser.find('FatherNotes').text();
					else
						caregivertwo.notes = '';
					selectedstudent.caregivertwo = caregivertwo;
					
					/* Emergency Contact */
					if (studentuser.find('EmergencyName').length)
						selectedstudent.emergencyname = studentuser.find('EmergencyName').text();
					else
						selectedstudent.emergencyname = '';
					if (studentuser.find('EmergencyPhoneHome').length)
						selectedstudent.emergencyphonehome = studentuser.find('EmergencyPhoneHome').text();
					else
						selectedstudent.emergencyphonehome = '';
					if (studentuser.find('EmergencyPhoneCell').length)
						selectedstudent.emergencyphonecell = studentuser.find('EmergencyPhoneCell').text();
					else
						selectedstudent.emergencyphonecell = '';
					if (studentuser.find('EmergencyPhoneWork').length)
						selectedstudent.emergencyphonework = studentuser.find('EmergencyPhoneWork').text();
					else
						selectedstudent.emergencyphonework = '';
					if (studentuser.find('EmergencyPhoneExtn').length)
						selectedstudent.emergencyphoneextension = studentuser.find('EmergencyPhoneExtn').text();
					else
						selectedstudent.emergencyphoneextension = '';
					if (studentuser.find('EmergencyNotes').length)
						selectedstudent.emergencynotes = studentuser.find('EmergencyNotes').text();
					else
						selectedstudent.emergencynotes = '';
					
					selectedstudent.extendeddetails = true;
					g_selectedstudent = selectedstudent;
					$(document).trigger('extendedstudentdetailsloaded', [true]);
				}
				else
				{
					$(document).trigger('extendedstudentdetailsloaded', [false]);
				}
			}
		});
	}
	else
	{
		$(document).trigger('extendedstudentdetailsloaded', [true]);
	}
}

function loadExtendedDetailsForTeacher(loginkey, selectedteacher) {
	if (selectedteacher != undefined && selectedteacher.teachercode != '' && (selectedteacher.extendeddetails == undefined || selectedteacher.extendeddetails == false))
	{
		$.post(s_apiurl, {Key: loginkey, Command: "GetUserDetails", Tchr: selectedteacher.teachercode}, function(data) {
			var errortext = $(data).find('UserDetailsResults').find('Error').text();
			if (errortext != "")
			{
				g_newerrors.push('GetUserDetails : ' + errortext);
				$(document).trigger('extendeddetailsloaded', [false]);
			}
			else
			{
				var staffuser = $(data).find('UserDetailsResults').find('StaffUser');
				if (staffuser.length == 1)
				{
					if (staffuser.find('Code').length)
						selectedteacher.teachercode = staffuser.find('Code').text();
					else
						selectedteacher.teachercode = '';
					if (staffuser.find('Title').length)
						selectedteacher.title = staffuser.find('Title').text();
					else
						selectedteacher.title = '';
					if (staffuser.find('Gender').length)
						selectedteacher.gender = staffuser.find('Gender').text();
					else
						selectedteacher.gender = '';
					if (staffuser.find('FirstName').length)
						selectedteacher.firstname = staffuser.find('FirstName').text();
					else
						selectedteacher.firstname = '';
					if (staffuser.find('LastName').length)
						selectedteacher.lastname = staffuser.find('LastName').text();
					else
						selectedteacher.lastname = '';
					if (staffuser.find('Tutor').length)
						selectedteacher.tutor = staffuser.find('Tutor').text();
					else
						selectedteacher.tutor = '';
					if (staffuser.find('ContactDetails').find('HomePhone').length)
						selectedteacher.phone = staffuser.find('ContactDetails').find('HomePhone').text();
					else
						selectedteacher.phone = '';
					if (staffuser.find('ContactDetails').find('Mobile').length)
						selectedteacher.mobile = staffuser.find('ContactDetails').find('Mobile').text();
					else
						selectedteacher.mobile = '';
					if (staffuser.find('ContactDetails').find('Address').length)
						selectedteacher.address = staffuser.find('ContactDetails').find('Address').text();
					else
						selectedteacher.address = '';
					if (staffuser.find('ContactDetails').find('Partner').length)
						selectedteacher.partner = staffuser.find('ContactDetails').find('Partner').text();
					else
						selectedteacher.partner = '';
					if (staffuser.find('Departments').length)
						selectedteacher.departments = staffuser.find('Departments').text();
					else
						selectedteacher.departments = '';
					if (staffuser.find('TeachingRoom').length)
						selectedteacher.room = staffuser.find('TeachingRoom').text();
					else
						selectedteacher.room = '';
					if (staffuser.find('House').length)
						selectedteacher.house = staffuser.find('House').text();
					else
						selectedteacher.house = '';
					if (staffuser.find('Extension').length)
						selectedteacher.extension = staffuser.find('Extension').text();
					else
						selectedteacher.extension = '';
					if (staffuser.find('Emails').find('School').length)
						selectedteacher.schoolemail = staffuser.find('Emails').find('School').text();
					else
						selectedteacher.schoolemail = '';
					if (staffuser.find('Emails').find('Personal').length)
						selectedteacher.personalemail = staffuser.find('Emails').find('Personal').text();
					else
						selectedteacher.personalemail = '';
					if (staffuser.find('Vehicles').find('CarPark').length)
						selectedteacher.carpark = staffuser.find('Vehicles').find('CarPark').text();
					else
						selectedteacher.carpark = '';
					var vehicles = [];
					staffuser.find('Vehicles').find('Vehicle').each(function(index){
						var newvehicle = new Object();
						if ($(this).find('Colour').length)
							newvehicle.colour = $(this).find('Colour').text();
						else
							newvehicle.colour = '';
						if ($(this).find('Model').length)
							newvehicle.model = $(this).find('Model').text();
						else
							newvehicle.model = '';
						if ($(this).find('Rego').length)
							newvehicle.registration = $(this).find('Rego').text();
						else
							newvehicle.registration = '';
						vehicles.push(newvehicle);
					});
					selectedteacher.vehicles = vehicles;
					if (staffuser.find('Responsibilities').length)
						selectedteacher.responsibilities = staffuser.find('Responsibilities').text();
					else
						selectedteacher.responsibilities = '';
					if (staffuser.find('Committees').length)
						selectedteacher.committees = staffuser.find('Committees').text();
					else
						selectedteacher.committees = '';
					var additonalcontacts = [];
					staffuser.find('NextOfKin').find('Contact').each(function(index){
						var newcontact = new Object();
						if ($(this).find('Name').length)
							newcontact.name = $(this).find('Name').text();
						else
							newcontact.name = '';
						if ($(this).find('Relation').length)
							newcontact.relationship = $(this).find('Relation').text();
						else
							newcontact.relationship = '';
						if ($(this).find('HomePhone').length)
							newcontact.phone = $(this).find('HomePhone').text();
						else
							newcontact.phone = '';
						if ($(this).find('WorkPhone').length)
							newcontact.workphone = $(this).find('WorkPhone').text();
						else
							newcontact.workphone = '';
						if ($(this).find('Mobile').length)
							newcontact.mobile = $(this).find('Mobile').text();
						else
							newcontact.mobile = '';
						if ($(this).find('Address').length)
							newcontact.address = $(this).find('Address').text();
						else
							newcontact.address = '';
						additonalcontacts.push(newcontact);
					});
					selectedteacher.additonalcontacts = additonalcontacts;
					selectedteacher.extendeddetails = true;
					g_selectedteacher = selectedteacher;
					$(document).trigger('extendeddetailsloaded', [true]);
				}
				else
				{
					$(document).trigger('extendeddetailsloaded', [false]);
				}
			}
		});
	}
	else
	{
		$(document).trigger('extendeddetailsloaded', [true]);
	}
}

function saveAttendanceValues(isfinished) {
	// disable the button so we avoid double clicking the finished button whenever possible
	$('#attendancemarking .attendancesavebuttons').addClass('attendance-finished');
	var attendanceentryarray = [];
	for(var i in g_newattendanceentries) {
		attendanceentryarray.push(i + '|' + g_newattendanceentries[i] + '|' + (g_newattendancereasons[i] != undefined ? g_newattendancereasons[i] : ''));
	}
	loadStudentAttendanceForPeriod(g_loginkey, g_selectedteacher.teachercode, g_selecteddate, g_selectedperiod, g_selectedcalendarday.weekoftimetable, attendanceentryarray.join('\n'), isfinished);
	
	unbindSaveAttendanceOnLeave();
}

function loadStudentAttendanceForPeriod(loginkey, selectedteachercode, selecteddate, selectedperiod, selectedweek, attendanceentrystring, isfinished) {
	showTeacherNameHeader(g_selectedteacher);
	
	// clear any students already added
	$('#students').empty();
	$('#attendancemarking .period-details .date').text(moment(selecteddate).format('Do MMM YYYY'));
	// globals might not be availble, so we build some code to run when it is
	loadGlobalsAndRunFunction(function() {
		if (g_globals.periods[selectedperiod - 1] == undefined)
			$('#attendancemarking .period-details .period-name').text('No Period');
		else
			$('#attendancemarking .period-details .period-name').text(g_globals.periods[selectedperiod - 1].periodname.replace(/\s/g, '\u00A0'));
	});
	var postdata = {Key: loginkey, Command: "TeacherAttendancePeriod", Tchr: selectedteachercode, Date: dateToNZDateString(selecteddate), Slot: selectedperiod};
	if (attendanceentrystring != '' || isfinished)
	{
		postdata['Data'] = attendanceentrystring;
		postdata['Finished'] = (isfinished ? 1 : 0);
	}
	g_loadingmutex++;
	setTimeout(function() {
		checkLoadingMutex();
	}, 250);
	$.post(s_apiurl, postdata, function(data) {
		var finished = $(data).find('TeacherAttendancePeriodResults').find('Finished');
		if (finished != undefined && finished.text() != '')
		{
			// we must be coming back from a submission, so we check the status of that attempt
			if (parseInt(finished.text()) > 0)
			{
				// no problems, invalidate the attendance checklist because it should now reflect the finished timeslot and will need to be updated before being shown again
				if (g_teacherattendancechecklist != undefined)
					g_teacherattendancechecklist.valid = false;
			}
			else if (parseInt(finished.text()) == 0)
			{
				// some students couldn't be marked automatically
				g_newerrors.push('Some students must be marked manually before the class can be finished, please review the students.');
			}
			else
			{
				// some sort of validation issue, don't have more detail
				g_newerrors.push('There was an unexpected problem with marking attendance, please use the KAMAR desktop interface to mark attendance.');
			}
		}
		
		var students = $(data).find('TeacherAttendancePeriodResults').find('Students').find('Student');
		g_newattendanceentries = new Object();
		g_newattendancereasons = new Object();
		$(students).each(function(index){
			var studentid = $(this).find('StuID').text(),
				attendancecodes = $(this).find('Attend').text(),
				attendancecode = attendancecodes[g_selectedperiod - 1];
			var studentrow = $('<div class="attendance-student-row"><div class="attendance-student-details"><span class="attendance-student-name">' + $(this).find('LastName').text() + ', ' + $(this).find('FirstName').text() + '</span><span class="attendance-student-year-level">' + $(this).find('Level').text() + '</span><span class="attendance-student-tutor">' + $(this).find('Tutor').text() + '</span></div></div>'),
				attendancebuttons = $('<div class="attendance-buttons" data-role="controlgroup" data-type="horizontal"></div>'),
				studentattendance = $('<div class="attendance-student-attendance">' + attendancecodes + '</div>'),
				presentbutton = $('<a class="present-button' + (attendancecode == '*' ? ' selected' : '') + '" href="#">Present</a>'),
				notinclassbutton = $('<a class="notinclass-button' + (attendancecode == '?' ? ' selected' : '') + '" href="#">Not in Class</a>'),
				latebutton = $('<a class="late-button' + (attendancecode == 'L' ? ' selected' : '') + '" href="#">Late</a>');
			
			if (otherAttendanceCode(attendancecode))
			{
				notinclassbutton = $('<a class="notinclass-button selected otherreason" href="#">' + attendanceCodeToText(attendancecode) + '</a>');
			}
			
			var setpresent = function() {
				saveAttendanceOnLeave();
				g_newattendanceentries[studentid] = '*';
				presentbutton.addClass('selected');
				latebutton.removeClass('selected');
				notinclassbutton.removeClass('selected');
			};
			var setnotinclass = function() {
				saveAttendanceOnLeave();
				g_newattendanceentries[studentid] = '?';
				presentbutton.removeClass('selected');
				latebutton.removeClass('selected');
				notinclassbutton.addClass('selected');
			};
			var setlate = function() {
				saveAttendanceOnLeave();
				g_newattendanceentries[studentid] = 'L';
				presentbutton.removeClass('selected');
				latebutton.addClass('selected');
				notinclassbutton.removeClass('selected');
			};
			var setprevious = function() {
				saveAttendanceOnLeave();
				g_newattendanceentries[studentid] = attendancecode;
				presentbutton.removeClass('selected');
				latebutton.removeClass('selected');
				notinclassbutton.addClass('selected');
			};
			// should be prompting for reason?
			var needreason = attendanceCodeNeedsReason(attendancecode);
			// present code actions
			if (needreason && attendancecode != '*')
			{
				// do need a reason
				presentbutton.bind('vclick',function(event){
					var reason = $.trim(prompt('Please enter a reason', g_newattendancereasons[studentid]));
					if (validAttendanceReason(reason))
					{
						setpresent();
						g_newattendancereasons[studentid] = reason;
					}
				});
			}
			else
			{
				presentbutton.bind('vclick',function(event){
					setpresent();
				});
			}
			// late code actions
			if (needreason && attendancecode != 'L')
			{
				latebutton.bind('vclick',function(event){
					var reason = $.trim(prompt('Please enter a reason', g_newattendancereasons[studentid]));
					if (validAttendanceReason(reason))
					{
						setlate();
						g_newattendancereasons[studentid] = reason;
					}
				});
			}
			else
			{
				latebutton.bind('vclick',function(event){
					setlate();
				});
			}
			// notinclass or other code actions
			if (otherAttendanceCode(attendancecode))
			{
				notinclassbutton.bind('vclick',function(event){
					setprevious();
				});
			}
			else
			{
				if (needreason && attendancecode != '?')
				{
					notinclassbutton.bind('vclick',function(event){
						var reason = $.trim(prompt('Please enter a reason', g_newattendancereasons[studentid]));
						if (validAttendanceReason(reason))
						{
							setnotinclass();
							g_newattendancereasons[studentid] = reason;
						}
					});
				}
				else
				{
					notinclassbutton.bind('vclick',function(event){
						setnotinclass();
					});
				}
			}
			
			attendancebuttons.append(presentbutton);
			attendancebuttons.append(notinclassbutton);
			attendancebuttons.append(latebutton);
			studentrow.append(attendancebuttons);
			studentrow.append(studentattendance);
			$('#students').append(studentrow);
		});
		// apply formatting
		$('#students').trigger('create');
		$('#students').show();
		

		// attendance checklist might not be available, so we build some code to run when it is
		loadAttendanceChecklistAndRunFunction(g_loginkey, g_selectedteacher.teachercode, g_selectedyear, function() {
			var lastmondayfordate = getLastMonday(selecteddate),
				currentweekchecklist = g_teacherattendancechecklist.weeks[lastmondayfordate.getTime()],
				checklist = undefined,
				attendancefinished = false;
			
			if (currentweekchecklist != undefined && currentweekchecklist.days.length > 4)
			{
				checklist = currentweekchecklist.days[selecteddate.getDay() - 1];
				
				if (checklist.checklist[selectedperiod - 1] == 'Y')
					attendancefinished = true;
			}

			// show the save/finished buttons if its for today or a day in the past and the class has students
			if (!attendancefinished && selecteddate.getTime() < (new Date()).getTime() && students.length > 0)
				$('#attendancemarking .attendancesavebuttons').removeClass('attendance-finished');
			else
				$('#attendancemarking .attendancesavebuttons').addClass('attendance-finished');
			
		});
			
		g_loadingmutex--;
		checkLoadingMutex();
	});
}
function populateDB(tx) {
     tx.executeSql('CREATE TABLE IF NOT EXISTS KAMAR_APP_SETTINGS (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE, data TEXT UNIQUE)');
}

function resetDB(tx) {
     tx.executeSql('DROP TABLE KAMAR_APP_SETTINGS');
     tx.executeSql('CREATE TABLE IF NOT EXISTS KAMAR_APP_SETTINGS (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE, data TEXT UNIQUE)');
     tx.executeSql('INSERT INTO KAMAR_APP_SETTINGS (name, data) VALUES ("api_url", "")');
     tx.executeSql('INSERT INTO KAMAR_APP_SETTINGS (name, data) VALUES ("api_username", "")');
     tx.executeSql('INSERT INTO KAMAR_APP_SETTINGS (name, data) VALUES ("api_password", "")');
     tx.executeSql('INSERT INTO KAMAR_APP_SETTINGS (name, data) VALUES ("saved_password_allowed", "true")');
	 alert('Settings reset');
}

function errorCB(tx, err) {
    alert("Error processing SQL: "+err);
}

function successCB() {
    //alert("success!");
}

function loadSettings() {
	if (s_db != undefined)
	{
		// on success, load the api url
		s_db.transaction(function(tx) {
			tx.executeSql('SELECT data FROM KAMAR_APP_SETTINGS WHERE name = "saved_password_allowed"', [], function(tx, results) {
				var len = results.rows.length;
				if (len == 1 && results.rows.item(0).data != "")
				{
					// only one row, as expected, we should have a valid url
					if (results.rows.item(0).data == "false")
						s_saved_password_allowed = false;
				}
			}, errorCB);
		});
		
		// on success, load the api url
		s_db.transaction(function(tx) {
			tx.executeSql('SELECT data FROM KAMAR_APP_SETTINGS WHERE name = "api_url"', [], function(tx, results) {
				var len = results.rows.length;
				if (len == 1 && results.rows.item(0).data != "")
				{
					// only one row, as expected, we should have a valid url
					s_url = results.rows.item(0).data;
					setUrls(s_url);
					attemptAutoLogin();
					$(document).trigger('appsettingsloaded', true);
				}
				else
				{
					// go to settings
					$.mobile.changePage(basepath + 'settings.' + s_fileextension + '', {
						transition: 'slide'
					});
				}
			}, errorCB);
		});
	}
}

function saveSettings() {
	if (s_db != undefined)
	{
		var url = $('#settings-url').val(),
			username = $('#settings-username').val(),
			password = $('#settings-password').val();
			
		if (url != "")
		{
			// on success, load the api url
			s_db.transaction(function(tx) {
				tx.executeSql('INSERT OR REPLACE INTO KAMAR_APP_SETTINGS (name, data) VALUES ("api_url", "' + url + '")');
				tx.executeSql('INSERT OR REPLACE INTO KAMAR_APP_SETTINGS (name, data) VALUES ("api_username", "' + username + '")');
				tx.executeSql('INSERT OR REPLACE INTO KAMAR_APP_SETTINGS (name, data) VALUES ("api_password", "' + password + '")');
			}, errorCB, function() {
				// save worked, update current session variables
				s_url = url;
				setUrls(s_url);
				s_username = username;
				s_password = password;
				alert('Settings saved');
			});
		}
	}
}

function allowsavedpassword(allowsavedpassword) {
	if (s_db != undefined)
	{
		if (allowsavedpassword)
		{
			s_db.transaction(function(tx) {
	    		tx.executeSql('INSERT OR REPLACE INTO KAMAR_APP_SETTINGS (name, data) VALUES ("saved_password_allowed", "true")');
			}, errorCB, function() {
				// successful, continue silently
			});
		}
		else
		{
			s_db.transaction(function(tx) {
	    		tx.executeSql('INSERT OR REPLACE INTO KAMAR_APP_SETTINGS (name, data) VALUES ("saved_password_allowed", "false")');
				tx.executeSql('INSERT OR REPLACE INTO KAMAR_APP_SETTINGS (name, data) VALUES ("api_password", "")');
			}, errorCB, function() {
				// successful, continue silently
			});
		}
	}
}

function setUrls(baseurl) {
	baseurl = $.trim(baseurl);
	var expression = /^http/gi;
	var regex = new RegExp(expression);
	if (!baseurl.match(regex))
		baseurl = 'http://' + baseurl
	s_apiurl = baseurl + '/api/api.php';
	s_imgurl = baseurl + '/api/img.php';
}

function attemptAutoLogin() {
	if (s_db != undefined)
	{
		// on success, load the api username/password
		s_db.transaction(function(tx) {
			tx.executeSql('SELECT name,data FROM KAMAR_APP_SETTINGS WHERE name = "api_username" OR name = "api_password"', [], function(tx, results) {
				var len = results.rows.length;
				for (var i=0; i<len; i++)
				{
					if (results.rows.item(i).name == "api_username")
						s_username = results.rows.item(i).data;
					else if (results.rows.item(i).name == "api_password")
						s_password = results.rows.item(i).data;
				}
				if ((s_username != undefined && s_username != '') || (s_password != undefined && s_password != ''))
					showLogin();
				if (s_username != undefined && s_username != '' && s_password != undefined && s_password != '')
					attemptInterfaceLogin(s_username, s_password);
			}, errorCB);
		});
	}
}function printerrors() {
	if (g_newerrors.length > 0)
	{
		alert(g_newerrors.join('\n'));
				
		g_newerrors = [];
	}
}

function checkLoadingMutex() {
	if (g_loadingmutex > 0)
		$.mobile.loading('show');
	else
		$.mobile.loading('hide');
}

function loadWithExclusivity(executecompleteevent, toexecute, afterexecute) {
	g_loadingmutex++;
	setTimeout(function() {
		checkLoadingMutex();
	}, 250);
	runWithExclusivity(executecompleteevent, toexecute, function(success){
		g_loadingmutex--;
		checkLoadingMutex();
		if (success)
			afterexecute(success);
	});
}

function runWithExclusivity(executecompleteevent, toexecute, afterexecute) {
	if (g_mutexlocks[executecompleteevent] == undefined || g_mutexlocks[executecompleteevent] == false)
	{
		// got exclusive lock
		g_mutexlocks[executecompleteevent] = true;
		$(document).one(executecompleteevent, function(event, success){
			g_mutexlocks[executecompleteevent] = false;
			
			afterexecute(success);
		});
		
		toexecute();
	}
	else
	{
		return setTimeout(function() {
			runWithExclusivity(executecompleteevent, toexecute, afterexecute);
		},10);
	}
}
	
function dateToNZDateString(date) {
	return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
}
	
function dateToISO8601DateString(date) {
	return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
}
	
function NZDateStringToDate(datestring) {
	var datecomponents = datestring.split('/');
	if (datecomponents.length != 3)
		throw 'NZ date string did not contain expected components [' + datestring + ']';
	return new Date(datecomponents[2], datecomponents[1] - 1, datecomponents[0]);
}
	
function ISO8601DateStringToDate(datestring) {
	var datecomponents = datestring.split('-');
	if (datecomponents.length != 3)
		throw 'ISO 8601 date string did not contain expected components [' + datestring + ']';
	return new Date(datecomponents[0], datecomponents[1] - 1, datecomponents[2]);
}

function dayIndexToText(dayindex) {
	if (dayindex == 0)
		return 'sunday';
	if (dayindex == 1)
		return 'monday';
	if (dayindex == 2)
		return 'tuesday';
	if (dayindex == 3)
		return 'wednesday';
	if (dayindex == 4)
		return 'thursday';
	if (dayindex == 5)
		return 'friday';
	if (dayindex == 6)
		return 'saturday';
	return '';
}

function getFirstDayOfMonth(date) {
	return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getLastDayOfMonth(date) {
	return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function getLastMonday(date) {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate() - (date.getDay() == 0 ? 7 : date.getDay()) + 1);
}

function getDateWithoutTime(date) {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function openStatusToFullText(openstatus, cycleday) {
	var openstatusstring = '';

	if (cycleday < 1)
		return openstatus;
	else
		return openstatus + ', Day ' + cycleday;
	/*
	if (cycleday < 1)
		return "School Closed";
	else
	{
		if (openstatus == 'J')
			openstatusstring += "Junior Only";
		else if (openstatus == 'S')
			openstatusstring += "Senior Only";
		else
			openstatusstring += "Whole School";
		
		openstatusstring += ', Day ' + cycleday;
	}
	*/
	
	return openstatusstring;
}

function attendanceCodeToText(attendancecode) {
	switch(attendancecode)
	{
		case '*':
			return 'Present';
		case 'P':
			return 'Present';
		case '?':
			return 'Not in Class';
		case 'L':
			return 'Late';
		case 'S':
			return 'Sickbay';
		case 'D':
			return 'Doctor';
		case 'I':
			return 'Internal';
		case 'E':
			return 'Explained';
		case 'M':
			return 'Medical';
		case 'J':
			return 'Justified';
		case 'T':
			return 'Truant';
		case 'V':
			return 'Study';
		case 'N':
			return 'School Act.';
		case 'Q':
			return 'Trip/Camp';
		case 'W':
			return 'Work Exp.';
		case 'R':
			return 'Removed';
		case 'X':
			return 'Exam Leave';
		case 'O':
			return 'Overseas';
		case 'K':
			return 'Teen Parent';
		case 'A':
			return 'Alt. Edu.';
		case 'Y':
			return 'Act. Centre';
		case 'F':
			return 'Off Site';
		case 'H':
			return 'Health Camp';
		case 'C':
			return 'Court';
		case 'Z':
			return 'Tertiary';
		case 'U':
			return 'Withdrawn';
		default:
			return '';
	}
}

function attendanceCodeNeedsReason(attendancecode) {
	 if (attendancecode == undefined || attendancecode == '' || attendancecode == ' ' || attendancecode == '.' || attendancecode == '?')
		 return false;
	 return true;
}

function otherAttendanceCode(attendancecode) {
	if (attendancecode == undefined || attendancecode == '' || attendancecode == ' ' || attendancecode == '.' || attendancecode == '*' || attendancecode == 'L' || attendancecode == '?')
		 return false;
	 return true;
}

function validAttendanceReason(reason) {
	if (reason.length > 2)
		return true;
		
	return false;
}

function qualificationCodeToText(qualificationcode) {
	switch(qualificationcode)
	{
		case 'Q':
			return 'National Certificates';
		case 'O':
			return 'Other Qualifications';
		case 'C':
			return 'Course Endorsements';
		default:
			return '';
	}
}

function returnWeekInBoundaries(weekoftimetable) {
	if (!isNaN(parseFloat(weekoftimetable)) && isFinite(weekoftimetable))
		return Math.min(40, Math.max(1, weekoftimetable));
	return 1;
}

function logout() {
	g_loginkey = 'vtku';
	g_loginlevel = 0;
	g_loggedinteacher = undefined;
	g_loggedinstudent = undefined;
}

function loggedIn() {
	if (g_loginlevel != 0)
		return true;
	
	return false;
}

function forceLoggedIn() {
	if (loggedIn())
		return true;
	
	$.mobile.changePage(basepath + 'index.' + s_fileextension + '', {
		transition: 'slide',
		reverse: true
	});
	return false;
}

function changeDate(date) {
	// calendar might not be available yet
	var changedate = function() {
		var datewithouttime = new Date(date.getFullYear(), date.getMonth(), date.getDate());
		
		if (datewithouttime != undefined)
		{
			var	calendarday = g_calendar.days[datewithouttime.getTime()];
		}
		
		if (calendarday != undefined)
		{
			g_selecteddate = datewithouttime;
			g_selectedyear = datewithouttime.getFullYear();
			g_selectedcalendarday = calendarday;
		}

		$(document).trigger('selecteddatechanged', [true]);
	}
	loadCalendarAndRunFuction(date.getFullYear(), changedate);
}

function changeWeek(date, week) {
	// calendar might not be available yet
	var changeweek = function() {
		var calendarweekstart = g_calendar.weekstarts[week];
		
		if (calendarweekstart != undefined)
		{
			var	datewithouttime = new Date(calendarweekstart.date.getFullYear(), calendarweekstart.date.getMonth(), calendarweekstart.date.getDate() + date.getDay() - 1),
				calendarday = g_calendar.days[datewithouttime.getTime()];
		}
		
		if (calendarday != undefined)
		{
			g_selecteddate = calendarday.date;
			g_selectedyear = calendarday.date.getFullYear();
			g_selectedcalendarday = calendarday;
		}

		$(document).trigger('selectedweekchanged', [true]);
	}
	loadCalendarAndRunFuction(date.getFullYear(), changeweek);
}