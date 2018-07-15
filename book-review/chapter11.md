# chapter11 (프로미스 기초)

## 비동기 프로그래밍 배경 지식
1. 자바스크립트 엔진은 싱글 스레드 이벤트 루프 개념을 기반으로 한다, 고로 한번에 한개의 코드만 실행이 가능하다.
2. 실행 예정인 코드를 추적할 필요가 없다. 코드가 실행될 준비가 되면 작업 큐에 추가된다.
3. 실행이 끝나면 이벤트 루프는 큐에서 다음 작업을 꺼내 실행한다.

동기적으로 처리하기 위해 콜백을 통해 비동기 프로그래밍 모델을 발전시켰지만 콜백 헬에 빠질 수 있다는 단점이 존재한다.

### 콜백 패턴

```js
method1(function(err, result) {
  if(err) {
    throw err;
  }
  method2(function(err, result) {
    if(err) {
      throw err;
    }
    method3(function(err, result) {
      ...
    })
  })
})
```

너무 많은 콜백의 중첩으로 콜백헬에 빠질 수 있다.

## 프로미스 기초

> 프로미스는 비동기 연산의 결과를 위한 `플레이스 홀더`이다.

### 프로미스 생명 주기
* pending: 비동기 연산이 끝나지 않음
* un-settled: 프로미스를 반환하는 시점에 일시적으로 보류 상태가 된다.
* settled: 비동기 연산이 완료된 상태, 2가지 상태중 하나를 갖는다.
    * fulfilled: 성공적
    * rejected: 에러, 다른 이유로 성공적이게 끝나지 않음

* promise 내부의 `[[PromiseState]]` 프로퍼티는 프로미스의 상태를 반영하여 'pending', 'fulfilled', 'rejected' 중 하나가 된다.

* `then()` 메서드를 통해 프로미스의 상태가 변경 될 때 특정 동작을 취할 수 있도록 한다.

```js
let promise = readFile("ex.txt");

promise.then(function(contents) {
  // 성공시
}, function(err) {
  // 실패시
});

// 혹은
promise.then(function(contents) {
  // 성공시
});

promise.then(null, function(err) {
  // 실패시
});

// 혹은
promise.then(function(contents) {
  // 성공시
});
promise.catch(function(err) {
  // 실패시
});
```

* 프로미스가 이미 확정 상태가 된 후 새로운 성공, 실패 핸들러를 추가 할 수 있으며 호출은 보장 될 것이다.

```js
let promise =  readFile("ex.txt");
promise.then(function(contents) {
  // 성공 동작 1
  // 새로운 성공 핸들러 추가
  promise.then(function(contents) {
    console.log(contents);
  });
})
```

### 미확정 프로미스 만들기
* Promise 생성자를 사용하여 만든다.
    * 이 때 실행자 함수 하나를 인자로 받는다.
      * 이 실행자에는 resolve(), reject() 명명된 두 함수가 인자로 전달된다.
      * resolve() 함수는 프로미스 실행자가 성공적으로 실행 완료 되었을때, reject() 함수는 실행자가 실패 했을때 실행된다.
    * 이 함수들이 실행자 내에서 호출되면 프로미스를 처리하기 위해 작업큐에 작업이 추가된다.(`마치 setTimeout을 실행할 때 처럼`)

```js
let promise = new Promise((resolve, reject) => {
  console.log('promise');
  resolve();
});

promise.then(() => {
  console.log('resolved');
});

console.log('H!');
// promise
// H!
// resolved
```

### 확정 프로미스 만들기

1. `Promise.resolve()`, `Promise.reject()`

```js
let promise = Promise.resolve(42);
let promise2 = Promise.reject(43);

promise.then(function(value) {
  console.log(value); // 42
});

promise2.catch(function(value) {
  console.log(value); // 43
});
```

2. thenable 이용하기
* 데너블(`thenable`): resolve, reject 인자를 받는 then() 메서드를 가지는 객체
* thenable을 임의대로 성공한 프로미스로, 실패한 프로미스로 변경하여  호출할 수 있다.

```js
let thenable = {
  then: function(resolve, reject) {
    reject(42); // 2. thenable에서 reject하여 반환
  }
};

let p1 = Promise.resolve(thenable); // 1. resolve 했지만

p1.catch((value) => {
  console.log(value); // 3. 그래서 catch 절에 걸림, 42
});
```

### 실행자 에러
* 다음처럼 실행자는 의도적으로 에러를 발생 시킬 수 있다.
* 위와 아래의 예제는 같은 코드이다.

```js
let promise = new Promise((resolve, reject) => {
  throw new Error("boom!");
});

promise.catch((err) => {
  console.log(err.message); // boom
});

let promise2 = new Promise((resolve, reject) => {
  try {
    throw new Error("boom!");
  } catch(e) {
    reject(e);
  }
});

promise2.catch((err) => {
  console.log(err.message); // boom
});
```

## 전역 프로미스 실패 처리
* 프로미스가 실패 핸들러 없이 실패했을 때 에러를 식별할 수 없게 되는 암묵적인 실패를 갖게 된다. 이런 부분은 큰 문제가 되었다.
    * 프로미스가 언제 처리될 것인지 정확하게 알기 힘들기 때문이다.

### Node.js 실패 처리
* `unhandledRejection`: 프로미스가 실패하고 같은 이벤트 루프 턴에서 실패 핸들러가 호출되지 않으면 발생한다.
  * 인자로 실패 이유, 실패한 프로미스가 전달 된다.

```js
let rejected;
process.on('unhandledRejection', (reason, promise) => {
  console.log(reason.message); // boom
  console.log(promise === rejected); // true
});

rejected = Promise.reject(new Error('boom'));
// 실패한 프로미스를 생성한 후 unhandledRejection 이벤트를 구독한다. 
```

* `rejectionHandled`: 프로미스가 실패하고 이벤트 루프 턴 이후 실패 핸들러가 호출되면 발생한다.

```js
let rejected;

process.on("rejectionHandled", (promise) => {
  console.log(rejected === promise); // true
});

rejected = Promise.reject(new Error("boom"));

setTimeout(function() {
  rejected.catch((value) => {
    console.log(value.message); // boom
  });
}, 1000);

// rejectionhandled는 실패 핸들러가 최종적으로 호출 되었을 때 발생한다.
```

* 처리되지 않을 가능성이 있는 실패를 추적하려면 두 이벤트를 섞어 적절하게 사용해 줘야 한다.

```js
let possiblyUnhandledRejections = new Map();

process.on("unhandledRejection", (reason, promise) => {
  possiblyUnhandledRejections.set(promise, reason);
  // 실패 이유를 MAP에 저장한다.
});

process.on("rejectionHandled", (promise) => {
  possiblyUnhandledRejections.delete(promise);
  // Map에서 처리된 프로미스가 제거된다.
});

setInterval(() => {
  possiblyUnhandledRejections.forEach((reason, promise) => {
    console.log(reason.message ? reason.message : reason);

    handledRejection(promise, reason);
  });  
  possiblyUnhandledRejections.clear();
}, 600);
```

### 브라우저 실패 처리
* `unhandledrejection`: 프로미스가 실패하고 같은 이벤트 루프 턴에서 실패 핸들러가 호출되지 않으면 발생
* `rejectionhandled`: 이벤트 루프의 턴 이후 실패 핸들러가 호출되면 발생

```js
let rejected;
window.onunhandledrejection = (event) => {
	console.log(event.type); // 이벤트의 이름(unhandledrejection이나 rejectionhandled)
	console.log(event.reason.message); // 프로미스로 부터 받은 실패 이유
	console.log(rejected === event.promise); // 실패한 프로미스 객체
}

window.onrejectionhandled = (event) => {
	console.log(event.type); // 이벤트의 이름(unhandledrejection이나 rejectionhandled)
	console.log(event.reason.message); // 프로미스로 부터 받은 실패 이유
	console.log(rejected === event.promise); // 실패한 프로미스 객체
}

rejected = Promise.reject(new Error("boom"));
```

* 브라우저에서 처리되지 않은 실패를 추적하는 코드는 노드 js 와 비슷하다.

```js
let possiblyUnhandledRejections = new Map();

window.onunhandledrejection = function(event) {
	possiblyUnhandledRejections.set(event.promise, event.reason);
};

window.onrejectionhandled = function(event) {
	possiblyUnhandledRejections.delete(event.promise);
};

setInterval(function() {
	possiblyUnhandledRejections.forEach(function(reason, promise) {
		console.log(reason.message ? reason.message : reason);

		handleRejection(promise, reason); // 실패 처리 로직
	});

	possiblyUnhandledRejections.clear();
}, 60000);
```

## 프로미스 연결하기
* 각 `then()`이나 `catch()` 호출은 또 다른 프로미스를 만들어 반환한다.

```js
let p1 = new Promise((resolve, reject) => {
  throw new Error("boom");
});

let p2 = p1.then((value) => {
  console.log(value);
}).catch((err) => {
  console.log(err.message); // boom
});
```

* 프로미스 연결 마지막에 실패 핸들러를 추가하면 어떤 발생가능한 에러든 적절하게 처리되는 것을 항상 보장할 수 있다.

### 값 반환하기
* return 으로

```js
let p1 = new Promise((resolve, reject) => {
  resolve(10);
});

let p2 = p1.then((value) => {
  console.log(value); // 10 
  return value + 1;
}).then((value) => {
  console.log(value); // 11
}).catch((err) => {
  console.log(err.message);
});
```

### 프로미스 연결해서 프로미스 반환하기

```js
let p1 = new Promise((resolve, reject) => {
  resolve(42);
});

let p2 = new Promise((resolve, reject) => {
  reject(43);
});

p1.then(function(value) {
  console.log(value); //42
  return p2;
}).then(function(value) {
  console.log(value);
}).catch(function(value) {
  console.log(value); // 43
});
```

## 여러 개의 프로미스에 응답하기
### `Promise.all()`
관리할 프로미스들의 이터러블 인자 하나를 받고 처리된 프로미스 하나를 반환한다. 
* 프로미스 결과와 처리된 프로미스의 순서가 일치된다
* 만약 실패할 경우 다른 프로미스가 완료되길 기다리지 않고 즉시 실패한다.

```js
let p1 = Promise.resolve(42);

let p2 = new Promise((resolve, reject) => {
  resolve(43);
});

let p3 = new Promise((resolve, reject) => {
  resolve(44);
});

let p4 = Promise.all([p1, p2, p3]);

p4.then((value) => {
  console.log(value); // [42, 43, 44]
});
```

### `Promise.race()`
프로미스의 이터러블을 받고 프로미스 하나를 반환한다. 하지만 첫번째 프로미스가 확정되자 마자 확정된다.

```js
let p1 = Promise.resolve(42);

let p2 = new Promise((resolve, reject) => {
  resolve(43);
});

let p3 = new Promise((resolve, reject) => {
  resolve(44);
});

let p4 = Promise.race([p1, p2, p3]);

p4.then((value) => {
  console.log(value); // 42
});
```

## 프로미스 상속하기

```js
class MyPromise extends Promise {
  success(resolve, reject) {
    return this.then(resolve, reject);
  }

  failure(reject) {
    return this.catch(reject);
  }
}

let pr = new MyPromise((resolve, reject) => {
  resolve(42);
});

pr.success(value => {
  console.log(value); // 42
}).failure(err=> {
  console.log(err.message);
});
```

다음처럼 resolve, reject 뿐만 아니라 race, reject, all 등 또한 함께 사용할 수 있다.
* resolve()와 reject()의 반환 타입을 바꾸려면 Symbol.species프로퍼티를 이용하여 바꿀 수 있다. 

## 프로미스 기반 비동기 작업 시작
* https://developers.google.com/web/fundamentals/primers/promises?hl=ko#_2