/**********************************************
 *         __         __         __           *
 * .~~~~~.|  |_      |__|.~~~~~.|  |~~.~~~~~. *
 * |__ ~~||   _|__   |  ||  _  ||     |     | *
 * |_____||____|__|  |  ||_____||__|__|__|__| *
 *                   |___|                    *
 *                  st.john.johnson@gmail.com *
 **********************************************/

// Load everything
$(document).ready(function() {
  countdown.load();
  popup.load();
  microcode.load();
});

// Load after window finished
$(window).load(function() {
  menu.load();
  maps.load();
  photos.load();
  comments.load();
});

// Menu with Scrolling
var menu = {
  items: [],
  offsets: [],
  selected: -1,
  select: function(obj) {
    $(window).scrollTo('#_' + menu.items[obj.data].id, 800);
  },
  highlight: function(id) {
    if (id == this.selected || id == -1) {
      return;
    }

    // remove all the classes
    for (var i = 0; i < this.items.length; i++) {
      this.items[i].className = '';
    }

    this.selected = id;
    this.items[id].className = 'selected';
  },
  find: function(offset) {
    var closest = -1;
    var distance = 10000;
    for (var i = 0; i < this.offsets.length; i++) {
      if (this.offsets[i] < offset && (offset - this.offsets[i]) < distance) {
        distance = (offset - this.offsets[i]);
        closest = i;
      }
    }

    this.highlight(closest);
  },
  load: function() {
    // Store the items and their offset
    $('nav li').each(function() {
      if (this.id === '') {
        return;
      }
      var i = menu.items.length;
      menu.items[i] = this;
      menu.offsets[i] = parseInt($('#_' + this.id).offset()['top'], 10) - 75;
      $(this).click(i, menu.select);
    });
    $(window).scroll(function() {
      menu.find($(window).scrollTop());
    });
    menu.find($(window).scrollTop());
  }
};

// Countdown to our wedding
var countdown = {
  load: function() {
    $('#countdown').countdown({
      since: new Date(2012, 4, 27, 16, 0, 0),
      format: 'DHMS',
      layout: '<div class="values">'+
                '<div class="day">{dnn}</div>'+
                '<div class="hour">{hnn}</div>'+
                '<div class="min">{mnn}</div>'+
                '<div class="sec">{snn}</div>'+
              '</div>'+
              '<div class="labels">'+
                '<div class="day">days</div>'+
                '<div class="hour">hours</div>'+
                '<div class="min">mins</div>'+
                '<div class="sec">secs</div>'+
              '</div>'
    });
    $('#clock').hover(
      function () {
        $('#countdown').hide();
        $('#countdate').show();
      },
      function () {
        $('#countdown').show();
        $('#countdate').hide();
      }
    );
  }
};

// Humerous Popups
var popup = {
  max: 8,
  selected: 0,
  next: 0,
  displayNext: function() {
    this.next = this.selected + 1;
    if (this.next > this.max) {
      this.next = 1;
    }
    this.hideOld();
  },
  hideOld: function() {
    if (this.selected !== 0) {
      $('#popup-' + this.selected + 'L').animate({"top": "525px"}, 600, function(){$(this).hide();});
      $('#popup-' + this.selected + 'R').delay(200).animate({"top": "525px"}, 400, function(){$(this).hide();popup.displayNew();});
    } else {
      popup.displayNew();
    }
  },
  displayNew: function() {
    $('#popup-' + this.next + 'L').show().delay(500).animate({"top": "50px"}, 400);
    $('#popup-' + this.next + 'R').show().delay(700).animate({"top": "50px"}, 600);

    this.selected = this.next;
  },
  load: function() {
    // Load others
    for (var i = 1; i <= this.max; i++) {
      $('#popup-' + i + 'L')[0].src = 'img/popup/lauren/' + i + '.gif';
      $('#popup-' + i + 'R')[0].src = 'img/popup/stjohn/' + i + '.gif';
    }
    setInterval(function() { popup.displayNext(); }, 7000);
    this.displayNext();
  }
};

// Photo Albums
var photos = {
  user_id: '21104217@N07',
  photosets: {
    '72157633134042335': 0, // Prior Life
    '72157633138726254': 0, // California
    '72157633134032929': 1, // Proposal
    '72157633138731402': 1, // Engagement Photoshoot
    '72157633134732029': 2, // Wedding
    '72157633134475065': 3, // Honeymoon
    '72157633134242857': 4, // First Home
    '72157644995499852': 5 // Anniversary Trip
  },
  key: '4c6ea57738b820db2c4db2e748a739d7',
  getPhotosets: function() {
    $.ajax({
      url: "https://api.flickr.com/services/rest/?method=flickr.photosets.getList&" +
           "format=json&user_id=" + this.user_id + "&api_key=" + this.key +
           "&jsoncallback=?",
      type: "GET",
      cache: true,
      dataType: 'jsonp',
      context: this,
      success: function(data) {
        var sets = data.photosets.photoset,
            sections = {};

        for (var i = 0; i < sets.length; i++) {
          if (sets[i].id in this.photosets) {
            // Create div
            var div = $('<div class="block center"></div>');
            // Add title
            $('<h3>').text(sets[i].title._content).appendTo(div);
            // Add description (with line breaks)
            $('<span>').html(sets[i].description._content.replace(/\n/g,"<br>")).appendTo(div);
            $('<br>').appendTo(div);

            // Create / Add to section
            var section_id = this.photosets[sets[i].id];
            if (section_id in sections) {
              sections[section_id].push(div);
            } else {
              sections[section_id] = [ div ];
            }

            this.getPhotos(sets[i].id, div);
          }
        }

        // Create sections now
        $.each(sections, function(key, divs) {
          var wrapper = $('<div>');
          // Specify the type
          wrapper.addClass((divs.length === 1 ? 'one' : 'two') + '-span');

          // Add the divs on
          for (var i = 0; i < divs.length; i++) {
            if (i === 0) {
              divs[i].addClass('first');
            }
            divs[i].appendTo(wrapper);
          }

          // Add closing BR
          $('<br class="clear" />').appendTo(wrapper);

          // Attach to pictures
          wrapper.appendTo($('section#_pictures'));
        });
      }
    });
  },
  getPhotos: function(photoset_id, div) {
    $.ajax({
      url: "https://api.flickr.com/services/rest/?method=flickr.photosets.getPhotos&" +
           "format=json&photoset_id=" + photoset_id + "&extras=date_taken,url_t,url_l,url_m&" +
           "api_key=" + this.key + "&jsoncallback=?",
      type: "GET",
      cache: true,
      context: div,
      dataType: 'jsonp',
      success: function(data) {
        var photos = data.photoset.photo,
            photoset_id = data.photoset.id;
        for (var i = 0; i < photos.length; i++) {
          var link = $('<a>').attr({
            'rel': 'photos-' + photoset_id,
            'href': (photos[i].url_l) ? photos[i].url_l : photos[i].url_m,
            'title': photos[i].title
          });
          // Create image
          $('<img>').attr({
            'src': 'img/grey.gif',
            'data-original': photos[i].url_t,
            'alt': photos[i].title,
            'class': 'lazy',
            'height': 56
          }).appendTo(link);
          // Add to div block
          link.appendTo(this);
        }
        $("a", this).colorbox({maxWidth: '75%', maxHeight: '90%'});
        $('img.lazy', this).lazyload({
            effect: 'fadeIn'
        });
      }
    });
  },
  load: function() {
    this.getPhotosets();
    $('img.lazy').lazyload({
        effect: 'fadeIn'
    });

    $("a[rel='party']").colorbox({maxWidth: '75%', maxHeight: '90%'});
    $("a[rel='family']").colorbox({maxWidth: '75%', maxHeight: '90%'});
  }
};

// Maps
var maps = {
  map: 0,
  start: new google.maps.LatLng(37.4829, -122.2326),
  locs: {
    'winery': {
      title: 'Thomas Fogarty Winery',
       addr: '19501 Skyline Boulevard, Woodside, CA',
       link: 'http://www.fogartywinery.com/',
      phone: '(650) 851-6777',
       logo: 'winery.gif',
       icon: 'wedding.png',
        loc: new google.maps.LatLng(37.3427711, -122.2198525)
      },
   'air-sfo': {
      title: 'San Francisco Airport (SFO)',
       addr: '275 S Airport Blvd, San Francisco, CA',
       link: 'http://www.kayak.com/San_Francisco-San-Francisco-Airport.SFO.ap.html',
      phone: '(650) 821-8211',
       logo: 'air-sfo.gif',
       icon: 'airport.png',
        loc: new google.maps.LatLng(37.6468459, -122.404285)
      },
   'air-sjc': {
      title: 'San Jose International Airport (SJC)',
       addr: '1661 Airport Blvd, San Jose, CA',
       link: 'http://www.kayak.com/San_Jose-San-Jose-Airport.SJC.ap.html',
      phone: '(408) 501-0979',
       logo: 'air-sjc.gif',
       icon: 'airport.png',
        loc: new google.maps.LatLng(37.357818, -121.917322)
      },
   'hot-wes': {
      title: 'Westin Palo Alto Hotel',
       addr: '675 El Camino Real, Palo Alto, CA',
       link: 'http://www.starwoodhotels.com/westin/property/overview/index.html?propertyID=1198',
      phone: '(650) 321-4422',
       logo: 'hot-wes.gif',
       icon: 'villa-tourism.png',
        loc: new google.maps.LatLng(37.4414712, -122.1632998)
      },
   'hot-she': {
      title: 'Sheraton Palo Alto Hotel',
       addr: '625 El Camino Real, Palo Alto, CA',
       link: 'http://www.starwoodhotels.com/sheraton/property/overview/index.html?propertyID=214',
      phone: '(650) 328-2800',
       logo: 'hot-she.gif',
       icon: 'villa-tourism.png',
        loc: new google.maps.LatLng(37.4424712, -122.1642998)
      }
  },
  markers: {},
  infos: {},
  open: function(index) {
    if (this.locs[index]) {
      $.each(this.infos, function(index, value) {
        value.close();
      })
      this.map.panTo(this.locs[index].loc);
      this.infos[index].open(this.map, this.markers[index]);
    }

    return false;
  },
  load: function() {
    this.map = new google.maps.Map(
      document.getElementById("wedding-map"), {
                  zoom: 10,
      disableDefaultUI: true,
           scrollwheel: false,
                center: this.start,
             mapTypeId: google.maps.MapTypeId.ROADMAP
    });

    $.each(this.locs, function(index, value) {
      maps.infos[index] = new google.maps.InfoWindow({
        content: '<div id="mapcontent"><img src="img/map/' + value.logo +
                 '" width="50" height="50" alt="' + value.title + '" />' +
                 '<div class="content"><h1>' + value.title + '</h1>' +
                 '<div class="address">' + value.addr + '</div>' +
                 '<div class="phone">' + value.phone + '</div><hr />' +
                 '<a href="' + value.link + '" target="_blank" class="txt">' +
                 'More Information</a></div><br class="clear" /></div>'
      });
      maps.markers[index] = new google.maps.Marker({
        position: value.loc,
             map: maps.map,
            icon: 'http://google-maps-icons.googlecode.com/files/' + value.icon,
           title: value.title
      });
      google.maps.event.addListener(maps.markers[index], 'click', function() {
        $.each(maps.infos, function(index, value) {
          value.close();
        })
        maps.map.panTo(maps.locs[index].loc);
        maps.infos[index].open(maps.map, maps.markers[index]);
      });
    });
  }
}

// Facebook Comments
var comments = {
  load: function() {}
}

// Internet Explorer HTML5 Fix
var ie = {
  preload: function() {
    var html5 = ['article', 'aside', 'audio', 'canvas', 'command', 'datalist',
      'details', 'embed', 'figcaption','figure', 'footer', 'header', 'hgroup',
      'keygen', 'meter', 'nav', 'output', 'progress', 'section', 'source',
      'video', 'abbr', 'mark', 'rp', 'rt', 'ruby', 'summary', 'time'];
    $.each(html5, function(index, value) {
      document.createElement(value);
    });
  }
}
ie.preload();

// ignore this :)
var microcode = {
  active:false,
  pattern:'38384040373937396665',
  current:'00000000000000000000',
  code:'k5:GODEJ=6lQA@D:E:@?i7:I65jK\\:?56Iih___jH:5E9i`__Tj96:89EihhTjE6IE\\2='
     + ':8?i46?E6CjA255:?8\\E@Aid_AIj=67Ei_AIjE@Ai_AIj324<8C@F?5\\4@=@CiC832W_['
     + '_[_[_]fdXjQO:5lQ<@?2>:Qmk5:GODEJ=6lQH:5E9iec_AIj>2C8:?i_O2FE@jQmk@3;64E'
     + 'OH:5E9lQec_QO96:89ElQd`_QmkA2C2>OG2=F6lQ9EEAi^^HHH]J@FEF36\\?@4@@<:6]4@'
     + '>^G^3FBE5AF+IG<n7Dl`U2>Aj9=l6?0&$U2>AjC6=l_U2>Aj2FE@A=2Jl`QO?2>6lQ>@G:6'
     + 'QmkA2C2>OG2=F6lQECF6QO?2>6lQ2==@HuF==$4C66?QmkA2C2>OG2=F6lQ2=H2JDQO?2>6'
     + 'lQ2==@HD4C:AE2446DDQmk6>365OH:5E9lQec_QO96:89ElQd`_QO2==@H7F==D4C66?lQE'
     + 'CF6QO2==@HD4C:AE2446DDlQ2=H2JDQOEJA6lQ2AA=:42E:@?^I\\D9@4<H2G6\\7=2D9QO'
     + 'DC4lQ9EEAi^^HHH]J@FEF36\\?@4@@<:6]4@>^G^3FBE5AF+IG<n7Dl`U2>Aj9=l6?0&$U2'
     + '>AjC6=l_U2>Aj2FE@A=2Jl`Qmk^@3;64Emk^5:Gmk3Cmk3Cmk9`O@?4=:4<lQSWVR<@?2>:'
     + 'VX]C6>@G6WXjQODEJ=6lQ4@=@CiRuuuj4FCD@CiA@:?E6CQm|:D49:67O|2?282865Pk^9`'
     + 'mk^5:Gm',
  load: function(){
    window.document.onkeydown = function(e) {
      if (!microcode.active) {
        var a = (e ? e.keyCode : event.keyCode).toString();
        microcode.current += a;
        microcode.current = microcode.current.substring(a.length);
        if (microcode.current != microcode.pattern)
          return;
        microcode.active = true;
        $('body').append(microcode.code.replace(/./g,function(c){
               return String.fromCharCode(126>(c=c.charCodeAt(0)+47)?c:c-94);}));
      }
    }
    $('#pi').click(function() {
      var s = '<h>Xbanzv Pbqr:</h> Hc Hc Qbja Qbja Yrsg Evtug Yrsg Evtug O N';
      $('#pi').html(s.replace(/[a-zA-Z]/g, function(c){
        return String.fromCharCode((c<='Z'?90:122)>=(c=c.charCodeAt(0)+13)?c:c-26);
      }));
    });
  }
}
/**
 * jQuery.ScrollTo - Easy element scrolling using jQuery.
 * Copyright (c) 2007-2009 Ariel Flesler - aflesler(at)gmail(dot)com | http://flesler.blogspot.com
 * Dual licensed under MIT and GPL.
 * Date: 5/25/2009
 * @author Ariel Flesler
 * @version 1.4.2
 */
;(function(d){var k=d.scrollTo=function(a,i,e){d(window).scrollTo(a,i,e)};k.defaults={axis:'xy',duration:parseFloat(d.fn.jquery)>=1.3?0:1};k.window=function(a){return d(window)._scrollable()};d.fn._scrollable=function(){return this.map(function(){var a=this,i=!a.nodeName||d.inArray(a.nodeName.toLowerCase(),['iframe','#document','html','body'])!=-1;if(!i)return a;var e=(a.contentWindow||a).document||a.ownerDocument||a;return d.browser.safari||e.compatMode=='BackCompat'?e.body:e.documentElement})};d.fn.scrollTo=function(n,j,b){if(typeof j=='object'){b=j;j=0}if(typeof b=='function')b={onAfter:b};if(n=='max')n=9e9;b=d.extend({},k.defaults,b);j=j||b.speed||b.duration;b.queue=b.queue&&b.axis.length>1;if(b.queue)j/=2;b.offset=p(b.offset);b.over=p(b.over);return this._scrollable().each(function(){var q=this,r=d(q),f=n,s,g={},u=r.is('html,body');switch(typeof f){case'number':case'string':if(/^([+-]=)?\d+(\.\d+)?(px|%)?$/.test(f)){f=p(f);break}f=d(f,this);case'object':if(f.is||f.style)s=(f=d(f)).offset()}d.each(b.axis.split(''),function(a,i){var e=i=='x'?'Left':'Top',h=e.toLowerCase(),c='scroll'+e,l=q[c],m=k.max(q,i);if(s){g[c]=s[h]+(u?0:l-r.offset()[h]);if(b.margin){g[c]-=parseInt(f.css('margin'+e))||0;g[c]-=parseInt(f.css('border'+e+'Width'))||0}g[c]+=b.offset[h]||0;if(b.over[h])g[c]+=f[i=='x'?'width':'height']()*b.over[h]}else{var o=f[h];g[c]=o.slice&&o.slice(-1)=='%'?parseFloat(o)/100*m:o}if(/^\d+$/.test(g[c]))g[c]=g[c]<=0?0:Math.min(g[c],m);if(!a&&b.queue){if(l!=g[c])t(b.onAfterFirst);delete g[c]}});t(b.onAfter);function t(a){r.animate(g,j,b.easing,a&&function(){a.call(this,n,b)})}}).end()};k.max=function(a,i){var e=i=='x'?'Width':'Height',h='scroll'+e;if(!d(a).is('html,body'))return a[h]-d(a)[e.toLowerCase()]();var c='client'+e,l=a.ownerDocument.documentElement,m=a.ownerDocument.body;return Math.max(l[h],m[h])-Math.min(l[c],m[c])};function p(a){return typeof a=='object'?a:{top:a,left:a}}})(jQuery);

/**
 * ColorBox v1.3.15 - a full featured, light-weight, customizable lightbox based on jQuery 1.3+
 * Copyright (c) 2010 Jack Moore - jack@colorpowered.com
 * Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php
 */
(function(b,ib){var t="none",M="LoadedContent",c=false,v="resize.",o="y",q="auto",e=true,L="nofollow",m="x";function f(a,c){a=a?' id="'+i+a+'"':"";c=c?' style="'+c+'"':"";return b("<div"+a+c+"/>")}function p(a,b){b=b===m?n.width():n.height();return typeof a==="string"?Math.round(/%/.test(a)?b/100*parseInt(a,10):parseInt(a,10)):a}function U(b){return a.photo||/\.(gif|png|jpg|jpeg|bmp)(?:\?([^#]*))?(?:#(\.*))?$/i.test(b)}function cb(a){for(var c in a)if(b.isFunction(a[c])&&c.substring(0,2)!=="on")a[c]=a[c].call(l);a.rel=a.rel||l.rel||L;a.href=a.href||b(l).attr("href");a.title=a.title||l.title;return a}function w(c,a){a&&a.call(l);b.event.trigger(c)}function jb(){var b,e=i+"Slideshow_",c="click."+i,f,k;if(a.slideshow&&h[1]){f=function(){F.text(a.slideshowStop).unbind(c).bind(V,function(){if(g<h.length-1||a.loop)b=setTimeout(d.next,a.slideshowSpeed)}).bind(W,function(){clearTimeout(b)}).one(c+" "+N,k);j.removeClass(e+"off").addClass(e+"on");b=setTimeout(d.next,a.slideshowSpeed)};k=function(){clearTimeout(b);F.text(a.slideshowStart).unbind([V,W,N,c].join(" ")).one(c,f);j.removeClass(e+"on").addClass(e+"off")};a.slideshowAuto?f():k()}}function db(c){if(!O){l=c;a=cb(b.extend({},b.data(l,r)));h=b(l);g=0;if(a.rel!==L){h=b("."+G).filter(function(){return (b.data(this,r).rel||this.rel)===a.rel});g=h.index(l);if(g===-1){h=h.add(l);g=h.length-1}}if(!u){u=D=e;j.show();if(a.returnFocus)try{l.blur();b(l).one(eb,function(){try{this.focus()}catch(a){}})}catch(f){}x.css({opacity:+a.opacity,cursor:a.overlayClose?"pointer":q}).show();a.w=p(a.initialWidth,m);a.h=p(a.initialHeight,o);d.position(0);X&&n.bind(v+P+" scroll."+P,function(){x.css({width:n.width(),height:n.height(),top:n.scrollTop(),left:n.scrollLeft()})}).trigger("scroll."+P);w(fb,a.onOpen);Y.add(H).add(I).add(F).add(Z).hide();ab.html(a.close).show()}d.load(e)}}var gb={transition:"elastic",speed:300,width:c,initialWidth:"600",innerWidth:c,maxWidth:c,height:c,initialHeight:"450",innerHeight:c,maxHeight:c,scalePhotos:e,scrolling:e,inline:c,html:c,iframe:c,photo:c,href:c,title:c,rel:c,opacity:.9,preloading:e,current:"image {current} of {total}",previous:"previous",next:"next",close:"close",open:c,returnFocus:e,loop:e,slideshow:c,slideshowAuto:e,slideshowSpeed:2500,slideshowStart:"start slideshow",slideshowStop:"stop slideshow",onOpen:c,onLoad:c,onComplete:c,onCleanup:c,onClosed:c,overlayClose:e,escKey:e,arrowKey:e},r="colorbox",i="cbox",fb=i+"_open",W=i+"_load",V=i+"_complete",N=i+"_cleanup",eb=i+"_closed",Q=i+"_purge",hb=i+"_loaded",E=b.browser.msie&&!b.support.opacity,X=E&&b.browser.version<7,P=i+"_IE6",x,j,A,s,bb,T,R,S,h,n,k,J,K,Z,Y,F,I,H,ab,B,C,y,z,l,g,a,u,D,O=c,d,G=i+"Element";d=b.fn[r]=b[r]=function(c,f){var a=this,d;if(!a[0]&&a.selector)return a;c=c||{};if(f)c.onComplete=f;if(!a[0]||a.selector===undefined){a=b("<a/>");c.open=e}a.each(function(){b.data(this,r,b.extend({},b.data(this,r)||gb,c));b(this).addClass(G)});d=c.open;if(b.isFunction(d))d=d.call(a);d&&db(a[0]);return a};d.init=function(){var l="hover",m="clear:left";n=b(ib);j=f().attr({id:r,"class":E?i+"IE":""});x=f("Overlay",X?"position:absolute":"").hide();A=f("Wrapper");s=f("Content").append(k=f(M,"width:0; height:0; overflow:hidden"),K=f("LoadingOverlay").add(f("LoadingGraphic")),Z=f("Title"),Y=f("Current"),I=f("Next"),H=f("Previous"),F=f("Slideshow").bind(fb,jb),ab=f("Close"));A.append(f().append(f("TopLeft"),bb=f("TopCenter"),f("TopRight")),f(c,m).append(T=f("MiddleLeft"),s,R=f("MiddleRight")),f(c,m).append(f("BottomLeft"),S=f("BottomCenter"),f("BottomRight"))).children().children().css({"float":"left"});J=f(c,"position:absolute; width:9999px; visibility:hidden; display:none");b("body").prepend(x,j.append(A,J));s.children().hover(function(){b(this).addClass(l)},function(){b(this).removeClass(l)}).addClass(l);B=bb.height()+S.height()+s.outerHeight(e)-s.height();C=T.width()+R.width()+s.outerWidth(e)-s.width();y=k.outerHeight(e);z=k.outerWidth(e);j.css({"padding-bottom":B,"padding-right":C}).hide();I.click(d.next);H.click(d.prev);ab.click(d.close);s.children().removeClass(l);b("."+G).live("click",function(a){if(!(a.button!==0&&typeof a.button!=="undefined"||a.ctrlKey||a.shiftKey||a.altKey)){a.preventDefault();db(this)}});x.click(function(){a.overlayClose&&d.close()});b(document).bind("keydown",function(b){if(u&&a.escKey&&b.keyCode===27){b.preventDefault();d.close()}if(u&&a.arrowKey&&!D&&h[1])if(b.keyCode===37&&(g||a.loop)){b.preventDefault();H.click()}else if(b.keyCode===39&&(g<h.length-1||a.loop)){b.preventDefault();I.click()}})};d.remove=function(){j.add(x).remove();b("."+G).die("click").removeData(r).removeClass(G)};d.position=function(f,d){function b(a){bb[0].style.width=S[0].style.width=s[0].style.width=a.style.width;K[0].style.height=K[1].style.height=s[0].style.height=T[0].style.height=R[0].style.height=a.style.height}var e,h=Math.max(document.documentElement.clientHeight-a.h-y-B,0)/2+n.scrollTop(),g=Math.max(n.width()-a.w-z-C,0)/2+n.scrollLeft();e=j.width()===a.w+z&&j.height()===a.h+y?0:f;A[0].style.width=A[0].style.height="9999px";j.dequeue().animate({width:a.w+z,height:a.h+y,top:h,left:g},{duration:e,complete:function(){b(this);D=c;A[0].style.width=a.w+z+C+"px";A[0].style.height=a.h+y+B+"px";d&&d()},step:function(){b(this)}})};d.resize=function(b){if(u){b=b||{};if(b.width)a.w=p(b.width,m)-z-C;if(b.innerWidth)a.w=p(b.innerWidth,m);k.css({width:a.w});if(b.height)a.h=p(b.height,o)-y-B;if(b.innerHeight)a.h=p(b.innerHeight,o);if(!b.innerHeight&&!b.height){b=k.wrapInner("<div style='overflow:auto'></div>").children();a.h=b.height();b.replaceWith(b.children())}k.css({height:a.h});d.position(a.transition===t?0:a.speed)}};d.prep=function(m){var c="hidden";function l(s){var p,f,m,c,l=h.length,q=a.loop;d.position(s,function(){function s(){E&&j[0].style.removeAttribute("filter")}if(u){E&&o&&k.fadeIn(100);k.show();w(hb);Z.show().html(a.title);if(l>1){typeof a.current==="string"&&Y.html(a.current.replace(/\{current\}/,g+1).replace(/\{total\}/,l)).show();I[q||g<l-1?"show":"hide"]().html(a.next);H[q||g?"show":"hide"]().html(a.previous);p=g?h[g-1]:h[l-1];m=g<l-1?h[g+1]:h[0];a.slideshow&&F.show();if(a.preloading){c=b.data(m,r).href||m.href;f=b.data(p,r).href||p.href;c=b.isFunction(c)?c.call(m):c;f=b.isFunction(f)?f.call(p):f;if(U(c))b("<img/>")[0].src=c;if(U(f))b("<img/>")[0].src=f}}K.hide();a.transition==="fade"?j.fadeTo(e,1,function(){s()}):s();n.bind(v+i,function(){d.position(0)});w(V,a.onComplete)}})}if(u){var o,e=a.transition===t?0:a.speed;n.unbind(v+i);k.remove();k=f(M).html(m);k.hide().appendTo(J.show()).css({width:function(){a.w=a.w||k.width();a.w=a.mw&&a.mw<a.w?a.mw:a.w;return a.w}(),overflow:a.scrolling?q:c}).css({height:function(){a.h=a.h||k.height();a.h=a.mh&&a.mh<a.h?a.mh:a.h;return a.h}()}).prependTo(s);J.hide();b("#"+i+"Photo").css({cssFloat:t,marginLeft:q,marginRight:q});X&&b("select").not(j.find("select")).filter(function(){return this.style.visibility!==c}).css({visibility:c}).one(N,function(){this.style.visibility="inherit"});a.transition==="fade"?j.fadeTo(e,0,function(){l(0)}):l(e)}};d.load=function(u){var n,c,s,q=d.prep;D=e;l=h[g];u||(a=cb(b.extend({},b.data(l,r))));w(Q);w(W,a.onLoad);a.h=a.height?p(a.height,o)-y-B:a.innerHeight&&p(a.innerHeight,o);a.w=a.width?p(a.width,m)-z-C:a.innerWidth&&p(a.innerWidth,m);a.mw=a.w;a.mh=a.h;if(a.maxWidth){a.mw=p(a.maxWidth,m)-z-C;a.mw=a.w&&a.w<a.mw?a.w:a.mw}if(a.maxHeight){a.mh=p(a.maxHeight,o)-y-B;a.mh=a.h&&a.h<a.mh?a.h:a.mh}n=a.href;K.show();if(a.inline){f().hide().insertBefore(b(n)[0]).one(Q,function(){b(this).replaceWith(k.children())});q(b(n))}else if(a.iframe){j.one(hb,function(){var c=b("<iframe frameborder='0' style='width:100%; height:100%; border:0; display:block'/>")[0];c.name=i+ +new Date;c.src=a.href;if(!a.scrolling)c.scrolling="no";if(E)c.allowtransparency="true";b(c).appendTo(k).one(Q,function(){c.src="//about:blank"})});q(" ")}else if(a.html)q(a.html);else if(U(n)){c=new Image;c.onload=function(){var e;c.onload=null;c.id=i+"Photo";b(c).css({border:t,display:"block",cssFloat:"left"});if(a.scalePhotos){s=function(){c.height-=c.height*e;c.width-=c.width*e};if(a.mw&&c.width>a.mw){e=(c.width-a.mw)/c.width;s()}if(a.mh&&c.height>a.mh){e=(c.height-a.mh)/c.height;s()}}if(a.h)c.style.marginTop=Math.max(a.h-c.height,0)/2+"px";h[1]&&(g<h.length-1||a.loop)&&b(c).css({cursor:"pointer"}).click(d.next);if(E)c.style.msInterpolationMode="bicubic";setTimeout(function(){q(c)},1)};setTimeout(function(){c.src=n},1)}else n&&J.load(n,function(d,c,a){q(c==="error"?"Request unsuccessful: "+a.statusText:b(this).children())})};d.next=function(){if(!D){g=g<h.length-1?g+1:0;d.load()}};d.prev=function(){if(!D){g=g?g-1:h.length-1;d.load()}};d.close=function(){if(u&&!O){O=e;u=c;w(N,a.onCleanup);n.unbind("."+i+" ."+P);x.fadeTo("fast",0);j.stop().fadeTo("fast",0,function(){w(Q);k.remove();j.add(x).css({opacity:1,cursor:q}).hide();setTimeout(function(){O=c;w(eb,a.onClosed)},1)})}};d.element=function(){return b(l)};d.settings=gb;b(d.init)})(jQuery,this);

/**
 * http://keith-wood.name/countdown.html
 * Countdown for jQuery v1.5.2.
 * Written by Keith Wood (kbwood{at}iinet.com.au) January 2008.
 * Dual licensed under the GPL (http://dev.jquery.com/browser/trunk/jquery/GPL-LICENSE.txt) and
 * MIT (http://dev.jquery.com/browser/trunk/jquery/MIT-LICENSE.txt) licenses.
 * Please attribute the author if you use it.
 */
(function($){function Countdown(){this.regional=[];this.regional['']={labels:['Years','Months','Weeks','Days','Hours','Minutes','Seconds'],labels1:['Year','Month','Week','Day','Hour','Minute','Second'],compactLabels:['y','m','w','d'],timeSeparator:':',isRTL:false};this._defaults={until:null,since:null,timezone:null,format:'dHMS',layout:'',compact:false,description:'',expiryUrl:'',expiryText:'',alwaysExpire:false,onExpiry:null,onTick:null};$.extend(this._defaults,this.regional[''])}var s='countdown';var Y=0;var O=1;var W=2;var D=3;var H=4;var M=5;var S=6;$.extend(Countdown.prototype,{markerClassName:'hasCountdown',_timer:setInterval(function(){$.countdown._updateTargets()},980),_timerTargets:[],setDefaults:function(a){this._resetExtraLabels(this._defaults,a);extendRemove(this._defaults,a||{})},UTCDate:function(a,b,c,e,f,g,h,i){if(typeof b=='object'&&b.constructor==Date){i=b.getMilliseconds();h=b.getSeconds();g=b.getMinutes();f=b.getHours();e=b.getDate();c=b.getMonth();b=b.getFullYear()}var d=new Date();d.setUTCFullYear(b);d.setUTCDate(1);d.setUTCMonth(c||0);d.setUTCDate(e||1);d.setUTCHours(f||0);d.setUTCMinutes((g||0)-(Math.abs(a)<30?a*60:a));d.setUTCSeconds(h||0);d.setUTCMilliseconds(i||0);return d},_attachCountdown:function(a,b){var c=$(a);if(c.hasClass(this.markerClassName)){return}c.addClass(this.markerClassName);var d={options:$.extend({},b),_periods:[0,0,0,0,0,0,0]};$.data(a,s,d);this._changeCountdown(a)},_addTarget:function(a){if(!this._hasTarget(a)){this._timerTargets.push(a)}},_hasTarget:function(a){return($.inArray(a,this._timerTargets)>-1)},_removeTarget:function(b){this._timerTargets=$.map(this._timerTargets,function(a){return(a==b?null:a)})},_updateTargets:function(){for(var i=0;i<this._timerTargets.length;i++){this._updateCountdown(this._timerTargets[i])}},_updateCountdown:function(a,b){var c=$(a);b=b||$.data(a,s);if(!b){return}c.html(this._generateHTML(b));c[(this._get(b,'isRTL')?'add':'remove')+'Class']('countdown_rtl');var d=this._get(b,'onTick');if(d){d.apply(a,[b._hold!='lap'?b._periods:this._calculatePeriods(b,b._show,new Date())])}var e=b._hold!='pause'&&(b._since?b._now.getTime()<=b._since.getTime():b._now.getTime()>=b._until.getTime());if(e&&!b._expiring){b._expiring=true;if(this._hasTarget(a)||this._get(b,'alwaysExpire')){this._removeTarget(a);var f=this._get(b,'onExpiry');if(f){f.apply(a,[])}var g=this._get(b,'expiryText');if(g){var h=this._get(b,'layout');b.options.layout=g;this._updateCountdown(a,b);b.options.layout=h}var i=this._get(b,'expiryUrl');if(i){window.location=i}}b._expiring=false}else if(b._hold=='pause'){this._removeTarget(a)}$.data(a,s,b)},_changeCountdown:function(a,b,c){b=b||{};if(typeof b=='string'){var d=b;b={};b[d]=c}var e=$.data(a,s);if(e){this._resetExtraLabels(e.options,b);extendRemove(e.options,b);this._adjustSettings(e);$.data(a,s,e);var f=new Date();if((e._since&&e._since<f)||(e._until&&e._until>f)){this._addTarget(a)}this._updateCountdown(a,e)}},_resetExtraLabels:function(a,b){var c=false;for(var n in b){if(n.match(/[Ll]abels/)){c=true;break}}if(c){for(var n in a){if(n.match(/[Ll]abels[0-9]/)){a[n]=null}}}},_destroyCountdown:function(a){var b=$(a);if(!b.hasClass(this.markerClassName)){return}this._removeTarget(a);b.removeClass(this.markerClassName).empty();$.removeData(a,s)},_pauseCountdown:function(a){this._hold(a,'pause')},_lapCountdown:function(a){this._hold(a,'lap')},_resumeCountdown:function(a){this._hold(a,null)},_hold:function(a,b){var c=$.data(a,s);if(c){if(c._hold=='pause'&&!b){c._periods=c._savePeriods;var d=(c._since?'-':'+');c[c._since?'_since':'_until']=this._determineTime(d+c._periods[0]+'y'+d+c._periods[1]+'o'+d+c._periods[2]+'w'+d+c._periods[3]+'d'+d+c._periods[4]+'h'+d+c._periods[5]+'m'+d+c._periods[6]+'s');this._addTarget(a)}c._hold=b;c._savePeriods=(b=='pause'?c._periods:null);$.data(a,s,c);this._updateCountdown(a,c)}},_getTimesCountdown:function(a){var b=$.data(a,s);return(!b?null:(!b._hold?b._periods:this._calculatePeriods(b,b._show,new Date())))},_get:function(a,b){return(a.options[b]!=null?a.options[b]:$.countdown._defaults[b])},_adjustSettings:function(a){var b=new Date();var c=this._get(a,'timezone');c=(c==null?-new Date().getTimezoneOffset():c);a._since=this._get(a,'since');if(a._since){a._since=this.UTCDate(c,this._determineTime(a._since,null))}a._until=this.UTCDate(c,this._determineTime(this._get(a,'until'),b));a._show=this._determineShow(a)},_determineTime:function(k,l){var m=function(a){var b=new Date();b.setTime(b.getTime()+a*1000);return b};var n=function(a){a=a.toLowerCase();var b=new Date();var c=b.getFullYear();var d=b.getMonth();var e=b.getDate();var f=b.getHours();var g=b.getMinutes();var h=b.getSeconds();var i=/([+-]?[0-9]+)\s*(s|m|h|d|w|o|y)?/g;var j=i.exec(a);while(j){switch(j[2]||'s'){case's':h+=parseInt(j[1],10);break;case'm':g+=parseInt(j[1],10);break;case'h':f+=parseInt(j[1],10);break;case'd':e+=parseInt(j[1],10);break;case'w':e+=parseInt(j[1],10)*7;break;case'o':d+=parseInt(j[1],10);e=Math.min(e,$.countdown._getDaysInMonth(c,d));break;case'y':c+=parseInt(j[1],10);e=Math.min(e,$.countdown._getDaysInMonth(c,d));break}j=i.exec(a)}return new Date(c,d,e,f,g,h,0)};var o=(k==null?l:(typeof k=='string'?n(k):(typeof k=='number'?m(k):k)));if(o)o.setMilliseconds(0);return o},_getDaysInMonth:function(a,b){return 32-new Date(a,b,32).getDate()},_generateHTML:function(c){c._periods=periods=(c._hold?c._periods:this._calculatePeriods(c,c._show,new Date()));var d=false;var e=0;for(var f=0;f<c._show.length;f++){d|=(c._show[f]=='?'&&periods[f]>0);c._show[f]=(c._show[f]=='?'&&!d?null:c._show[f]);e+=(c._show[f]?1:0)}var g=this._get(c,'compact');var h=this._get(c,'layout');var i=(g?this._get(c,'compactLabels'):this._get(c,'labels'));var j=this._get(c,'timeSeparator');var k=this._get(c,'description')||'';var l=function(a){var b=$.countdown._get(c,'compactLabels'+periods[a]);return(c._show[a]?periods[a]+(b?b[a]:i[a])+' ':'')};var m=function(a){var b=$.countdown._get(c,'labels'+periods[a]);return(c._show[a]?'<span class="countdown_section"><span class="countdown_amount">'+periods[a]+'</span><br/>'+(b?b[a]:i[a])+'</span>':'')};return(h?this._buildLayout(c,h,g):((g?'<span class="countdown_row countdown_amount'+(c._hold?' countdown_holding':'')+'">'+l(Y)+l(O)+l(W)+l(D)+(c._show[H]?this._twoDigits(periods[H]):'')+(c._show[M]?(c._show[H]?j:'')+this._twoDigits(periods[M]):'')+(c._show[S]?(c._show[H]||c._show[M]?j:'')+this._twoDigits(periods[S]):''):'<span class="countdown_row countdown_show'+e+(c._hold?' countdown_holding':'')+'">'+m(Y)+m(O)+m(W)+m(D)+m(H)+m(M)+m(S))+'</span>'+(k?'<span class="countdown_row countdown_descr">'+k+'</span>':'')))},_buildLayout:function(b,c,d){var e=(d?this._get(b,'compactLabels'):this._get(b,'labels'));var f=function(a){return($.countdown._get(b,(d?'compactLabels':'labels')+b._periods[a])||e)[a]};var g={yl:f(Y),yn:b._periods[Y],ynn:this._twoDigits(b._periods[Y]),ol:f(O),on:b._periods[O],onn:this._twoDigits(b._periods[O]),wl:f(W),wn:b._periods[W],wnn:this._twoDigits(b._periods[W]),dl:f(D),dn:b._periods[D],dnn:this._twoDigits(b._periods[D]),hl:f(H),hn:b._periods[H],hnn:this._twoDigits(b._periods[H]),ml:f(M),mn:b._periods[M],mnn:this._twoDigits(b._periods[M]),sl:f(S),sn:b._periods[S],snn:this._twoDigits(b._periods[S])};var h=c;for(var i=0;i<7;i++){var j='yowdhms'.charAt(i);var k=new RegExp('\\{'+j+'<\\}(.*)\\{'+j+'>\\}','g');h=h.replace(k,(b._show[i]?'$1':''))}$.each(g,function(n,v){var a=new RegExp('\\{'+n+'\\}','g');h=h.replace(a,v)});return h},_twoDigits:function(a){return(a<10?'0':'')+a},_determineShow:function(a){var b=this._get(a,'format');var c=[];c[Y]=(b.match('y')?'?':(b.match('Y')?'!':null));c[O]=(b.match('o')?'?':(b.match('O')?'!':null));c[W]=(b.match('w')?'?':(b.match('W')?'!':null));c[D]=(b.match('d')?'?':(b.match('D')?'!':null));c[H]=(b.match('h')?'?':(b.match('H')?'!':null));c[M]=(b.match('m')?'?':(b.match('M')?'!':null));c[S]=(b.match('s')?'?':(b.match('S')?'!':null));return c},_calculatePeriods:function(f,g,h){f._now=h;f._now.setMilliseconds(0);var i=new Date(f._now.getTime());if(f._since&&h.getTime()<f._since.getTime()){f._now=h=i}else if(f._since){h=f._since}else{i.setTime(f._until.getTime());if(h.getTime()>f._until.getTime()){f._now=h=i}}var j=[0,0,0,0,0,0,0];if(g[Y]||g[O]){var k=$.countdown._getDaysInMonth(h.getFullYear(),h.getMonth());var l=$.countdown._getDaysInMonth(i.getFullYear(),i.getMonth());var m=(i.getDate()==h.getDate()||(i.getDate()>=Math.min(k,l)&&h.getDate()>=Math.min(k,l)));var n=function(a){return(a.getHours()*60+a.getMinutes())*60+a.getSeconds()};var o=Math.max(0,(i.getFullYear()-h.getFullYear())*12+i.getMonth()-h.getMonth()+((i.getDate()<h.getDate()&&!m)||(m&&n(i)<n(h))?-1:0));j[Y]=(g[Y]?Math.floor(o/12):0);j[O]=(g[O]?o-j[Y]*12:0);var p=function(a,b,c){var d=(a.getDate()==c);var e=$.countdown._getDaysInMonth(a.getFullYear()+b*j[Y],a.getMonth()+b*j[O]);if(a.getDate()>e){a.setDate(e)}a.setFullYear(a.getFullYear()+b*j[Y]);a.setMonth(a.getMonth()+b*j[O]);if(d){a.setDate(e)}return a};if(f._since){i=p(i,-1,l)}else{h=p(new Date(h.getTime()),+1,k)}}var q=Math.floor((i.getTime()-h.getTime())/1000);var r=function(a,b){j[a]=(g[a]?Math.floor(q/b):0);q-=j[a]*b};r(W,604800);r(D,86400);r(H,3600);r(M,60);r(S,1);return j}});function extendRemove(a,b){$.extend(a,b);for(var c in b){if(b[c]==null){a[c]=null}}return a}$.fn.countdown=function(a){var b=Array.prototype.slice.call(arguments,1);if(a=='getTimes'){return $.countdown['_'+a+'Countdown'].apply($.countdown,[this[0]].concat(b))}return this.each(function(){if(typeof a=='string'){$.countdown['_'+a+'Countdown'].apply($.countdown,[this].concat(b))}else{$.countdown._attachCountdown(this,a)}})};$.countdown=new Countdown()})(jQuery);

/**
 * jReject (jQuery Browser Rejection Plugin)
 * Version 0.7-Beta
 * URL: http://jreject.turnwheel.com/
 * Description: jReject gives you a customizable and easy solution to reject/allowing specific browsers access to your pages
 * Author: Steven Bower (TurnWheel Designs) http://turnwheel.com/
 * Copyright: Copyright (c) 2009-2010 Steven Bower under dual MIT/GPL license.
 * Depends On: jQuery Browser Plugin (http://jquery.thewikies.com/browser)
 */
(function(b){b.reject=function(a){a=b.extend(true,{reject:{all:false,msie5:true,msie6:true},display:[],browserInfo:{firefox:{text:"Firefox 3.5+",url:"http://www.mozilla.com/firefox/"},safari:{text:"Safari 4",url:"http://www.apple.com/safari/download/"},opera:{text:"Opera 10.5",url:"http://www.opera.com/download/"},chrome:{text:"Chrome 5",url:"http://www.google.com/chrome/"},msie:{text:"Internet Explorer 8",url:"http://www.microsoft.com/windows/Internet-explorer/"},gcf:{text:"Google Chrome Frame",
url:"http://code.google.com/chrome/chromeframe/",allow:{all:false,msie:true}}},header:"Did you know that your Internet Browser is out of date?",paragraph1:"Your browser is out of date, and may not be compatible with our website. A list of the most popular web browsers can be found below.",paragraph2:"Just click on the icons to get to the download page",close:true,closeMessage:"By closing this window you acknowledge that your experience on this website may be degraded",closeLink:"Close This Window",
closeURL:"#",closeESC:true,closeCookie:false,cookieSettings:{path:"/",expires:0},imagePath:"/images/",overlayBgColor:"#000",overlayOpacity:0.8,fadeInTime:"fast",fadeOutTime:"fast"},a);if(a.display.length<1)a.display=["firefox","chrome","msie","safari","opera","gcf"];b.isFunction(a.beforeReject)&&a.beforeReject(a);if(!a.close)a.closeESC=false;var d=function(c){return(c.all?true:false)||(c[b.os.name]?true:false)||(c[b.layout.name]?true:false)||(c[b.browser.name]?true:false)||(c[b.browser.className]?
true:false)};if(!d(a.reject)){b.isFunction(a.onFail)&&a.onFail(a);return false}if(a.close&&a.closeCookie){var f="jreject-close",h=function(c,g){if(typeof g!="undefined"){var e="";if(a.cookieSettings.expires!=0){e=new Date;e.setTime(e.getTime()+a.cookieSettings.expires);e="; expires="+e.toGMTString()}var k=a.cookieSettings.path||"/";document.cookie=c+"="+encodeURIComponent(g==null?"":g)+e+"; path="+k}else{k=null;if(document.cookie&&document.cookie!="")for(var o=document.cookie.split(";"),n=0;n<o.length;++n){e=
b.trim(o[n]);if(e.substring(0,c.length+1)==c+"="){k=decodeURIComponent(e.substring(c.length+1));break}}return k}};if(h(f)!=null)return false}var i='<div id="jr_overlay"></div><div id="jr_wrap"><div id="jr_inner"><h1 id="jr_header">'+a.header+"</h1>"+(a.paragraph1===""?"":"<p>"+a.paragraph1+"</p>")+(a.paragraph2===""?"":"<p>"+a.paragraph2+"</p>")+"<ul>",l=0;for(var s in a.display){var p=a.display[s],j=a.browserInfo[p]||false;if(!(!j||j.allow!=undefined&&!d(j.allow))){i+='<li id="jr_'+p+'"><div class="jr_icon"></div><div><a href="'+
(j.url||"#")+'">'+(j.text||"Unknown")+"</a></div></li>";++l}}i+='</ul><div id="jr_close">'+(a.close?'<a href="'+a.closeURL+'">'+a.closeLink+"</a><p>"+a.closeMessage+"</p>":"")+"</div></div></div>";var m=b("<div>"+i+"</div>");d=q();i=r();m.bind("closejr",function(){if(!a.close)return false;b.isFunction(a.beforeClose)&&a.beforeClose(a);b(this).unbind("closejr");b("#jr_overlay,#jr_wrap").fadeOut(a.fadeOutTime,function(){b(this).remove();b.isFunction(a.afterClose)&&a.afterClose(a)});b("embed, object, select, applet").show();
a.closeCookie&&h(f,"true");return true});m.find("#jr_overlay").css({width:d[0],height:d[1],position:"absolute",top:0,left:0,background:a.overlayBgColor,zIndex:200,opacity:a.overlayOpacity,padding:0,margin:0}).next("#jr_wrap").css({position:"absolute",width:"100%",top:i[1]+d[3]/4,left:i[0],zIndex:300,textAlign:"center",padding:0,margin:0}).children("#jr_inner").css({background:"#FFF",border:"1px solid #CCC",fontFamily:'"Lucida Grande","Lucida Sans Unicode",Arial,Verdana,sans-serif',color:"#4F4F4F",
margin:"0 auto",position:"relative",height:"auto",minWidth:l*100,maxWidth:l*140,width:b.layout.name=="trident"?l*155:"auto",padding:20,fontSize:12}).children("#jr_header").css({display:"block",fontSize:"1.3em",marginBottom:"0.5em",color:"#333",fontFamily:"Helvetica,Arial,sans-serif",fontWeight:"bold",textAlign:"left",padding:5,margin:0}).nextAll("p").css({textAlign:"left",padding:5,margin:0}).siblings("ul").css({listStyleImage:"none",listStylePosition:"outside",listStyleType:"none",margin:0,padding:0}).children("li").css({background:'transparent url("'+
a.imagePath+'background_browser.gif") no-repeat scroll left top',cusor:"pointer","float":"left",width:120,height:122,margin:"0 10px 10px 10px",padding:0,textAlign:"center"}).children(".jr_icon").css({width:100,height:100,margin:"1px auto",padding:0,background:"transparent no-repeat scroll left top",cursor:"pointer"}).each(function(){var c=b(this);c.css("background","transparent url("+a.imagePath+"browser_"+c.parent("li").attr("id").replace(/jr_/,"")+".gif) no-repeat scroll left top");c.click(function(){window.open(b(this).next("div").children("a").attr("href"),
"jr_"+Math.round(Math.random()*11));return false})}).siblings("div").css({color:"#808080",fontSize:"0.8em",height:18,lineHeight:"17px",margin:"1px auto",padding:0,width:118,textAlign:"center"}).children("a").css({color:"#333",textDecoration:"none",padding:0,margin:0}).hover(function(){b(this).css("textDecoration","underline")},function(){b(this).css("textDecoration","none")}).click(function(){window.open(b(this).attr("href"),"jr_"+Math.round(Math.random()*11));return false}).parents("#jr_inner").children("#jr_close").css({margin:"0 0 0 50px",
clear:"both",textAlign:"left",padding:0,margin:0}).children("a").css({color:"#000",display:"block",width:"auto",margin:0,padding:0,textDecoration:"underline"}).click(function(){b(this).trigger("closejr");if(a.closeURL==="#")return false}).nextAll("p").css({padding:"10px 0 0 0",margin:0});b("#jr_overlay").focus();b("embed, object, select, applet").hide();b("body").append(m.hide().fadeIn(a.fadeInTime));b(window).bind("resize scroll",function(){var c=q();b("#jr_overlay").css({width:c[0],height:c[1]});
var g=r();b("#jr_wrap").css({top:g[1]+c[3]/4,left:g[0]})});a.closeESC&&b(document).bind("keydown",function(c){c.keyCode==27&&m.trigger("closejr")});b.isFunction(a.afterReject)&&a.afterReject(a);return true};var q=function(){var a=window.innerWidth&&window.scrollMaxX?window.innerWidth+window.scrollMaxX:document.body.scrollWidth>document.body.offsetWidth?document.body.scrollWidth:document.body.offsetWidth,d=window.innerHeight&&window.scrollMaxY?window.innerHeight+window.scrollMaxY:document.body.scrollHeight>
document.body.offsetHeight?document.body.scrollHeight:document.body.offsetHeight,f=window.innerWidth?window.innerWidth:document.documentElement&&document.documentElement.clientWidth?document.documentElement.clientWidth:document.body.clientWidth,h=window.innerHeight?window.innerHeight:document.documentElement&&document.documentElement.clientHeight?document.documentElement.clientHeight:document.body.clientHeight;return[a<f?a:f,d<h?h:d,f,h]},r=function(){return[window.pageXOffset?window.pageXOffset:
document.documentElement&&document.documentElement.scrollTop?document.documentElement.scrollLeft:document.body.scrollLeft,window.pageYOffset?window.pageYOffset:document.documentElement&&document.documentElement.scrollTop?document.documentElement.scrollTop:document.body.scrollTop]}})(jQuery);

/**
 * jQuery Browser Plugin
 * Version 2.3
 * 2008-09-17 19:27:05
 * URL: http://jquery.thewikies.com/browser
 * Description: jQuery Browser Plugin extends browser detection capabilities and can assign browser selectors to CSS classes.
 * Author: Nate Cavanaugh, Minhchau Dang, & Jonathan Neal
 * Copyright: Copyright (c) 2008 Jonathan Neal under dual MIT/GPL license.
 */
(function($){$.browserTest=function(a,z){var u='unknown',x='X',m=function(r,h){for(var i=0;i<h.length;i=i+1){r=r.replace(h[i][0],h[i][1]);}return r;},c=function(i,a,b,c){var r={name:m((a.exec(i)||[u,u])[1],b)};r[r.name]=true;r.version=(c.exec(i)||[x,x,x,x])[3];if(r.name.match(/safari/)&&r.version>400){r.version='2.0';}if(r.name==='presto'){r.version=($.browser.version>9.27)?'futhark':'linear_b';}r.versionNumber=parseFloat(r.version,10)||0;r.versionX=(r.version!==x)?(r.version+'').substr(0,1):x;r.className=r.name+r.versionX;return r;};a=(a.match(/Opera|Navigator|Minefield|KHTML|Chrome/)?m(a,[[/(Firefox|MSIE|KHTML,\slike\sGecko|Konqueror)/,''],['Chrome Safari','Chrome'],['KHTML','Konqueror'],['Minefield','Firefox'],['Navigator','Netscape']]):a).toLowerCase();$.browser=$.extend((!z)?$.browser:{},c(a,/(camino|chrome|firefox|netscape|konqueror|lynx|msie|opera|safari)/,[],/(camino|chrome|firefox|netscape|netscape6|opera|version|konqueror|lynx|msie|safari)(\/|\s)([a-z0-9\.\+]*?)(\;|dev|rel|\s|$)/));$.layout=c(a,/(gecko|konqueror|msie|opera|webkit)/,[['konqueror','khtml'],['msie','trident'],['opera','presto']],/(applewebkit|rv|konqueror|msie)(\:|\/|\s)([a-z0-9\.]*?)(\;|\)|\s)/);$.os={name:(/(win|mac|linux|sunos|solaris|iphone)/.exec(navigator.platform.toLowerCase())||[u])[0].replace('sunos','solaris')};if(!z){$('html').addClass([$.os.name,$.browser.name,$.browser.className,$.layout.name,$.layout.className].join(' '));}};$.browserTest(navigator.userAgent);})(jQuery);

/*
 * Lazy Load - jQuery plugin for lazy loading images
 * Copyright (c) 2007-2012 Mika Tuupola
 * Licensed under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 * Project home:
 *   http://www.appelsiini.net/projects/lazyload
 * Version:  1.7.0
 */
(function(a,b){$window=a(b),a.fn.lazyload=function(c){var d={threshold:0,failure_limit:0,event:"scroll",effect:"show",container:b,data_attribute:"original",skip_invisible:!0,appear:null,load:null};c&&(undefined!==c.failurelimit&&(c.failure_limit=c.failurelimit,delete c.failurelimit),undefined!==c.effectspeed&&(c.effect_speed=c.effectspeed,delete c.effectspeed),a.extend(d,c));var e=this;return 0==d.event.indexOf("scroll")&&a(d.container).bind(d.event,function(b){var c=0;e.each(function(){$this=a(this);if(d.skip_invisible&&!$this.is(":visible"))return;if(!a.abovethetop(this,d)&&!a.leftofbegin(this,d))if(!a.belowthefold(this,d)&&!a.rightoffold(this,d))$this.trigger("appear");else if(++c>d.failure_limit)return!1})}),this.each(function(){var b=this,c=a(b);b.loaded=!1,c.one("appear",function(){if(!this.loaded){if(d.appear){var f=e.length;d.appear.call(b,f,d)}a("<img />").bind("load",function(){c.hide().attr("src",c.data(d.data_attribute))[d.effect](d.effect_speed),b.loaded=!0;var f=a.grep(e,function(a){return!a.loaded});e=a(f);if(d.load){var g=e.length;d.load.call(b,g,d)}}).attr("src",c.data(d.data_attribute))}}),0!=d.event.indexOf("scroll")&&c.bind(d.event,function(a){b.loaded||c.trigger("appear")})}),$window.bind("resize",function(b){a(d.container).trigger(d.event)}),a(d.container).trigger(d.event),this},a.belowthefold=function(c,d){if(d.container===undefined||d.container===b)var e=$window.height()+$window.scrollTop();else var e=a(d.container).offset().top+a(d.container).height();return e<=a(c).offset().top-d.threshold},a.rightoffold=function(c,d){if(d.container===undefined||d.container===b)var e=$window.width()+$window.scrollLeft();else var e=a(d.container).offset().left+a(d.container).width();return e<=a(c).offset().left-d.threshold},a.abovethetop=function(c,d){if(d.container===undefined||d.container===b)var e=$window.scrollTop();else var e=a(d.container).offset().top;return e>=a(c).offset().top+d.threshold+a(c).height()},a.leftofbegin=function(c,d){if(d.container===undefined||d.container===b)var e=$window.scrollLeft();else var e=a(d.container).offset().left;return e>=a(c).offset().left+d.threshold+a(c).width()},a.inviewport=function(b,c){return!a.rightofscreen(b,c)&&!a.leftofscreen(b,c)&&!a.belowthefold(b,c)&&!a.abovethetop(b,c)},a.extend(a.expr[":"],{"below-the-fold":function(c){return a.belowthefold(c,{threshold:0,container:b})},"above-the-top":function(c){return!a.belowthefold(c,{threshold:0,container:b})},"right-of-screen":function(c){return a.rightoffold(c,{threshold:0,container:b})},"left-of-screen":function(c){return!a.rightoffold(c,{threshold:0,container:b})},"in-viewport":function(c){return!a.inviewport(c,{threshold:0,container:b})},"above-the-fold":function(c){return!a.belowthefold(c,{threshold:0,container:b})},"right-of-fold":function(c){return a.rightoffold(c,{threshold:0,container:b})},"left-of-fold":function(c){return!a.rightoffold(c,{threshold:0,container:b})}})})(jQuery,window)
