( function(){

  'use strict';

  const replace = (str,values,fn) => {
    if ( !str ) {
      throw new Error('You have to at least provide string to be replaced...');
    }

    if ( !values ) {
      return replace.bind(null,str);
    }

    const isArray = Array.isArray(values);

    const iterator = isArray ? values : Object.keys(values);

    if ( str.match(/(\?|:(\w)+)/g).length !== iterator.length ) {
      throw new Error('Invalid number of parameters given.');
    }

    const callback = isArray
      ? x   => str = str.replace(/\?/,fn ? fn(x) : x)
      : key => str = str.replace(new RegExp(':' + key),fn ? fn(values[key]) : values[key])

    iterator.forEach(callback);

    return str;
  }
  
  window.replace = replace;

}());