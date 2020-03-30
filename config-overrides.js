module.exports = function override(config, env) {
  config.module.rules.push({
    test: /\.worker\.[jt]s$/,
    use: { loader: "worker-loader" },
  });
  return config;
};
