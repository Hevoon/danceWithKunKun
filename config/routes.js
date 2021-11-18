export default [
    {
        path: '/',
        redirect: '/home'
    },
    {
        path: '/login',// 登录
        name: 'Login',
        component: () => import('../src/login.vue')
    },
    {
        path: '/home',
        meta: {
            requireAuth: true, // 判断是否需要登录
        },
        component: () => import('../src/app.vue'),
        children: [
            {
                path: '/',
                component: () => import('../src/views/home/home.vue'),
                name: 'show'
            },
            {
                path: 'dance',
                component: () => import('../src/views/dance/dance.vue'),
                name: 'dance'
            },
            {
                path: 'create',
                component: () => import('../src/views/danceCreate/danceCreate.vue'),
                name: 'create'
            }
        ]
    }
]