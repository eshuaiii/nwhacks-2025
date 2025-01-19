from flask import jsonify, request
from datetime import datetime
from models import db, Emergency

def register_routes(app, socketio):
    # HTTP Routes
    @app.route("/")
    def index():
        return "Emergency Dispatch API"

    @app.route('/api/emergencies', methods=['GET'])
    def get_emergencies():
        try:
            status = request.args.get('status')
            if status:
                emergencies = Emergency.query.filter_by(status=status).order_by(Emergency.timestamp.desc()).all()
            else:
                emergencies = Emergency.query.order_by(Emergency.timestamp.desc()).all()
            return jsonify([emergency.to_dict() for emergency in emergencies]), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/api/emergency', methods=['POST'])
    def create_emergency():
        try:
            data = request.json
            
            emergency = Emergency(
                emergency_type=data['emergencyType'],
                description=data['description'],
                location=data['location'],
                contact_name=data['contactName'],
                contact_number=data['contactNumber'],
                latitude=data.get('latitude'),
                longitude=data.get('longitude'),
                status='NEW',
                timestamp=datetime.utcnow()
            )
            
            db.session.add(emergency)
            db.session.commit()
            
            # Emit socket event for real-time updates
            socketio.emit('new_emergency', emergency.to_dict())
            
            return jsonify(emergency.to_dict()), 201
            
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500

    @app.route('/api/emergency/<int:emergency_id>/status', methods=['PUT'])
    def update_emergency_status(emergency_id):
        try:
            emergency = Emergency.query.get_or_404(emergency_id)
            data = request.json
            
            if 'status' not in data:
                return jsonify({'error': 'Status is required'}), 400
                
            emergency.status = data['status']
            db.session.commit()
            
            # Emit socket event for real-time updates
            socketio.emit('emergency_updated', emergency.to_dict())
            
            return jsonify(emergency.to_dict()), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500

    # WebSocket Events
    @socketio.on('connect')
    def handle_connect():
        print("Client connected")

    @socketio.on('disconnect')
    def handle_disconnect():
        print("Client disconnected")

    @socketio.on('message_to_dispatcher')
    def handle_message_to_dispatcher(data):
        try:
            # Create emergency from socket message
            emergency = Emergency(
                emergency_type=data['emergencyType'],
                description=data['description'],
                location=data['location'],
                contact_name=data['contactName'],
                contact_number=data['contactNumber'],
                latitude=data.get('latitude'),
                longitude=data.get('longitude'),
                status='NEW',
                timestamp=datetime.utcnow()
            )
            
            db.session.add(emergency)
            db.session.commit()
            
            # Broadcast to all connected clients
            socketio.emit('new_emergency', emergency.to_dict())
            
        except Exception as e:
            db.session.rollback()
            print(f"Error handling socket message: {str(e)}")