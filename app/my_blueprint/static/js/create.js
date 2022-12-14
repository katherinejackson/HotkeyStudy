var trialStartTime;
// First get the condition 
var condition = getCond();

var study_options = Object.keys(study_mode_map)
// shift id back so ID starts at 0
var sel = (getParticipant() - 1) % study_options.length
var study_mode = study_options[sel]

window.options = {
    colour_scheme: study_mode_map[study_mode].colour_scheme,
    view: 'create'
};


trialStartTime = new Date();
var selectedItems = [];

window.itemClicked = (value) => {
    if (value.length > 0) {
        selectedItems = value
        window.localStorage.setItem('selected_items', value)
        logResponse();
    } else {
        window.alert("You must select at least one command")
    }
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
        selectedItems: selectedItems.join(", ")
    };


    $.post("#", trialResult).then(function () {
        // go to next phase on the study
        window.location.href = "/redirect_next_page";
    })
};