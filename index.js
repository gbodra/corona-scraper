const http = require('http')
const https = require('https')
const querystring = require('querystring');
require('dotenv').config()

const options = {
	hostname: 'plataforma.saude.gov.br',
	port: 80,
	path: '/novocoronavirus/resources/scripts/database.js',
	method: 'GET'
}

const req = http.request(options, res => {
	let data = '';

	res.on('data', (chunk) => {
		data += chunk;
	});

	res.on('end', () => {
		dataClean = data.replace('var database=', '');
		dataJson = JSON.parse(dataClean);
		dataBrazil = dataJson.brazil;
		dataBrazilLast = dataBrazil[dataBrazil.length - 1].values;
		dataBrazilUpdate = dataBrazil[dataBrazil.length - 1];
		lastUpdate = dataBrazilUpdate.date + ' ' + dataBrazilUpdate.time

		let totalCases = 0;
		let totalSuspects = 0;
		let totalDeaths = 0;

		for (var value in dataBrazilLast) {
			if (dataBrazilLast[value].hasOwnProperty('cases')) {
				totalCases += dataBrazilLast[value].cases;
				totalSuspects += dataBrazilLast[value].suspects;
				totalDeaths += dataBrazilLast[value].deaths;
			}
		}
		totalCases = isNaN(totalCases) ? 0 : totalCases;
		totalSuspects = isNaN(totalSuspects) ? 0 : totalSuspects;
		totalDeaths = isNaN(totalDeaths) ? 0 : totalDeaths;

		const parameters = {
			chat_id: process.env.CHAT_ID,
			text: '[COVID-19]\nUltima atualizacao: ' + lastUpdate + '\nCasos: ' + totalCases + '\nSuspeitas: ' + totalSuspects + '\nMortes: ' + totalDeaths
		}
		const get_request_args = querystring.stringify(parameters);

		const optionsTelegram = {
			hostname: 'api.telegram.org',
			port: 443,
			path: '/bot' + process.env.TG_TOKEN + '/sendMessage?' + get_request_args,
			method: 'GET'
		}

		const reqTelegram = https.request(optionsTelegram, resTelegram => {
			resTelegram.on('end', () => {
				console.log('Mensagem enviada!');
			});
		});

		reqTelegram.on('error', error => {
			console.error(error)
		});

		reqTelegram.end();

		console.log('Ultima atualizacao: ' + lastUpdate);
		console.log('Casos: ' + totalCases + '\nSuspeitas: ' + totalSuspects + '\nMortes: ' + totalDeaths);
	});
});

req.on('error', error => {
	console.error(error)
});

req.end();
