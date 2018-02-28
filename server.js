const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');
const app = express();




// knex var
const db = knex ({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : 'lil',
    password : '',
    database : 'alpha_db'
  }
});

db.select('*').from('users');

// middleware
app.use(bodyParser.json());
app.use(cors());


// route responds with working
app.get('/', (req, res)=>{
  res.send(db.users);
})


// signin post
app.post('/signin', (req, res) => {
  db.select('email', 'hash').from('users')
  .where('email', '=', req.body.email)
  .then(data => {
    const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
    if (isValid) {
      return db.select('*').from('users')
            .where('email', '=', req.body.email)
            .then(user => {
              res.json(user[0])
            })
            .catch(err => res.status(400).json('unable to get user'))
        } else{
          res.status(400).json('wrong credentials')
        }
      })
  .catch(err => res.status(400).json('wrong credentials'))
})


//  register post = user
app.post('/register', (req, res) => {
  const {email, name, password} =req.body;
  const hash = bcrypt.hashSync(password);
  // transaction used to update both tables in database, be sure to change
  // values to be relevent to users and user_preferences
  db.transaction( trx => {
    trx.insert({
      experience: experienceLevel,
      email: email
    })
    .into('user_preferences')
    .returning('email')
    .then(loginEmail => {
      return trx('users')
        .returning('*')
        .insert ({
          username: username,
          email: loginEmail[0],
          hash: hash
        })
        .then(user => {
          res.json(user[0]);
            })
          })
          .then(trx.commit)
          .catch(trx.rollback)
        })
        .catch(err => res.status(400).json('unable to join'))
  })



// profile get user
app.get('/profile/:id', (req, res) => {
  const {id} = req.params;
  // let found = false;
    db.select('*').from('users').where({id})
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

/* app.get('/search', (res, req) => {
  let profileMatch = false;
  if(req.query[{city}] && req.query[{experience}]) {
    profileMatch = true;
    return res.json({users});
  }
  if (!profileMatch){
    res.status(404).json('No climbers registered in your area at this time, please try again later!');
  }
})

*/

// listen on any port env var


app.listen(3002, () => {
  console.log('app is running on port 3002');
})
