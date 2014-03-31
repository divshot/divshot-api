module.exports = function () {
  return this.resource('vouchers', {
    redeem: function (code) {
      return this.one(code).one('redeem').put();
    }
  });
};