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
 * version  : 8
 * updated  : 2016-09-22
 * license  : http://unlicense.org/ The Unlicense
 * git      : https://github.com/pffy/chrome-ext-ytghmd
 *
 */

// list of valid URL patterns
const VALID_URLS = [

  // watch url endpoint
  // https://www.youtube.com/watch/cKxRvEZd3Mw
  // https://www.youtube.com/watch?v=cKxRvEZd3Mw
  'https://www.youtube.com/watch',

  // embed url endpoint
  // https://www.youtube.com/embed/cKxRvEZd3Mw
  'https://www.youtube.com/embed',

  // privacy embed url
  // https://www.youtube-nocookie.com/embed/cKxRvEZd3Mw
  'https://www.youtube-nocookie.com/embed/',

  // legacy embed url
  // https://www.youtube.com/v/cKxRvEZd3Mw
  'https://www.youtube.com/v/',

  // legacy privacy embed url
  // https://www.youtube-nocookie.com/v/cKxRvEZd3Mw
  'https://www.youtube-nocookie.com/v/',

  // shortened URL with list
  // https://youtu.be/cKxRvEZd3Mw?list=PLT6elRN3Aer7ncFlaCz8Zz-4B5cnsrOMt
  'https://youtu.be/'

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

function hasQuestionMark(str) {
  if(str.indexOf('?') > -1) {
    return true;
  }

  return false;
}

function hasAmpersand(str) {
  if(str.indexOf('&') > -1) {
    return true;
  }

  return false;
}

// returns YouTube video id
function getVideoId(str) {

  var arr;

  if(hasQuestionMark(str) || hasAmpersand(str)) {

    arr = str.split(new RegExp('\\?|&'));

    console.log(arr);

    for(var a in arr) {

      if(arr[a].indexOf('v=') > -1) {
        return arr[a].split('=')[1];
      }

      const SHORT_URL = 'https://youtu.be/';
      if(arr[a].indexOf(SHORT_URL) > -1) {
        return arr[a].substr(SHORT_URL.length);
      }

      const EMBED_URL = 'https://www.youtube.com/embed/';
      if(arr[a].indexOf(EMBED_URL) > -1) {
        return arr[a].substr(EMBED_URL.length);
      }

      const PRIVACY_URL = 'https://www.youtube-nocookie.com/embed/';
      if(arr[a].indexOf(PRIVACY_URL) > -1) {
        return arr[a].substr(PRIVACY_URL.length);
      }

/*
      const LEGACY_EMBED_URL = 'https://www.youtube.com/v/';
      if(arr[a].indexOf(LEGACY_EMBED_URL) > -1) {
        return arr[a].substr(LEGACY_EMBED_URL.length);
      }

      const LEGACY_PRIVACY_URL = 'https://www.youtube-nocookie.com/v/';
      if(arr[a].indexOf(LEGACY_PRIVACY_URL) > -1) {
        return arr[a].substr(LEGACY_PRIVACY_URL.length);
      }
*/

    }
  }

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
    const API_KEY = 'INSERT-API-KEY-HERE';
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
          ext.videoIsPrivate = false;
          callback(videoId, title, thumbnail, author, date);
        } else {
          thumbnail = 'images/spinner.gif';
          ext.videoIsPrivate = true;
          callback(videoId, DEFAULT_TEXT, thumbnail, DEFAULT_AUTHOR, DEFAULT_DATE);
        }

      }, function(reason) {
        console.log('Error: ' + reason.result.error.message);
      });
    }

  });
}