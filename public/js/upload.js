$(function() {

  $('#upload-page-profile').addClass('dragging').removeClass('dragging');
});

$('#upload-page-profile').on('dragover', function() {
  $('#upload-page-profile').addClass('dragging')
}).on('dragleave', function() {
  $('#upload-page-profile').removeClass('dragging')
}).on('drop', function(e) {
  $('#upload-page-profile').removeClass('dragging hasImage');

  if (e.originalEvent) {
    var file = e.originalEvent.dataTransfer.files[0];
    console.log(file);

    var reader = new FileReader();

    //attach event handlers here...

    reader.readAsDataURL(file);
    reader.onload = function(e) {
      console.log(reader.result);
      $('#upload-page-profile').css('background-image', 'url(' + reader.result + ')').addClass('hasImage');

    }

  }
})
$('#upload-page-profile').on('click', function(e) {
  console.log('clicked')
  $('#upload-page-mediaFile').click();
});
window.addEventListener("dragover", function(e) {
  e = e || event;
  e.preventDefault();
}, false);
window.addEventListener("drop", function(e) {
  e = e || event;
  e.preventDefault();
}, false);
$('#upload-page-mediaFile').change(function(e) {

  var input = e.target;
  if (input.files && input.files[0]) {
    var file = input.files[0];

    var reader = new FileReader();

    reader.readAsDataURL(file);
    reader.onload = function(e) {
      console.log(reader.result);
      $('#upload-page-profile').css('background-image', 'url(' + reader.result + ')').addClass('hasImage');
    }
  }
})
