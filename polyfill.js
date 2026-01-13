// Polyfill for Array.prototype.toReversed (Node.js 18 compatibility)
if (!Array.prototype.toReversed) {
  Array.prototype.toReversed = function() {
    return this.slice().reverse();
  };
}
