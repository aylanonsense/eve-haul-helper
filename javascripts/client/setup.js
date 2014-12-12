//configure requirejs
requirejs.config({
	baseUrl: '/',
	paths: {
		jquery: '/client/lib/jquery-1.10.2.min',
		promise: '/client/lib/promise-wrapper'
	}
});

//run client/Main
requirejs([ 'client/Main' ], function(Main) {
	Main();
});