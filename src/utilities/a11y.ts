import React from 'react';

type UniversalKeyboardEvent<T> =  React.KeyboardEvent<T> | KeyboardEvent;

export const useEscape = (callback: () => void) => {
    React.useEffect(() => {
        const esc = onEscape(() => {
            callback();
        });

        document.addEventListener("keydown", esc, false);
    
        return () => {
            document.removeEventListener("keydown", esc, false);
        };
    }, [callback]);
};

export function onEscape<T>(fn: () => void): (event: UniversalKeyboardEvent<T>) => void {
    return (event: UniversalKeyboardEvent<T>) => {
        if (event.key === 'Escape') {
            fn();
        }
    };
}

export function onEnterOrSpace<T>(fn: () => void): (event: UniversalKeyboardEvent<T>) => void {
    return (event: UniversalKeyboardEvent<T>) => {
        // eslint-disable-next-line no-console
        console.log('Key: [' +event.key + ']');
        if (event.key === 'Enter' || event.key === ' ') {
            fn();
        }
    };
}

export function onSpace<T>(fn: () => void): (event: UniversalKeyboardEvent<T>) => void {
    return (event: UniversalKeyboardEvent<T>) => {
        if (event.key === ' ') {
            fn();
        }
    };
}

export function onEnter<T>(fn: () => void): (event: React.KeyboardEvent<T>) => void {
    return (event: UniversalKeyboardEvent<T>) => {
        if (event.key === 'Enter') {
            fn();
        };
    }
}