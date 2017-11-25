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
        if(mobileAndTabletcheck()) {
            detectCommand(event.results[event.results.length - 1][0].transcript);
            micButton.classList.remove('mdl-button--colored');
            recognition.stop();
        } else{
            detectCommand(event.results[event.results.length - 1][0].transcript);
        }
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

function mobileAndTabletcheck() {
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
}