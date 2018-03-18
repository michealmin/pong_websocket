from flask import Blueprint, make_response, jsonify
from logic import lobby_instance, Player
from common.message import CSMessageTypes, SCMessageTypes
from common import errors, message
import logging
import json

LOG = logging.getLogger(__name__)


room = Blueprint(r'/', __name__)


@room.route('/echo')
def echo_socket(socket):
    try:
        message = socket.receive()

        if not 'type' in message or\
            CSMessageTypes.enter_room_req != message['type']:
            raise errors.ProtocolError(message, 'Invalid enterroomreq')

        player = Player(message['name'], socket)
        token = message['token']

        if( lobby_instance.process_enter_room(player, token) ):
            while not socket.closed:
                message = socket.receive()
                LOG.info('Message received. player : {} msg: {}'.format(player, message))
                player.process_message(message)

    except Exception as e:
        err_msg = 'Error : {}'.format(e)
        LOG.error(err_msg)
        resp = make_response(message.build_response(
            SCMessageTypes.enter_room_resp, 'failed', err_msg, {}
        ))
        socket.close()
        return 'error'

        # while not socket.closed:
        #     message = socket.receive()
        #     socket.send(message)