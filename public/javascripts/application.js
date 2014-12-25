jQuery.fn.ChatApp = function() {

    var element = this;

    //private user class
    var User = function() {

        this.defaultName = 'demo user';

        var userName = 'demo user';

        var userId = '';

        this.getUserName = function() {
            return userName;
        };

        this.setUserName = function(name) {
            userName = name;
            if (name === this.defaultName) {
                $.removeCookie('nickname');
            } else
                $.cookie('nickname', name, {
                    expires: 1
                });
        };

        this.getUserId = function() {
            return userId;
        };

        this.setUserId = function(id) {
            userId = id;
            $.cookie('user-id', id, {
                expires: 1
            });
        };
    };

    var Chat = function() {

        var $container = $(element);

        var chatServer = null;

        var interval = null;

        var CurrentUser = new User();

        //helper methods start
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

        var changeTitle = function(user) {
            clearInterval(interval);
            var isOriginalMessage = false;
            interval = setInterval(function() {
                document.title = isOriginalMessage ? 'socket.io' : 'message from ' + user.nickName;
                isOriginalMessage = !isOriginalMessage;
            }, 700);
        };

        var logout = function() {

            CurrentUser.setUserName(CurrentUser.defaultName);

            $('#user-name').html(CurrentUser.defaultName);

            $(this).addClass('hidden');

            $('#login').removeClass('hidden');

            initRefreshChat();

            $('#txt-message').focus();
        };

        var login = function() {

            do {

                CurrentUser.setUserName(prompt('what is your chat name?'));

                if (CurrentUser.getUserName().toLowerCase() === CurrentUser.defaultName)
                    alert('name already taken..');

            } while (CurrentUser.getUserName().toLowerCase() === CurrentUser.defaultName);

            CurrentUser.setUserName(CurrentUser.getUserName() || CurrentUser.defaultName);

            if (CurrentUser.getUserName() !== CurrentUser.defaultName) {

                $('#login').addClass('hidden');

                $('#logout').removeClass('hidden');

                CurrentUser.setUserId(generateGuid());

                chatServer.emit('join', {
                    'id': CurrentUser.getUserId(),
                    'name': CurrentUser.getUserName()
                });
            }

            $('#user-name').html(CurrentUser.getUserName());

            $('#txt-message').focus();

            initRefreshChat();
        };

        var generateGuid = function() {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000)
                    .toString(16)
                    .substring(1);
            }
            return s4() + '-' + s4() + s4() + '-' + s4() + s4() + s4() + '-' + s4() + s4();
        };
        //helper methods end

        // socket.io event handlers start
        var connect = function() {
            CurrentUser.setUserName($.cookie('nickname') || CurrentUser.getUserName());
            if (CurrentUser.getUserName() === CurrentUser.defaultName) {
                $('#logout').addClass('hidden');
                $('#login').removeClass('hidden');
            } else {
                $('#logout').removeClass('hidden');
                $('#login').addClass('hidden');
            }
            $('#user-name').html(CurrentUser.getUserName());
            $('#txt-message').focus();
        };

        var initRefreshChat = function() {
            if (CurrentUser.getUserName()) {
                this.isCaller = true;
                chatServer.emit('broadcast-refresh', {
                    'id': CurrentUser.getUserId(),
                    'name': CurrentUser.getUserName()
                });
            }
        };

        var refreshChat = function(user) {

            if (!this.isCaller && user && user.id === $.cookie('user-id')) {

                CurrentUser.setUserName(user.nickName);
                CurrentUser.setUserId($.cookie('user-id'));

                $('#user-name').html(user.nickName);

                if (user.nickName === CurrentUser.defaultName) {

                    $('#logout').addClass('hidden');

                    $('#login').removeClass('hidden');

                } else {

                    $('#login').addClass('hidden');

                    $('#logout').removeClass('hidden');
                }
                this.isCaller = false;
            }

            $('#btn-clear-chat').trigger('click');
        };

        var messages = function(user) {

            var id = generateGuid();

            var message = linkify(user.message);

            var name = user.nickName === CurrentUser.getUserName() ? "Me" : user.nickName;

            if (user.nickName !== 'Me') {
                changeTitle(user);
            }

            var newRow = '<tr class="chat-row"><td' +
                ' class="col-lg-1 col-md-1 col-sm-3 col-xs-3 text-right chat-row"><b class="right" title = "' +
                name + '">' +
                getShortName(name) +
                ' :</b> </td> <td id="' + id + '" class = "posted col-lg-11 col-md-11 col-sm-9 col-xs-9 text-left"> ' +
                message +
                ' </td></tr>';

            $('#chat-container').html($('#chat-container').html() + newRow);

            refreshSlimScroll();

            $('#' + id).emoticons();

            $('.posted').find('a').unbind('click').on('click', function() {
                $(this).css('color', '#A55858');
            });
        };
        // socket.io event handlers end

        // dom event handlers start

        var btnPostClick = function() {

            var message = $('#txt-message').val().trim();

            if (!message)
                return;

            message = message.replace(/(?:\r\n|\r|\n)/g, '<br />');

            chatServer.emit('messages', {
                'nickName': CurrentUser.getUserName(),
                'message': message
            });

            //broadcasted message will not refresh caller instance, hence the trigger
            messages({
                'nickName': 'Me',
                'message': message
            });

            $('#txt-message').val('').focus();
        };

        var txtMessageKeypress = function(event) {
            if (event.which == 13 && !event.shiftKey)
                btnPostClick();
        };

        var txtMessageKeyup = function(event) {
            if (event.keyCode == 13 && event.shiftKey)
                applyShiftEnter();
        };

        var btnClearChatClick = function() {
            $('#chat-container').html('');
            refreshSlimScroll();
        };

        var windowFocus = function() {
            this.wondowFocused = true;
            if (!interval) return;
            clearInterval(interval);
            $("title").text('socket.io');
        };
        // dom event handlers end

        var bindEvents = function() {
            //socket.io events
            chatServer.on('connect', connect).on('messages', messages).on('broadcast-refresh', refreshChat);

            //dom events
            $('#btn-post').unbind('click').click(btnPostClick);

            $('#txt-message').unbind('keypress').keypress(txtMessageKeypress).unbind('keyup').keyup(txtMessageKeyup);

            $('#btn-clear-chat').unbind('click').click(btnClearChatClick);

            $('#login').unbind('click').click(login);

            $('#logout').unbind('click').click(logout);

            $(window).focus(windowFocus);

            $(window).mouseover(function() {
                windowFocus();
            })

        };

        this.init = function() {

            chatServer = io.connect('http://192.168.1.5:3000/');

            bindEvents();

            refreshSlimScroll();
        };
    };

    new Chat().init();
};
