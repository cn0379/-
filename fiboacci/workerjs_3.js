/*
 * @Author: your name
 * @Date: 2021-06-17 08:06:59
 * @LastEditTime: 2021-06-18 10:09:46
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: \fiboacci\workerjs_1.js
 */
function Fib1(n) {
  if (n == 1 || n == 2) {
    return 1;
  }
  return Fib1(n - 1) + Fib1(n - 2);
}
console.time('执行时间');
Fib1(43)
console.timeEnd('执行时间');

self.addEventListener('message', function (e) {
  console.log(e.data);
  self.postMessage('You said: ' + e.data);
  self.close()
}, false);