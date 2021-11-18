<template>
    <div class="create">
        <el-form ref="form" :model="form" label-width="100px" class="create-form" :rules="rules">
            <el-form-item label="图片标题:">
                <el-input v-model="form.title"></el-input>
            </el-form-item>
            <div class="fileCom">
                <div class="file-div">
                    <button class="file-button">上传文件</button>
                    <input
                            type="file"
                            @change="getupload($event)"
                            ref="clearFile"
                            multiple="multiple"
                            class="fileInput"
                    >
                </div>
                <ul class="file-list">
                    <li v-for="(file,index) in list" class="file-list-li">
                        {{file.name}}
                        <img src="../../../statics/images/close.png"
                             @click="remove(index)"
                             style="display: block;height: 25px;float: right; cursor: pointer;">
                    </li>
                </ul>
            </div>
            <el-form-item class="item">
                <el-button type="primary" class="form-button" @click="onSubmit($event)">发布图片
                </el-button>
                <el-button class="form-button" @click="onClear">清除</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script>


    export default {
        data() {
            return {
                form: {
                    title: '',
                    upload: []
                },
                rules: {
                    title: [
                        {required: true, message: '请输入文章标题', trigger: 'blur'},
                    ],
                    region: [
                        {required: true, message: '请选择文章栏目', trigger: 'blur'}
                    ],
                    time: [
                        {type: 'date', required: true, message: '请选择日期', trigger: 'blur'}
                    ],
                    desc: [
                        {required: true, message: '请填写文章正文', trigger: 'blur'}
                    ]
                },

            }
        },
        computed: {
            allRegion() {
                return this.$store.state.allRegion
            },
            list() {
                return this.form.upload;
            },
            src() {
                return `http://localhost:3000/${this.image[0]}`
            }
        },
        methods: {
            getupload(event) {
                let files = event.target.files
                for (let i = 0; i < files.length; i++) {
                    this.form.upload.push(files[i])
                }
                console.log(this.form.upload)
            },
            remove(e) {
                this.form.upload.splice(e, 1)
            },
            onSubmit(e) {
                e.preventDefault();
                this.$refs.form.validate((valid) => {
                    if (valid) {
                        let formData = new FormData();
                        let form = this.form;
                        let self = this;
                        let length = form.upload.length;
                        formData.append('title', form.title);
                        for (let i = 0; i < length; i++) {
                            formData.append('upload', form.upload[i]);
                        }
                        console.log(formData, form.upload)
                        let config = {
                            headers: {
                                'Content-Type': 'multipart/form-data'
                            }
                        };
                        this.$post('/addinfo', formData, config).then(function () {
                            self.onClear();
                            self.$message({
                                message: '已发送',
                                type: 'success',
                                center: true,
                                customClass: 'tip',
                                duration: 1500
                            })
                        }).catch((e) => console.log(e))
                    } else {
                        return false;
                    }
                })
            },
            onClear() {
                this.form = {
                    title: '',
                    region: '',
                    time: '',
                    desc: '',
                    upload: []
                }
            }
        },
        mounted() {
            this.$store.commit('changeTurnBlack')

        }
    }
</script>

<style lang="less" TYPE="text/less" scoped>
    .create {
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.07);
        padding-top: 70px;


        .el-input {
            width: 25%;
        }

        .item {
            position: absolute;
            bottom: 10%;
            width: 100%;
            padding-left: 30%;
        }

        .form-button {
            display: inline-block;
        }

        .tip {
            z-index: 0;
            position: absolute;
            top: 10%;
        }

        textarea {
            height: 200px;
            width: 90%;
        }
    }

    .create-form {
        width: 80%;
        height: 80%;
        margin: 20px auto 0 auto;
        border-radius: 10px;
        background-color: rgba(255, 255, 255, 0.8);
        box-shadow: 1px 1px 1px 1px #dddddd;
        padding: 50px 30px 20px 30px;
        position: relative;
    }

    .fileInput {
        width: 70px;
        height: 100%;
        position: absolute;
        left: 0;
        top: 0;
        opacity: 0;
        z-index: 99;
        cursor: pointer;
    }

    .file-button {
        width: 70px;
        height: 30px;
        position: absolute;
        left: 0;
        top: 0;
        display: block;
        box-shadow: none;
        border-radius: 5px;
        cursor: pointer;
        color: #fff;
        background-color: #409eff;
        border: 1px solid #409eff;
    }

    .file-div {
        vertical-align: top;
        width: 70px;
        height: 30px;
        position: relative;
        cursor: pointer;
        display: inline-block;
    }

    .file-list {
        display: inline-block;
        list-style: none;
        margin-left: 10px;
        position: relative;
        width: 30%;
        vertical-align: top;
        font-size: 14px;
    }

    .file-list-li {
        line-height: 25px;
        height: 25px;
        font-size: 14px;
        display: block;
        padding-bottom: 3px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    }

    .file-list-li:hover {
        background-color: rgba(0, 0, 0, 0.1);
    }

    .fileCom {
        position: relative;
        padding-left: 20px;
    }

</style>