( function(){

  'use strict';

  class LinQ {
    constructor(items) {
      this.items = items;
    }

    get() {
      return this.items;
    }

    orderBy(fn) {
      this.items = this.items.sort(fn);

      return this;
    }

    select(fn) {
      this.items = this.items.map(fn);

      return this;
    }

    where(fn) {
      this.items = this.items.filter(fn);

      return this;
    }

    count(fn) {
      if ( fn ) {
        return this.where(fn).items.length;
      } else {
        return this.items.length;        
      }
    }

    first() {
      return this.items.length > 0 ? this.items[0] : null;
    }

    firstOrDefault(dft) {
      return this.first() || dft;
    }
  }

}());

