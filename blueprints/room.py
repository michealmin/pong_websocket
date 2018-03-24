from flask import Blueprint, make_response, jsonify
from logic import lobby_instance, Player
from common.message import CSMessageTypes, SCMessageTypes
from common import errors, message
import logging
import json

LOG = logging.getLogger(__name__)


room = Blueprint(r'room', __name__)


@room.route('/')
def handle_room(socket):
    try:
        message = json.loads(socket.receive())
        LOG.debug('handle_room socket opened. message : {}'.format(message))
        if not 'type' in message or\
            CSMessageTypes.enter_room != message['type']:
            raise errors.ProtocolError(message, 'Invalid enterroomreq')
        room_no = message['room_no']
        player = Player(message['name'], socket)
        token = message['token']

        if( lobby_instance.process_enter_room(player, room_no, token) ):
            while not socket.closed:
                message = socket.receive()
                LOG.info('Message received. player : {} msg: {}'.format(player, message))
                player.process_message(message)

    except Exception as e:
        import traceback
        traceback.print_exc()
        err_msg = 'Handling room msg Error : {}'.format(e)
        LOG.error(err_msg)
        socket.close()
        return 'error'

