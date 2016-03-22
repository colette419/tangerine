var express = require('express');
var app = express();
var pg = require('pg');
var bodyParser = require('body-parser');
var session = require('express-session');
var Promise = require('promise');
var bcrypt = require('bcrypt');
var Sequelize = require('sequelize');
var sequelize = new Sequelize('Tangerine', 'WebDevelopment', null, {
	host: 'localhost',
	dialect: 'postgres'
});

app.set('view engine', 'jade');
app.set('views', './public/views');

app.use(express.static('public/css'));
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
	extended: true
}));

app.use(session({ // this is how you manage sessions
	secret: 'oh wow very secret much security',
	resave: true,
	saveUninitialized: false
}));

var User = sequelize.define('user', { // defines the User model 
	firstname: Sequelize.STRING,
	lastname: Sequelize.STRING,
	email: Sequelize.STRING,
	gender: Sequelize.STRING,
	lookingFor: Sequelize.STRING,
	city: Sequelize.STRING,
	birthday: Sequelize.DATEONLY,
	username: Sequelize.STRING,
	password: Sequelize.STRING
});

var Availability = sequelize.define('availability', {
	date: Sequelize.DATEONLY,
	beginTime: Sequelize.TIME,
	endTime: Sequelize.TIME
})

User.hasMany(Availability);
Availability.belongsTo(User);

app.get('/', function(req, res) {
	message: req.query.message,
	res.render('login', {
		message: req.query.message,
		user: req.session.user
	});
});

app.post('/', function(request, response) {
	if (request.body.username.length === 0 || request.body.password === 0) {
		response.redirect('/?message=' + encodeURIComponent("Please enter a username and password."));
		return;
	} else {
		User.findOne({
			where: {
				username: request.body.username
			}
		}).then(function(user) {
			if (user !== null) {
				bcrypt.compare(request.body.password, user.password, function(err, result) {
					if (err !== undefined) {
						console.log(err);
					} else {
						var matchin = result;
					}
					if (matchin === true) {
						request.session.user = user;
						response.redirect('/availability');
					} else {
						response.redirect('/?message=' + encodeURIComponent("Invalid email or password."));
					}
				});
			} else {
				response.redirect('/?message=' + encodeURIComponent("Invalid email or password."));
			};
		});
	};
});

app.get('/register', function(req, res) {
	res.render('register', {
		message: req.query.message
	});
});



app.post('/register', function(req, res) {
	if (req.body.firstName.trim().length === 0 || req.body.lastName.trim().length === 0 ||
		req.body.email.trim().length === 0 || req.body.username.trim().length === 0 || req.body.password.trim().length === 0 || req.body.city.trim().length === 0 || req.body.gender.trim().length === 0 || req.body.looking.trim().length === 0) {
		res.redirect('/register/?message=' + encodeURIComponent("All fields are required."));
	} else {
		var uniqueUser = true;
		User.findAll().then(function(users) {
			var data = users.map(function(user) { // ".map" iterates through all the items in an array. it is returning some values for each post in posts.
				return {
					email: user.dataValues.email,
					username: user.dataValues.username
				};
			});
			for (var i = 0; i < data.length; i++) {
				if (req.body.email === data[i].email || req.body.username === data[i].username) {
					uniqueUser = false;
				}

			}
			if (uniqueUser === true) {
				bcrypt.hash((req.body.password), 8, function(err, hash) {
					if (err !== undefined) {
						console.log(err);
					} else {
						var hashPassword = hash;
					}
					User.create({
						firstname: req.body.firstName.trim(),
						lastname: req.body.lastName.trim(),
						email: req.body.email.trim(),
						gender: req.body.gender,
						lookingFor: req.body.looking,
						city: req.body.city,
						birthday: req.body.birthday,
						username: req.body.username.trim(),
						password: hashPassword,
					}).then(function(user) {
						req.session.user = user;
						res.redirect('/availability?message=' + encodeURIComponent("You've just registered! See below for the new world of opportunity available ;)!"));
					});
				})
			} else {
				res.redirect('/register/?message=' + encodeURIComponent("This is not a unique user; please try again with another username or password."));
			}
		});
	};
});

//******************************************************************

app.get('/availability', function(req, res) {
	var user = req.session.user;
	if (user === undefined) {
		res.redirect('/?message=' + encodeURIComponent("Please log in to post messages."))
	} else {
		Availability.findAll({
			where: {
				userId: req.session.user.id
			}
		}).then(function(lines) {
			var availabilityBlob = lines.map(function(row) {
				return {
					id: row.dataValues.id,
					date: row.dataValues.date,
					beginTime: row.dataValues.beginTime,
					endTime: row.dataValues.endTime
				}
			});
			res.render('availability', {
				availabilityBlob: availabilityBlob
			});
		});
	};
});


//******************************************************************
app.post('/availability', function(req, res) {
	var user = req.session.user;
	console.log(user);
	if (user === undefined) {
		res.redirect('/?message=' + encodeURIComponent("Please log in to post messages."))
	} else {
		Availability.create({
			date: req.body.availableDate,
			beginTime: req.body.beginTime,
			endTime: req.body.endTime,
			userId: user.id
		});
		res.redirect('/availability')
	}
});

app.get('/logout', function(request, response) { // route to end a session
	request.session.destroy(function(error) { // this is how you end a session. 
		if (error) {
			throw error;
		}
		response.redirect('/?message=' + encodeURIComponent("You have been successfully logged out."));
	})
});



sequelize.sync().then(function() {
	app.listen(3000, function() {
		console.log('Example app listening on port 3000!');
	});
});