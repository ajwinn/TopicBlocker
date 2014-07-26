'use strict';

console.log('\'Allo \'Allo! Popup');

function sync(){
  chrome.storage.local.get(null,function(response){
    var blocklist = document.getElementById('blocklist');
    var words_to_block = response.blocklist;
    if (words_to_block == undefined || words_to_block == null){
      words_to_block = '';
    }
    blocklist.value = words_to_block;
  });

  function setButton (type) {
    var checkmark = document.getElementById('save');
    switch (type){
      case 'saved':
        checkmark.innerHTML = 'Saved  &#10003;';
        checkmark.className = 'btn btn-success btn-lg';
        break;
      case 'save':
        checkmark.innerHTML = 'Save';
        checkmark.className = 'btn btn-primary btn-lg';
        break;
    }
    if (type == 'saved') {
      
    } else {
      checkmark.innerHTML = 'Save';
      checkmark.className = 'btn btn-primary btn-lg';
    };
    
  }

  var save_button = document.getElementById('save');
  save_button.addEventListener('click',function(e) {
    save();
  });

  function save () {
    var input = document.getElementById('blocklist')
      , blocklist = input.value;
    chrome.storage.local.set({blocklist:blocklist},function() {
      setButton('saved');
//      var checkmark = document.getElementById('save');
//      checkmark.innerHTML = 'Saved  &#10003;';
//      checkmark.className = 'btn btn-success btn-lg';
    });
  }

  var input = document.getElementById('blocklist');
  input.addEventListener('keydown',function(e) {
    if (e.keyCode == 13) {
      e.preventDefault();
      save();
    } else {
      setButton()
    };
  });
}

window.onload = sync;