window.onload = function () {
    askUser();
};

function askUser() {
    recognizeText()
        .then(text => {
            const result = document.getElementById('result');

            if(text === 'стоп') {
                result.innerHTML += 'Пока!';
                return Promise.reject('');
            }

            result.innerHTML += `Ты сказал: ${text}<br>`;
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

        recognition.lang = 'ru';
        recognition.interimResults = false;
        recognition.maxAlternatives = 5;
        recognition.start();

        recognition.onresult = function (event) {
            resolve(event.results[0][0].transcript);

        };
    });
}