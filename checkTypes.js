( function(){

  'use strict';

  const getObjectType = x => Object.prototype.toString.call(x);

  const getStringId = ruleStr => {
    switch (ruleStr) {
      case 'string'   : { return '[object String]'; }
      case 'number'   : { return '[object Number]'; }
      case 'boolean'  : { return '[object Boolean]'; }
      case 'object'   : { return '[object Object]'; }
      case 'array'    : { return '[object Array]'; }
      case 'regex'    : { return '[object RegExp]'; }
      case 'function' : { return '[object Function]'; }
      case 'any'      : { return '[object Any]'; }
      default         : { return null; } 
    }
  }

  const checkTypes = (typesArray,fn) => {
    typesArray = typesArray.map(x => {
      const rule = {
        rules:[],
        optional:false,
        multipleRules:[]
      };

      if ( x[x.length -1] === '?' ) {
        rule.optional = true;
        x = x.slice(0,x.length - 1);
      }
      
      if ( x.match(/\((.*?)\)/i) ) {
        x = x.slice(1,x.length -1);
      }

      for ( let ruleStr of x.split('|') ) {
        let finalRule;

        if ( ruleStr.match(/<(.*?)>/) ) {
          const originalType = ruleStr.split('<')[0];

          if ( !['array','object'].includes(originalType) ) {
            throw new Error('Not suported multiple rules type ' + originalType);
          }

          const subTypes = ruleStr.slice(
            ruleStr.indexOf('<') + 1,
            ruleStr.lastIndexOf('>')
          );

          if ( !getStringId(subTypes) && originalType !== 'object' ) {
            throw new Error('Incorrect subtypes type : ' + subTypes);
          }

          rule.multipleRules.push({
            originalType:getStringId(originalType),
            subTypes:originalType === 'array' ? getStringId(subTypes) : JSON.parse(subTypes)
          });

          ruleStr = originalType;
        }

        finalRule = getStringId(ruleStr);

        if ( !finalRule ) {
          throw new Error('unknown type ' + ruleStr)
        }

        rule.rules.push(finalRule);
      }
      
      return rule;
    });

    return (...args) => {
      const requiredArguments = typesArray.reduce((total,item) => {
        if ( !item.optional ) total++ ; return total;
      },0);

      if ( requiredArguments > args.length ) {
        throw new Error('Incorrect number of arguments');
      }

      const argsTypes = args.map(getObjectType);

      for ( const index of Object.keys(typesArray) ) {
        if ( typesArray[index].optional ) {
          if ( args[index] === undefined || args[index] === null ) {
            continue;
          }
        }

        if ( typesArray[index].rules.includes('[object Any]') ) {
          continue;
        }

        if ( !typesArray[index].rules.includes(argsTypes[index]) ) {
          throw new Error('Incorrect parameter type for ' + args[index]);
        }

        if ( typesArray[index].multipleRules.length > 0 ) {
          let argFailed = null,passed = false;

          for ( const { originalType,subTypes } of typesArray[index].multipleRules ) {
            if ( originalType !== getObjectType(args[index]) ) {
              continue;
            }

            if ( originalType === '[object Object]' ) {
              console.warn('Not implemented Yet...');
              passed = true;
              continue;
            }

            if ( args[index].every(x => getObjectType(x) === subTypes) ) {
              passed = true;
              break;
            } else {
              if ( !argFailed ) argFailed = args[index];
            }
          }

          if ( !passed ) {
            throw new Error('Argument is not properly formated... ' + argFailed);
          }
        }
      }

      return fn(...args);
    }
  }

  window.checkTypes = checkTypes;

}());