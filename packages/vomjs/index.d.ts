/* eslint-disable @typescript-eslint/no-explicit-any */
export type Template = {
  toString: () => string;
};

interface Displayable {
  displayName?: string;
}

export type Component = Displayable & ((props: any) => Template);
export interface RenderProps {
  render: Component | (() => Template);
}

export type Reference<T> = {
  current: T;
};

export function render(component: Component, element: HTMLElement | null): void;
export function html(strings: TemplateStringsArray, ...args: any[]): Template;
export function bind(component: Component): <T>(attrs: T) => Component;
export function useState<T>(state: T): [state: T, setter: (newState: T | ((prev: T) => T)) => void];
export function useEffect(effect: () => void, deps?: any[]): void;
export function useLayoutEffect(effect: () => void, deps?: any[]): void;
export function useRef<T>(): Reference<T>;
export function useEventListener<T>(ref: Reference<T>, eventName: string, handler: EventListener): void;
export function useDelegation<T>(eventName: string, handler: (target: HTMLElement, event: Event) => void): Reference<T>;
export function useMemo<T>(toEvaluate: () => T, deps?: any[]): T;
export function useCallback<T>(callback: T, deps?: any[]): T;
export function useReducer<State, Action extends { type: string, payload?: unknown }>(
  reducer: (state: State, action: Action) => State, initialArg: any
  ): [State, (action: Action) => State];
export function useReducer<State, Action extends { type: string, payload?: unknown }>(
  reducer: (state: State, action: Action) => State, initialArg: any, init?: (value: any) => State
  ): [State, (action: Action) => State];
export function useImperativeHandle<T>(ref: Reference<T>, createHandle: () => T, deps?: any[]): void;
