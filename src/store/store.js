import Vuex from 'vuex'
import axios from 'axios'

export default () => {
    const store = new Vuex.Store({
        state: {
            //控制head字体颜色
            turn: true,
            //最新资讯列表
            news: [],
            //最新资讯每页列表
            pageNews: [],
            //所有资讯列表
            allNews: [],
            //所有资讯每页列表
            allPageNews: [],
            allRegion: [],
            asideControl: false
        },
        mutations: {
            toggleAside(state, value) {
                state.asideControl = !state.asideControl
            },
            changeTurnWhite(state) {
                state.turn = true;
            },
            changeTurnBlack(state) {
                state.turn = false;
            },
            //获取最新资讯
            getNowNews(state) {
                axios.get('/getinfo').then(
                    (res) => {
                        console.log(res);
                        state.news = res.data;
                        state.pageNews = state.news.slice(0, 8)
                    }
                ).catch((e) => {
                    console.log(e)
                });
            },
            //改变最新资讯当前页面内容
            changePageNews(state, currentPage) {
                let start = (currentPage - 1) * 8;
                let end = (currentPage) * 8;
                state.pageNews = state.news.slice(start, end)
            },
            getAllNews(state, row) {
                axios.get('/getall', {
                    params: {
                        row: row
                    }
                }).then(
                    (res) => {
                        console.log(res);
                        state.allNews = res.data;
                        state.allPageNews = state.allNews.slice(0, 8)
                    }
                ).catch((e) => {
                    console.log(e)
                });
            },
            //改变最新资讯当前页面内容
            changePageAllNews(state, currentPage) {
                let start = (currentPage - 1) * 8;
                let end = (currentPage) * 8;
                setTimeout(function () {
                    state.allPageNews = state.allNews.slice(start, end)
                }, 0)
            },
            getAllRegion(state) {
                axios.get('/region').then(
                    (res) => {
                        console.log(res);
                        state.allRegion = res.data;
                        console.log(state.allRegion)
                    }
                ).catch((e) => {
                    console.log(e)
                });
            }
        }
    })
    return store
}
