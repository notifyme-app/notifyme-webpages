module.exports={
    presets: [
        [
          "@babel/preset-env",
          {
            useBuiltIns: "usage",
            corejs: {
              version: 3,
              proposals: true
            },
            targets: "last 2 versions, > 0.2%, not dead"
          }
        ]
      ]
}