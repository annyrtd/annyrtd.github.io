function CBR_XML_Daily_Ru(rates) {
    window.DAILY_RATES = rates;
    /*function trend(current, previous) {
        if (current > previous) return ' ▲';
        if (current < previous) return ' ▼';
        return '';
    }

    var USDrate = rates.Valute.USD.Value.toFixed(4).replace('.', ',');
    var USD = document.getElementById('USD');
    USD.innerHTML = USD.innerHTML.replace('00,0000', USDrate);
    USD.innerHTML += trend(rates.Valute.USD.Value, rates.Valute.USD.Previous);

    var EURrate = rates.Valute.EUR.Value.toFixed(4).replace('.', ',');
    var EUR = document.getElementById('EUR');
    EUR.innerHTML = EUR.innerHTML.replace('00,0000', EURrate);
    EUR.innerHTML += trend(rates.Valute.EUR.Value, rates.Valute.EUR.Previous);*/
}