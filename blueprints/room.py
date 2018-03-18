from flask import Blueprint
from logic import lobby_instance

room = Blueprint(r'room', __name__)


@room.route('/echo')
def echo_socket(socket):
    while not socket.closed:
        message = socket.receive()
        socket.send(message)