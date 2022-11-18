import datetime
from flask import Blueprint, render_template
from BOFS.util import *
from BOFS.globals import db
from BOFS.admin.util import verify_admin

# The name of this variable must match the folder's name.
my_blueprint = Blueprint('my_blueprint', __name__,
                         static_url_path='/my_blueprint',
                         template_folder='templates',
                         static_folder='static')

@my_blueprint.route("/create", methods=['POST', 'GET'])
@verify_correct_page
@verify_session_valid
def create():
    if request.method == 'POST':
        log = db.study()
        log.participantID = session['participantID']
        log.trialStart = request.form['trialStart']
        log.trialEnd = request.form['trialEnd']
        log.trialTime = request.form['trialTime']
        log.view = request.form['view']
        log.Condition = request.form['Condition']
        log.selectedItems = request.form['selectedItems']

        db.session.add(log)
        db.session.commit()

    return render_template("create.html", example="This is example text.")

@my_blueprint.route("/flashcards", methods=['POST', 'GET'])
@verify_correct_page
@verify_session_valid
def flashcards():
    if request.method == 'POST':
        log = db.study()
        log.participantID = session['participantID']
        log.trialStart = request.form['trialStart']
        log.trialEnd = request.form['trialEnd']
        log.trialTime = request.form['trialTime']
        log.view = request.form['view']
        log.Condition = request.form['Condition']
        log.finishStack = request.form['finishStack']
        db.session.add(log)
        db.session.commit()

        return render_template("flashcards.html", example="This is example text.")

    if request.method == 'GET':
        results = db.session.query(db.metadata.tables['study'].columns['selectedItems']).filter(db.study.participantID == session['participantID']).all()

        return render_template("flashcards.html", results=results)
    

@my_blueprint.route("/game", methods=['POST', 'GET'])
@verify_correct_page
@verify_session_valid
def game():
    if request.method == 'POST':
        log = db.study()
        log.participantID = session['participantID']
        log.trialStart = request.form['trialStart']
        log.trialEnd = request.form['trialEnd']
        log.trialTime = request.form['trialTime']
        log.view = request.form['view']
        log.Condition = request.form['Condition']
        log.timesFinished = request.form['timesFinished']
        log.replayedClick = request.form['replayedClick']
        log.highScore = request.form['highScore']
        db.session.add(log)
        db.session.commit()
        
        return render_template("game.html", example="This is example text.")

    elif request.method == 'GET':
        results = db.session.query(db.metadata.tables['study'].columns['selectedItems']).filter(db.study.participantID == session['participantID']).all()

        return render_template("game.html", results=results)


# debrief
@my_blueprint.route("/debrief", methods=['POST', 'GET'])
@verify_correct_page
@verify_session_valid
def debrief():
    return render_template("debrief.html", example="This is example text.")


# route to view the database records and export them
@my_blueprint.route("/analysis")
@verify_admin
def analysis():
    results = db.session.query( db.Participant.participantID,
            db.func.count(db.MyTable.ID).label('tries')).\
        join(db.MyTable, db.MyTable.participantID == db.Participant.participantID).\
        filter(db.Participant.finished).\
        group_by(db.MyTable.participantID)

    return render_template("analysis.html", results=results)
