const express = require('express');
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const multer = require('multer')
const mongoose = require('mongoose')

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
app.use(cookieParser());

mongoose.connect('mongodb+srv://kashyap29700:hJMbbrThhO5fcH80@cluster0.6lpuf6e.mongodb.net/')

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

// authentication
const authLogin = (req, res, next) => {
    if (req.cookies.loginUsers) {
        next()
    } else {
        res.redirect('/login')
    }
}
const checkLoggedIn = (req, res, next) => {
    if (req.cookies.loginUsers) {
        res.redirect('/blogs');
    } else {
        res.locals.username = null;
        next();
    }
};
const checkLogged = (req, res, next) => {
    if (req.cookies.loginUsers) {
        next();
    } else {
        res.locals.username = null;
        next();
    }
};


// home
app.get('/', checkLogged, (req, res) => {
    const user = req.cookies.loginUsers;
    res.render('./Pages/index', { username: user ? user.username : null })
})

// Blog
app.get('/blogs', authLogin, async (req, res) => {

    try {
        const blogs = await blogModel.find();
        const user = req.cookies.loginUsers;
        res.locals.username = user.username;
        res.render('./Pages/blog', { blogs: blogs, username: user.username });
    } catch (err) {
        console.log(err);
    }

})

// register
app.get('/register', checkLoggedIn, (req, res) => {
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
app.get('/login', checkLoggedIn, (req, res) => {
    res.render('./Pages/login')
})
app.post('/login', async (req, res) => {
    let loginUser = req.body;
    try {
        const user = await userModel.findOne({ email: loginUser.email });
        if (user) {
            if (user.password === loginUser.password) {
                res.cookie('loginUsers', user, { maxAge: 250000 })
                console.log('success');
                // res.redirect('/blogs')
                res.redirect('/blogs?username=' + encodeURIComponent(user.username));

            } else {
                console.log('fail');
                res.redirect('/login')
            }
        } else {
            console.log("User Not FOund");
            res.redirect('/register')
        }
    } catch (err) {
        console.log(err);
        res.redirect('/login');
    }
})


// logout
app.get('/logout', (req, res) => {
    if (req.cookies.loginUsers) {
        res.clearCookie("loginUsers");
    }
    res.redirect('/')
})

// create Blog
app.get('/createblog', authLogin, (req, res) => {
    const user = req.cookies.loginUsers;
    res.render('./Pages/creation', { username: user ? user.username : null })
})
// post data
app.post('/upload', async (req, res) => {
    upload(req, res, async () => {
        if (req.file) {
            const loggedInUser = req.cookies.loginUsers;
            console.log(loggedInUser);
            var details = {
                title: req.body.title,
                description: req.body.description,
                // time: req.body.time,
                blogimage: req.file.filename,
                username: loggedInUser.username
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