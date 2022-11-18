var trialStartTime;
// First get the condition 
var condition = getCond();

var study_options = Object.keys(study_mode_map)
// shift id back so ID starts at 0
var sel = (getParticipant() - 1) % study_options.length
var study_mode = study_options[sel]

// Populate the study chart conditions
window.options = {
    colour_scheme: study_mode_map[study_mode].colour_scheme,
    view: 'game',
};


trialStartTime = new Date()
var timesFinished = 0;
var replay_click_count = 0;
var highScore = 0;

$('#next-button').unbind('click').click((event) => {
    // prevent form from submitting
    logResponse();
});

window.replayedClick = () => {
    replay_click_count = replay_click_count + 1
}

window.finishGame = (value) => {
    timesFinished = timesFinished + 1;
    highScore = value;
}

function logResponse() {
    var endTime = new Date();
    // formulate json to store in DB.
    var trialResult = {
        trialStart: trialStartTime,
        trialEnd: endTime,
        trialTime: endTime - trialStartTime,
        view: window.options.view,
        Condition: condition,
        timesFinished: timesFinished,
        replayedClick: replay_click_count,
        highScore: highScore
    };

    $.post("#", trialResult).then(function () {
        // go to next phase on the study
        window.location.href = "/redirect_next_page";
    })
};


