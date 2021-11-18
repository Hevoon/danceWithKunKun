<template>
    <el-container class="whole" v-loading.fullscreen.lock="Loading">
        <el-header class="header">
            <headlogo class="search"></headlogo>
        </el-header>
        <el-container>
            <el-main class="main">
                <tool></tool>
                <transition name="fade">
                    <router-view></router-view>
                </transition>
                <!--                    <graphss class='charts'></graphss>-->
                <!--                <Relation class="charts"></Relation>-->
            </el-main>
        </el-container>
    </el-container>
</template>

<script>
    import headlogo from './views/head/head.vue'
    import tool from './views/aside/aside.vue'

    export default {
        components: {
            headlogo,
            tool
        },
        data() {
            return {
                Loading: false
            }
        },
        watch: {
            '$route': function (to, from) {
                this.Loading = true;
                let self = this;
                setTimeout(() => {
                    self.Loading = false
                }, 500)
            }
        }
    }
</script>

<!--不可以使用type属性-->
<style lang="less" scoped TYPE="text/less">
    .whole {
        width: 100%;
        height: 100%;
    }

    .main {
        padding: 0;
        background: white;
    }

    .header {
        position: relative;
        padding: 0;
    }

    .charts {
        margin: 30px 0 0 30px;
        width: 40%;
        height: 550px;
        padding: 0 0 20px 0;
    }

    .tabShow {
        width: 100%;
        height: 5%;
    }

    .search {
        width: 100%;
        height: 100%;
    }
</style>

