from unittest import TestCase
from logic.lobby import Lobby
from logic.player import Player


class TestLobby(TestCase):
    def setup(self):
        pass

    def tearDown(self):
        pass

    def test_create_room(self):
        lobby = Lobby()
        expected_roomno = len(lobby.rooms)
        new_room = lobby.create_room()
        self.assertEqual(expected_roomno, new_room.room_no)

    def test_get_joinable_room(self):
        lobby = Lobby()
        room = lobby.get_joinable_room()
        self.assertEqual(0, room.room_no)

        p1 = Player('p1')
        room.add_player(p1)
        room = lobby.get_joinable_room()
        self.assertEqual(0, room.room_no)

        p2 = Player('p2')
        room.add_player(p2)
        room = lobby.get_joinable_room()
        self.assertNotEqual(0, room.room_no)


