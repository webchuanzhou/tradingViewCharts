<template>
  <div  :class="[{'full':FullScreen},{'fullNo':!FullScreen && styleType =='new'},{'fullNoOld':!FullScreen && styleType =='old'}]">
    <div class="daohangOrder">
        <div class="boxDiv">
            <span v-for="(item,index) in timer" :key='index' class="spanButton" :class="{'active':item.name == name && chartType === 'kline'}" @click="mySelefButton(4,item.resolution,item.type,item.chartType,item.name)">{{$t(item.name)}}</span>
            <span @click="mySelefButton(1)" v-if="chartType === 'kline'" class="spanButton"><i class="ic icon iconfont icon-jiankongzhibiao" ></i></span>
        </div> 
        <div class="boxDiv">
             <!-- 指标 设置 全屏-->
            <span @click="setChartType('kline')" class="spanButton" :class="{'active':chartType === 'kline'}">{{$t("i18nView.remarkTu")}}</span>  
            <span @click="setChartType('depth')" class="spanButton" :class="{'active':chartType === 'depth'}" v-if="!FullScreen">{{$t("i18nView.deathTu")}}</span>  
            <span @click="mySelefButton(3)" v-if="chartType === 'kline'" class="spanButton"><i class="ic icon iconfont icon-shezhi" ></i></span>
            <span @click="mySelefButton(2)" v-if="chartType === 'kline'" class="spanButton"><i class="ic icon iconfont icon-quanping" ></i></span>
            <!-- <span class="subitem" @click="setAssistCoin(item.key)"  v-for="(item,index) in assistList" v-if="item.key != coinSuf">{{item.name}}</span> -->
            <el-dropdown @command="setAssistCoin">
                <span class="el-dropdown-link">
                    {{$t("i18nView.PriceDisplay")}}：
                    <i style="color:#357ce1" v-if="klineParams== coinSuf">{{$t("i18nView.default")}}</i>
                    <i style="color:#357ce1" v-else-if="klineParams=='usdt'">USD</i>
                    <i style="color:#357ce1" v-else-if="klineParams=='cny'">KRW</i>
                    <i class="el-icon-arrow-down el-icon--right"></i>
                </span>
                <el-dropdown-menu slot="dropdown">
                <el-dropdown-item :command="item.key" :class="{'active':item.key == klineParams}" v-if="item.key !=coinSuf"  v-for="(item,index) in assistList" >{{item.name}}</el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>
        </div> 
    </div>
    <div v-show="chartType === 'kline' " style="height:100%;position:relative;"  >
        <div id="trade-view" style="height:100%;" v-show="!isLoading"></div>
        <div v-if="isLoading" class=" loading loading-light-bg"></div>
        <img src="../../../../static/images/tradingLogo.png" class="imgLogo" :class="[{'botNew':styleType =='new'},{'botOld':styleType =='old'}]" v-if="!isLoading"/> 
    </div> 
    <div style="height: 100%;" v-if="chartType === 'depth'" >
        <highchart class="depth-chart" :options="depthChartOptions" ref="depth" ></highchart>
    </div>
  </div>
</template>

<script>
  import { widget as TvWidget } from '@/charting_library.min.js'
  import datafeeds from '@/datafeeds/datafees.js'
  import {getOverrides} from '@/datafeeds/overrides.js'
  import * as configs from '@/../config/config';
  import {dealKlines}   from '@/api/trade';
  import highchart from './alicmsHighChart.vue';
  import {mapGetters} from "vuex"
  import Common from '@/plugins/common.js';
  import pako from "pako"
  export default {
    name: 'index',
    components: {highchart},
    props: {
        marketListFir:{
            type:String,
            default:""
        },
        money:{
            type:String,
            default:""
        },
        coin:{
            type:String,
            default:""
        },
        marketConfig: {
            type: Object,
            default: function () {
                return {};
            }
         },
    },
    data() {
      return {
          widget: null, //初始化K线
          datafeeds: new datafeeds(this),
          symbol: null, //K线商品名
        //   interval: null, //K线时间间隔
          cacheData: {}, //K线数据
        //   lastTime: null,
          getBarTimer: null, //garTimer 定时器
          getResolveSymbol: null,//ResolveSymbol 定时器
          getList:null,//数据 定时器
          isLoading: true,
          FullScreen:false, //全屏
          timer:[
            {name:'i18nView.Time',type:60,resolution:'1',chartType:3},
            {name:'i18nView.min1',type:60,resolution:'1',chartType:1},
            {name:'i18nView.min5',type:300,resolution:'5',chartType:1},
            {name:'i18nView.min15',type:900,resolution:'15',chartType:1},
            {name:'i18nView.min30',type:1800,resolution:'30',chartType:1},
            {name:"i18nView.h1",type:3600,resolution:'60',chartType:1},
            {name:"i18nView.h6",type:21600,resolution:'360',chartType:1},
            {name:"i18nView.h12",type:43200,resolution:'720',chartType:1},
            {name:"i18nView.day1",type:86400,resolution:'1D',chartType:1},
            {name:"i18nView.week1",type:604800,resolution:'1W',chartType:1},
          ],
          resolution: Common.getCookie('TradingResolution') ? Common.getCookie('TradingResolution') : '15', //选中K线时间
          detailTimer: Common.getCookie('TradingDetailTimer') ? Common.getCookie('TradingDetailTimer') : 900, // 默认请求时间
          name: Common.getCookie('TradingName') ? Common.getCookie('TradingName') :'i18nView.min15', //默认选中名字
          oldName:Common.getCookie('TradingName') == 'i18nView.Time' ? 'i18nView.Time'  :'',
          MaLine:[{ //默认Ma线
            "max":5,
            "color":"rgba(0, 144, 247, 1)"
          },{
            "max":10,
            "color":"rgba(255, 180, 0, 1)"
          },{
            "max":30,
            "color":"rgba(232, 73, 185, 1)"
          },{
            "max":60,
            "color":"rgba(38, 227, 255, 1)"
          }],
          chartType : 'kline', //K线类型
          langs:{
                'zh': 'zh',
                'kr': 'ko',
                'en': 'en',
                'jp': 'ja',
            },
           klineParams:"",
           assistList : [
                {key:'none', name: this.$t("i18nView.default"), icon: ''},
                {key: 'usdt', name: 'USD', icon: 'icon-meiyuan'},
                {key: 'cny', name: 'KRW', icon: 'icon-cny'}
            ]
        }
    },
    
    
    computed: {
        ...mapGetters(['currentPrice','lastDepth','styleType','depth','coinSuf']),
        //市场信息
        marketTo(){
            console.log(this.marketListFir)
            let marketT = this.marketListFir.split("_").join('/').toUpperCase();
            return  marketT
        },
        // getLang() {
        //     const langs = {
        //         'zh': 'zh',
        //         'kr': 'ko',
        //         'en': 'en',
        //         'jp': 'ja',
        //     }
        //     return (langs[Common.getCookie('language')] || 'zh')
        // },
        depthChartOptions: function () {
            var _this = this;
            // console.log(this.lastDepth)
            // console.log(this.depth)
            var asks = this.lastDepth.asks.slice(0).reverse() || [];
            var bids = this.lastDepth.bids.slice(0) || [];
            // console.log(this.lastDepth.bids.slice(0),222)
            // console.log(this.lastDepth.bids.slice(0).reverse().slice(0,50).reverse())
            if(asks.length>50){
                asks = asks.slice(0,50)
            }
            if(bids.length>50){
                bids = bids.slice(0,50)
            }
            // asks.slice(0,50)
            // var asks = this.depth.asks.slice(0) || [];
            // var bids = this.depth.bids.slice(0) || [];
            var currentPrice = [[Number(this.currentPrice), 0]];
            var sumAsks = 0;
            var sumBids = 0;
            var fasks = asks.map(function (ask, index) {
                if (index > 0) {
                    sumAsks = (Number(ask[1]) + Number(sumAsks)).toFixed(4);
                } else {
                    sumAsks = ask[1]
                }
                return [Number(ask[0]), Number(sumAsks)];
            });

            var fbids = bids.map(function (bid, index) {
                if (index > 0) {
                    sumBids = (Number(bid[1]) + Number(sumBids)).toFixed(4);
                } else {
                    sumBids = bid[1]
                }
                return [Number(bid[0]), Number(sumBids)];
            });
            fbids.reverse();
            var opts = {
                title: null,
                rangeSelector: {selected: 1},
                rangeSelector: {enabled: false},
                exporting: {enabled: false},
                credits: {
                    enabled: false
                },
                chart: {
                    alignTicks: true,
                    plotBorderColor: '#3C3F46',
                    plotBorderWidth: 1,
                    backgroundColor: this.styleType=='new'?'#14142c':'#1a1f41',
                    marginBottom: 50
                },
                legend: {
                    enabled: false,
                    backgroundColor: "transparent",
                    y: 20,
                    shadow: false,
                    itemHoverStyle: {color: '#EBEBEB'},
                    itemStyle: {cursor: 'pointer', color: '#333'}
                },
                xAxis: {
                    title: null,
                    labels: {
                        formatter: function () {
                            return this.value;
                        }
                    },
                    minPadding: 0.001,
                    maxPadding: 0.001,
                    tickWidth: 1,
                    tickLength: 5,
                    tickColor: "#3C3F46",
                    lineColor: "#3C3F46"
                },
                yAxis: [
                    {
                        type: 'datetime',
                        title: null,
                        reversed: true
                    },
                    {
                        title: null,
                        labels: {
                            format: "{value}"
                        },
                        opposite: true,
                        min: 0,
                        gridLineDashStyle: 'solid',
                        gridLineColor: "#3C3F46",
                        gridLineWidth: 1
                    }
                ],
                plotOptions: {
                    areaspline: {
                        marker: {
                            symbol: 'circle',
                            radius: 0,
                            states: {
                                hover: {
                                    enabled: true
                                }
                            }
                        }
                    },
                    scatter: {
                        radius: 5,
                        marker: {
                            radius: 5,
                            symbol: "triangle-down"
                        },
                        states: {
                            hover: {
                                enabled: false
                            },
                            select: {
                                enabled: false
                            }
                        },
                        tooltip: {
                            headerFormat: ' <b>{series.name}</b><br>',
                            pointFormat: ' <b>{point.x}'
                        },
                        cursor: "pointer"
                    }
                },
                series: [
                    {
                        name: _this.$t("i18nView.vouchersOfSale"),   //vouchersOfSale
                        data: fasks,
                        type: 'areaspline',
                        color: "#de211d",
                        yAxis: 1,
                        zIndex: 1
                    },
                    {
                        name: _this.$t("i18nView.LatestPrice"),   //LatestPrice
                        data: currentPrice,
                        type: 'scatter',
                        color: "#6baffb",
                        yAxis: 1,
                        zIndex: 2
                    },
                    {
                        name: _this.$t("i18nView.Check"),
                        data: fbids,
                        type: 'areaspline',
                        color: "#31c871",
                        yAxis: 1,
                        zIndex: 1
                    }
                ]
            };
            // var isLight = top.location.href.indexOf('/tradePro') != -1;
            // if(isLight){
            //     opts.chart.plotBorderColor = "#fff";
            //     opts.chart.backgroundColor = "#fff";
            //     opts.yAxis[1].gridLineColor = "#eee";
            // }

            return opts;
        }, 
    },
    filters:{
       
    },
    watch:{
        styleType(){
            this.isLoading = true
            this.updateWidget();
        },
    },
    methods: {
        setAssistCoin(key){
            if(key == 'none'){
                this.klineParams = this.coinSuf;
            }else{
                this.klineParams = key;
            }
            this.isLoading = true
            this.updateWidget();
        },
        setChartType(type) {
            if(this.chartType == type){
                return false;
            }
            this.chartType = type;
        },
        //K线初始化
        init(symbol = '', interval = '1') {
            var _this = this;
            if (!this.widget) {
                this.widget = new TvWidget({
                symbol: symbol,  //[必填项] 您的图表的初始商品和周期
                interval: this.resolution, //[必填项]  间隔
                container_id: 'trade-view', //[必填项]
                datafeed: this.datafeeds, //[必填项]
                library_path: '/static/tradeview/charting_library/',  //内置代码引用地址
                disabled_features: [ "volume_force_overlay"], //'header_symbol_search',
                // toolbar_bg: this.styleType =='old' ? '#1a1f41' : '#14142c', //工具栏
                toolbar_bg: '#14142c', //工具栏
                enabled_features: [],
                timezone: 'Asia/Seoul', //地区时间
                // debug: true,
                locale: this.langs[Common.getCookie('language')] || 'zh', 
                autoSize:true,
                fullscreen:this.FullScreen,
                // loading_screen: { backgroundColor: "#000000" },
                // debug: false,
                // height:451,
                disabled_features: [
                    "header_widget_dom_node",   //顶部工具条
                    "use_localstorage_for_settings",  //语言设置
                    "header_saveload", //模板保存
                    "header_compare",  //比较功能
                    "header_symbol_search",  //交易对搜索
                    "header_screenshot",   //截图保存
                    "timeframes_toolbar",  // 底部时间跳转
                    "volume_force_overlay",  //在主数据量列的窗格上放置成交量指标
                    "display_market_status",  //显示市场状态 （开市休市，加载中等）
                    "symbol_info",  //商品信息弹窗
                    "header_chart_type",  //图标类型
                    "header_undo_redo",  //左右按钮
                    "header_resolutions",  //k线周期
                    "header_indicators",   //指标
                    "border_around_the_chart",   //顶部工具栏
                    "remove_library_container_border",   //顶部工具栏
                    "header_settings",   //设置按钮
                    "header_fullscreen_button",   //全屏按钮
                    "header_widget",   //头部工具栏
                ],
                customFormatters: { //时间 年月日
                    // timeFormatter: {
                    //   format: function(date) { var _format_str = '%h:%m'; return _format_str.replace('%h', date.getUTCHours(), 2). replace('%m', date.getUTCMinutes(), 2). replace('%s', date.getUTCSeconds(), 2); }
                    // },
                    dateFormatter: {
                        format(date) { 
                            // if(_this.resolution =='1D'){
                            //     let Timer = new Date(+new Date(date) + 60*60*24*1000)
                            //     return Timer.getUTCFullYear() + '-' + (Timer.getUTCMonth()+1) + '-' + Timer.getUTCDate(); 
                            // }else if(_this.resolution =='1W'){
                            //     let Timer = new Date(+new Date(date) + 60*60*24*1000*7)
                            //     return Timer.getUTCFullYear() + '-' + (Timer.getUTCMonth()+1) + '-' + Timer.getUTCDate(); 
                            // }else{
                            //     let Timer = date
                            //     return Timer.getUTCFullYear() + '-' + (Timer.getUTCMonth()+1) + '-' + Timer.getUTCDate(); 
                            // }
                            return date.getUTCFullYear() + '-' + (date.getUTCMonth()+1) + '-' + date.getUTCDate(); 
                         }
                    }
                },  //自定义显示日期和时间的值
                studies_overrides: {   //数组图样式.
                    "volume.volume.color.0": "#DC3950",
                    "volume.volume.color.1": "#14A24D",
                    // "volume.volume.transparency": 70,
                    // "volume.volume ma.color": "#FF0000",
                    // "volume.volume ma.transparency": 30,
                    // "volume.volume ma.linewidth": 5,
                    // "volume.show ma": true,
                    // "bollinger bands.median.color": "#33FF88",
                    // "bollinger bands.upper.linewidth": 7
                },
                // custom_css_url: './css/tradingview_white.css', //样式位置
                overrides: this.styleType =='old' ? getOverrides('old') : getOverrides('new')
                })
                this.symbol = symbol
                this.interval = interval
                this.readyChat();
                this.onMessage();
            }
        },
        //导航栏按钮事件
        mySelefButton(index,resolution,type,chartType,name){  //timer 时间  type请求时间
            if(index==1){
                this.widget.chart().executeActionById("insertIndicator");
            }else if(index==2){
                this.FullScreen = !this.FullScreen;
                // this.updateWidget()
            }else if(index==3){
                this.widget.chart().executeActionById("chartProperties");
            }else if(index==4){
                if(this.name == name && this.chartType == 'kline'){
                    return false;
                }
                const ticker = `${this.symbol}-${this.interval}`
                this.cacheData[ticker] = [] //清空图表数据
                this.detailTimer = type;
                this.name = name
                this.resolution = resolution;
                Common.setCookie('TradingResolution',resolution)
                Common.setCookie('TradingDetailTimer',type)
                Common.setCookie('TradingName',name)
                if(this.chartType == 'depth'){
                    this.chartType = 'kline'
                }
                if(this.name==this.timer[0]['name']){ //是否为分时线
                    this.oldName = name;
                    this.isLoading = true
                    this.updateWidget();
                }else{
                    if(this.oldName == this.timer[0]['name']){//上一个是否为分时线
                        this.oldName = name;
                        this.isLoading = true
                        this.updateWidget();
                    }else{
                        return new Promise((resolve, reject) => {
                            this.onMessage();
                            resolve()
                        }).then(()=>{
                            this.widget.chart().setResolution(resolution,()=>{}) //刷新图表时间
                            this.widget.chart().resetData();
                            this.widget.chart().setChartType(chartType) //刷新图表类型
                        }).catch(()=>{
                            console.log('数据加载出错')
                        })
                    }
                }
            }
        },
        readyChat(){  //自带导航栏增加按钮
            var _this = this;
            this.widget.onChartReady(function() {
                // _this.widget.createButton()
                //                 .on('click', function (e) {
                //                     _this.widget.setSymbol("F", '2D');
                //                 })
                //         .append('<span>1min</span>');

                // _this.widget.createButton({align: "left"})
                            // 	.attr('title', "Add item")
                            // 	.on('click', function (e) {
                            // 		_this.widget.chart().createStudy("Moving Average", false, false, [
                            // 				10 + parseInt(Math.random() * 10)
                            // 			], function (guid) {
                            // 				console.log(guid);
                            // 			},
                            // 			{"plot.color.0" : "#FF0000"}
                            // 		);
                            // 	 })
                // 	.append('<span>+MA++</span>');
                if(_this.name!=_this.timer[0]['name']){
                    _this.MaLine.forEach((el)=>{
                        _this.widget.chart().createStudy("Moving Average", false, false, [
                            el.max
                        ], function (guid) {
                            // console.log(guid);
                        },
                        {"plot.color.0" :  el.color}
                        );
                    })
                }
            })
        },
        //unsubscribeBars取消订阅
        unSubscribe(interval) {  
            if (interval < 60) {
                //this.sendMessage({ cmd: 'unsub', args: [`candle.M${interval}.${this.symbol.toLowerCase()}`, 1440, parseInt(Date.now() / 1000)] })
            } else if (interval >= 60) {
                //this.sendMessage({ cmd: 'unsub', args: [`candle.H${interval / 60}.${this.symbol.toLowerCase()}`, 1440, parseInt(Date.now() / 1000)] })
            } else {
                //this.sendMessage({ cmd: 'unsub', args: [`candle.D1.${this.symbol.toLowerCase()}`, 207, parseInt(Date.now() / 1000)] })
            }
        },
        //subscribeBars订阅实时数据
        subscribe() { 
            if (this.interval < 60) {
                //this.sendMessage({ cmd: 'sub', args: [`candle.M${this.interval}.${this.symbol.toLowerCase()}`] })
            } else if (this.interval >= 60) {
                //this.sendMessage({ cmd: 'sub', args: [`candle.H${this.interval / 60}.${this.symbol.toLowerCase()}`] })
            } else {
                //this.sendMessage({ cmd: 'sub', args: [`candle.D1.${this.symbol.toLowerCase()}`] })
            }
        },
        decode(encodedData){
            var decodedData = window.atob(encodedData);
            var charData    = decodedData.split('').map(function(x){return x.charCodeAt(0);});
            var binData     = new Uint8Array(charData);
            var data        = pako.inflate(binData);
            var myArr = new Uint16Array(data)
            var num = 1000,strings = ''
            var uintArray = new Uint16Array(data); var converted = []; uintArray.forEach(function(byte) {converted.push(String.fromCharCode(byte))});
            return converted.join('')
        },
        onMessage() {
            // console.log(data)
            // if(data.msg=='marketData'){
            // if (data.data && data.data.length) {
            const list = []
            const ticker = `${this.symbol}-${this.resolution}`
            var _this = this;
            dealKlines(this.marketListFir,this.detailTimer,this.klineParams).then(data=>{
                if(data.code==200){
                    if(data.data){
                        let res = JSON.parse(_this.decode(data.data))
                        res.forEach(function (element) {
                            list.push({
                                time: element[0] -0,
                                open: element[2]  -0,
                                high: element[1]  -0,
                                low: element[3]  -0,
                                close: element[4]  -0,
                                volume: element[5] -0,
                            })
                        }, _this)
                        _this.cacheData[ticker] = list
                        // _this.lastTime = list[list.length - 1].time
                        // this.subscribe()
                        _this.datafeeds.barsUpdater.updateData()
                    }
                }
            })
            // if (data.type && data.type.indexOf(this.symbol.toLowerCase()) !== -1) {
            //   // console.log(' >> sub:', data.type)
            //   console.log(32221)
            //   this.datafeeds.barsUpdater.updateData()
            //   const ticker = `${this.symbol}-${this.interval}`
            //   const barsData = {
            //     time: 1566959192168,
            //       open: element.maxPrice,
            //       high: element.minPrice,
            //       low: element.maxPrice,
            //       close: element.minPrice,
            //       volume: element.volume
            //   }
            //   if (barsData.time >= this.lastTime && this.cacheData[ticker] && this.cacheData[ticker].length) {
            //     this.cacheData[ticker][this.cacheData[ticker].length - 1] = barsData
            //   }
            // }
        // }
        },
        //getBars主要负责历史数据的加载
        getBars(symbolInfo, resolution, rangeStartDate, rangeEndDate, onLoadedCallback) {  
            // console.log(' >> :', rangeStartDate, rangeEndDate)
            // if (this.interval !== resolution) {
            //   this.unSubscribe(this.interval)
            //   this.interval = resolution
            //   if (resolution < 60) {
            //     console.log(2)
            //     this.sendMessage({ cmd: 'req', args: [`candle.M${this.interval}.${this.symbol.toLowerCase()}`, 1440, parseInt(Date.now() / 1000)] })
            //   } else if (resolution >= 60) {
            //     console.log(3)

            //     this.sendMessage({ cmd: 'req', args: [`candle.H${this.interval / 60}.${this.symbol.toLowerCase()}`, 1440, parseInt(Date.now() / 1000)] })
            //   } else {
            //     console.log(4)

            //     this.sendMessage({ cmd: 'req', args: [`candle.D1.${this.symbol.toLowerCase()}`, 800, parseInt(Date.now() / 1000)] })
            //   }
            // }
            const ticker = `${this.symbol}-${this.resolution}`
            if (this.cacheData[ticker] && this.cacheData[ticker].length) {
                this.isLoading = false
                const newBars = []
                this.cacheData[ticker].forEach(item => {
                    if (item.time >= rangeStartDate * 1000 && item.time <= rangeEndDate * 1000) {
                        if(this.resolution =='1D' ||this.resolution =='1W'){
                            let Tim = item.time + 1000*60*60*24
                            item.time = Tim
                            newBars.push(item)
                        }else{
                            newBars.push(item)
                        }
                    }
                })
                if(this.name==this.timer[0]['name']){
                    this.widget.chart().setChartType(3)
                }
                onLoadedCallback(newBars)
            } else {
                const self = this
                this.getBarTimer = setTimeout(function () {
                     self.isLoading = false
                    self.getBars(symbolInfo, resolution, rangeStartDate, rangeEndDate, onLoadedCallback)
                }, 10)
                //如果没数据缓存用法
                // onLoadedCallback([], {noData: true})
            }
        },
        //resolveSymbol是需要调用onSymbolResolvedCallback方法来设置商品信息
        resolveSymbol(symbolName, onSymbolResolvedCallback, onResolveErrorCallback) {  
            return new Promise((resolve, reject) => {
                if(this.$parent.currentMarketConfig.moneyDecimal  || this.$parent.currentMarketConfig.moneyDecimal == '0' ){
                    setTimeout(()=>{
                        let symbolInfo = this.defaultSymbol(this.marketTo)
                        resolve(symbolInfo)
                    },500)
                }else{
                    const self = this
                    this.getResolveSymbol = setTimeout(function () {
                        self.resolveSymbol(symbolName, onSymbolResolvedCallback, onResolveErrorCallback)  
                    }, 10)
                }
            }).then(data => onSymbolResolvedCallback(data)).catch(err => onResolveErrorCallback(err))
        },
        //默认数据初始化
        defaultSymbol(market = 'BTCCNS') {
            return {
                'name': this.marketTo,
                'timezone': 'Asia/Seoul', //商品的交易所时区
                'minmov': 1,  //右侧K线价格指标 
                // 'minmov2': 0,
                // 'pointvalue': 1,
                'fractional': false,  //控制小数点位置
                'session': '24x7',
                'has_intraday': true,  //必须
                'has_no_volume': false,  //柱状图显示
                'description': market,  //标题描述
                'pricescale': Math.pow(10,this.$parent.currentMarketConfig.moneyDecimal),   //开高低收小数位数
                // 'data_status': 'endofday',
                "exchange-listed":"ADC",
                'supported_resolutions': ['1', '5', '15', '30', '60', '360' ,'720' , '1D', '1W'],
            }
        },
        // 更新图表
        updateWidget() {
            this.removeWidget();
            this.isLoading = true
            this.init(this.marketTo);
        },
        //销毁图表
        removeWidget() {
            if (this.widget) {
                this.widget = null;
            }
        },
        //esc 退出全屏键
        clearFull(){
            var _this = this 
            if(navigator.userAgent.indexOf("MSIE")>0)  {
                //IE
                document.onkeydown=function(){
                    if(27 === event.keyCode && _this.FullScreen){
                        _this.FullScreen=false
                    }
                }
            }else{
                //非IE
                window.onkeydown=function(){
                    if(27 === event.keyCode && _this.FullScreen){
                        _this.FullScreen=false
                    }
                }
            }
        }
    },
    created() {
        this.klineParams = this.coinSuf
    },
    mounted(){
        this.init(this.marketTo);
        // 需要清空
        // setTimeout(()=>{
        //     this.onMessage()
         this.getList = setInterval(()=>{
                this.onMessage()
            },5000)
        // },0)
        this.clearFull()

    },
    destroyed() {
        this.removeWidget();
    }
  }
</script>

<style lang="scss" >
    .daohangOrder{
        display: flex;
        height: 24px;
        line-height: 24px;
        background:#14142c;
        justify-content: space-between;
        color:#8B89C8;
        .boxDiv{
            display: inline-block;
        }
        .spanButton{
            padding:0 8px;
            cursor: pointer;
        }
        .spanButton.active{
            color:#0090F7;
        }
        .spanButton:hover{
            color:#0090F7;
        }
    }
    .full{
        position: fixed;
        width: 100%;
        height: calc(100% - 24px);
        top: 0;
        left: 0;
        z-index: 10000;
    }
    .fullNo{
        height: 540px;
        width: 100%;
    }
    .fullNoOld{
        height: 405px;
        width: 100%;
    }
    
    .loading-light-bg:after{
    background:transparent !important;
  }
    @keyframes loading {
        from {
            -webkit-transform: rotate(0);
                    transform: rotate(0);
        }
        to {
            -webkit-transform: rotate(360deg);
                    transform: rotate(360deg);
        }
    }
    @-webkit-keyframes loading {
        from {
            -webkit-transform: rotate(0);
                    transform: rotate(0);
        }
        to {
            -webkit-transform: rotate(360deg);
                    transform: rotate(360deg);
        }
    }
    .loading {
        min-height: 405px !important;
        position: relative
    }
    
    .loading:after, .loading:before {
        content: "";
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        top: 0
    }
    .loading:before {
        width: 50px;
        height: 50px;
        border: 3px solid #f0f1f5;
        border-top-color: #0090f7;
        border-radius: 50%;
        margin: auto;
        z-index: 11;
        -webkit-animation: loading .5s infinite linear;
        animation: loading .5s infinite linear;
    }
    .loading:after {
        z-index: 10
    }
    .loading-light-bg:after {
        background: #fff;
    }
    .loading-dark-bg:before, .loading-dark:before {
        border: 3px solid #434456;
        border-top-color: #ff8400
    }
    .loading-dark-bg:after {
        background: rgba(28, 28, 37, .9)
    }
    .el-dropdown{
        color:#8B89C8 !important;
    }
    .el-dropdown-menu{
        background:#222b55 !important;
        border:0px !important;
        padding:0px !important;
    }
    .el-dropdown-menu .active{
        color:#0090F7 !important;
    }
    .el-popper .popper__arrow{
        border-width: 0px !important;
    }
    .el-popper[x-placement^=bottom] .popper__arrow::after{
        border-color:transparent !important;
        border-bottom-color:transparent !important;
    }
    .el-popper[x-placement^=top] .popper__arrow::after{
        border-top-color:transparent !important;
        border-color:transparent !important;
    }
    .el-dropdown-menu__item{
        color:#8B89C8 !important;
    }
    
    .el-dropdown-menu__item:focus, .el-dropdown-menu__item:not(.is-disabled):hover {
        background-color: transparent !important;
        color: #0090f7 !important;
    }
    .popper__arrow{
        border-width:0px !important;
        border-color: transparent !important;
    }
    .popper__arrow:after{
        border-width:0px !important;
        border-color: transparent !important;
    }
    .imgLogo{
        position:absolute;
        width:160px;
        pointer-events:none;
        left:60px;
        z-index:2;
        opacity:.4;  
    }
    .botNew{
        bottom:150px;
    }
    .botOld{
        bottom:120px;
    }
</style>
