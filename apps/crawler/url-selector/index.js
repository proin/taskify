exports.docs = {
    tag: ['crawler', 'parser', 'jquery'],
    inputs: {
        $urls: 'urls'
    },
    outputs: "url string"
};

exports.run = function ($urls, $next) {
    setTimeout(function () {
        if (!$urls) $next('No Output', 300);
        else if (typeof $urls == 'string') $next('No Output', 300);
        else if ($urls.length > 10) {
            var url = [];
            for (var i = 0; i < $urls.length; i++)
                if ($urls[i].startsWith('http'))
                    url.push($urls[i]);
            var rand = Math.random() * (url.length - 1);
            $next(url[Math.round(rand)]);
        } else $next('No Output', 300);
    }, 3000);
};