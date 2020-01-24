function subscribetoselectionchangedevent(runonchange) {
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
});