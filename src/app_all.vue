<template>
    <div class="app-all">
        <router-view></router-view>
    </div>
</template>

<script>
    export default {

    }
</script>

<!--不可以使用type属性-->
<style lang="less" TYPE="text/less" scoped>
    .app-all {
        height: 100%;
        width: 100%;
    }
</style>

