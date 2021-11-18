<template>
    <div class="info" v-loading="loading"
         element-loading-text="拼命加载中"
         element-loading-background="rgba(0, 0, 0, 0.8)">
        <div class="show">
            <div class="div-inline" id='main' style='display:block'>
                <h2 class="div-h2">emulator</h2>
                <video id="video" playsinline></video>
                <canvas id="output"/>
                <h2 style="margin-top: 10px;font-size: 30px">最终得分:{{score}}</h2>
            </div>

            <div class="box">
                <h2 class="div-h2">
                    Banana Prince</h2>
                <img class="image" id="target" :src="guiState.pose.picture"/>
            </div>
            <el-select class="box-head" @change="changeImage" v-model="image" size="medium" placeholder="请选择模仿对象">
                <el-option
                        v-for="item in images"
                        :key="item"
                        :label="item.replace('http://localhost:3000/src/controller/public/','')"
                        :value="item">
                    <span style="float: left">{{item.replace("http://localhost:3000/src/controller/public/","")}}</span>
                    <span style="float: right"><img style="width: 30px" class="image-show" :src="item"/></span>
                </el-option>
            </el-select>
            <div class="footer" style="display: none"></div>
        </div>

    </div>
</template>

<script>
    import * as posenet from '@tensorflow-models/posenet';
    import dat from 'dat.gui';
    import Stats from 'stats.js';
    import axios from 'axios'

    import {
        drawBoundingBox,
        drawHint,
        drawKeypoints,
        drawSkeleton,
        isMobile,
        tryResNetButtonName,
        tryResNetButtonText,
        updateTryResNetButtonDatGuiCss,
    } from '../../utils/canvas_utils';
    import * as tf from '@tensorflow/tfjs';

    export default {
        data() {
            return {
                defaultQuantBytes: 2,
                defaultMobileNetMultiplier: 0.5,

                defaultMobileNetStride: 16,
                defaultMobileNetInputResolution: 257,

                defaultResNetMultiplier: 1.0,
                defaultResNetStride: 32,
                defaultResNetInputResolution: 257,
                images: [],
                image: '',
                guiState: {
                    algorithm: 'single-pose',
                    input: {
                        architecture: 'MobileNetV1',
                        outputStride: this.defaultMobileNetStride,
                        inputResolution: this.defaultMobileNetInputResolution,
                        multiplier: this.defaultMobileNetMultiplier,
                        quantBytes: this.defaultQuantBytes,
                    },
                    singlePoseDetection: {
                        minPoseConfidence: 0.1,
                        minPartConfidence: 0.5,
                    },
                    multiPoseDetection: {
                        maxPoseDetections: 5,
                        minPoseConfidence: 0.15,
                        minPartConfidence: 0.1,
                        nmsRadius: 30.0,
                    },
                    output: {
                        showVideo: true,
                        showSkeleton: true,
                        showPoints: true,
                        showBoundingBox: false,
                    },
                    pose: {
                        picture: '',
                    },
                    net: null,
                },
                loading: true,
                main: false,
                videoWidth: 800,
                videoHeight: 600,
                stats: new Stats(),
                score: '',
                targetPose: null,
                cntDown: {
                    isgettingScore: false,
                    scoreDone: false,
                    gettingScoreCnt: 0,
                    frame: 0,
                    number: 5,
                    scoreCnt: 0,
                }
            }
        },
        methods: {
            toggleLoadingUI(showLoadingUI) {
                if (showLoadingUI) {
                    this.loading = true
                    this.main = false;
                } else {
                    this.loading = false
                    this.main = true;
                }
            },
            async setupCamera() {
                if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                    throw new Error(
                        'Browser API navigator.mediaDevices.getUserMedia not available');
                }

                const video = document.getElementById('video');
                video.width = this.videoWidth;
                video.height = this.videoHeight;

                const mobile = isMobile();
                video.srcObject = await navigator.mediaDevices.getUserMedia({
                    'audio': false,
                    'video': {
                        facingMode: 'environment',
                        width: mobile ? 128 : this.videoWidth,
                        height: mobile ? 128 : this.videoHeight,
                    },
                });

                return new Promise((resolve) => {
                    video.onloadedmetadata = () => {
                        resolve(video);
                    };
                });
            },
            async loadImage() {
                const image = new Image();
                const promise = new Promise((resolve, reject) => {
                    image.crossOrigin = '';
                    image.onload = () => {
                        resolve(image);
                    };
                });
                image.src = this.guiState.pose.picture;
                let img = document.getElementById('target');
                img.src = image.src;
                img.hidden = false;
                return promise;
            },
            async getModelPose() {
                const image = await this.loadImage();
                const input = tf.browser.fromPixels(image);
                // this.videoWidth = image.width;
                // this.videoHeight = image.height;
                console.log(input);
                return await this.guiState.net.estimatePoses(input, {
                    flipHorizontal: false,
                    decodingMethod: 'single-person',
                });
            },
            getTargetPose() {
                let target = this.getModelPose();
                let self = this
                target.then(function (result) {
                    self.targetPose = result.pop();
                });
                this.resetCnt();
            },
            resetCnt() {
                this.cntDown.number = 5;
                this.cntDown.frame = 0;
                this.cntDown.isgettingScore = false;
                this.cntDown.scoreCnt = 0;
                this.cntDown.scoreDone = false;
                this.cntDown.gettingScoreCnt = 0;
            },
            countDown() {
                this.cntDown.frame += 1;
                if (this.cntDown.number === -1) {
                    this.cntDown.frame = 0;
                    this.cntDown.number = 5;
                    this.cntDown.isgettingScore = true;
                    return;
                }
                if (this.cntDown.frame % 25 === 0) {
                    this.cntDown.number -= 1;
                }
            },
            giveScore(ctx, score) {
                if (this.cntDown.gettingScoreCnt === 25) {
                    this.cntDown.isgettingScore = false;
                    this.setScore(ctx, this.cntDown.gettingScoreCnt);
                    this.cntDown.gettingScoreCnt = 0;
                    this.cntDown.scoreDone = true;
                    this.cntDown.scoreCnt = Math.ceil((100000 - this.cntDown.scoreCnt) / 1000);
                    return;
                }
                if (this.cntDown.isgettingScore) {
                    this.cntDown.scoreCnt += score;
                    this.cntDown.gettingScoreCnt += 1;
                    console.log(this.cntDown);
                }
            },
            // eslint-disable-next-line no-unused-vars
            setDebugPointText(keypoints) {
                const resultElement = document.getElementById('debug');
                let text = '';
                for (let i = 0; i < 17; i++) {
                    const keypoint = keypoints[i];
                    const {x, y} = keypoint.position;
                    let l = keypoint.part + ':' + Math.floor(y) + ' ' + Math.floor(x) + '\n';
                    text += l;
                }
                resultElement.innerText = text;
            },
            setScore(ctx, score) {
                let innerText = 'score:' + Math.floor(score);
                drawHint(ctx, innerText, '40px bold ',
                    500, 550, this.videoWidth, this.videoHeight);
            },
            // eslint-disable-next-line no-unused-vars
            async loadVideo() {
                const video = await this.setupCamera();
                video.play();
                return video;
            },
            comparePoses(keypoints, keypoints1) {
                let dist = 0
                for (let i = 1; i < keypoints.length; i++) {
                    let keypoint = keypoints[i];
                    let keypoint1
                    if (keypoints1[i - 1]) {
                        keypoint1 = keypoints1[i - 1];
                    }
                    if (i % 2 === 1) {
                        if (keypoints1[i + 1]) {
                            keypoint1 = keypoints1[i + 1];
                        }
                    }
                    let x = keypoint.position.x;
                    let y = keypoint.position.y;
                    let y1 = keypoint1.position.y;
                    let x1 = keypoint1.position.x;
                    dist += Math.sqrt(Math.pow((y1 - y), 2) + Math.pow((x1 - x), 2));
                }
                return dist;
            },

            normallizeTarget(keypoints, targetPoint) {
                let obj = JSON.stringify(keypoints);
                let result = JSON.parse(obj);
                let dx = targetPoint.position.x - keypoints[0].position.x;
                let dy = targetPoint.position.y - keypoints[0].position.y;
                for (let i = 0; i < keypoints.length; i++) {
                    result[i].position.x += dx;
                    result[i].position.y += dy;
                }
                return result;
            },

            /**
             * Sets up dat.gui controller on the top-right of the window
             */
            setupGui(cameras, net) {
                this.guiState.net = net;
                let self = this

                if (cameras.length > 0) {
                    this.guiState.camera = cameras[0].deviceId;
                }


                const gui = new dat.GUI({width: 300});

                let architectureController = null;
                this.guiState[tryResNetButtonName] = function () {
                    architectureController.setValue('ResNet50');
                };
                gui.add(this.guiState, tryResNetButtonName).name(tryResNetButtonText);
                updateTryResNetButtonDatGuiCss();

                // The single-pose algorithm is faster and simpler but requires only one
                // person to be in the frame or results will be innaccurate. Multi-pose works
                // for more than 1 person
                const algorithmController =
                    gui.add(this.guiState, 'algorithm', ['single-pose', 'multi-pose']);

                // The input parameters have the most effect on accuracy and speed of the
                // network
                let input = gui.addFolder('Input');
                // Architecture: there are a few PoseNet models varying in size and
                // accuracy. 1.01 is the largest, but will be the slowest. 0.50 is the
                // fastest, but least accurate.
                architectureController =
                    input.add(this.guiState.input, 'architecture', ['MobileNetV1', 'ResNet50']);
                this.guiState.architecture = this.guiState.input.architecture;
                let inputResolutionController = null;

                function updateGuiInputResolution(
                    inputResolution,
                    inputResolutionArray,
                ) {
                    if (inputResolutionController) {
                        inputResolutionController.remove();
                    }
                    self.guiState.inputResolution = inputResolution;
                    self.guiState.input.inputResolution = inputResolution;
                    inputResolutionController =
                        input.add(self.guiState.input, 'inputResolution', inputResolutionArray);
                    inputResolutionController.onChange(function (inputResolution) {
                        self.guiState.changeToInputResolution = inputResolution;
                    });
                }

                // Output stride:  Internally, this parameter affects the height and width of
                // the layers in the neural network. The lower the value of the output stride
                // the higher the accuracy but slower the speed, the higher the value the
                // faster the speed but lower the accuracy.
                let outputStrideController = null;

                function updateGuiOutputStride(outputStride, outputStrideArray) {
                    if (outputStrideController) {
                        outputStrideController.remove();
                    }
                    self.guiState.outputStride = outputStride;
                    self.guiState.input.outputStride = outputStride;
                    outputStrideController =
                        input.add(self.guiState.input, 'outputStride', outputStrideArray);
                    outputStrideController.onChange(function (outputStride) {
                        self.guiState.changeToOutputStride = outputStride;
                    });
                }

                // Multiplier: this parameter affects the number of feature map channels in
                // the MobileNet. The higher the value, the higher the accuracy but slower the
                // speed, the lower the value the faster the speed but lower the accuracy.
                let multiplierController = null;

                function updateGuiMultiplier(multiplier, multiplierArray) {
                    if (multiplierController) {
                        multiplierController.remove();
                    }
                    self.guiState.multiplier = multiplier;
                    self.guiState.input.multiplier = multiplier;
                    multiplierController =
                        input.add(self.guiState.input, 'multiplier', multiplierArray);
                    multiplierController.onChange(function (multiplier) {
                        self.guiState.changeToMultiplier = multiplier;
                    });
                }

                // QuantBytes: this parameter affects weight quantization in the ResNet50
                // model. The available options are 1 byte, 2 bytes, and 4 bytes. The higher
                // the value, the larger the model size and thus the longer the loading time,
                // the lower the value, the shorter the loading time but lower the accuracy.
                let quantBytesController = null;

                function updateGuiQuantBytes(quantBytes, quantBytesArray) {
                    if (quantBytesController) {
                        quantBytesController.remove();
                    }
                    self.guiState.quantBytes = +quantBytes;
                    self.guiState.input.quantBytes = +quantBytes;
                    quantBytesController =
                        input.add(self.guiState.input, 'quantBytes', quantBytesArray);
                    quantBytesController.onChange(function (quantBytes) {
                        self.guiState.changeToQuantBytes = +quantBytes;
                    });
                }

                function updateGui() {
                    if (self.guiState.input.architecture === 'MobileNetV1') {
                        updateGuiInputResolution(
                            self.defaultMobileNetInputResolution, [257, 353, 449, 513, 801]);
                        updateGuiOutputStride(self.defaultMobileNetStride, [8, 16]);
                        updateGuiMultiplier(self.defaultMobileNetMultiplier, [0.50, 0.75, 1.0]);
                    } else { // self.guiState.input.architecture === "ResNet50"
                        updateGuiInputResolution(
                            self.defaultResNetInputResolution, [257, 353, 449, 513, 801]);
                        updateGuiOutputStride(self.defaultResNetStride, [32, 16]);
                        updateGuiMultiplier(self.defaultResNetMultiplier, [1.0]);
                    }
                    updateGuiQuantBytes(self.defaultQuantBytes, [1, 2, 4]);
                }

                updateGui();
                input.open();
                // Pose confidence: the overall confidence in the estimation of a person's
                // pose (i.e. a person detected in a frame)
                // Min part confidence: the confidence that a particular estimated keypoint
                // position is accurate (i.e. the elbow's position)
                let single = gui.addFolder('Single Pose Detection');
                single.add(this.guiState.singlePoseDetection, 'minPoseConfidence', 0.0, 1.0);
                single.add(this.guiState.singlePoseDetection, 'minPartConfidence', 0.0, 1.0);

                let multi = gui.addFolder('Multi Pose Detection');
                multi.add(this.guiState.multiPoseDetection, 'maxPoseDetections')
                    .min(1)
                    .max(20)
                    .step(1);
                multi.add(this.guiState.multiPoseDetection, 'minPoseConfidence', 0.0, 1.0);
                multi.add(this.guiState.multiPoseDetection, 'minPartConfidence', 0.0, 1.0);
                // nms Radius: controls the minimum distance between poses that are returned
                // defaults to 20, which is probably fine for most use cases
                multi.add(this.guiState.multiPoseDetection, 'nmsRadius').min(0.0).max(40.0);
                multi.open();

                let output = gui.addFolder('Output');
                output.add(this.guiState.output, 'showVideo');
                output.add(this.guiState.output, 'showSkeleton');
                output.add(this.guiState.output, 'showPoints');
                output.add(this.guiState.output, 'showBoundingBox');
                output.open();

                let picture = gui.addFolder('Choose Pose');
                picture.add(this.guiState.pose, 'picture', this.images)
                    .onChange(() => self.getTargetPose());

                architectureController.onChange(function (architecture) {
                    // if architecture is ResNet50, then show ResNet50 options
                    updateGui();
                    self.guiState.changeToArchitecture = architecture;
                    self.getTargetPose();
                });

                ///
                algorithmController.onChange(function (value) {
                    switch (self.guiState.algorithm) {
                        case 'single-pose':
                            multi.close();
                            single.open();
                            break;
                        case 'multi-pose':
                            single.close();
                            multi.open();
                            break;
                    }
                });
            },
            changeImage(e) {
                this.guiState.pose.picture = e
                this.getTargetPose()
            },
            setupFPS() {
                stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
                document.getElementById('main').appendChild(this.stats.dom);
            },
            detectPoseInRealTime(video, net) {
                const canvas = document.getElementById('output');
                const ctx = canvas.getContext('2d');
                const flipPoseHorizontal = true;
                canvas.width = this.videoWidth;
                canvas.height = this.videoHeight;
                let self = this

                async function poseDetectionFrame() {
                    if (self.guiState.changeToArchitecture) {
                        // Important to purge variables and free up GPU memory
                        self.guiState.net.dispose();
                        self.toggleLoadingUI(true);
                        self.guiState.net = await posenet.load({
                            architecture: self.guiState.changeToArchitecture,
                            outputStride: self.guiState.outputStride,
                            inputResolution: self.guiState.inputResolution,
                            multiplier: self.guiState.multiplier,
                        });
                        self.toggleLoadingUI(false);
                        self.guiState.architecture = self.guiState.changeToArchitecture;
                        self.guiState.changeToArchitecture = null;
                    }

                    if (self.guiState.changeToMultiplier) {
                        self.guiState.net.dispose();
                        self.toggleLoadingUI(true);
                        self.guiState.net = await posenet.load({
                            architecture: self.guiState.architecture,
                            outputStride: self.guiState.outputStride,
                            inputResolution: self.guiState.inputResolution,
                            multiplier: +self.guiState.changeToMultiplier,
                            quantBytes: self.guiState.quantBytes,
                        });
                        self.toggleLoadingUI(false);
                        self.guiState.multiplier = +self.guiState.changeToMultiplier;
                        self.guiState.changeToMultiplier = null;
                    }

                    if (self.guiState.changeToOutputStride) {
                        // Important to purge variables and free up GPU memory
                        self.guiState.net.dispose();
                        self.toggleLoadingUI(true);
                        self.guiState.net = await posenet.load({
                            architecture: self.guiState.architecture,
                            outputStride: +self.guiState.changeToOutputStride,
                            inputResolution: self.guiState.inputResolution,
                            multiplier: self.guiState.multiplier,
                            quantBytes: self.guiState.quantBytes,
                        });
                        self.toggleLoadingUI(false);
                        self.guiState.outputStride = +self.guiState.changeToOutputStride;
                        self.guiState.changeToOutputStride = null;
                    }

                    if (self.guiState.changeToInputResolution) {
                        // Important to purge variables and free up GPU memory
                        self.guiState.net.dispose();
                        self.toggleLoadingUI(true);
                        self.guiState.net = await posenet.load({
                            architecture: self.guiState.architecture,
                            outputStride: self.guiState.outputStride,
                            inputResolution: +self.guiState.changeToInputResolution,
                            multiplier: self.guiState.multiplier,
                            quantBytes: self.guiState.quantBytes,
                        });
                        self.toggleLoadingUI(false);
                        self.guiState.inputResolution = +self.guiState.changeToInputResolution;
                        self.guiState.changeToInputResolution = null;
                    }

                    if (self.guiState.changeToQuantBytes) {
                        // Important to purge variables and free up GPU memory
                        self.guiState.net.dispose();
                        self.toggleLoadingUI(true);
                        self.guiState.net = await posenet.load({
                            architecture: self.guiState.architecture,
                            outputStride: self.guiState.outputStride,
                            inputResolution: self.guiState.inputResolution,
                            multiplier: self.guiState.multiplier,
                            quantBytes: self.guiState.changeToQuantBytes,
                        });
                        self.toggleLoadingUI(false);
                        self.guiState.quantBytes = self.guiState.changeToQuantBytes;
                        self.guiState.changeToQuantBytes = null;
                    }

                    // Begin monitoring code for frames per second
                    // stats.begin();

                    let poses = [];
                    let minPoseConfidence;
                    let minPartConfidence;
                    switch (self.guiState.algorithm) {
                        case 'single-pose':
                            const pose = await self.guiState.net.estimatePoses(video, {
                                flipHorizontal: flipPoseHorizontal,
                                decodingMethod: 'single-person',
                            });
                            poses = poses.concat(pose);
                            minPoseConfidence = +self.guiState.singlePoseDetection.minPoseConfidence;
                            minPartConfidence = +self.guiState.singlePoseDetection.minPartConfidence;
                            break;
                        case 'multi-pose':
                            // eslint-disable-next-line camelcase
                            let all_poses = await self.guiState.net.estimatePoses(video, {
                                flipHorizontal: flipPoseHorizontal,
                                decodingMethod: 'multi-person',
                                maxDetections: self.guiState.multiPoseDetection.maxPoseDetections,
                                scoreThreshold: self.guiState.multiPoseDetection.minPartConfidence,
                                nmsRadius: self.guiState.multiPoseDetection.nmsRadius,
                            });

                            poses = poses.concat(all_poses);
                            minPoseConfidence = +self.guiState.multiPoseDetection.minPoseConfidence;
                            minPartConfidence = +self.guiState.multiPoseDetection.minPartConfidence;
                            break;
                    }

                    ctx.clearRect(0, 0, self.videoWidth, self.videoHeight);

                    if (self.guiState.output.showVideo) {
                        ctx.save();
                        ctx.scale(-1, 1);
                        ctx.translate(-self.videoWidth, 0);
                        ctx.drawImage(video, 0, 0, self.videoWidth, self.videoHeight);
                        ctx.restore();
                    }

                    // For each pose (i.e. person) detected in an image, loop through the poses
                    // and draw the resulting skeleton and keypoints if over certain confidence
                    // scores
                    poses.forEach(({score, keypoints}) => {
                        if (score >= minPoseConfidence) {
                            let normallizedTarget =
                                self.normallizeTarget(self.targetPose.keypoints, keypoints[0]);
                            if (self.guiState.output.showPoints) {
                                console.log(normallizedTarget, 'fuck')
                                let scoreT = self.comparePoses(normallizedTarget, keypoints);
                                drawKeypoints(keypoints, minPartConfidence, ctx, 1, '#ff0000');
                                drawKeypoints(normallizedTarget, minPartConfidence, ctx, 1);
                                drawSkeleton(keypoints, minPartConfidence, ctx, 1, '#ff0000');
                                drawSkeleton(normallizedTarget, minPartConfidence, ctx, 1);
                                if (!self.cntDown.scoreDone) {
                                    self.countDown();
                                    self.giveScore(ctx, scoreT);
                                    if (!self.cntDown.isgettingScore) {
                                        drawHint(ctx, self.cntDown.number.toString(), '50px bold',
                                            400, 300, self.videoWidth, self.videoHeight);
                                    }
                                } else {
                                    drawHint(ctx, '最终得分：' + self.cntDown.scoreCnt.toString(), '50px bold',
                                        0, 300, self.videoWidth, self.videoHeight);
                                    self.score = self.cntDown.scoreCnt.toString()
                                }
                                self.setScore(ctx, scoreT);
                            }
                            if (self.guiState.output.showBoundingBox) {
                                drawBoundingBox(keypoints, ctx);
                            }
                        }
                    });

                    // End monitoring code for frames per second
                    self.stats.end();
                    requestAnimationFrame(poseDetectionFrame);
                }

                poseDetectionFrame();
            },
            async bindPage() {
                this.toggleLoadingUI(true);
                const net = await posenet.load({
                    architecture: this.guiState.input.architecture,
                    outputStride: this.guiState.input.outputStride,
                    inputResolution: this.guiState.input.inputResolution,
                    multiplier: this.guiState.input.multiplier,
                    quantBytes: this.guiState.input.quantBytes,
                });
                this.guiState.net = net;
                this.toggleLoadingUI(false);
                this.getTargetPose();
                let video;
                try {
                    video = await this.loadVideo();
                } catch (e) {
                    let info = document.getElementById('info');
                    dance.textContent = 'this browser does not support video capture,' +
                        'or this device does not have a camera';
                    dance.style.display = 'block';
                    throw e;
                }

                // this.setupGui([], net);
                // setupFPS();
                this.detectPoseInRealTime(video, net);
            }


        },
        mounted() {
// eslint-disable-next-line no-unused-vars
            /**
             * Kicks off the demo by loading the posenet model, finding and loading
             * available camera devices, and setting off the detectPoseInRealTime function.
             */
            let self = this
            axios.get(`/getall`).then(function (e) {
                self.images = [...e.data]
                self.guiState.pose.picture = self.images[0]
            })
            navigator.getUserMedia = navigator.getUserMedia ||
                navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

            self.bindPage();
        }
    }
</script>

<style TYPE="text/less" lang="less" scoped>
    .info {

        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0);
        padding-top: 70px;
        overflow: scroll;

        .info-role-img {
            margin-top: 50px;
            height: 48%;

            img {
                margin: 0 auto;
                display: block;
                height: 90%;
                border-radius: 50%;
            }

            h2 {
                text-align: center;
                font-size: 35px;
            }
        }

        .image-show {
            display: block;
            width: 20px !important;
        }

        .info-text {
            cursor: default;
            text-align: center;
            font-weight: 200;
            width: 100%;
            height: 100px;
            margin-top: 7%;
            float: left;
            color: black;
            animation: turn 2s;
            background-color: rgba(0, 0, 0, 0.1);

            .info-title {
                width: 6%;
                text-align: right;
                height: 100px;
                float: left;
                line-height: 100px;
                font-size: 30px;
            }

            .info-i {
                width: 15%;
                padding-left: 10px;
                height: 100px;
                float: left;
                line-height: 100px;
                text-align: left;
                font-size: 30px;
            }

            .info-github {
                height: 90%;
                margin-top: 5px;
                float: left;
                margin-left: 40%;
            }
        }

        .show {
            height: 100%;
            width: 100%;
            text-align: center;
        }

        .div-inline {
            margin-left: 100px;
            float: left;
            height: 100%;
            width: 800px;

        }

        .div-h2 {
            margin-bottom: 10px;
            font-size: 35px;
            text-shadow: rgba(0, 0, 0, 0.2) 1px 1px 1px;
            font-family: 'Avenir', Helvetica, Arial, sans-serif;
        }

        .box-head {
            /*margin-right: 40px;*/
            position: absolute;
            top: 80px;
            right: 40px;
        }

        .box {
            float: left;
            margin-left: 50px;

            h2 {
                display: block;
                height: 10%;
                text-align: center;
            }

            .image {
                float: bottom;
                display: block;
                /*height: 90%;*/
                height: 601px;
                border: 1px solid rgba(0, 0, 0, 0.8);
                border-radius: 4px;
                box-shadow: rgba(0, 0, 0, 0.4) 1px 1px 3px 3px;
            }
        }


        #output {
            border: 1px solid rgba(0, 0, 0, 0.8);
            border-radius: 4px;
            box-shadow: rgba(0, 0, 0, 0.4) 1px 1px 3px 3px;
            transform: translateZ(0);
        }

        #video {
            -moz-transform: scaleX(-1);
            -o-transform: scaleX(-1);
            -webkit-transform: scaleX(-1);
            transform: scaleX(-1);
            display: none;
        }
    }

    @keyframes turn {
        from {
            transform: translateX(-100%)
        }
        to {
            transform: translateX(0)
        }
    }
</style>