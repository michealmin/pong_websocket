from common import errors
import abc
import copy
import json


class MsgReservedField:
    type_field = 'type'


# Cli -> Svr
class CSMessageTypes:
    enter_room = 'EnterRoom'
    start_game = 'StartGame'


# Svr -> Cli
class SCMessageTypes:
    entered_room = 'EnteredRoom'


# Notify
class ScMessgeNotifyTypes:
    enter_room_ntf = 'EnteredRoomNtf'
    start_game_ntf = 'StartGameNtf'


def build_notify(msg_type, data):
    ret = copy.deepcopy(data)
    ret[MsgReservedField.type_field] = msg_type
    return json.dumps(ret)


def build_response(msg_type, result, data, error=None):

    if result not in ['ok', 'failed']:
        raise ValueError('Invalid result {}'.format(result))

    if 'failed' == result and None is error:
        raise ValueError('Error description must be set')

    ret = copy.deepcopy(data)
    ret[MsgReservedField.type_field] = msg_type
    ret['result'] = result
    if None is not error:
        ret['error'] = error
    return json.dumps(ret)
