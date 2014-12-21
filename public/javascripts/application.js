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
                while (!window.nickName)
                    window.nickName = prompt('what is your chat name?');
                chatServer.emit('join', window.nickName);
                $('#txt-message').focus();
            });

            chatServer.on('messages', function(message) {
                if (message.isNewUser) {
                    $('#user-name').html('Hello ' + message.nickname + '!');
                    return;
                }
                insertMessage(message)
            });

            $('#btn-post').unbind('click').click(function() {
                var message = $('#txt-message').val();
                if (!message)
                    return;
                chatServer.emit('messages', message);
                insertMessage({
                    'nickname': 'Me',
                    'message': message
                });
                $('#txt-message').val('').focus();
            });

            $('#txt-message').keypress(function(e) {
                var key = e.which;
                if (key == 13) {
                    $('#btn-post').trigger('click');
                }
            });
        };

        var insertMessage = function(data) {
            var id = guid();

            var newRow = '<tr class="chat-row"><td id="' + id + '" class="col-lg-1 text-right"><b class="right">' +
                data.nickname + ' :</b> </td> <td class = "col-lg-11 text-left"> ' +
                data.message + ' </td></tr>';

            $('#chat-container').html($('#chat-container').html() + newRow);

            $container.slimScroll({
                scrollTo: calculateChatBoxHeight(),
                height: '280px',
                alwaysVisible: true
            });
        };

        var calculateChatBoxHeight = function() {
            var totalHeight = 0;
            $('.chat-row').each(function() {
                totalHeight += $(this).height();
            });
            return totalHeight;
        }

        this.init = function() {
            bindEvents();
            $container.slimScroll({
                scrollTo: calculateChatBoxHeight(),
                height: '280px',
                alwaysVisible: true
            });
        };
    }

})(window, jQuery);
