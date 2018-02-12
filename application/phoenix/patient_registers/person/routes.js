var routesPerson = function(app, Person){
	app.get('/:apikey/Person', Person.get.person);
	app.get('/:apikey/PersonLink', Person.get.personLink);
	app.post('/:apikey/person', Person.post.person);
	app.post('/:apikey/person-link', Person.post.personLink);
}
module.exports = routesPerson;