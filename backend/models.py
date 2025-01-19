from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Emergency(db.Model):
    __tablename__ = 'emergencies'
    
    id = db.Column(db.Integer, primary_key=True)
    emergency_type = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    location = db.Column(db.String(255), nullable=False)
    contact_name = db.Column(db.String(100), nullable=False)
    contact_number = db.Column(db.String(20), nullable=False)
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    status = db.Column(db.String(20), default='NEW')
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'emergencyType': self.emergency_type,
            'description': self.description,
            'location': self.location,
            'contactName': self.contact_name,
            'contactNumber': self.contact_number,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'status': self.status,
            'timestamp': self.timestamp.isoformat()
        } 