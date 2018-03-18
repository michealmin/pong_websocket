from flask import Blueprint, jsonify, request
from logic import lobby_instance
import jwt
import datetime
from common import jwt_token

lobby = Blueprint(r'lobby', __name__)


@lobby.route('/hello')
def hello():
    return 'hello'


@lobby.route('/rooms', methods=['GET'])
def rooms():
    rooms = [str(r) for r in lobby_instance.rooms]
    return jsonify(rooms)

@lobby.route('/room', methods=['POST'])
def enter_room():
    room = lobby_instance.get_joinable_room()
    cur_timestamp = datetime.datetime.now().timestamp()

    token = jwt_token.encode_jwt(
        {'exp': cur_timestamp + 1000, 'room_no': room.room_no},)

    dec = jwt_token.decode_jwt(token)
    print(dec)

    return jsonify(
        {
            'result': 'succeed',
            'room_no': room.room_no,
            'token': token
        }
    )

