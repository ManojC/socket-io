(function(window, $, undefined) {

    if (!window.LKD) window.LKD = {};

    if (!window.LKD.ChatApp) window.LKD.ChatApp = function() {

        var $container = $('#chat-window');

        var chatServer = io.connect('http://192.168.1.8/');

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
            });

            chatServer.on('messages', function(message) {
                if (message.isNewUser) {
                    $('#user-name').html(message.nickname);
                    return;
                }
                insertMessage(message)
            });

            $('#btn-post').unbind('click').click(function() {
                var message = $('#txt-message').val().trim();
                if (!message)
                    return;
                message = message.replace(/(?:\r\n|\r|\n)/g, '<br />');
                chatServer.emit('messages', message);
                insertMessage({
                    'nickname': 'Me',
                    'message': message
                });
                $('#txt-message').val('').focus();
            });

            $('#txt-message').keypress(function(event) {
                var key = event.which;
                if (key == 13 && !event.shiftKey) {
                    $('#btn-post').trigger('click');
                }
            });
            $('#txt-message').keyup(function(event) {
                if (event.keyCode == 13 && event.shiftKey) {
                    var content = this.value;
                    var caret = getCaret(this);
                    this.value = content.substring(0, caret) +
                        "\n" + content.substring(caret, content.length);
                    event.stopPropagation();

                }
            })
        };

        var insertMessage = function(data) {
            var id = guid();

            var newRow = '<tr class="chat-row"><td id="' + 
            id + 
            '" class="col-lg-1 col-md-1 col-sm-3 col-xs-3 text-right chat-row"><b class="right" title = "' + 
            data.nickname + '">' +
            getShortName(data.nickname) + 
            ' :</b> </td> <td class = "col-lg-11 col-md-11 col-sm-9 col-xs-9 text-left"> ' +
            data.message + 
            ' </td></tr>';

            $('#chat-container').html($('#chat-container').html() + newRow);

            refreshSlimScroll();
        };

        var calculateChatBoxHeight = function() {
            var totalHeight = 0;
            $('.chat-row').each(function() {
                totalHeight += $(this).height();
            });
            return totalHeight;
        }

        var refreshSlimScroll = function() {
            $container.slimScroll({
                scrollTo: calculateChatBoxHeight(),
                height: '280px',
                alwaysVisible: true
            });
        };

        var getShortName = function(name) {
            if (name && name.trim().length >= 9) {
                name = name.substring(0, 6).trim() + '..';
            }
            return name;
        };

        this.init = function() {
            bindEvents();
            refreshSlimScroll();
        };
    }

})(window, jQuery);
