const User = require('../../models/user');
const bcrypt = require('bcrypt');
const passport = require('passport');

function authController() {

    const _getRedirectUrl = (req) => {
        return req.user.role === 'admin' ? "/admin/orders" : "/customer/orders";
    }

    return {
        login(req, res) {
            res.render('auth/login');
        },

        postLogin: async (req, res, next) => {

            const { email, password } = req.body;

            // Validate request
            if (!email || !password) {
                req.flash('error', 'All fields are required');
                return res.redirect('/login');
            }

            passport.authenticate('local', (err, user, info) => {
                if (err) {
                    req.flash('error', info.message);
                    return next(err);
                }
                if (!user) {
                    req.flash('error', info.message);
                    return res.redirect('/login');
                }
                req.login(user, (err) => {
                    if (err) {
                        req.flash('error', info.message);
                        return next(err);
                    }
                    return res.redirect('/');
                })
            })(req, res, next)
        },

        register(req, res) {
            res.render('auth/register');
        },

        postRegister: async (req, res) => {

            const { name, email, password } = req.body;

            // Validate request
            if (!name || !email || !password) {
                req.flash('error', 'All fields are required');
                req.flash('name', name);
                req.flash('email', email);
                return res.redirect('/register');
            }

            // Check if email exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                req.flash('error', 'Email already taken!!!');
                req.flash('name', name);
                req.flash('email', email);
                return res.redirect('/register');
            }

            // Hash Password
            const hashPassword = await bcrypt.hash(password, 10);

            // Create a new user
            const user = new User({
                name,
                email,
                password: hashPassword
            });

            user.save().then((user) => {
                // Login

                return res.redirect('/');
            }).catch((err) => {
                req.flash('error', 'Something went wrong');
                return res.redirect('/register');
            });
        },

        logout: (req, res) => {
            req.logout(function (err) {
                if (err) { return next(err); }
                res.redirect('/');
            });
        }
    }
}


module.exports = authController;