import * as React from "react";
import { EventEmitter } from "./EventEmitter";

interface ContextProviderProps<T> {
    value: T;
}

interface ContextConsumerProps<T> {
    children: (value: T, changed: boolean) => React.ReactNode;
}

interface ContextConsumerState<T> {
    value: T;
}

interface ContextOptions<T> {
    /**
     * Checks if the new value is equal to the old value.
     * This can be used to prevent unnecessary (and expensive) updates.
     * default: `(newValue, oldValue) => newValue === oldValue`
     */
    isEqual?: (newValue: T, oldValue: T) => boolean;

    /**
     * A function that allows applying a transformation to any incoming values, just before all of the handlers get called.
     * default: `(newValue, oldValue) => newValue`
     */
    transform?: (newValue: T, oldValue: T) => T;

    /**
     * A set of additional properties to add to the object.
     * This provides a simple means of extending the created context without a lot of additional boilerplate code.
     */
    extends?: any;
}

export function createContext<T>(defaultValue: T, options?: ContextOptions<T>) {
    const DEFAULT_OPTIONS: ContextOptions<T> = {
        isEqual: (newValue: T, oldValue: T) => newValue === oldValue,
        transform: (newValue: T, oldValue: T) => newValue,
    };

    // Create the emitter object that we will use to handle updates
    const emitter = new EventEmitter(defaultValue);

    // Set all of the default values so that we can safely access them without checking
    options = Object.assign({}, DEFAULT_OPTIONS, options);

    // Wrapper around `emitter.get()`
    function get() {
        return emitter.get();
    }

    // Wrapper around `emitter.set()`, which compares the new and old values, and calls the transform function on a change
    function set(newValue: T): boolean {
        const oldValue = emitter.get();

        if (!options.isEqual(newValue, emitter.get())) {
            emitter.set(options.transform(newValue, oldValue));
            return true;
        }

        return false;
    }

    // This is the suggested method of creating a context provider
    class Provider extends React.Component<ContextProviderProps<T>> {
        componentWillReceiveProps(nextProps: ContextProviderProps<T>) {
            set(nextProps.value);
        }

        render() {
            return this.props.children;
        }
    }

    // This is the recommended way of creating a context consumer
    class Consumer extends React.Component<ContextConsumerProps<T>, ContextConsumerState<T>> {
        state = {
            value: emitter.get(),
        };

        private changed = true;
        private readonly handler = (value: T) => {
            this.changed = true;
            this.setState({ value });
        }

        componentDidMount() {
            emitter.on(this.handler);
        }

        componentWillUnmount() {
            emitter.off(this.handler);
        }

        render() {
            const result = this.props.children(this.state.value, this.changed);
            this.changed = false;
            return result;
        }
    }

    return Object.assign({
        get,
        set,
        on: (handler: (value: T) => void) => emitter.on(handler),
        off: (handler: (value: T) => void) => emitter.off(handler),

        Provider,
        Consumer,
    }, options.extends);
}
