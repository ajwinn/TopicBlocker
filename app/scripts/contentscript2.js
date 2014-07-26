var text_nodes = [
  /* Liked page's post contents*/
  ".userContent > p:nth-child(1)",
  /* Share Title*/
  "._6m6 > a",
  /* Share description */
  "._6m7",
  /* Share Title*/
  "._5pcn > a",
  /* Repost text blurb*/
  'div[class^="text_exposed"] > p',
  /* Repost full text */
  '.text_exposed_show',
  /* Recent app activity side-by-side : Item title */
  '._6mt',
  /* Recent app activity side-by-side : Item description */
  '._6mu',
  /* Reshare of what someone shared on a Page */
  '._5pco > p',
  /* Page or Friend shares Page's link - page name or share description */
  '._fwb > a',
  /* Friend tagged in album */
  '._5pbx > p',
  /* Related post - title */
  '._1ui6',
  /* Related post - description */
  '._1ui7',
  /* Page name*/
  '.profileLink',
  /* Shared link source url */
  '.ellipsis'

];

var container_class = '_4-u2';

var hidden_nodes;

function isHome () {
  return document.body.classList.contains('home');
}

function init () {
  if (isHome()) {
    hidden_nodes = [];
    // Listeners
    onModelChange();
    onDomChange();     
    // Reset
    reset();
   
  };
}

function getStoredBlocklistAndHide() {
  
  chrome.storage.local.get(null, function(data) {
    
    // Get blocklist regex patterns
    var blocklist = data.blocklist || '';
    if (blocklist != '') {
      var trailing_space = new RegExp('; ', 'g')
        , leading_space = new RegExp(' ;', 'g');
      blocklist = blocklist.replace(trailing_space, ';').replace(leading_space, ';');
      var block_regex = blocklist.split(';');  
    } else {
      return;
    };
    
    // Get nodes to check for matches
    var nodes_to_check = [];
    for (var i = 0; i < text_nodes.length; i++) {
      var group = document.querySelectorAll(text_nodes[i]);
      for (var n = 0; n < group.length; n++) {
        nodes_to_check.push(group[n]);
      };
    };
    

    // Get matching nodes
    var matching_nodes = [];
    for (var i = 0; i < nodes_to_check.length; i++) {
      for (var n = 0; n < block_regex.length; n++) {
        var text = nodes_to_check[i].innerText.toLowerCase()
          , rgx = block_regex[n].toLowerCase();

        var isMatch = text.match(rgx) != null || false;
        if (isMatch) {
          matching_nodes.push(nodes_to_check[i]);
        }; 
      };
    };
    

    // Hide matching nodes
    for (var i = 0; i < matching_nodes.length; i++) {
      hide(matching_nodes[i], matching_nodes.length);
    };
  });
};

function reset() {
  showAll(function() {
    getStoredBlocklistAndHide();
  });
};

function onModelChange () {
  chrome.storage.onChanged.addListener(function(changes,namespace){
    
    reset();  
  });
}

// on each mutation
// begin a timer that will call
// getStoredBlocklistAndHide in the future
// if 
var timer;
function wait (now,lastChange) {
  timer = setTimeout(function() {

  })
}


var observer, lastChange;
function onDomChange () {
  var target = document.querySelector('body');
 
  // create an observer instance
  observer = new MutationObserver(function(mutations) {
    if (isHome()) {
      console.log('running on this page');
      mutations.forEach(function(mutation) {
        if (mutation.addedNodes.length > 0) {
          getStoredBlocklistAndHide();  
        };
      });
    };
    
  });
   
  // configuration of the observer:
  var config = { 
    childList: true,
    subtree:true
  };
   
  // pass in the target node, as well as the observer options
  observer.observe(target, config);
}

// Hide node or appropriate parent
function hide (node, total) {
  
  var isContent = node.className.match(container_class) != null ? true : false;
  
  if(isContent){
    
    // If not already hidden, hide it & return it for storing.
    if (node.style.display != 'none') {      
      
      node.style.display = "none";
      var node_path = cssPath(node);
      
      hidden_nodes.push(node_path);
    };
  } else {
    hide(node.parentNode);
  }
}

function showAll (callback) {
  for (var i = 0; i < hidden_nodes.length; i++) {
    var nodes = document.querySelector(hidden_nodes[i]);
    nodes.style.display = 'block';
  };
  hidden_nodes = [];
  callback();
}

function cssPath (el) {
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
}

window.onload = init;