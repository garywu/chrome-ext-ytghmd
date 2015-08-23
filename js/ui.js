/**
 * This is free and unencumbered software released into the public domain.
 *
 * Anyone is free to copy, modify, publish, use, compile, sell, or
 * distribute this software, either in source code form or as a compiled
 * binary, for any purpose, commercial or non-commercial, and by any
 * means.
 *
 * In jurisdictions that recognize copyright laws, the author or authors
 * of this software dedicate any and all copyright interest in the
 * software to the public domain. We make this dedication for the benefit
 * of the public at large and to the detriment of our heirs and
 * successors. We intend this dedication to be an overt act of
 * relinquishment in perpetuity of all present and future rights to this
 * software under copyright law.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
 * OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 *
 * For more information, please refer to <http://unlicense.org/>
 */

/**
 * name     : ui.js (pffy.cloud.farfalloni)
 * version  : 5
 * updated  : 2015-08-23
 * license  : http://unlicense.org/ The Unlicense
 * git      : https://github.com/pffy/chrome-ext-ytghmd
 *
 */

 function loading() {

  var str = 'loading...';

  document.getElementById('imgid').title = str;
  document.getElementById('imgid').style.width = '100px';
  document.getElementById('imgid').style.height = '100px';

  document.getElementById('imgid').src = 'images/spinner.gif';

  document.getElementById('watchid').value = str;
  document.getElementById('embedid').value = str;
  document.getElementById('citeid').value = str;
}

function displayMarkdown(id, title, imgurl, author, date) {

  var watchurl = 'https://www.youtube.com/watch?v=' + id;
  var embedurl = 'https://www.youtube.com/embed/' + id;

  embedurl += '?autoplay=1';

  var watchstr = '[![' + title + ']' + '(' + imgurl + ')]'
    + '(' + watchurl + ' "' + title + '")';
  var embedstr = '[![' + title + ']' + '(' + imgurl + ')]'
    + '(' + embedurl + ' "' + title + '")';

  var datestr = '(YEAR, MONTH DAY)';
  var d = new Date(date);

  if(d.getFullYear() && d.getDate()) {

    var months = [
      'January', 'February', 'March',
      'April', 'May', 'June',
      'July', 'August', 'September',
      'October', 'November', 'December'
      ];

    datestr = '(' + d.getFullYear() + ', '
      + months[d.getMonth()] + ' ' + d.getDate() + ')';
  }


  var fullStop = '. ';

  var apastr = '' + author + fullStop
    + datestr + fullStop
    + title + ' [Video file]' + fullStop
    + 'Retrieved from ' + watchurl;

  document.getElementById('watchid').value = watchstr;
  document.getElementById('embedid').value = embedstr;
  document.getElementById('citeid').value = apastr;

  if(!imgurl) {
    document.getElementById('imgid').src = '';
    document.getElementById('imgid').style.visibility = 'hidden';

  } else {
    document.getElementById('imgid').src = imgurl;
    document.getElementById('imgid').title = title;
    document.getElementById('imgid').style.width = '';
    document.getElementById('imgid').style.height = '';
    document.getElementById('imgid').style.visibility = 'visible';
  }
}

function onLoadPopup() {

  document.getElementById('watchid').addEventListener('click', function() {
    this.select();
  });

  document.getElementById('embedid').addEventListener('click', function() {
    this.select();
  });

  document.getElementById('citeid').addEventListener('click', function() {
    this.select();
  });

  loading();

  getData(function(videoid, title, thumbnail, author, date) {
    if(videoid && title && thumbnail && author && date) {
      displayMarkdown(videoid, title, thumbnail, author, date);
    } else {
      document.body.innerText = 'No YouTube Videos here.';
    }
  });
}