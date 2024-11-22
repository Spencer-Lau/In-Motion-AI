import dotenv from 'dotenv';
import express from 'express';
import passport from 'passport';
import session from 'express-session';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'; // Passport Google OAuth Strategy
import db from './models/exerciseModels.js';

dotenv.config();

const app = express();

passport.use(new GoogleStrategy({ // Passport to use Google OAuth strategy for authenticating users
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/auth/google/callback', // URL that Google redirects user to after successful sign in; Passport uses the URL to process the callback from Google
    scope: ['profile', 'email'], // request profile and email from Google
  },
  async (accessToken, refreshToken, profile, done) => { // callback function that Passport calls once Google responds with several parameters but we only want profile for email and display name
    const { email, displayName } = profile; // get email and display name from the Google profile

    try { // Check if the user already exists in the 'exerciseUsers' table using their email
      const query = 'SELECT * FROM exerciseUsers WHERE email = $1 LIMIT 1'; // declare the parameterized query
      const { rows: existingUser, error: checkError } = await db.query(query, [email]); // run the SQL query passing in the email to query

      if (checkError) { // if an error occurs while checking user existence, handle it
        return done(checkError);
      }

      if (existingUser.length > 0) { // if the user exists, return the user data
        return done(null, existingUser[0]); // once passed to done, the authentication process is complete
      }

      const insertQuery = `INSERT INTO exerciseUsers (name, email, history) VALUES ($1, $2, $3) RETURNING *`; // if the user doesn't exist, create a new user in the database, RETURNING returns the newly creater user allowing immediate access to their information
      const { rows: newUser, error: createError } = await db.query(insertQuery, [
        displayName, email, [] // save name, email, and initialize empty history
      ]);

      if (createError) { // if error during user creation, handle it
        return done(createError);
      }

      return done(null, newUser[0]); // if the user was successfully created, return the new user data
    } catch (error) {
      return done(error);
    }
  }
));

passport.serializeUser((user, done) => { // serialize user into session, this stores part of the user data in the session, id in this case
  done(null, user.id); // store user ID to refer to the session
});

passport.deserializeUser(async (id, done) => { // deserialize user from session, this retrieves the full user data from the database based on the id stored in the session, Passport will use this function to retrieve and attach the user object to the req.user property during subsequent user requests
  try {
    const { rows: user, error } = await db.query('SELECT * FROM exerciseUsers WHERE id = $1', [id]);
    if (error) {
      return done(error); // handle error if user not found or database issue
    }
    done(null, user[0]); // return the full user data to the session
  } catch (error) {
    done(error); // Catch unexpected errors
  }
});

app.use( // use express-session for session management
  session({ // configure the session middleware to store the session ID in a cookie on the user's browser
    secret: process.env.SESSION_SECRET, // secret key to sign the session ID cookie
    resave: false, // don't save session if it is unmodified
    saveUninitialized: true, // save empty session if nothing is in it
    cookie: { // to configure the session cookie
      httpOnly: true, // ensure cookie can't be accessed via JavaScript
      secure: process.env.NODE_ENV === 'production', // use HTTPS for cookie in production
      sameSite: 'lax', // restrict sending cookies in cross-origin requests
      maxAge: 3600000, // set session expiration to 1 hour
    },
  })
);

app.use(passport.initialize()); // initialize Passport.js
app.use(passport.session()); // use Passport's session management

app.get('/auth/google', // define the route to start the Google login process
  passport.authenticate('google', {
    scope: ['profile', 'email'] // request access to profile and email
  })
);

app.get('/auth/google/callback', // callback route after Google authentication
  passport.authenticate('google', { failureRedirect: '/' }), // redirect to homepage on failure
  function (req, res) { // on success, redirect to the home page
    res.redirect('/');
  }
);

app.get('/', (req, res) => { // home route - display user profile if logged in, or login link if not
  if (req.isAuthenticated()) { // if user is authenticated, show the welcome message and logout link
    res.send(`<h1>Welcome, ${req.user.name}!</h1><a href='/logout'>Logout</a>`);
  } else { // if user is not authenticated, show login prompt
    res.send('<h1>Welcome! Please <a href="/auth/google">Login with Google</a></h1>');
  }
});

app.get('/logout', (req, res) => { // logout route - end the session and redirect to homepage
  req.logout((err) => {
    if (err) return next(err); // handle any error during logout
    res.redirect('/'); // redirect to homepage after logout
  });
});

app.listen(3000, () => {
  console.log('Server started on http://localhost:3000');
});
