const schoolDomain = "https://school.leoh.site";
const configuredUrl = process.env.SITE_URL?.replace(/\/+$/, "");

export const schoolSiteUrl = !configuredUrl || configuredUrl === "https://school11-client-again.vercel.app"
  ? schoolDomain
  : configuredUrl;
