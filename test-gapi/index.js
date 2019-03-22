// Client ID and API key from the Developer Console
var CLIENT_ID = '671158753684-b1440ujev2s16htck0976pao9d2ieg51.apps.googleusercontent.com';
var API_KEY = 'AIzaSyB37flCw46f5vorJ7CtULaMMND9Wy2FJlI';

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = [
	"https://sheets.googleapis.com/$discovery/rest?version=v4", 
	"https://script.googleapis.com/$discovery/rest?version=v1"
];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = [
	"https://www.googleapis.com/auth/forms", 
	"https://www.googleapis.com/auth/spreadsheets", 
	"https://www.googleapis.com/auth/script.projects", 
	"https://www.googleapis.com/auth/script.deployments", 
	"https://www.googleapis.com/auth/script.external_request", 
	"https://www.googleapis.com/auth/script.scriptapp"
].join(' ');

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

function callAppsScript(spreadsheetId, formLink) {
	const scriptId = '1EYnoaCsF8vgAHeC53GpGUU3Tqfgrjlp7EhKhzSt0OxMwPk78MlmVbwn8';
	
	return gapi.client.script.scripts.run({
		'scriptId': scriptId,
		'resource': {
			'function': 'createForm',
			'parameters': [
				spreadsheetId
			]
		}			
	}).then((resp) => {
		console.log('gapi.client.script.scripts.run - success');
		
		let result = resp.result;
		if (result.error) throw result.error;
		
		const {link, formId} = result.response.result;
		formLink.innerHTML = 'Ссылка: <a target="_blank" href="' + link + '" >Открыть форму</a>';
		
		console.log(link);			
	}).catch((error) => {
		// The API encountered a problem.
		formLink.innerHtml = 'Ошибка! См. консоль (f12): ';
		return console.log(error);
	});
}	

function createSpreadsheet(values) {
	if(gapi.auth2.getAuthInstance().isSignedIn.get()) {
		var spreadsheetBody = {
			'properties': {
				'title': 'Spreadsheet X'
			},
			'sheets': [{
				'properties': {
					'title': 'Config'
				},
			}]
		};
		
		var body = {
			values: values
		};

		return gapi.client.sheets.spreadsheets.create({}, spreadsheetBody).then(response => {
			let {result} = response;
			console.log(`https://docs.google.com/spreadsheets/d/${result.spreadsheetId}/edit`);
			let colLetter = columnToLetter(Math.max(...body.values.map(arr => arr.length)));
			
			return gapi.client.sheets.spreadsheets.values.update({
				spreadsheetId: result.spreadsheetId,
				range: "Config!A1:" + colLetter + body.values.length,
				valueInputOption: 'RAW',
				resource: body
			})
		});
	}
}


function columnToLetter(column) {
  var temp, letter = '';
  while (column > 0)
  {
    temp = (column - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    column = (column - temp - 1) / 26;
  }
  return letter;
}


window.onload = function() {
	const fileUploader = document.getElementById('create-spreadsheet-file-uploader');
	const createSheetButton = document.getElementById('create-spreadsheet-button');
	const createFormButton = document.getElementById('create-form');
	const fileContentDiv = document.getElementById('file-content');
	const searchWordInput = document.getElementById('search-word');
	const fileContentWrapper = document.getElementById('file-content-wrapper');
	const foundSentencesList = document.getElementById('found-sentenses');
	const selectedSentencesList = document.getElementById('selected-sentenses');
	const formLink = document.getElementById('form-link');
	let originalContent = '';
	let fileName = '';
	
	const checkIfEnableCreateFormButton = () => {
		if(document.querySelectorAll('[name="sentence"]:checked').length > 0) {
			createFormButton.removeAttribute('disabled');
		} else {
			createFormButton.setAttribute('disabled', true);
		}
	};
		
	fileUploader.onchange = () => {
		if(fileUploader.files.length > 0) {
			createSheetButton.removeAttribute('disabled');
		} else {
			createSheetButton.setAttribute('disabled', true);
		}
		
		fileContentDiv.innerHTML = '';
		foundSentencesList.innerHTML = '';
		createFormButton.style.display = 'none';
	}
		
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
		foundSentencesList.innerHTML = '';
		
		if(word.length > 0) { 
			fileContentDiv.innerHTML = originalContent.replace(new RegExp('(' + word + ')', 'gi'), '<span class="highlighted-text">$1</span>');
			
			const sentenses = originalContent.match(new RegExp('[^.!?\\r\\n]*' + word + '[^.!?\\r\\n]*[.!?]', 'gi'));
			
			if(sentenses) {
				sentenses.forEach((sentence, i) => {	
					const wordClass = 'one-word';
					const wordSelectedClass = wordClass + '--selected';
					const value = sentence.replace(/<\w+>/g, '');
					const markedText = value.replace(/([А-Я0-9]+)/gi, '<span class="' + wordClass + '">$1</span>');
					const selectedWord = value.match(new RegExp('[А-Я0-9]*' + word + '[А-Я0-9]*', 'gi'))[0];
					
					const li = document.createElement('li');
					li.classList.add('sentence-column');
					// li.setAttribute('data-sentence', 'sentence' + i);
					li.setAttribute('data-value', value);
					
					const flexRow = document.createElement('div');
					flexRow.classList.add('flex-row');
					li.appendChild(flexRow);
					
					const buttonSelectSentence = document.createElement('button');
					buttonSelectSentence.setAttribute('type', 'button');
					buttonSelectSentence.classList.add('button');					
					buttonSelectSentence.classList.add('button--select-sentense');	
					buttonSelectSentence.innerText = '+';					
					flexRow.appendChild(buttonSelectSentence);

					buttonSelectSentence.onclick = () => {
						if(buttonSelectSentence.getAttribute('data-selected')) {
							selectedSentencesList.removeChild(li);
						} else {							
							selectedSentencesList.appendChild(li);
							buttonSelectSentence.setAttribute('data-selected', true);
							buttonSelectSentence.innerText = '-';							
						}
					}
					
					const label = document.createElement('label');
					label.innerHTML = markedText;
					flexRow.appendChild(label);
					
					const spans = [...li.getElementsByClassName(wordClass)];
					spans.forEach(span => {
						if(span.innerText === selectedWord) {
							span.classList.add(wordSelectedClass);
						}
						
						span.onclick = () => {
							spans.forEach(spanInner => spanInner.classList.remove(wordSelectedClass));
							span.classList.add(wordSelectedClass);
						}
					});
					
					const contextList = document.createElement('ul');
					contextList.classList.add('context-list');
					
					const flexRow2 = document.createElement('div');
					flexRow2.classList.add('flex-row');
					flexRow2.classList.add('flex-row--add-context');
					contextList.appendChild(flexRow2);
					
					const buttonAddContext = document.createElement('button');
					buttonAddContext.setAttribute('type', 'button');
					buttonAddContext.classList.add('button');					
					buttonAddContext.classList.add('button--add-context');	
					buttonAddContext.innerHTML = '&#x2935;';
					flexRow2.appendChild(buttonAddContext);
					
					const label2 = document.createElement('label');
					label2.innerHTML = 'Добавить значение';
					label2.classList.add('label--add-context');
					flexRow2.appendChild(label2);
					
					buttonAddContext.onclick = () => {
						const contextLi = document.createElement('li');
						contextLi.classList.add('list-item--context');
						
						const buttonRemoveContext = document.createElement('button');
						buttonRemoveContext.setAttribute('type', 'button');
						buttonRemoveContext.classList.add('button');					
						buttonRemoveContext.classList.add('button--remove-context');	
						buttonRemoveContext.innerText = '-';					
						buttonRemoveContext.setAttribute('tabindex', '-1');
						contextLi.appendChild(buttonRemoveContext);
						
						buttonRemoveContext.onclick = () => {
							contextList.removeChild(contextLi);
						}
						
						const input = document.createElement('input');
						input.setAttribute('type', 'text');						
						input.classList.add('context-input');	
						contextLi.appendChild(input);
						
						contextList.appendChild(contextLi);
					}
					
					li.appendChild(contextList);
					
					foundSentencesList.appendChild(li);
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
		const values = [...selectedSentencesList.querySelectorAll('[data-value]')]
			.map(item => [
				item.querySelector('.one-word--selected').innerText,
				item.getAttribute('data-value'),
				...[...item.querySelectorAll('.context-input')].map(input => input.value)
			]);
		
		if(values.length > 0) {
			formLink.innerHTML = 'Ждите...'
			createSpreadsheet(values).then(({result}) => {
				console.log('gapi.client.sheets.spreadsheets.create - success');
				return callAppsScript(result.spreadsheetId, formLink);
			})	
		} else {
			console.log('nothing selected');
		}
	}
}