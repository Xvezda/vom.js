# :eyes: vom.js [![gzip size](https://img.badgesize.io/https://cdn.jsdelivr.net/npm/vomjs/dist/vom.js?label=gzip&compression=gzip)](https://cdn.jsdelivr.net/npm/vomjs/dist/vom.js) [![brotli size](https://img.badgesize.io/https://cdn.jsdelivr.net/npm/vomjs/dist/vom.js?label=brotli&compression=brotli)](https://cdn.jsdelivr.net/npm/vomjs/dist/vom.js) [![npm version](https://img.shields.io/npm/v/vomjs)](https://npmjs.com/package/vomjs)

`vom.js`는 React-like API를 제공하는 UI 프레임워크입니다.


## Demo

- [**basic-routing**](https://94kwb.csb.app): [Sandbox](https://codesandbox.io/s/94kwb) | [Source](examples/basic-routing)
- [**counter**](https://vlzfr.csb.app): [Sandbox](https://codesandbox.io/s/vlzfr) | [Source](examples/counter)
- [**tic-tac-toe**](https://dh3f0.csb.app): [Sandbox](https://codesandbox.io/s/dh3f0) | [Source](examples/tic-tac-toe)

## Install

Npm
```sh
npm i vomjs
```

Yarn
```sh
yarn add vomjs
```

CDN
```html
<script src="https://cdn.jsdelivr.net/npm/vomjs"></script>
```

## Goals
- [ ] Hooks API 구현
  - [x] `useState`
  - [x] `useEffect`
  - [ ] `useContext`
  - [x] `useReducer`
  - [x] `useCallback`
  - [x] `useMemo`
  - [x] `useRef`
  - [ ] `useImperativeHandle`
  - [ ] `useLayoutEffect`
  - [ ] `useDebugValue`
- [ ] 서버사이드 렌더링 지원
