var routesPatient = function(app, Patient){
	app.get('/:apikey/Patient', Patient.get.patient);
	app.get('/:apikey/Patient/:patient_id?/Identifier/:identifier_id?', Patient.get.identifier);

	app.post('/:apikey/Patient', Patient.post.patient);
	app.post('/:apikey/Patient/:patient_id?/Identifier', Patient.post.identifier);
	app.post('/:apikey/Patient/:patient_id?/HumanName', Patient.post.humanName);

	app.put('/:apikey/Patient/:patient_id?/Identifier/:identifier_id?', Patient.put.identifier);
	app.put('/:apikey/Patient/:patient_id?/HumanName/:human_name_id?', Patient.put.humanName);

}
module.exports = routesPatient