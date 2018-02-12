var routesPatient = function(app, Patient){
	app.get('/:apikey/Patient', Patient.get);
	app.post('/:apikey/Patient', Patient.post);
}
module.exports = routesPatient