<template>
    <div class="uk-modal-full" uk-modal="bg-close: false;">
        <div class="uk-modal-dialog">
            <div class="uk-modal-header">
                <h2 class="uk-modal-title">{{ display.toLocaleString({ month: 'long', year: 'numeric' }) }}</h2>
                    <div class="uk-navbar-container uk-navbar-transparent" uk-navbar>
                        <div class="uk-navbar-left">
                            <ul class="uk-iconnav">
                                <li><a @click.prevent="changeMonths(-12)" href="#" uk-icon="icon: chevron-double-left" uk-tooltip="Previous Year"></a></li>
                                <li><a @click.prevent="changeMonths(-1)" href="#" uk-icon="icon: triangle-left" uk-tooltip="Previous Month"></a></li>
                            </ul>
                        </div>

                        <div class="uk-navbar-center">
                            <ul class="uk-iconnav">
                                <li><a @click.prevent="changeMonths(0)" href="#" uk-icon="icon: calendar" uk-tooltip="Current Month"></a></li>
                            </ul>
                        </div>

                        <div class="uk-navbar-right">
                            <ul class="uk-iconnav">
                                <li><a @click.prevent="changeMonths(1)" href="#" uk-icon="icon: triangle-right" uk-tooltip="Next Month"></a></li>
                                <li><a @click.prevent="changeMonths(12)" href="#" uk-icon="icon: chevron-double-right" uk-tooltip="Next Year"></a></li>
                            </ul>
                        </div>
                    </div>
            </div>
            <div class="uk-modal-body">
                <table class="uk-table uk-table-divider uk-table-small" @wheel.exact.prevent="onScroll" @touchmove.prevent="onTouch" @touchend="onTouchEnd">
                    <thead>
                        <tr ref="cellHeight">
                            <th v-for="(day, n) in weekDays" v-bind:key="n">{{ day }}</th>
                        </tr>
                    </thead>
                    <tbody ref="calBody">
                        <tr v-for="week in [0,1,2,3,4,5]" :key="week">
                            <td v-for="day in [0,1,2,3,4,5,6]" 
                                :key="day" 
                                :class="cellClass(day + week * 7)" 
                                @mouseover="onMouseOver"
                                @click.prevent="onClick"
                                :date="cellDate(day + week * 7).toFormat('yyyy-MM-dd')">{{ cellDate(day + week * 7).toLocaleString({ day: 'numeric' }) }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="uk-modal-footer uk-text-right">
                <button ref="btnCancel" class="uk-button uk-button-default uk-modal-close" type="button">Cancel</button>
                <button v-if="touchCapable" ref="btnSubmit" class="uk-button uk-button-primary" type="button" @click="selectPeriod">OK</button>
            </div>
        </div>
    </div>
</template>

<script>
import UIkit from 'uikit';
import { DateTime, Info } from 'luxon';
import { getWeekStartByLocale } from 'weekstart';
import { CalculatePeriod } from '../util/date';

window.DateTime = DateTime;
window.Info = Info;

var lastTouch = null;

export default {
    props: {
        periodLength: {
            type: Number,
            default: 7 // One-week period
        },
        startDate: {
            type: DateTime,
            required: true
        },
        value: {
            required: true
        }
    },
    data: function() {
        return {
            selected: this.value,
            display: this.value.start.startOf('month'),
            weekStart: getWeekStartByLocale(navigator.language),
            startDay: this.startDate.weekday
        }
    },
    computed: {
        /**
         * Returns the DateTime object for the first displayed day in the calendar
         */
        startDayOfWeek: function() {
            // when the start of the month is on the week start
            if (this.display.weekday % 7 === this.weekStart) {
                return this.display.minus({ weeks: 1});
            }
            let result = this.display.startOf('week');
            let days = (result % 7) - this.weekStart;

            result = result.minus({ days: days });
            
            if (result.valueOf() > this.display.valueOf()) {
                result = result.minus({ weeks: 1 });
            }
            return result.minus({ weeks: 1});
        },

        /**
         * Returns an array of weekday abbreviations in the user's order
         */
        weekDays: function() {
            let result = Info.weekdays('short');
            let days = (this.display.startOf('week').weekday % 7) - this.weekStart;

            for (let n = 0; n < Math.abs(days); n++) {
                if (days < 0) {
                    result.push(result.shift());
                } else if (days > 0) {
                    result.unshift(result.pop());
                }
            }
            return result;
        },

        /**
         * Determines if the current device has a touch interface
         */
        touchCapable: function() {
            return 'ontouchstart' in window;
        }
    },
    methods: {
        /**
         * Moves the calender by a given number of months
         * Negative amounts move to the past positive to
         * the future.
         */
        changeMonths(amount) {
            if (amount === 0) {
                this.display = DateTime.now().startOf('month');
            } else {
                this.display = this.display.plus({ months: amount});
            }
            this.clearCellHighlight();
        },

        /**
         * Moves the calender by a given number of weeks
         * Negative amounts move to the past positive to
         * the future.
         */
        changeWeeks(amount) {
            this.display = this.display.plus({ weeks: amount});
            this.clearCellHighlight();
        },

        /**
         * Picks the period the user wants and [will] close the dialog
         */
        selectPeriod() {
            this.$emit('input', this.selected);
            UIkit.modal(this.$el).hide();
        },

        /**
         * Moves the calendar by 1 week per scroll wheel
         */
        onScroll(evt) {
            if (evt.wheelDeltaY > 0) {
                this.changeWeeks(-1);
            } else {
                this.changeWeeks(1);
            }
        },

        /**
         * Allows touch events to scroll the calendar, moves when the amount scrolled
         * is roughly the height of one cell
         */
        onTouch(evt) {
            if (lastTouch !== null) {
                let delta = lastTouch.clientY - evt.touches[0].clientY;
                if (Math.abs(delta) > this.$refs.cellHeight.offsetHeight / 1.2) {
                    lastTouch = evt.touches[0];
                    this.changeWeeks(Math.sign(delta));
                }
            } else {
                lastTouch = evt.touches[0];
            }
        },

        /**
         * Fired when a touch is released. If we have been dragging,
         * setup to be ready for the next. If we have not been 
         * dragging, this is a touch or click event. Select the
         * period under the touch.
         */
        onTouchEnd(evt) {
            if (lastTouch === null) {
                // this is a tap not a drag
                let activeDate = DateTime.fromISO(evt.target.getAttribute('date')).startOf('day');
                let period = CalculatePeriod(activeDate, this.startDate, this.periodLength);
                let cells = Array.from(this.$refs.calBody.getElementsByTagName('td'));
                cells.forEach(cell => {
                    let cdate = DateTime.fromISO(cell.getAttribute('date')).startOf('day');
                    if ((period.start.startOf('day') <= cdate.startOf('day')) && (cdate.startOf('day') <= period.end.startOf('day'))) {
                        cell.className = 'uk-background-primary uk-light';
                    } else if (cdate.month === this.display.month) {
                        cell.className = 'uk-background-default';
                    } else {
                        cell.className = 'uk-background-muted';
                    }
                });
                this.selected = period;
            }
            lastTouch = null;
        },

        /**
         * Handles the on-click for dates in non-touch environments
         */
        onClick(evt) {
            if (!this.touchCapable) {
                let activeDate = DateTime.fromISO(evt.target.getAttribute('date')).startOf('day');
                this.selected = CalculatePeriod(activeDate, this.startDate, this.periodLength);
                this.selectPeriod();
            }
        },

        /**
         * Clears cell highlight. Happens on scroll to prevent
         * odd highlight artifacts
         */
        clearCellHighlight() {
            let cells = Array.from(this.$refs.calBody.getElementsByTagName('td'));
            cells.forEach(cell => {
                let cdate = DateTime.fromISO(`${cell.getAttribute('date')}T00:00:00`);
                if (cdate.month === this.display.month) {
                    cell.className = 'uk-background-default';
                } else {
                    cell.className = 'uk-background-muted';
                }
            });
        },

        /**
         * Mouse operated highlight when the cursor is over a cell
         */
        onMouseOver(evt) {
            // find the start date
            let activeDate = DateTime.fromISO(`${evt.target.getAttribute('date')}T00:00:00`);
            let period = CalculatePeriod(activeDate, this.startDate, this.periodLength);
            let cells = Array.from(this.$refs.calBody.getElementsByTagName('td'));
            cells.forEach(cell => {
                let cdate = DateTime.fromISO(`${cell.getAttribute('date')}T00:00:00`);
                if ((period.start.startOf('day') <= cdate.startOf('day')) && (cdate.startOf('day') <= period.end.startOf('day'))) {
                    cell.className = 'uk-background-primary uk-light';
                } else if (cdate.month === this.display.month) {
                    cell.className = 'uk-background-default';
                } else {
                    cell.className = 'uk-background-muted';
                }
            });

        },

        /**
         * Used to assign a date value to a cell for easier reference
         */
        cellDate(offset) {
            return this.startDayOfWeek.plus({ days: offset });
        },

        /**
         * Assigns the cell class during initial draw
         */
        cellClass(offset) {
            return this.cellDate(offset).month === this.display.month ? "uk-background-default" : "uk-background-muted";
        }
    }
}
</script>

<style scoped>
    td {
        text-align: center;
        cursor: pointer;
    }
    .uk-modal-body {
        padding-left: 0px !important;
        padding-right: 0px !important;
    }
</style>