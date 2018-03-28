type EventHandler<T> = (value: T) => void;

export class EventEmitter<T> {
    private value: T;
    private handlers: EventHandler<T>[];

    constructor(value: T) {
        this.value = value;
        this.handlers = [];
    }

    on(handler: EventHandler<T>) {
        this.handlers.push(handler);
    }

    off(handler: EventHandler<T>) {
        this.handlers = this.handlers.filter((h) => h !== handler);
    }

    get(): T {
        return this.value;
    }

    set(newValue: T) {
        this.value = newValue;
        this.handlers.forEach((handler) => handler(newValue));
    }
}
