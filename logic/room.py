import json
import logging
from common.errors import RoomError
from common.message import *


LOG = logging.getLogger(__name__)

class Room:
    def __init__(self, room_no):
        self._players = {0: None, 1: None}
        self._room_no = room_no

    @property
    def room_no(self):
        return self._room_no

    def is_joinable(self):
        return None is not self._find_empty_player_slot()

    def _find_empty_player_slot(self):
        for k,v in self._players.items():
            if None is v:
                return k
        return None

    def add_player(self, player):
        empty_slot = self._find_empty_player_slot()
        if None is empty_slot:
            LOG.warning('Room is fool. room info : {}'.foirmat(str(self)))
            return False

        self._players[empty_slot] = player
        player.position = empty_slot

        def msg_handler(player, msg):
            self.msg_handler(player, msg)

        player.set_msg_handler(msg_handler)


        other_player = [{'position': p.position,'name': p.name}
                        for _, p in self._players.items()
                        if p is not None and p is not player]
        player.send_msg(
            build_response(
                SCMessageTypes.entered_room,
                'ok',{'position': player.position,
                      'name': player.name,
                      'other_player' :other_player}))
        self.broadcast(build_notify(ScMessgeNotifyTypes.enter_room_ntf, {
                    'name': player.name, 'position': player.position
                }), player)
        return True

    def msg_handler(self, player, msg):
        LOG.debug('Msg recved from {} : {}'.format(player, msg))

    def broadcast(self, msg, except_player=None):
        for pos, player in self._players.items():
            if player and player is not except_player:
                player.send_msg(msg)

    def remove_player(self, player):
        position = player.position
        if None is self._players[position]\
            or self._players[player.position] is not player:
            raise RoomError(
                self,
                'Removeplayer err. Cannot find player {}'.format(player))

        self._players[position] = None
        player.on_exited_room(self)

    def on_player_msg(self):
        pass

    def __str__(self):
        info = {
            'room_no': self._room_no,
            'players': { pos: str(player)
                         for pos, player in self._players.items() }
        }
        return json.dumps(info)