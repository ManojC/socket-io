(function(window, $, undefined) {

    if (!window.LKD) window.LKD = {};

    if (!window.LKD.ChatApp) window.LKD.ChatApp = function() {

        this.chatServer = io.connect('http://localhost:3000/');

        this.guid = function() {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000)
                    .toString(16)
                    .substring(1);
            }
            return 'user ' + s4() + s4() + s4();
        };

        this.nickName = this.guid();

        this.init = function() {
            this.bindEvents();
        };

        this.bindEvents = function() {
            var self = this;
            self.chatServer.on('connect', function(data) {
                while (!window.nickName)
                    window.nickName = prompt('what is your chat name?');
                self.chatServer.emit('join', window.nickName);
                $('#txt-message').focus();
            });

            self.chatServer.on('messages', function(message) {
                self.insertMessage(message)
            });

            $('#btn-post').unbind('click').click(function() {
                var message = $('#txt-message').val();
                if (!message)
                    return;
                self.chatServer.emit('messages', message);
                self.insertMessage({
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

        this.insertMessage = function(data) {
            $('#chat-window').html($('#chat-window').html() +
                '<div class="row mts mbs"><div class="col-lg-1 text-center"><b>' +
                data.nickname +
                ' :' +
                '</b></div><div class="col-lg-11 text-left">' +
                data.message +
                '</div></div>');
        };
    }

})(window, jQuery);
