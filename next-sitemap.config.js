module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_BASE_URL,
  generateRobotsTxt: true,
  changefreq: "daily",
  exclude: ["/api/*", "/admin/*"],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/"
      },
      {
        userAgent: "disallow",
        disallow: ["/api/*", "/admin/*"]
      }
    ]
  },
  additionalPaths: async (config) => [
    {
      loc: "/",
      lastmod: new Date().toISOString(),
      changefreq: "daily",
      priority: 1.0
    }
    // { loc: "/about", lastmod: new Date().toISOString(), changefreq: "daily", priority: 0.8 },
    // { loc: "/contact", lastmod: new Date().toISOString(), changefreq: "daily", priority: 0.8 },
    // { loc: "/terms", lastmod: new Date().toISOString(), changefreq: "daily", priority: 0.8 },
    // { loc: "/privacy", lastmod: new Date().toISOString(), changefreq: "daily", priority: 0.8 }
  ]
};
