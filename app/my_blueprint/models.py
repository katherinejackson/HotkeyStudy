def create(db):
    class study(db.Model):
        __tablename__ = "study"
        ID = db.Column(db.Integer, primary_key=True, autoincrement=True)
        participantID = db.Column(db.Integer, db.ForeignKey('participant.participantID'))
        answeredOn = db.Column(db.DateTime, nullable=False, default=db.func.now())
        trialStart = db.Column(db.String)
        trialEnd = db.Column(db.String)
        trialTime = db.Column(db.String)
        view = db.Column(db.String)
        Condition = db.Column(db.String)
        selectedItems = db.Column(db.String)
        timesFinished = db.Column(db.String)
        replayedClick = db.Column(db.String)
        highScore = db.Column(db.String)
        finishStack = db.Column(db.String)
    
    return study

    
