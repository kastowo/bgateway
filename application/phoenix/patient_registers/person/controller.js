var express = require('express');
var app = express();
var fs = require("fs");
var bodyParser = require('body-parser');
var yamlconfig = require('yaml-config');
var path = require('path');

var configYaml = yamlconfig.readConfig(path.resolve('../../application/config/config.yml'));

//event emitter
var host = configYaml.phoenix.host;
var port = configYaml.phoenix.port;

// var phoenix = require("./phoenix.js");
var phoenix = require(path.resolve("./phoenix.js"));
// var db = new phoenix("jdbc:phoenix:" + host + ":/hbase-unsecure");
var db = new phoenix("jdbc:phoenix:" + "192.168.1.231" + ":/hbase-unsecure");

var controller = {
	get: {
    person: function getPerson(req, res){
      var apikey = req.params.apikey;
      var hostFHIR = configYaml.fhir.host;
      var portFHIR = configYaml.fhir.port;
      
      var personId = req.query._id;
      //susun query
      var condition = "";

      if(typeof personId !== 'undefined' && personId !== ""){
        condition += "person_id = '" + personId + "' AND,";  
      }

      if(condition == ""){
        fixCondition = "";
      }else{
        fixCondition = " WHERE " + condition.slice(0, -4);
      }
      
      var arrPerson = [];
      var query = "SELECT person_id, person_gender, person_birthdate, person_active, org.organization_id, attachment_id FROM BACIRO_FHIR.PERSON p LEFT JOIN BACIRO_FHIR.ORGANIZATION org on p.organization_id = org.organization_id " + fixCondition; //join ke organization
      db.query(query,function(dataJson){
        rez = lowercaseObject(dataJson);
        for(i = 0; i < rez.length; i++){
          var Person = {};
          Person.resourceType = "Person";
          Person.id = rez[i].person_id;
          Person.gender = rez[i].person_gender;
          Person.birthdate = formatDate(rez[i].person_birthdate);

          if(rez[i].organization_id != "null"){
            Person.managingOrganization = hostFHIR + ':' + portFHIR + '/' + apikey + '/Organization?_id=' +  rez[i].organization_id;
          }else{
            Person.managingOrganization = "";
          }
          
          Person.active = rez[i].person_active;
          Person.attachment_id = rez[i].attachment_id;
          
          arrPerson[i] = Person;
        }
        res.json({"err_code":0,"data": arrPerson});
      },function(e){
        res.json({"err_code": 1, "err_msg":e, "application": "Api Phoenix", "function": "getPerson"});
      });
    },
    personLink: function getPersonLink(req, res){
      var apikey = req.params.apikey;
      var hostFHIR = configYaml.fhir.host;
      var portFHIR = configYaml.fhir.port;

      var personId = req.query.person_id;
      //susun query
      var condition = "";

      if(typeof personId !== 'undefined' && personId !== ""){
        condition += "person_id = '" + personId + "' AND,";  
      }

      if(condition == ""){
        fixCondition = "";
      }else{
        fixCondition = " WHERE " + condition.slice(0, -4);
      }
      
      var arrPersonLink = [];
      var query = "SELECT person_link_id, person_link_target_patient, person_link_target_practitioner, person_link_target_related_person, person_link_target_person, person_link_assurance FROM BACIRO_FHIR.PERSON_LINK " + fixCondition;
      
      db.query(query,function(dataJson){
        rez = lowercaseObject(dataJson);
        for(i = 0; i < rez.length; i++){
          var PersonLink = {};
          PersonLink.id = rez[i].person_link_id;

          if(rez[i].person_link_target_patient != null){
            PersonLink.target = hostFHIR + ':' + portFHIR + '/' + apikey + '/Patient/' +  rez[i].person_link_target_patient;
          }else if(rez[i].person_link_target_practitioner != null){
            PersonLink.target = hostFHIR + ':' + portFHIR + '/' + apikey + '/Practitioner/' +  rez[i].person_link_target_practitioner;
          }else if(rez[i].person_link_target_related_person != null){
            PersonLink.target = hostFHIR + ':' + portFHIR + '/' + apikey + '/RelatedPerson/' +  rez[i].person_link_target_related_person;
          }else{
            PersonLink.target = hostFHIR + ':' + portFHIR + '/' + apikey + '/Person/' +  rez[i].person_link_target_person;
          }
           
           PersonLink.assurance = rez[i].person_link_assurance;

          arrPersonLink[i] = PersonLink;
        }
        res.json({"err_code":0,"data": arrPersonLink});
      },function(e){
        res.json({"err_code": 1, "err_msg":e, "application": "Api Phoenix", "function": "getPersonLink"});
      });
    }
  },
  post: {
    person: function addPerson(req, res){
      var person_id = req.body.id;
      var person_gender = req.body.gender;
      var person_birthdate = req.body.birthdate;
      var person_active = req.body.active;
      var attachment_id = req.body.attachment_id;
      var organization_id = req.body.organization_id;
     
      if(organization_id == ""){
        organization_id = null;
      }

      var query = "UPSERT INTO BACIRO_FHIR.PERSON(person_id, person_gender, person_birthdate, person_active, attachment_id, organization_id)"+
        " VALUES ('"+person_id+"','"+person_gender+"', to_date('" + person_birthdate + "', 'yyyy-MM-dd'),"+person_active+", '"+attachment_id+"', '"+organization_id+"')";
      
      db.upsert(query,function(succes){
        var query = "SELECT person_id, person_gender, person_birthdate, person_active, attachment_id, organization_id FROM BACIRO_FHIR.PERSON WHERE person_id = '" + person_id + "'";
        db.query(query,function(dataJson){
          rez = lowercaseObject(dataJson);
          res.json({"err_code":0,"data":rez});
        },function(e){
          res.json({"err_code": 1, "err_msg":e, "application": "Api Phoenix", "function": "addPerson"});
        });
      },function(e){
          res.json({"err_code": 2, "err_msg":e, "application": "Api Phoenix", "function": "addPerson"});
      });
    },
    personLink: function addPersonLink(req, res){
      var person_link_id = req.body.id;
      var patientId = req.body.patient_id;
      var practitionerId = req.body.practitioner_id;
      var relatedPersonId = req.body.related_person_id;
      var personId = req.body.person_id;
      var personId2 = req.body.person_id2;
      var assurance= req.body.assurance;

      //susun query
      var column = "";
      var values = "";

      if(typeof patientId !== 'undefined' && patientId !== ""){
        column += 'person_link_target_patient,';
        values += "'"+ patientId +"',";
      }

      if(typeof practitionerId !== 'undefined' && practitionerId !== ""){
        column += 'person_link_target_practitioner,';
        values += "'"+ practitionerId +"',";
      }

      if(typeof relatedPersonId !== 'undefined' && relatedPersonId !== ""){
        column += 'person_link_target_related_person,';
        values += "'"+ relatedPersonId +"',";
      }

      if(typeof personId2 !== 'undefined' && personId2 !== "" ){
        column += 'person_link_target_person,';
        values += "'" + personId2 + "',";
      }

      if(typeof assurance !== 'undefined' && assurance !== "" ){
        column += 'person_link_assurance,';
        values += "'" + assurance + "',";
      }

      if(typeof personId !== 'undefined' && personId !== "" ){
        column += 'person_id,';
        values += "'"+ personId + "',";
      }

      
      var query = "UPSERT INTO BACIRO_FHIR.PERSON_LINK(person_link_id, " + column.slice(0, -1) + ")"+
        " VALUES ('"+ person_link_id +"', " + values.slice(0, -1) + ")";
      
      db.upsert(query,function(succes){
        var query = "SELECT person_link_id, person_link_target_patient, person_link_target_practitioner, person_link_target_related_person, person_link_target_person, person_link_assurance FROM BACIRO_FHIR.PERSON_LINK WHERE person_link_id = '" + person_link_id + "' ";
        db.query(query,function(dataJson){
          rez = lowercaseObject(dataJson);
          res.json({"err_code":0,"data":rez});
        },function(e){
          res.json({"err_code": 1, "err_msg":e, "application": "Api Phoenix", "function": "addPersonLink"});
        });
      },function(e){
          res.json({"err_code": 2, "err_msg":e, "application": "Api Phoenix", "function": "addPersonLink"});
      });
    }
  }
}

function lowercaseObject(jsonData){
  var rez = [];
  for(i=0; i < jsonData.length; i++){
    json = JSON.stringify(jsonData[i]);
    json2 = json.replace(/"([^"]+)":/g,function($0,$1){return ('"'+$1.toLowerCase()+'":');});
    rez[i] = JSON.parse(json2);
  }
  return rez;
}

function checkApikey(apikey){
  var query = "SELECT user_id FROM baciro.user WHERE user_apikey = '"+ apikey +"' ";

  db.query(query,function(dataJson){
    rez = lowercaseObject(dataJson);
    return rez;
  },function(e){
    return {"err_code": 1, "err_msg":e, "application": "Api Phoenix", "function": "checkApikey"};
  });
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

module.exports = controller;