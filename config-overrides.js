module.exports = function override(config, env) {
  config.module.rules.push({
    test: /\.worker\.[jt]s$/,
    use: { loader: "worker-loader" },
  });
  // const fs = require("fs");
  // fs.writeFileSync("./wpconf.json", JSON.stringify(config, null, 2));
  return config;
};
