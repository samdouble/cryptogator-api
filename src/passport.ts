import bcrypt from 'bcrypt';
import passport from 'passport';
import passportBearer from 'passport-http-bearer';
import passportJwt from 'passport-jwt';
import passportLocal from 'passport-local';
import fetchOneUser from './users/controllers/fetchOne';

const cookieExtractor = req => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies.token;
  }
  /*if (req.headers && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      return { from: 'headers', token: parts[1] };
    }
  }*/
  return token;
};

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

const BearerStrategy = passportBearer.Strategy;
passport.use(new BearerStrategy(
  async (token, done) => {
    const user = await fetchOneUser(
        { 'apiKeys.key': token },
        { session: null },
        false,
      )
      .catch(() => null);

    if (!user) {
      return done(null, false);
    }
    const apiKey = user.apiKeys?.find(a => a.key === token);
    if (!apiKey) {
      return done(null, false);
    }
    // TODO Check key expiration
    return done(null, {
      id: user.id,
      permissions: apiKey.permissions,
    });
  }
));

const JwtStrategy = passportJwt.Strategy;
passport.use(
  'jwt_general',
  new JwtStrategy(
    {
      jwtFromRequest: passportJwt.ExtractJwt.fromExtractors([
        cookieExtractor,
        passportJwt.ExtractJwt.fromAuthHeaderAsBearerToken,
      ]),
      secretOrKey: process.env.JWT_SECRET,
    },
    (payload, done) => {
      return done(null, { id: payload.id });
    },
  ),
);

passport.use(
  'jwt_login',
  new JwtStrategy(
    {
      jwtFromRequest: passportJwt.ExtractJwt.fromExtractors([
        cookieExtractor,
        passportJwt.ExtractJwt.fromAuthHeaderAsBearerToken,
      ]),
      secretOrKey: process.env.JWT_SECRET,
    },
    async (payload, done) => {
      const user = await fetchOneUser(
          { id: payload.id },
          { session: null },
          false,
        )
        .catch(() => null);
      if (!user) {
        return done(null, false);
      }
      return done(null, user);
    },
  ),
);

const LocalStrategy = passportLocal.Strategy;
passport.use(
  new LocalStrategy(
    {
      usernameField: 'emailAddress',
      passwordField: 'password',
    },
    async (emailAddress, password, cb) => {
      const user = await fetchOneUser(
          { emailAddress },
          { session: null },
          false,
        )
        .catch(() => null);
      if (!user) {
        return cb(null, false);
      }
      bcrypt.compare(password, user.password!, (error, passwordsMatch) => {
        if (error) {
          return cb(null, false);
        }
        if (!passwordsMatch) {
          return cb(null, false);
        }
        return cb(null, user);
      });
    },
  ),
);

export default passport;
