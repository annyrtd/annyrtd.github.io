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
var actionPart = document.getElementById('action-part');
var authInfo = document.getElementById('auth-info');

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
		authInfo.style.display = 'none';
		signoutButton.style.display = 'block';
		actionPart.style.display = 'block';
	} else {
		authorizeButton.style.display = 'block';
		authInfo.style.display = 'block';
		signoutButton.style.display = 'none';
		actionPart.style.display = 'none';
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
	console.log(message);
}

function callAppsScript(values, formLink) {
	const scriptId = '1EYnoaCsF8vgAHeC53GpGUU3Tqfgrjlp7EhKhzSt0OxMwPk78MlmVbwn8';
	const statContainer = document.getElementById('statistics');
	
	return createFormGAPI(scriptId, values).then(resp => {
		console.log('gapi.client.script.scripts.run - success');
		formLink.innerHTML = '';
		
		let {result} = resp;
		if (result.error) throw result.error;
		
		const {editLink, publishLink, formId} = result.response.result;
			
		const openFormLink = document.createElement('a');
		openFormLink.setAttribute('target', '_blank');
		openFormLink.setAttribute('href', publishLink);
		openFormLink.innerText = 'Открыть форму';
		openFormLink.classList.add('action-link');
		formLink.appendChild(openFormLink);
			
		const editFormLink = document.createElement('a');
		editFormLink.setAttribute('target', '_blank');
		editFormLink.setAttribute('href', editLink);
		editFormLink.innerText = 'Редактировать форму';
		editFormLink.classList.add('action-link');
		formLink.appendChild(editFormLink);
		
		const showStatsLink = document.createElement('a');
		showStatsLink.setAttribute('id', 'statistics-link');
		showStatsLink.setAttribute('href', '#statistics');
		showStatsLink.innerText = 'Посмотреть статистику';
		showStatsLink.classList.add('action-link');
		formLink.appendChild(showStatsLink);
		
		const hiddenStatsLink = document.createElement('a');
		hiddenStatsLink.setAttribute('id', 'statistics-link-hidden');
		hiddenStatsLink.setAttribute('href', '#statistics');
		hiddenStatsLink.style.display = 'none';
		formLink.appendChild(hiddenStatsLink);
		
		const saveIdText = document.createElement('div');
		saveIdText.innerText = 'Сохраните ID формы: ' + formId;
		formLink.appendChild(saveIdText);
			
		showStatsLink.addEventListener('click', () => {
			getStatsGAPI(scriptId, formId).then(response => {
				statContainer.innerHTML = '';
				
				const {result} = response.result.response;
				const stats = [];
				
				for(let i = 0; i < result.length; i++) {
					for(let k = 0; k < result[i].length; k++) {
						const word = result[i][k];
						stats[k] = stats[k] || {};
						
						if(stats[k][word]) {
							stats[k][word] += 1;
						} else {
							stats[k][word] = 1;
						}
					}
				}
				
				stats.forEach((question, i) => {
					const qHeader = document.createElement('h1');
					qHeader.innerText = 'Вопрос ' + (i + 1);
					
					const qContent = document.createElement('div');
					qContent.classList.add('question-content');
					
					const qContainer = document.createElement('div');
					qContainer.classList.add('question-container');
					
					qContainer.appendChild(qHeader);
					qContainer.appendChild(qContent);
					statContainer.appendChild(qContainer);
					
					const sum = Object.values(question).reduce((res,cur) => res + cur, 0);
					
					Object.entries(question).forEach(([word, count]) => {
						const aRow = document.createElement('div');
						aRow.classList.add('answer-row');
					
						const qWord = document.createElement('div');
						qWord.classList.add('answer-row__word');
						qWord.innerText = word;
						aRow.appendChild(qWord);
						
						const qCount = document.createElement('div');
						qCount.classList.add('answer-row__count');
						qCount.innerText = count + ' (' + parseFloat((count/sum*100).toFixed(2)) + '%)';
						aRow.appendChild(qCount);
						
						qContainer.appendChild(aRow);
					});
				})
				
				hiddenStatsLink.click();
			});
		});			
	}).catch((error) => {
		// The API encountered a problem.
		formLink.innerHtml = 'Ошибка! См. консоль (f12): ';
		return console.log(error);
	});
}

function createFormGAPI(scriptId, values) {
	return gapi.client.script.scripts.run({
		'scriptId': scriptId,
		'resource': {
			'function': 'createFormWithoutSpreadsheet',
			'parameters': [
				values
			]
		}			
	})
}

function getStatsGAPI(scriptId, formId) {
	return gapi.client.script.scripts.run({
		'scriptId': scriptId,
		'resource': {
			'function': 'getResponses',
			'parameters': [
				formId
			]
		}			
	});
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
	const clearAllButton = document.getElementById('clear-all');
	const formLink = document.getElementById('form-link');
	let originalContent = '';
	let fileName = '';
		
	clearAllButton.onclick = () => {		
		fileContentDiv.innerHTML = '';
		foundSentencesList.innerHTML = '';
		selectedSentencesList.innerHTML = '';
		formLink.innerHTML = '';
		searchWordInput.value = '';
		fileUploader.value = '';
		createSheetButton.setAttribute('disabled', true);
	}
		
	fileUploader.onchange = () => {
		if(fileUploader.files.length > 0) {
			createSheetButton.removeAttribute('disabled');
		} else {
			createSheetButton.setAttribute('disabled', true);
		}
	}
		
	createSheetButton.onclick = () => {
		const file = fileUploader.files[0];
		var reader = new FileReader();
		reader.onload=function(){
			fileContentDiv.innerText = reader.result; // display file contents
			originalContent = fileContentDiv.innerHTML;
			fileContentWrapper.style.display = '';
		}
		reader.readAsText(file);
		foundSentencesList.innerHTML = '';
		searchWordInput.value = '';
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
					const markedText = value.replace(/([А-ЯA-Z0-9]+)/gi, '<span class="' + wordClass + '">$1</span>');
					const selectedWord = value.match(new RegExp('[А-ЯA-Z0-9]*' + word + '[А-ЯA-Z0-9]*', 'gi'))[0];
					
					const li = document.createElement('li');
					li.classList.add('sentence-column');
					li.setAttribute('data-value', value);
					
					const flexRow = document.createElement('div');
					flexRow.classList.add('flex-row');
					li.appendChild(flexRow);
					
					const buttonSelectSentence = document.createElement('button');
					buttonSelectSentence.setAttribute('type', 'button');
					buttonSelectSentence.classList.add('icon-button');					
					buttonSelectSentence.classList.add('icon-button--select-sentense');	
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
					label.classList.add('sentence-label')
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
					buttonAddContext.classList.add('icon-button');					
					buttonAddContext.classList.add('icon-button--add-context');	
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
						buttonRemoveContext.classList.add('icon-button');					
						buttonRemoveContext.classList.add('icon-button--remove-context');	
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
			}
		} else {
			fileContentDiv.innerHTML = originalContent;
		}
	}
	
	createFormButton.onclick = () => {
		let values;
		let isSuccessful = true;
		
		try {
			values = [...selectedSentencesList.querySelectorAll('[data-value]')]
			.map((item, i) => {
				const word = item.querySelector('.one-word--selected').innerText;
				const sentence = item.getAttribute('data-value');
				const contexts = [...item.querySelectorAll('.context-input')].map(input => input.value);
				let substr = sentence.substr(0, 25);
				
				if(substr.length < sentence.length) {
					substr += '...';
				}
				
				if(!contexts.length) {
					throw new Error('Для предложения ' + (i + 1) + ': "' + substr + '" - отсутсвуют введенные варианты ответов!')
				}
				
				return [word, sentence, ...contexts];
			});
		} catch(e) {	
			isSuccessful = false;
			formLink.innerHTML = e.message;
		}
		
		if(isSuccessful) {
			if(values.length > 0) {
				formLink.innerHTML = 'Ждите...'				
				callAppsScript(values, formLink);
			} else {
				console.log('nothing selected');
				formLink.innerHTML = 'Вы не выбрали вопросы!'
			}
		}
	}
}