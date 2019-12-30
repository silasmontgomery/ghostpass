const configureAPI = require('./src/api/configure')

module.exports = {
    runtimeCompiler: true,
    devServer: {
        before: configureAPI
    },
    pwa: {
        name: 'Ghostpass',
        workboxPluginMode: 'InjectManifest',
        workboxOptions: {
            swSrc: 'src/service-worker.js'
        }
    }
}