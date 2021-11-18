import Vue from 'vue'
import VueRouter from 'vue-router'
import app from './app_all.vue'
import Vuex from 'vuex'
import pmt from 'pmt'

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import '../statics/styles/global.less'
import {get, post, put, deleteDate} from './utils/http.js'
import createStore from './store/store.js'

pmt('test', Vue)

Vue.prototype.$get = get;
Vue.prototype.$post = post;
Vue.prototype.$put = put;
Vue.prototype.$delete = deleteDate;
import createRouter from '../config/router'

Vue.use(ElementUI)
Vue.use(VueRouter)
Vue.use(Vuex)
const router = createRouter()
const store = createStore()
router.beforeEach((to, from, next) => {
    if (to.matched.some(record => record.meta.requireAuth)) { // 判断该路由是否需要登录权限
        if (localStorage.token) { // 判断当前的token是否存在 ； 登录存入的token
            next();
        } else {
            next({
                path: '/login',
                query: {redirect: to.fullPath} // 将跳转的路由path作为参数，登录成功后跳转到该路由
            })
        }
    } else {
        next();
    }
});
new Vue({
    el: '#root',
    router,
    store,
    render: (h) => h(app)
})

