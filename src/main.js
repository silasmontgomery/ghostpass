import Vue from 'vue'
import VueRouter from 'vue-router'
import Axios from 'axios'
import CryptoJS from 'crypto-js'
import '@/assets/css/tailwind.css'

Vue.config.productionTip = false
Vue.use(VueRouter)

// Add vue prototypes for component access
Vue.prototype.$http = Axios
Vue.prototype.$crypto = CryptoJS

// Components
import App from './App.vue'
import Home from './components/Home.vue'
import New from './components/New.vue'
import Safe from './components/Safe.vue'
import './registerServiceWorker'

const routes = [
  { path: '/', component: Home },
  { path: '/new', component: New },
  { path: '/safe/:uid', component: Safe }
]

const router = new VueRouter({
  mode: 'history',
  routes: routes
})

new Vue({
  el: '#app',
  components: { App },
  router
})