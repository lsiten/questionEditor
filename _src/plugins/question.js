/**
 * 问题插入插件
 * @question
 * @since 1.2.6.1
 */
var questionFactiory= function (cfg, type) {
  this.type = type || 1;
  this.data = cfg || {};
  this.id =  ('lsiten_'+Math.random()).replace('.','_');
  
  this.$el = document.createElement('div');
  this.$el.id = this.id;
  this.$el.tabIndex = 1;

  this.$header = document.createElement('div');
  this.$header.id = this.id + '_head';

  this.$body = document.createElement('div');
  this.$body.id = this.id + '_body';

  this.options = [];


  this.emptyBox = document.createElement('div');
  this.emptyBox.innerHTML = '<尚未选择> 参考答案用于系统自动阅卷，不会显示在答卷上';
  this.emptyBox.style.color = '#bfbfbf';


  this.answerArr = [];
  this.placeholders = [];
}

questionFactiory.prototype = {
  constructor: questionFactiory,
  init: function () {
    this.$el.contentEditable = 'false';
    this.initElStyle();
    this.initDoms();
    this.initEvent();
    this.$el.appendChild(this.$header);
    this.$el.appendChild(this.$body);
  },
  keyMaps: [
    'A', 'B', 'C', 'D', 'E', 'F',
    'G', 'H', 'I', 'J', 'K', 'L',
    'M', 'N', 'O', 'P', 'Q', 'R',
    'S', 'T', 'U', 'V', 'W', 'X',
    'Y', 'Z'
  ],
  initEvent: function() {
    var _this = this;
    domUtils.on(this.$el, 'focus', function(evt) {
      _this.editor.currentQuestion = _this;
    })
    domUtils.on(this.$el, 'keyup', function(evt) {
      var keyCode = evt.keyCode || evt.which;
      if (
        keyCode === 13 &&
        !evt.ctrlKey &&
        !evt.metaKey &&
        !evt.shiftKey &&
        !evt.altKey
      ) {

      }
    })

    // 单选多选题事件
    if (this.type === 1 || this.type === 2) {
      domUtils.on(this.$el, 'keydown', function(evt) {
        var keyCode = evt.keyCode || evt.which;
        // 回车键处理
        if (
          keyCode === 13 &&
          !evt.ctrlKey &&
          !evt.metaKey &&
          !evt.shiftKey &&
          !evt.altKey
        ) {
  
          var optionLenght = _this.options.length;
          var item = {
            inContent: "",
            inOpNum: _this.keyMaps[optionLenght],
            inSort: (optionLenght + 1)
          }
          _this.data.OptList.push(item);
          _this.$optionBox.appendChild(_this.addOption(item, false));
          evt.stopImmediatePropagation();
          domUtils.preventDefault(evt);
        }
        // 回退键
        if (
          keyCode === 8 &&
          !evt.ctrlKey &&
          !evt.metaKey &&
          !evt.shiftKey &&
          !evt.altKey
        ) {
          if(_this.options.length > 1) {
            var sort = evt.target.getAttribute('data-sort');
            var options = _this.data.OptList;
            var deletePnum = _this.keyMaps[sort-1];
            _this.answerArr = _this.answerArr.filter(function(item, key) {
              return item != deletePnum;
            })
  
            options.splice((sort-1), 1);
            _this.options = [];
  
            _this.$optionBox.innerHTML = '';
            // 暂存更新后的答案
            var nowAnswerArr = [];
            utils.each(options, function(item, key) {
              var oPnum = item.inOpNum;
              var checked = _this.answerArr.indexOf(oPnum) > -1;
              item.inSort = key + 1;
              item.inOpNum = _this.keyMaps[key];
              checked && nowAnswerArr.push(item.inOpNum);
              _this.$optionBox.appendChild(_this.addOption(item, checked));
            })
  
            _this.answerArr = nowAnswerArr;
            if (_this.answerArr.length > 0) {
              _this.data.inAnswer = _this.answerArr.join(',');
              _this.$answerContent.innerHTML = _this.data.inAnswer;
            } else {
              _this.$answerContent.innerHTML = '';
              _this.data.inAnswer = '';
              _this.$answerContent.appendChild(_this.emptyBox);
            }
  
            evt.stopImmediatePropagation();
            domUtils.preventDefault(evt);
          }
        }
      })
    }
  },
  initDoms: function () {
    this.generateHeader();
    this.generateBody();
  },
  // 初始化el的样式
  initElStyle: function() {
    this.$el.style.width = '100%';
    this.$el.style.lineHeight = '20px';
    this.$el.style.border = '1px solid #efefef';
    this.$el.style.borderRadius = '3px';
  },
  // 根据不同类型题目生成不同的头部
  generateHeader: function() {
    var editorBox = document.createElement('div');
    editorBox.contentEditable = true;
    editorBox.style.lineHeight = '20px';
    editorBox.style.padding= '10px';
    editorBox.style.outline = 'none';
    editorBox.style.borderBottom = '1px solid #efefef';
    editorBox.style.flex = '1';
    var _this = this;
    domUtils.on(editorBox, 'input', function() {
      var value = this.innerHTML;
      _this.data.inQuTitle = value;
    })
    var pNumDom = document.createElement('div');
    pNumDom.style.width = '40px';
    pNumDom.style.lineHeight = '40px';
    pNumDom.style.textAlign = 'center';
    pNumDom.innerHTML = this.data.inSort + '、';
    this.$header.style.display = 'flex';
    this.$headerEditorBox = editorBox;
    this.$header.appendChild(pNumDom);
    this.$header.appendChild(editorBox);
  },

 // 根据不同的类型题目生成不同的body 
  generateBody: function() {

    var _this = this;
    this.$body.style.padding = '10px';
    var answerBox = document.createElement('div');
    answerBox.style.borderTop = '1px solid #efefef';
    answerBox.style.marginTop = '10px';
    answerBox.style.padding = '10px';
    answerBox.style.display = 'flex';
    var label = document.createElement('div');
    label.innerHTML = '参考答案：';
    label.style.width = '100px';
    label.style.height = '20px';
    label.style.lineHeight = '20px';
    label.style.textAlign = 'center';
    

    var answerContent = document.createElement('div');
    answerContent.style.flex = '1';

    answerBox.appendChild(label);
    answerBox.appendChild(answerContent);
    switch(parseInt(this.type)) {
      case 1:
      case 2:
      this.generateOptions();
      var answer = this.data.inAnswer;
      if (answer.length < 1) {
        answerContent.appendChild(this.emptyBox);
      }

      break;
      case 3:
      this.generateJudgeOption();
      var answer = this.data.inAnswer;
      if (answer.length < 1) {
        answerContent.appendChild(this.emptyBox);
      }
      break;
      case 4:
      answerBox.style.marginTop = '0';
      answerBox.style.borderTop = 'none';
      this.emptyBox.innerHTML = '<尚未加空> 参考答案用于系统自动阅卷，不会显示在答卷上';
      var answer = this.data.inAnswer;
      if (answer.length < 1) {
        answerContent.appendChild(this.emptyBox);
      }
      break;
      case 5:
      answerBox.style.marginTop = '0';
      answerBox.style.borderTop = 'none';
      var answerEditorBox = document.createElement('div');
      answerEditorBox.contentEditable = true;
      answerEditorBox.style.width = '100%';
      answerEditorBox.style.outline = 'none';
      domUtils.on(answerEditorBox, 'input', function() {
        var value = this.innerHTML;
        _this.data.inAnswer = value;
      })
      answerContent.appendChild(answerEditorBox);
      break;
    }
    this.$answerContent = answerContent;
    this.$body.appendChild(answerBox);
  },
  // 生成判断题选项
  generateJudgeOption: function () {
    var optionBox =document.createElement('div');
    var _this = this;
    optionBox.className = 'optionsBox';
    var optionRight = document.createElement('div');
    optionRight.style.display = 'inline-block';
    optionRight.style.marginLeft = '10px';
    var radioRight = document.createElement('input');
    radioRight.type ='radio';
    radioRight.name = this.id + 'box';
    rightText = document.createElement('div');
    rightText.style.display = 'inline-block';
    rightText.style.padding = '5px';
    rightText.innerHTML = '对';
    rightText.style.cursor = 'pointer';

    optionRight.appendChild(radioRight);
    optionRight.appendChild(rightText);
    var optionError = document.createElement('div');
    optionError.style.display = 'inline-block';
    optionError.style.marginLeft = '10px';
    var radioError = document.createElement('input');
    radioError.type ='radio';
    radioError.name = this.id + 'box';

    ErrorText = document.createElement('div');
    ErrorText.style.display = 'inline-block';
    ErrorText.style.padding = '5px';
    ErrorText.innerHTML = '错';
    ErrorText.style.cursor = 'pointer';



    domUtils.on(radioRight, 'click', function(evt) {
      if(this.checked) {
        _this.data.inAnswer = '对';
        _this.$answerContent.innerHTML = _this.data.inAnswer;

      }
    })

    domUtils.on(rightText, 'click', function(evt) {
      radioRight.checked = true;
      radioError.checked = false;
      _this.data.inAnswer = '对';
      _this.$answerContent.innerHTML = _this.data.inAnswer;
    })

    domUtils.on(radioError, 'click', function(evt) {
      if(this.checked) {
        _this.data.inAnswer = '错';
        _this.$answerContent.innerHTML = _this.data.inAnswer;

      }
    })

    domUtils.on(ErrorText, 'click', function(evt) {
      radioRight.checked = false;
      radioError.checked = true;
      _this.data.inAnswer = '错';
      _this.$answerContent.innerHTML = _this.data.inAnswer;
    })

    optionError.appendChild(radioError);
    optionError.appendChild(ErrorText);

    optionBox.appendChild(optionRight);
    optionBox.appendChild(optionError);

    this.$body.appendChild(optionBox);
  },
  // 生成选项 
  generateOptions: function() {
    var optionBox =document.createElement('div');
    optionBox.className = 'optionsBox';
    var options = this.data.OptList;
    var _this = this;
    utils.each(options, function(item, key) {
      item.inSort = item.inSort ? item.inSort : 1;
      item.inOpNum = item.inOpNum ? item.inOpNum : _this.keyMaps[item.inSort-1];
      var checked = _this.answerArr.indexOf(item.inOpNum) > -1;
      optionBox.appendChild(_this.addOption(item, checked));
    })
    this.$optionBox = optionBox;
    this.$body.appendChild(optionBox);
  },
  // 生成单个选项
  addOption: function(data, checked) {
    var optionItem = document.createElement('div');
    optionItem.style.width = '100%'
    optionItem.style.display = 'flex';
    var type = parseInt(this.type) === 1 ? 'radio' : 'checkbox';
    var inPnumDom = document.createElement('div');
    inPnumDom.style.width = '20px';
    inPnumDom.style.height = '20px';
    inPnumDom.style.lineHeight = '20px';
    inPnumDom.style.textAlign = 'center';
    inPnumDom.innerHTML = data.inOpNum;

    var input = document.createElement('input');
    input.type = type;
    input.style.width = '15px';
    input.style.height = '15px';
    input.name = this.id + 'box';
    checked && (input.checked = true);

    var _this = this;
    domUtils.on(input, 'click', function(evt) {
      if(this.checked) {
        type === 'radio' ? _this.answerArr=[data.inOpNum] :_this.answerArr.push(data.inOpNum);
        _this.answerArr.sort();
        _this.data.inAnswer = _this.answerArr.join(',');
        _this.$answerContent.innerHTML = _this.data.inAnswer;

      } else {
        _this.answerArr = _this.answerArr.filter(function(item, key) {
          return item != data.inOpNum;
        })

        if (_this.answerArr.length > 0) {
          _this.data.inAnswer = _this.answerArr.join(',');
          _this.$answerContent.innerHTML = _this.data.inAnswer;
        } else {
          _this.$answerContent.innerHTML = '';
          _this.data.inAnswer = '';
          _this.$answerContent.appendChild(_this.emptyBox);
        }
      }
    })


    var editorBox = document.createElement('div');
    editorBox.contentEditable = true;
    editorBox.style.flex = '1';
    editorBox.style.lineHeight = '20px';
    editorBox.style.outline = 'none';
    editorBox.padding = '5px';
    editorBox.tabIndex = 1;
    editorBox.setAttribute('data-sort', data.inSort);


    domUtils.on(editorBox, 'input', function(evt) {
      var value = this.innerHTML;
      data.inContent = value;
    })

    data.inContent && (editorBox.innerHTML = data.inContent);

    optionItem.appendChild(input);
    optionItem.appendChild(inPnumDom);
    optionItem.appendChild(editorBox);
    optionItem.setAttribute('data-sort', data.inSort);
    this.options.push(optionItem);
    return optionItem;
  },
  addPlaceholder: function() {
    if (this.type !== 4) {
      // 不是填空题不能加空
      return false;
    }

    var headerDom = this.$headerEditorBox;
    var editor = this.editor;
    var placeholder = document.createElement('div');
    placeholder.style.display = 'inline-block';
    placeholder.style.minWidth = '20px';
    placeholder.style.lineHeight = '20px;'
    placeholder.style.borderBottom = '1px #bfbfbf solid';
    placeholder.style.margin = '0 5px';
    this.placeholders.push(placeholder);
    
    editor.execCommand('insertdom', placeholder);
  }
}



UE.plugin.register("question", function() {
  var me = this;


  function initEvent() {
    delete me.shortcutkeys.Redo;
    delete me.shortcutkeys.Undo;
  }

  // 禁用一些功能
  function disableTool() {
    except = ['undo'];
    me.bkqueryCommandState = me.queryCommandState;
    me.bkqueryCommandValue = me.queryCommandValue;
    me.queryCommandState = function(type) {
      if (utils.indexOf(except, type) != -1) {
        return -1;
      }
      return me.bkqueryCommandState.apply(me, arguments);
    };
    me.queryCommandValue = function(type) {
      if (utils.indexOf(except, type) != -1) {
        return null;
      }
      return me.bkqueryCommandValue.apply(me, arguments);
    };
  }
  !UE.Editor.prototype.questions && (UE.Editor.prototype.questions = []);
  var question = new questionFactiory();

  function addPlaceholderEvent () {
    me.addListener('addPlaceholder', function(cmd) {
      var question = me.currentQuestion;
      if (question.type !== 4) {
        console.log('不是填空题，不能加空！');
        return false;
      }
      question.addPlaceholder();
    })
  }
  return {
    commands: {
      question: {
        execCommand: function(command, data, type) {
          data.inSort = me.questions.length + 1;
          var question = new questionFactiory(data, type);
          me.currentQuestion = question;
          question.editor = me;
          question.init();
          me.questions.push(question);
          me.execCommand('insertdom', question.$el);
          initEvent();
          // disableTool();
          type === 4 && addPlaceholderEvent();
        }
      }
    }
  }
})