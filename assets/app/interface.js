function loadCommonPageDetail(currentpage, studentsearch, teachersearch) {
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
	$('#level-1-literacy').text('');
	$('#level-1-numeracy').text('');
	$('#ue-literacy').text('');
	$('#ue-numeracy').text('');
		
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
			$('#level-1-literacy').text(g_studentnceasummary.level1literacy);
			$('#level-1-numeracy').text(g_studentnceasummary.level1numeracy);
			$('#ue-literacy').text(g_studentnceasummary.ueliteracy);
			$('#ue-numeracy').text(g_studentnceasummary.uenumeracy);
		
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
});