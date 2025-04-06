// ==UserScript==
// @name         itch.io screenshots grab-buddy
// @namespace    http://tampermonkey.net/
// @version      2025-04-06
// @description  grab screens from itch.io a bit quicker
// @match        https://*.itch.io/*
// @icon         https://itch.io/favicon.ico
// @require      https://git.io/vMmuf
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...

    function log(str) {
        console.log('%c ' + str + ' ', 'background: white; color: grey');
    }

    //window.addEventListener('load', function () { unreliable in background
    waitForKeyElements("body", function () {
        log('itch screen comfy loaded');

    function isc() {

        // game page handler - crete textarea for console download code
        if ( ! $('textarea#isc_wget').length ) {
            $('div.screenshot_list').before('<textarea style="font-size:4px;width:80em;height:10em;" id="isc_wget" onclick="this.select()">');
        }

        // game page handler
        $('div.screenshot_list:not(.isc)').each(function(){

            // some game pages hide screenshots when browser is wide. Unhide!
            $(".right_col").css({ display: "block" });

            $(this).addClass('isc');
            var scrcode = '';
            $(this).find('a').each(function(idx){
                let scrurl = $(this).attr('href');
                let idxstr =  (idx + 1).toString().padStart(2, '0')
                let scrname = 's' + idxstr + '.' + scrurl.split('.').pop();
                scrcode += '<a target="_blank" href="' + scrurl + '" + download="' + scrname + '">' + scrname + '</a> <input class="issel" value="' + scrname + '"><br>'
                let wget_line = 'wget -O ' + scrname + ' ' + scrurl;
                $('textarea#isc_wget').append(wget_line + '\n');
                console.log(wget_line);
            });

            $('textarea#isc_wget').append('exit');
            $(this).prepend(scrcode);
            $("input.issel").on("click", function () {
                $(this).select();
            });
        });

        // game jam game page handler - crete textarea for console download code
        if ( ! $('textarea#isc_wget').length ) {
            $('div.game_screenshots').before('<textarea style="font-size:4px;width:80em;height:10em;" id="isc_wget" onclick="this.select()">');
        }

        // game jam game page handler
        $('div.game_screenshots:not(.isc)').each(function(){
            $(this).addClass('isc');
            var scrcode = '';
            $(this).find('a').each(function(idx){
                let scrurl = $(this).attr('href');
                let idxstr =  (idx + 1).toString().padStart(2, '0')
                let scrname = 's' + idxstr + '.' + scrurl.split('.').pop();
                scrcode += '<a target="_blank" href="' + scrurl + '" + download="' + scrname + '">' + scrname + '</a> <input class="issel" value="' + scrname + '"><br>'
                let wget_line = 'wget -O ' + scrname + ' ' + scrurl;
                $('textarea#isc_wget').append(wget_line + '\n');
                console.log(wget_line);
            });

            $('textarea#isc_wget').append('exit');
            $(this).prepend(scrcode);
            $("input.issel").on("click", function () {
                $(this).select();
            });
        });

    } // function maal() end

    isc();
    setInterval(isc, 1000);

    }, false);
})();
