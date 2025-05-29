// ==UserScript==
// @name         itch.io screenshots grab-buddy
// @namespace    http://tampermonkey.net/
// @version      2025-05-29
// @description  grab screens from itch.io a bit quicker, makes checking file upload dates and publish/update dates a bit easier
// @match        https://*.itch.io/*
// @icon         https://itch.io/favicon.ico
// @require      https://git.io/vMmuf
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...

    const itch_api_key = '[ENTER YOUR FREE ITCH IO API KEY HERE SEE https://github.com/FishieCat/itch.io-api-upload-check ]';

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

            // add uploads API link and game name

            if (!document.querySelector('#isc_name')) {
                const fullTitle = document.title; // e.g., "Breakfast Game by sireel"
                const nameValue = fullTitle.split(' by ').slice(0, -1).join(' by ');
                console.log('Extracted game name:', nameValue);

                // Extract author from the current URL (e.g., "sireel" from "https://sireel.itch.io/breakfast-game")
                const hostname = window.location.hostname; // e.g., "sireel.itch.io"
                const author = hostname.split('.')[0]; // "sireel"

                // Create the <p> element with the two
                const $p = $(`
    <p id="isc_name" style="text-align:center;">
        <input id="game_name_input" type="text" value="${nameValue}" readonly style="background-color: white !important; color: black !important; padding: 3px; border:none; background:transparent; text-align:center; cursor:pointer; font:inherit; width:auto;" />
        |
        <span><a href="https://${author}.itch.io/" target="_blank" style="text-decoration:none;">${author}</a></span>
    </p>
`);
                $('#wrapper').prepend($p);

                // Add click listener to auto-select input text
                $('#game_name_input').on('click', function () {
                    this.select();
                });
            }

            if (!document.querySelector('#isc_uploads')) {
                // upload api link
                const metaTag = document.querySelector('meta[name="itch:path"]');
                let gameId = null;

                if (metaTag) {
                    const content = metaTag.getAttribute('content'); // e.g., "games/3572263"
                    const match = content.match(/\/?(\d+)$/); // extract the number at the end
                    if (match) {
                        gameId = match[1];
                        console.log('Extracted game ID:', gameId);
                    }
                }

                // Create the URL using gameId and itch_api_key
                const url = `https://itch.io/api/1/${itch_api_key}/game/${gameId}/uploads`;

                // Create the <p> element with the link
                const $p = $('<p id="isc_uploads" style="text-align:center;"></p>').append(
                    $('<a></a>').attr('href', url).text(url)
                );

                // Prepend to #wrapper
                $('#wrapper').prepend($p);
            }

            // add yyyy-mm-dd dates to infobox
            $('.game_info_panel_widget abbr[title]:not(.isc)').each(function() {
                const $abbr = $(this).addClass('isc');
                $('.info_panel_wrapper').attr('style', 'display: block !important;');
                const title = $abbr.attr('title'); // e.g. "30 June 2024 @ 04:24 UTC"

                // Extract day, month name, year
                const m = title.match(/(\d{1,2}) (\w+) (\d{4})/);
                if (!m) return;

                const [ , day, monthName, year ] = m;
                const monthMap = {
                    January:'01', February:'02', March:'03', April:'04',
                    May:'05', June:'06', July:'07', August:'08',
                    September:'09', October:'10', November:'11', December:'12'
                };
                const mm = monthMap[monthName];
                if (!mm) return;

                const dd = day.padStart(2,'0');
                const iso = `${year}-${mm}-${dd}`;

                // only add once
                if ($abbr.next('input.isc-date').length) return;

                // create the input
                const $input = $('<input type="text" readonly>')
                .addClass('isc-date')
                .css({
                    'width': '8em',
                    'margin-left': '0.5em',
                    'font-size': '0.9em'
                })
                .val(iso)
                .on('click', function() {
                    this.select();
                });

                // insert after the abbr
                $abbr.after($input);
            });

        } // function isc() end

        isc();
        setInterval(isc, 1000);

    }, false);
})();
