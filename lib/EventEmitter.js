export class EventEmitter {
    constructor(value) {
        this.value = value;
        this.handlers = [];
    }
    on(handler) {
        this.handlers.push(handler);
    }
    off(handler) {
        this.handlers = this.handlers.filter((h) => h !== handler);
    }
    get() {
        return this.value;
    }
    set(newValue) {
        this.value = newValue;
        this.handlers.forEach((handler) => handler(newValue));
    }
}
