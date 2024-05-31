function setCookieItem(key, value, options) {
    if (typeof options.expires === 'number') {
      var days = options.expires, t = options.expires = new Date();
      t.setTime(+t + days * 864e+5);
    }
    return (document.cookie = [
      encodeURIComponent(key), '=', encodeURIComponent(String(value)),
      options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
      options.path    ? '; path=' + options.path : '',
      options.domain  ? '; domain=' + options.domain : '',
      options.secure  ? '; secure' : ''
    ].join(''));
  }
  function getCookieItem(cookieName) {
    const name = cookieName + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');
    for (let i = 0; i < cookieArray.length; i++) {
      let cookie = cookieArray[i].trim();
      if (cookie.indexOf(name) === 0) {
        return cookie.substring(name.length, cookie.length);
      }
    }
    return null;
  }
  function getQueryParam(url, param) {
    // Expects a raw URL
    var newParam = param.replace(/[[]/, '\\[').replace(/[\]]/, '\\]');
    var regexS = '[\\?&]' + newParam + '=([^&#]*)';
    var regex = new RegExp(regexS);
    var results = regex.exec(url);
    if (results === null || results && typeof results[1] !== 'string' && results[1].length) {
      return '';
    } else {
      var result = results[1];
      try {
        result = decodeURIComponent(result);
      } catch (err) {
        console.error('Skipping decoding for malformed query param: ' + result);
      }
      return result.replace(/\+/g, ' ');
    }
  }
  function utmNamesMapping(utmName) {
    var expandedUtmName = '';
    switch (utmName) {
      case 'gclid':
      case 'utm_gclid_current':
        expandedUtmName = 'utm_gclid';
        break;
      default:
        expandedUtmName = utmName;
    }
    return expandedUtmName;
  }
  function getTrackDomain() {
    var trackDomain = '';
    var host = $S && $S.global_conf && $S.global_conf.host_suffix ||
      $S && $S.globalConf && $S.globalConf.host_suffix || '';
    if ($S && $S.live_site || $S && $S.liveBlog) {
      trackDomain = document.domain;
    } else if (host) {
      trackDomain = "." + host;
    } else {
      trackDomain = location.href && location.href.includes('strikingly') ? '.strikingly.com' : '.sxl.cn';
    }
    return trackDomain;
  }
  function recordUniqUtmCookies(originUrl, needSetCookie = true) {
    var campaign_keywords = 'utm_source gclid utm_medium utm_campaign utm_content utm_term'.split(' '),
        kw = '',
        uniq_utm_config = {};
    var index;
    var siteUrl = originUrl || document.URL;
    for (index = 0; index < campaign_keywords.length; ++index) {
      kw = getQueryParam(siteUrl, campaign_keywords[index]);
      var utm_name = utmNamesMapping(campaign_keywords[index]);
      if (kw.length !== 0) {
        uniq_utm_config[utm_name] = kw;
      }
    }
    var isUtmCookieExisted = document.cookie && document.cookie.includes('__uniq_utm_config=');
    if (!isUtmCookieExisted) {
      uniq_utm_config['utm_timestamp'] = new Date().getTime();
      uniq_utm_config['utm_referrer'] = document.referrer;
      var gclidValue = getQueryParam(siteUrl, 'gclid');
      var gbraidValue = getQueryParam(siteUrl, 'gbraid');
      var wbraidValue = getQueryParam(siteUrl, 'wbraid');
      var ttclidValue = getQueryParam(siteUrl, 'ttclid');
      var fbclidValue = getQueryParam(siteUrl, 'fbclid');
      var msclkidValue = getQueryParam(siteUrl, 'msclkid');
      var bdvidValue = getQueryParam(siteUrl, 'bd_vid');
      if (gclidValue) {
        uniq_utm_config['utm_gclid'] = gclidValue;
      }
      if (gbraidValue) {
        uniq_utm_config['utm_gbraid'] = gbraidValue;
      }
      if (wbraidValue) {
        uniq_utm_config['utm_wbraid'] = wbraidValue;
      }
      if (ttclidValue) {
        uniq_utm_config['utm_ttclid'] = ttclidValue;
      }
      if (fbclidValue) {
        uniq_utm_config['utm_fbclid'] = fbclidValue;
      }
      if (msclkidValue) {
        uniq_utm_config['utm_msclkid'] = msclkidValue;
      }
      if (bdvidValue) {
        uniq_utm_config['utm_bdvid'] = bdvidValue;
        uniq_utm_config['utm_bdlogidurl'] = siteUrl;
      }
      if (needSetCookie) {
        var cookieDomain = getTrackDomain();
        var cookieConfig = {
          expires: 120,
          path: '/',
          domain: cookieDomain
        }
        if (window.$ && window.$.cookie) {
          window.$.cookie('__uniq_utm_config', JSON.stringify(uniq_utm_config), cookieConfig);
        } else {
          setCookieItem('__uniq_utm_config', JSON.stringify(uniq_utm_config), cookieConfig);
        }
      } else {
        var utmLoopId = setInterval(()=> {
          if(document.body) {
            var $inputs = document.getElementsByClassName('sign-up-utm-config-input')
            var configStr = encodeURIComponent(JSON.stringify(uniq_utm_config))
            for (var $item of $inputs ) {
              $item.value = configStr
            }
            clearInterval(utmLoopId)
          }
        }, 500)
      }
    }
  }
  function recordBaiDuAnalyticsCookies() {
    var siteUrl = document.URL;
    var baiduVid = getQueryParam(siteUrl, 'bd_vid');
    if (baiduVid) {
      var analyticsDomain = getTrackDomain();
      setCookieItem('__bd_analytics_config', JSON.stringify({
        bd_vid: baiduVid,
        logid_url: siteUrl
      }), {
        expires: 120,
        path: '/',
        domain: analyticsDomain
      });
    }
  }
  function recordFacebookAnalyticsCookies() {
    var siteUrl = document.URL;
    var fbclid = getQueryParam(siteUrl, 'fbclid');
    if (fbclid) {
      var trackDomain = getTrackDomain();
      setCookieItem('__fe_fbclid', fbclid, {
        expires: 90,
        path: '/',
        domain: trackDomain
      });
    }
  }
  
  const isShowCookieNotification = $S?.stores?.pageData?.showCookieNotification
  || $S?.blogPostData?.pageData?.showCookieNotification
  
  function handleRecordUniqUtmCookies() {
    try {
      if (getCookieItem('__strk_cookie_eu_visitor') === 'true' && !getCookieItem('__is_open_strk_analytics_cookie')) {
        recordUniqUtmCookies(null, false)
        return
      } else if(!isShowCookieNotification) {
        recordUniqUtmCookies();
      }
    } catch (error) {
      console.error(error);
    }
  }
  
  // record unique utm cookies
  handleRecordUniqUtmCookies();
  
  // record Bai Du analytics cookies for sxl
  try {
    if(!isShowCookieNotification) {
      recordBaiDuAnalyticsCookies();
    }
  } catch (error) {
    console.error(error);
  }
  
  function handleRecordFacebookAnalyticsCookies() {
    try {
      if (getCookieItem('__strk_cookie_eu_visitor') === 'true' && !getCookieItem('__is_open_strk_analytics_cookie')) {
        return
      } else if(!isShowCookieNotification) {
        recordFacebookAnalyticsCookies();
      }
    } catch (error) {
      console.error(error);
    }
  }
  // record Fackbook analytics cookies
  handleRecordFacebookAnalyticsCookies();