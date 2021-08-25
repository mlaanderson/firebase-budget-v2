<template>
    <div ref="chart"></div>
</template>

<style scoped>
    .totals {
        position: relative;
        z-index: 999;
        left: 0px;
        top: 0px;
    }
</style>

<script>
import Vue from 'vue';
import Vuex from 'vuex';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_amchartsdark from "@amcharts/amcharts4/themes/amchartsdark";
import Firebase from '../data/firebase';
import { DateTime } from 'luxon';
import { Currency } from '../util/formats';

Vue.use(Vuex);

am4core.useTheme(am4themes_amchartsdark);

export default {
    computed: {
        ...Vuex.mapGetters(['dailyBalances']),
        ...Vuex.mapState(['period']),
        data: {
            get() {
                if (this.chart) {
                    return this.chart.data;
                }
                return [];
            },
            set(values) {
                if (this.chart) {
                    this.chart.data = [...values.map(d => { 
                        return { 
                            date: DateTime.fromISO(d.date).toJSDate(), 
                            amount: d.amount,
                            dateString: DateTime.fromISO(d.date).toLocaleString({ month: 'short', day: 'numeric', year: 'numeric' }),
                            valueString: Currency.format(d.amount)
                        } 
                    })]
                    .sort((a,b) => a.date.getTime() - b.date.getTime() );
                }
            }
        }
    },
    methods: {
        zoom(period) {
            let start = period.start.minus({ weeks: 3 }).toJSDate();
            let end = period.start.plus({ months: 2 }).toJSDate();
            this.dateAxis.zoomToDates(start, end);
        }
    },
    watch: {
        dailyBalances(newList) {
            this.data = newList;
            this.chart.events.once('datavalidated', () => this.zoom(this.period));
        },
        period(period) {
            this.zoom(period);
        }
    },
    mounted() {
        let chart = am4core.create(this.$el, am4charts.XYChart);
        chart.data = [];
        chart.responsive.enabled = true;

        let dateAxis = chart.xAxes.push(new am4charts.DateAxis());
        let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        dateAxis.dataFields.category = 'date';
        dateAxis.baseInterval = { timeUnit: 'day', count: 1 };

        valueAxis.numberFormatter.numberFormat = '$#,###.00'

        let series = chart.series.push(new am4charts.StepLineSeries());
        series.dataFields.valueY = 'amount';
        series.dataFields.dateX = 'date';
        series.tooltipText = "{dateString}\n{valueString}";
        

        chart.cursor = new am4charts.XYCursor();
        chart.cursor.xAxis = dateAxis;
        chart.cursor.fullWidthLineX = true;
        chart.cursor.lineX.strokeWidth = 0;
        chart.cursor.lineX.fill = am4core.color("#FFFFFF");
        chart.cursor.lineX.fillOpacity = 0.2;
        chart.cursor.behavior = 'panX';
        chart.cursor.lineY.disabled = true;

        chart.scrollbarX = new am4core.Scrollbar();
        chart.scrollbarX.parent = chart.bottomAxesContainer;
        chart.zoomOutButton.disabled = true;

        this.chart = chart;
        this.dateAxis = dateAxis;

        Firebase.auth.onAuthStateChanged((auth) => {
            if (auth) {
                this.data = this.dailyBalances;
                this.chart.events.once('datavalidated', () => this.zoom(this.period));
            } else {
                this.data = [];
            }
        });
    },
    beforeDestroy() {
        if (this.chart) {
            this.chart.dispose();
        }
    }
}
</script>