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
 * name     : ytghmd.js (pffy.cloud.farfalloni)
 * version  : 6
 * updated  : 2015-12-29
 * license  : http://unlicense.org/ The Unlicense
 * git      : https://github.com/pffy/chrome-ext-ytghmd
 *
 */

// list of valid URL patterns
const VALID_URLS = [

  // watch url
  "https://www.youtube.com/watch?v=",

  // alternate watch url (where v is not first param)
  "https://www.youtube.com/watch?",

  // embed url
  "https://www.youtube.com/embed/",

  // privacy embed url
  "https://www.youtube-nocookie.com/embed/",

  // legacy embed url
  "https://www.youtube.com/v/",

  // legacy privacy embed url
  "https://www.youtube-nocookie.com/v/"
];

// Returns true if URI string is valid; otherwise, false.
function isValid(str) {
  for(var v in VALID_URLS) {
    if(str.indexOf(VALID_URLS[v]) == 0) {
      return true;
    }
  }
  return false;
}

// returns YouTube video id
function getVideoId(str) {

  // remove valid hosts
  for(var v in VALID_URLS) {
    str = str.replace(VALID_URLS[v], '');
  }

  // only paths remain...

  // if video id is not first param (in watch url)
  if(str.indexOf('&v=') > -1) {
    str = str.split('&v=')[1]; // videoid on as the second string
    str = str.split('&')[0]; // videoid is now the first string
  }

  // video id always before `?` in embed url
  str = str.split('?')[0]; // videoid is the first string here
  return str;
}

// calls back youtube data for Public and Unlisted videos
function getData(callback) {

  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {

    var valid = false,
      url = '',
      videoId = '',
      title = '',
      author = '',
      date = '',
      thumbnail = '';

    // DEVELOPERS: This key can be shutoff at any time. Please create
    // your own API key at: https://console.developers.google.com/project
    const API_KEY = 'INSERT-YOUR-VALID-API-KEY';
    const DEFAULT_TEXT = 'INSERT-TITLE-HERE';
    const DEFAULT_AUTHOR = 'INSERT-AUTHOR-HERE';
    const DEFAULT_DATE = 'INSERT-DATE-HERE';

    gapi.client.setApiKey(API_KEY);

    url = tabs[0].url;
    valid = isValid(url);

    if(!valid) {
      callback(false, false, false, false, false);
    } else {

      videoId = getVideoId(url);

      // REST API calls
      var restRequest = gapi.client.request({
          'path': '/youtube/v3/videos',
          'params': {
            'part': 'snippet',
            'id': videoId
          }
      });

      // finishes promise/future construct
      restRequest.then(function(resp) {
        // console.log(resp); // check response results
        if(resp.result.items.length) {
          title = resp.result.items[0].snippet.title;
          thumbnail = resp.result.items[0].snippet.thumbnails.high.url;
          author = resp.result.items[0].snippet.channelTitle;
          date = resp.result.items[0].snippet.publishedAt;
          callback(videoId, title, thumbnail, author, date);
        } else {
          thumbnail = 'https://i.ytimg.com/vi/' + videoId + '/0.jpg';
          callback(videoId, DEFAULT_TEXT, thumbnail, DEFAULT_AUTHOR, DEFAULT_DATE);
        }

      }, function(reason) {
        console.log('Error: ' + reason.result.error.message);
      });
    }

  });
}