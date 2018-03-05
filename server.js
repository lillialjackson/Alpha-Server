const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex')({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : 'DB_USER',
    password : 'DB_PW',
    database : 'alpha_db',
  },
  debug: true
});


const app = express();


// middleware
app.use(cors());
app.use(bodyParser.json());



// route responds with working
app.get('/', (req, res)=>{
  res.send(knex.users);
})

knex.select('*').from('users');

// signin post
app.post('/signin', (req, res) => {
  knex.select('email', 'hash').from('users')
  .where('email', '=', req.body.email)
  .then(data => {
    const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
    if (isValid) {
      return knex.select('*').from('users')
            .where('email', '=', req.body.email)
            .then(user => {
              res.json(user[0])
            })
            .catch(err => res.status(400).json('unable to get user'))
        } else{
          res.status(400).json('wrong credentials')
          console.log('first catch');
        }
      })
  .catch(err =>{
    console.log('second catch:', err);
   return res.status(400).json('wrong credentials');
 })

})



 // register post = user
app.post('/register', (req, res) => {
  const {email, username, password, experienceLevel, location} =req.body;
  const hash = bcrypt.hashSync(password);
  knex('users')
    .returning('username')
    .insert({
        username: username,
        email: email,
        hash: hash,
        experiencelevel: experienceLevel,
        location: location
    })
    .then(response => {
      res.json(response);
    })
    .catch(err => {
      console.log('second catch:', err);
      res.status(400).json('unable to join');
      })
  })


// profile get user
app.get('/profile/:id', (req, res) => {
  const {id} = req.params;
  // let found = false;
    knex.select('*').from('users').where({id})
    .then(user => {
      if(user.length){
      res.json(user[0])
    } else{
      res.status(400).json('Not found')
    }
  })
    .catch(err => res.status(400).json('Not found'))
})


// search DB get users with relevant search criteria
app.get('/search', (req, res) => {
  const {experiencelevel, location} = req.query;
  console.log(req.query);
  console.log( "Experience level" + experiencelevel);
  console.log( "location " + location);

  knex.select('email', 'username').from('users')
    .where('experiencelevel', '=', experiencelevel)
    .andWhere('location', '=', location)
    .then(users => {
      // if(!users.length === 0) {
      //   console.log(users);
      // } else {
      //   console.log('No users found!')
      //   return
      // }
      console.log(users);
      return users;
    })
    .then(users => {
      res.json(users);
    })
})

app.get('/emailsearch', (req, res) => {
  const params = req.query;
  console.log(params);
  knex.select('email', 'experiencelevel', 'location', 'username').from('users')
    .where('email', '=', params.email)
    .then(user => {
      if(!user.length === 0) {
        console.log(user);
      }
    })
})
// app.get('/search', (req, res) => {
//   const {email, experienceLevel, location} =req.body;
//   let profileMatch = false;
//   if(location === res.body.location && experienceLevel === res.body.experiencelevel ) {
//     profileMatch = true;
//     console.log;
//     return res.json();
//   }
//   if (!profileMatch){
//     res.status(404).json('No climbers registered in your area at this time, please try again later!');
//   }
// })


// listen on any port env var


app.listen(3000, () => {
  console.log('app is running on port 3000');
})
