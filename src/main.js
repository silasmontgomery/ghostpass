import Vue from 'vue'
import VueRouter from 'vue-router'
import Axios from 'axios'
import '@/assets/css/tailwind.css'

Vue.config.productionTip = false
Vue.use(VueRouter)

// Add axios as http prototype
Vue.prototype.$http = Axios;

// Components
import App from './App.vue'
import Home from './components/Home.vue'
import New from './components/New.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/new', component: New }
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
