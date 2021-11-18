<template>
    <div class="login">
        <h1 class="login-h1">尬舞王者 - 乔碧萝老师应援队</h1>
        <div class="login-menu">
            <el-input
                    class="login-input"
                    placeholder="请输入内容"
                    v-model="username"
                    size="large"
                    clearable>
            </el-input>
            <el-input
                    size="large"
                    class="login-input"
                    placeholder="请输入密码" v-model="password" show-password></el-input>
            <el-button round class="login-button" style="margin: 0 auto 30px auto" @click="loginIn">登陆</el-button>
            <el-button round class="login-button" style="margin: 0 auto" @click="signIn">注册</el-button>
        </div>

    </div>
</template>

<script>
    export default {
        data() {
            return {
                username: '',
                password: ''
            }
        },
        methods: {
            loginIn() {
                let self = this;
                this.$post('/login', {
                    username: this.username,
                    password: this.password
                }).then(function (res) {
                    let data = res.data;
                    console.log(res.data.code)
                    if (res.data.code === 1) {
                        localStorage.setItem('token', data.token);
                        if (self.$route.query.redirect) {
                            let redirect = self.$route.query.redirect;
                            self.$router.push(redirect)
                        } else {
                            self.$router.push('/home')
                        }
                    } else {
                        localStorage.removeItem('token');
                        self.$message({
                            message: '登录失败,请重试',
                            type: 'error',
                            center: true,
                            customClass: 'tip',
                            duration: 1500
                        })
                    }
                }).catch((e) => {
                    console.log(e)
                })
            },
            signIn() {
                let self = this;
                this.$post('/sign', {
                    username: this.username,
                    password: this.password
                }).then(function (res) {
                    let data = res.data;
                    console.log(res.data.code)
                    if (res.data.code === 1) {
                        localStorage.setItem('token', data.token);
                        if (self.$route.query.redirect) {
                            let redirect = self.$route.query.redirect;
                            self.$router.push(redirect)
                        } else {
                            self.$router.push('/home')
                        }
                    } else {
                        localStorage.removeItem('token');
                        self.$message({
                            message: '注册失败，请重试',
                            type: 'error',
                            center: true,
                            customClass: 'tip',
                            duration: 1500
                        })
                    }
                }).catch((e) => {
                    console.log(e)
                })
            }
        }
    }
</script>

<!--不可以使用type属性-->
<style lang="less" TYPE="text/less">
    .login {
        width: 100%;
        height: 100%;
        position: relative;
        overflow: hidden;
        background: url("../statics/images/back2.gif") no-repeat center;
        background-size: 100%;

        input {
            height: 60px;
            border-radius: 20px;
            background-color: rgba(0, 0, 0, 0);
            border: none;
        }
    }

    .login-h1{
        margin-left: 20px;
        margin-top: 20px;
        font-size: 30px;
        color: rgba(0,0,0,0.2);
    }

    .login-menu {

        margin-top: 20%;
    }

    .login-title {
        margin-top: 100px;
        color: rgba(0, 0, 0, 0.8);
        text-align: center;
        display: block;
        font-size: 40px;
        margin-bottom: 30px;
    }

    .login-input {

        width: 30%;
        display: block;
        margin: 0 auto 20px auto;
        height: 60px;
        font-size: 25px;
        background-color: rgba(0, 0, 0, 0);
        border: 1px solid rgba(0, 0, 0, 0.1);
        border-radius: 20px;
        &:hover {
            background-color: rgba(0, 0, 0, 0.1);
        }
    }

    .login-button {
        width: 15%;
        height: 50px;
        font-size: 22px;
        font-weight: bold;
        display: block;
        background-color: rgba(255, 255, 255, 0.8);
        box-shadow: 1px 0 0 0 rgba(0, 0, 0, 0.1);
    }

    /*.tip {*/
    /*z-index: 0;*/
    /*position: absolute;*/
    /*top: 10%;*/
    /*}*/
</style>

