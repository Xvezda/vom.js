/* eslint-disable @typescript-eslint/no-explicit-any */
export type Template = {
  toString: () => string;
};

interface Displayable {
  displayName: string;
}

export type Component = Displayable & ((props: any) => Template);
export interface RenderProps {
  render: Component | (() => Template);
}

export type Reference = {
  current: any;
};

export function render(component: Component, element: HTMLElement | null): void;
export function html(strings: TemplateStringsArray, ...args: any[]): Template;
export function useState<T>(state: T): [state: T, setter: (newState: T | ((prev: T) => T)) => void];
export function useEffect(effect: () => void, deps?: any[]): void;
export function useRef(): Reference;
export function useEventListener(ref: Reference, eventName: string, handler: EventListener): void;
export function useDelegation(eventName: string, handler: (target: HTMLElement, event: Event) => void): Reference;
export function useMemo<T>(toEvaluate: () => T, deps?: any[]): T;
export function useCallback<T>(callback: T, deps?: any[]): T;
