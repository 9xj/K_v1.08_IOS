function attemptLogin(username, password) {
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
					newgstats.attendancestatsfulldaysunjustified = student.find('FullDaysU').text(),
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
					newnceasummary.level1numeracy = student.find('NCEA').find('L1Numeracy').text();
					newnceasummary.ueliteracy = student.find('NCEA').find('UELiteracy').text();
					newnceasummary.uenumeracy = student.find('NCEA').find('UENumeracy').text();
					
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
