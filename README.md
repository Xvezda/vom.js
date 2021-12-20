# :eyes: vom.js [![gzip size](https://img.badgesize.io/https://cdn.jsdelivr.net/npm/vomjs/dist/vom.js?label=gzip&compression=gzip)](https://cdn.jsdelivr.net/npm/vomjs/dist/vom.js) [![brotli size](https://img.badgesize.io/https://cdn.jsdelivr.net/npm/vomjs/dist/vom.js?label=brotli&compression=brotli)](https://cdn.jsdelivr.net/npm/vomjs/dist/vom.js) [![npm version](https://img.shields.io/npm/v/vomjs)](https://npmjs.com/package/vomjs) [![codecov](https://codecov.io/gh/Xvezda/vom.js/branch/main/graph/badge.svg?token=EIU6BZ9MO4)](https://codecov.io/gh/Xvezda/vom.js)

`vom.js`는 React-like API를 제공하는 UI 프레임워크입니다.


## Demo

- [**basic-routing**](https://5ek46.csb.app): [Sandbox](https://codesandbox.io/s/5ek46) | [Source](examples/basic-routing)
- [**counter**](https://g98c9.csb.app): [Sandbox](https://codesandbox.io/s/g98c9) | [Source](examples/counter)
- [**tic-tac-toe**](https://ni9yt.csb.app): [Sandbox](https://codesandbox.io/s/ni9yt) | [Source](examples/tic-tac-toe)

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
  - [x] `useImperativeHandle`
  - [x] `useLayoutEffect`
  - [ ] `useDebugValue`
- [ ] 서버사이드 렌더링 지원
