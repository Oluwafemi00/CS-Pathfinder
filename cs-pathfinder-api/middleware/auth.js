// middleware/auth.js
// Supports BOTH Supabase JWT key types:
//   - Legacy HS256 secret  (set SUPABASE_JWT_SECRET in .env)
//   - New ECC keys         (fetched automatically from JWKS endpoint)
//
// How it works:
//   1. Decode the JWT header to detect the algorithm (HS256 vs ES256)
//   2. If HS256 → verify locally with SUPABASE_JWT_SECRET (fast, no network)
//   3. If ES256 → verify using the JWKS endpoint (fetched once, then cached)

import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import { createClient } from "@supabase/supabase-js";

// ── JWKS client — fetches & caches Supabase's public ECC keys ────────────────
let _jwksClient = null;
const getJwksClient = () => {
  if (!_jwksClient) {
    _jwksClient = jwksClient({
      jwksUri: `${process.env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`,
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
    });
  }
  return _jwksClient;
};

// ── Get the signing key for a given JWT kid ───────────────────────────────────
const getSigningKey = (kid) =>
  new Promise((resolve, reject) => {
    getJwksClient().getSigningKey(kid, (err, key) => {
      if (err) return reject(err);
      resolve(key.getPublicKey());
    });
  });

// ── Per-request Supabase client ───────────────────────────────────────────────
const getAuthClient = (token) =>
  createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false },
  });

// ── requireAuth ───────────────────────────────────────────────────────────────
export const requireAuth = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided." });
  }

  try {
    // Decode header without verifying to check the algorithm
    const header = jwt.decode(token, { complete: true })?.header;

    if (!header) {
      return res.status(401).json({ error: "Invalid token format." });
    }

    let decoded;

    if (header.alg === "HS256") {
      // ── Legacy secret — verify locally, zero network ──────────────────
      if (!process.env.SUPABASE_JWT_SECRET) {
        console.error("SUPABASE_JWT_SECRET is not set in .env");
        return res.status(500).json({ error: "Server misconfiguration." });
      }
      decoded = jwt.verify(token, process.env.SUPABASE_JWT_SECRET);
    } else if (header.alg === "ES256" || header.alg === "RS256") {
      // ── New ECC/RSA key — fetch public key from JWKS, verify ─────────
      const publicKey = await getSigningKey(header.kid);
      decoded = jwt.verify(token, publicKey, { algorithms: [header.alg] });
    } else {
      return res
        .status(401)
        .json({ error: `Unsupported JWT algorithm: ${header.alg}` });
    }

    // Supabase stores user id in the `sub` claim
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
    };
    req.token = token;
    req.supabase = getAuthClient(token);

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ error: "Token expired. Please log in again." });
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token." });
    }
    console.error("Auth middleware error:", err.message);
    return res.status(401).json({ error: "Authentication failed." });
  }
};

// ── requireAdmin ──────────────────────────────────────────────────────────────
export const requireAdmin = async (req, res, next) => {
  try {
    const { data: profile, error } = await req.supabase
      .from("profiles")
      .select("role")
      .eq("id", req.user.id)
      .single();

    if (error || profile?.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Forbidden: admin access required." });
    }

    req.isAdmin = true;
    next();
  } catch (err) {
    console.error("Admin middleware error:", err.message);
    return res.status(403).json({ error: "Authorization failed." });
  }
};
