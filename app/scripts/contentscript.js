'use strict';

/* APP */
var app = {
  init : function(){
    
    // Initial state - not watching DOM
    window.watchingDom = false;

    function sync (type) {
      // First, See if there's anything in blocklist
      model.read(null,function(response) {

        var blocklist = response.blocklist || ''
          , selectors = response.hidden_nodes || undefined;

        // if domchange, reset hidden nodes to show
        if (type == 'storage_change') {
          for (var i = 0; i < selectors.length; i++) {
            var element = document.querySelector(selectors[i]);
            element.style.display = 'block';
          };
        };

        // Second, clear out model's previously stored hidden nodes
        model.update({ 'hidden_nodes' : [], 'blocklist' : blocklist }, function() {
          
          // Finally, sync model & view
          controller.sync(null,'hide');
        });
      });
    }
    

    chrome.storage.onChanged.addListener(function(changes,namespace){
      sync('storage_change')
    });


  },
  config : {
    // FB Post container class as of 2014-07-04
    container_class : '_4-u2',
    // Places to find words
    content_blocks_with_text: [
      ".userContent > p",
      "._6m6 > a",
      "._6m7"
    ]
  }
};

/* MODEL */
var model = {
  
  read : function (query, callback) {
    chrome.storage.sync.get(query,function(r) {
      callback(r);
    });
  },
  update : function(obj, callback) {
    
    chrome.storage.sync.set(obj,function() {
      callback();
    });
  },
  destroy : function () {
    chrome.storage.sync.clear();
  }
};

/* CONTROLLER */
var controller = {

  create: function(obj) {
    model.update(obj, function() {
      
    });
  },

  read: function(item, callback) {
    model.read(item,function(response) {
      callback(response);
    });
  },
  
  sync: function(item, action) {
    
    // currently syncing all using null
    controller.read(item,function(result) {
      
      controller.setView(action, result, function(hidden_nodes) {
        
        controller.setModel(hidden_nodes, function() {
          
        });
      });
    });
  },

  destroy: function(query) {

  },

  setView : function(action, storage, callback){
    
    
    
    // hide/show based on storage, get back hidden_nodes
    // set model with hidden_nodes
    view[action](storage,function(hidden_nodes) {
      
      callback(hidden_nodes);
    });  
  },

  setModel : function(obj, callback){
    model.update(obj,function(){
      
    });
  }
};


/* VIEW */
var view = {

  cssPath : function(el) {
    if (!(el instanceof Element)){
      return;
    }
    var path = [];
    while (el.nodeType === Node.ELEMENT_NODE) {
        var selector = el.nodeName.toLowerCase();
        if (el.id) {
            selector += '#' + el.id;
            path.unshift(selector);
            break;
        } else {
            var sib = el, nth = 1;
            while (sib = sib.previousElementSibling) {
                if (sib.nodeName.toLowerCase() == selector)
                   nth++;
            }
            if (nth != 1)
                selector += ":nth-of-type("+nth+")";
        }
        path.unshift(selector);
        el = el.parentNode;
    }
    return path.join(" > ");
  },

  hide: function(storage, storeAllHiddenNodes){
    

    // Convert blocklist to array
    var blocks = storage.blocklist || ''
      , blocksExist = blocks != '' ? true : false;
    if (blocksExist) {
      blocks = blocks.replace('; ',';').replace(' ;',';').split(';');  
    } else {
      blocks = [];
    };
    

    var hidden_nodes = storage.hidden_nodes;

    // Get nodes to check
    var selectors = app.config.content_blocks_with_text
      , nodes_to_check = [];
    for (var i = 0; i < selectors.length; i++) {
      var group = document.querySelectorAll(selectors[i]);
      [].forEach.call(group,function(item,index){
        nodes_to_check.push(item);
      });
    };
    

    // Hide posts
    function hideContentContainerOf(node, returnHiddenNode){
      
      var isContent = node.className.match(app.config.container_class) != null ? true : false;
      
      if(isContent){
        
        

        // If not already hidden, hide it & return it for storing.
        if (node.style.display != 'none') {
          
          node.style.display = "none";
          var node_path = view.cssPath(node);
          returnHiddenNode(node_path);
        };
      } else {
        hideContentContainerOf(node.parentNode, returnHiddenNode);
      }
    }

    function matchAndHide (blocks,nodes_to_check,returnAllHiddenNodes) {
      var hidden_nodes = [];
      for (var i = 0; i < blocks.length; i++) {
        for (var n = 0; n < nodes_to_check.length; n++) {
          var text = nodes_to_check[n].innerText.toLowerCase();
          
          if (text.match(blocks[i]) != null) {
            // hide node in view
            hideContentContainerOf(nodes_to_check[n], function(hidden_node) {
              // store node that's being hidden
              hidden_nodes.push(hidden_node);
              if (i == blocks.length - 1) {
                returnAllHiddenNodes(hidden_nodes);
              };
            });

          };
        };
        
      };
    }

    // Hide nodes and store them
    matchAndHide(blocks, nodes_to_check, function(hidden_nodes) {
      
      storeAllHiddenNodes({'hidden_nodes':hidden_nodes});
    });


  },

  show: function(query){
    // could be all or item
  }



};

window.onload = app.init;

