import json
import logging
from common.errors import RoomException


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
        return True

    def remove_player(self, player):
        position = player.position
        if None is self._players[position]\
            or self._players[player.position] is not player:
            raise RoomException(
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