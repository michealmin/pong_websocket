from .room import Room

class Lobby():
    def __init__(self):
        self._rooms = list()
        for i in range(0,10):
            self._rooms.append(Room(i))

    @property
    def rooms(self):
        return self._rooms

    def create_room(self):
        room_no = len(self._rooms)
        return Room(room_no)

    def get_joinable_room(self):
        rooms = [ r for r in self._rooms if r.is_joinable()]
        if rooms:
            return rooms[0]
        else:
            return self.create_room()


