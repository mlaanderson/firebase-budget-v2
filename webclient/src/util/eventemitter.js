/** @typedef {(...args) => any} EventHandler */

export default class {
    constructor() {
        /** @type {Object.<string,Array<EventHandler>} */
        this._listeners = {};
    }

    /**
     * Adds an event listener
     * @param {string} event event name
     * @param {EventHandler} handler event handler
     */
    on(event, handler) {
        if (event in this._listeners === false) {
            this._listeners[event] = [];
        }
        this._listeners[event].push(handler);
    }

    /**
     * Removes an event listener
     * @param {string} event event name
     * @param {EventHandler?} handler event handler
     */
     off(event, handler) {
        if (event in this._listeners) {
            if (handler) {
                this._listeners[event] = this._listeners[event].filter(h => h === handler);
            } else {
                this._listeners[event] = [];
            }
        }
    }

    /**
     * Adds an event listener that gets fired once
     * @param {string} event event name
     * @param {EventHandler} handler event handler
     */
     once(event, handler) {
         let tHandler = (...args) => {
             handler(...args);
             this.off(event, tHandler);
         }
         this.on(event, tHandler);
    }

    /**
     * fires and event
     * @param {string} event event name
     * @param {Array<any>} args event arguments
     */
    emit(event, ...args) {
        if (this._listeners[event]) {
            for (let handler of this._listeners[event]) {
                handler(...args);
            }
        }
    }
}