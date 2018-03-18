( function(){

  'use strict';

  const replace = (str,values) => {
    if ( !str ) {
      throw new Error('You have to at least provide string to be replaced...');
    }

    if ( !values ) {
      return replace.bind(null,str);
    }

    if ( Array.isArray(values) ) {
      values.forEach(x => str = str.replace(/\?/,x));
    } else {
      Object.keys(values).forEach(
        key => str = str.replace(new RegExp(':' + key),values[key])
      );
    }

    return str;
  }

  window.replace = replace;

}());