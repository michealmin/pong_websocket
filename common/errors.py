class RoomException(Exception):
    def __init__(self, room, msg):
        err_msg = '{} room info : {}'.format(msg, room)
        super().__init__(err_msg)


class PlayerException(Exception):
    def __init__(self, player, msg):
        err_msg = '{} player info : {}'.format(msg, player)
        super().__init__(err_msg)