import * as React from "react";
import { EventEmitter } from "./EventEmitter";
export function createContext(value) {
    const emitter = new EventEmitter(value);
    class Provider extends React.Component {
        componentWillReceiveProps(nextProps) {
            if (this.props.value !== nextProps.value) {
                let newValue = nextProps.value;
                if (newValue !== emitter.get()) {
                    emitter.set(newValue);
                }
            }
        }
        render() {
            return this.props.children;
        }
    }
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
    return {
        get: () => emitter.get(),
        set: (value) => emitter.set(value),
        on: (handler) => emitter.on(handler),
        off: (handler) => emitter.off(handler),
        Provider,
        Consumer,
    };
}
