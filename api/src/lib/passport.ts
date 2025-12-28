import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { prisma } from './prisma';

// Configuration Google OAuth
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.API_URL || 'http://localhost:3001'}/api/auth/google/callback`,
        scope: ['profile', 'email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error('Aucun email trouvé dans le profil Google'), undefined);
          }

          // Chercher ou créer l'utilisateur
          let user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user) {
            // Créer un nouvel utilisateur
            user = await prisma.user.create({
              data: {
                email,
                firstName: profile.name?.givenName || profile.displayName?.split(' ')[0] || 'Utilisateur',
                lastName: profile.name?.familyName || profile.displayName?.split(' ').slice(1).join(' ') || '',
                avatar: profile.photos?.[0]?.value,
                emailVerified: true,
                provider: 'google',
                providerId: profile.id,
              },
            });
          } else if (!user.provider) {
            // Lier le compte Google à un compte existant
            await prisma.user.update({
              where: { id: user.id },
              data: {
                provider: 'google',
                providerId: profile.id,
                avatar: user.avatar || profile.photos?.[0]?.value,
              },
            });
          }

          return done(null, user);
        } catch (error) {
          return done(error as Error, undefined);
        }
      }
    )
  );
}

// Configuration GitHub OAuth
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: `${process.env.API_URL || 'http://localhost:3001'}/api/auth/github/callback`,
        scope: ['user:email'],
      },
      async (accessToken: string, refreshToken: string, profile: any, done: any) => {
        try {
          // GitHub peut ne pas exposer l'email directement
          const email = profile.emails?.[0]?.value || `${profile.username}@github.local`;

          // Chercher ou créer l'utilisateur
          let user = await prisma.user.findFirst({
            where: {
              OR: [
                { email },
                { providerId: profile.id, provider: 'github' },
              ],
            },
          });

          if (!user) {
            // Créer un nouvel utilisateur
            const nameParts = (profile.displayName || profile.username || 'Utilisateur').split(' ');
            user = await prisma.user.create({
              data: {
                email,
                firstName: nameParts[0],
                lastName: nameParts.slice(1).join(' ') || '',
                avatar: profile.photos?.[0]?.value,
                emailVerified: email.includes('@github.local') ? false : true,
                provider: 'github',
                providerId: profile.id,
              },
            });
          } else if (!user.provider) {
            // Lier le compte GitHub à un compte existant
            await prisma.user.update({
              where: { id: user.id },
              data: {
                provider: 'github',
                providerId: profile.id,
                avatar: user.avatar || profile.photos?.[0]?.value,
              },
            });
          }

          return done(null, user);
        } catch (error) {
          return done(error as Error, undefined);
        }
      }
    )
  );
}

// Sérialisation
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
