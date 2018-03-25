from common.message import *
from common.errors import ProtocolError
from logic.room.msg_handler import MsgHandlerBase
import logging

LOG = logging.getLogger(__name__)


class InGameState:
    def __init__(self, room):
        self._room = room

        self.clear()

    def clear(self):
        self._scores = dict()
        self._round = 0


class InGameLogic(MsgHandlerBase):
    def __init__(self, room):
        super().__init__()
        self._room = room
        self._logic = InGameState(room)
        self._logic.clear()
        self._is_in_game = False

        self._register_handler(
            CSMessageTypes.sync_block_pos, self._on_block_pos_sync)

        self._register_handler(
            CSMessageTypes.ball_block_collide, self._on_ball_block_collide)

    @property
    def is_in_game(self):
        return self._is_in_game

    @is_in_game.setter
    def is_in_game(self, val):
        LOG.debug('===========ingame set========' + str(val))
        self._is_in_game = val

    def clear(self):
        self.is_in_game = False
        self._logic.clear()

    def start_game(self):

        self.clear()
        self.is_in_game = True
        self._room.broadcast(
            build_notify(
                SCMessageTypes.start_game_ntf,
                {}
            )
        )

    def end_game(self):
        self.is_in_game = False

    # msg handlers

    def _on_block_pos_sync(self, player, msg):
        self._room.broadcast(build_notify(
            SCMessageTypes.block_pos_ntf,
            {
                'position': player.position,
                'x': msg['x']
            }
        ), player)

    def _on_ball_block_collide(self, player, msg):
        msg['position'] = player.position
        self._room.broadcast(build_notify(
            SCMessageTypes.ball_block_collide_ntf,
            {
                'position': player.position,
                'ball_pos': msg['ball_pos'],
                'block_x': msg['block_x']
            }
        ), player)