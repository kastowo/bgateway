var routesRelatedPerson = function(app, RelatedPerson){
	app.get('/:apikey/RelatedPerson', RelatedPerson.get);
	app.post('/:apikey/RelatedPerson', RelatedPerson.post);
}
module.exports = routesRelatedPerson;