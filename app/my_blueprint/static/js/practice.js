var trialStartTime;
// First get the condition 
var condition = getCond();
// Then get the block 
var block = getBlock();

var study_options = Object.keys(study_mode_map)
// shift id back so ID starts at 0
var sel = (getParticipant() - 1) % study_options.length
var study_mode = study_options[sel]

console.log("study mode (practice): ", study_mode)

// Then get the corresponding map based on the condition
//var condition_set_value = condition_map[1][2];
var condition_set_value = condition_map[condition][+block - 1];
// Populate the study chart conditions
window.options = {
    view: condition_set_value,
    shape: study_mode_map[study_mode].shape,
    encoding: study_mode_map[study_mode].encoding,
    size: study_mode_map[study_mode].size,
    practice: true,
};

// Create a question set based on the condition 
var question_map = studyQuestions['practice-' + condition_set_value];

// Set the Question Iterator to zero
var question_index = 0;
// Count wrong answer attempts
var wrong_count = 0;
// Items that were selected
var selectedItems = [];
// Count hover activity
var hover_count = 0;
// Items that were hovered on
var hovered_items = [];
// store zoom levels
var zoom_level = [];
// Button click status - If button is already clicked dont do anything wait for the logging response from server
var button_clicked = false;
// Record the question type from Carl's criteria
var perceptual_task = "";
var decision_task = "";
var comparison_basis = "";

// prevent changing zoom level with keys or the mouse wheel
$(document).keydown(function (event) {
    if ((event.ctrlKey == true || event.metaKey == true) && (event.which == '61' || event.which == '107' || event.which == '173' || event.which == '109' || event.which == '187' || event.which == '189')) {
        event.preventDefault();
    }
});

document.addEventListener('wheel', function (event) {
    if (event.ctrlKey == true || event.metaKey == true) {
        event.preventDefault();
    }
}, { passive: false })

window.addEventListener('resize', () => {
    const browserZoomLevel = window.devicePixelRatio;
    zoom_level.push(Math.round(browserZoomLevel * 100) / 100)
})

// Study intro is shown by default so wait for the user to click next 
$('#begin-button').click(() => {
    // Hide study intro and then based on the user condition either show the chord intro or the sankey intro 
    $('#study-intro').hide();
    // intializeChart();
    showShapeDescription();
});

// Study intro is shown by default so wait for the user to click next 
$('#start-practice').click(() => {
    // Hide study intro and then based on the user condition either show the chord intro or the sankey intro 
    $('#shape-description').hide();
    intializeChart();
});


function intializeChart() {
    // make the chart visible
    $('#chart-container').css({ 'visibility': 'visible' });
    $('#description').html(data_intro[condition_set_value] + '\n\nYou will now be asked 3 practice questions that you have to answer using the visualization. Please try to answer them as quickly and accurately as possible.');
    $('#prompt').html('Click the button below to start.')
    // Study intro is shown by default so wait for the user to click next 
    // When the next button is clicked after reading the chart intro 
    // hide the chart intro and then start showing the questions 
    $('#chart-container button.next').click(() => {
        //    hide the trigger button
        $('#chart-container button.next').hide();
        $('#prompt').hide();
        showQuestion();
    });
}

function showShapeDescription() {
    let temp = study_mode.split("_")
    var modified_study_mode = temp.slice(0, temp.length - 1).join("_")
    $('#shape-description').css({ 'visibility': 'visible' });
    $('#visualization-description').html(getVisualizationDescription(condition_set_value, study_mode))
    $('#example-description').html('The above image is an example of the type of visualizations you will be looking at. ' + getShapeDescription(condition_set_value, study_mode));
    $('#legend-description').html(getLegendDescription(condition_set_value, study_mode) + ' You will be able to refer back to these legends while completing the activity.');
    document.getElementById('example-image').src = `/my_blueprint/timemap/images/example-${condition_set_value}-${modified_study_mode}.png`
    document.getElementById('legend-image').src = `/my_blueprint/timemap/images/legend-${condition_set_value}-${modified_study_mode}.png`
}

// placeholder for when we add in the size aspect to the study and have to set img size
function getExampleGlyphSize(glyph) {
    let size = glyph.split("_")[2]
    let width;
    if (size === 'small') width = 20
    else if (size === 'medium') width = 40
    else width = 60

    return width
}

function getVisualizationDescription(view, originalGlyph) {
    let temp = originalGlyph.split("_")
    var glyph = temp.slice(0, temp.length - 1).join("_")
    const encodings = {
        'spiral_yaxis': 'spiral dot',
        'spiral_color': 'coloured spiral',
        'spiral_color_yaxis': 'spiral coloured dot',
        'row_yaxis': 'dot',
        'row_color': 'coloured row',
        'row_color_yaxis': 'coloured dot'

    }

    let visualization;
    if (view === 'MAP') visualization = 'map'
    else if (view === 'SCATTER') visualization = 'scatterplot'
    else if (view === 'MIGRATION_GRAPH') visualization = 'diagram'

    let desc = ''
    if (view === 'MAP') desc = 'temperatures over time for specific locations'
    else if (view === 'SCATTER') desc = 'COVID cases over time for specific countries'
    else if (view === 'MIGRATION_GRAPH') desc = 'migration data over time for specific countries'

    string = `In the next screens you will see a ${visualization}`
    if (view === 'MIGRATION_GRAPH') string += ` showing immigration between countries`

    string += `. On the ${visualization}, there are small ${encodings[glyph]} charts like the one below that show a series of ${desc}. `

    return string
}

function getShapeDescription(view, originalGlyph) {
    // const encodings = {
    //         'spiral_yaxis': 'distance from the dot to the center of the spiral',
    //         'spiral_color': 'color of the line',
    //         'spiral_color_yaxis': 'colour of the dot and the distance from the dot from the zero line',
    //         'row_yaxis': 'height of the dot',
    //         'row_color': 'colour of the line',
    //         'row_color_yaxis': 'colour and height of the dot'
    // }

    let temp = originalGlyph.split("_")
    var glyph = temp.slice(0, temp.length - 1).join("_")

    const encodings = {
        'spiral_yaxis': 'distance between the dot to the center of the spiral',
        'spiral_color': 'color scale',
        'spiral_color_yaxis': 'colour scale and the distance between the dot and the zero line',
        'row_yaxis': 'distance between the dot and the bottom of the chart',
        'row_color': 'color scale',
        'row_color_yaxis': 'colour scale and the distance between the dot and the bottom of the chart'
    }

    const rowEncodings = ['row_yaxis', 'row_color', 'row_color_yaxis']
    const spiralEncodings = ['spiral_yaxis', 'spiral_color', 'spiral_color_yaxis']
    const colourEncodings = ['spiral_color', 'row_color']
    const distanceEncodings = ['row_yaxis', 'spiral_yaxis']
    const distanceAndColorEncodings = ['spiral_color_yaxis', 'row_color_yaxis']

    //const data = view === 'MAP' ? 'average temperature of' : 'number of new cases of COVID documented'
    let data = ''
    if (view === 'MAP') data = 'average temperature'
    else if (view === 'SCATTER') data = 'number of new cases of COVID documented'
    else if (view === 'MIGRATION_GRAPH') data = 'number of people moving to the specified countries'

    let timePeriod = ''
    let time = ''
    let start = ''
    if (view === 'MIGRATION_GRAPH') {
        timePeriod = 'year ranging from 1980 to 2020'
        time = 'year'
        start = '1980'
    }
    else {
        timePeriod = 'day'
        time = 'day'
        start = 'January'
    }
    let shape;
    if (glyph.includes("yaxis")) shape = "dot"
    else shape = "line"
    //const shape = glyph === 'spiral_color' || glyph === 'row_color' ? 'line' : 'dot'

    let missingDataColour = ''
    if (glyph.includes("color_yaxis")) missingDataColour = "white"
    else if (glyph.includes("color")) missingDataColour = "grey"
    else if (glyph.includes("yaxis")) missingDataColour = "blue"

    let string = ''
    if (glyph.includes('row')) {
        string = `The chart shows a series of vertically positioned ${shape}s. `
    }
    else if (glyph.includes('spiral')) {
        string = `The chart shows a series of ${shape}s extending outward from the centre. `
    }

    string += `The ${encodings[glyph]} shows the ${data} for one ${timePeriod}. `

    if (glyph.includes('spiral')) string += `The progression of the ${time}s begins at the centre and then reads like a clock with ${start} beginning at the top and the ${time}s progressing clockwise. `


    if (glyph.includes('row')) {
        string += `Each chart has light grey guide lines to show the positions of the interval values. `
    }
    else if (glyph.includes('spiral')) {
        string += `Each chart has a light grey guide line to show the mid point position of the data. `
    }

    string += `Missing data is represented using a ${missingDataColour} ${shape}. `

    string += `Note that the charts will be smaller in size during the task than the example chart.`

    return string
}

function getLegendDescription(view, originalGlyph) {
    const glyph = originalGlyph.split("_").slice(0, 2).join("_")

    let point;
    if (glyph.includes("yaxis")) point = "dot"
    else point = "line"

    let data = ''
    if (view === 'MAP') data = 'temperature range'
    else if (view === 'SCATTER') data = 'range in number of new COVID cases'
    else if (view === 'MIGRATION_GRAPH') data = 'range in number of migrants'

    let timePeriod, time;
    if (view === 'MIGRATION_GRAPH') {
        timePeriod = 'years'
        time = 'yearly'
    }
    else {
        timePeriod = 'months'
        time = 'daily'
    }

    let shape = ''
    if (glyph.includes('spiral')) shape = 'spiral'
    else if (glyph.includes('row')) shape = 'row'

    let method = ''
    if (glyph.includes('color')) method = `color the ${time} ${point}s`
    else if (glyph.includes('yaxis')) method = `position the ${time} ${point}s`


    let string = `The legend shows the arrangement of ${timePeriod} on the ${shape}, and the ${data} that is used to ${method}. `

    if (view === 'SCATTER') string += `Note that this visualization uses a log scale to show a wider range of values.`

    return string
}

function showQuestion() {
    // Based on the chartType of the user condition get the question set 
    let question = question_map[question_index];

    // Show the questionBox 
    $('#question-box').show();
    $('#start-question').show();

    $('#description').css({ 'display': 'none' });
    $('#answer-box').css({ 'visibility': 'hidden' });
    $('#root').css({ 'visibility': 'hidden' });

    // Set the question in the label 
    $('#question-label').text('Practice Question: ' + question.label);
    // Get the choices for the question 

    $('#start-question').unbind('click').click((event) => {
        // prevent form from submitting
        event.preventDefault();
        startQuestion();
    });

    zoom_level = [];
}

function startQuestion() {
    // Based on the chartType of the user condition get the question set 
    let question = question_map[question_index];

    $('#answer-box').css({ 'visibility': 'visible' });
    $('#root').css({ 'visibility': 'visible' });
    $('#start-question').hide();
    $('#question-submit').show();

    // highlight the pins specified in the question
    let highlightOptions = question.highlightOptions || []
    window.triggerHighlight && window.triggerHighlight(highlightOptions);

    let answer_choices = question.choices;
    // Clear answer choice box 
    $('#choice-box').empty();

    if (question.type == 'click') {
        $('#choice-box').append(
            `<p>Please click on the answer item in the visualization.</p>`
        );
        $('#question-box .btn').hide();
    }
    else {
        // Add these choices to the form
        answer_choices.map((choice, choiceIndex) => {
            $('#choice-box').append(
                `<div class="form-check form-check-inline">
                <input class="form-check-input" type="radio" id="radio-${choiceIndex}" name="answer-radio" 
                    value="${choice}">
                <label class="form-check-label" for="radio-${choiceIndex}">${choice}</label>
            </div>`
            );
        });
    }


    // start loggin time , reset, wrong count and button clicked status
    trialStartTime = new Date();
    wrong_count = 0;
    hover_count = 0;
    hovered_items = [];
    selectedItems = [];
    button_clicked = false;
    perceptual_task = "";
    decision_task = "";
    comparison_basis = "";


    $('#question-box button.next').unbind('click').click((event) => {
        // prevent form from submitting
        event.preventDefault();
        // debouncing button
        if (!button_clicked) {
            // validate the answer by getting the question set
            let question = question_map[question_index];

            let correct_answer = question.answer,
                user_answer = $('input[name="answer-radio"]:checked').val();

            perceptual_task = question.perceptual_task;
            decision_task = question.decision_task;
            comparison_basis = question.comparison_basis;

            selectedItems.push(user_answer);

            if (correct_answer == user_answer) {
                button_clicked = true;
                logResponse(question.type);
            }
            else {
                wrong_count += 1;
                alert('Sorry, that was the wrong answer. Please try again.');
            }
        }
    });

    window.itemHovered = (value) => {
        console.log("Hovered ", value)
        hovered_items.push(value)
        hover_count = hover_count + 1;
    }

    if (question.type == 'click') {
        window.itemClicked = (value) => {
            // prevent form from submitting
            event.preventDefault();
            // debouncing button
            if (!button_clicked) {
                // validate the answer by getting the question set
                let question = question_map[question_index];

                if (value) {
                    console.log(value)
                    console.log(question)
                    button_clicked = true;
                    logResponse(question.type);
                }
                else {
                    wrong_count += 1;
                    alert('Sorry, that was the wrong answer. Please try again.');
                }
            }
        }
    }
    else {
        window.itemClicked = () => { };
    }
}


function logResponse(question_type = '') {

    var endTime = new Date();

    // formulate json to store in DB.
    var trialResult = {
        trialStart: trialStartTime,
        trialEnd: endTime,
        trialTime: endTime - trialStartTime,
        questionNumber: question_index + 1,
        view: window.options.view,
        shape: window.options.shape,
        encoding: window.options.encoding,
        size: window.options.size,
        Condition: condition,
        questionType: question_type,
        ErrorCount: wrong_count,
        selectItems: selectedItems.join(", "),
        hoverCount: hover_count,
        hoverItems: hovered_items.join(", "),
        zoomLevel: zoom_level.join(", "),
        perceptualTask: perceptual_task,
        decisionTask: decision_task,
        comparisonBasis: comparison_basis
    };

    $.post("#", trialResult).then(function () {
        // reset
        wrong_count = 0;
        button_clicked = false;
        // then go to next question
        if (question_index < question_map.length - 1) {
            // increment question index
            question_index += 1;
            showQuestion();
        }
        else {
            alert('The practice round is now complete. You will now start the introduction question.');
            // go to next phase on the study
            window.location.href = "/redirect_next_page";
        }
    })
};

