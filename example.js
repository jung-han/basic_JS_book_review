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
})