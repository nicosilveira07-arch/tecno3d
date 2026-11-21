module.exports = {
  apps: [
    {
      name: "tecno3d-api",
      cwd: "/home/ec2-user/tecno3d/backend",
      script: "src/server.js",
      interpreter: "node",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};