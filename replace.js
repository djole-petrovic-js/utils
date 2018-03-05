( function(){

  'use strict';

  const replace = (str) => {
    return (values) => {
      const keys = Object.keys(values);

      for ( const key of keys ) {
        let regex,replaceWith;

        if ( Object.prototype.toString.call(values) === '[object Array]' ) {
          regex = /\?/g;
          replaceWith = key;
        } else {
          regex = new RegExp(':' + key);
          replaceWith = slug => values[key];
        }

        str = str.replace(regex,replaceWith);
      }

      return str;
    }
  }

  window.replace = replace;

}());