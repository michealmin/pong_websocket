import json
from common.errors import PlayerException

class Player:
    def __init__(self, name, ws):
        self._name = name
        self._position = None
        self._room = None
        self._ws = ws

    @property
    def position(self):
        return self._position

    @position.setter
    def position(self, pos):
        self._position = pos

    def register_room(self, room):
        self._room = room

    def exit_room(self):
        if None is self._room:
            raise PlayerException(self, 'Not in room.')

        self._room.remove_player(self)

    def on_exited_room(self):
        self._ws.close()

    def send_msg(self, msg):
        self._ws.send(msg)

    def __str__(self):
        info = {
            'name': self._name,
            'position': self._position,
            'room': str(self._room)
        }

        return json.dumps(info)
