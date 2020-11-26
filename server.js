//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));


mongoose.connect("mongodb+srv://manam:manam@cluster0.i6dfw.mongodb.net/madhurai", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(() => {
    console.log(`connection to database established`)
}).catch(err => {
    console.log(`db error ${err.message}`);
    process.exit(-1)
});

app.use(session({
    name: "sid",
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 3
    }
}));

const userSchema = {
    email: String,
    password: String
};

const User = new mongoose.model("User", userSchema);

const bookingSchema = {
    email: String,
    date: String,
    slot: String
};

const Book = new mongoose.model("Book", bookingSchema);

const feedbackSchema = {
    email: String,
    comment: String
};

const Feedback = new mongoose.model("Feedback", feedbackSchema);


const profileSchema = {
    email: String,
    date: String,
    slot: String
};

const Profile = new mongoose.model("Profile", profileSchema);

// **********************************************************************************************************************


var redirectlogin = (req, res, next) => {
    if (!req.session.userid) {
        res.redirect("/login");
    } else {
        next()
    }
}

var redirecthome = (req, res, next) => {
    if (req.session.userid) {
        res.redirect("/booking");
    } else {
        next()
    }
}



app.get("/", function (req, res) {
    res.render("home", {
        ename: ema
    });
});

app.get("/login", redirecthome, function (req, res) {
    res.render("login", {
        ename: ema,
        information: information
    });
});

app.get("/register", redirecthome, function (req, res) {
    res.render("register", {
        ename: ema
    });
});

app.get("/booking", redirectlogin, function (req, res) {
    res.render("booking", {
        ename: ema
    });
});

app.get("/feedback", function (req, res) {
    res.render("feedback", {
        ename: ema
    });
});

app.get("/about", function (req, res) {
    res.render("about", {
        ename: ema
    });
});

app.get("/thanks", function (req, res) {
    res.render("thanks", {
        ename: ema
    });
});

app.get("/history", redirectlogin, function (req, res) {
    Book.find({
        "email": ema
    }, function (err, found) {
        if (err) {
            console.log(err);
        } else {
            if (found) {
                res.render("history", {
                    ename: ema,
                    details: found
                });
            }
        }
    })
});

app.get("/profile", redirectlogin, function (req, res) {
    res.render("profile", {
        ename: ema
    });
});

app.get("/logout", redirectlogin, function (req, res) {
    req.session.destroy(err => {
        if (err) {
            console.log(err);
            ema = "";
            res.redirect("/booking");
        } else {
            res.clearCookie("sid");
            res.render("logout");
        }
    })
});




// **********************************************************************************************************************
var information = "";
var ema = "";

app.post("/register", redirecthome, function (req, res) {
    var email = req.body.email;
    var password = req.body.password;

    User.findOne({
        email: email
    }, function (err, founduser) {
        if (err) {
            console.log(err);
        } else {
            if (founduser) {
                information = "already registered";
                res.redirect("/login");
            } else {
                const newUser = new User({
                    email: email,
                    password: password
                });

                newUser.save(function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        information = "registered";
                        res.redirect("/login");
                    }
                });
            }
        }
    })
});

app.post("/login", redirecthome, function (req, res) {
    var email = req.body.email;
    var password = req.body.password;

    User.findOne({
        email: email
    }, function (err, founduser) {
        if (err) {
            console.log(err);
        } else {
            if (founduser) {
                if (founduser.password == password) {
                    ema = email;
                    req.session.userid = founduser._id;
                    res.redirect("/booking");
                } else {
                    information = "incorrect password";
                    res.redirect("/login");
                }
            } else {
                information = "not registered";
                res.redirect("/login");
            }
        }
    })
});


app.post("/booking", redirectlogin, function (req, res) {
    var date = req.body.date;
    var slot = req.body.slot;

    const newbooking = new Book({
        email: ema,
        date: date,
        slot: slot
    });

    newbooking.save(function (err) {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/thanks");
        }
    });
});


app.post("/profile", redirectlogin, function (req, res) {
    var fname = req.body.fname;
    var lname = req.body.lname;
    var dob = req.body.dob;
    var gender = req.body.gender;

    const newprofile = new Profile({
        email: ema,
        fname: fname,
        lname: lname,
        dob: dob,
        gender: gender
    });

    newprofile.save(function (err) {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/booking");
        }
    });
});

app.post("/feedback", function (req, res) {
    var mail = req.body.email;
    var comment = req.body.comment;

    const newfeedback = new Feedback({
        email: mail,
        comment: comment
    });

    newfeedback.save(function (err) {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/");
        }
    });
});

app.listen(process.env.PORT || 3000, function () {
    console.log("Server started on port 3000.");
});