var routesPatient = function(app, Patient){
	app.get('/:apikey/Patient', Patient.get.patient);
	app.get('/:apikey/Patient/:patient_id?/Identifier/:identifier_id?', Patient.get.identifier);

	app.post('/:apikey/Patient', Patient.post.patient);
	app.post('/:apikey/Patient/:patient_id?/Identifier', Patient.post.identifier);
	app.post('/:apikey/Patient/:patient_id?/HumanName', Patient.post.humanName);
	app.post('/:apikey/Patient/:patient_id?/Telecom', Patient.post.telecom);
	app.post('/:apikey/Patient/:patient_id?/Address', Patient.post.address);

	app.put('/:apikey/Patient/:patient_id?/Identifier/:identifier_id?', Patient.put.identifier);
	app.put('/:apikey/Patient/:patient_id?/HumanName/:human_name_id?', Patient.put.humanName);
	app.put('/:apikey/Patient/:patient_id?/Telecom/:contact_point_id?', Patient.put.telecom);
	app.put('/:apikey/Patient/:patient_id?/Address/:address_id?', Patient.put.address);

}
module.exports = routesPatient