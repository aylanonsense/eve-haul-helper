define([
	'jquery',
	'promise'
],
function(
	$,
	Promise
) {
	return function findRoutes(params) {
		return new Promise(function(resolve, reject) {
			if(params.regions) {
				params.regions = params.regions.join(",");
			}
			$.ajax({
				url: "api/routes",
				data: params,
				dataType: "json"
			}).then(function(data) {
				resolve(data);
			}, function(xhr, status, err) {
				reject(err);
			});
		});
	};
});