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
                timestamp=datetime.utcnow(),
                stream_id=data.get('stream_id')

            )
            
            db.session.add(emergency)
            db.session.commit()
            return jsonify(emergency.to_dict()), 201
            
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
        

    @app.route('/api/emergency/<int:emergency_id>', methods=['PUT'])
    def update_emergency(emergency_id):
        try:
            data = request.json
            print(f"Received update request for emergency {emergency_id}")
            print(f"Request data: {data}")
            
            emergency = Emergency.query.get(emergency_id)
            if not emergency:
                return jsonify({'error': 'Emergency not found'}), 404

            # Check if this is just a coordinate update
            if set(data.keys()) == {'latitude', 'longitude'}:
                # Only update coordinates
                if 'latitude' in data:
                    emergency.latitude = data['latitude']
                if 'longitude' in data:
                    emergency.longitude = data['longitude']
            else:
                # Full update logic
                if 'emergencyType' in data:
                    emergency.emergency_type = data['emergencyType']
                if 'description' in data:
                    emergency.description = data['description']
                if 'location' in data:
                    emergency.location = data['location']
                if 'contactName' in data:
                    emergency.contact_name = data['contactName']
                if 'contactNumber' in data:
                    emergency.contact_number = data['contactNumber']
                if 'status' in data:
                    emergency.status = data['status']
                if 'stream_id' in data:
                    emergency.stream_id = data['stream_id']

            try:
                db.session.commit()
                print(f"Successfully updated emergency {emergency_id}")
            except Exception as db_error:
                print(f"Database error: {str(db_error)}")
                db.session.rollback()
                raise

            result = emergency.to_dict()
            print(f"Returning: {result}")

            return jsonify(result), 200

        except Exception as e:
            print(f"Error in update_emergency: {str(e)}")
            db.session.rollback()
            return jsonify({'error': str(e)}), 500

    @app.route('/api/emergency/<int:emergency_id>', methods=['DELETE'])
    def delete_emergency(emergency_id):
        try:
            print(f"Received delete request for emergency {emergency_id}")
            
            # Retrieve the emergency record
            emergency = Emergency.query.get(emergency_id)
            if not emergency:
                return jsonify({'error': 'Emergency not found'}), 404
            
            # Delete the emergency
            db.session.delete(emergency)
            try:
                db.session.commit()
                print(f"Successfully deleted emergency {emergency_id}")
            except Exception as db_error:
                print(f"Database error: {str(db_error)}")
                db.session.rollback()
                raise

            return jsonify({'message': f'Emergency {emergency_id} deleted successfully'}), 200

        except Exception as e:
            print(f"Error in delete_emergency: {str(e)}")
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