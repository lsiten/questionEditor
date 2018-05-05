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
  this.$el.className = 'lsiten-question-all-box';

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
  _findPrePlaceholder: function (node) {
    if (!node) {
      return node;
    }
    if (node.nodeType === 1 && node.className === 'lsiten-placeholder') {
      return node;
    }
    if (node.previousSibling) {
      if (node.previousSibling.nodeType === 1 && node.previousSibling.className === 'lsiten-placeholder') {
        return node.previousSibling;
      }
      return this._findPrePlaceholder(node.previousSibling);
    }
    return node.previousSibling;
  },
  initEvent: function() {
    var _this = this;
    domUtils.on(this.$el, 'click', function(evt) {
      var questionDom = domUtils.findParent(evt.target, function(node) {
        return node.className === 'lsiten-question-all-box';
      }, true);
      if (questionDom) {
        _this.editor.currentQuestion = _this;
      } else {
        _this.editor.currentQuestion = null;
      }
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
            var targetDom = evt.target;            
            var sort = targetDom.getAttribute('data-sort');
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
    if (this.type === 4) {
      var editor = this.editor;
      domUtils.on(this.$el, 'keydown', function(evt) {
        var keyCode = evt.keyCode || evt.which;
        
        // 回退键
        if (
          keyCode === 8 &&
          !evt.ctrlKey &&
          !evt.metaKey &&
          !evt.shiftKey &&
          !evt.altKey
        ) {
          var range = editor.selection.getRange(),
              start = range.startContainer;
          var editorBoxDom = domUtils.findParent(start, function(node) {
            return node.className === 'lsiten-editor-box-4';
          }, true);
          // 如果不在填空题的编辑框内，返回
          if (!editorBoxDom) {
            return '';
          }
          var parentDom = domUtils.findParent(start, function(node) {
            return node.parentNode.className === 'lsiten-editor-box-4';
          }, true);

          var prePlaceholder =  _this._findPrePlaceholder(parentDom);
          if (!parentDom) {
            if (_this.currentPlaceholder) {
              var pindex = _this.currentPlaceholder.getAttribute('data-placeholerIndex');
              var filterArr = [];
              for (var i in _this.placeholders) {
                if (_this.placeholders[i].index !== parseInt(pindex)) {
                  _this.placeholders[i].index > parseInt(pindex) && (_this.placeholders[i].index--);
                  filterArr.push(_this.placeholders[i]);
                }
              }
              _this.placeholderIndex--;
              _this.placeholders = filterArr;
              _this._refreshPlaceholderAnswer();
            }
          } else {
            _this.currentPlaceholder = prePlaceholder;
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
    this.$el.style.marginTop = '5px';
  },
  // 根据不同类型题目生成不同的头部
  generateHeader: function() {
    var editorBox = document.createElement('div');
    editorBox.contentEditable = true;
    editorBox.style.lineHeight = '20px';
    editorBox.style.padding= '10px';
    editorBox.style.outline = 'none';
    // 如果是填空题，没有下划线
    parseInt(this.type) !==4 && (editorBox.style.borderBottom = '1px solid #efefef');
    editorBox.style.flex = '1';
    editorBox.className = 'lsiten-editor-box-' + this.type;
    var _this = this;
    domUtils.on(editorBox, 'input', function(evt, test) {
      var value = this.innerHTML;
      var placeholders = this.getElementsByClassName('lsiten-placeholder');
      if (placeholders.length > 0) {
        var tempDom = this.cloneNode(true);
        var tempPlaceholders = Array.prototype.slice.call(tempDom.getElementsByClassName('lsiten-placeholder'), 0);
        for (var i =0; i < tempPlaceholders.length; i++) {
          tempPlaceholders[i].outerHTML = '[_Fill.Replace_]';
        }
        value = tempDom.innerHTML;
      }
      _this.data.inQuTitle = value;
    })
    var pNumDom = document.createElement('div');
    pNumDom.style.width = '40px';
    pNumDom.style.lineHeight = '40px';
    pNumDom.style.textAlign = 'center';
    pNumDom.innerHTML = this.data.inSort + '、';
    this.$header.style.display = 'flex';
    this.$headerEditorBox = editorBox;
    this.$headerPnumDom = pNumDom;
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
      // answerBox.style.marginTop = '0';
      // answerBox.style.borderTop = 'none';
      // this.emptyBox.innerHTML = '<尚未加空> 参考答案用于系统自动阅卷，不会显示在答卷上';
      // var answer = this.data.inAnswer;
      // if (answer.length < 1) {
      //   answerContent.appendChild(this.emptyBox);
      // }
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
    parseInt(this.type) !== 4 && this.$body.appendChild(answerBox);
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
    var _this = this;
    var editor = this.editor;
    var range = editor.selection.getRange(),
        start = range.startContainer;
    var editorBoxDom = domUtils.findParent(start, function(node) {
      return node.className === 'lsiten-editor-box-4';
    }, true);
    // 如果不在填空题的编辑框内，返回
    if (!editorBoxDom) {
      return '';
    }
    var parentDom = domUtils.findParent(start, function(node) {
      return node.parentNode.className === 'lsiten-editor-box-4';
    }, true);
    var prePlaceholder =  this._findPrePlaceholder(parentDom);
    !this.placeholderIndex && (this.placeholderIndex = 0);
    var placeholderIndex = ++this.placeholderIndex;
    if (prePlaceholder) {
      var preIndex = parseInt(prePlaceholder.getAttribute('data-placeholerIndex'));
      placeholderIndex = preIndex + 1;
    } else {
      placeholderIndex = 1;
    }
    var headerDom = this.$headerEditorBox;
    var editor = this.editor;
    var placeholder = document.createElement('input');
    placeholder.style.border = 'none';
    placeholder.style.outline = 'none';
    placeholder.style.lineHeight = '20px;'
    placeholder.style.borderBottom = '1px #bfbfbf solid';
    placeholder.style.textAlign = 'center';
    placeholder.placeholder = '输入参考答案';
    placeholder.className = 'lsiten-placeholder';
    placeholder.style.webkitAppearance = 'none';
    placeholder.setAttribute('data-placeholerIndex', placeholderIndex);
    
    domUtils.on(placeholder, 'change', function () {
      _this._refreshPlaceholderAnswer();
    })
    var placeholderItem = {
      index: placeholderIndex,
      dom: placeholder
    };
    if (this.placeholders.length > 0) {
      var addPlaceholder = [];
      var isAddIterm = false;
      for(var i in this.placeholders) {
         if (this.placeholders[i].index === placeholderIndex) {
          this.placeholders[i].index++;
          addPlaceholder.push(placeholderItem);
         } else {
          this.placeholders[i].index > placeholderIndex && this.placeholders[i].index++
        }
        addPlaceholder.push(this.placeholders[i]);
        this.placeholders[i].dom.setAttribute('data-placeholerIndex', this.placeholders[i].index);
      }
      !isAddIterm && addPlaceholder.push(placeholderItem);
      this.placeholders = addPlaceholder;

    } else {
      this.placeholders.push(placeholderItem);
    }
    this._refreshPlaceholderAnswer();
    editor.execCommand('insertdom', placeholder);
  },
  _refreshPlaceholderAnswer: function () {
    var placeholders = this.placeholders;
    var data = this.data;
    var answerArr = [];
    for (var i in placeholders) {
      answerArr.push('[_Fill.Replace_]' + placeholders[i].dom.value);
    }
    data.inAnswer = answerArr.join('');
  }
}



UE.plugin.register("question", function() {
  var me = this;

  var moveUpFun = function(cmd) {
    var question = me.currentQuestion;
    var AllQuestions = me.questions;
    var currentSort = question.data.inSort;
    if (currentSort === 1) {
      return '';
    }
    var preSort = currentSort - 1;
    if (preSort <=0 ) {
      return '';
    } 
    var preQuestion;
    var tempQuestions = [];
    for (var i in AllQuestions) {
      if (preSort === AllQuestions[i].data.inSort) {
        preQuestion = AllQuestions[i];
        preQuestion.data.inSort++;
        preQuestion.$headerPnumDom.innerHTML = preQuestion.data.inSort;
      } else if (currentSort === AllQuestions[i].data.inSort) {      
        AllQuestions[i].data.inSort--;
        AllQuestions[i].$headerPnumDom.innerHTML = AllQuestions[i].data.inSort;
        domUtils.remove(AllQuestions[i].$el);
        preQuestion.$el.parentNode.insertBefore(AllQuestions[i].$el, preQuestion.$el);
        tempQuestions.push(AllQuestions[i]);
        tempQuestions.push(preQuestion);
      } else {
        tempQuestions.push(AllQuestions[i]);
      }
    }
    me.questions = tempQuestions;
  }

  var moveDownFun = function(cmd) {
    var question = me.currentQuestion;
    var AllQuestions = me.questions;
    var qLength = me.questions.length;
    var currentSort = question.data.inSort;
    if (currentSort === qLength) {
      return '';
    }
    var nextSort = currentSort + 1;

    if (nextSort > qLength) {
      return '';
    }

    var nextQuestion;
    var tempQuestions = [];
    for (var i in AllQuestions) {
      if (nextSort === AllQuestions[i].data.inSort) {
        nextQuestion = AllQuestions[i];
        nextQuestion.data.inSort--;
        nextQuestion.$headerPnumDom.innerHTML = nextQuestion.data.inSort;
        domUtils.remove(nextQuestion.$el);
        question.$el.parentNode.insertBefore(nextQuestion.$el, question.$el);
        tempQuestions.push(nextQuestion);
        tempQuestions.push(question);
      } else if (currentSort === AllQuestions[i].data.inSort) {      
        AllQuestions[i].data.inSort++;
        AllQuestions[i].$headerPnumDom.innerHTML = AllQuestions[i].data.inSort;
      } else {
        tempQuestions.push(AllQuestions[i]);
      }
    }
    me.questions = tempQuestions;
  }

  var deleteQuestionFun = function(cmd) {
    var question = me.currentQuestion;
    var AllQuestions = me.questions;

    var currentSort = question.data.inSort;

    var tempQuestions = [];

    for (var i in AllQuestions) {
      if (currentSort === AllQuestions[i].data.inSort) {
        domUtils.remove(AllQuestions[i].$el);
      } else if (AllQuestions[i].data.inSort > currentSort) {
        AllQuestions[i].data.inSort--;
        AllQuestions[i].$headerPnumDom.innerHTML = AllQuestions[i].data.inSort;
        tempQuestions.push(AllQuestions[i]);
      } else {
        tempQuestions.push(AllQuestions[i]);
      }
    }

    me.questions = tempQuestions;
  }

  var getAllDataFun = function(cmd) {
    var AllQuestions = me.questions;
    var dataQuestions = [];

    for (var i in AllQuestions) {
      dataQuestions.push(AllQuestions[i].data);
    }
    me.questionData = dataQuestions;
    return dataQuestions;
  }
  

  function initEvent() {
    delete me.shortcutkeys.Redo;
    delete me.shortcutkeys.Undo;
    // 上移
    me.removeListener('moveUp', moveUpFun);
    me.addListener('moveUp', moveUpFun);
    // 下移
    me.removeListener('moveDown', moveDownFun);
    me.addListener('moveDown', moveDownFun);
    // 删除
    me.removeListener('deleteQuestion', deleteQuestionFun);
    me.addListener('deleteQuestion', deleteQuestionFun);

    // 删除
    me.removeListener('getAllData', getAllDataFun);
    me.addListener('getAllData', getAllDataFun);
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
          type === 4 && addPlaceholderEvent();
          
        }
      }
    }
  }
})