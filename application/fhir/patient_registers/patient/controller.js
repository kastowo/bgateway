var Apiclient = require('apiclient');
var sha1 = require('sha1');
var validator = require('validator');
var bytes = require('bytes');
var uniqid = require('uniqid');
var yamlconfig = require('yaml-config');
var path = require('path');

var configYaml = yamlconfig.readConfig(path.resolve('../../application/config/config.yml'));

var host = configYaml.fhir.host;
var port = configYaml.fhir.port;

//event emitter
const EventEmitter = require('events');
class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();

//phoenix
//query data melalui rest phoenix
var seedPhoenix = require(path.resolve('../../application/config/seed_phoenix.json'));
	seedPhoenix.base.hostname = configYaml.phoenix.host;
	seedPhoenix.base.port 		= configYaml.phoenix.port;
	
var Api = new Apiclient(seedPhoenix);

seedPhoenixFHIR = require(path.resolve('../../application/config/seed_phoenix_fhir.json'));
seedPhoenixFHIR.base.hostname = configYaml.phoenix.host;
seedPhoenixFHIR.base.port 	  = configYaml.phoenix.port;

var ApiFHIR  = new Apiclient(seedPhoenixFHIR);

var controller = {
			get: {
				patient: function getPatient(req, res){
					var ipAddres = req.connection.remoteAddress;
					var apikey = req.params.apikey;
					var regex = new RegExp("([0-9]{4}[-](0[1-9]|1[0-2])[-]([0-2]{1}[0-9]{1}|3[0-1]{1})|([0-2]{1}[0-9]{1}|3[0-1]{1})[-](0[1-9]|1[0-2])[-][0-9]{4})");

					//params from query string
					var patientId = req.query._id;
					var patientActive = req.query.active;
					var patientAddress = req.query.address;
					var patientAddressCity = req.query.city;
					var patientAddressCountry = req.query.country;
					var patientAddressPostalCode = req.query.postal_code;
					var patientAddressState = req.query.state; //space encodeURI masih ada bug untuk sprintf
					var patientAddressUse = req.query.address_use; 
					var patientAnimalBreed = req.query.animal_breed; 
					var patientAnimalSpecies = req.query.animal_species; 
					var patientBirthdate = req.query.birthdate; 
					var patientDeathdate = req.query.deathdate; 
					var patientDeceased = req.query.deceased; 
					var patientEmail = req.query.email; 
					var patientFamily = req.query.family; 
					var patientGender = req.query.gender; 
					var patientGeneralPractitioner = req.query.general_practitioner; //belum ada modul practitioner
					var patientGiven = req.query.given; 
					var patientIdentifier = req.query.identifier; 
					var patientLanguage = req.query.language; 
					var patientLink = req.query.link; //patient_id or related_person_id
					var patientName = req.query.name; 
					var patientOrganization = req.query.organization; 
					var patientPhoneContact = req.query.phone; 
					// var patientPhonetic = req.query.phonetic; //butuh riset lagi
					var patientTelecom = req.query.telecom; 


					var qString = {};
					if(typeof patientId !== 'undefined'){
						if(!validator.isEmpty(patientId)){
							qString._id = patientId; 
						}else{
							res.json({"err_code": 1, "err_msg": "Patient id is required."});
						}
					}

					if(typeof patientActive !== 'undefined'){
						if(validator.isBoolean(patientActive)){
							qString.active = patientActive; 
						}else{
							res.json({"err_code": 1, "err_msg": "Active is boolean."});
						}
					}
					
					if(typeof patientAddress !== 'undefined'){
						if(!validator.isEmpty(patientAddress)){
							patientAddress = decodeURI(patientAddress);
							if(patientAddress.indexOf(" ") > 0){
								qString.address = patientAddress.replace(/ /g, "nonbreaking_space"); 
							}else{
								qString.address = patientAddress; 	
							}
						}else{
							res.json({"err_code": 1, "err_msg": "Address is empty."});
						}
					}
					
					if(typeof patientAddressCity !== 'undefined'){
						if(!validator.isEmpty(patientAddressCity)){
							patientAddressCity = decodeURI(patientAddressCity);
							if(patientAddressCity.indexOf(" ") > 0){
								qString.city = patientAddressCity.replace(/ /g, "nonbreaking_space"); 
							}else{
								qString.city = patientAddressCity; 
							}
						}else{
							res.json({"err_code": 1, "err_msg": "City is empty."});
						}
					}

					if(typeof patientAddressCountry !== 'undefined'){
						if(!validator.isEmpty(patientAddressCountry)){
							patientAddressCountry = decodeURI(patientAddressCountry);
							if(patientAddressCountry.indexOf(" ") > 0){
								qString.country = patientAddressCountry.replace(/ /g, "nonbreaking_space"); 
							}else{
								qString.country = patientAddressCountry; 
							}						
						}else{
							res.json({"err_code": 1, "err_msg": "Country is empty."});
						}
					}

					if(typeof patientAddressPostalCode !== 'undefined'){
						if(validator.isPostalCode(patientAddressPostalCode, 'any')){
							qString.postalcode = patientAddressPostalCode; 
						}else{
							res.json({"err_code": 1, "err_msg": "Postal code is invalid format."});
						}
					}

					if(typeof patientAddressState !== 'undefined'){
						if(!validator.isEmpty(patientAddressState)){
							patientAddressState = decodeURI(patientAddressState);
							if(patientAddressState.indexOf(" ") > 0){
								qString.state = patientAddressState.replace(/ /g, "nonbreaking_space"); 
							}else{
								qString.state = patientAddressState; 
							}
						}else{
							res.json({"err_code": 1, "err_msg": "State is empty."});
						}
					}

					if(typeof patientAddressUse !== 'undefined'){
						if(!validator.isEmpty(patientAddressUse)){
							qString.addressuse = patientAddressUse; 
						}else{
							res.json({"err_code": 1, "err_msg": "Address use code is empty."});
						}
					}

					if(typeof patientAnimalBreed !== 'undefined'){
						if(!validator.isEmpty(patientAnimalBreed)){
							qString.animalbreed = patientAnimalBreed; 
						}else{
							res.json({"err_code": 1, "err_msg": "Animal breed is empty."});
						}
					}

					if(typeof patientAnimalSpecies !== 'undefined'){
						if(!validator.isEmpty(patientAnimalSpecies)){
							qString.animalspecies = patientAnimalSpecies; 
						}else{
							res.json({"err_code": 1, "err_msg": "Animal species is empty."});
						}
					}

					if(typeof patientBirthdate !== 'undefined'){
						if(!validator.isEmpty(patientBirthdate)){
							if(!regex.test(patientBirthdate)){
								res.json({"err_code": 1, "err_msg": "Birthdate invalid format."});
							}else{
								qString.birthdate = patientBirthdate; 
							}	
						}else{
							res.json({"err_code": 1, "err_msg": "Birthdate is empty."});
						}
					}

					if(typeof patientDeathdate !== 'undefined'){
						if(!validator.isEmpty(patientDeathdate)){
							if(!regex.test(patientDeathdate)){
								res.json({"err_code": 1, "err_msg": "Deathdate invalid format."});
							}else{
								qString.deathdate = patientDeathdate; 
							}	
						}else{
							res.json({"err_code": 1, "err_msg": "Deathdate is empty."});
						}
					}
					
					if(typeof patientDeceased !== 'undefined'){
						if(validator.isBoolean(patientDeceased)){
							qString.deceased = patientDeceased; 
						}else{
							res.json({"err_code": 1, "err_msg": "Deceased is boolean."});
						}
					}

					if(typeof patientEmail !== 'undefined'){
						if(validator.isEmail(patientEmail)){
							qString.email = patientEmail.replace(/@/g, "at_sign"); 
						}else{
							res.json({"err_code": 1, "err_msg": "Email is empty."});
						}
					}

					if(typeof patientFamily !== 'undefined'){
						if(!validator.isEmpty(patientFamily)){
							qString.family = patientFamily;
						}else{
							res.json({"err_code": 1, "err_msg": "Family is empty."});
						}
					}

					if(typeof patientGender !== 'undefined'){
						if(!validator.isEmpty(patientGender)){
							qString.gender = patientGender;
						}else{
							res.json({"err_code": 1, "err_msg": "Gender is empty."});
						}
					}

					if(typeof patientGiven !== 'undefined'){
						if(!validator.isEmpty(patientGiven)){
							qString.given = patientGiven;
						}else{
							res.json({"err_code": 1, "err_msg": "Given is empty."});
						}
					}

					if(typeof patientIdentifier !== 'undefined'){
						if(!validator.isEmpty(patientIdentifier)){
							qString.identifier = patientIdentifier;
						}else{
							res.json({"err_code": 1, "err_msg": "Identifier is empty."});
						}
					}

					if(typeof patientLanguage !== 'undefined'){
						if(!validator.isEmpty(patientLanguage)){
							qString.language = patientLanguage;
						}else{
							res.json({"err_code": 1, "err_msg": "Language is empty."});
						}
					}

					if(typeof patientLink !== 'undefined'){
						if(!validator.isEmpty(patientLink)){
							qString.link = patientLink;
						}else{
							res.json({"err_code": 1, "err_msg": "Language is empty."});
						}
					}

					if(typeof patientName !== 'undefined'){
						if(!validator.isEmpty(patientName)){
							if(patientName.indexOf(" ") > 0){
								qString.name = patientName.replace(/ /g, "nonbreaking_space"); 
							}else{
								qString.name = patientName;
							}
						}else{
							res.json({"err_code": 1, "err_msg": "Name is empty."});
						}
					}

					if(typeof patientOrganization !== 'undefined'){
						if(!validator.isEmpty(patientOrganization)){
							qString.organization = patientOrganization;
						}else{
							res.json({"err_code": 1, "err_msg": "Organization is empty."});
						}
					}

					if(typeof patientPhoneContact !== 'undefined'){
						if(validator.isMobilePhone(patientPhoneContact, 'any')){
							qString.phone = patientPhoneContact;
						}else{
							res.json({"err_code": 1, "err_msg": "Invalid format phone."});
						}
					}

					// if(typeof patientPhonetic !== 'undefined'){
					// 	if(!validator.isEmpty(patientPhonetic)){
					// 		qString.phonetic = patientPhonetic;
					// 	}else{
					// 		res.json({"err_code": 1, "err_msg": "Phonetic is empty."});
					// 	}
					// }

					if(typeof patientTelecom !== 'undefined'){
						if(!validator.isEmpty(patientTelecom)){
							if(validator.isEmail(patientTelecom)){
								qString.telecom = patientTelecom.replace(/@/g, "at_sign"); 
							}else{
								qString.telecom = patientTelecom; 
							}
						}else{
							res.json({"err_code": 1, "err_msg": "Telecom is empty."});
						}
					}

					seedPhoenixFHIR.path.GET = {
						"Patient" : {
							"location": "%(apikey)s/Patient",
							"query": qString
						}
					}
					var ApiFHIR = new Apiclient(seedPhoenixFHIR);

					checkApikey(apikey, ipAddres, function(result){
						if(result.err_code == 0){
							ApiFHIR.get('Patient', {"apikey": apikey}, {}, function (error, response, body) {
							  if(error){
							  	res.json(error);
							  }else{
							  	var patient = JSON.parse(body); //object
							  	//cek apakah ada error atau tidak
							  	if(patient.err_code == 0){
								  	//cek jumdata dulu
								  	if(patient.data.length > 0){
								  		newPatient = [];
								  		for(i=0; i < patient.data.length; i++){
								  			myEmitter.once("getPatientAnimal", function(patient, index, newPatient, countPatient){
								  				myEmitter.once("getAttachment", function(patient, index, newPatient, countPatient){
										  			qString = {};
										  			qString.patient_id = patient.id;
											  		seedPhoenixFHIR.path.GET = {
															"Attachment" : {
																"location": "%(apikey)s/Attachment",
																"query": qString
															}
														}
														var ApiFHIR = new Apiclient(seedPhoenixFHIR);

														ApiFHIR.get("Attachment", {"apikey": apikey}, {}, function(error, response, body){
															attachment = JSON.parse(body);
															if(attachment.err_code == 0){
																var objectPatient = {};
																objectPatient.resourceType = patient.resourceType;
																objectPatient.id = patient.id;
																objectPatient.active = patient.active;
																objectPatient.gender = patient.gender;
																objectPatient.birthDate = patient.birthdate;
																objectPatient.deceasedBoolean = patient.deceasedBoolean;
																objectPatient.deceasedDateTime = patient.deceasedDateTime;
																objectPatient.maritalStatus = patient.maritalStatus;
																objectPatient.multipleBirth = patient.multipleBirth;
																objectPatient.multipleInteger = patient.multipleInteger;
																objectPatient.photo = attachment.data;
																objectPatient.animal = patient.animal;
																objectPatient.managingOrganization = patient.managingOrganization;
																
																
																newPatient[index] = objectPatient;

																myEmitter.once("getIdentifier", function(patient, index, newPatient, countPatient){
																	//get identifier
													  			qString = {};
													  			qString.patient_id = patient.id;
														  		seedPhoenixFHIR.path.GET = {
																		"Identifier" : {
																			"location": "%(apikey)s/Identifier",
																			"query": qString
																		}
																	}
																	var ApiFHIR = new Apiclient(seedPhoenixFHIR);

																	ApiFHIR.get('Identifier', {"apikey": apikey}, {}, function(error, response, body){
																		identifier = JSON.parse(body);
																		if(identifier.err_code == 0){
																			var objectPatient = {};
																			objectPatient.resourceType = patient.resourceType;
																			objectPatient.id = patient.id;
																			objectPatient.identifier = identifier.data;
																			objectPatient.active = patient.active;
																			objectPatient.gender = patient.gender;
																			objectPatient.birthDate = patient.birthDate;
																			objectPatient.deceasedBoolean = patient.deceasedBoolean;
																			objectPatient.deceasedDateTime = patient.deceasedDateTime;
																			objectPatient.maritalStatus = patient.maritalStatus;
																			objectPatient.multipleBirth = patient.multipleBirth;
																			objectPatient.multipleInteger = patient.multipleInteger;
																			objectPatient.photo = patient.photo;
																			objectPatient.animal = patient.animal;
																			objectPatient.managingOrganization = patient.managingOrganization;
																			
																			newPatient[index] = objectPatient

																			//human_name
																			myEmitter.once('getHumanName', function(patient, index, newPatient, countPatient){
																				qString = {};
																  			qString.patient_id = patient.id;
																	  		seedPhoenixFHIR.path.GET = {
																					"HumanName" : {
																						"location": "%(apikey)s/HumanName",
																						"query": qString
																					}
																				}

																				var ApiFHIR = new Apiclient(seedPhoenixFHIR);
																				ApiFHIR.get('HumanName', {"apikey": apikey}, {}, function(error, response, body){
																					humanName = JSON.parse(body);
																					if(humanName.err_code == 0){
																						var objectPatient = {};
																						objectPatient.resourceType = patient.resourceType;
																						objectPatient.id = patient.id;
																						objectPatient.identifier = patient.identifier;
																						objectPatient.active = patient.active;
																						objectPatient.name = humanName.data;
																						objectPatient.gender = patient.gender;
																						objectPatient.birthDate = patient.birthDate;
																						objectPatient.deceasedBoolean = patient.deceasedBoolean;
																						objectPatient.deceasedDateTime = patient.deceasedDateTime;
																						objectPatient.maritalStatus = patient.maritalStatus;
																						objectPatient.multipleBirth = patient.multipleBirth;
																						objectPatient.multipleInteger = patient.multipleInteger;
																						objectPatient.photo = patient.photo;
																						objectPatient.animal = patient.animal;
																						objectPatient.managingOrganization = patient.managingOrganization;

																						newPatient[index] = objectPatient;
																						
																						myEmitter.once('getContactPoint', function(patient, index, newPatient, countPatient){
																							qString = {};
																			  			qString.patient_id = patient.id;
																				  		seedPhoenixFHIR.path.GET = {
																								"ContactPoint" : {
																									"location": "%(apikey)s/ContactPoint",
																									"query": qString
																								}
																							}

																							var ApiFHIR = new Apiclient(seedPhoenixFHIR);

																							ApiFHIR.get('ContactPoint', {"apikey": apikey}, {}, function(error, response, body){
																								contactPoint = JSON.parse(body);
																								if(contactPoint.err_code == 0){
																									var objectPatient = {};
																									objectPatient.resourceType = patient.resourceType;
																									objectPatient.id = patient.id;
																									objectPatient.identifier = patient.identifier;
																									objectPatient.active = patient.active;
																									objectPatient.name = patient.name;
																									objectPatient.telecom = contactPoint.data;
																									objectPatient.gender = patient.gender;
																									objectPatient.birthDate = patient.birthDate;
																									objectPatient.deceasedBoolean = patient.deceasedBoolean;
																									objectPatient.deceasedDateTime = patient.deceasedDateTime;
																									objectPatient.maritalStatus = patient.maritalStatus;
																									objectPatient.multipleBirth = patient.multipleBirth;
																									objectPatient.multipleInteger = patient.multipleInteger;
																									objectPatient.photo = patient.photo;
																									objectPatient.animal = patient.animal;
																									objectPatient.managingOrganization = patient.managingOrganization;

																									newPatient[index] = objectPatient;
																									
																									myEmitter.once('getAddress', function(patient, index, newPatient, countPatient){
																										qString = {};
																						  			qString.patient_id = patient.id;
																							  		seedPhoenixFHIR.path.GET = {
																											"Address" : {
																												"location": "%(apikey)s/Address",
																												"query": qString
																											}
																										}

																										var ApiFHIR = new Apiclient(seedPhoenixFHIR);

																										ApiFHIR.get('Address', {"apikey": apikey}, {}, function(error, response, body){
																											address = JSON.parse(body);
																											
																											if(address.err_code == 0){
																												var objectPatient = {};
																												objectPatient.resourceType = patient.resourceType;
																												objectPatient.id = patient.id;
																												objectPatient.identifier = patient.identifier;
																												objectPatient.active = patient.active;
																												objectPatient.name = patient.name;
																												objectPatient.telecom = patient.telecom;
																												objectPatient.gender = patient.gender;
																												objectPatient.birthDate = patient.birthDate;
																												objectPatient.deceasedBoolean = patient.deceasedBoolean;
																												objectPatient.deceasedDateTime = patient.deceasedDateTime;
																												objectPatient.address = address.data;
																												objectPatient.maritalStatus = patient.maritalStatus;
																												objectPatient.multipleBirth = patient.multipleBirth;
																												objectPatient.multipleInteger = patient.multipleInteger;
																												objectPatient.photo = patient.photo;
																												objectPatient.animal = patient.animal;
																												objectPatient.managingOrganization = patient.managingOrganization;

																												newPatient[index] = objectPatient;
																												
																												myEmitter.once("getPatientContact", function(patient, index, newPatient, countPatien){
																													qString = {};
																									  			qString.patient_id = patient.id;
																										  		seedPhoenixFHIR.path.GET = {
																														"PatientContact" : {
																															"location": "%(apikey)s/PatientContact",
																															"query": qString
																														}
																													}

																													var ApiFHIR = new Apiclient(seedPhoenixFHIR);

																													ApiFHIR.get('PatientContact', {"apikey": apikey}, {}, function(error, response, body){
																														patientContact = JSON.parse(body);
																														
																														if(patientContact.err_code == 0){
																															var objectPatient = {};
																															objectPatient.resourceType = patient.resourceType;
																															objectPatient.id = patient.id;
																															objectPatient.identifier = patient.identifier;
																															objectPatient.active = patient.active;
																															objectPatient.name = patient.name;
																															objectPatient.telecom = patient.telecom;
																															objectPatient.gender = patient.gender;
																															objectPatient.birthDate = patient.birthDate;
																															objectPatient.deceasedBoolean = patient.deceasedBoolean;
																															objectPatient.deceasedDateTime = patient.deceasedDateTime;
																															objectPatient.address = patient.address;
																															objectPatient.maritalStatus = patient.maritalStatus;
																															objectPatient.multipleBirth = patient.multipleBirth;
																															objectPatient.multipleInteger = patient.multipleInteger;
																															objectPatient.photo = patient.photo;
																															
																															contactTeleponJoin = [];
																															for(k=0; k < patientContact.data.length; k++){
																																contactTeleponJoin = contactTeleponJoin.concat(patientContact.data[k].telecom);
																															}
																															patientContact.data[0].telecom = contactTeleponJoin; // set ke ke data pertama karena sudah digabung
																															objectPatient.contact = removeDuplicates(patientContact.data);
																															objectPatient.animal = patient.animal;
																															objectPatient.managingOrganization = patient.managingOrganization;

																															newPatient[index] = objectPatient;

																															myEmitter.once("getPatientLink", function(patient, index, newPatient, countPatien){
																																qString = {};
																												  			qString.patient_id = patient.id;
																													  		seedPhoenixFHIR.path.GET = {
																																	"PatientLink" : {
																																		"location": "%(apikey)s/PatientLink",
																																		"query": qString
																																	}
																																}

																																var ApiFHIR = new Apiclient(seedPhoenixFHIR);

																																ApiFHIR.get('PatientLink', {"apikey": apikey}, {}, function(error, response, body){
																																	patientLink = JSON.parse(body);
																																	if(patientLink.err_code == 0){
																																		var objectPatient = {};
																																		objectPatient.resourceType = patient.resourceType;
																																		objectPatient.id = patient.id;
																																		objectPatient.identifier = patient.identifier;
																																		objectPatient.active = patient.active;
																																		objectPatient.name = patient.name;
																																		objectPatient.telecom = patient.telecom;
																																		objectPatient.gender = patient.gender;
																																		objectPatient.birthDate = patient.birthDate;
																																		objectPatient.deceasedBoolean = patient.deceasedBoolean;
																																		objectPatient.deceasedDateTime = patient.deceasedDateTime;
																																		objectPatient.address = patient.address;
																																		objectPatient.maritalStatus = patient.maritalStatus;
																																		objectPatient.multipleBirth = patient.multipleBirth;
																																		objectPatient.multipleInteger = patient.multipleInteger;
																																		objectPatient.photo = patient.photo;
																																		objectPatient.contact = patient.contact;
																																		objectPatient.animal = patient.animal;
																																		objectPatient.managingOrganization = patient.managingOrganization;
																																		objectPatient.link = patientLink.data;

																																		newPatient[index] = objectPatient;

																																		if(index == countPatient -1 ){
																																			res.json({"err_code": 0, "data":newPatient});				
																																		}
																																	}else{
																																		res.json(patientLink);
																																	}
																																})
																															})
																															myEmitter.emit('getPatientLink', objectPatient, index, newPatient, countPatient);
																														}else{
																															res.json(patientContact);
																														}
																													})
																												})

																												myEmitter.emit('getPatientContact', objectPatient, index, newPatient, countPatient);
																											}else{
																												res.json(address);			
																											}
																										})
																									})
																									myEmitter.emit('getAddress', objectPatient, index, newPatient, countPatient);			
																								}else{
																									res.json(contactPoint);			
																								}
																							})
																						})
																						myEmitter.emit('getContactPoint', objectPatient, index, newPatient, countPatient);
																					}else{
																						res.json(humanName);			
																					}
																				})
																			})
																			myEmitter.emit('getHumanName', objectPatient, index, newPatient, countPatient);
																		}else{
																			res.json(identifier);
																		}
																	})
																})
																myEmitter.emit("getIdentifier", objectPatient, index, newPatient, countPatient);
															}else{
																res.json(attachment);
															}
														})
								  				})
													//check animal id
								  				if(patient.patient_animal_id == 'null'){
									  				myEmitter.emit("getAttachment", patient, index, newPatient, countPatient);
									  			}else{
									  				qString = {};
										  			qString._id = patient.data[i].patient_animal_id;
												  		seedPhoenixFHIR.path.GET = {
																"PatientAnimal" : {
																	"location": "%(apikey)s/PatientAnimal",
																	"query": qString
																}
															}
														var ApiFHIR = new Apiclient(seedPhoenixFHIR);
														ApiFHIR.get("PatientAnimal", {"apikey": apikey}, {}, function(error, response, body){
															patientAnimal = JSON.parse(body);
															if(patientAnimal.err_code == 0){
																var objectPatient = {};
																objectPatient.resourceType = patient.resourceType;
																objectPatient.id = patient.id;
																objectPatient.active = patient.active;
																objectPatient.gender = patient.gender;
																objectPatient.birthDate = patient.birthdate;
																objectPatient.deceasedBoolean = patient.deceasedBoolean;
																objectPatient.deceasedDateTime = patient.deceasedDateTime;
																objectPatient.maritalStatus = patient.maritalStatus;
																objectPatient.multipleBirth = patient.multipleBirth;
																objectPatient.multipleInteger = patient.multipleInteger;
																objectPatient.animal = patientAnimal.data;
																objectPatient.managingOrganization = patient.managingOrganization;

																newPatient[index] = objectPatient;

																myEmitter.emit("getAttachment", patient, index, newPatient, countPatient);
															}else{
																res.json(patientAnimal);
															}
														})
									  			}	
								  			})
												myEmitter.emit("getPatientAnimal", patient.data[i], i, newPatient, patient.data.length);
								  		}
								  		// res.json({"err_code": 0, "data":person.data});
								  	}else{
							  			res.json({"err_code": 2, "err_msg": "Patient is empty."});	
								  	}
							  	}else{
							  		res.json(patient);
							  	}
							  }
							});
						}else{
							result.err_code = 500;
							res.json(result);
						}
					});	
				},
				identifier: function getIdentifier(req, res){
					var ipAddres = req.connection.remoteAddress;
					var apikey = req.params.apikey;
					var regex = new RegExp("([0-9]{4}[-](0[1-9]|1[0-2])[-]([0-2]{1}[0-9]{1}|3[0-1]{1})|([0-2]{1}[0-9]{1}|3[0-1]{1})[-](0[1-9]|1[0-2])[-][0-9]{4})");
					var patientId = req.params.patient_id;
					var identifierId = req.params.identifier_id;
					
					checkApikey(apikey, ipAddres, function(result){
						if(result.err_code == 0){	
							checkUniqeValue(apikey, "PATIENT_ID|" + patientId, 'PATIENT', function(resPatientID){
								if(resPatientID.err_code > 0){
									if(typeof identifierId !== 'undefined' && !validator.isEmpty(identifierId)){
										checkUniqeValue(apikey, "IDENTIFIER_ID|" + identifierId, 'IDENTIFIER', function(resIdentifierID){
											if(resIdentifierID.err_code > 0){
												//get identifier
								  			qString = {};
								  			qString.patient_id = patientId;
								  			qString._id = identifierId;
									  		seedPhoenixFHIR.path.GET = {
													"Identifier" : {
														"location": "%(apikey)s/Identifier",
														"query": qString
													}
												}
												var ApiFHIR = new Apiclient(seedPhoenixFHIR);

												ApiFHIR.get('Identifier', {"apikey": apikey}, {}, function(error, response, body){
													identifier = JSON.parse(body);
													if(identifier.err_code == 0){
														res.json({"err_code": 0, "data":identifier.data});	
													}else{
														res.json(identifier);
													}
												})
											}else{

											}
										})
									}else{

									}
								}else{
									res.json({"err_code": 501, "err_msg": "Patient Id not found"});		
								}
							})
						}else{
							result.err_code = 500;
							res.json(result);
						}	
					});
				} 
			},
			post: {
				patient: function addPatient(req, res){
					var ipAddres = req.connection.remoteAddress;
					var apikey = req.params.apikey;
					var regex = new RegExp("([0-9]{4}[-](0[1-9]|1[0-2])[-]([0-2]{1}[0-9]{1}|3[0-1]{1})|([0-2]{1}[0-9]{1}|3[0-1]{1})[-](0[1-9]|1[0-2])[-][0-9]{4})");

					var err_code = 0;
					var err_msg = "";

					//input check 
					//identifier
					if(typeof req.body.identifier.use !== 'undefined'){
						identifierUseCode =  req.body.identifier.use.trim().toLowerCase();
						if(validator.isEmpty(identifierUseCode)){
							err_code = 2;
							err_msg = "Identifier Use is required";
						}
					}else{
						err_code = 1;
						err_msg = "Please add sub-key 'use' in json identifier request.";
					} 

					//type code
					if(typeof req.body.identifier.type !== 'undefined'){
						identifierTypeCode =  req.body.identifier.type.trim().toUpperCase();
						if(validator.isEmpty(identifierTypeCode)){
							err_code = 2;
							err_msg = "Identifier Type is required";
						}
					}else{
						err_code = 1;
						err_msg = "Please add sub-key 'type' in json identifier request.";
					} 

					//identifier uniqe value
					if(typeof req.body.identifier.value !== 'undefined'){
						identifierValue =  req.body.identifier.value.trim();
						if(validator.isEmpty(identifierValue)){
							err_code = 2;
							err_msg = "Identifier Value is required";
						}
					}else{
						err_code = 1;
						err_msg = "Please add sub-key 'value' in json identifier request.";
					}

					//identifier period start
					if(typeof req.body.identifier.period !== 'undefined'){
						period = req.body.identifier.period;
						if(period.indexOf("to") > 0){
							arrPeriod = period.split("to");
							identifierPeriodStart = arrPeriod[0];
							identifierPeriodEnd = arrPeriod[1];
							
							if(!regex.test(identifierPeriodStart) && !regex.test(identifierPeriodEnd)){
								err_code = 2;
								err_msg = "Identifier Period invalid date format.";
							}	
						}
						
					}else{
						err_code = 1;
						err_msg = "Please add key 'period' in json identifier request.";
					}  

					//name
					//use code
					if(typeof req.body.name.use !== 'undefined'){
						humanNameUseCode =  req.body.name.use.trim().toLowerCase();
						if(validator.isEmpty(humanNameUseCode)){
							err_code = 2;
							err_msg = "Name Use Code is required";
						}
					}else{
						err_code = 1;
						err_msg = "Please add sub-key 'use' in json name request.";
					} 

					//fullname
					if(typeof req.body.name.text !== 'undefined'){
						humanNameText =  req.body.name.text;
						if(validator.isEmpty(humanNameText)){
							err_code = 2;
							err_msg = "Name text is required";
						}
					}else{
						err_code = 1;
						err_msg = "Please add sub-key 'text' in your json name request.";
					} 

					//surname
					if(typeof req.body.name.family !== 'undefined'){
						humanNameFamily =  req.body.name.family;
						if(validator.isEmpty(humanNameFamily)){
							err_code = 2;
							err_msg = "Family name is required";
						}
					}else{
						err_code = 1;
						err_msg = "Please add sub-key 'family' in your json name request.";
					}

					//given name
					if(typeof req.body.name.given !== 'undefined'){
						humanNameGiven =  req.body.name.given;
						if(validator.isEmpty(humanNameGiven)){
							humanNameGiven = "";
						}
					}else{
						humanNameGiven = "";
					}

					//prefix name
					if(typeof req.body.name.prefix !== 'undefined'){
						humanNamePrefix =  req.body.name.prefix;
						if(validator.isEmpty(humanNamePrefix)){
							if(!typeof req.body.gender !== 'undefined'){
								gender = req.body.gender.trim().toLowerCase();
								if( gender == 'male'){
									humanNamePrefix =  'Mr';
								}else if(gender == 'female'){
									humanNamePrefix = 'Mrs';
								}else{
									humanNamePrefix = '';
								}		
							}			
						}
					}else{
						humanNamePrefix = '';
					}

					//suffix name
					if(typeof req.body.name.suffix !== 'undefined'){
						humanNameSuffix =  req.body.name.suffix;
					}else{
						humanNameSuffix =  "";
					}

					//period name
					if(typeof req.body.name.period !== 'undefined'){
						var period = req.body.name.period;
						if(period.indexOf("to") > 0){
							arrPeriod = period.split("to");
							humanNamePeriodStart = arrPeriod[0];
							humanNamePeriodEnd = arrPeriod[1];
							
							if(!regex.test(humanNamePeriodStart) && !regex.test(humanNamePeriodEnd)){
								err_code = 2;
								err_msg = "Identifier Period invalid date format.";
							}	
						}else{
							humanNamePeriodStart = "";
							humanNamePeriodEnd = "";
						}
					}else{
						humanNamePeriodStart = "";
						humanNamePeriodEnd = "";
					}


					//telecom
					if(typeof req.body.telecom.system !== 'undefined'){
						contactPointSystemCode =  req.body.telecom.system.trim().toLowerCase();
						if(validator.isEmpty(contactPointSystemCode)){
							err_code = 2;
							err_msg = "Contact Point System is required";
						}
					}else{
						err_code = 1;
						err_msg = "Please add sub-key 'system' in json telecom request.";
					}

					//telecom value
					if(typeof req.body.telecom.value !== 'undefined'){
						contactPointValue =  req.body.telecom.value;
						if(validator.isEmpty(contactPointValue)){
							err_code = 2;
							err_msg = "Contact Point Value is required";
						}
					}else{
						err_code = 1;
						err_msg = "Please add sub-key 'value' in json telecom request.";
					}

					//telecom use code
					if(typeof req.body.telecom.use !== 'undefined'){
						contactPointUseCode =  req.body.telecom.use.trim().toLowerCase();
						if(validator.isEmpty(contactPointUseCode)){
							err_code = 2;
							err_msg = "Telecom Use Code is required";
						}
					}else{
						err_code = 1;
						err_msg = "Please add sub-key 'use' in json telecom request.";
					} 

					//contact poin rank
					if(typeof req.body.telecom.rank !== 'undefined'){
						contactPointRank =  req.body.telecom.rank;
						if(!validator.isInt(contactPointRank)){
							err_code = 2;
							err_msg = "Telecom Rank must be number";
						}
					}else{
						err_code = 1;
						err_msg = "Please add sub-key 'rank' in json telecom request.";
					} 

					//contact point period
					if(typeof req.body.telecom.period !== 'undefined'){
						var period = req.body.telecom.period;
						if(period.indexOf("to") > 0){
							arrPeriod = period.split("to");
							contactPointPeriodStart = arrPeriod[0];
							contactPointPeriodEnd = arrPeriod[1];
							
							if(!regex.test(contactPointPeriodStart) && !regex.test(contactPointPeriodEnd)){
								err_code = 2;
								err_msg = "Telecom Period invalid date format.";
							}	
						}else{
							contactPointPeriodStart = "";
							contactPointPeriodEnd = "";
						}
					}else{
						contactPointPeriodStart = "";
						contactPointPeriodEnd = "";
					}

					//gender
					if(typeof req.body.gender !== 'undefined'){
						gender =  req.body.gender.trim().toLowerCase();
						if(validator.isEmpty(gender)){
							err_code = 2;
							err_msg = "Gender is required.";
						}
					}else{
						err_code = 1;
						err_msg = "Please add key 'gender' in json request.";
					}				

					//birthdate
					if(typeof req.body.birthdate !== 'undefined'){
						birthdate =  req.body.birthdate;
						if(validator.isEmpty(birthdate)){
							err_code = 2;
							err_msg = "Birthdate is required.";
						}else{
							if(!regex.test(birthdate)){
								err_code = 2;
								err_msg = "Birthdate invalid date format.";	
							}
						}
					}else{
						err_code = 1;
						err_msg = "Please add key 'birthdate' in json request.";
					}				

					//deceased
					if(typeof req.body.deceased.status !== 'undefined'){
						deceasedStatus =  req.body.deceased.status;
						if(deceasedStatus == true && typeof req.body.deceased.date_time !== 'undefined' && validator.isEmpty(req.body.deceased.date_time)){
							err_code = 2;
							err_msg = "Deceased date time is required.";
						}else{
							deceasedStatus = false;
						}
					}else{
						deceasedStatus = false;
					}			

					if(typeof req.body.deceased.date_time !== 'undefined'){
						deceasedDateTime = req.body.deceased.date_time;
						if(!regex.test(deceasedDateTime) && deceasedStatus == true){
								err_code = 2;
								err_msg = "Deceased Date Time invalid date format.";	
							}
					}else{
						deceasedDateTime = "";
					}

					//address use
					if(typeof req.body.address.use !== 'undefined'){
						addressUseCode =  req.body.address.use.trim().toLowerCase();
						if(validator.isEmpty(addressUseCode)){
							err_code = 2;
							err_msg = "Address Use is required";
						}
					}else{
						err_code = 1;
						err_msg = "Please add sub-key 'use' in json address request.";
					} 

					//address type
					if(typeof req.body.address.type !== 'undefined'){
						addressTypeCode =  req.body.address.type.trim().toLowerCase();
						if(validator.isEmpty(addressTypeCode)){
							err_code = 2;
							err_msg = "Address Type is required";
						}
					}else{
						err_code = 1;
						err_msg = "Please add sub-key 'type' in json address request.";
					} 

					//address text
					if(typeof req.body.address.text !== 'undefined'){
						addressText =  req.body.address.text;
						if(validator.isEmpty(addressText)){
							err_code = 2;
							err_msg = "Address Text is required";
						}
					}else{
						err_code = 1;
						err_msg = "Please add sub-key 'text' in json address request.";
					}

					//address line
					if(typeof req.body.address.line !== 'undefined'){
						addressLine =  req.body.address.line;
						if(validator.isEmpty(addressLine)){
							err_code = 2;
							err_msg = "Address Line is required";
						}
					}else{
						err_code = 1;
						err_msg = "Please add sub-key 'text' in json address request.";
					}

					//address city
					if(typeof req.body.address.city !== 'undefined'){
						addressCity =  req.body.address.city;
						if(validator.isEmpty(addressCity)){
							err_code = 2;
							err_msg = "Address City is required";
						}
					}else{
						err_code = 1;
						err_msg = "Please add sub-key 'city' in json address request.";
					} 

					//address district
					if(typeof req.body.address.district !== 'undefined'){
						addressDistrict =  req.body.address.district;
						// if(validator.isEmpty(addressDistrict)){
						// 	err_code = 2;
						// 	err_msg = "Address District is required";
						// }
					}else{
						addressDistrict = "";
					}

					//address state
					if(typeof req.body.address.state !== 'undefined'){
						addressState =  req.body.address.state;
						if(validator.isEmpty(addressState)){
							err_code = 2;
							err_msg = "State is required";
						}
					}else{
						err_code = 1;
						err_msg = "Please add sub-key 'state' in json address request.";
					}

					//address postal code
					if(typeof req.body.address.postal_code !== 'undefined'){
						addressPostalCode =  req.body.address.postal_code;
						if(validator.isEmpty(addressPostalCode)){
							err_code = 2;
							err_msg = "Postal Code is required";
						}
					}else{
						err_code = 1;
						err_msg = "Please add sub-key 'postal_code' in json address request.";
					} 

					//address country
					if(typeof req.body.address.country !== 'undefined'){
						addressCountry =  req.body.address.country;
						if(validator.isEmpty(addressCountry)){
							err_code = 2;
							err_msg = "Country is required";
						}
					}else{
						err_code = 1;
						err_msg = "Please add sub-key 'postal_code' in json address request.";
					} 

					//address period
					if(typeof req.body.address.period !== 'undefined'){
						var period = req.body.address.period;
						if(period.indexOf("to") > 0){
							arrPeriod = period.split("to");
							addressPeriodStart = arrPeriod[0];
							addressPeriodEnd = arrPeriod[1];
							
							if(!regex.test(addressPeriodStart) && !regex.test(addressPeriodEnd)){
								err_code = 2;
								err_msg = "Address Period invalid date format.";
							}	
						}else{
							addressPeriodStart = "";
							addressPeriodEnd = "";
						}
					}else{
						addressPeriodStart = "";
						addressPeriodEnd = "";
					}

					//marital_status
					if(typeof req.body.marital_status !== 'undefined'){
						var maritalStatusCode = req.body.marital_status.trim().toUpperCase();
					}else{
						err_code = 1;
						err_msg = "Please add key 'marital_status' in json request.";
					}


					//multiple birth
					if(typeof req.body.multiple_birth.status !== 'undefined'){
						var multipleBirthStatus = req.body.multiple_birth.status;
						if(validator.isEmpty(multipleBirthStatus)){
							multipleBirthStatus = false;	
						}
					}else{
						multipleBirthStatus = false;
					}

					if(typeof req.body.multiple_birth.number !== 'undefined'){
						var multipleBirthNumber = req.body.multiple_birth.number;
						if(!validator.isInt(multipleBirthNumber) && multipleBirthStatus == true){
							err_code = 1;
							err_msg = "Multiple birth number must be number.";
						}else{
							multipleBirthNumber = null;	
						}
					}else{
						multipleBirthNumber = null;
					}

					//photo language
					if(typeof req.body.photo.language !== 'undefined'){
						attachmentLanguageCode =  req.body.photo.language;
						if(validator.isEmpty(attachmentLanguageCode)){
							err_code = 2;
							err_msg = "Language is required";
						}
					}else{
						err_code = 1;
						err_msg = "Please add sub-key 'language' in json photo request.";
					}

					//photo data
					if(typeof req.body.photo.data !== 'undefined'){
						attachmentData =  req.body.photo.data;
						if(validator.isEmpty(attachmentData)){
							err_code = 2;
							err_msg = "Attachment Data is required";
						}
					}else{
						err_code = 1;
						err_msg = "Please add sub-key 'data' in json photo request.";
					}

					//photo size
					if(typeof req.body.photo.size !== 'undefined'){
						attachmentSize =  req.body.photo.size;
						if(validator.isEmpty(attachmentSize)){
							err_code = 2;
							err_msg = "Attachment Size is required";
						}else{
							attachmentSize = bytes(attachmentSize); //convert to bytes because data type is integer	
						}
					}else{
						err_code = 1;
						err_msg = "Please add sub-key 'size' in json photo request.";
					}

					//photo title
					if(typeof req.body.photo.title !== 'undefined'){
						attachmentTitle =  req.body.photo.title;
						if(validator.isEmpty(attachmentTitle)){
							err_code = 2;
							err_msg = "Title photo is required";
						}
					}else{
						err_code = 1;
						err_msg = "Please add sub-key 'title' in json photo request.";
					}

					//photo content_type
					if(typeof req.body.photo.content_type !== 'undefined'){
						attachmentContentType =  req.body.photo.content_type;
						if(validator.isEmpty(attachmentContentType)){
							err_code = 2;
							err_msg = "Attachment Content-Type is required";
						}else{
							attachmentContentType = attachmentContentType.trim().toLowerCase();
						}
					}else{
						err_code = 1;
						err_msg = "Please add sub-key 'content_type' in json photo request.";
					}

					//contact
					if(typeof req.body.contact.relationship !== 'undefined'){
						contactRelationshipCode =  req.body.contact.relationship.trim().toUpperCase();
						if(validator.isEmpty(contactRelationshipCode)){
							err_code = 2;
							err_msg = "Contact relationship is required.";
						}
					}else{
						err_code = 1;
						err_msg = "Please add sub-key 'relationship' in json contact request.";
					}

					//contactNameUseCode
					if(typeof req.body.contact.name.use !== 'undefined'){
						contactNameUseCode =  req.body.contact.name.use.trim().toLowerCase();
						if(validator.isEmpty(contactNameUseCode)){
							err_code = 2;
							err_msg = "Contact name use code is required.";
						}
					}else{
						err_code = 1;
						err_msg = "Please add sub-key 'use' in json contact name request.";
					}

					//contactNameText
					if(typeof req.body.contact.name.text !== 'undefined'){
						contactNameText =  req.body.contact.name.text;
						if(validator.isEmpty(contactNameText)){
							err_code = 2;
							err_msg = "Contact name text is required.";
						}
					}else{
						err_code = 1;
						err_msg = "Please add sub-key 'name' in json contact name request.";
					}

					//contactNameFamily
					if(typeof req.body.contact.name.family !== 'undefined'){
						contactNameFamily =  req.body.contact.name.family;
						if(validator.isEmpty(contactNameFamily)){
							err_code = 2;
							err_msg = "Contact name family is required.";
						}
					}else{
						err_code = 1;
						err_msg = "Please add sub-key 'family' in json contact name request.";
					}

					//contactNameGiven
					if(typeof req.body.contact.name.given !== 'undefined'){
						contactNameGiven =  req.body.contact.name.given;
						if(validator.isEmpty(contactNameGiven)){
							contactNameGiven = "";
						}
					}else{
						contactNameGiven = "";
					}

					//contactNamePrefix
					if(typeof req.body.contact.name.prefix !== 'undefined'){
						contactNamePrefix =  req.body.contact.name.prefix;
						if(validator.isEmpty(contactNamePrefix)){
							if(!typeof req.body.contact.gender !== 'undefined'){
								contactGender = req.body.contact.gender.trim().toLowerCase();
								if( contactGender == 'male'){
									contactNamePrefix =  'Mr';
								}else if(contactGender == 'female'){
									contactNamePrefix = 'Mrs';
								}else{
									contactNamePrefix = "";
								}		
							}	
						}
					}else{
						contactNamePrefix = "";
					}

					//contactNameSuffix
					if(typeof req.body.contact.name.suffix !== 'undefined'){
						contactNameSuffix =  req.body.contact.name.suffix;
						if(validator.isEmpty(contactNameSuffix)){
							contactNameSuffix = "";
						}
					}else{
						contactNameSuffix = "";
					}

					//contactNamePeriod
					if(typeof req.body.contact.name.period !== 'undefined'){
						var period = req.body.contact.name.period;
						if(period.indexOf("to") > 0){
							arrPeriod = period.split("to");
							contactPeriodStart = arrPeriod[0];
							contactPeriodEnd = arrPeriod[1];
							
							if(!regex.test(contactPeriodStart) && !regex.test(contactPeriodEnd)){
								err_code = 2;
								err_msg = "Contact Period invalid date format.";
							}	
						}else{
							contactPeriodStart = "";
							contactPeriodEnd = "";
						}
					}else{
						contactPeriodStart = "";
						contactPeriodEnd = "";
					}

					//contactTelecomSystem
					if(typeof req.body.contact.telecom.system !== 'undefined'){
						var contactTelecomSystemCode = req.body.contact.telecom.system.trim().toLowerCase();
						if(validator.isEmpty(contactTelecomSystemCode)){
							err_code = 2;
							err_msg = "Contact Telecom system is required.";
						}
					}else{
						err_code = 1;
						err_msg = "Please add sub-key 'system' in json contact telecom request.";
					}

					//contactTelecomValue
					if(typeof req.body.contact.telecom.value !== 'undefined'){
						var contactTelecomValue = req.body.contact.telecom.value;
						if(validator.isEmpty(contactTelecomValue)){
							err_code = 2;
							err_msg = "Contact Telecom value is required.";
						}
					}else{
						err_code = 1;
						err_msg = "Please add sub-key 'value' in json contact telecom request.";
					}

					//contactTelecomUseCode
					if(typeof req.body.contact.telecom.use !== 'undefined'){
						var contactTelecomUseCode = req.body.contact.telecom.use.trim().toLowerCase();
						if(validator.isEmpty(contactTelecomUseCode)){
							err_code = 2;
							err_msg = "Contact Telecom use code is required.";
						}
					}else{
						err_code = 1;
						err_msg = "Please add sub-key 'use' in json contact telecom request.";
					}

					//contactTelecomRank
					if(typeof req.body.contact.telecom.rank !== 'undefined'){
						var contactTelecomRank = req.body.contact.telecom.rank;
						
						if(!validator.isInt(contactTelecomRank)){
							err_code = 2;
							err_msg = "Contact Telecom rank must be number.";
						}
					}else{
						err_code = 1;
						err_msg = "Please add sub-key 'rank' in json contact telecom request.";
					}

					//contactTelecomPeriod
					if(typeof req.body.contact.telecom.period !== 'undefined'){
						var period = req.body.contact.telecom.period;
						if(period.indexOf("to") > 0){
							arrPeriod = period.split("to");
							contactTelecomPeriodStart = arrPeriod[0];
							contactTelecomPeriodEnd = arrPeriod[1];
							
							if(!regex.test(contactTelecomPeriodStart) && !regex.test(contactTelecomPeriodEnd)){
								err_code = 2;
								err_msg = "Contact Period invalid date format.";
							}	
						}else{
							contactTelecomPeriodStart = "";
							contactTelecomPeriodEnd = "";
						}
					}else{
						contactTelecomPeriodStart = "";
						contactTelecomPeriodEnd = "";
					}

					//contact address use code
					if(typeof req.body.contact.address.use !== 'undefined'){
						var contactAddressUseCode = req.body.contact.address.use;
						if(validator.isEmpty(contactAddressUseCode)){
							err_code = 2;
							err_msg = "Contact address use code is required.";
						}
					}else{
						err_code = 1;
						err_msg = "Please add sub-key 'use' in json contact address request.";
					}

					//contact address type code
					if(typeof req.body.contact.address.type !== 'undefined'){
						var contactAddressTypeCode = req.body.contact.address.type;
						if(validator.isEmpty(contactAddressTypeCode)){
							err_code = 2;
							err_msg = "Contact address type code is required.";
						}
					}else{
						err_code = 1;
						err_msg = "Please add sub-key 'type' in json contact address request.";
					}

					//contact address text
					if(typeof req.body.contact.address.text !== 'undefined'){
						var contactAddressText = req.body.contact.address.text;
						if(validator.isEmpty(contactAddressText)){
							err_code = 2;
							err_msg = "Contact address text is required.";
						}
					}else{
						err_code = 1;
						err_msg = "Please add sub-key 'text' in json contact address request.";
					}

					//contact address line
					if(typeof req.body.contact.address.line !== 'undefined'){
						var contactAddressLine = req.body.contact.address.line;
						if(validator.isEmpty(contactAddressLine)){
							err_code = 2;
							err_msg = "Contact address line is required.";
						}
					}else{
						err_code = 1;
						err_msg = "Please add sub-key 'line' in json contact address request.";
					}

					//contact address city
					if(typeof req.body.contact.address.city !== 'undefined'){
						var contactAddressCity = req.body.contact.address.city;
						if(validator.isEmpty(contactAddressCity)){
							err_code = 2;
							err_msg = "Contact address city is required.";
						}
					}else{
						err_code = 1;
						err_msg = "Please add sub-key 'city' in json contact address request.";
					}

					//contact address district
					if(typeof req.body.contact.address.district !== 'undefined'){
						var contactAddressDistrict = req.body.contact.address.district;
						if(validator.isEmpty(contactAddressDistrict)){
							contactAddressDistrict = "";
						}
					}else{
						contactAddressDistrict = "";
					}

					//contact address city
					if(typeof req.body.contact.address.state !== 'undefined'){
						var contactAddressState = req.body.contact.address.state;
						if(validator.isEmpty(contactAddressState)){
							err_code = 2;
							err_msg = "Contact address state is required.";
						}
					}else{
						err_code = 1;
						err_msg = "Please add sub-key 'state' in json contact address request.";
					}

					//contact address postal code
					if(typeof req.body.contact.address.postal_code !== 'undefined'){
						var contactAddressPostalCode = req.body.contact.address.postal_code;
						if(validator.isEmpty(contactAddressPostalCode)){
							err_code = 2;
							err_msg = "Contact address postal code is required.";
						}
					}else{
						err_code = 1;
						err_msg = "Please add sub-key 'postal_code' in json contact address request.";
					}

					//contact address country
					if(typeof req.body.contact.address.country !== 'undefined'){
						var contactAddressCountry = req.body.contact.address.country;
						if(validator.isEmpty(contactAddressCountry)){
							err_code = 2;
							err_msg = "Contact address country is required.";
						}
					}else{
						err_code = 1;
						err_msg = "Please add sub-key 'country' in json contact address request.";
					}
					
					//contact address period
					if(typeof req.body.contact.address.period !== 'undefined'){
						var period = req.body.contact.address.period;
						if(period.indexOf("to") > 0){
							arrPeriod = period.split("to");
							contactAddressPeriodStart = arrPeriod[0];
							contactAddressPeriodEnd = arrPeriod[1];
							
							if(!regex.test(contactAddressPeriodStart) && !regex.test(contactAddressPeriodEnd)){
								err_code = 2;
								err_msg = "Contact Address Period invalid date format.";
							}	
						}else{
							contactAddressPeriodStart = "";
							contactAddressPeriodEnd = "";
						}
					}else{
						contactAddressPeriodStart = "";
						contactAddressPeriodEnd = "";
					}

					//contact gender
					if(typeof req.body.contact.gender !== 'undefined'){
						var contactGender = req.body.contact.gender;
						if(validator.isEmpty(contactGender)){
							err_code = 2;
							err_msg = "Contact gender is required.";
						}
					}else{
						err_code = 1;
						err_msg = "Please add sub-key 'gender' in json contact request.";
					}

					//contact Organization that is associated with the contact
					if(typeof req.body.contact.organization_id !== 'undefined'){
						var contactOrganizationId = req.body.contact.organization_id;
						if(validator.isEmpty(contactOrganizationId)){
							contactOrganizationId = "";
						}
					}else{
						contactOrganizationId = "";
					}

					//contact period
					if(typeof req.body.contact.period !== 'undefined'){
						var period = req.body.contact.period;
						if(period.indexOf("to") > 0){
							arrPeriod = period.split("to");
							contactPeriodStart = arrPeriod[0];
							contactPeriodEnd = arrPeriod[1];
							
							if(!regex.test(contactPeriodStart) && !regex.test(contactPeriodEnd)){
								err_code = 2;
								err_msg = "Contact Period invalid date format.";
							}	
						}else{
							contactPeriodStart = "";
							contactPeriodEnd = "";
						}
					}else{
						contactPeriodStart = "";
						contactPeriodEnd = "";
					}

					//animal
					if(typeof req.body.animal !== 'undefined'){
						if(req.body.animal.species !== 'undefined'){
							animalSpeciesCode = req.body.animal.species;
						}else{
							animalSpeciesCode = "";
						}

						if(!validator.isEmpty(animalSpeciesCode) && req.body.animal.breed !== 'undefined'){
							animalBreedCode = req.body.animal.breed;
						}else{
							animalBreedCode = "";
						}

						if(!validator.isEmpty(animalSpeciesCode) && !validator.isEmpty(animalBreedCode)){
							animalGenderStatus = req.body.animal.gender_status;
						}else{
							animalGenderStatus = "";
						}
					}else{
						animalSpeciesCode = "";
						animalBreedsCode = "";
						animalGenderStatusCode = "";
					}

					//communication
					if(typeof req.body.communication.language !== 'undefined'){
						communicationLanguageCode = req.body.communication.language;
						if(validator.isEmpty(communicationLanguageCode)){
							err_code = 2;
							err_msg = "Communication language is required.";
						}
					}else{
						communicationLanguageCode = "";
					}

					if(typeof req.body.communication.preferred !== 'undefined'){
						communicationPreferred = req.body.communication.preferred;
						if(validator.isEmpty(communicationPreferred) && !validator.isEmpty(communicationLanguageCode)){
							err_code = 2;
							err_msg = "Communication preferred is required.";
						}
					}else{
						communicationPreferred = "";
					}
					
					//general practitioner
					if(typeof req.body.general_practitioner.organization_id !== 'undefined'){
						generalPractitionerOrganizationId = req.body.general_practitioner.organization_id;
						if(validator.isEmpty(generalPractitionerOrganizationId)){
							generalPractitionerOrganizationId = "";
						}else{
							if(!validator.isInt(generalPractitionerOrganizationId)){
								res.json({"err_code": 2, "err_msg": "General practitioner, organization id must be number"})
							}
						}
					}else{
						generalPractitionerOrganizationId = "";
					}

					if(typeof req.body.general_practitioner.practitioner_id !== 'undefined'){
						generalPractitionerPractitionerId = req.body.general_practitioner.practitioner_id;
						if(validator.isEmpty(generalPractitionerPractitionerId)){
							generalPractitionerPractitionerId = "";
						}else{
							if(!validator.isInt(generalPractitionerPractitionerId)){
								res.json({"err_code": 2, "err_msg": "General practitioner, practitioner id must be number"})
							}
						}
					}else{
						generalPractitionerPractitionerId = "";
					}

					//managing organization
					if(typeof req.body.managing_organization.organization_id !== 'undefined'){
						managingOrganizationOrganizationId = req.body.managing_organization.organization_id;
						if(validator.isEmpty(managingOrganizationOrganizationId)){
							managingOrganizationOrganizationId = "";
						}else{
							if(!validator.isInt(managingOrganizationOrganizationId)){
								res.json({"err_code": 2, "err_msg": "Managing organization, organization id must be number"})
							}
						}
					}else{
						managingOrganizationOrganizationId = "";
					}

					//link other
					if(typeof req.body.link_other.patient_id !== 'undefined'){
						if(validator.isInt(req.body.link_other.patient_id) && !validator.isEmpty(req.body.link_other.patient_id)){
							linkOtherPatientId = req.body.link_other.patient_id;
							linkOtherRelatedPersonId = "";
						}else{
							linkOtherPatientId = "";
						}
					}

					if(typeof req.body.link_other.related_person_id !== 'undefined'){
						if(validator.isInt(req.body.link_other.related_person_id)  && !validator.isEmpty(req.body.link_other.related_person_id)){
							linkOtherRelatedPersonId = req.body.link_other.related_person_id;
							linkOtherPatientId = "";
						}else{
							linkOtherRelatedPersonId = "";
						}
					}
					
					//link type
					if(typeof req.body.link_type !== 'undefined'){
						if(!validator.isEmpty(req.body.link_type) && (!validator.isEmpty(linkOtherPatientId) || !validator.isEmpty(linkOtherRelatedPersonId))){
							if(validator.isEmpty(req.body.link_type)){
								res.json({"err_code": 2, "err_msg": "Link type is required if link other not empty."})
							}else{
								linkTypeCode = req.body.link_type;	
							}
						}else{
							linkTypeCode = ""
						}
					}else{
						linkTypeCode = "";
					}


					if(err_code == 0){
						//check apikey
						checkApikey(apikey, ipAddres, function(result){
							if(result.err_code == 0){	
								checkCode(apikey, identifierUseCode, 'IDENTIFIER_USE', function(resUseCode){
									if(resUseCode.err_code > 0){ //code harus lebih besar dari nol, ini menunjukan datanya valid
										checkCode(apikey, identifierTypeCode, 'IDENTIFIER_TYPE', function(resUseTypeCode){
											if(resUseTypeCode.err_code > 0){ //code harus lebih besar dari nol, ini menunjukan datanya valid
												checkCode(apikey, humanNameUseCode, 'NAME_USE', function(resNameUseCode){
													if(resNameUseCode.err_code > 0){ //code harus lebih besar dari nol, ini menunjukan datanya valid
														checkCode(apikey, contactPointSystemCode, 'CONTACT_POINT_SYSTEM', function(resContactPointSystem){
															if(resContactPointSystem.err_code > 0){ //code harus lebih besar dari nol, ini menunjukan datanya valid
																checkCode(apikey, contactPointUseCode, 'CONTACT_POINT_USE', function(resContactPointUse){
																	if(resContactPointUse.err_code > 0){ //code harus lebih besar dari nol, ini menunjukan datanya valid
																		checkCode(apikey, gender, 'ADMINISTRATIVE_GENDER', function(resGender){
																			if(resGender.err_code > 0){ //code harus lebih besar dari nol, ini menunjukan datanya valid
																				checkCode(apikey, addressUseCode, 'ADDRESS_USE', function(resAddrUse){
																					if(resAddrUse.err_code > 0){ //code harus lebih besar dari nol, ini menunjukan datanya valid
																						checkCode(apikey, addressTypeCode, 'ADDRESS_TYPE', function(resAddrType){
																							if(resAddrType.err_code > 0){ //code harus lebih besar dari nol, ini menunjukan datanya valid
																								checkCode(apikey, maritalStatusCode, 'MARITAL_STATUS', function(resMaritalStatus){
																									if(resMaritalStatus.err_code > 0){
																										checkCode(apikey, attachmentLanguageCode, 'LANGUAGES', function(resLanguage){
																											if(resLanguage.err_code > 0){
																												checkCode(apikey, contactRelationshipCode, 'CONTACT_ROLE', function(resRelationship){
																													if(resRelationship.err_code > 0){
																														checkCode(apikey, contactNameUseCode, 'NAME_USE', function(resContactNameUse){
																															if(resContactNameUse.err_code > 0){
																																checkCode(apikey, contactTelecomSystemCode, 'CONTACT_POINT_SYSTEM', function(resContactTelecomSystem){
																																	if(resContactTelecomSystem.err_code > 0){
																																		checkCode(apikey, contactTelecomUseCode, 'CONTACT_POINT_USE', function(resContactTelecomUse){
																																			if(resContactTelecomUse.err_code > 0){
																																				checkCode(apikey, contactAddressUseCode, 'ADDRESS_USE', function(resContactAddressUse){
																																					if(resContactAddressUse.err_code > 0){
																																						checkCode(apikey, contactAddressTypeCode, 'ADDRESS_TYPE', function(resContactAddressType){
																																							if(resContactAddressType.err_code > 0){
																																								checkCode(apikey, contactGender, 'ADMINISTRATIVE_GENDER', function(resContactGender){
																																									if(resContactGender.err_code > 0){
																																										checkCode(apikey, communicationLanguageCode, 'LANGUAGES', function(resComLang){
																																											if(resComLang.err_code > 0){
																																												myEmitter.once('checkIdentifierValue', function(){
																																													checkUniqeValue(apikey, "IDENTIFIER_VALUE|" + identifierValue, 'IDENTIFIER', function(resUniqeValue){
																																														if(resUniqeValue.err_code == 0){ //untuk ini nilai code harus sama dengan 0, menunjukan value tersebut belum ada
																																															checkUniqeValue(apikey, "CONTACT_POINT_VALUE|" + contactPointValue, 'CONTACT_POINT', function(resContactPointValue){
																																																if(resContactPointValue.err_code == 0){
																																																	checkUniqeValue(apikey, "CONTACT_POINT_VALUE|" + contactTelecomValue, 'CONTACT_POINT', function(resContactTelecomValue){
																																																		if(resContactTelecomValue.err_code == 0){
																																																			//proses insert
																																																			//set uniqeId	
																																																			var patientId = 'pat' + uniqid.time();
																																																			var identifierId = 'ide' + uniqid.time();
																																																			var humanNameId = 'hn' + uniqid.time();
																																																			var contactPointId = 'cp' + uniqid.time();
																																																			var addressId = 'add' + uniqid.time();
																																																			var attachmentId = 'att' + uniqid.time();
																																																			var patientLinkId = 'pl' + uniqid.time();
																																																			var patientCommunicationId = 'pc' + uniqid.time();
																																																			var patientContactId = 'pc' + uniqid.time();
																																																			//set by sistem
																																																			var identifierSystem = host + ':' + port + '/' + apikey + '/Patient/'+ patientId +'/Identifier/'+ identifierId;
																																																			/**
																																																				proses insert
																																																				1. Patient Animal (If true)
																																																				2. Patient
																																																				3. Async ke tabel Identifier, Human Name, Contact Point, Address, Attachment, Patient Link, Patient Communication, Patient Contact,  dg membawa patientId
																																																			*/
																																																			//patient_animal
																																																			if(!validator.isEmpty(animalSpeciesCode) && !validator.isEmpty(animalBreedCode)){
																																																				var patientAnimalId = 'pa' + uniqid.time();
																																																				dataPatientAnimal = {
																																																															"id": patientAnimalId,
																																																  														"species": animalSpeciesCode,
																																																  														"breed": animalBreedCode,
																																																  														"gender_status": animalGenderStatus
																																																  													}

																																															  				ApiFHIR.post('patientAnimal', {"apikey": apikey}, {body: dataPatientAnimal, json: true}, function(error, response, body){
																																															  					patientAnimal = body;
																																															  					if(patientAnimal.err_code > 0){
																																															  						res.json({"err_code": 3, "err_msg": patientAnimal, "application": "Api FHIR", "function": "Error insert `patient animal`"});	
																																															  					}
																																															  				})
																																																			}else{
																																																				var patientAnimalId = "";
																																																			}

																																																			//patient
																																																			dataPatient = {
																																																											"id": patientId,
																																																											"active": true,
																																																											"gender": gender,
																																																											"birthdate": birthdate,
																																																											"deceased": deceasedStatus,
																																																											"deceased_date": deceasedDateTime,
																																																											"marital_status": maritalStatusCode,
																																																											"multiple_birth": multipleBirthStatus,
																																																											"multiple_number": multipleBirthNumber,
																																																											"animal_id": patientAnimalId,
																																																											"organization_id": managingOrganizationOrganizationId
																																																										}

																																																			ApiFHIR.post('patient', {"apikey": apikey}, {body: dataPatient, json: true}, function(error, response, body){
																																																				patient = body;
																																																				if(patient.err_code > 0){
																																															  						res.json(patient);	
																																															  					}
																																																			})	

																																																			//identifier
																																																  		dataIdentifier = {
																																																  											"id": identifierId,
																																														  													"use": identifierUseCode,
																																														  													"type": identifierTypeCode,
																																														  													"system": identifierSystem,
																																														  													"value": identifierValue,
																																														  													"period_start": identifierPeriodStart,
																																														  													"period_end": identifierPeriodEnd,
																																														  													"patient_id": patientId
																																														  												}
																																																		
																																														  				ApiFHIR.post('identifier', {"apikey": apikey}, {body: dataIdentifier, json: true}, function(error, response, body){
																																														  					identifier = body;
																																														  					if(identifier.err_code > 0){
																																														  						res.json(identifier);	
																																														  					}
																																														  				})

																																														  				//human name
																																														  				dataHumanName = {
																																														  													"id": humanNameId,
																																														  													"use": humanNameUseCode,
																																														  													"text": humanNamePrefix +' '+ humanNameText +' '+ humanNameSuffix,
																																														  													"family": humanNameFamily,
																																														  													"given": humanNameGiven,
																																														  													"prefix": humanNamePrefix,
																																														  													"suffix": humanNameSuffix,
																																														  													"period_start": humanNamePeriodStart,
																																														  													"period_end": humanNamePeriodEnd,
																																														  													"patient_id": patientId
																																														  												}

																																														  				ApiFHIR.post('humanName', {"apikey": apikey}, {body: dataHumanName, json: true}, function(error, response, body){
																																														  					humanName = body;
																																														  					if(humanName.err_code > 0){
																																														  						res.json(humanName);	
																																														  					}
																																														  				})

																																														  				//contact_point
																																														  				dataContactPoint = {
																																														  														"id": contactPointId,
																																														  														"system": contactPointSystemCode,
																																														  														"value": contactPointValue,
																																														  														"use": contactPointUseCode,
																																														  														"rank": contactPointRank,
																																														  														"period_start": contactPointPeriodStart,
																																														  														"period_end": contactPointPeriodEnd,
																																														  														"patient_id": patientId
																																														  													}

																																														  				ApiFHIR.post('contactPoint', {"apikey": apikey}, {body: dataContactPoint, json: true}, function(error, response, body){
																																														  					contactPoint = body;
																																														  					if(contactPoint.err_code > 0){
																																														  						res.json(contactPoint);	
																																														  					}
																																														  				})

																																														  				//address
																																														  				dataAddress = {
																																														  												"id": addressId,
																																												  														"use": addressUseCode,
																																												  														"type": addressTypeCode,
																																												  														"text": addressText,
																																												  														"line": addressLine,
																																												  														"city": addressCity,
																																												  														"district": addressDistrict,
																																												  														"state": addressState,
																																												  														"postal_code": addressPostalCode,
																																												  														"country": addressCountry,
																																												  														"period_start": addressPeriodStart,
																																												  														"period_end": addressPeriodEnd,
																																												  														"patient_id": patientId
																																												  													}

																																														  				ApiFHIR.post('address', {"apikey": apikey}, {body: dataAddress, json: true}, function(error, response, body){
																																														  					address = body;
																																														  					if(address.err_code > 0){
																																														  						res.json(address);	
																																														  					}
																																														  				})

																																																			// attachment
																																																			var dataAttachment = {
																																																														"id": attachmentId,
																																																														"content_type": attachmentContentType,
																																																														"language": attachmentLanguageCode,
																																																														"data": attachmentData,
																																																														"size": attachmentSize,
																																																														"hash": sha1(attachmentData),
																																																														"title": attachmentTitle,
																																																														"creation": getFormattedDate(),
																																																														"url": host + ':' + port + '/' + apikey + '/attachment/' + attachmentId,
																																																														"patient_id": patientId
																																																													}
																																																			
																																																			//method, endpoint, params, options, callback
																																																			ApiFHIR.post('attachment', {"apikey": apikey}, {body: dataAttachment, json:true}, function(error, response, body){
																																																				if(error){
																																																				  	res.json({"err_code": 1, "err_msg": error, "application": "Api FHIR", "function": "addPerson in attachment insert"});
																																																				  }else{
																																																				  	//cek apakah ada error atau tidak
																																																				  	var attachment = body; //object
																																																				  	//cek apakah ada error atau tidak
																																																				  	if(attachment.err_code > 0){
																																																				  		res.json(attachment);
																																																				  	}
																																																				  }
																																																			})	

																																														  				//patient_link
																																														  				if(!validator.isEmpty(linkOtherPatientId) && !validator.isEmpty(linkOtherRelatedPersonId)){
																																														  					dataPatientLink = {
																																														  												"id": patientLinkId,
																																												  														"link_other_patient_id": linkOtherPatientId,
																																												  														"link_other_related_person_id": linkOtherRelatedPersonId,
																																												  														"type": linkTypeCode,
																																												  														"patient_id": patientId
																																												  													}

																																															  				ApiFHIR.post('patientLink', {"apikey": apikey}, {body: dataPatientLink, json: true}, function(error, response, body){
																																															  					patientLink = body;
																																															  					if(patientLink.err_code > 0){
																																															  						res.json(patientLink);	
																																															  					}
																																															  				})
																																														  				}

																																														  				// patient_communication
																																														  				dataPatientCommunication = {
																																																				  												"id": patientCommunicationId,
																																																		  														"language": communicationLanguageCode,
																																																		  														"preferred": communicationPreferred,
																																																		  														"patient_id": patientId
																																																		  													}

																																														  				ApiFHIR.post('patientCommunication', {"apikey": apikey}, {body: dataPatientCommunication, json: true}, function(error, response, body){
																																														  					patientCommunication = body;
																																														  					if(patientCommunication.err_code > 0){
																																														  						res.json(patientCommunication);	
																																														  					}
																																														  				})

																																														  				//patient_contact, add human_name, address, contact_point (many)
																																														  				contactHumanNameId = 'hn' + uniqid.time();
																																														  				contactAddressId = 'add' + uniqid.time();
																																														  				contactTelecomId = 'cp' + uniqid.time();

																																														  				//contact human name
																																														  				dataHumanName = {
																																														  													"id": contactHumanNameId,
																																														  													"use": contactNameUseCode,
																																														  													"text": contactNamePrefix + ' ' + contactNameText + ' ' + contactNameSuffix, 
																																														  													"family": contactNameFamily,
																																														  													"given": contactNameGiven,
																																														  													"prefix": contactNamePrefix,
																																														  													"suffix": contactNameSuffix,
																																														  													"period_start": contactPeriodStart,
																																														  													"period_end": contactPeriodEnd
																																														  												}

																																														  				ApiFHIR.post('humanName', {"apikey": apikey}, {body: dataHumanName, json: true}, function(error, response, body){
																																														  					humanName2 = body;
																																														  					if(humanName2.err_code > 0){
																																														  						res.json(humanName2);	
																																														  					}
																																														  				})

																																														  				//contact_address
																																														  				dataAddress = {
																																														  												"id": contactAddressId,
																																												  														"use": contactAddressUseCode,
																																												  														"type": contactAddressTypeCode,
																																												  														"text": contactAddressText,
																																												  														"line": contactAddressLine,
																																												  														"city": contactAddressCity,
																																												  														"district": contactAddressDistrict,
																																												  														"state": contactAddressState,
																																												  														"postal_code": contactAddressPostalCode,
																																												  														"country": contactAddressCountry,
																																												  														"period_start": contactAddressPeriodStart,
																																												  														"period_end": contactAddressPeriodEnd
																																												  													}

																																														  				ApiFHIR.post('address', {"apikey": apikey}, {body: dataAddress, json: true}, function(error, response, body){
																																														  					address2 = body;
																																														  					if(address2.err_code > 0){
																																														  						res.json(address2);	
																																														  					}
																																														  				})

																																														  				dataPatientContact = {
																																																	  												"id": patientContactId,
																																															  														"relationship": contactRelationshipCode,
																																															  														"human_name_id": contactHumanNameId,
																																															  														"address_id": contactAddressId,
																																															  														"gender": contactGender,
																																															  														"organization_id": contactOrganizationId,
																																															  														"period_start": contactPeriodStart,
																																															  														"period_end": contactPeriodEnd,
																																															  														"patient_id": patientId
																																															  													}

																																														  				ApiFHIR.post('patientContact', {"apikey": apikey}, {body: dataPatientContact, json: true}, function(error, response, body){
																																														  					patientContact = body;
																																														  					if(patientContact.err_code > 0){
																																														  						res.json(patientContact);	
																																														  					}
																																														  				})

																																														  				//contact contact_point
																																														  				dataContactPoint = {
																																														  														"id": contactTelecomId,
																																														  														"system": contactTelecomSystemCode,
																																														  														"value": contactTelecomValue,
																																														  														"use": contactTelecomUseCode,
																																														  														"rank": contactTelecomRank,
																																														  														"period_start": contactTelecomPeriodStart,
																																														  														"period_end": contactTelecomPeriodEnd,
																																														  														"patient_contact_id": patientContactId
																																														  													}

																																														  				ApiFHIR.post('contactPoint', {"apikey": apikey}, {body: dataContactPoint, json: true}, function(error, response, body){
																																														  					contactPoint2 = body;
																																														  					if(contactPoint2.err_code > 0){
																																														  						res.json(contactPoint2);	
																																														  					}
																																														  				})
																																													  					res.json({"err_code": 0, "err_msg": "Patient has been add.", "data": [{"_id": patientId}]});
																																																														
																																																		}else{
																																																			res.json({"err_code": 508, "err_msg": "Contact telecom value already exist."});			
																																																		}
																																																	})											
																																																}else{
																																																	res.json({"err_code": 508, "err_msg": "Telecom value already exist."});			
																																																}
																																															})
																																														}else{
																																															res.json({"err_code": 508, "err_msg": "Identifier value already exist."});		
																																														}
																																													})
																																												})
																																												//animal
																																												myEmitter.once('checkAnimal', function(){
																																													if(!validator.isEmpty(animalSpeciesCode) && !validator.isEmpty(animalBreedCode)){
																																														checkCode(apikey, animalSpeciesCode, 'ANIMAL_SPECIES', function(resAnimalSpecies){
																																															if(resAnimalSpecies.err_code > 0){
																																																checkCode(apikey, animalBreedCode, 'ANIMAL_BREEDS', function(resAnimalBreed){
																																																	if(resAnimalBreed.err_code > 0){
																																																		myEmitter.emit('checkIdentifierValue');
																																																	}else{
																																																		res.json({"err_code": 517, "err_msg": "Animal breed code not found"});
																																																	}
																																																})
																																															}else{
																																																res.json({"err_code": 516, "err_msg": "Animal species code not found"});		
																																															}
																																														})
																																													}else{
																																														myEmitter.emit('checkIdentifierValue');
																																													}
																																												})
																																												
																																												//linkOther
																																												myEmitter.once('checkLinkOther', function(){
																																													if(!validator.isEmpty(linkOtherPatientId)){
																																														checkUniqeValue(apikey, "PATIENT_ID|" + linkOtherPatientId, 'PATIENT', function(resOther){
																																															if(resOther.err_code > 0){
																																																checkCode(apikey, linkTypeCode, 'LINK_TYPE', function(resLinkType){
																																																	if(resLinkType.err_code > 0){
																																																		myEmitter.emit('checkAnimal');
																																																	}else{
																																																		res.json({"err_code": 518, "err_msg": "Link type code not found"});
																																																	}
																																																})
																																															}else{
																																																res.json({"err_code": 519, "err_msg": "Link other patient id not found"});
																																															}
																																														})
																																													}else if(!validator.isEmpty(linkOtherRelatedPersonId)){
																																														checkUniqeValue(apikey, "RELATED_PERSON_ID|" + linkOtherRelatedPersonId, 'RELATED_PERSON', function(resOther){
																																															if(resOther.err_code > 0){
																																																checkCode(apikey, linkTypeCode, 'LINK_TYPE', function(resLinkType){
																																																	if(resLinkType.err_code > 0){
																																																		myEmitter.emit('checkAnimal');
																																																	}else{
																																																		res.json({"err_code": 518, "err_msg": "Link type code not found"});
																																																	}
																																																})
																																															}else{
																																																res.json({"err_code": 519, "err_msg": "Link other related person id not found"});	
																																															}
																																														})
																																													}else{
																																														myEmitter.emit('checkAnimal');
																																													}
																																												})

																																												//managingOrganization
																																												myEmitter.once('checkManagingOrganization', function(){
																																													if(!validator.isEmpty(managingOrganizationOrganizationId)){
																																														checkUniqeValue(apikey, "ORGANIZATION_ID|" + managingOrganizationOrganizationId, 'ORGANIZATION', function(resGPO){
																																															if(resGPO.err_code > 0){
																																																myEmitter.emit('checkLinkOther');
																																															}else{
																																																res.json({"err_code": 522, "err_msg": "Managing organization, organization id not found"});
																																															}
																																														})
																																													}else{
																																														myEmitter.emit('checkLinkOther');
																																													}
																																												})

																																												//generalPractitioner
																																												myEmitter.once('checkGeneralPractitioner', function(){
																																													if(!validator.isEmpty(generalPractitionerOrganizationId)){
																																														checkUniqeValue(apikey, "ORGANIZATION_ID|" + generalPractitionerOrganizationId, 'ORGANIZATION', function(resGPO){
																																															if(resGPO.err_code > 0){
																																																myEmitter.emit('checkManagingOrganization');
																																															}else{
																																																res.json({"err_code": 520, "err_msg": "General practitioner, organization id not found"});
																																															}
																																														})
																																													}else if(!validator.isEmpty(generalPractitionerPractitionerId)){
																																														checkUniqeValue(apikey, "PRACTITIONER_ID|" + generalPractitionerPractitionerId, 'PRACTITIONER', function(resGPP){
																																															if(resGPP.err_code > 0){
																																																myEmitter.emit('checkManagingOrganization');
																																															}else{
																																																res.json({"err_code": 520, "err_msg": "General practitioner, practitioner id not found"});	
																																															}
																																														})
																																													}else{
																																														myEmitter.emit('checkManagingOrganization');
																																													}
																																												})

																																												//contactOrganizationId
																																												if(!validator.isEmpty(contactOrganizationId)){
																																													checkUniqeValue(apikey, "ORGANIZATION_ID|" + contactOrganizationId, 'ORGANIZATION', function(resContacOrg){
																																														if(resContacOrg.err_code > 0){
																																															myEmitter.emit('checkGeneralPractitioner');
																																														}else{
																																															res.json({"err_code": 521, "err_msg": "Contact organization id not found"});
																																														}
																																													})
																																												}else{
																																													myEmitter.emit('checkGeneralPractitioner');
																																												}
																																											}else{
																																												res.json({"err_code": 509, "err_msg": "Communication language code not found"});
																																											}
																																										})
																																									}else{
																																										res.json({"err_code": 515, "err_msg": "Contact gender code not found"});		
																																									}
																																								})
																																							}else{
																																								res.json({"err_code": 514, "err_msg": "Contact address type code not found"});
																																							}
																																						})
																																					}else{
																																						res.json({"err_code": 513, "err_msg": "Contact address use code not found"});					
																																					}
																																				})
																																			}else{
																																				res.json({"err_code": 512, "err_msg": "Contact telecom use code not found"});			
																																			}
																																		})
																																	}else{
																																		res.json({"err_code": 511, "err_msg": "Contact telecom system code not found"});	
																																	}
																																})
																															}else{
																																res.json({"err_code": 510, "err_msg": "Contact name use code not found"});		
																															}
																														})
																													}else{
																														res.json({"err_code": 509, "err_msg": "Relationship code not found"});		
																													}
																												})
																											}else{
																												res.json({"err_code": 509, "err_msg": "Photo language code not found"});		
																											}
																										})
																									}else{
																										res.json({"err_code": 508, "err_msg": "Marital Status Code not found"});		
																									}
																								})
																							}else{
																								res.json({"err_code": 507, "err_msg": "Address Type Code not found"});		
																							}
																						})
																					}else{
																						res.json({"err_code": 506, "err_msg": "Address Use Code not found"});		
																					}
																				})
																			}else{
																				res.json({"err_code": 505, "err_msg": "Gender Code not found"});
																			}
																		})
																	}else{
																		res.json({"err_code": 504, "err_msg": "Contact Point Use Code not found"});
																	}
																})
															}else{
																res.json({"err_code": 504, "err_msg": "Contact Point System Code not found"});		
															}
														})
													}else{
														res.json({"err_code": 503, "err_msg": "Identifier type code not found"});		
													}
												})
											}else{
												res.json({"err_code": 502, "err_msg": "Identifier type code not found"});		
											}
										})
									}else{
										res.json({"err_code": 501, "err_msg": "Identifier use code not found"});
									}
								})
							}else{
								result.err_code = 500;
								res.json(result);
							}	
						});
					}else{
						res.json({"err_code": err_code, "err_msg": err_msg});
					}
				},
				identifier: function addIdentifier(req, res){
					var ipAddres = req.connection.remoteAddress;
					var apikey = req.params.apikey;
					var regex = new RegExp("([0-9]{4}[-](0[1-9]|1[0-2])[-]([0-2]{1}[0-9]{1}|3[0-1]{1})|([0-2]{1}[0-9]{1}|3[0-1]{1})[-](0[1-9]|1[0-2])[-][0-9]{4})");
					var patientId = req.params.patient_id;

					var err_code = 0;
					var err_msg = "";

					//input check 
					if(typeof patientId !== 'undefined'){
						if(validator.isEmpty(patientId)){
							err_code = 2;
							err_msg = "Patient id is required";
						}
					}else{
						err_code = 2;
						err_msg = "Patient id is required";
					}

					//identifier
					if(typeof req.body.use !== 'undefined'){
						identifierUseCode =  req.body.use.trim().toLowerCase();
						if(validator.isEmpty(identifierUseCode)){
							err_code = 2;
							err_msg = "Identifier Use is required";
						}
					}else{
						err_code = 1;
						err_msg = "Please add sub-key 'use' in json identifier request.";
					} 

					//type code
					if(typeof req.body.type !== 'undefined'){
						identifierTypeCode =  req.body.type.trim().toUpperCase();
						if(validator.isEmpty(identifierTypeCode)){
							err_code = 2;
							err_msg = "Identifier Type is required";
						}
					}else{
						err_code = 1;
						err_msg = "Please add sub-key 'type' in json identifier request.";
					} 

					//identifier uniqe value
					if(typeof req.body.value !== 'undefined'){
						identifierValue =  req.body.value.trim();
						if(validator.isEmpty(identifierValue)){
							err_code = 2;
							err_msg = "Identifier Value is required";
						}
					}else{
						err_code = 1;
						err_msg = "Please add sub-key 'value' in json identifier request.";
					}

					//identifier period start
					if(typeof req.body.period !== 'undefined'){
						period = req.body.period;
						if(period.indexOf("to") > 0){
							arrPeriod = period.split("to");
							identifierPeriodStart = arrPeriod[0];
							identifierPeriodEnd = arrPeriod[1];
							
							if(!regex.test(identifierPeriodStart) && !regex.test(identifierPeriodEnd)){
								err_code = 2;
								err_msg = "Identifier Period invalid date format.";
							}	
						}
					}else{
						err_code = 1;
						err_msg = "Please add key 'period' in json identifier request.";
					}  

					//set by sistem
					var identifierSystem = host + ':' + port + '/' + apikey + '/Patient/'+ patientId +'/Identifier/'+ identifierId;

					if(err_code == 0){
						//check apikey
						checkApikey(apikey, ipAddres, function(result){
							if(result.err_code == 0){	
								checkCode(apikey, identifierUseCode, 'IDENTIFIER_USE', function(resUseCode){
									if(resUseCode.err_code > 0){ //code harus lebih besar dari nol, ini menunjukan datanya valid
										checkCode(apikey, identifierTypeCode, 'IDENTIFIER_TYPE', function(resUseTypeCode){
											if(resUseTypeCode.err_code > 0){ //code harus lebih besar dari nol, ini menunjukan datanya valid
												checkUniqeValue(apikey, "IDENTIFIER_VALUE|" + identifierValue, 'IDENTIFIER', function(resUniqeValue){
													if(resUniqeValue.err_code == 0){
														checkUniqeValue(apikey, "PATIENT_ID|" + patientId, 'PATIENT', function(resPatientID){
															if(resPatientID.err_code > 0){
																var identifierId = 'ide' + uniqid.time();
													  		dataIdentifier = {
													  											"id": identifierId,
											  													"use": identifierUseCode,
											  													"type": identifierTypeCode,
											  													"system": identifierSystem,
											  													"value": identifierValue,
											  													"period_start": identifierPeriodStart,
											  													"period_end": identifierPeriodEnd,
											  													"patient_id": patientId
											  												}
															
											  				ApiFHIR.post('identifier', {"apikey": apikey}, {body: dataIdentifier, json: true}, function(error, response, body){
											  					identifier = body;
											  					if(identifier.err_code > 0){
											  						res.json(identifier);	
											  					}else{
											  						res.json({"err_code": 0, "err_msg": "Identifier has been add in this patient.", "data": identifier.data})
											  					}
											  				})
															}else{
																res.json({"err_code": 503, "err_msg": "Patient Id not found"});		
															}
														})
													}else{
														res.json({"err_code": 504, "err_msg": "Identifier value already exist."});	
													}
												})
												
											}else{
												res.json({"err_code": 502, "err_msg": "Identifier type code not found"});		
											}
										})
									}else{
										res.json({"err_code": 501, "err_msg": "Identifier use code not found"});
									}
								})
							}else{
								result.err_code = 500;
								res.json(result);
							}	
						});
					}else{
						res.json({"err_code": err_code, "err_msg": err_msg});
					}
				} 	
			},
			put: {
				identifier: function addIdentifier(req, res){
					var ipAddres = req.connection.remoteAddress;
					var apikey = req.params.apikey;
					var regex = new RegExp("([0-9]{4}[-](0[1-9]|1[0-2])[-]([0-2]{1}[0-9]{1}|3[0-1]{1})|([0-2]{1}[0-9]{1}|3[0-1]{1})[-](0[1-9]|1[0-2])[-][0-9]{4})");
					var patientId = req.params.patient_id;
					var identifierId = req.params.identifier_id;

					var err_code = 0;
					var err_msg = "";
					var dataIdentifier = {};
					//input check 
					if(typeof patientId !== 'undefined'){
						if(validator.isEmpty(patientId)){
							err_code = 2;
							err_msg = "Patient id is required";
						}
					}else{
						err_code = 2;
						err_msg = "Patient id is required";
					}

					if(typeof identifierId !== 'undefined'){
						if(validator.isEmpty(identifierId)){
							err_code = 2;
							err_msg = "Identifier id is required";
						}
					}else{
						err_code = 2;
						err_msg = "Identifier id is required";
					}

					//identifier
					if(typeof req.body.use !== 'undefined'){
						identifierUseCode =  req.body.use.trim().toLowerCase();
						if(validator.isEmpty(identifierUseCode)){
							err_code = 2;
							err_msg = "Identifier Use is empty";
						}else{
							dataIdentifier.use = identifierUseCode;
						}
					} 

					//type code
					if(typeof req.body.type !== 'undefined'){
						identifierTypeCode =  req.body.type.trim().toUpperCase();
						if(validator.isEmpty(identifierTypeCode)){
							err_code = 2;
							err_msg = "Identifier Type is empty";
						}else{
							dataIdentifier.type = identifierTypeCode;
						}
					} 

					//identifier uniqe value
					if(typeof req.body.value !== 'undefined'){
						identifierValue =  req.body.value.trim();
						if(validator.isEmpty(identifierValue)){
							err_code = 2;
							err_msg = "Identifier Value is empty";
						}else{
							dataIdentifier.value = identifierValue;
							dataIdentifier.system = host + ':' + port + '/' + apikey + '/Patient/'+ patientId +'/Identifier/'+ identifierId;
						}
					}

					//identifier period start
					if(typeof req.body.period !== 'undefined'){
						period = req.body.period;
						if(period.indexOf("to") > 0){
							arrPeriod = period.split("to");
							identifierPeriodStart = arrPeriod[0];
							identifierPeriodEnd = arrPeriod[1];
							
							if(!regex.test(identifierPeriodStart) && !regex.test(identifierPeriodEnd)){
								err_code = 2;
								err_msg = "Identifier Period invalid date format.";
							}else{
								dataIdentifier.period_start = identifierPeriodStart;
								dataIdentifier.period_end = identifierPeriodEnd;
							}	
						}else{
							err_code = 1;
							err_msg = "Period request format is wrong, `ex: start to end` ";
						}
					}  

					if(err_code == 0){
						//check apikey
						checkApikey(apikey, ipAddres, function(result){
							if(result.err_code == 0){	
								checkCode(apikey, identifierUseCode, 'IDENTIFIER_USE', function(resUseCode){
									if(resUseCode.err_code > 0){ //code harus lebih besar dari nol, ini menunjukan datanya valid
										checkCode(apikey, identifierTypeCode, 'IDENTIFIER_TYPE', function(resUseTypeCode){
											if(resUseTypeCode.err_code > 0){ //code harus lebih besar dari nol, ini menunjukan datanya valid
												checkUniqeValue(apikey, "IDENTIFIER_VALUE|" + identifierValue, 'IDENTIFIER', function(resIdentifierValue){
													if(resIdentifierValue.err_code == 0){
														checkUniqeValue(apikey, "PATIENT_ID|" + patientId, 'PATIENT', function(resPatientID){
															if(resPatientID.err_code > 0){
																checkUniqeValue(apikey, "IDENTIFIER_ID|" + identifierId, 'IDENTIFIER', function(resIdentifierID){
																	if(resIdentifierID.err_code > 0){
																		ApiFHIR.put('identifier', {"apikey": apikey, "_id": identifierId, "dr": "PATIENT_ID|"+patientId}, {body: dataIdentifier, json: true}, function(error, response, body){
													  					identifier = body;
													  					if(identifier.err_code > 0){
													  						res.json(identifier);	
													  					}else{
													  						res.json({"err_code": 0, "err_msg": "Identifier has been update in this patient.", "data": identifier.data});
													  					}
													  				})
																	}else{
																		res.json({"err_code": 505, "err_msg": "Identifier Id not found"});		
																	}
																})
															}else{
																res.json({"err_code": 504, "err_msg": "Patient Id not found"});		
															}
														})
													}else{
														res.json({"err_code": 503, "err_msg": "Identifier value already exist."});	
													}
												})
												
											}else{
												res.json({"err_code": 502, "err_msg": "Identifier type code not found"});		
											}
										})
									}else{
										res.json({"err_code": 501, "err_msg": "Identifier use code not found"});
									}
								})
							}else{
								result.err_code = 500;
								res.json(result);
							}	
						});
					}else{
						res.json({"err_code": err_code, "err_msg": err_msg});
					}
				}
			}
}

function checkApikey(apikey, ipAddress, callback){
	//method, endpoint, params, options, callback
	Api.get('check_apikey', {"apikey": apikey}, {}, function (error, response, body) {
	  if(error){
	  	x(error);
	  }else{
	  	user = JSON.parse(body);
	  	//cek apakah ada error atau tidak
	  	if(user.err_code == 0){
		  	//cek jumdata dulu
		  	if(user.data.length > 0){
		  		//check user_role_id == 1 <-- admin/root
		  		if(user.data[0].user_role_id == 1){
		  			x({"err_code": 0, "status": "root", "user_role_id": user.data[0].user_role_id, "user_id": user.data[0].user_id});	
		  		}else{
			  		//cek apikey
				  	if(apikey == user.data[0].user_apikey){
				  		//ipaddress
					  	dataIpAddress = user.data[0].user_ip_address;
					  	if(dataIpAddress.indexOf(ipAddress) >= 0){
					  		//user is active
					  		if(user.data[0].user_is_active){
					  			//cek data user terpenuhi
					  			x({"err_code": 0, "status": "active", "user_role_id": user.data[0].user_role_id, "user_id": user.data[0].user_id});	
					  		}else{
					  			x({"err_code": 5, "err_msg": "User is not active"});	
					  		}
					  	}else{
					  		x({"err_code": 4, "err_msg": "Ip Address not registered"});
					  	}
				  	}else{
				  		x({"err_code": 3, "err_msg": "Wrong apikey"});
				  	}
		  		}
		  		
		  	}else{
		  			x({"err_code": 2, "err_msg": "Wrong apikey"});	
		  	}
	  	}else{
	  		x({"err_code": 1, "err_msg": user.error, "application": "Api User Management", "function": "checkApikey"});
	  	}
	  }
	});
	
	function x(result){
		callback(result)
	}
}

function checkId(apikey, tableId, tableName, callback){
	ApiFHIR.get('checkId', {"apikey": apikey, "id": tableId, "name": tableName}, {}, function (error, response, body) {
	  if(error){
	  	x(error);
	  }else{
	  	dataId = JSON.parse(body);
	  	//cek apakah ada error atau tidak
	  	if(dataId.err_code == 0){
		  	//cek jumdata dulu
		  	if(dataId.data.length > 0){
		  			x({"err_code": 0, "err_msg": "Id is valid."})
		  	}else{
		  			x({"err_code": 2, "err_msg": "Id is not found."});	
		  	}
	  	}else{
	  		x({"err_code": 1, "err_msg": dataId.error, "application": "API FHIR", "function": "checkId"});
	  	}
	  }
	});

	function x(result){
		callback(result)
	}
}

function checkCode(apikey, code, tableName, callback){
	ApiFHIR.get('checkCode', {"apikey": apikey, "code": code, "name": tableName}, {}, function (error, response, body) {
	  if(error){
	  	x(error);
	  }else{
	  	dataId = JSON.parse(body);
	  	//cek apakah ada error atau tidak
	  	if(dataId.err_code == 0){
		  	//cek jumdata dulu
		  	if(dataId.data.length > 0){
		  			x({"err_code": 2, "err_msg": "Code is already exist."})
		  	}else{
		  			x({"err_code": 0, "err_msg": "Code is available to used."});	
		  	}
	  	}else{
	  		x({"err_code": 1, "err_msg": dataId.error, "application": "API FHIR", "function": "checkCode"});
	  	}
	  }
	});

	function x(result){
		callback(result)
	}
}

function checkUniqeValue(apikey, fdValue, tableName, callback){
	ApiFHIR.get('checkUniqeValue', {"apikey": apikey, "fdvalue": fdValue, "tbname": tableName}, {}, function (error, response, body) {
	  if(error){
	  	x(error);
	  }else{
	  	dataId = JSON.parse(body);
	  	//cek apakah ada error atau tidak
	  	if(dataId.err_code == 0){
		  	//cek jumdata dulu
		  	if(dataId.data.length > 0){
		  			x({"err_code": 2, "err_msg": "The value is already exist."})
		  	}else{
		  			x({"err_code": 0, "err_msg": "The value is available to insert."});	
		  	}
	  	}else{
	  		x({"err_code": 1, "err_msg": dataId.error, "application": "API FHIR", "function": "checkCode"});
	  	}
	  }
	});

	function x(result){
		callback(result)
	}
}

function checkGroupQouta(apikey, groupId, callback){
	ApiFHIR.get('checkGroupQouta', {"apikey": apikey, "group_id": groupId}, {}, function (error, response, body) {
	  if(error){
	  	x(error);
	  }else{
	  	quota = JSON.parse(body);
	  	//cek apakah ada error atau tidak
	  	if(quota.err_code == 0){
		  	//cek jumdata dulu
		  	if(quota.data.length > 0){
		  		groupQuota = parseInt(quota.data[0].quantity);
		  		memberCount = parseInt(quota.data[0].total_member);

		  		if(memberCount <= groupQuota){
		  			x({"err_code": 0, "err_msg": "Group quota is ready"});	
		  		}else{
		  			x({"err_code": 1, "err_msg": "Group quota is full, total member "+ groupQuota});	
		  		}
		  	}else{
		  			x({"err_code": 0, "err_msg": "Group quota is ready"});	
		  	}
	  	}else{
	  		x({"err_code": 1, "err_msg": quota, "application": "API FHIR", "function": "checkGroupQouta"});
	  	}
	  }
	});

	function x(result){
		callback(result)
	}
}

function checkMemberEntityGroup(apikey, entityId, groupId, callback){
	ApiFHIR.get('checkMemberEntityGroup', {"apikey": apikey, "entity_id": entityId ,"group_id": groupId}, {}, function (error, response, body) {
	  if(error){
	  	x(error);
	  }else{
	  	entity = JSON.parse(body);
	  	//cek apakah ada error atau tidak
	  	if(entity.err_code == 0){
		  	if(parseInt(entity.data.length) > 0){
		  		x({"err_code": 2, "err_msg": "Member entity already exist in this group."});	
		  	}else{
	  			x({"err_code": 0, "err_msg": "Member not found in this group."});	
		  	}
	  	}else{
	  		x({"err_code": 1, "err_msg": entity, "application": "API FHIR", "function": "checkMemberEntityGroup"});
	  	}
	  }
	});

	function x(result){
		callback(result)
	}
}

function getFormattedDate() {
  var date = new Date();
  var str = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +  date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

  return str;
}

function formatDate(date) {
  var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
}

function removeDuplicates(myArr, prop) {
  return myArr.filter((obj, pos, arr) => {
      return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos;
  });
}

module.exports = controller;