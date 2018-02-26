( function(){

  'use strict';

  class Form {
      constructor(rules) {
        this._rules = rules;
        this._errorMessages = [];
        this._fieldsToStopValidating = [];
        this._isValidateCalled = false;
        this._customErrorMessages = null;
        this._errorMessagesForEachField = {};
        this._currentlyEnvokedMethod = '';
        this._regexForReplacingValues = /{{\s?value\s?}}/;

        Object.keys(rules).forEach(field => this._errorMessagesForEachField[field] = []);

        return this;
      }

      bindValues(formValues) {
        const
          allowedRulesType = ['[object Object]','[object String]'],
          rulesType        = Object.prototype.toString.call(formValues);

        if ( !allowedRulesType.includes(rulesType) ) {
          throw new Error('Rules must be of type string or object');
        }

        this._formValues = rulesType === '[object Object]'
          ? formValues
          : this._getFormValuesFromForm(formValues);

        return this;
      }

      setCustomErrorMessages(messagesObj) {
        const allowedRulesType = ['[object Array]','[object String]'];

        for ( const field of Object.keys(messagesObj) ) {
          const rulesType = Object.prototype.toString.call(messagesObj[field]);

          if ( !allowedRulesType.includes(rulesType) ) {
            throw new Error('Rules must be of type string or array');
          }
        }

        this._customErrorMessages = messagesObj;

        return this;
      }

      _getFormValuesFromForm(formSelector) {
        const form = document.querySelector(formSelector);

        if ( !form ) throw new Error(`Form with selector ${ formSelector } wasn't found on the page...`);

        const
          inputFields = document.querySelectorAll(formSelector + ' [name]'),
          formData     = {};

        for ( const inputField of inputFields ) {
          if ( inputField.name ) {
            formData[inputField.name] = inputField.value;
          }
        }

        return formData;
      }

      _compileErrorString(field,error) {
        return error.replace(this._regexForReplacingValues,this._formValues[field]);
      }

      _pushError(field,error) {
        if (
          this._fieldsToStopValidating.includes(field) &&
          this._errorMessagesForEachField[field].length > 0
        ) { return; }

        const pushError = (error) => {
          error = this._compileErrorString(field,error);

          this._errorMessages.push(error);
          this._errorMessagesForEachField[field].push(error);
        }

        if ( !this._customErrorMessages || !this._customErrorMessages[field] ) {
          return pushError(error);
        }

        if ( typeof this._rules[field] === 'function' ) {
          const errorIsString = typeof this._customErrorMessages[field] === 'string';

          if ( !errorIsString ) {
            console.info('You have to provide string as custom error message when using function validation!');
          }

          return pushError(errorIsString ? this._customErrorMessages[field] : error);
        }

        for ( const [,value] of Object.entries(this._customErrorMessages[field]) ) {
          const [ method,errorMessage ] = value;

          if ( method === this._currentlyEnvokedMethod ) {
            return pushError(errorMessage);
          }
        }

        return pushError(error);
      }

      validate() {
        this._isValidateCalled = true;

        for ( const field of Object.keys(this._rules) ) {
          if ( typeof this._rules[field] === 'function' ) {
            this._currentlyEnvokedMethod = 'custom';
            this.custom(field,this._rules[field]);

            continue;
          }

          for ( const rule of this._rules[field].split('|') ) {
            const [ method,...params ] = rule.split(':');

            if ( typeof this[method] === 'function' ) {
              this._currentlyEnvokedMethod = method;
              this[method](field,...params);
            } else {
              throw new Error(`Rule you specified "${ method }" doesn't exist...`);
            }
          }
        }

        return this;
      }

      custom(field,fn) {
        const isValidField = fn(this._formValues[field]);

        if ( isValidField !== true && isValidField !== false ) {
          throw new Error('Custom function validation have to return boolean value...');
        }

        if ( isValidField === false ) {
          this._pushError(field,`Field ${ field } is not properly formated...`);
        }
      }

      bail(field) {
        this._fieldsToStopValidating.push(field);
      }

      regex(field,regexString,flags = '') {
        const regex = new RegExp(regexString,flags);

        if ( !regex.test(this._formValues[field]) ) {
          this._pushError(field,`Value for ${ field } is not properly formated...`);
        }
      }

      inlist(field,listString) {
        if ( !listString.split(',').includes(this._formValues[field]) ) {
          this._pushError(field,`Value for ${ field } is not in list of acceptable choices...`);
        }
      }

      equals(field,param) {
        if ( this._formValues[field] !== param ) {
          this._pushError(field,`Value for ${ field } must be exactly ${ param }`);
        }
      }

      required(field) {
        if ( this._formValues[field] === undefined || this._formValues[field] === '' ) {
          this._pushError(field,`Field ${ field } is required`);
        }
      }

      maxlength(field,param) {
        param = Number(param);

        if ( isNaN(param) ) throw new Error(`Param for field ${ field } is not a number...`);

        if ( this._formValues[field].length > param ) {
          this._pushError(field,`Value for field ${ field } can not be greater than ${ param }`);
        }
      }

      minlength(field,param) {
        param = Number(param);

        if ( isNaN(param) ) {
          throw new Error(`Param for field ${ field } is not a number...`);
        }

        if ( this._formValues[field].length < param ) {
          this._pushError(field,`Value for field ${ field } can not be less than than ${ param }`);
        }
      }

      getErrorsAsUL(ULClass,LIClass) {
        return [
          `<ul class="${ ULClass }">`,
          ...this._errorMessages.map(e => `<li class="${ LIClass }">${ e }</li>`),
          '</ul>'
        ].join('');
      }

      isValid() {
        return this._isValidateCalled && this._errorMessages.length === 0;
      }

      errorMessages() {
        return this._errorMessages;
      }

      getErrorsForField(field) {
        return this._errorMessagesForEachField[field];
      }
    }

    window.Form = Form;

}());