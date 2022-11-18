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
    view: 'flashcards',
};

trialStartTime = new Date()
var stack_finished_count = 0;

window.finishStack = () => {
    stack_finished_count = stack_finished_count + 1;
    console.log("num times:", stack_finished_count)
}

$('#next-button').unbind('click').click((event) => {
    // prevent form from submitting
    logResponse();
});

function logResponse() {
    console.log(stack_finished_count)
    var endTime = new Date();
    // formulate json to store in DB.
    var trialResult = {
        trialStart: trialStartTime,
        trialEnd: endTime,
        trialTime: endTime - trialStartTime,
        view: window.options.view,
        Condition: condition,
        finishStack: stack_finished_count,
    };

    $.post("#", trialResult).then(function () {
        // go to next phase on the study
        window.location.href = "/redirect_next_page";
    })
};


