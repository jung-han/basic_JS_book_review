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
function substract(num1, num2) {
  return num1 - num2;
}
export {substract}; // 위에서 정의한 함수를 export