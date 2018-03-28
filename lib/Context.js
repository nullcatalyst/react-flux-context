import * as React from "react";
import { EventEmitter } from "./EventEmitter";
export function createContext(defaultValue, options) {
    const DEFAULT_OPTIONS = {
        isEqual: (newValue, oldValue) => newValue === oldValue,
        transform: (newValue, oldValue) => newValue,
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
    function set(newValue) {
        const oldValue = emitter.get();
        if (!options.isEqual(newValue, emitter.get())) {
            emitter.set(options.transform(newValue, oldValue));
            return true;
        }
        return false;
    }
    // This is the suggested method of creating a context provider
    class Provider extends React.Component {
        componentWillReceiveProps(nextProps) {
            set(nextProps.value);
        }
        render() {
            return this.props.children;
        }
    }
    // This is the recommended way of creating a context consumer
    class Consumer extends React.Component {
        constructor() {
            super(...arguments);
            this.state = {
                value: emitter.get(),
            };
            this.changed = true;
            this.handler = (value) => {
                this.changed = true;
                this.setState({ value });
            };
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
        on: (handler) => emitter.on(handler),
        off: (handler) => emitter.off(handler),
        Provider,
        Consumer,
    }, options.extends);
}
