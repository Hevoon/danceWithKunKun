<template>
    <div class="head">
        <el-button class="head_aside_tools"
                   icon="el-icon-s-unfold" size="medium"
                   @click="toggleAside"
                   circle></el-button>
        <h1 class="head_text">尬舞王者</h1>
    </div>
</template>

<script>

    export default {
        methods: {
            toggleAside() {
                this.$store.commit('toggleAside')
            }
        }
    }
</script>

<style  lang="less" TYPE="text/less" scoped >
    .head {
        position: relative;
        background-color: #313131;
        height: 60px;
        clear: both;
    }

    .head_text {
        margin: 0;
        height: 60px;
        text-align: left;
        width: 30%;
        line-height: 60px;
        color: white;
        padding-left: 50px;
        float: left;
    }

    .head_aside_tools {
        margin: 9px 0 0 10px;
        float: left;
        font-size: 18px;
        background: rgba(255, 255, 255, 1);
    }
</style>