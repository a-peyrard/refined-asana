const URL = require('url').URL;

function WindowMock(initialURI = 'https://app.asana.com') {
	this.location = new URL(initialURI);
}

module.exports = WindowMock;
