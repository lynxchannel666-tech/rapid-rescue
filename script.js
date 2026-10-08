/* ==========================================
   RAPIDRESCUE JAVASCRIPT
========================================== */


/* ==========================================
   VARIABLES
========================================== */

let currentLocation = {
    lat: 22.5726,
    lng: 88.3639
};


let selectedEmergency = "";


let answers = {
    conscious: "",
    breathing: "",
    bleeding: ""
};


let priority = "Normal";


let map = null;

let trackingMap = null;


let patientMarker = null;

let ambulanceMarker = null;


let trackingTimer = null;


/* Demo ambulance */

let ambulance = {
    id: "RR-104",

    lat: 22.5900,

    lng: 88.3900
};


/* ==========================================
   SCREEN CONTROL
========================================== */

function showScreen(screenId) {

    const screens =
        document.querySelectorAll(".screen");


    screens.forEach(function(screen) {

        screen.classList.remove("active");

    });


    const selectedScreen =
        document.getElementById(screenId);


    if (selectedScreen) {

        selectedScreen.classList.add("active");

    }


    window.scrollTo(0, 0);
}


/* ==========================================
   GO HOME
========================================== */

function goHome() {

    stopTracking();

    showScreen("homeScreen");

}


/* ==========================================
   START EMERGENCY
========================================== */

function startEmergency() {

    showScreen("locationScreen");


    /*
       Wait for the location
       screen to become visible.
    */

    setTimeout(function() {

        createLocationMap();

        getCurrentLocation();

    }, 300);

}


/* ==========================================
   CREATE LOCATION MAP
========================================== */

function createLocationMap() {

    if (map !== null) {

        return;

    }


    map = L.map("map").setView(

        [
            currentLocation.lat,
            currentLocation.lng
        ],

        13

    );


    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",

        {

            attribution:
                "&copy; OpenStreetMap contributors"

        }

    ).addTo(map);


    patientMarker =
        L.marker([

            currentLocation.lat,

            currentLocation.lng

        ]).addTo(map);


    patientMarker.bindPopup(
        "📍 Your emergency location"
    );

}


/* ==========================================
   GET CURRENT LOCATION
========================================== */

function getCurrentLocation() {

    if (!navigator.geolocation) {

        alert(
            "Geolocation is not supported by your browser. Please use manual location."
        );

        return;

    }


    document.getElementById(
        "locationStatus"
    ).innerText =
        "Detecting your location...";


    navigator.geolocation.getCurrentPosition(

        function(position) {

            currentLocation.lat =
                position.coords.latitude;


            currentLocation.lng =
                position.coords.longitude;


            updateLocation();


        },


        function(error) {

            console.log(error);


            document.getElementById(
                "locationStatus"
            ).innerText =
                "Location permission unavailable";


            document.getElementById(
                "coordinates"
            ).innerText =
                "Use manual location below.";

        },


        {

            enableHighAccuracy: true,

            timeout: 10000,

            maximumAge: 0

        }

    );

}


/* ==========================================
   MANUAL LOCATION
========================================== */

function useManualLocation() {

    const lat =
        parseFloat(
            document.getElementById(
                "latitude"
            ).value
        );


    const lng =
        parseFloat(
            document.getElementById(
                "longitude"
            ).value
        );


    if (
        isNaN(lat)
        ||
        isNaN(lng)
    ) {

        alert(
            "Please enter valid coordinates."
        );

        return;

    }


    currentLocation.lat = lat;

    currentLocation.lng = lng;


    updateLocation();

}


/* ==========================================
   UPDATE LOCATION
========================================== */

function updateLocation() {

    document.getElementById(
        "locationStatus"
    ).innerText =
        "Emergency location detected";


    document.getElementById(
        "coordinates"
    ).innerText =

        currentLocation.lat.toFixed(5)
        +
        " , "
        +
        currentLocation.lng.toFixed(5);


    /*
       Make sure map exists.
    */

    createLocationMap();


    /*
       Move map to location.
    */

    map.setView(

        [
            currentLocation.lat,
            currentLocation.lng
        ],

        15

    );


    /*
       Move patient marker.
    */

    patientMarker.setLatLng(

        [
            currentLocation.lat,
            currentLocation.lng
        ]

    );

}


/* ==========================================
   GO TO EMERGENCY DETAILS
========================================== */

function goToEmergencyDetails() {

    showScreen("detailsScreen");

}


/* ==========================================
   SELECT EMERGENCY TYPE
========================================== */

function selectEmergencyType(button, type) {

    selectedEmergency = type;


    /*
       Remove selected state
       from every button.
    */

    const buttons =
        document.querySelectorAll(
            ".emergency-types button"
        );


    buttons.forEach(function(btn) {

        btn.classList.remove("selected");

    });


    /*
       Highlight selected button.
    */

    button.classList.add("selected");


    calculatePriority();

}


/* ==========================================
   ANSWER QUESTIONS
========================================== */

function answerQuestion(
    question,
    answer,
    button
) {

    answers[question] = answer;


    /*
       Remove previous selection.
    */

    const parent =
        button.parentElement;


    const buttons =
        parent.querySelectorAll("button");


    buttons.forEach(function(btn) {

        btn.classList.remove("selected");

    });


    /*
       Select current answer.
    */

    button.classList.add("selected");


    calculatePriority();

}


/* ==========================================
   PRIORITY SYSTEM
========================================== */

function calculatePriority() {

    let score = 0;


    /*
       Unconscious.
    */

    if (answers.conscious === "no") {

        score += 4;

    }


    /*
       Not breathing.
    */

    if (answers.breathing === "no") {

        score += 5;

    }


    /*
       Severe bleeding.
    */

    if (answers.bleeding === "yes") {

        score += 3;

    }


    /*
       Heart problems.
    */

    if (
        selectedEmergency === "Heart Problem"
    ) {

        score += 2;

    }


    /*
       Breathing problems.
    */

    if (
        selectedEmergency === "Breathing Problem"
    ) {

        score += 2;

    }


    /*
       Unconscious person.
    */

    if (
        selectedEmergency === "Unconscious Person"
    ) {

        score += 4;

    }


    /*
       Determine priority.
    */

    if (score >= 7) {

        priority = "Critical";

    }

    else if (score >= 3) {

        priority = "High";

    }

    else {

        priority = "Normal";

    }


    updatePriority();

}


/* ==========================================
   UPDATE PRIORITY UI
========================================== */

function updatePriority() {

    const box =
        document.getElementById(
            "priorityBox"
        );


    const text =
        document.getElementById(
            "priorityText"
        );


    text.innerText = priority;


    box.classList.remove(
        "normal",
        "high",
        "critical"
    );


    box.classList.add(
        priority.toLowerCase()
    );

}


/* ==========================================
   CONFIRM AMBULANCE REQUEST
========================================== */

function confirmAmbulanceRequest() {

    /*
       Check emergency type.
    */

    if (selectedEmergency === "") {

        alert(
            "Please select an emergency type."
        );

        return;

    }


    /*
       Create request ID.
    */

    const requestId =
        "RR"
        +
        Math.floor(
            1000 +
            Math.random() * 9000
        );


    document.getElementById(
        "requestId"
    ).innerText =
        "Request #" + requestId;


    /*
       Create mock ambulances.
    */

    const ambulances = [

        {

            id: "RR-104",

            lat:
                currentLocation.lat + 0.025,

            lng:
                currentLocation.lng + 0.025

        },


        {

            id: "RR-217",

            lat:
                currentLocation.lat - 0.020,

            lng:
                currentLocation.lng + 0.015

        },


        {

            id: "RR-308",

            lat:
                currentLocation.lat + 0.030,

            lng:
                currentLocation.lng - 0.020

        }

    ];


    /*
       Find nearest ambulance.
    */

    let nearest =
        ambulances[0];


    let shortestDistance =
        calculateDistance(
            currentLocation,
            nearest
        );


    ambulances.forEach(
        function(a) {

            const distance =
                calculateDistance(
                    currentLocation,
                    a
                );


            if (
                distance <
                shortestDistance
            ) {

                shortestDistance =
                    distance;

                nearest = a;

            }

        }
    );


    ambulance = nearest;


    /*
       Update tracking information.
    */

    document.getElementById(
        "ambulanceId"
    ).innerText =
        ambulance.id;


    document.getElementById(
        "trackingPriority"
    ).innerText =
        priority.toUpperCase();


    document.getElementById(
        "trackingPriority2"
    ).innerText =
        priority.toUpperCase();


    /*
       Open tracking screen.
    */

    showScreen("trackingScreen");


    setTimeout(function() {

        createTrackingMap();

        startTracking();

    }, 300);

}


/* ==========================================
   DISTANCE CALCULATION
========================================== */

function calculateDistance(a, b) {

    const R = 6371;


    const dLat =
        toRadians(
            b.lat - a.lat
        );


    const dLng =
        toRadians(
            b.lng - a.lng
        );


    const x =

        Math.sin(dLat / 2)
        *
        Math.sin(dLat / 2)

        +

        Math.cos(
            toRadians(a.lat)
        )

        *

        Math.cos(
            toRadians(b.lat)
        )

        *

        Math.sin(dLng / 2)
        *
        Math.sin(dLng / 2);


    const y =

        2
        *
        Math.atan2(
            Math.sqrt(x),
            Math.sqrt(1 - x)
        );


    return R * y;

}


/* ==========================================
   CONVERT TO RADIANS
========================================== */

function toRadians(degrees) {

    return degrees *
        Math.PI /
        180;

}


/* ==========================================
   CREATE TRACKING MAP
========================================== */

function createTrackingMap() {

    /*
       Remove old map.
    */

    if (trackingMap !== null) {

        trackingMap.remove();

        trackingMap = null;

    }


    trackingMap =
        L.map("trackingMap")
            .setView(

                [
                    currentLocation.lat,
                    currentLocation.lng
                ],

                13

            );


    L.tileLayer(

        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",

        {

            attribution:
                "&copy; OpenStreetMap contributors"

        }

    ).addTo(trackingMap);


    /*
       Patient marker.
    */

    L.marker(

        [
            currentLocation.lat,
            currentLocation.lng
        ]

    )

    .addTo(trackingMap)

    .bindPopup(
        "📍 Patient location"
    );


    /*
       Ambulance marker.
    */

    ambulanceMarker =
        L.marker(

            [
                ambulance.lat,
                ambulance.lng
            ]

        )

        .addTo(trackingMap)

        .bindPopup(
            "🚑 " + ambulance.id
        );


    /*
       Draw route.
    */

    L.polyline(

        [

            [
                ambulance.lat,
                ambulance.lng
            ],

            [
                currentLocation.lat,
                currentLocation.lng
            ]

        ]

    ).addTo(trackingMap);

}


/* ==========================================
   START TRACKING
========================================== */

function startTracking() {

    stopTracking();


    /*
       Move ambulance every
       1.5 seconds.
    */

    trackingTimer =
        setInterval(

            moveAmbulance,

            1500

        );


    updateTrackingInformation();

}


/* ==========================================
   MOVE AMBULANCE
========================================== */

function moveAmbulance() {

    /*
       Move 10% closer
       to patient.
    */

    ambulance.lat +=

        (
            currentLocation.lat
            -
            ambulance.lat
        )
        *
        0.10;


    ambulance.lng +=

        (
            currentLocation.lng
            -
            ambulance.lng
        )
        *
        0.10;


    /*
       Move marker.
    */

    if (ambulanceMarker) {

        ambulanceMarker.setLatLng(

            [
                ambulance.lat,
                ambulance.lng
            ]

        );

    }


    updateTrackingInformation();


    /*
       Check arrival.
    */

    const distance =
        calculateDistance(
            ambulance,
            currentLocation
        );


    if (distance < 0.08) {

        ambulanceArrived();

    }

}


/* ==========================================
   UPDATE TRACKING INFORMATION
========================================== */

function updateTrackingInformation() {

    const distance =
        calculateDistance(
            ambulance,
            currentLocation
        );


    /*
       Demo ETA.

       0.45 km per minute.
    */

    const eta =
        Math.max(

            1,

            Math.ceil(
                distance / 0.45
            )

        );


    document.getElementById(
        "distance"
    ).innerText =
        distance.toFixed(1)
        +
        " km";


    document.getElementById(
        "eta"
    ).innerText =
        eta
        +
        " min";

}


/* ==========================================
   AMBULANCE ARRIVED
========================================== */

function ambulanceArrived() {

    stopTracking();


    document.getElementById(
        "trackingStatus"
    ).innerText =
        "Ambulance has arrived";


    document.getElementById(
        "eta"
    ).innerText =
        "Arrived";


    /*
       Wait a little and
       show completed screen.
    */

    setTimeout(function() {

        showCompletedScreen();

    }, 2000);

}


/* ==========================================
   CANCEL REQUEST
========================================== */

function cancelRequest() {

    stopTracking();


    document.getElementById(
        "completedIcon"
    ).innerText = "✕";


    document.getElementById(
        "completedTitle"
    ).innerText =
        "Request Cancelled";


    document.getElementById(
        "completedMessage"
    ).innerText =
        "Your ambulance request has been cancelled. If you still need urgent help, call 112.";


    const icon =
        document.getElementById(
            "completedIcon"
        );


    icon.style.background =
        "#fee2e2";


    icon.style.color =
        "#dc2626";


    showScreen("completedScreen");

}


/* ==========================================
   COMPLETED SCREEN
========================================== */

function showCompletedScreen() {

    document.getElementById(
        "completedIcon"
    ).innerText = "✓";


    document.getElementById(
        "completedTitle"
    ).innerText =
        "Emergency Completed";


    document.getElementById(
        "completedMessage"
    ).innerText =
        "The ambulance has arrived. We hope you are safe.";


    const icon =
        document.getElementById(
            "completedIcon"
        );


    icon.style.background =
        "#dcfce7";


    icon.style.color =
        "#16a34a";


    showScreen("completedScreen");

}


/* ==========================================
   STOP TRACKING
========================================== */

function stopTracking() {

    if (trackingTimer !== null) {

        clearInterval(
            trackingTimer
        );

        trackingTimer = null;

    }

}


/* ==========================================
   RESET APPLICATION
========================================== */

function resetApplication() {

    stopTracking();


    selectedEmergency = "";


    answers = {

        conscious: "",

        breathing: "",

        bleeding: ""

    };


    priority = "Normal";


    /*
       Clear selected buttons.
    */

    document
        .querySelectorAll(
            ".emergency-types button"
        )
        .forEach(function(button) {

            button.classList.remove(
                "selected"
            );

        });


    document
        .querySelectorAll(
            ".yes-no button"
        )
        .forEach(function(button) {

            button.classList.remove(
                "selected"
            );

        });


    document.getElementById(
        "description"
    ).value = "";


    updatePriority();


    showScreen("homeScreen");

}


/* ==========================================
   SETTINGS
========================================== */

function showSettings() {

    alert(
        "RapidRescue Settings\n\n" +
        "Version: Hackathon MVP\n" +
        "Emergency Number: 112\n\n" +
        "The AI assistant is not a doctor."
    );

}


/* ==========================================
   EMERGENCY CALL
========================================== */

function callEmergency() {

    window.location.href =
        "tel:112";

}