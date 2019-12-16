const configureAPI = require('./src/api/configure')

module.exports = {
    runtimeCompiler: true,
    devServer: {
        before: configureAPI
    }
}