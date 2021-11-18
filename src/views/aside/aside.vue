<template>
    <div>
        <el-drawer
                custom-class="aside"
                title="工具菜单"
                :visible.sync="aside"
                direction="ltr"
                :before-close="handleClose"
                :modal="modal"
                size="18%">
            <ul class="aside_ul">
                <router-link v-for='(li,index) in ul' :key="index" :to="li.path" style=" text-decoration: none;">
                    <li class="aside_li" @click="handleClose()" :key="index">{{li.title}}</li>
                </router-link>
            </ul>
        </el-drawer>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                ul: [
                    {
                        path: {name: 'show'},
                        title: '主页'
                    }, {
                        path: {name: 'create'},
                        title: '发布挑战'
                    }, {
                        path: {name: 'dance'},
                        title: '模仿挑战'
                    }
                ],
                modal: false
            }
        },
        computed: {
            aside() {
                return this.$store.state.asideControl
            }
        },
        methods: {
            handleClose() {
                this.$store.commit('toggleAside')
            }
        }
    }
</script>

<style lang="less" TYPE="text/less">
    .aside {
        background-color: #444;
        color: #a8a8aa
    }

    .headBlack {
        transition: color 0.5s;
        color: black;

        &:hover {
            color: white;
        }
    }

    .aside_ul {
        width: 80%;
        height: 80%;
        margin: 150px auto 20px auto;
        font-size: 25px;
        text-align: center;

        .aside_li {
            width: 100%;
            line-height: 60px;
            height: 60px;
            color: rgba(255, 255, 255, 0.8);
            margin: 20px 0 20px 0;
            border-bottom: 1px solid;
            display: block;
            list-style: none;
            text-decoration: none;
            cursor: pointer;

            &:hover {
                color: rgba(255, 255, 255, 1);
                margin-left: 5px;
                /*text-shadow: rgba(255, 255, 255, 0.8) 1px 1px 1px;*/
            }
        }
    }
</style>