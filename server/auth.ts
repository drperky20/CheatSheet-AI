import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User } from "@shared/schema";
import createMemoryStore from "memorystore";

declare global {
  namespace Express {
    interface User {
      id: number;
      username: string;
      password: string;
      canvasUrl: string | null;
      canvasToken: string | null;
    }
  }
}

const scryptAsync = promisify(scrypt);
const MemoryStore = createMemoryStore(session);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "cheatsheetai-secret-key",
    resave: false,
    saveUninitialized: true, // Changed to true to save new sessions
    store: storage.sessionStore,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days (within 32-bit signed integer limit)
      secure: process.env.NODE_ENV === "production",
      sameSite: 'lax'
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Check for Replit auth headers
  app.use((req, res, next) => {
    const replitUserId = req.headers['x-replit-user-id'];
    const replitUserName = req.headers['x-replit-user-name'];
    
    if (replitUserId && replitUserName) {
      // User is authenticated via Replit
      storage.getUserByUsername(replitUserName as string)
        .then(existingUser => {
          if (!existingUser) {
            // Create user if they don't exist
            return storage.createUser({
              username: replitUserName as string,
              password: `replit-auth-${randomBytes(16).toString('hex')}`,
              canvasUrl: null,
              canvasToken: null
            });
          }
          return existingUser;
        })
        .then(user => {
          req.login(user, err => {
            if (err) console.error("Login error:", err);
            next();
          });
        })
        .catch(err => {
          console.error("Replit auth error:", err);
          next();
        });
    } else {
      next();
    }
  });

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).send("Username already exists");
      }

      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.status(200).json(req.user);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
}
