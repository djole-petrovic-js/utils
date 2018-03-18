( function(){

  'use strict';

  const replace = (str,values) => {
    if ( !str ) {
      throw new Error('You have to at least provide string to be replaced...');
    }

    if ( !values ) {
      return replace.bind(null,str);
    }

    const iterator = Array.isArray(values) ? values : Object.keys(values);

    const callback = Array.isArray(values)
      ? x => str = str.replace(/\?/,x)
      : key => str = str.replace(new RegExp(':' + key),values[key])

    iterator.forEach(callback);

    return str;
  }

  window.replace = replace;

}());