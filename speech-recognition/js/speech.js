const WORD_FORMS = {
    'USD': ['доллар', 'доллары', 'долларов', 'доллара', 'долларах'],
    'RUB': ['руб.', 'рубль', 'рубли', 'рублей', 'рубля', 'рублях'],
    'EUR': ['евро']
};

window.onload = function () {
    askUser();
};

function askUser() {
    return recognizeText()
        .then(text => {
            const result = document.getElementById('result');

            if(text === 'выход') {
                result.innerHTML += 'Пока!';
                return Promise.reject('');
            }

            const foundWords = text.match( /переведи\s+([\d]+)\s+([а-я.]+)\s+в\s+([а-я]+)/i );
            if(foundWords[1] === undefined || foundWords[2] === undefined || foundWords[3] === undefined) {
                result.innerHTML += `Не удалось распознать фразу/<br><br>`;
            } else {
                const sum = parseFloat(foundWords[1]);
                const currencyFrom = Object.keys(WORD_FORMS).find(key => WORD_FORMS[key].indexOf(foundWords[2]) >= 0);
                const currencyTo = Object.keys(WORD_FORMS).find(key => WORD_FORMS[key].indexOf(foundWords[3]) >= 0);

                if(!currencyFrom || !currencyTo) {
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
        recognition.maxAlternatives = 5;
        recognition.start();

        recognition.onresult = function (event) {
            //console.log(event.results);
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