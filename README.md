# react-flux-context

The new React context design uses a beautifully elegant design.

It has most of the elements of a traditional Flux-style data storage, but in its current form (as of the time of this writing), is not quite there.

More than once, I found myself needing to eke out a little more power out of the simplistic design. In particular, being able to update the stored value in the context from outside of a React render cycle. Preferably without having to use prop drilling to pass functions that would do the updating for me.

## example

```jsx
import * as React from "react";
// const ThemeContext = React.createContext("light");

// Becomes:
import { createContext } from "react-flux-context";
const ThemeContext = createContext("light");

class App extends React.Component {
    render() {
        return (
            <ThemeContext.Consumer>
                {(theme) => (
                    <p className={theme}>hello world</p>
                )}
            </ThemeContext.Consumer>
        );
    }
}


// Some time later...


// This can be updated at any time, even outside of a React render
// Calling it will cause a re-render of all <Context.Consumer /> elements
ThemeContext.set("dark");

// Or you could still use the traditional method to update within the render cycle:
// <ThemeContext.Provider value={value}>
//     {/* children */}
// </ThemeContext.Provider>
```
