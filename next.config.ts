import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The local `prisma dev` database can't reliably serve the default (CPU-count)
  // number of concurrent static-generation workers — each opens its own Prisma
  // connection pool, and this embedded dev Postgres drops connections under that
  // load (P1017/ECONNREFUSED during `next build`). A real Postgres instance in
  // staging/production doesn't have this ceiling.
  experimental: {
    cpus: 2,
  },
};

export default nextConfig;
