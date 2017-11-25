const WORD_FORMS = {
    'USD': {
        names: ['доллар', 'доллары', 'долларов', 'доллара', 'долларах'],
        symbol: '$'
    },
    'RUB': {
        names: ['руб.', 'рубль', 'рубли', 'рублей', 'рубля', 'рублях'],
        symbol: '₽'
    },
    'EUR': {
        names: ['евро'],
        symbol: '€'
    },
    'JPY': {
        names: ['йен', 'иен', 'йена', 'иена', 'иены', 'йены'],
        symbol: '¥'
    },
};

window.onload = function () {
    const micButton = document.getElementById('start-recording');
    const recognition = new (window.SpeechRecognition ||
    window.webkitSpeechRecognition ||
    window.mozSpeechRecognition ||
    window.msSpeechRecognition)();

    recognition.lang = 'ru';
    recognition.interimResults = false;
    recognition.continuous = true;
    recognition.maxAlternatives = 5;

    recognition.onresult = function (event) {
        detectCommand(event.results[event.results.length - 1][0].transcript);
    };

    micButton.onclick = function() {
        micButton.classList.toggle('mdl-button--colored');

        if(micButton.classList.contains('mdl-button--colored')) {
            recognition.start();
        } else {
            recognition.stop();
        }
    };

    const buttonConvertDirection = document.getElementById('convert-direction');

    buttonConvertDirection.onclick = function() {
        let buttonIcon = buttonConvertDirection.querySelector('i');

        if(buttonIcon.innerText === 'keyboard_arrow_left') {
            buttonIcon.innerText = 'keyboard_arrow_right';
            buttonConvertDirection.classList.add('right');
            buttonConvertDirection.classList.remove('left');

        } else {
            buttonIcon.innerText = 'keyboard_arrow_left';
            buttonConvertDirection.classList.add('left');
            buttonConvertDirection.classList.remove('right');
        }
    };
};

function detectCommand(text) {
    const result = document.getElementById('result');

    const foundWords = text.match(/переведи\s+([\d]+)\s+([а-я.]+)\s+в\s+([а-я]+)/i);
    if (foundWords === null || foundWords[1] === undefined || foundWords[2] === undefined || foundWords[3] === undefined) {
        result.innerHTML += `Не удалось распознать команду: ${text}.<br><br>`;
    } else {
        const sum = parseFloat(foundWords[1]);
        const currencyFrom = Object.keys(WORD_FORMS).find(key => WORD_FORMS[key].names.indexOf(foundWords[2]) >= 0);
        const currencyTo = Object.keys(WORD_FORMS).find(key => WORD_FORMS[key].names.indexOf(foundWords[3]) >= 0);

        if (!currencyFrom || !currencyTo || isNaN(sum)) {
            result.innerHTML += 'Невозможно сконвертировать данную валюту.<br><br>';
        } else {
            let convertedValue;

            if (currencyFrom === 'RUB') {
                convertedValue = convertFromRub(currencyTo, sum);
            } else if (currencyTo === 'RUB') {
                convertedValue = convertToRub(currencyFrom, sum);
            } else {
                convertedValue = convertFromRub(
                    currencyTo,
                    convertToRub(currencyFrom, sum)
                );
            }

            convertedValue = convertedValue.toFixed(2);

            document.querySelector('#convert-direction i').innerText = 'keyboard_arrow_right';

            document.getElementById('currency-to').value = WORD_FORMS[currencyTo].symbol;
            document.getElementById('currency-from').value = WORD_FORMS[currencyFrom].symbol;

            document.getElementById('currencyFromValue').value = sum;
            document.getElementById('currencyFromValue').parentNode.classList.add('is-dirty');
            document.getElementById('currencyToValue').value = convertedValue;
            document.getElementById('currencyToValue').parentNode.classList.add('is-dirty');

            result.innerHTML += `${text}<br>Результат: ${convertedValue}<br><br>`;
        }
    }
}

/*window.onload = function () {
 askUser();
 };*/

function askUser(micButton) {
    return recognizeText()
        .then(text => {
            const result = document.getElementById('result');

            if(text.toLowerCase() === 'выход') {
                result.innerHTML += 'Пока!';
                recognition.stop();
                return Promise.reject();
            }

            if(text.toLowerCase() === 'спасибо') {
                result.innerHTML += 'Пожалуйста!<br><br>';
                return Promise.resolve();
            }

            const foundWords = text.match( /переведи\s+([\d]+)\s+([а-я.]+)\s+в\s+([а-я]+)/i );
            if(foundWords === null || foundWords[1] === undefined || foundWords[2] === undefined || foundWords[3] === undefined) {
                result.innerHTML += `Не удалось распознать команду: ${text}.<br><br>`;
            } else {
                const sum = parseFloat(foundWords[1]);
                const currencyFrom = Object.keys(WORD_FORMS).find(key => WORD_FORMS[key].indexOf(foundWords[2]) >= 0);
                const currencyTo = Object.keys(WORD_FORMS).find(key => WORD_FORMS[key].indexOf(foundWords[3]) >= 0);

                if(!currencyFrom || !currencyTo || isNaN(sum)) {
                    result.innerHTML += 'Невозможно сконвертировать данную валюту.<br><br>';
                } else {
                    let convertedValue;

                    if (currencyFrom === 'RUB') {
                        convertedValue = convertFromRub(currencyTo, sum);
                    } else if (currencyTo === 'RUB') {
                        convertedValue = convertToRub(currencyFrom, sum);
                    } else {
                        convertedValue = convertFromRub(
                            currencyTo,
                            convertToRub(currencyFrom, sum)
                        );
                    }

                    result.innerHTML += `${text}<br>Результат: ${convertedValue}<br><br>`;
                }
            }
        })
        .then(askUser)
        .catch(() => {});
}

function recognizeText() {
    return new Promise((resolve, reject) => {
        const recognition = new (window.SpeechRecognition ||
        window.webkitSpeechRecognition ||
        window.mozSpeechRecognition ||
        window.msSpeechRecognition)();

        /*const speechRecognitionList = new (window.SpeechGrammarList ||
         window.webkitSpeechGrammarList ||
         window.mozSpeechGrammarList ||
         window.msSpeechGrammarList)();

         speechRecognitionList.addFromString(grammar, 1);
         recognition.grammars = speechRecognitionList;*/

        recognition.lang = 'ru';
        recognition.interimResults = false;
        recognition.continuous = true;
        recognition.maxAlternatives = 5;
        recognition.start();

        recognition.onresult = function (event) {
            resolve(event.results[0][0].transcript);
        };
    });
}

function convertFromRub(currencyTo, sum) {
    const currencyToInfo = DAILY_RATES.Valute[currencyTo];
    const nominalTo = currencyToInfo.Nominal;
    const valueTo = currencyToInfo.Value;
    return sum / (valueTo / nominalTo);
}

function convertToRub(currencyFrom, sum) {
    const currencyFromInfo = DAILY_RATES.Valute[currencyFrom];
    const nominalFrom = currencyFromInfo.Nominal;
    const valueFrom = currencyFromInfo.Value;
    return sum * (valueFrom / nominalFrom);
}