/**
 * @description defines a variable `self` that increments its age by 1 every 1000
 * milliseconds through a setInterval callback function.
 */
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

const pet = function (name) {
  const getName = function () {
    return name;
  };
  return getName;
};
const myPet = pet("Vivie");

console.log(myPet());


