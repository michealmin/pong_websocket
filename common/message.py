from common import errors
import abc
import copy

# Cli -> Svr
class CSMessageTypes:
    enter_room_req = 'EnterRoomReq'


# Svr -> Cli
class SCMessageTypes:
    enter_room_resp = 'EnterRoomResp'


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
    ret['error'] = error
    return ret
