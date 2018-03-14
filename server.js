const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex')({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : 'Lillia',
    password : 'Wanda93db',
    database : 'alpha_db',
  }
});


const app = express();


// middleware
app.use(cors());
app.use(bodyParser.json());


app.get('/', (req, res)=> { res.send('server working') })

// signin post
app.post('/signin', (req, res) => {
  const {email, password} = req.body
  if (!email || !password) {
    return res.status(400).json('incorrect form submission');
  }
  knex.select('email', 'hash').from('users')
  .where('email', '=', email)
  .then(data => {
    const isValid = bcrypt.compareSync(password, data[0].hash);
    if (isValid) {
      return knex.select('*').from('users')
            .where('email', '=', email)
            .then(user => {
              res.json(user[0])
            })
            .catch(err => res.status(400).json('unable to get user'))
        } else{
          res.status(400).json('wrong credentials')
        }
      })
  .catch(err =>{
   return res.status(400).json('wrong credentials');
 })

})

 // register post = user
app.post('/register', (req, res) => {
  const {email, username, password, experienceLevel, location} =req.body;
  if (!email || !username || !password || !location || !experienceLevel) {
    return res.status(400).json('incorrect form submission');
  }
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
      res.status(400).json('unable to join');
      })
  })




// search DB get users with relevant search criteria
app.get('/search', (req, res) => {
  const {experiencelevel, location} = req.query;

  knex.select('email', 'username').from('users')
    .where('experiencelevel', '=', experiencelevel)
    .andWhere('location', '=', location)
    .then(users => {
      return users;
    })
    .then(users => {
      res.json(users);
    })
    .catch(err => {
      res.status(400).json('error returning search results');
      })
})




app.listen(process.env.PORT || 3000, () => {
  console.log(`app is running on port ${process.env.PORT}`);
})
