export function getOverrides (theme) {
    var themes = {
        "white": {
            //url: "day.css",
            up: "#03c087",
            down: "#ef5555",
            bg: "#ffffff",
            grid: "#f7f8fa",
            cross: "#23283D",
            border: "#9194a4",
            text: "#9194a4",
            areatop: "rgba(71, 78, 112, 0.1)",
            areadown: "rgba(71, 78, 112, 0.02)",
            line: "#737375",
        },
        "old": {
            //url: "night.css",
            up: "#54B589", //绿色
            down: "#E85E59", //红色
            bg: "#14142c", 
            grid: "#1f2943", //网格
            cross: "#9194A3", //网格
            border: "#4e5b85", //边框
            text: "#8B89C8",
            areatop: "rgba(122, 152, 247, .1)",
            areadown: "rgba(122, 152, 247, .1)",
            line: "#737375",
        },
        "new": {
            //url: "night.css",
            up: "#54B589", //绿色
            down: "#E85E59", //红色
            bg: "#14142c", 
            grid: "#1f2943", //网格
            cross: "#9194A3", //网格
            border: "#4e5b85", //边框
            text: "#8B89C8",
            areatop: "rgba(122, 152, 247, .1)",
            areadown: "rgba(122, 152, 247, .1)",
            line: "#737375",
        },
        // "new": {
        //     //url: "night.css",
        //     up: "#589065", //绿色
        //     down: "#ae4e54", //红色
        //     bg: "#14142c", 
        //     grid: "#1f2943",
        //     cross: "#9194A3",
        //     border: "#4e5b85",
        //     text: "#61688A",
        //     areatop: "rgba(122, 152, 247, .1)",
        //     areadown: "rgba(122, 152, 247, .02)",
        //     line: "#737375",
        // },
        "black1": {
            //url: "night.css",
            up: "#589065",
            down: "#ae4e54",
            bg: "#181B2A",
            grid: "#1f2943",
            cross: "#9194A3",
            border: "#4e5b85",
            text: "#61688A",
            areatop: "rgba(122, 152, 247, .1)",
            areadown: "rgba(122, 152, 247, .02)",
            line: "#737375",
        },
        "mobile": {
            //url: "mobile.css",
            up: "#03C087",
            down: "#E76D42",
            bg: "#ffffff",
            grid: "#f7f8fa",
            cross: "#23283D",
            border: "#C5CFD5",
            text: "#8C9FAD",
            areatop: "rgba(71, 78, 112, 0.1)",
            areadown: "rgba(71, 78, 112, 0.02)",
            showLegend: !0
        }
    };
      var t = themes[theme];
      return {
          "volumePaneSize": "medium",
          "scalesProperties.lineColor": t.text,
          "scalesProperties.textColor": t.text,
          "paneProperties.background": t.bg,
          "paneProperties.vertGridProperties.color": t.grid,
          "paneProperties.horzGridProperties.color": t.grid,
          "paneProperties.crossHairProperties.color": t.cross,
          // "paneProperties.legendProperties.showLegend": !!t.showLegend,
          "paneProperties.legendProperties.showStudyArguments": !0,
          "paneProperties.legendProperties.showStudyTitles": !0,
          "paneProperties.legendProperties.showStudyValues": !0,
          "paneProperties.legendProperties.showSeriesTitle": !0,
          "paneProperties.legendProperties.showSeriesOHLC": !0,
          "mainSeriesProperties.candleStyle.upColor": t.up,
          "mainSeriesProperties.candleStyle.downColor": t.down,
          "mainSeriesProperties.candleStyle.drawWick": !0,
          "mainSeriesProperties.candleStyle.drawBorder": !0,
          "mainSeriesProperties.candleStyle.borderColor": t.border,
          "mainSeriesProperties.candleStyle.borderUpColor": t.up,
          "mainSeriesProperties.candleStyle.borderDownColor": t.down,
          "mainSeriesProperties.candleStyle.wickUpColor": t.up,
          "mainSeriesProperties.candleStyle.wickDownColor": t.down,
          "mainSeriesProperties.candleStyle.barColorsOnPrevClose": !1,
          "mainSeriesProperties.hollowCandleStyle.upColor": t.up,
          "mainSeriesProperties.hollowCandleStyle.downColor": t.down,
          "mainSeriesProperties.hollowCandleStyle.drawWick": !0,
          "mainSeriesProperties.hollowCandleStyle.drawBorder": !0,
          "mainSeriesProperties.hollowCandleStyle.borderColor": t.border,
          "mainSeriesProperties.hollowCandleStyle.borderUpColor": t.up,
          "mainSeriesProperties.hollowCandleStyle.borderDownColor": t.down,
          "mainSeriesProperties.hollowCandleStyle.wickColor": t.line,
          "mainSeriesProperties.haStyle.upColor": t.up,
          "mainSeriesProperties.haStyle.downColor": t.down,
          "mainSeriesProperties.haStyle.drawWick": !0,
          "mainSeriesProperties.haStyle.drawBorder": !0,
          "mainSeriesProperties.haStyle.borderColor": t.border,
          "mainSeriesProperties.haStyle.borderUpColor": t.up,
          "mainSeriesProperties.haStyle.borderDownColor": t.down,
          "mainSeriesProperties.haStyle.wickColor": t.border,
          "mainSeriesProperties.haStyle.barColorsOnPrevClose": !1,
          "mainSeriesProperties.barStyle.upColor": t.up,
          "mainSeriesProperties.barStyle.downColor": t.down,
          "mainSeriesProperties.barStyle.barColorsOnPrevClose": !1,
          "mainSeriesProperties.barStyle.dontDrawOpen": !1,
          "mainSeriesProperties.lineStyle.color": t.border,
          "mainSeriesProperties.lineStyle.linewidth": 1,
          "mainSeriesProperties.lineStyle.priceSource": "close",
          "mainSeriesProperties.areaStyle.color1": t.areatop,
          "mainSeriesProperties.areaStyle.color2": t.areadown,
          "mainSeriesProperties.areaStyle.linecolor": t.border,
          "mainSeriesProperties.areaStyle.linewidth": 2,  //分时线宽
          "mainSeriesProperties.areaStyle.priceSource": "close"
      }
  }
  
