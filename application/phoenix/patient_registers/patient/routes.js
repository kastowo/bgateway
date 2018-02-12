var routesPatient = function(app, Patient){
	app.get('/:apikey/Patient', Patient.get.patient);
	app.get('/:apikey/PatientAnimal', Patient.get.patientAnimal);
	app.get('/:apikey/PatientContact', Patient.get.patientContact);
	app.get('/:apikey/PatientLink', Patient.get.patientLink);

	app.post('/:apikey/patient', Patient.post.patient);
	app.post('/:apikey/patient-animal', Patient.post.patientAnimal);
	app.post('/:apikey/patient-contact', Patient.post.patientContact);
	app.post('/:apikey/patient-link', Patient.post.patientLink);
	app.post('/:apikey/patient-communication', Patient.post.patientCommunication);
	
}
module.exports = routesPatient;