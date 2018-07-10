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

```js

```

### 확정 프로미스 만들기