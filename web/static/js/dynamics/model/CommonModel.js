/*
 * Abstract common model for dynamics inheritance
 */

var CommonModel = function() {
  
};

CommonModel.prototype.reload = function() {
  throw "Abstract method called";
};

