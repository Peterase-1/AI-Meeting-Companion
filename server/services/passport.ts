import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { prisma } from '../lib/prisma';

export const configurePassport = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID || "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        callbackURL: process.env.NODE_ENV === 'production'
          ? "https://35.94.16.120.nip.io/api/auth/google/callback"
          : "/api/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user exists
          let user = await prisma.user.findUnique({
            where: { googleId: profile.id },
          });

          if (user) {
            // Update tokens
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                accessToken,
                refreshToken: refreshToken || undefined, // Refresh token might not always be sent
              },
            });
            return done(null, user);
          }

          // Check if email exists (link account)
          const existingEmail = await prisma.user.findUnique({
            where: { email: profile.emails?.[0].value },
          });

          if (existingEmail) {
            // Link googleId to existing email user
            user = await prisma.user.update({
              where: { id: existingEmail.id },
              data: {
                googleId: profile.id,
                avatar: profile.photos?.[0].value,
                accessToken,
                refreshToken,
              }
            });
            return done(null, user);
          }

          // Create new user
          const newUser = await prisma.user.create({
            data: {
              googleId: profile.id,
              email: profile.emails?.[0].value!,
              name: profile.displayName,
              avatar: profile.photos?.[0].value,
              accessToken,
              refreshToken,
            },
          });

          done(null, newUser);
        } catch (error) {
          done(error, undefined);
        }
      }
    )
  );

  // Serialize/Deserialize (Optional for API usage if using JWT, but Passport might need it for session-less flows essentially just passing user)
  // For JWT flows, we usually don't use sessions, but we use the callback to issue JWT.
};
