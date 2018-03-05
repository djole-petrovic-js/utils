( function(){

  'use strict';

  const attempt = (fn) => {
    return async (...args) => {
      try {
        const result = await fn(...args);

        return [null,result];
      } catch(e) {
        return [e,null];
      }
    }
  }

  window.attempt = attempt;

}());