from flask import jsonify, request
from datetime import datetime
from models import db, Emergency

def register_routes(app):
    @app.route("/")
    def index():
        return "Emergency Dispatch API"

    @app.route('/api/incidents', methods=['GET'])
    def get_incidents():
        incidents = Emergency.query.order_by(Emergency.timestamp.desc()).all()
        return jsonify([{
            'id': incident.id,
            'sender': incident.sender,
            'message': incident.message,
            'timestamp': incident.timestamp.isoformat(),
            'location': incident.location,
            'is_active': incident.is_active,
            'contact': incident.contact
        } for incident in incidents])

    @app.route('/api/incidents/<int:incident_id>', methods=['GET'])
    def get_incident(incident_id):
        incident = Emergency.query.get_or_404(incident_id)
        return jsonify({
            'id': incident.id,
            'sender': incident.sender,
            'message': incident.message,
            'timestamp': incident.timestamp.isoformat(),
            'location': incident.location,
            'is_active': incident.is_active,
            'contact': incident.contact
        })

    @app.route('/api/incidents', methods=['POST'])
    def create_incident():
        data = request.get_json()
        
        new_incident = Emergency(
            sender=data['sender'],
            message=data['message'],
            location=data.get('location'),
            timestamp=datetime.utcnow(),
            is_active=True,
            contact=data.get('contact')
        )
        
        db.session.add(new_incident)
        db.session.commit()
        
        return jsonify({
            'id': new_incident.id,
            'sender': new_incident.sender,
            'message': new_incident.message,
            'timestamp': new_incident.timestamp.isoformat(),
            'location': new_incident.location,
            'is_active': new_incident.is_active,
            'contact': new_incident.contact
        }), 201

    @app.route('/api/incidents/<int:incident_id>', methods=['PUT'])
    def update_incident(incident_id):
        incident = Emergency.query.get_or_404(incident_id)
        data = request.get_json()
        
        incident.sender = data.get('sender', incident.sender)
        incident.message = data.get('message', incident.message)
        incident.location = data.get('location', incident.location)
        incident.contact = data.get('contact', incident.contact)
        
        db.session.commit()
        
        return jsonify({
            'id': incident.id,
            'sender': incident.sender,
            'message': incident.message,
            'timestamp': incident.timestamp.isoformat(),
            'location': incident.location,
            'is_active': incident.is_active,
            'contact': incident.contact
        })

    @app.route('/api/incidents/<int:incident_id>/toggle', methods=['PUT'])
    def toggle_incident_status(incident_id):
        incident = Emergency.query.get_or_404(incident_id)
        incident.is_active = not incident.is_active
        db.session.commit()
        
        return jsonify({
            'id': incident.id,
            'sender': incident.sender,
            'message': incident.message,
            'timestamp': incident.timestamp.isoformat(),
            'location': incident.location,
            'is_active': incident.is_active,
            'contact': incident.contact
        })

    @app.route('/api/incidents/<int:incident_id>', methods=['DELETE'])
    def delete_incident(incident_id):
        incident = Emergency.query.get_or_404(incident_id)
        db.session.delete(incident)
        db.session.commit()
        return '', 204 