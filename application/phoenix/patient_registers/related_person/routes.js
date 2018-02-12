var routesRelatedPerson = function(app, RelatedPerson){
	app.get('/:apikey/RelatedPerson', RelatedPerson.get.relatedPerson);
	app.post('/:apikey/related-person', RelatedPerson.post.relatedPerson);
}
module.exports = routesRelatedPerson;