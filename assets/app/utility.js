function printerrors() {
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