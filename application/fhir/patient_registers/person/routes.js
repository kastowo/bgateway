var routesPerson = function(app, Person){
	app.get('/:apikey/Person', Person.get);
	app.post('/:apikey/Person', Person.post);
}
module.exports = routesPerson