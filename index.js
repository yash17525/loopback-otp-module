// function to generate a OTP
var passport = require('passport-strategy')
    , util = require('util')

function genOtp(options, verify) {
    if (typeof options == 'function') {
        verify = options;
        options = {};
    }
    if (!verify) { throw new TypeError('LocalStrategy requires a verify callback'); }

    this._countryCodeField = options.countryCodeField || '+91';
    this._mobileField = options.mobileField || '8219431886';

    this._messageProvider = options.messageProvider;
    this._verify = verify;
    this._callbackPath = options.callbackPath;
    this._successRedirect = options.successRedirect;
    this._failureRedirect = options.failureRedirect;
    this._failureFlash = options.failureFlash;
    this.name = 'otp';
    this._passReqToCallback = options._passReqToCallback;

    this._flag = 0 ;
    passport.Strategy.call(this);
}

util.inherits(genOtp, passport.Strategy);

genOtp.prototype.authenticate = function (req, options) {
    console.log(req.body);
    options = options || {};
    
    if(this._flag == 0) {
        var speakeasy = require('speakeasy');
        var secret = speakeasy.generateSecret({ length: 20 });
        var token = speakeasy.totp({
            secret: secret.base32,
            encoding: 'base32'
        });
    
        console.log('country code , mobile , token', req.body.countryCode, req.body.mobile, token);
        this._messageProvider(req.body.countryCode, req.body.mobile,token);
        
        this._flag = 1;
        
        // this.redirect('/read-otp');
        return this.send('otp has been sent');
    }

    console.log('now flag is = '+this._flag + '\nreq body :'+req.body);
    var self = this;
    function verified(err, user, info) {
        if (err) { return self.error(err); }
        if (!user) { return self.fail(info); }
        self.success(user, info);
    }

    try {
        if (self._passReqToCallback) {
            this._verify(req, username, password, verified);
        } else {
            console.log('in the verified function');
            this._verify(req.body.countryCode, req.body.mobile, verified);
        }
    } catch (ex) {
        return self.error(ex);
    }
};


// module.exports = genOtp;

exports = module.exports = genOtp;

/**
 * Export constructors.
 */
exports.genOtp = genOtp;
