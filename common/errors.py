class RoomException(Exception):
    def __init__(self, room, msg):
        err_msg = '{} room info : {}'.format(msg, room)
        super().__init__(err_msg)


class PlayerException(Exception):
    def __init__(self, player, msg):
        err_msg = '{} player info : {}'.format(msg, player)
        super().__init__(err_msg)


class ProtocolError(Exception):
    def __init__(self, payload, msg):
        err_msg = '{} message: {}'.format(msg, payload)
        super().__init__(err_msg)


class UnexpectedProtocolError(ProtocolError):
    def __init__(self, payload, expected):
        err_msg = 'Unexpected payload type {}'.format(expected)
        super().__init__(payload, err_msg)