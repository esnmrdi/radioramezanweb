// global constant values
const os = getOS();
const rootURL = "https://test.radioramezan.com/";
const prefix = (os == "Android") ? rootURL : "";
const dayRankText = {
    "01": "اول",
    "02": "دوم",
    "03": "سوم",
    "04": "چهارم",
    "05": "پنجم",
    "06": "ششم",
    "07": "هفتم",
    "08": "هشتم",
    "09": "نهم",
    "10": "دهم",
    "11": "یازدهم",
    "12": "دوازدهم",
    "13": "سیزدهم",
    "14": "چهاردهم",
    "15": "پانزدهم",
    "16": "شانزدهم",
    "17": "هفدهم",
    "18": "هجدهم",
    "19": "نوزدهم",
    "20": "بیستم",
    "21": "بیست و یکم",
    "22": "بیست و دوم",
    "23": "بیست و سوم",
    "24": "بیست و چهارم",
    "25": "بیست و پنجم",
    "26": "بیست و ششم",
    "27": "بیست و هفتم",
    "28": "بیست و هشتم",
    "29": "بیست و نهم",
    "30": "سی ام"
}
const hijriMonthText = {
    "01": "محرم",
    "02": "صفر",
    "03": "ربیع الاول",
    "04": "ربیع الثانی",
    "05": "جمادی الاول",
    "06": "جمادی الثانی",
    "07": "رجب",
    "08": "شعبان",
    "09": "رمضان",
    "10": "شوال",
    "11": "ذیقعده",
    "12": "ذیحجه"
}
const scheduleSign = {
    "doa": "fa-sign-language color-yellow1-dark",
    "quran": "fa-quran color-red2-dark",
    "sokhanrani": "fa-microphone-alt color-teal-dark",
    "monajat": "fa-pray color-red2-dark",
    "azan": "fa-mosque color-blue2-dark"
};
const plyrObj = document.querySelector("#plyr-obj");
const tune = document.querySelector("#tune");
const azanAlert = document.querySelector("#azan-alert");

// detect device type (Windows Phone / Android / iOS)
function getOS() {
    var userAgent = navigator.userAgent || navigator.vendor || window.opera;
    if (/windows phone/i.test(userAgent)) { // Windows Phone must come first because its UA also contains "Android"
        return "Windows Phone";
    }
    if (/android/i.test(userAgent)) {
        return "Android";
    }
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) { // iOS detection
        return "iOS";
    }
    return "Desktop";
}

// wait for particular seconds
async function wait(seconds) {
    await sleep(seconds * 1000);
}

// add leading zero to day number when in string format if required
function pad(num, size) {
    var s = "0" + num;
    return s.substr(s.length - size);
}

// get a random integer number from desired range
function randomFromRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

// hide blinking "live" logo and show plyr progress bar if a local stream is playing
function localStreamPlaying() {
    $(".plyr__progress__container").attr("style", "display: block");
    $(".plyr__time").attr("style", "display: block");
    if (window.liveLogoInterval) {
        clearInterval(window.liveLogoInterval);
        $(".header img").remove();
    }
}

// show blinking "live" logo and hide plyr progress bar if live stream is playing
function liveStreamPlaying() {
    $(".plyr__progress__container").attr("style", "display: none");
    $(".plyr__time").attr("style", "display: none");
    if (window.liveLogoInterval) {
        clearInterval(window.liveLogoInterval);
        $(".header img").remove();
    }
    var liveLogoLeft = "60px";
    if (os == "Desktop") {
        liveLogoLeft = "calc(((1 - 0.3) / 2) * 100vw + 60px)";
    }
    $(".header").append("<img src='images/live-1.png' style='position: absolute; height: 24px; left: " + liveLogoLeft + "; top: 50%; transform: translateY(-50%);'>");
    $(".header").append("<img src='images/live-2.png' style='position: absolute; height: 24px; left: " + liveLogoLeft + "; top: 50%; transform: translateY(-50%); display: none;'>");
    window.liveLogoInterval = setInterval(function () {
        $(".header").find("img").toggle();
    }, 1500);
}

// assign live/local audio stream to audio object
function sourceStream(player, streamURL) {
    if (streamURL.includes("stream")) {
        liveStreamPlaying();
        var streamType = streamURL.split(/\#|\?/)[0].split(".").pop().trim();
        if (streamType == "mp3") {
            player.src = streamURL;
        } else {
            if (os == "iOS") {
                player.src = streamURL;
            } else {
                var hls = new Hls({
                    autoStartLoad: true
                });
                hls.loadSource(streamURL);
                hls.attachMedia(player);
            }
        }
    } else {
        localStreamPlaying();
        player.src = streamURL;
    }
}

// set up plyr audio player
function loadPlyr() {
    window.plyr = new Plyr(plyrObj, {
        controls: ["play-large", "play", "progress", "current-time", "mute", "volume"],
        loadSprite: false
    });
    var liveStreamURL = localStorage.getItem("liveStreamURL");
    sourceStream(document.querySelector("#plyr-obj"), liveStreamURL);
    window.plyr.on("pause", function () {
        var liveStreamURL = localStorage.getItem("liveStreamURL");
        var live = (localStorage.getItem("live") == "true") ? true : false;
        if (live) {
            sourceStream(document.querySelector("#plyr-obj"), liveStreamURL);
        }
    });
}

// attach arbitrary audio file/stream to audio player
function playStream(streamURL) {
    window.plyr.stop();
    sourceStream(document.querySelector("#plyr-obj"), streamURL);
}

// show notification bars at the top of screen (refer to the 
// bottom of index.htm to find the snack bars)
function showSnackBar(id) {
    $("#" + id).addClass("snackbar-active");
    setTimeout(function () {
        $("body").find("#" + id).removeClass("snackbar-active");
    }, 5000)
}

// get other city attributes given its English name
function getCityAttribute(city_en, attribute) {
    var citiesList = JSON.parse(localStorage.getItem("citiesList"));
    for (i = 0; i < citiesList.length; i++) {
        if (citiesList[i].city_name_en === city_en) {
            return citiesList[i][attribute];
        }
    }
}

// calculate the distance between two GPS coordinates using haversine formula
function distance(lat1, lon1, lat2, lon2) {
    var R = 6371; // radius of the earth in km
    var dLat = deg2rad(lat2 - lat1); // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // distance in km
    return d;
}

// convert degress to radians
function deg2rad(deg) {
    return deg * (Math.PI / 180)
}

// get device location, reverse geocode it, and save 
// the corresponding info to local storage (works together with next function)
function getAndSaveCity(position) {
    localStorage.setItem("latitude", Math.round(position.coords.latitude * 10000) / 10000);
    localStorage.setItem("longitude", Math.round(position.coords.longitude * 10000) / 10000);
    var latitude = parseFloat(localStorage.getItem("latitude"));
    var longitude = parseFloat(localStorage.getItem("longitude"));
    var citiesList = JSON.parse(localStorage.getItem("citiesList"));
    var cityCenterLatitude, cityCenterLongitude, distanceToCityCenter, cityEn;
    $.each(citiesList, function (index, city) { // return the city name if user location is in city radius
        cityCenterLatitude = parseFloat(city.latitude);
        cityCenterLongitude = parseFloat(city.longitude);
        distanceToCityCenter = distance(latitude, longitude, cityCenterLatitude, cityCenterLongitude);
        if (distanceToCityCenter <= parseInt(city.radius)) {
            cityEn = city.city_name_en;
            return false;
        }
    })
    if (!cityEn) {
        showSnackBar("city-not-exists");
    } else {
        $("#city-selector").val(cityEn);
        citySelectorChanged();
    }
    $("#lat-lng").html("Lat: " + latitude + ", Lng: " + longitude + " (" + cityEn + ")"); // report lat, lng, and city name
}

// pass user location to getAndSaveCity() function
function getLocation() {
    if (navigator.geolocation) {
        $("#lat-lng").html("دریافت اطلاعات از GPS ...");
        navigator.geolocation.getCurrentPosition(getAndSaveCity,
            function (error) {
                if (error.code == error.PERMISSION_DENIED)
                    showSnackBar("location-not-allowed");
            }
        );
    } else {
        showSnackBar("no-location-support");
    }
}

// return date (or date elements) in desired format or daily/monthly offsets
function getDate(format, options) {
    moment.locale("en");
    moment.tz.setDefault(localStorage.getItem("timeZone"));
    moment.loadPersian({
        dialect: 'persian-modern'
    });
    if (options.locale) {
        moment.locale(options.locale);
    }
    if (options.offset && options.offsetType) {
        if (options.offset > 0) {
            return moment().add(options.offset, options.offsetType).format(format);
        } else if (options.offset < 0) {
            return moment().subtract(Math.abs(options.offset), options.offsetType).format(format);
        }
    }
    if (options.qamariDate) {
        var dateArray = options.qamariDate.split("-");
        return pad(dateArray[2], 2) + " " + hijriMonthText[dateArray[1]] + " " + dateArray[0];
    }
    return moment().format(format);
}

// retrieve owghat for desired date and method of calculation from server
function getOwghat(date, method) {
    var cityID = localStorage.getItem("cityID");
    return $.get(prefix + "api/owghat.php?city=" + cityID + "&date=" + date + "&method=" + method).then(function (response) {
        return response.prayerTimes[0];
    });
}

// set initial values for required variables or retrieve them from server and save to local storage
function initLocalStorage() {
    // no need to initialize some of variables if it is not the first use of app by user
    var firstUse = (localStorage.length ? false : true);
    localStorage.setItem("asyncCounter", 0);
    // retrieve list of cities with available radio service
    $.get(prefix + "api/cities.php").then(function (response) {
        localStorage.setItem("citiesList", JSON.stringify(response));
        if (firstUse) {
            localStorage.setItem("liveStreamURL", getCityAttribute("Montreal", "url"));
        }
        var asyncCounter = parseInt(localStorage.getItem("asyncCounter"));
        localStorage.setItem("asyncCounter", ++asyncCounter)
    });
    if (firstUse) {
        // initialize radio stream, location, timeZone, and today dates (in 3 formats) and owghat
        localStorage.setItem("cityEn", "Montreal");
        localStorage.setItem("cityFa", "مونترال");
        localStorage.setItem("cityID", "3");
        localStorage.setItem("timeZone", "America/Toronto");
        localStorage.setItem("latitude", 45.5139);
        localStorage.setItem("longitude", -73.5694);
        localStorage.setItem("method", 0);
        localStorage.setItem("sleepTimerActive", false);
        localStorage.setItem("sleepTime", "5");
        localStorage.setItem("pwaInstalled", false);
        localStorage.setItem("walkthroughViewed", false);
    }
    moment.tz(localStorage.getItem("timeZone"));
    moment.locale("en");
    var cityID = localStorage.getItem("cityID");
    var method = localStorage.getItem("method");
    var today = getDate(
        format = "YYYY-MM-DD",
        options = {}
    );
    localStorage.setItem("gregorianDate", getDate(
        format = "DD MMMM YYYY",
        options = {
            locale: "fa",
        }
    ));
    localStorage.setItem("jalaaliDate", getDate(
        format = "jDD jMMMM jYYYY",
        options = {
            locale: "fa"
        }
    ));
    // retrieve qamari date
    $.get(prefix + "/api/ghamari.php?city=" + cityID + "&date=" + today).then(function (response) {
        localStorage.setItem("hijriDate", getDate(
            format = "iDD iMMMM iYYYY",
            options = {
                qamariDate: response[0].ghamari
            }
        ));
        updatePrayerOfDay();
        var asyncCounter = parseInt(localStorage.getItem("asyncCounter"));
        localStorage.setItem("asyncCounter", ++asyncCounter);
    });
    // retrieve today's owghat
    var owghat = {};
    getOwghat(today, method).then(function (response) {
        owghat.sobh = response.azan_sobh;
        owghat.sunrise = response.sunrise;
        owghat.zohr = response.zohr;
        owghat.sunset = response.sunset;
        owghat.maghreb = response.maghreb;
        moment.tz(localStorage.getItem("timeZone"));
        moment.locale("en");
        owghat.sobhTimeStamp = parseInt(moment(today + " " + owghat.sobh, 'YYYY-MM-DD HH:mm').format("X"));
        owghat.sobhAlert2 = owghat.sobhTimeStamp - 2 * 60;
        owghat.sobhAlert5 = owghat.sobhTimeStamp - 5 * 60;
        owghat.sobhAlert10 = owghat.sobhTimeStamp - 10 * 60;
        owghat.sobhAlert20 = owghat.sobhTimeStamp - 20 * 60;
        localStorage.setItem("owghat", JSON.stringify(owghat));
        var asyncCounter = parseInt(localStorage.getItem("asyncCounter"));
        localStorage.setItem("asyncCounter", ++asyncCounter)
    })
    // retrieve all the prayers and list of their titles from JSON data file
    $.getJSON('../data/prayers.json', function (response) {
        localStorage.setItem("prayers", JSON.stringify(response));
        localStorage.setItem("prayersList", JSON.stringify(Object.keys(response)));
    });
    // retrieve radio conductor for today and tomorrow
    /*
    $.get(prefix + "api/radio-conductor.php?city=" + cityID).then(function (response) {
        localStorage.setItem("conductor", JSON.stringify(response));
        var asyncCounter = parseInt(localStorage.getItem("asyncCounter"));
        localStorage.setItem("asyncCounter", ++asyncCounter)
    });
    */
    // retrive banners corresponding to selected city
    $.get(prefix + "api/ads.php?city=" + cityID).then(function (response) {
        localStorage.setItem("banners", JSON.stringify(response));
        var asyncCounter = parseInt(localStorage.getItem("asyncCounter"));
        localStorage.setItem("asyncCounter", ++asyncCounter)
    })
    // other settings
    localStorage.setItem("prayerLayoutType", "عربی و فارسی");
    localStorage.setItem("calendarOffset", 0);
    localStorage.setItem("azanAlertAllowed", false);
    localStorage.setItem("live", true);
    localStorage.setItem("originalVolume", 1);
}

// to update dates and owghat on radio page if user changed the city or a new day starts
function updateDates(storageOnly) {
    var cityID = localStorage.getItem("cityID");
    var today = getDate(
        format = "YYYY-MM-DD",
        options = {}
    )
    var gregorianDate = getDate(
        format = "DD MMMM YYYY",
        options = {
            locale: "fa"
        }
    );
    var jalaaliDate = getDate(
        format = "jDD jMMMM jYYYY",
        options = {
            locale: "fa"
        }
    );
    var hijriDate;
    $.get(prefix + "/api/ghamari.php?city=" + cityID + "&date=" + today).then(function (response) {
        hijriDate = getDate(
            format = "iDD iMMMM iYYYY",
            options = {
                qamariDate: response[0].ghamari
            }
        )
        localStorage.setItem("hijriDate", hijriDate);
        if (!storageOnly) {
            $("#hijri-date").html(hijriDate);
        }
    });
    localStorage.setItem("gregorianDate", gregorianDate);
    localStorage.setItem("jalaaliDate", jalaaliDate);
    if (!storageOnly) {
        $("#gregorian-date").html(gregorianDate);
        $("#jalaali-date").html(jalaaliDate);
    }
}

//
function updateOwghat(storageOnly) {
    var method = localStorage.getItem("method");
    var today = getDate(
        format = "YYYY-MM-DD",
        options = {}
    )
    var owghat = {};
    getOwghat(today, method).then(function (response) {
        owghat.sobh = response.azan_sobh;
        owghat.sunrise = response.sunrise;
        owghat.zohr = response.zohr;
        owghat.sunset = response.sunset;
        owghat.maghreb = response.maghreb;
        owghat.sobhTimeStamp = parseInt(moment(today + " " + owghat.sobh, 'YYYY-MM-DD HH:mm').format("X"));
        owghat.sobhAlert2 = owghat.sobhTimeStamp - 2 * 60;
        owghat.sobhAlert5 = owghat.sobhTimeStamp - 5 * 60;
        owghat.sobhAlert10 = owghat.sobhTimeStamp - 10 * 60;
        owghat.sobhAlert20 = owghat.sobhTimeStamp - 20 * 60;
        localStorage.setItem("owghat", JSON.stringify(owghat));
        if (!storageOnly) {
            $("#sobh").html(response.azan_sobh);
            $("#sunrise").html(response.sunrise);
            $("#zohr").html(response.zohr);
            $("#sunset").html(response.sunset);
            $("#maghreb").html(response.maghreb);
        }
    });
}

//
function updateConductor() {
    // retrieve radio conductor for today and tomorrow
    var cityID = localStorage.getItem("cityID");
    $.get(prefix + "api/radio-conductor.php?city=" + cityID).then(function (response) {
        localStorage.setItem("conductor", JSON.stringify(response));
        updateNextProgram();
    });
}

//
function updateBanners() {
    var cityID = localStorage.getItem("cityID");
    $.get(prefix + "api/ads.php?city=" + cityID).then(function (response) {
        localStorage.setItem("banners", JSON.stringify(response));
    })
}

// load Google qibla finder into an iframe
function qibla() {
    var latitude = parseFloat(localStorage.getItem("latitude"));
    var longitude = parseFloat(localStorage.getItem("longitude"));
    var latlng = new google.maps.LatLng(latitude, longitude);
    var options = {
        zoom: 17,
        center: latlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        zoomControl: true,
        zoomControlOptions: {
            position: google.maps.ControlPosition.LEFT_TOP
        },
        mapTypeControl: false,
        mapTypeId: 'satellite',
        scaleControl: true,
        scaleControlOptions: {
            position: google.maps.ControlPosition.LEFT_TOP
        },
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: true
    };
    var map = new google.maps.Map(document.querySelector("#qibla-finder"), options); // generate the map object
    // define a path (polyline) connecting current coordinates to Mecca and add it to the map
    var qiblaPath = [{
            lat: latitude,
            lng: longitude
        },
        {
            lat: 21.422487,
            lng: 39.826206
        },
    ];
    window.qiblaDirection = new google.maps.Polyline({
        path: qiblaPath,
        geodesic: true,
        strokeColor: '#BFFF00',
        strokeOpacity: 1.0,
        strokeWeight: 3
    });
    window.qiblaDirection.setMap(map);
    // define a marker object at the current coordinates
    var marker = new google.maps.Marker({
        position: latlng,
        map: map,
    });
    // event listener to keep the marker at the center of the map
    google.maps.event.addListener(map, 'center_changed', function () {
        setTimeout(function () {
            var center = map.getCenter();
            marker.setPosition(center);
        }, 50);
    });
    var geoLocControl = new klokantech.GeolocationControl(map, 17); // add geo-location button to the map
    // the button at the bottom of the qibla page will regenerate a path for desired location
    $("#direction-btn").on('touchend click', function () {
        window.qiblaDirection.setMap(null);
        var newMapCenter = map.getCenter();
        var newQiblaPath = [{
                lat: newMapCenter.lat(),
                lng: newMapCenter.lng()
            },
            {
                lat: 21.422487,
                lng: 39.826206
            },
        ];
        window.qiblaDirection = new google.maps.Polyline({
            path: newQiblaPath,
            geodesic: true,
            strokeColor: '#BFFF00',
            strokeOpacity: 1.0,
            strokeWeight: 3
        });
        window.qiblaDirection.setMap(map);
    })
}

// change progress bar width depending on scroll level
function attachProgressBar(scrollable, bar) {
    $('#' + scrollable).on('scroll', function () {
        var item = document.querySelector("#" + scrollable);
        var progressBar = document.querySelector("#" + bar);
        var itemScroll = item.scrollTop;
        var height = item.scrollHeight - item.clientHeight;
        var scrolled = (itemScroll / height) * 100;
        progressBar.style.width = scrolled + "%";
    });
}

// get the prayer verses in arabic and farsi and layouts the container based on desired layout type
function layoutPrayer(container, prayerTextArray, layoutType) {
    $("#" + container).empty();
    $.each(prayerTextArray, function (index, verse) {
        if (verse.arabic != null && layoutType.includes("عربی")) {
            $("#" + container).append("<p class='color-white bottom-10' style='font-family: Calibri, sans-serif; line-height: 32px; font-size: 18px; text-align: center;'>" + verse.arabic + "</p>");
        }
        if (verse.farsi != null && layoutType.includes("فارسی")) {
            $("#" + container).append("<p class='bottom-10' style='font-family: Ramadan, sans-serif; text-align: center;'>" + verse.farsi + "</p>");
        }
    });
    $("#" + container).scrollTop(0);
}

//
function updatePrayerOfDay() {
    // if we are in Radaman, load corresponding daily prayer, otherwise load regular weekday prayer
    var cityID = localStorage.getItem("cityID");
    var today = getDate(
        format = "YYYY-MM-DD",
        options = {}
    );
    var todayRank = moment(today).day();
    var todayDayName = getDate(
        format = "dddd",
        options = {
            locale: "fa"
        }
    );
    var hijriDate = localStorage.getItem("hijriDate");
    var hijriDateArray = hijriDate.split(" ");
    var thisHijriMonthName = hijriDateArray[1];
    var todayHijriDayNumber = hijriDateArray[0];
    var prayerOfDay = {};
    if (thisHijriMonthName == "رمضان") {
        $.get(prefix + "api/dua.php?city=" + cityID + "&day=" + parseInt(todayHijriDayNumber)).then(function (response) {
            prayerOfDay.title = "دعای روز " + dayRankText[todayHijriDayNumber] + " ماه رمضان";
            prayerOfDay.text = [];
            prayerOfDay.text.push({
                "arabic": response[0].dua_ar,
                "farsi": response[0].dua_fa
            });
            localStorage.setItem("prayerOfDay", JSON.stringify(prayerOfDay));
        });
    } else {
        $.getJSON('../data/prayersOfDays.json', function (response) {
            prayerOfDay.title = "دعای روز " + todayDayName;
            prayerOfDay.text = response[todayRank];
            localStorage.setItem("prayerOfDay", JSON.stringify(prayerOfDay));
        });
    }
}

// get prayers of day from local storage and inject it into its modal
function loadPrayerOfDay() {
    var prayerOfDay = JSON.parse(localStorage.getItem("prayerOfDay"));
    $("#prayer-of-day-title").text(prayerOfDay.title);
    layoutPrayer("prayer-of-day-text", prayerOfDay.text, "عربی و فارسی");
    attachProgressBar("prayer-of-day-text", "prayer-of-day-bar");
}

// load and layout newly selected prayer in its corresponding container
function loadPrayer(container) {
    var prayers = JSON.parse(localStorage.getItem("prayers"));
    var prayer = $("#prayer-selector").val();
    var prayerLayoutType = localStorage.getItem("prayerLayoutType");
    layoutPrayer(container, prayers[prayer].text, prayerLayoutType);
    attachProgressBar(container, "prayer-bar");
}

// get the prayers list from local storage and inject it into corresponding dropdown list
function fillPrayersList() {
    var prayersList = JSON.parse(localStorage.getItem("prayersList"));
    $("#prayer-selector").empty();
    for (i = 0; i < prayersList.length; i++) {
        $("#prayer-selector").append($("<option></option>").val(prayersList[i]).html(prayersList[i]));
    }
}

// assign data to elements in prayers page
function prayers() {
    if (os == "Desktop") {
        $(".theme-dark .input-style-2 select").attr("style", "color: #000 !important; background-color: #FFF;");
        $(".theme-dark .input-style-2 em").attr("style", "color: #000;");
    }
    var count = -1;
    var layouts = ["عربی", "فارسی", "عربی و فارسی"];
    var prayers = JSON.parse(localStorage.getItem("prayers"));
    fillPrayersList();
    loadPrayer("prayer-text");
    // load new prayer when user selects a new prayer from list
    $("#prayer-selector").on('change', function () {
        loadPrayer("prayer-text");
    });
    // play prayer's audio or notify user if the prayer doesn't come with an audio
    $("#chant-btn").on('touchend click', function () {
        var prayer = $("#prayer-selector").val();
        if (prayers[prayer].audio != "") {
            var localAudioURL = prefix + "audio/" + prayers[prayer].audio;
            playStream(localAudioURL);
            window.plyr.play();
            localStorage.setItem("live", false);
        } else {
            showSnackBar("no-prayer-audio-warning");
        }
    });
    // 
    $("#layout-btn").on('touchend click', function () {
        var newLayoutType = layouts[++count % layouts.length];
        var nextLayoutType = layouts[++count % layouts.length];
        --count;
        localStorage.setItem("prayerLayoutType", newLayoutType);
        $(this).html('<i class="fas fa-globe"></i> ' + nextLayoutType);
        loadPrayer("prayer-text");
    });
    $("#text-view-options a").on("touchend click", function (e) {
        e.stopPropagation();
        e.preventDefault();
        var textViewOption = $(this).data('tab');
        switch (textViewOption) {
            case "minus":
                if (parseInt($("#prayer-text p:first-child").css("font-size")) > 16) {
                    $("#prayer-text p").css("font-size", "-=2px");
                    $("#prayer-text p").css("line-height", "-=2px");
                }
                break;
            case "plus":
                if (parseInt($("#prayer-text p:first-child").css("font-size")) < 26) {
                    $("#prayer-text p").css("font-size", "+=2px");
                    $("#prayer-text p").css("line-height", "+=2px");
                }
                break;
            case "fullscreen":
                showSnackBar("fullscreen-prayer-warning");
                break;
        }
    });
}

// fill up cities dropdown list in cities menu
function fillCitiesList() {
    var citiesList = JSON.parse(localStorage.getItem("citiesList"));
    $("#city-selector").empty();
    for (i = 0; i < citiesList.length; i++) {
        $("#city-selector").append($("<option></option>").val(citiesList[i].city_name_en).html(citiesList[i].city_name_fa));
    }
}

// calculate and return the width of rolling text
$.fn.textWidth = function () {
    var calc = '<span style="display:none">' + $(this).text() + '</span>';
    $('body').append(calc);
    var width = $('body').find('span:last').width();
    $('body').find('span:last').remove();
    return parseInt(width);
};

// text rolling effect used for next program on radio page and titles/details of schedule items
$.fn.marquee = function (args) {
    var that = $(this);
    var textWidth = that.textWidth(),
        //offset = parseInt(that.width()),
        offset = 0,
        width = offset,
        css = {
            'text-indent': that.css('text-indent'),
            'overflow': that.css('overflow'),
            'white-space': that.css('white-space')
        },
        marqueeCss = {
            'text-indent': width,
            'overflow': 'hidden',
            'white-space': 'nowrap'
        },
        args = $.extend(true, {
            count: -1,
            speed: 1e1,
            leftToRight: false
        }, args),
        i = 0,
        stop = textWidth * -1,
        dfd = $.Deferred();

    function go() {
        if (!that.length) return dfd.reject();
        if (width == stop) {
            i++;
            if (i == args.count) {
                that.css(css);
                return dfd.resolve();
            }
            if (args.leftToRight) {
                width = textWidth * -1;
            } else {
                width = offset;
            }
        }
        that.css('text-indent', width + 'px');
        if (args.leftToRight) {
            width++;
        } else {
            width--;
        }
        setTimeout(go, args.speed);
    };
    if (args.leftToRight) {
        width = textWidth * -1;
        width++;
        stop = offset;
    } else {
        width--;
    }
    that.css(marqueeCss);
    setTimeout(function () {
        offset = parseInt(that.width());
        go();
    }, 2000);
    return dfd.promise();
};

// play a random 3-second radio tuning audio while switching stations
function tuningNoise() {
    //var tuneStart = randomFromRange(0, 10);
    var tuneStart = 0;
    var tuneEnd = tuneStart + 3;
    tune.src = prefix + 'audio/tuning_noise.mp3';
    tune.currentTime = tuneStart;
    tune.play();
    var tuneWatch = setInterval(function () {
        if (tune.currentTime >= tuneEnd) {
            tune.pause();
            clearInterval(tuneWatch);
        }
    }, 500);
}

// update local storage variables and dates and owghat on radio page if user changed the city
function citySelectorChanged() {
    localStorage.setItem("cityEn", $("#city-selector").val());
    localStorage.setItem("cityFa", $("#city-selector option:selected").text());
    var cityFa = localStorage.getItem("cityFa");
    var cityID = getCityAttribute($("#city-selector").val(), "city_id");
    var timeZone = getCityAttribute($("#city-selector").val(), "time_zone");
    var liveStreamURL = getCityAttribute($("#city-selector").val(), "url");
    localStorage.setItem("cityID", cityID);
    localStorage.setItem("timeZone", timeZone);
    localStorage.setItem("liveStreamURL", liveStreamURL)
    $("#city").html(cityFa);
    updateDates(storageOnly = false);
    updateOwghat(storageOnly = false);
    //updateConductor();
    updatePrayerOfDay();
    updateBanners();
    playStream(liveStreamURL)
    tuningNoise();
    setTimeout(function () {
        window.plyr.play();
    }, 2000);
}

// find next program title and assign it to the text roller in radio page
function updateNextProgram() {
    moment.tz(localStorage.getItem("timeZone"));
    moment.locale("en");
    var conductor = JSON.parse(localStorage.getItem("conductor"));
    var today = getDate(
        format = "YYYY-MM-DD",
        options = {}
    );
    var tomorrow = getDate(
        format = "YYYY-MM-DD",
        options = {
            offset: 1,
            offsetType: "days"
        }
    )
    var timeStamp = parseInt(getDate(
        format = "X",
        options = {}
    ));
    var program,
        nextProgram,
        programTimeStamp,
        nextProgramTimeStamp,
        nextProgramText;

    var conductorToday = [];
    var conductorTomorrow = [];
    for (i = 0; i < conductor.length; i++) {
        program = conductor[i];
        if (program.Date == today) {
            conductorToday.push(program);
        } else {
            conductorTomorrow.push(program);
        }
    }
    var lastProgramOfTodayTimeStamp = parseInt(moment(today + " " + conductorToday[conductorToday.length - 1].startHour + ":00").format("X"));
    if (timeStamp > lastProgramOfTodayTimeStamp) {
        nextProgram = conductorTomorrow[0];
    } else {
        for (i = 0; i < conductorToday.length; i++) {
            programTimeStamp = parseInt(moment(today + " " + conductorToday[i].startHour + ":00").format("X"));
            if (programTimeStamp > timeStamp) {
                nextProgram = conductorToday[i];
                break;
            }
        }
    }
    nextProgramTimeStamp = parseInt(moment(today + " " + nextProgram.startHour + ":00").format("X"));
    nextProgramText = (nextProgram.detail_fa) ? nextProgram.name_fa + " (" + nextProgram.detail_fa + ")" : nextProgram.name_fa
    $("#next-program").html(nextProgramText);
}

//
function azanAlerter() {
    var owghat = JSON.parse(localStorage.getItem("owghat"));
    var timeStamp = parseInt(getDate(
        format = "X",
        options = {}
    ));
    switch (timeStamp) {
        case owghat.sobhAlert2:
            localStorage.setItem("azanAlertAllowed", true);
            azanAlert.src = prefix + "audio/azan_alert_2.mp3";
            break;
        case owghat.sobhAlert5:
            localStorage.setItem("azanAlertAllowed", true);
            azanAlert.src = prefix + "audio/azan_alert_5.mp3";
            break;
        case owghat.sobhAlert10:
            localStorage.setItem("azanAlertAllowed", true);
            azanAlert.src = prefix + "audio/azan_alert_10.mp3";
            break;
        case owghat.sobhAlert20:
            localStorage.setItem("azanAlertAllowed", true);
            azanAlert.src = prefix + "audio/azan_alert_20.mp3";
            break;
    }
    var azanAlertAllowed = (localStorage.getItem("azanAlertAllowed") == "true") ? true : false;
    if (azanAlertAllowed) {
        localStorage.setItem("azanAlertAllowed", false);
        localStorage.setItem("originalVolume", window.plyr.volume);
        if (os == "Android") {
            window.plyr.volume = 0.1;
        } else {
            window.plyr.muted = true;
        }
        setTimeout(function () {
            azanAlert.play();
        }, 1000);
        setTimeout(function () {
            azanAlert.pause();
            if (os == "Android") {
                window.plyr.volume = parseFloat(localStorage.getItem("originalVolume"));
            } else {
                window.plyr.muted = false;
            }
        }, 10000);
    }
}

// assign data to elements in radio page
function radio() {
    $("#gregorian-date").html(localStorage.getItem("gregorianDate"));
    $("#jalaali-date").html(localStorage.getItem("jalaaliDate"));
    $("#hijri-date").html(localStorage.getItem("hijriDate"));
    $("#city").html(localStorage.getItem("cityFa"));
    var owghat = JSON.parse(localStorage.getItem("owghat"));
    $("#sobh").html(owghat.sobh);
    $("#sunrise").html(owghat.sunrise);
    $("#zohr").html(owghat.zohr);
    $("#sunset").html(owghat.sunset);
    $("#maghreb").html(owghat.maghreb);
    var banners = JSON.parse(localStorage.getItem("banners"));
    $("#banner").attr("src", banners[0].url);
    if (!window.bannersWatch) {
        window.bannersWatch = setInterval(function () {
            banners = JSON.parse(localStorage.getItem("banners"));
            var randIndex = randomFromRange(0, banners.length - 1);
            $("#banner").attr("src", banners[randIndex].url);
        }, 5000);
    }
    if (os == "Desktop") {
        $("#radio-buttons-container").css("bottom", "calc(15px + (5 / 32) * (0.3 * 100vw - 30px))");
        $("#next-program-container").css("bottom", "calc(55px + (5 / 32) * (0.3 * 100vw - 30px))")
        $("#next-program").css("width", "calc((0.3 * 100vw) - 175px)");
    }
    /*
    updateNextProgram();
    $("#next-program").marquee({
        speed: 40,
        leftToRight: false
    });
    */
    // fill the cities dropdown list and set a change event for it to update data corresponding to selected city
    $(".cities-btn").on("touchend click", function () {
        if (os == "Desktop") {
            $(".theme-dark .input-style-2 select").attr("style", "color: #000 !important; background-color: #FFF;");
            $(".theme-dark .input-style-2 em").attr("style", "color: #000;");
        }
        fillCitiesList();
        $("#city-selector").val(localStorage.getItem("cityEn"));
        $("#city-selector").on('change', function () {
            citySelectorChanged();
        });
    });
    // load prayer of the day modal on clicking its button
    $("#prayer-of-day-btn").on('touchend click', function () {
        loadPrayerOfDay();
    });
    // start playing the radio stream (mainly, when a local audio is played and user wants to switch back to radio)
    $("#radio-btn").on('touchend click', function () {
        playStream(localStorage.getItem("liveStreamURL"));
        window.plyr.play();
        localStorage.setItem("live", true);
    });
    //
    document.addEventListener('touchend click', function () {
        document.removeEventListener('touchend click', arguments.callee, false);
        tune.src = prefix + 'audio/silence.mp3'
        azanAlert.src = prefix + 'audio/silence.mp3';
        play(tune);
        play(azanAlert);
    }, false);
    // dates and owghat on radio page should automatically update at midnight (start of a new day)
    if (!window.midnightWatch) {
        window.midnightWatch = setInterval(function () {
            var date = new Date();
            if (date.getHours() === 0 && date.getMinutes() === 0) {
                updateDates(storageOnly = false);
                updateOwghat(storageOnly = false);
                updatePrayerOfDay();
                //updateConductor();
            }
        }, 60000);
    }
    //
    /*
    if (!window.nextProgramWatch) {
        window.nextProgramWatch = setInterval(function () {
            updateNextProgram();
        }, 2000);
    }
    */
    //
    if (!window.azanAlertWatch) {
        window.azanAlertWatch = setInterval(function () {
            azanAlerter();
        }, 1000);
    }
    attachProgressBar("radio", "radio-bar");
    setTimeout(function () {
        var walkthroughViewed = (localStorage.getItem("walkthroughViewed") == "true") ? true : false;
        if (!walkthroughViewed) {
            walkthrough();
        }
    }, 3000);
}

// layout calendar for selected month to allow user select any date, month, and year
function layoutCalendar(month) {
    moment.tz(localStorage.getItem("timeZone"));
    moment.locale("en");
    // update calendar month offest depending on user selection
    var offset = parseInt(localStorage.getItem("calendarOffset"));
    if (month == "nextMonth") {
        offset += 1;
    } else if (month == "prevMonth") {
        offset -= 1;
    }
    localStorage.setItem("calendarOffset", offset);
    // set calendar month and required variables for layout
    var method = localStorage.getItem("method");
    $("#calendar-title").html(getDate(
        format = "MMMM YYYY",
        options = {
            locale: "fa",
            offset: offset,
            offsetType: "months"
        }
    ));
    var currentMonth = getDate(
        format = "YYYY-MM",
        options = {
            offset: offset,
            offsetType: "months"
        }
    );
    var prevMonth = getDate(
        format = "YYYY-MM",
        options = {
            offset: offset - 1,
            offsetType: "months"
        }
    );
    var daysInCurrentMonth = moment(currentMonth).daysInMonth();
    var daysInPrevMonth = moment(prevMonth).daysInMonth();
    var today = getDate(
        format = "YYYY-MM-DD",
        options = {}
    );
    var todayDayNumber = getDate(
        format = "DD",
        options = {}
    );
    var firstDayDate = getDate(
        format = "YYYY-MM",
        options = {
            offset: offset,
            offsetType: "months"
        }
    ) + "-01";
    var lastDayDate = getDate(
        format = "YYYY-MM",
        options = {
            offset: offset,
            offsetType: "months"
        }
    ) + "-" + pad(daysInCurrentMonth, 2);
    var firstDayRank = moment(firstDayDate).day();
    var lastDayRank = moment(lastDayDate).day();
    // layout days in calendar cells based on number of days in the month and starting/ending days
    $(".cal-dates").empty();
    for (i = firstDayRank - 1; i >= 0; i--) {
        $(".cal-dates").append("<a href='#' style='pointer-events: none;' class='cal-disabled'>" + (daysInPrevMonth - i) + "</a>")
    }
    for (i = 0; i < daysInCurrentMonth; i++) {
        if (i + 1 == parseInt(todayDayNumber, 10) && offset == 0) {
            $(".cal-dates").append("<a href='#' class='cal-selected'><i class='fa fa-square'></i><span>" + (i + 1) + "</span></a>");
        } else {
            $(".cal-dates").append("<a href='#'>" + (i + 1) + "</a>");
        }
    }
    for (i = 0; i < 6 - lastDayRank; i++) {
        $(".cal-dates").append("<a href='#' style='pointer-events: none;' class='cal-disabled'>" + (i + 1) + "</a>")
    }
    $(".cal-dates").append("<div class='clear'></div>");
    // retrieve and show owghat for today by default
    if (offset == 0) {
        getOwghat(today, method).then(function (response) {
            $("#sobh").html(response.azan_sobh);
            $("#sunrise").html(response.sunrise);
            $("#zohr").html(response.zohr);
            $("#sunset").html(response.sunset);
            $("#maghreb").html(response.maghreb);
        });
    }
    // update owghat on choosing another date from calendar
    $(".cal-dates a").on('touchend click', function () {
        var method = localStorage.getItem("method");
        var span = $(".cal-dates a").find("span");
        var cellText = $(this).text();
        var selectedDay = currentMonth + "-" + pad(cellText, 2);
        $(".cal-dates a").removeClass("cal-selected");
        $(".cal-dates a").children("i").remove();
        $(".cal-dates a").find("span").replaceWith(span.html());
        $(this).addClass("cal-selected");
        $(this).html("<i class='fa fa-square'></i><span>" + $(this).html() + "</span>");
        getOwghat(selectedDay, method).then(function (response) {
            $("#sobh").html(response.azan_sobh);
            $("#sunrise").html(response.sunrise);
            $("#zohr").html(response.zohr);
            $("#sunset").html(response.sunset);
            $("#maghreb").html(response.maghreb);
        });
    });
}

// show owghat of the desired date
function owghat() {
    attachProgressBar("owghat", "owghat-bar");
    layoutCalendar(); // for current month
    // update calendar to next month on button click
    $("#calendar-prev-month").on('touchend click', function (e) {
        e.stopPropagation();
        e.preventDefault();
        layoutCalendar('prevMonth');
    })
    // update calendar to previous month on button click
    $("#calendar-next-month").on('touchend click', function (e) {
        e.stopPropagation();
        e.preventDefault();
        layoutCalendar('nextMonth');
    })
}

// activate progress bar in support page
function support() {
    attachProgressBar("support", "support-bar");
}

// activate progress bar in about page
function about() {
    attachProgressBar("about", "about-bar");
}

// activate progress bar in contact page
function contact() {
    attachProgressBar("contact", "contact-bar");
}

// fill out conductor for today and tomorrow in separate tabs
function schedule() {
    var conductor = JSON.parse(localStorage.getItem("conductor"));
    var today = getDate(
        format = "YYYY-MM-DD",
        options = {}
    );
    var tomorrow = getDate(
        format = "YYYY-MM-DD",
        options = {
            offset: 1,
            offsetType: "days"
        }
    );
    var id = '';
    $.each(conductor, function (index, program) {
        switch (program.Date) {
            case today:
                id = 'today';
                break;
            case tomorrow:
                id = 'tomorrow';
                break;
        }
        if (program.detail_fa) {
            $('#' + id + ' .link-list').append('<a href="#"><i class="fas ' + scheduleSign[program.category] + '"></i><span>' + program.name_fa + '</span><em class="bg-blue2-dark">' + program.startHour + '</em><strong>' + program.detail_fa + '</strong></a>');
            var title = $('#' + id + ' .link-list a span').last();
            if (title.textWidth() >= screen.width - 200) {
                title.marquee({
                    speed: 40,
                    leftToRight: false
                });
            }
        } else {
            $('#' + id + ' .link-list').append('<a href="#"><i class="fas ' + scheduleSign[program.category] + '"></i><span style="transform: translateY(0);">' + program.name_fa + '</span><em class="bg-blue2-dark">' + program.startHour + '</em></a>');
            var title = $('#' + id + ' .link-list a span').last();
            if (title.textWidth() >= screen.width - 200) {
                title.marquee({
                    speed: 40,
                    leftToRight: false
                });
            }
        }
    });
    attachProgressBar("schedule-today", "schedule-bar");
    attachProgressBar("schedule-tomorrow", "schedule-bar");
}

// load or save app settings
function settings() {
    if (os == "Desktop") {
        $(".theme-dark .input-style-2 select").attr("style", "color: #000 !important; background-color: #FFF;");
        $(".theme-dark .input-style-2 em").attr("style", "color: #000;");
    }
    $("#method-selector").val(localStorage.getItem("method"));
    $("#method-selector").on('change', function () {
        localStorage.setItem('method', $(this).val());
        updateOwghat(storageOnly = true);
    });
    var sleepTimerActive = (localStorage.getItem("sleepTimerActive") == 'true');
    if (sleepTimerActive) {
        $("#sleep-timer-toggle").trigger("click");
    }
    var sleepTime = localStorage.getItem("sleepTime");
    $("#sleep-time a").each(function (index) {
        if ($(this).data('tab') == sleepTime) {
            $(this).addClass("bg-green1-dark");
        } else {
            $(this).removeClass("bg-green1-dark");
        }
    })
    $("#sleep-timer-toggle").on('touchend click', function () {
        var sleepTimerActive = (localStorage.getItem("sleepTimerActive") == 'true');
        var sleepTime = parseInt(localStorage.getItem("sleepTime"));
        if (!sleepTimerActive) {
            showSnackBar("sleep-timer-active-success");
            localStorage.setItem("sleepTimerActive", true);
            window.sleepTimeout = setTimeout(function () {
                window.plyr.stop();
                localStorage.setItem("sleepTimerActive", false);
            }, sleepTime * 60000);
        } else {
            showSnackBar("sleep-timer-inactive-warning");
            localStorage.setItem("sleepTimerActive", false);
            if (window.sleepTimeout) {
                clearTimeout(window.sleepTimeout);
            }
        }
    });
    $("#sleep-time a").on('touchend click', function () {
        var sleepTimerActive = (localStorage.getItem("sleepTimerActive") == 'true');
        if (sleepTimerActive) {
            $("#sleep-timer-toggle").trigger("click");
            localStorage.setItem("sleepTimerActive", false);
            showSnackBar("sleep-timer-inactive-warning");
        }
        var sleepTime = $(this).data('tab');
        localStorage.setItem("sleepTime", sleepTime);
    });
    attachProgressBar("settings", "settings-bar");
}

//
function walkthrough() {
    $(".menu-hider").trigger('click');
    showModal("menu-walkthrough");
    var glide = new Glide('#walkthrough', {
        type: 'slider',
        startAt: 0,
        perView: 1,
        autoplay: 8000,
        hoverpause: true,
        rewindDuration: 2000,
        animationTimingFunc: 'ease-in-out',
        direction: 'rtl',
        dragThreshold: false,
        swipeThreshold: false
    });
    glide.mount();
}

// get html content from url and return it in plain text format
async function fetchHtmlAsText(htmlURL) {
    return fetch(htmlURL).then(function (response) {
        return response.text();
    });
}

// remove current page from the index and fetch data regarding the new page into it
function loadPage(page) {
    var prevPage = localStorage.getItem("prevPage");
    $(".menu-hider").click();
    $("#" + prevPage + "-tab").removeClass("active-nav2");
    $("#" + page + "-tab").addClass("active-nav2");
    localStorage.setItem("prevPage", page);
    $("#page").remove();
    fetchHtmlAsText(page + ".html").then(function (response) {
        $(".page-title-large").after(response);
        init_template();
        eval(page + "();");
    });
}