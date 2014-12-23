(function(window, $, undefined) {

    if (!window.LKD) window.LKD = {};

    if (!window.LKD.ChatApp) window.LKD.ChatApp = function() {

        var $container = $('#chat-window');

        var chatServer = io.connect('http://sagittarius:3000/');

        var guid = function() {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000)
                    .toString(16)
                    .substring(1);
            }
            return s4() + '-' + s4() + s4() + '-' + s4() + s4() + s4() + '-' + s4() + s4();
        };

        var nickName = guid();

        var bindEvents = function() {
            chatServer.on('connect', function(data) {
                window.nickName = prompt('what is your chat name?') || 'Demo User';
                chatServer.emit('join', window.nickName);
                $('#txt-message').focus();
            }).on('messages', function(message) {
                message.isNewUser ? $('#user-name').html(message.nickname) : insertMessage(message);
            }).on('private', function(message) {
                console.log(message);
            });

            $('#btn-post').unbind('click').click(function() {
                sendMessage();
            });

            $('#txt-message').keypress(function(event) {
                if (event.which == 13 && !event.shiftKey)
                    $('#btn-post').trigger('click');
            });

            $('#txt-message').keyup(function(event) {
                if (event.keyCode == 13 && event.shiftKey)
                    applyShiftEnter();
            });

            $('#btn-clear-chat').click(function() {
                $('#chat-container').html('');
                refreshSlimScroll();
            });
        };

        var insertMessage = function(data) {
            var id = guid();

            data.message = linkify(data.message);

            var newRow = '<tr class="chat-row"><td' +
                ' class="col-lg-1 col-md-1 col-sm-3 col-xs-3 text-right chat-row"><b class="right" title = "' +
                data.nickname + '">' +
                getShortName(data.nickname) +
                ' :</b> </td> <td id="' + id + '" class = "posted col-lg-11 col-md-11 col-sm-9 col-xs-9 text-left"> ' +
                data.message +
                ' </td></tr>';

            $('#chat-container').html($('#chat-container').html() + newRow);

            refreshSlimScroll();
            $('#' + id).emoticons();

            $('.posted').find('a').on('click', function() {
                $(this).css('color', '#A55858');
            });
        };

        var sendMessage = function() {
            var message = $('#txt-message').val().trim();
            if (!message)
                return;
            message = message.replace(/(?:\r\n|\r|\n)/g, '<br />');
            chatServer.emit('messages', message);
            insertMessage({
                'nickname': 'Me',
                'message': message
            });
            privateChat($('#txt-message').val());
            $('#txt-message').val('').focus();
        };

        var calculateChatBoxHeight = function() {
            var totalHeight = 0;
            $('.chat-row').each(function() {
                totalHeight += $(this).height();
            });
            return totalHeight;
        };

        var refreshSlimScroll = function() {
            $container.slimScroll({
                scrollTo: calculateChatBoxHeight(),
                height: '280px',
                alwaysVisible: true
            }).unbind('scroll').bind('scroll', function(e, pos) {
                console.log('pos');
            });
        };

        var getShortName = function(name) {
            if (name && name.trim().length >= 9) {
                name = name.substring(0, 6).trim() + '..';
            }
            return name;
        };

        var privateChat = function(chatKey) {
            if (chatKey.trim())
                chatServer.emit('on-private', chatKey);
        };

        var linkify = function(inputText) {
            var replacedText, replacePattern1, replacePattern2, replacePattern3;

            replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
            replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');

            replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
            replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>');

            replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
            replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');

            return replacedText;
        };

        var applyShiftEnter = function() {
            var content = this.value;
            var caret = getCaret(this);
            this.value = content.substring(0, caret) +
                "\n" + content.substring(caret, content.length);
            event.stopPropagation();
        };

        this.init = function() {
            bindEvents();
            refreshSlimScroll();
        };
    }

})(window, jQuery);
