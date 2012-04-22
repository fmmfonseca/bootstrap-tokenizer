(function ($) {
  "use strict";
  
  var Tokenizer = function (element, options) {
    this.$originalElement = $(element);
    this.options = $.extend({}, $.fn.tokenizer.defaults, options);
    this.initialize();
  }
  
  , List = function (tokenizer, maxWidth) {
    this.maxWidth = maxWidth;
    this.initialize();
  }
  
  , Label = function (tokenizer, name) {
    this.tokenizer = tokenizer;
    this.initialize(name);
  }
  
  , TextMeter = (function () {
    var $element = $('<span></span>')
      .css('position', 'absolute')
      .css('left', '-1000px')
      .css('top', '-1000px')
      .css('visibility', 'hidden')
      .appendTo('body');
    
    return {
      width: function (text) {
        $element.text(text);
        var value = $element.width();
        $element.text('');
        return value;
      }
    };
  }())
  
  , Input = function (tokenizer) {
    this.tokenizer = tokenizer;
    this.minWidth = TextMeter.width('@') + 1;
    this.initialize();
  };
  
  Tokenizer.prototype = {
    
    constructor: Tokenizer
    
    , initialize: function () {
        var maxWidth = this.$originalElement.width();
        this.input = new Input(this);
        this.list = new List(this, maxWidth)
          .add(this.input);
        this.$originalElement.hide();
        this.$element = $('<div class="tokenizer"></div>')
          .width(maxWidth)
          .append(this.list.$element)
          .on('click', $.proxy(this.handleClick, this))
          .insertAfter(this.$originalElement);
        this.addLabels(this.$originalElement.val().split(this.options.separator));
    }
    
    , addLabel: function (value) {
        if (value) {
          var obj = new Label(this, value)
          , index = this.list.indexOf(this.input);
          this.list.add(obj, index).adjust();
          this.updateOriginalElement();
        }
    }
    
    , addLabels: function (values) {
        for (var index in values) { 
          this.addLabel(values[index]);
        }
    }
    
    , removeLabel: function (obj) {
        if (obj) {
          this.list.remove(obj).adjust();
          this.updateOriginalElement();
        }
    }
    
    , removeLastLabel: function () {
        var obj = this.list.getPreceding(this.input);
        this.removeLabel(obj);
    }
    
    , updateOriginalElement: function () {
        this.$originalElement.attr('value', this.list.values().join(this.options.separator));
    }
    
    , handleClick: function (event) {
        this.input.$element.trigger('focus');
    }
    
    , setFocus: function (enable) {
        if (enable) { 
          this.$element.addClass('focused');
        }
        else {
          this.$element.removeClass('focused');
        }
    }
  };
  
  List.prototype = {
    
    constructor: List
    
    , initialize: function () {
        this.$element = $('<ul></ul>')
          .css('position', 'relative');
        this.items = [];
        this.views = [];
    }
    
    , move: function (value) {
         this.$element.css('left', -1 * value + "px");
    }
    
    , adjust: function () {
        var surplus = this.$element.width() - this.maxWidth;
        if (surplus > 0) {
          this.move(surplus);
        } else {
          this.move(0);
        }
    }
    
    , indexOf: function (item) {
        return $.inArray(item, this.items);
    }
    
    , add: function (item, index) {
        var view = $('<li></li>').append(item.$element);
        if (index >= 0) {
          view.insertBefore(this.views[index]);
          this.items.splice(index, 0, item);
          this.views.splice(index, 0, view);
        } else {
          this.$element.append(view);
          this.items.push(item);
          this.views.push(view);
        }
        return this;
    }
    
    , remove: function (item) {
        var index = $.inArray(item, this.items);
        if (index >= 0) {
          var item = this.items.splice(index, 1);
          var view = this.views.splice(index, 1);
          view[0].remove();
        }
        return this;
    }
    
    , getPreceding: function (item) {
        return this.items[$.inArray(item, this.items) - 1];
    }
    
    , values: function () {
        return $.map(this.items, function (i){ return i.value });
    }
  };
  
  Label.prototype = {
    
    constructor: Label
    
    , initialize: function (value) {
        this.value = value;
        this.$icon = $('<i class="icon-remove icon-white"></i>')
          .on('click', $.proxy(this.handleRemoveCLick, this));
        this.$element = $('<span class="label"></span>')
          .append(value)
          .append(this.$icon);
    }
    
    , element: function () {
        return this.$element;
    }
    
    , setFocus: function (enabled) {
        if (enabled) {
          this.$element.addClass('label-focus');
        } else {
          this.$element.removeClass('label-focus');
        }
    }
    
    , hasFocus: function () {
        return this.$element.hasClass('label-focus');
    }
    
    , handleRemoveCLick: function (event) {
        this.tokenizer.removeLabel(this);
    }
  };
    
  Input.prototype = {
    
    constructor: Input
    
    , initialize: function () {
        this.$element = $('<input type="text"/>')
          .css('width', this.minWidth + 'px')
          .on('click', $.proxy(this.handleClick, this))
          .on('focus', $.proxy(this.handleFocus, this))
          .on('blur', $.proxy(this.handleBlur, this))
          .on('keydown', $.proxy(this.handleKeydown, this))
          .on('keyup', $.proxy(this.handleKeyup, this));
    }
    
    , adjust: function () {
        var width = TextMeter.width(this.$element.val()) + this.minWidth;
        this.$element.width(width);
        this.tokenizer.list.adjust();
    }
    
    , isEmpty: function () {
        return !this.$element.val();
    }
    
    , clearValue: function () {
        var value = this.$element.val();
        this.$element.val('');
        return value;
    }
    
    , handleClick: function (event) {
        event.stopPropagation();
    }
    
    , handleFocus: function (event) {
        this.tokenizer.setFocus(true);
    }
    
    , handleBlur: function (event) {
        this.tokenizer.addLabel(this.clearValue());
        this.tokenizer.setFocus(false);
    }
    
    , handleKeydown: function (event) {
        if ($.inArray(event.keyCode, this.tokenizer.options.delimiters) > -1) {
          event.stopPropagation();
          event.preventDefault();
          this.tokenizer.addLabel(this.clearValue());
        }
        else if (event.keyCode === 8 && this.isEmpty()) {
          this.tokenizer.removeLastLabel();
        }
        this.adjust();
    }
    
    , handleKeyup: function (event) {
        this.adjust();
    }
  };
  
  /* TOKENIZER PLUGIN DEFINITION
  * =========================== */

  $.fn.tokenizer = function ( option ) {
    return this.each(function (){
      var $this = $(this)
      , data = $this.data('tokenizer')
      , options = typeof option == 'object' && option;
      if (!data) {
        $this.data('tokenizer', (data = new Tokenizer(this, options)));
      }
      if (typeof option == 'string') {
        data[option]();
      }
    });
  };

  $.fn.tokenizer.defaults = {
    separator: ','
    , delimiters: [13, 32, 188] // [enter, space, comma]
  };

  $.fn.tokenizer.Constructor = Tokenizer;
  
  /* TOKENIZER DATA-API
  * ================== */
  
  $(function () {
    $('input[data-provide="tokenizer"]').each(function () {
      var $element = $(this);
      $element.tokenizer($element.data());
    });
  });
})(window.jQuery);