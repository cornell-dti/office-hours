import { Observable, Subscription } from 'rxjs';
import { useState, useEffect } from 'react';

/**
 * An observable with a cached value.
 * It can be consumed by some react hooks, or used alone.
 *
 * Rationale:
 *   - Inside the application, we might want some data that can be globally subscribed.
 *   - We want a single observable that is guaranteed to produce a single value for all subscriber at
 *     any moment, instead of different ones running the same code.
 *   - We also want to immediately get the cached result without blocking, if the result has already
 *     been requested by other functions.
 *
 * This class is a wrapper around an obserable that provides these guarantees.
 */
export class SingletonObservable<T> {
    private cached: T;

    /**
     * @param initialValue the initial value to be used before the observable produces any value.
     * @param observable the wrapped observable that returns the latest data.
     */
    public constructor(initialValue: T, private readonly observable: Observable<T>) {
        this.cached = initialValue;
        observable.subscribe({ next: value => { this.cached = value;  } });
    }

    public get = (): T => this.cached;
    public subscribe = (next: (value: T) => void): Subscription => this.observable.subscribe({ next });
}

/**
  * @see SingletonObservable
  *
  * @param singletonObservable the data source.
  */
export const createUseSingletonObservableHook = <T>(singletonObservable: SingletonObservable<T>): (() => T) => {
    return () => {
        const [value, setValue] = useState(singletonObservable.get());
        useEffect(() => {
            const subscription = singletonObservable.subscribe(latest => setValue(latest));
            return () => subscription.unsubscribe();
        }, []);
        return value;
    };
};
