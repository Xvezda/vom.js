# @vomjs/tools

JavaScript의 prototype을 이용하여 구현된 도구모음입니다.

## Selector
[jQuery](https://api.jquery.com/) 처럼 chaining 하여 사용될 수 있는 DOM API 도구입니다. 주로 low-level을 다룰때 사용됩니다.

### 문법
```javascript
select(selector)
  .on(eventName, handler)  // 이벤트리스너 추가
  .off(eventName, handler) // 이벤트리스너 제거
  .context();              // 현재 선택된 DOM 반환
```

## Pattern match

[Pattern matching](https://en.wikipedia.org/wiki/Pattern_matching) 문법을 차용하여 구현한 도구입니다.

### 문법
```javascript
match(target)
  .when(pattern, ifMatch)
  .otherwise(otherwise);
```

### 예제
```javascript
import { match } from '@vomjs/tools';

match({foo: 'hello world', bar: 123})
  .when(({foo}) => foo === 'hi', 'hello')
  .when({foo: /^hello/},
    () => console.log('foo matched'))
  .when(({bar}) => bar > 100,
    () => console.log('bar matched'))
  .otherwise(() => console.log('nope'));
```