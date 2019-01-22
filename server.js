const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const Chatkit = require('@pusher/chatkit-server')

const knex = require('knex')({
  client: 'pg',
  connection: {
    connectionString : process.env.DATABASE_URL,
    ssl: true
  }
});

const chatkit = new Chatkit.default({
 instanceLocator: process.env.CK_INSTANCE_LOCATOR,
  key: process.env.CK_KEY,
})
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

app.post('/users', (req, res) => {
  const { username } = req.body
  chatkit
   .createUser({
      id: username,
      name: username
    })
    .then(() => res.sendStatus(201))
    .catch(error => {
      if (error.error_type === 'services/chatkit/user_already_exists') {
        res.sendStatus(200)
      } else {
        res.status(error.status).json(error)
      }
    })

})

app.post('/authenticate', (req, res) => {
 const authData = chatkit.authenticate({ userId: req.query.user_id })
  res.status(authData.status).send(authData.body)
})


app.listen(process.env.PORT || 3000, () => {
  console.log(`app is running on port ${process.env.PORT}`);
})
