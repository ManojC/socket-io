jQuery.fn.emoticons = function(icon_folder) {
    var icon_folder = icon_folder || "emoticons";
    var emotes = {
        "smile": [":-)", ":)", "=]", "=)"],
        "sad": [":(", ":-(", "=(", ":[", ":&lt;"],
        "wink": [";-)", ";)", ";]", "*)"],
        "grin": [":D", "=D", "XD", "BD", "8D", "xD"],
        "surprise": [":O", "=O", ":-O", "=-O"],
        "devilish": ["(6)"],
        "angel": ["(A)"],
        "crying": [":'(", ":'-("],
        "plain": [":|"],
        "smile-big": [":o)",":O)"],
        "glasses": ["8)", "8-)"],
        "kiss": ["(K)", ":-*"],
        "monkey": ["(M)"]
    };

    function emoticons(html) {
        var modifiedHtml = html;
        for (var emoticon in emotes) {
            for (var i = 0; i < emotes[emoticon].length; i++) {
                /* css class of images is emoticonimg for styling them*/
                html = html.replace(emotes[emoticon][i], "<img src=\"" + icon_folder + "/face-" + emoticon + ".png\" class=\"emoticonimg\" alt=\"" + emotes[emoticon][i] + "\"/>", "g");
            }
        }
        return html;
    }
    return this.each(function() {
        $(this).html(emoticons($(this).html()));
    });
};
