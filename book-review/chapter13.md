# chapter13 (모듈로 캡슐화하기)

## 익스포트 기본
`export` 키워드를 사용할 수 있다.

```js
export let a = 10;
export function func() {
  return a;
}
export class Rectangle {
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }
}
function subtract(num1, num2) {
  return num1 - num2;
}
export {substract}; // 위에서 정의한 함수를 export
```

## 임포트 기본
위에서 예시로 정의한 export 변수, 함수들을 불러와본다면

```js
import {a, func, Rectangle, subtract} from '../example.js';
```

import 뒤 중괄호는 주어진 모듈로부터 임포트할 바인딩을 가리킨다.

```js
import * as example from '../example.js';
```

전체를 임포트 한다. example이란 명칭을 통해 import한 프로퍼티들에 접근할 수 있다.
* 인스턴스화 된 모듈은 메모리에 유지되고 다른 import문이 모듈을 사용할 때마다 재사용된다.

```js
import {sum} from './example.js';
import {multiply} from './example.js';
import {magic} from './example.js';
```

**다음처럼 되어있어도 example.js는 한번만 실행된다.**

* import와 export는 다른 문이나 함수의 외부에서만 사용해야 한다! 함수 내부, if문 내부 등에서는 사용할 수 없다.

### import 바인딩의 특이한 점
* import문은 단순히 일반 변수처럼 원본의 바인딩을 참조하지 않고 변수, 함수 및 클래스에 대한 읽기 전용 바인딩을 만든다.

```js
// ex1.js
export var name = 'hanjung';

// ex2.js
import {name} from './ex1.js';

console.log(name); // hanjung
name = 'doojung'; // error
```

## 익스포트와 임포트에 새로운 이름 사용하기
`as` 키워드를 이용한다.

```js
// ex1.js
export var name = 'hanjung';

// ex2.js
import {name as name2} from './ex1.js';
console.log(name2); // hanjung
console.log(name); // undefined
```

## 모듈의 기본 값
* 모듈마다 `default` 키워드를 이용하여 하나의 기본값을 설정할 수 있다.
* 이 패턴은 CommonJS 같은 모듈 시스템에서도 매우 일반적으로 사용할 수 있기 때문에 존재한다.

```js
// ex1.js
export var name = 'hanjung';
export default function() {
  return name;
}

// ex2.js
import getName, {name} from './ex1.js'; // default는 중괄호를 사용하지 않고 명칭을 지어주면서 사용할 수 있다.
console.log(name); // hanjung
console.log(getName()); // hanjung
```

## 바인딩 없이 import하기
* 바인딩 없는 import문은 대부분 polyfill이나 shim에서 사용된다.

```js
// ex1.js
// 익스포트나 임포트가 없는 모듈 코드
Array.prototype.pushAll = (items) => {
  if(!Array.isArray(items)) {
    throw new TypeError("Args must be an array");
  }
  return this.push(...items);
}

// ex2.js
import './ex1.js'; // 간소화 하여 전역에 추가

let numb = [1, 2, 3];
let items = [];
items.pushAll(numb); // [1, 2, 3]
```

## 모듈 로드하기
ES6에서는 모듈 문법을 정의하였지만, 모듈을 로드하는 방식에 대해서 정의하지 않았다. 
* HostResolveImportedModule이라는 내부 연산에 대한 로딩 메커니즘을 추상화여 각각에 환경에 적합한 방식으로 구현하였다.

### 웹 브라우저에서 사용하기
#### `<script>`로 모듈 사용하기
* script 태그는 기본적으로 모듈이 아닌 자바스크립트 파일을 로드한다. type 속성에 "module"을 설정하지 않는다면 "text/javascript"로 기본동작이 수행될 것이다.
  * module 타입을 지원하지 않는 브라우저는 자동으로 무시할 것이다.

```html
<!-- 자바스크립트 파일 모듈 로딩 -->
<script type="module" src="module.js"></script>
<!-- 인라인 모듈 포함 -->
<script type="module">
import {sum} from 'ex1.js';

let result = sum(1, 2);
</script>
```

#### 모듈이 로드되는 순서
모듈은 자바스크립트와 달리 올바를 실행을 보장하기 위해 먼저 로딩되어야 하는 파일들이 있다. 따라서 `<script type="module">`은 defer 속성이 적용된 것처럼 동작한다.
1. 만나자 마자 다운로드가 시작되지만 완전히 문서가 파싱되기 전에 실행되지 않는다.
2. 또한 `<script>`가 쓰여진 순서대로 실행된다.

* `<script>`에 async를 작성한다면 순서에 영향을 미치지 않고 다운로드 하자마자 실행된다. 하지만 일반 자바스크립트 파일과 차이점은 **모듈의 모든 import 리소스가 모듈 실행 전에 다운로드 된다.** 하지만 그 모듈이 언제 실행 될지는 알 수 없다.

### 워커에서 모듈 로드하기

웹 워커와 서비스 워커같은 워커는 웹 페이지 컨텍스트 외부에서 자바스크립트 코드를 실행한다.
* 새 워크를 만든다는 것은 새로운 Worker(또는 Class) 인스턴스를 만들고 자바스크립트 파일의 위치를 전달한다는 의미이다.

```js
let worker = new Worker("module.js", {type: "module" });
```