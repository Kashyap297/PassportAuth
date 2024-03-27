const express = require('express');
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const multer = require('multer')
const mongoose = require('mongoose')
// passport
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

const { userModel } = require('./schemas/userschema.js')
const { blogModel } = require('./schemas/blogschema.js')

const app = express();
const port = 9000;

// middleware
app.use(express.static('public'));
app.use(express.static('upload'));
app.use(bodyParser.urlencoded({ extended: false }))
app.set('view engine', 'ejs')
app.use(bodyParser.json());
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb+srv://kashyap29700:hJMbbrThhO5fcH80@cluster0.6lpuf6e.mongodb.net/')

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}


const storage = multer.diskStorage(
    {
        destination: (req, file, cb) => {
            return cb(null, './upload')
        },
        filename: (req, file, cb) => {
            return cb(null, Date.now() + file.originalname)
        }
    }
)

var upload = multer({ storage: storage }).single('file');

passport.use(new LocalStrategy({
    usernameField: 'email',
},
    async function (email, password, done) {
        try {
            const user = await userModel.findOne({ email: email });
            // console.log(user);
            if (!user) {
                return done(null, false, { message: 'Incorrect email.' });
            }
            if (user.password !== password) {
                return done(null, false, { message: 'Incorrect password.' });
            }
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }
));

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(async (id, cb) => {
    try {
        const userData = await userModel.findById(id);
        cb(null, userData);
    } catch (err) {
        cb(err);
    }
});

// home
app.get('/', (req, res) => {
    const user = req.user;
    res.render('./Pages/index')
})

// register
app.get('/register', (req, res) => {
    res.render('./Pages/register')
})
app.post('/register', async (req, res) => {
    const users = req.body;
    try {
        const register = new userModel(users);
        await register.save();

        res.redirect('/login')
    } catch (err) {
        console.log(err);
    }
})

// login
app.get('/login', (req, res) => {
    res.render('./Pages/login')
})
app.post('/login',
    passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login' }),
);

// logout
app.get('/logout', (req, res) => {
    req.logout(function (err) {
        if (err) {
            console.error(err);
            return res.redirect('/');
        }
        res.redirect('/');
    });
});

// Blog
app.get('/blogs', ensureAuthenticated, async (req, res) => {
    try {
        const blogs = await blogModel.find();
        const user = req.user;
        res.render('./Pages/blog', { blogs: blogs, username: user.username });
    } catch (err) {
        console.log(err);
    }

})
// create Blog
app.get('/createblog', ensureAuthenticated, (req, res) => {
    const user = req.user;
    res.render('./Pages/creation', { username: user ? user.username : null })
})
// post data
app.post('/upload', async (req, res) => {
    upload(req, res, async () => {
        if (req.file) {
            const user = req.user
            var details = {
                title: req.body.title,
                description: req.body.description,
                blogimage: req.file.filename,
                username: user.username
            }
            console.log(details);

            const blog = new blogModel(details)
            console.log(blog);
            try {
                await blog.save();
                res.redirect('/blogs');
            } catch (error) {
                console.error(error);
            }
        } else {

        }
    })
})

// server
app.listen(port, () => {
    console.log(`server Start at http://localhost:${port}`);
})