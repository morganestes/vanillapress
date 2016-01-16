(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var editable = require("make-editable");
var pubsub = require("pubsub");
var debounce = require("debounce-fn");
var classes = require("dom-classes");

var counter = 1;

module.exports = create;

function create (textarea) {
  var iframe = replace(textarea);
  var api = editable(iframe.contentWindow.document);

  api.iframe = iframe;
  api.onUpdate = pubsub();
  api.read = read;

  watch(api, function () {
    textarea.value = read();
    api.onUpdate.publish();
  });

  return api;

  function read () {
    return iframe.contentWindow.document.body.innerHTML;
  };
}

function replace (textarea) {
  var id = counter++;
  var iframe = document.createElement('iframe');
  iframe.setAttribute('class', 'wysiwyg wysiwyg-' + id);

  textarea.style.display = 'none';
  textarea.parentNode.insertBefore(iframe, textarea);

  iframe.contentWindow.document.body.innerHTML = textarea.value;

  iframe.contentWindow.addEventListener('focus', function () {
    classes.add(iframe, 'focus');
  }, false);

  iframe.contentWindow.addEventListener('blur', function () {
    classes.remove(iframe, 'focus');
  }, false);

  return iframe;
}

function watch (api, callback) {
  api.iframe.contentWindow.document.body.addEventListener('input', debounce(callback, 500), false);
}

},{"debounce-fn":2,"dom-classes":3,"make-editable":5,"pubsub":6}],2:[function(require,module,exports){
module.exports = debounce;

function debounce (fn, wait) {
  var timer;
  var args;

  return function () {
    if (timer != undefined) {
      clearTimeout(timer);
      timer = undefined;
    }

    args = arguments;

    timer = setTimeout(function () {
      fn.apply(undefined, args);
    }, wait);
  };
}

},{}],3:[function(require,module,exports){
/**
 * Module dependencies.
 */

var index = require('indexof');

/**
 * Whitespace regexp.
 */

var whitespaceRe = /\s+/;

/**
 * toString reference.
 */

var toString = Object.prototype.toString;

module.exports = classes;
module.exports.add = add;
module.exports.contains = has;
module.exports.has = has;
module.exports.toggle = toggle;
module.exports.remove = remove;
module.exports.removeMatching = removeMatching;

function classes (el) {
  if (el.classList) {
    return el.classList;
  }

  var str = el.className.replace(/^\s+|\s+$/g, '');
  var arr = str.split(whitespaceRe);
  if ('' === arr[0]) arr.shift();
  return arr;
}

function add (el, name) {
  // classList
  if (el.classList) {
    el.classList.add(name);
    return;
  }

  // fallback
  var arr = classes(el);
  var i = index(arr, name);
  if (!~i) arr.push(name);
  el.className = arr.join(' ');
}

function has (el, name) {
  return el.classList
    ? el.classList.contains(name)
    : !! ~index(classes(el), name);
}

function remove (el, name) {
  if ('[object RegExp]' == toString.call(name)) {
    return removeMatching(el, name);
  }

  // classList
  if (el.classList) {
    el.classList.remove(name);
    return;
  }

  // fallback
  var arr = classes(el);
  var i = index(arr, name);
  if (~i) arr.splice(i, 1);
  el.className = arr.join(' ');
}

function removeMatching (el, re, ref) {
  var arr = Array.prototype.slice.call(classes(el));
  for (var i = 0; i < arr.length; i++) {
    if (re.test(arr[i])) {
      remove(el, arr[i]);
    }
  }
}

function toggle (el, name) {
  // classList
  if (el.classList) {
    return el.classList.toggle(name);
  }

  // fallback
  if (has(el, name)) {
    remove(el, name);
  } else {
    add(el, name);
  }
}

},{"indexof":4}],4:[function(require,module,exports){

var indexOf = [].indexOf;

module.exports = function(arr, obj){
  if (indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
},{}],5:[function(require,module,exports){
module.exports = enable;

function enable (doc) {
  doc.body.contentEditable = true;

  return {
    exec: call(doc),
    bold: call(doc, 'bold'),
    italic: call(doc, 'italic'),
    underline: call(doc, 'underline'),
    color: call(doc, 'foreColor'),
    bgcolor: call(doc, 'backColor'),
    img: call(doc, 'insertImage'),
    link: call(doc, 'createLink'),
    unlink: call(doc, 'unlink'),
    plain: call(doc, 'removeFormat'),
    undo: call(doc, 'undo'),
    redo: call(doc, 'redo'),
    indent: call(doc, 'indent'),
    outdent: call(doc, 'outdent'),
    selectAll: call(doc, 'selectAll'),
    orderedList: call(doc, 'insertOrderedList'),
    unorderedList: call(doc, 'insertUnorderedList'),
    copy: call(doc, 'copy'),
    paste: call(doc, 'paste'),
    delete: call(doc, 'delete'),
    fontName: call(doc, 'fontName'),
    fontSize: call(doc, 'fontSize'),
    center: call(doc, 'justifyCenter'),
    justify: call(doc, 'justifyFull'),
    left: call(doc, 'justifyLeft'),
    right: call(doc, 'justifyRight'),
    heading: call(doc, 'heading')
  };
}

function exec (doc, cmd, value, showDefaultUI) {
  doc.execCommand(cmd, showDefaultUI || false, value);
};

function call (doc, commandName) {
  return arguments.length == 1 ? custom : command;

  function custom (commandName, value, ui) {
    return exec(doc, commandName, value, ui);
  }

  function command (value, ui) {
    return exec(doc, commandName, value, ui);
  }
}

},{}],6:[function(require,module,exports){
module.exports = pubsub;

function pubsub (mix) {
  var subscribers;
  var subscribersForOnce;

  mix || (mix = function (fn) {
    if (fn) mix.subscribe(fn);
  });

  mix.subscribe = function (fn) {
    if (!subscribers) return subscribers = fn;
    if (typeof subscribers == 'function') subscribers = [subscribers];
    subscribers.push(fn);
  };

  mix.subscribe.once = function (fn) {
    if (!subscribersForOnce) return subscribersForOnce = fn;
    if (typeof subscribersForOnce == 'function') subscribersForOnce = [subscribersForOnce];
    subscribersForOnce.push(fn);
  };

  mix.unsubscribe = function (fn) {
    if (!subscribers) return;

    if (typeof subscribers == 'function') {
      if (subscribers != fn) return;
      subscribers = undefined;
      return;
    }

    var i = subscribers.length;

    while (i--) {
      if (subscribers[i] && subscribers[i] == fn){
        subscribers[i] = undefined;
        return;
      }
    }
  };

  mix.unsubscribe.once = function (fn) {
    if (!subscribersForOnce) return;

    if (typeof subscribersForOnce == 'function') {
      if (subscribersForOnce != fn) return;
      subscribersForOnce = undefined;
      return;
    }

    var i = subscribersForOnce.length;

    while (i--) {
      if (subscribersForOnce[i] && subscribersForOnce[i] == fn){
        subscribersForOnce[i] = undefined;
        return;
      }
    }
  };

  mix.publish = function () {
    var params = arguments;
    var i, len;

    if (subscribers && typeof subscribers != 'function' && subscribers.length) {
      i = -1;
      len = subscribers.length;

      while (++i < len) {
        if (!subscribers[i] || typeof subscribers[i] != 'function') continue;

        try {
          subscribers[i].apply(undefined, params);
        } catch(err) {
          setTimeout(function () { throw err; }, 0);
        }
      };
    } else if (typeof subscribers == 'function') {
      try {
        subscribers.apply(undefined, params);
      } catch(err) {
        setTimeout(function () { throw err; }, 0);
      }
    }

    if (subscribersForOnce && typeof subscribersForOnce != 'function' && subscribersForOnce.length) {
      i = -1;
      len = subscribersForOnce.length;

      while (++i < len) {
        if (!subscribersForOnce[i] || typeof subscribersForOnce[i] != 'function') continue;

        try {
          subscribersForOnce[i].apply(undefined, params);
        } catch(err) {
          setTimeout(function () { throw err; }, 0);
        }
      };

      subscribersForOnce = undefined;
    } else if (typeof subscribersForOnce == 'function') {
      try {
        subscribersForOnce.apply(undefined, params);
      } catch(err) {
        setTimeout(function () { throw err; }, 0);
      }
      subscribersForOnce = undefined;
    }
  };

  return mix;
}

},{}],7:[function(require,module,exports){
var router = require( "./router.js" );
var view = require( "./view.js" );
var editor = require( "./editor.js" );

var vanillaPress = {
  init: function() {
    router.init();
    view.init();
    editor.init();
  }
};
vanillaPress.init();

},{"./editor.js":9,"./router.js":12,"./view.js":13}],8:[function(require,module,exports){
var Posts = [
  {
    id:1,
    date:"2016-01-09T22:05:09",
    modified:"2016-01-09T22:05:09",
    slug:"hello-world",
    type:"post",
    title:"Hello world!",
    content:"Welcome to WordPress.\nThis is your first post.\nEdit or delete it, then start writing!",
  },
  {
    id:2,
    date:"2016-01-10T22:05:09",
    modified:"2016-01-10T22:05:09",
    slug:"learning-javascript",
    type:"post",
    title:"Learning JavaScript!",
    content:"<p>I'm learning JavaScript and super excited!!!</p> ",
  },
  {
    id:3,
    date:"2016-01-11T22:05:09",
    modified:"2016-01-11T22:05:09",
    slug:"rest-api",
    type:"post",
    title:"The REST API!",
    content:"<p>I've started working with the REST API in WordPress, what fun!</p> ",
  },
  {
    id:4,
    date:"2016-01-12T22:05:09",
    modified:"2016-01-12T22:05:09",
    slug:"json-data",
    type:"post",
    title:"JSON Data!",
    content:"<p>So, with the REST API it is posible to pull in WordPress data as pure JSON.  Now I'm figuring out what to do with the data</p> ",
  },
  {
    id:5,
    date:"2016-01-13T22:05:09",
    modified:"2016-01-13T22:05:09",
    slug:"javascript-project",
    type:"post",
    title:"JavaScript Project",
    content:"<p>I've started working with the REST API in WordPress, what fun!</p> ",
  }
];

var Pages = [
  {
    id:40,
    date:"2016-01-07T22:05:09",
    modified:"2016-01-07T22:05:09",
    slug:"home",
    type:"page",
    title:"Home",
    content:"<p>Welcome!</p><p>Reprehenderit sit sunt nisi excepteur deserunt officia ipsum eu reprehenderits deserunt aliqua incididunt cillum dolore.</p><p>Dolor sit amet, consectetur adipisicing elit. Makingsum Lorem look coolsum.</p><p>Sit temporibus sunt doloremque enim alias pariatur debitis dolorum excepturi fugiat assumenda at, totam delectus, possimus reprehenderit earum aliquid nihil, esse voluptatem.</p>",
  },
  {
    id:41,
    date:"2016-01-09T22:05:09",
    modified:"2016-01-09T22:05:09",
    slug:"about",
    type:"page",
    title:"About Me",
    content:"<p>Hi!  I'm me :)</p><p>Sisi excepteur deserunt officia ipsum eu reprehenderits deserunt aliqua incididunt cillum dolore.</p><p>Dolor sit amet, consectetur adipisicing elit. Makingsum Lorem look coolsum.</p><p>Sit temporibus sunt doloremque enim alias pariatur debitis dolorum excepturi fugiat assumenda at, totam delectus, possimus reprehenderit earum aliquid nihil, esse voluptatem.</p>",
  },
  {
    id:42,
    date:"2016-01-09T22:05:09",
    modified:"2016-01-09T22:05:09",
    slug:"blog",
    type:"page",
    title:"Blog",
    content:"<p>Welcome to my blog page, please enjoy!</p>",
  },
  {
    id:43,
    date:"2016-01-19T22:06:09",
    modified:"2016-01-19T22:06:09",
    slug:"contact",
    type:"page",
    title:"Contact",
    content:"<p>Please get in touch!</p><p>Sit temporibus sunt doloremque enim alias pariatur debitis dolorum excepturi fugiat assumenda at, totam delectus, possimus reprehenderit earum aliquid nihil, esse voluptatem.</p>",
  }
];

var Settings = [
  {
    id:991,
    date:"2016-01-09T22:05:09",
    modified:"2016-01-09T22:05:09",
    slug:"site-name",
    type:"setting",
    title:"Site Name",
    content:"My VanillaPress Site"
  },
  {
    id:992,
    date:"2016-01-09T22:05:09",
    modified:"2016-01-09T22:05:09",
    slug:"site-description",
    type:"setting",
    title:"Site Description",
    content:"Not Just Another WP Site"
  }
];

var data = [Posts, Pages, Settings];
module.exports = data;

},{}],9:[function(require,module,exports){
var models = require( "./models.js" );
var helpers = require( "./lib/helpers.js" );
var view = require( "./view.js" );
var wysiwygEditor = require('wysiwyg');


var wysiwyg;

var editor = {
  init: function() {
    //var contentwysiwyg = wysiwyg(document.querySelector('#editContent'));

    //wysiwyg = document.getElementById("editContent");
    // wysiwyg = new SimpleMDE({
    //   element: document.getElementById("editContent"),
    //   toolbar: false,
    //   spellChecker: false,
    //   status: false,
    // });
    // wysiwyg.codemirror.on( "change", function() {
    //   view.updateContent( wysiwyg.value() );
    //   console.log( wysiwyg.value() );
    // });
    editor.loadMenu();
    editor.setupToggle();
  },
  //posts: get_posts(),
  loadMenu: function(){
    editor.clearMenus();
    editor.showCurrentMenu();
  },
  showCurrentMenu: function() {

    var urlSegments = helpers.getAfterHash();
    var currentMenu;

    //if url #edit/
    if( urlSegments[0] == "edit" && urlSegments.length == 1  ) {
      currentMenu = "primary";
      this.showPrimaryMenu();
    }
    //if url #edit/secondary
    else if( urlSegments[0] == "edit" && urlSegments.length == 2 ) {
      currentMenu = "secondary";
      this.showSecondaryMenu();
    }
    //if editing content
    else {//( urlSegments[0] == "edit" && urlSegments.length == 3 ) {
      currentMenu = "edit";
      this.showEditPanel(urlSegments[2], urlSegments[1]);
    }

    var queryCurrentNav = "#editor nav." + currentMenu;
    var currentNav = document.querySelector(queryCurrentNav);
    currentNav.classList.add("active");

    // var currentUl = document.querySelector(queryStr + " ul");
    // var currentLinks = currentUl.getElementsByTagName("a");
    // for (var i = 0; i < currentLinks.length; i++) {
    //   currentLinks[i].addEventListener("click", refreshMenu(), false);
    // }

  },
  showPrimaryMenu: function(){

  },
  showSecondaryMenu: function(){
    this.updateMenuTitle();
    //figure out what secondary navigation we're loading
    var currentSecondaryMenu = helpers.getAfterHash()[1];
    var menuItems = getContent(currentSecondaryMenu);
    helpers.addMenuItems(menuItems, currentSecondaryMenu);
  },
  showEditPanel: function(slug, contentType){
    this.updateMenuTitle();
    var itt;
    var post = models.getContentBySlug(slug, contentType);
    if( contentType == "posts" || contentType == "pages" ) {
        this.fillEditForm(post);
    }
  },
  fillEditForm: function(post) {
    editor.clearEditForm();
    var editTitle = document.getElementById("editTitle");
    editTitle.value = post.title;
    //console.log(wysiwyg.value());
    //wysiwyg.value( markdown.toHTML(post.content) );
    editContent.value = post.content;
    wysiwyg = wysiwygEditor(document.getElementById("editContent"));
    wysiwyg.onUpdate(function () {
      view.updateContent( wysiwyg.read() );
    });
  },
  clearEditForm: function() {
    editTitle.value = "";
    editContent.value = "";
    var wysiwyg = document.querySelector("nav.edit form iframe");
    console.log(wysiwyg);
    if(wysiwyg != null) wysiwyg.remove();
  },
  clearMenus: function(){
    var editorEl = helpers.getEditorEl();
    //remove active class from all navs
    var navs = editorEl.getElementsByTagName("nav");
    for (var j = 0; j < navs.length; j++) {
      var nav = navs[j];
      nav.classList.remove("active");
    }
    //remove all children from #editor nav.secondary ul
    var navUl = document.querySelector("#editor nav.secondary ul");
    while(navUl.firstChild) navUl.removeChild(navUl.firstChild);

    var navlinks = navUl.getElementsByTagName("a");
    for (var i = 0; i < navlinks.length; i++) {
      editorLinks[i].removeEventListener("click", refreshMenu, false);
    }
  },
  setupToggle: function() {
    var editorToggleEl = document.querySelector("#editorToggle a");
    editorToggleEl.addEventListener("click", editor.toggleView, false);
  },
  toggleView: function() {
    var editorEl = helpers.getEditorEl();
    editorEl.classList.toggle("hidden");
    var toggleBtn = document.querySelector("#editorToggle");
    toggleBtn.classList.toggle("hidden");
    if( toggleBtn.classList.contains("hidden") === false ) {
      var viewContent = helpers.getCurrentContentObj();
      editor.fillEditForm(viewContent);
    }
  },
  updateMenuTitle: function() {
    var title = null,
        titleEl,
        urlSegments = helpers.getAfterHash();
    if(urlSegments.length == 2 && urlSegments[0] == "edit") {
      title = urlSegments[urlSegments.length-1];
      titleEl = document.querySelector("#editor nav.secondary h3 span");
    }
    if(urlSegments.length == 3 && urlSegments[0] == "edit") {
      title = urlSegments[urlSegments.length-2];
      titleEl = document.querySelector("#editor nav.edit h3 span a");
      titleEl.href = "#edit/" + title;
      //titleEl.addEventListener("click", refreshMenu, false);
    }

    var homeLink = document.querySelector("#editor nav.edit h3 .go-home");
    //if( homeLink ) addEventListener("click", refreshMenu, false);

    //titleEl.textContent = title;
  }
};

module.exports = editor;

},{"./lib/helpers.js":10,"./models.js":11,"./view.js":13,"wysiwyg":1}],10:[function(require,module,exports){
var models = require( "./../models.js" );

Array.prototype.isArray = true;
var helpers = {

  getAfterHash: function(url) {
    url = url || null;
    var urlSegments = [""];
    if( url !== null ) {
      url = url.substring(url.indexOf('#')+1);
      urlSegments = url.split("/");
    } else {
      var pageUrl = window.location.hash.substr(1);
      urlSegments = pageUrl.split("/");
    }
    return urlSegments;
  },

  addMenuItems: function(menuItems, contentType) {
    menuItems.forEach(function(item){
      var a = helpers.createLink(item.title, contentType, item.slug);
      helpers.addMenuItem(a);
    });
  },

  addMenuItem: function(menuItem) {
    var ul = document.querySelector("#editor nav.secondary ul");
    var li = document.createElement("li");
    li.appendChild(menuItem);
    ul.appendChild(li);
  },

  createLink: function(text, contentType, slug) {
    var a = document.createElement('a');
    var aText = document.createTextNode(text);
    a.appendChild(aText);
    a.href = "#edit/" + contentType + "/" + slug;
    return a;
  },

  getEditorEl: function() {
    var el = document.getElementById("editor");
    return el;
  },

  getEditorToggleEl: function() {
    var el = document.getElementById("editorToggle");
    return el;
  },

  getCurrentContentObj: function() {

    var newPageSlugs = helpers.getAfterHash();
    var pageContent;
    if( newPageSlugs.length > 1 ) {
      pageContent = models.getContentBySlug(newPageSlugs[1], 'posts');
    } else {
      if( newPageSlugs[0] === "") newPageSlugs[0] = "home";
      pageContent = models.getContentBySlug(newPageSlugs[0], 'pages');      
    }
    return pageContent;
  }


}

module.exports = helpers;

},{"./../models.js":11}],11:[function(require,module,exports){
var data = require( "./data.js" );
var helpers = require( "./lib/helpers.js" );
//console.log(data[2]);
var models = {
  getContent: function(type) {
    var content;
    switch (type) {
      case "posts":
        content = data[0];
        break;
      case "pages":
        content = data[1];
        break;
      case "settings":
        content = data[2];
        break;
      default:
        content =  [{type:"404",title:"404 Error"}];
    }
    return content;
  },

  getContentBySlug: function(slug, contentType){
    var content;
    switch (contentType) {
      case "posts":
        content = data[0];        
        break;
      case "pages":
        content = data[1];
        break;
      case "settings":
        content = data[2];
        break;
      default:
        content =  [{type:"404",title:"404 Error"}];
    }
    var item = content.filter( function( obj ) {
      return obj.slug == slug;
    });
    return item[0];
  }
}

module.exports = models;

},{"./data.js":8,"./lib/helpers.js":10}],12:[function(require,module,exports){
var view = require( "./view.js" );
var router = {
  init: function() {
    var mainNav = document.getElementById("mainNav");
    var links = mainNav.getElementsByTagName("a");
    for(var i = 0, len = links.length; i < len; i++) {
        links[i].addEventListener("click", view.update, false);
    }
    //view.update();

  }
};
module.exports = router;

},{"./view.js":13}],13:[function(require,module,exports){
var helpers = require( "./lib/helpers.js" );
var models = require( "./models.js" );
var view = {
  init: function() {
    var viewContent = helpers.getCurrentContentObj();
    view.updateTitle( viewContent.title );
    view.updateContent( viewContent.content );

  },
  update: function() {
    var newPageSlugs = helpers.getAfterHash(this.href);
    var viewContent;
    if( newPageSlugs.length > 1 ) {
      viewContent = models.getContentBySlug(newPageSlugs[1], 'posts');
    } else {
      if( newPageSlugs[0] === "") newPageSlugs[0] = "home";
      viewContent = models.getContentBySlug(newPageSlugs[0], 'pages');
    }

    view.updateTitle( viewContent.title );
    view.updateContent( viewContent.content );
  },
  updateTitle: function(title) {
    var titleEl = document.getElementById("pageTitle");
    titleEl.innerHTML = title;
  },
  updateContent: function(content) {
    var contentEl = document.getElementById("pageContent");
    contentEl.innerHTML = content;
  }
};
module.exports = view;

},{"./lib/helpers.js":10,"./models.js":11}]},{},[7]);