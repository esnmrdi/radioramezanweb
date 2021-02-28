// loading the service worker
if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
        navigator.serviceWorker.register("_service-worker.js");
    });
}

"use strict";

var pwaVersion = "1.0";
$("[data-pwa-version]").data("pwa-version", pwaVersion);

//Creating Cookie System for PWA Hide
function createCookie(e, t, n) {
    if (n) {
        var o = new Date();
        o.setTime(o.getTime() + 48 * n * 60 * 60 * 1e3);
        var r = "; expires=" + o.toGMTString();
    } else var r = "";
    document.cookie = e + "=" + t + r + "; path=/";
}

//
function readCookie(e) {
    for (
        var t = e + "=", n = document.cookie.split(";"), o = 0; o < n.length; o++
    ) {
        for (var r = n[o];
            " " == r.charAt(0);) r = r.substring(1, r.length);
        if (0 == r.indexOf(t)) return r.substring(t.length, r.length);
    }
    return null;
}

//
function eraseCookie(e) {
    createCookie(e, "", -1);
}

//Detecting Mobile Operating Systems
var isMobile = {
    Android: function () {
        return navigator.userAgent.match(/Android/i);
    },
    iOS: function () {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    any: function () {
        return isMobile.Android() || isMobile.iOS() || isMobile.Windows();
    }
};
var isInWebAppiOS = window.navigator.standalone == true;
var isInWebAppChrome = window.matchMedia("(display-mode: standalone)")
    .matches;

let deferredPrompt;

//
window.addEventListener("beforeinstallprompt", e => {
    e.preventDefault();
    deferredPrompt = e;
    var pwaInstalled = (localStorage.getItem("pwaInstalled") == "true") ? true : false;
    if (!pwaInstalled) {
        var walkthroughWatch = setInterval(function () {
            var walkthroughViewed = (localStorage.getItem("walkthroughViewed") == "true") ? true : false;
            if (walkthroughViewed) {
                setTimeout(function () {
                    if (isMobile.Android()) {
                        $(".menu-hider").trigger('click');
                        showModal("menu-install-pwa-android");
                    } else if (isMobile.iOS()) {
                        $(".menu-hider").trigger('click');
                        showModal("menu-install-pwa-ios");
                    }
                }, 3000);
                clearInterval(walkthroughWatch);
            }
        }, 500);
    }
})

//
window.addEventListener("appinstalled", e => {
    localStorage.setItem("pwaInstalled", true);
})

//
function pwaInstall() {
    //var pwaInstalled = (localStorage.getItem("pwaInstalled") == "true") ? true : false;
    var pwaInstalled = false;
    // firing PWA prompts for specific versions and when not on home screen.
    if (isMobile.Android()) {
        if (!isInWebAppChrome && !pwaInstalled) {
            console.log("Android Detected");
            // Wait for the user to respond to the prompt
            deferredPrompt.prompt();
            deferredPrompt.userChoice
                .then(choice => {
                    if (choice.outcome === 'accepted') {
                        $(".pwa-dismiss").trigger("click");
                        console.log('User accepted');
                    } else {
                        console.log('User dismissed');
                    }
                })
        } else {
            showSnackBar("already-installed-error");
        }
    }
    if (isMobile.iOS()) {
        if (!isInWebAppiOS && !pwaInstalled) {
            console.log("iOS Detected");
            showSnackBar("ios-install-error");
        } else {
            showSnackBar("already-installed-error");
        }
    }
}

// create and show modal
function showModal(menuID) {
    var menu = $('#' + menuID);
    var menuHider = $(".menu-hider");
    menu.removeClass('menu-active');
    menuHider.addClass('menu-active');

    var menuEffect = menu.data('menu-effect');
    var menuWidth = menu.data('menu-width');
    var menuHeight = menu.data('menu-height');

    if (menu.hasClass('menu-header-clear')) {
        menuHider.addClass('menu-active-clear');
    }

    function menuActivate() {
        menu = 'menu-active' ? menu.addClass('menu-active') : menu.removeClass('menu-active');
    }
    if (menu.hasClass('menu-box-bottom')) {
        $('#footer-menu').addClass('footer-menu-hidden');
    }
    if (menuEffect === "menu-parallax") {
        if (menu.hasClass('menu-box-bottom')) {
            headerAndContent.css("transform", "translateY(" + (menuHeight / 5) * (-1) + "px)");
        }
        if (menu.hasClass('menu-box-top')) {
            headerAndContent.css("transform", "translateY(" + (menuHeight / 5) + "px)");
        }
        if (menu.hasClass('menu-box-left')) {
            headerAndContent.css("transform", "translateX(" + (menuWidth / 5) + "px)");
        }
        if (menu.hasClass('menu-box-right')) {
            headerAndContent.css("transform", "translateX(" + (menuWidth / 5) * (-1) + "px)");
        }
    }
    if (menuEffect === "menu-push") {
        if (menu.hasClass('menu-box-bottom')) {
            headerAndContent.css("transform", "translateY(" + (menuHeight) * (-1) + "px)");
        }
        if (menu.hasClass('menu-box-top')) {
            headerAndContent.css("transform", "translateY(" + (menuHeight) + "px)");
        }
        if (menu.hasClass('menu-box-left')) {
            headerAndContent.css("transform", "translateX(" + (menuWidth) + "px)");
        }
        if (menu.hasClass('menu-box-right')) {
            headerAndContent.css("transform", "translateX(" + (menuWidth) * (-1) + "px)");
        }
    }
    if (menuEffect === "menu-reveal") {
        if (menu.hasClass('menu-box-left')) {
            headerAndContent.css("transform", "translateX(" + (menuWidth) + "px)");
            menuHider.css({
                "transform": "translateX(" + (menuWidth) + "px)",
                "opacity": "0"
            });
        }
        if (menu.hasClass('menu-box-right')) {
            headerAndContent.css("transform", "translateX(" + (menuWidth) * (-1) + "px)");
            menuHider.css({
                "transform": "translateX(" + (menuWidth) * (-1) + "px)",
                "opacity": "0"
            });
        }
    }
    menuActivate();
}

// update version in 5 Seconds after new version detected and update button is pushed
function updateCountdown() {
    $('.page-update').prop("disabled", true);
    var counter = 5;
    $(".page-update").html("به روز رسانی در " + counter + " ثانیه ...");
    var countdownWatch = setInterval(function () {
        --counter;
        $(".page-update").html("به روز رسانی در " + counter + " ثانیه ...");
        if (counter == 0) {
            clearInterval(countdownWatch);
            window.location.reload(true);
        }
    }, 1000);
}

// check version
function check_version() {
    if ($("link[data-pwa-version]").length) {
        //
        function versionCheck() {
            var dt = new Date();
            var maniTimeVersion =
                dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();
            var localVersionNumber = $('link[rel="manifest"]').data("pwa-version");
            var onlineVersionJSON = "_manifest.json?ver=" + maniTimeVersion;
            var onlineVersionNumber = "Connection Offline. Waiting to Reconect";
            $.getJSON(onlineVersionJSON, function (onlineData) {
                onlineVersionNumber = onlineData.version;
            });
            setTimeout(function () {
                if (
                    onlineVersionNumber != localVersionNumber &&
                    onlineVersionNumber != "Connection Offline. Waiting to Reconect"
                ) {
                    //console.log(onlineVersionNumber, localStorage);
                    $(".menu-hider").trigger('click');
                    showModal("menu-update");
                }
                if (onlineVersionNumber == localVersionNumber) {
                    /*No Update Available*/
                }
                if (onlineVersionNumber === "undefined") {
                    /*Error Checking for Updates*/
                }
                if (onlineVersionNumber === "Finding Online Version...") {
                    /* */
                }
            }, 3000);
        }
        //Checking for new version every 60 seconds
        /*
        setInterval(function () {
            versionCheck();
        }, 60000);
        */
        //Initial Load Version Check in 10 Second After Load
        setTimeout(function () {
            versionCheck();
        }, 10000);
    }
}

// reload to clear button
$("body").on("click", ".page-update, .reloadme", function () {
    updateCountdown();
});

// check for version change if online if not kill the function
if (navigator.onLine) {
    check_version();
} else {
    function check_version() {}
}

// adding offline/online alerts
var offlineAlerts = $(".offline-message");
if (!offlineAlerts.length) {
    $("body").append(
        '<p class="offline-message bg-red2-dark color-white center-text uppercase ultrabold" style="direction: rtl;">ارتباط اینترنتی قطع است.</p> '
    );
    $("body").append(
        '<p class="online-message bg-green1-dark color-white center-text uppercase ultrabold" style="direction: rtl;">دوباره آنلاین شدید!</p>'
    );
}

// offline function show
function isOffline() {
    $(".offline-message").addClass("offline-message-active");
    $(".online-message").removeClass("online-message-active");
    setTimeout(function () {
        $(".offline-message").removeClass("offline-message-active");
    }, 2000);
}

// online function show
function isOnline() {
    $(".online-message").addClass("online-message-active");
    $(".offline-message").removeClass("offline-message-active");
    setTimeout(function () {
        $(".online-message").removeClass("online-message-active");
    }, 2000);
}

$(".simulate-offline").on("click", function () {
    isOffline();
});

$(".simulate-online").on("click", function () {
    isOnline();
});

// check if online / offline
function updateOnlineStatus(event) {
    var condition = navigator.onLine ? "online" : "offline";
    isOnline();
    console.log("Connection: Online");
    $("a").off("click", returnFalse);
}

//
function updateOfflineStatus(event) {
    isOffline();
    $("a").on("click", returnFalse);
    console.log("Connection: Offline");
}

window.addEventListener("online", updateOnlineStatus);
window.addEventListener("offline", updateOfflineStatus);

function returnFalse() {
    var detectHREF = $(this).attr('href');
    if (detectHREF.match(/.html/)) {
        isOffline();
        return false;
    }
}

//function returanFalse() {}