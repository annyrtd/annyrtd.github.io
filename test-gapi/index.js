// Client ID and API key from the Developer Console
var CLIENT_ID = '671158753684-b1440ujev2s16htck0976pao9d2ieg51.apps.googleusercontent.com';
var API_KEY = 'AIzaSyB37flCw46f5vorJ7CtULaMMND9Wy2FJlI';

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4", "https://script.googleapis.com/$discovery/rest?version=v1"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = "https://www.googleapis.com/auth/forms https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/script.projects https://www.googleapis.com/auth/script.deployments https://www.googleapis.com/auth/script.external_request";

var authorizeButton = document.getElementById('authorize_button');
var signoutButton = document.getElementById('signout_button');

/**
 *  On load, called to load the auth2 library and API client library.
 */
function handleClientLoad() {
	gapi.load('client:auth2', initClient);
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient() {
	gapi.client.init({
		apiKey: API_KEY,
		clientId: CLIENT_ID,
		discoveryDocs: DISCOVERY_DOCS,
		scope: SCOPES
	}).then(function () {
		// Listen for sign-in state changes.
		gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

		// Handle the initial sign-in state.
		updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
		authorizeButton.onclick = handleAuthClick;
		signoutButton.onclick = handleSignoutClick;
	}, function(error) {
		appendPre(JSON.stringify(error, null, 2));
	});
}

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
function updateSigninStatus(isSignedIn) {
	if (isSignedIn) {
		authorizeButton.style.display = 'none';
		signoutButton.style.display = 'block';
		//listMajors();	
		//callAppsScript();
	} else {
		authorizeButton.style.display = 'block';
		signoutButton.style.display = 'none';
	}
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick(event) {
	gapi.auth2.getAuthInstance().signIn();
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick(event) {
	gapi.auth2.getAuthInstance().signOut();
}

/**
 * Append a pre element to the body containing the given message
 * as its text node. Used to display the results of the API call.
 *
 * @param {string} message Text to be placed in pre element.
 */
function appendPre(message) {
	var pre = document.getElementById('content');
	var textContent = document.createTextNode(message + '\n');
	pre.appendChild(textContent);
}

/**
 * Print the names and majors of students in a sample spreadsheet:
 * https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 */
function listMajors() {
	gapi.client.sheets.spreadsheets.values.get({
		spreadsheetId: '1Rd5_iw3c0ia7LgppThx8wGrFx0jP2P4tS5xYCVBoTow',
		range: 'Conference Setup!A2:E',
	}).then(function(response) {
		var range = response.result;
		if (range.values.length > 0) {
			appendPre('Name, Major:');
            for (i = 0; i < range.values.length; i++) {
				var row = range.values[i];
				// Print columns A and E, which correspond to indices 0 and 4.
				appendPre(row[0] + ', ' + row[4]);
            }
		} else {
			appendPre('No data found.');
		}
	}, function(response) {
		appendPre('Error: ' + response.result.error.message);
	});
}

/**
 * Shows basic usage of the Apps Script API.
 *
 * Call the Apps Script API to create a new script project, upload files
 * to the project, and log the script's URL to the user.
 */
function callAppsScript(spreadsheetId, word, formLink) {
	const scriptId = '1EYnoaCsF8vgAHeC53GpGUU3Tqfgrjlp7EhKhzSt0OxMwPk78MlmVbwn8';
	
	return gapi.client.script.scripts.run({
		'scriptId': scriptId,
		'resource': {
			'function': 'createForm',
			'parameters': [
				spreadsheetId,
				word
			]
		}			
	}).then((resp) => {
		console.log('gapi.client.script.scripts.run - success');
		
		let result = resp.result;
		if (result.error) throw result.error;
		
		const resultLink = result.response.result;
		formLink.innerHTML = 'Ссылка: <a href="' + resultLink + '">' + resultLink + '</a>';
		
		console.log(resultLink);
		
		/*
		// The structure of the result will depend upon what the Apps
		// Script function returns. Here, the function returns an Apps
		// Script Object with String keys and values, and so the result
		// is treated as a JavaScript object (folderSet).

		var folderSet = result.response.result;
		if (Object.keys(folderSet).length == 0) {
			appendPre('No folders returned!');
		} else {
			appendPre('Folders under your root folder:');
			Object.keys(folderSet).forEach(function(id){
				appendPre('\t' + folderSet[id] + ' (' + id  + ')');
			});
		}*/
			
	}).catch((error) => {
		// The API encountered a problem.
		formLink.innerHtml = 'Ошибка! См. консоль (f12): ';
		return console.log(error);
	});
}	

function createSpreadsheet(fileName, values) {
	if(gapi.auth2.getAuthInstance().isSignedIn.get()) {
		var spreadsheetBody = {
			'properties': {
				'title': 'Spreadsheet for ' + fileName
			}
		};
		
		var body = {
			values: values
		};

		return gapi.client.sheets.spreadsheets.create({}, spreadsheetBody).then(response => {
			let {result} = response;
			console.log(`https://docs.google.com/spreadsheets/d/${result.spreadsheetId}/edit`);
			
			return gapi.client.sheets.spreadsheets.values.update({
				spreadsheetId: result.spreadsheetId,
				range: "!A1:A" + values.length,
				valueInputOption: 'RAW',
				resource: body
			})
		});
	}
}



window.onload = function() {
	const fileUploader = document.getElementById('create-spreadsheet-file-uploader');
	const createSheetButton = document.getElementById('create-spreadsheet-button');
	const createFormButton = document.getElementById('create-form');
	const fileContentDiv = document.getElementById('file-content');
	const searchWordInput = document.getElementById('search-word');
	const fileContentWrapper = document.getElementById('file-content-wrapper');
	const sentencesList = document.getElementById('sentenses');
	const formLink = document.getElementById('form-link');
		
	fileUploader.onchange = () => {
		if(fileUploader.files.length > 0) {
			createSheetButton.removeAttribute('disabled');
		} else {
			createSheetButton.setAttribute('disabled', true);
		}
		
		fileContentDiv.innerHTML = '';
		sentencesList.innerHTML = '';
		createFormButton.style.display = 'none';
	}
		
	let originalContent = '';
	let fileName = '';
	
	createSheetButton.onclick = () => {
		const file = fileUploader.files[0];
		fileName = file.name;
		var reader = new FileReader();
		reader.onload=function(){
			fileContentDiv.innerText = reader.result; // display file contents
			originalContent = fileContentDiv.innerHTML;
			fileContentWrapper.style.display = '';
		}
		reader.readAsText(file);
	};
		
	searchWordInput.oninput = () => {
		const word = searchWordInput.value;
		sentencesList.innerHTML = '';
		
		if(word.length > 0) { 
			fileContentDiv.innerHTML = originalContent.replace(new RegExp('(' + word + ')', 'gi'), '<span class="highlighted-text">$1</span>');
			
			const sentenses = originalContent.match(new RegExp('[^.!?\\r\\n]*' + word + '[^.!?\\r\\n]*[.!?]', 'gi'));
			
			if(sentenses) {
				sentenses.forEach((sentence, i) => {
					const value = sentence.replace(/<\w+>/g, '').replace(/([А-Я0-9]+)/gi, '<span class="one-word">$1</span>');
					const selectedWord = value.match(new RegExp('[А-Я0-9]*' + word + '[А-Я0-9]*', 'gi'))[0];
					const li = document.createElement('li');
					
					const tick = document.createElement('input');
					tick.setAttribute('type', 'checkbox');
					tick.setAttribute('id', 'sentence' + i);
					tick.name = 'sentence';
					tick.value = value;
					li.appendChild(tick);
					
					const label = document.createElement('label');
					label.innerHTML = value;
					label.setAttribute('for', 'sentence' + i);
					li.appendChild(label);
					
					const wordContainer = document.createElement('span');
					wordContainer.innerHTML = selectedWord;
					wordContainer.className = 'one-word one-word--selected';
					li.appendChild(wordContainer);
					
					sentencesList.appendChild(li);
				});
				
				createFormButton.style.display = '';
			} else {
				createFormButton.style.display = 'none';
			}
		} else {
			fileContentDiv.innerHTML = originalContent;
			createFormButton.style.display = 'none';
		}
	}
	
	createFormButton.onclick = () => {
		const values = [...document.querySelectorAll('[name="sentence"]:checked')].map(item => [item.value]);
		
		if(values.length > 0) {
			formLink.innerHTML = 'Ждите...'
			createSpreadsheet(fileName, values).then(({result}) => {
				console.log('gapi.client.sheets.spreadsheets.create - success');
				return callAppsScript(result.spreadsheetId, searchWordInput.value, formLink);
			})	
		} else {
			console.log('nothing selected');
		}
	}
}