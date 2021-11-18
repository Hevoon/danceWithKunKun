<template>
    <div class="news-info">
        <h1 class="news-h1">尬舞王者
            <div class="news-h2">快来和我一起打篮球吧！你还在等什么！</div>
        </h1>
    </div>
</template>

<script>

</script>

<style lang="less" TYPE="text/less" scoped>
    .news-info {
        width: 100%;
        height: 100%;
        background: url("../../../statics/images/back2.gif") no-repeat center;
        background-size: 100%;
    }

    .news-h1 {
        width: 30%;
        height: 80px;
        font-size: 60px;
        font-weight: bold;
        color: rgba(0, 0, 0, 0.7);
        margin-top: -24px;
        position: absolute;
        top: 20%;
        right: 5%;
        text-align: center;
        animation: turn 2s;
    }

    .news-h2 {
        font-size: 25px;
        font-weight: bold;
        margin-top: 20px;
    }

    @keyframes turn {
        from {
            transform: translateY(-100px)
        }
        to {
            transform: translateY(0)
        }
    }

</style>