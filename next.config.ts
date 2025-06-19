import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  headers: async () => {
    return [
      {
        source: "/product/draft",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "http://next.myapp.local",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,POST,OPTIONS,PUT,DELETE",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
      {
        source: "/product/generate-description",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "http://next.myapp.local",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,POST,OPTIONS,PUT,DELETE",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
      {
        source: "/cloudinary/*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "http://next.myapp.local",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,POST,OPTIONS,PUT,DELETE",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "http://angular.myapp.local",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, PATCH, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
