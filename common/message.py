from common import errors
import abc
import copy
import json

# Cli -> Svr
class CSMessageTypes:
    enter_room = 'EnterRoom'


# Svr -> Cli
class SCMessageTypes:
    entered_room = 'EnteredRoom'

# Notify
class ScMessgeNotifyTypes:
    enter_room_ntf = 'EnteredRoomNtf'


def build_notify(msg_type, data):
    ret = copy.deepcopy(data)
    ret['type'] = msg_type
    return json.dumps(ret)

def build_response(msg_type, result, data, error=None):

    if result not in ['ok', 'failed']:
        raise ValueError('Invalid result {}'.format(result))

    if 'failed' == result and None is error:
        raise ValueError('Error description must be set')
    ret =  {
        'type': msg_type,
        'result': result
    }

    ret = copy.deepcopy(data)
    ret['type'] = msg_type
    ret['result'] = result
    if None is not error:
        ret['error'] = error
    return json.dumps(ret)
