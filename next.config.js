/** @type {import('next').NextConfig} */
const nextConfig = {
  // smiles-drawer ships untranspiled ES/TS source (e.g. src/CIP.ts); let Next compile it.
  transpilePackages: ['smiles-drawer'],
};

module.exports = nextConfig;
