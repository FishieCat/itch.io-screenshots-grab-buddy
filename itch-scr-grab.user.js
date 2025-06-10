// ==UserScript==
// @name         itch.io screenshots grab-buddy
// @namespace    http://tampermonkey.net/
// @version      2025-06-10
// @description  grab screens from itch.io a bit quicker, makes checking file upload dates and publish/update dates a bit easier
// @match        https://*.itch.io/*
// @icon         https://itch.io/favicon.ico
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// @require      https://git.io/vMmuf
// @require      https://cdn.jsdelivr.net/npm/turndown@7.1.1/dist/turndown.min.js
// @grant GM.getValue
// @grant GM.setValue
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...

    function log(...args) {
        // Join all args into a single string separated by space
        const message = args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg) : arg)).join(' ');
        console.log('%c ' + message + ' ', 'background: white; color: grey');
    }

    async function getApiKey() {
        try {
            return await GM.getValue('itch_api_key', '');
        } catch (err) {
            log('Error getting API key: ' + err);
            return '';
        }
    }

    async function setApiKey(key) {
        await GM.setValue('itch_api_key', key);
    }

    waitForKeyElements("body", function () {

        // Create screenshot download area
        const art_area = '<div id="isc_art"><textarea title="Copy this to cmd.exe or terminal or bash to auto-download all at once" class="isc_textarea" id="isc_cli" onclick="this.select()"></textarea></div>';
        $('div.screenshot_list, div.game_screenshots').first().before(art_area);

        // some game pages hide screenshots when browser is wide. Unhide!
        $(".right_col").css({ display: "block" });

        // game/jam page handler
        $('div.screenshot_list:not(.isc), div.game_screenshots:not(.isc)').each(function(){

            $(this).addClass('isc');
            let scrcode = '';
            let curl_line = 'curl ';
            $(this).find('a').each(function(idx){
                let scrurl = $(this).attr('href');
                let idxstr =  (idx + 1).toString().padStart(2, '0')

                // Filename extension overly careful
                let ext = scrurl.split('?')[0].split('#')[0].split('.').pop().toLowerCase();
                if (!['jpg', 'png', 'gif', 'webp'].includes(ext)) {
                    ext = 'jpg'; // fallback default
                }
                let scrname = 's' + idxstr + '.' + ext;

                scrcode += '<a target="_blank" href="' + scrurl + '" download="' + scrname + '" title="Link to full-size image">' + scrname + '</a> <input title="Short sorted name for easy copypaste for downloading full-size image manually" class="issel" value="' + scrname + '"><br>'
                curl_line += '-L ' + scrurl + ' -o ' + scrname + ' ';
            });
            curl_line += '&& exit';
            $('textarea#isc_cli').val(curl_line);

            $(this).prepend(scrcode);
            $("input.issel").on("click", function () {
                $(this).select();
            });
        });

        // Add game/author name

        if ($('#isc_meta').length === 0) {
            const fullTitle = document.title; // e.g., "Breakfast Game by sireel"
            const nameValue = fullTitle.split(' by ').slice(0, -1).join(' by ');
            log('Extracted game name:', nameValue);

            // Extract author from the current URL (e.g., "sireel" from "https://sireel.itch.io/breakfast-game")
            const hostname = window.location.hostname; // e.g., "sireel.itch.io"
            const author = hostname.split('.')[0]; // "sireel"
            const author_link = 'https://' + author + '.itch.io'

            // Create the <div> element with the two
            let $div = $(`
    <div id="isc_meta">
        <div id="isc_uploads"><button id="isc_apikey" title="Check/set API key">API key</button> (<a href="https://itch.io/user/settings/api-keys" target="_blank" title="Get key here, requires free account">itch.io</a>) <a id="isc_apilink" target="_blank"></a></div><br>
        <input id="isc_gamename" class="isc_input" type="text" title="Game name for easy copy paste" value="${nameValue}" readonly />
        <a id="isc_authorname" title="Author profile page" target="_blank" href="${author_link}">${author}</a><br><br>
        <textarea class="isc_textarea" id="isc_markdown" title="Description area HTML as Markdown for easy copy paste"></textarea><br><br>
    </div>
`);
            let target =
                $('div.columns > div.right_col').first() ||
                $('div.columns > div.left_col').first() ||
                $('#wrapper').first() ||
                $('body').first();

            if (target && target.length) {
                target.prepend($div);
            }

            // self-select
            $('#isc_gamename, #isc_markdown, #isc_cli').on('click', function () {
                this.select();
            });

            //
            const dsc_source = $('div.formatted_description');
            const dsc_target = $('#isc_markdown');

            if (dsc_source.length && dsc_target.length) {
                const turndownService = new TurndownService();
                const markdown = turndownService.turndown(dsc_source.html()); // or .get(0)
                dsc_target.val(markdown);
                log('Description converted to Markdown and inserted.');
            } else {
                log('Source or target element not found.');
            }

            // API stuff

            $('#isc_apikey').on('click', async function () {
                const currentKey = await getApiKey();
                const newKey = prompt('Enter your Itch.io API key:', currentKey);
                if (newKey !== null) {
                    await setApiKey(newKey.trim());
                    updateApiLink(newKey.trim());
                }
            });

            // upload api link
            const metaTag = $('meta[name="itch:path"]');
            let gameId = null;

            if (metaTag.length > 0) {
                const content = metaTag.attr('content'); // get attribute with jQuery
                const match = content.match(/\/?(\d+)$/); // extract digits at end
                if (match) {
                    gameId = match[1];
                    log('Extracted game ID:', gameId);
                }
            }

            //
            function updateApiLink(apiKey) {
                const api_url = `https://itch.io/api/1/${apiKey}/game/${gameId}/uploads`;
                const $link = $('#isc_uploads #isc_apilink');
                if ($link.length) {
                    $link.attr('href', api_url);
                    $link.text(`${gameId}/uploads`);
                    $link.attr('title', 'Check file upload/update dates');
                } else {
                    $('#isc_uploads').append($('<a></a>')
                                             .attr('href', api_url)
                                             .attr('title', 'Check file upload/update dates')
                                             .text(`${gameId}/uploads`));
                }
            }

            getApiKey().then(apiKey => {
                updateApiLink(apiKey || 'missing-key');
            });
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

        // Add custom styles
        const style = document.createElement('style');
        style.textContent = `
        /* Your CSS rules here */
        .isc_input {
          background-color: white !important;
          color: black !important;
          padding: 3px;
          border: none;
          cursor: pointer;
          width: 40%;
          display: inline-block;
        }
        .isc_textarea {
          font-size: 4px;
          width: 80em;
          height: 10em;
        }
        .screenshot_list.isc {
          font-size: 16px !important;
        }
        .right_col {
          display: block !important;
        }
    `;
        document.head.appendChild(style);

    }, false);

})();
