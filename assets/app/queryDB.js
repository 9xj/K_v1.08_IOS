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
}