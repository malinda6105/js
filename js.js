var player = jwplayer("videoContainer"), 
    sources_alt = {sources_alt},
    timeElapse = "latestplay.{localKey}",
    retryKey = "retry.{localKey}",
    lastTime = xStorage.getItem(timeElapse),
    retry = xStorage.getItem(retryKey),
    enableP2P = {enableP2P},
    hosts = {hosts},
    logStat,
    jwpConfig = {
        title: "{title}",
        autostart: {autoplay},
        repeat: {repeat},
        mute: {mute},
        rewind: false,
        image: "{poster}",
        abouttext: "GunDeveloper.com",
        aboutlink: "https://gundeveloper.com",
        controls: true,
        hlshtml: true,
        primary: "html5",
        preload: "{preload}",
        cast: {},
        androidhls: true,
        stretching: "{stretching}",
        displaytitle: {displayTitle},
        displaydescription: false,
        playbackRateControls: {displayRateControls},
        captions: {
            color: "{captionsColor}",
            backgroundOpacity: 0
        },
        sources: {sources},
        tracks: {tracks},
        aspectratio: "16:9",
        floating: false,
        skin: loadSkin("{playerSkin}"),
        advertising: {vastAds}
    },
    statCounted = false,
    adBlocker = {block_adblocker},
    enableShare = {enableShare},
    productionMode = {productionMode},
    visitAdsOnplay = {visitAdsOnplay};

if (typeof jwplayer().key === 'undefined') {
    jwpConfig.key = 'ITWMv7t88JGzI0xPwW8I0+LveiXX9SWbfdmt0ArUSyc=';
}

if ("{logoImage}" !== "") {
    jwpConfig.logo = {
        "file": "{logoImage}",
        "link": "{logoLink}",
        "hide": {logoHide},
        "position": "{logoPosition}"
    };
}

if (enableShare) {
    jwpConfig.sharing = {
        "sites": ["facebook", "twitter", "email"]
    };
}

if (productionMode) {
    devtoolsDetector.addListener(function (isOpen, detail) {
        if (isOpen) {
            console.clear();
            window.top.location = "{directAdsLink}" !== "" ? "{directAdsLink}" : "https://google.com/";
        }
    });
    devtoolsDetector.launch();
}

var sandboxMode = sandblaster.detect(),
    sandboxAllowances = sandboxMode.sandboxAllowances,
    allowSandboxed = false;
if (sandblaster.resandbox()) {
    sandboxMode = sandblaster.detect();
    sandboxAllowances = sandboxMode.sandboxAllowances;
}
allowSandboxed = !sandboxMode.framed || sandboxMode.sandboxed === null || (sandboxMode.framed && (!sandboxMode.sandboxed || (sandboxMode.sandboxed && (sandboxAllowances.popups || sandboxAllowances.popupsToEscapeSandbox) && (sandboxAllowances.topNavigation || sandboxAllowances.topNavigationByUserActivation))));

if (allowSandboxed) {
    justDetectAdblock.detectAnyAdblocker().then(function(d) {
        if (adBlocker && (d || typeof canRunAds === 'undefined')) {
            destroyer();
        } else {
            if (jwpConfig.sources.length > 0) {
                loadPlayer(false);
            } else {
                $.ajax({
                    url: "{lbSite}api/?{originQry}",
                    type: "GET",
                    dataType: "json",
                    cache: false,
                    success: function(res) {
                        var isOK = false;
                        if (res.status === "ok") {
                            jwpConfig.title = res.title;
                            jwpConfig.image = res.poster;
                            jwpConfig.tracks = res.tracks;
        
                            if (res.sources.length > 0) {
                                isOK = true;
                                jwpConfig.sources = res.sources;
                                loadPlayer(false);
                            } else {
                                showMessage(res.message);
                            }
                        }
                        if (!isOK) {
                            if ($('#servers li').length > 0) {
                                var $next, $prev, $link, 
                                    $server = $('#servers li'),
                                    sChecked = xStorage.getItem('retry_multi~{localKey}'),
                                    checked = sChecked !== null ? JSON.parse(sChecked) : [];
                                
                                if (checked.length < $server.length) {
                                    if (checked.length < $server.length) {
                                        $server.each(function(i, e) {
                                            if ($(this).find('a').hasClass('active')) {
                                                $next = $(this).next();
                                                $prev = $(this).prev();
                                                if ($next.length > 0) {
                                                    checked.push(i);
                                                    xStorage.setItem('retry_multi~{localKey}', JSON.stringify(checked));
                                                    $link = $next.find('a').attr('href');
                                                } else if ($prev.length > 0) {
                                                    checked.push(i);
                                                    xStorage.setItem('retry_multi~{localKey}', JSON.stringify(checked));
                                                    $link = $prev.find('a').attr('href');
                                                }
                                                return;
                                            }
                                        });
                                        window.location.href = $link;
                                    } else {
                                        showMessage(res.message);
                                        gtagReport("video_error", res.message, "jwplayer", false);
                                    }
                                } else {
                                    showMessage('Sorry this video is unavailable.');
                                    gtagReport("video_error", 'Sources not found', "jwplayer", false);
                                }
                            } else {
                                if (res.status === 'ok' && res.sources.length === 0) {
                                    showMessage('Sorry this video is unavailable.');
                                    gtagReport("video_error", 'Sources not found', "jwplayer", false);
                                } else {
                                    showMessage(res.message);
                                    gtagReport("video_error", res.message, "jwplayer", false);
                                }
                            }
                        }
                    },
                    error: function(xhr) {
                        var msg = 'Failed to fetch video sources from server!';
                        if ('responseJSON' in xhr && typeof xhr.responseJSON.message !== 'undefined') {
                            msg = xhr.responseJSON.message;
                        }
                        showMessage(msg);
                        gtagReport("video_error", msg, "jwplayer", false);
                    }
                });
            }
        }
    });
} else {
    showMessage('Sandboxed embed is not allowed!');
}

if (hosts.indexOf('fembed') > -1) {
    logStat = setInterval(function() {
        $.ajax({
            url: "{lbSite}ajax/?action=stat&data={cacheKey}",
            method: "GET",
            dataType: "json",
            cache: false,
            success: function(res) {},
            error: function(xhr) {}
        });
    }, 3000);
}

$(document).ajaxSend(function (res, xhr, opt) {
    if (opt.url.indexOf('{lbSite}ajax/?action=stat') > -1) {
        if (statCounted) {
            xhr.abort();
        } else {
            statCounted = true;
        }
    }
});

function errorHandler(e) {
    showLoading();
    retry = xStorage.getItem(retryKey);
    if (e.code === 221000 && (retry === null || parseInt(retry) < 3)) {
        xStorage.setItem(retryKey, retry === null || retry === 'NaN' ? 1 : parseInt(retry) + 1);
        xStorage.setItem('autoplay', 'true');
        loadPlayer(true);
    } else {
        if (sources_alt.length > 0) {
            jwpConfig.sources = sources_alt;
            loadPlayer(true);
            return;
        } else {
            if (retry === null || parseInt(retry) < 3) {
                xStorage.setItem(retryKey, retry === null || retry === 'NaN' ? 1 : parseInt(retry) + 1);
                xStorage.setItem("autoplay", true);
                xStorage.removeItem("jwplayer.qualityLabel");
                $.ajax({
                    url: "{lbSite}ajax/?action=clear-cache&data={cacheKey}",
                    method: "GET",
                    dataType: "json",
                    cache: false,
                    success: function(res) {
                        gtagReport("video_error", "Reload Page", "jwplayer", false);
                        location.reload();
                    },
                    error: function(xhr) {
                        gtagReport("video_error", "Unable to load source", "jwplayer", false);
                        showMessage('Unable to load source. <a href="javascript:void(0)" onclick="xStorage.clear();location.reload()">Reload page!</a>');
                    }
                });
                return;
            } else if (e.code === 301161 && e.sourceError === null) {
                gtagReport("video_error", "Redirect to HTTPS", "jwplayer", false);
                location.href = location.href.replace('http:', 'https:');
                return;
            } else {
                gtagReport("video_error", e.message, "jwplayer", false);
                showMessage(e.message + ' <a href="javascript:void(0)" onclick="xStorage.removeItem(retryKey);location.href=location.href">Reload Page</a>');
                return;
            }
        }
    }
}

function loadPlayer(resume) {
    player.setup(jwpConfig);
    if (enableP2P && p2pml.core.HybridLoader.isSupported() && typeof jwpConfig.advertising.schedule === 'undefined') {
        jwplayer_hls_provider.attach();
        var trackers = {torrentList},
            config = {
                segments: {
                    swarmId: '{localKey}'
                },
                loader: {
                }
            },
            engine = new p2pml.hlsjs.Engine(config);
        if (trackers.length) {
            config.loader.trackerAnnounce = trackers;
        }
        p2pml.hlsjs.initJwPlayer(player, {
            liveSyncDurationCount: 7,
            loader: engine.createLoaderClass()
        });
    }
    addButton();
    player.on("setupError error", errorHandler);
    player.once("ready", function (e) {
        var autoplay = xStorage.getItem("autoplay");
        if ("{playerSkin}" === "netflix" || "{playerSkin}" === "hotstar") {
            $(".jw-slider-time").prepend($(".jw-text-elapsed")).append($(".jw-text-duration"));
        }
        $("#mContainer").hide();
        $("#videoContainer").show();
        if (autoplay === "true") {
            xStorage.removeItem("autoplay");
            player.play();
            if (resume) player.seek(xStorage.getItem(timeElapse));
        }
        gtagReport("video_ready_to_play", "Ready To Play", "jwplayer", false);
    });
    player.once("beforePlay", function () {
        var $jrwn = $(".jw-icon-rewind"),
            $rwn = $("[button=\"rewind\"]"),
            $fwd = $("[button=\"forward\"]");
        if ($jrwn.length) {
            $jrwn.after($rwn);
            $rwn.after($fwd);
        }
        timeChecker();
        if (player.getCaptionsList().length > 1) player.setCurrentCaptions(1);
    });
    player.on("time", function (e) {
        lastTime = xStorage.getItem(timeElapse);
        if (e.position > 0 && e.position > lastTime) {
            xStorage.setItem(timeElapse, Math.round(e.position));
            xStorage.removeItem(retryKey);
        }
        if (e.position >= {visit_counter_runtime} && statCounted === false) {
            $.ajax({
                url: "{lbSite}ajax/?action=stat&data={cacheKey}",
                method: "GET",
                dataType: "json",
                cache: false,
                success: function(res) {},
                error: function(xhr) {}
            });
        }
    });
    player.once("complete playlistComplete", function (e) {
        gtagReport("video_complete", "Playback Has Ended", "jwplayer", false);
        xStorage.removeItem(timeElapse);
        if (logStat) clearInterval(logStat);
    });
    if (visitAdsOnplay) {
        player.once("play", function () {
            var wo = window.open("{directAdsLink}", "_blank");
            setTimeout(function () {
                if (_hasPopupBlocker(wo) || typeof window.canRunAds === "undefined") {
                    $("#iframeAds").attr("src", "{directAdsLink}");
                    $("#directAds").show();
                }
            }, 3000);
        });
    }
    window.player = player;
}

function destroyer() {
    if (player) {
        player.remove();
        player = null;
    }
    showMessage('<p><img src="{thisSite}assets/img/stop-sign-hand.webp" width="100" height="100"></p><p>Please support us by disabling AdBlocker.</p>');
}
