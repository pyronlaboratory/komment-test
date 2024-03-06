function Person() {
  const self = this;
  self.age = 0;

  setInterval(function growUp() {
    self.age++;
  }, 1000);
}


const getCode = (function () {
  const apiCode = "0]Eal(eh&2";

  return function () {
    return apiCode;
  };
})();

console.log(getCode());

